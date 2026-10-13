"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKashier = getKashier;
exports.createOrUpdateKashier = createOrUpdateKashier;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
// 1. View Kashier Configuration (Returns single record)
async function getKashier(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const rows = await db.select().from(schema_1.kashier).limit(1);
    const host = req.get("host") || `${req.subdomain}.domain.com`;
    const fullCallbackUrl = `${req.protocol}://${host}/api/kashier_callback`;
    if (!rows[0]) {
        return (0, response_1.SuccessResponse)(res, {
            kashier: null,
            callback_url: `${req.subdomain}/api/kashier_callback`,
            full_callback_url: fullCallbackUrl,
        }, 200);
    }
    const item = rows[0];
    const callbackUrl = (item.callback_url || "{subdomain}/api/kashier_callback").replace("{subdomain}", req.subdomain);
    const formatted = {
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
        callback_url: callbackUrl,
        full_callback_url: fullCallbackUrl,
    };
    return (0, response_1.SuccessResponse)(res, { kashier: formatted }, 200);
}
// 2. Create or Update Kashier Configuration (Upsert)
async function createOrUpdateKashier(req, res) {
    const db = req.db;
    const { name, api_key, secret_key, status } = req.body;
    const merchantId = req.body.merchant_id || req.body.merchent_id;
    const logoInput = req.file || req.body.logo;
    const existing = await db.select().from(schema_1.kashier).limit(1);
    if (existing[0]) {
        // Update existing record
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (api_key !== undefined)
            updateData.api_key = api_key;
        if (secret_key !== undefined)
            updateData.secret_key = secret_key;
        if (merchantId !== undefined)
            updateData.merchant_id = String(merchantId);
        if (status !== undefined)
            updateData.status = Boolean(status);
        if (logoInput) {
            updateData.logo = await (0, imageService_1.updateImage)(req, logoInput, "uploads", existing[0].logo);
        }
        await db.update(schema_1.kashier).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.kashier.id, existing[0].id));
        const updated = await db.select().from(schema_1.kashier).where((0, drizzle_orm_1.eq)(schema_1.kashier.id, existing[0].id)).limit(1);
        const callbackUrl = (updated[0].callback_url || "{subdomain}/api/kashier_callback").replace("{subdomain}", req.subdomain);
        return (0, response_1.SuccessResponse)(res, {
            message: "Kashier settings updated successfully",
            kashier: {
                ...updated[0],
                callback_url: callbackUrl,
            },
        }, 200);
    }
    else {
        // Create new record
        if (!logoInput) {
            throw new BadRequest_1.BadRequest("Logo image is required");
        }
        const logoUrl = await (0, imageService_1.uploadImage)(req, logoInput, "uploads");
        const callbackUrl = `${req.subdomain}/api/kashier_callback`;
        await db.insert(schema_1.kashier).values({
            name,
            logo: logoUrl,
            api_key,
            secret_key,
            merchant_id: String(merchantId),
            status: status !== undefined ? Boolean(status) : true,
            callback_url: callbackUrl,
        });
        const created = await db.select().from(schema_1.kashier).limit(1);
        return (0, response_1.SuccessResponse)(res, {
            message: "Kashier settings created successfully",
            kashier: {
                ...created[0],
                callback_url: callbackUrl,
            },
        }, 201);
    }
}
