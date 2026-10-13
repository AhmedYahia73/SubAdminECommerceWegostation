"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFawry = getFawry;
exports.createOrUpdateFawry = createOrUpdateFawry;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
// 1. View Fawry Configuration (Returns single record)
async function getFawry(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const rows = await db.select().from(schema_1.fawry).limit(1);
    const host = req.get("host") || `${req.subdomain}.domain.com`;
    const fullCallbackUrl = `${req.protocol}://${host}/api/fawry_callback`;
    if (!rows[0]) {
        return (0, response_1.SuccessResponse)(res, {
            fawry: null,
            callback_url: `${req.subdomain}/api/fawry_callback`,
            full_callback_url: fullCallbackUrl,
        }, 200);
    }
    const item = rows[0];
    const callbackUrl = (item.callback_url || "{subdomain}/api/fawry_callback").replace("{subdomain}", req.subdomain);
    const formatted = {
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
        callback_url: callbackUrl,
        full_callback_url: fullCallbackUrl,
    };
    return (0, response_1.SuccessResponse)(res, { fawry: formatted }, 200);
}
// 2. Create or Update Fawry Configuration (Upsert)
async function createOrUpdateFawry(req, res) {
    const db = req.db;
    const { name, merchant_code, merchant_secret_key, status } = req.body;
    const fawryBaseUrl = req.body.fawry_base_url || req.body.fawryBaseUrl;
    const logoInput = req.file || req.body.logo;
    const existing = await db.select().from(schema_1.fawry).limit(1);
    if (existing[0]) {
        // Update existing record
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (merchant_code !== undefined)
            updateData.merchant_code = merchant_code;
        if (merchant_secret_key !== undefined)
            updateData.merchant_secret_key = merchant_secret_key;
        if (fawryBaseUrl !== undefined) {
            updateData.fawry_base_url = fawryBaseUrl.toLowerCase() === "live" ? "Live" : "Staging";
        }
        if (status !== undefined)
            updateData.status = Boolean(status);
        if (logoInput) {
            updateData.logo = await (0, imageService_1.updateImage)(req, logoInput, "uploads", existing[0].logo);
        }
        await db.update(schema_1.fawry).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.fawry.id, existing[0].id));
        const updated = await db.select().from(schema_1.fawry).where((0, drizzle_orm_1.eq)(schema_1.fawry.id, existing[0].id)).limit(1);
        const callbackUrl = (updated[0].callback_url || "{subdomain}/api/fawry_callback").replace("{subdomain}", req.subdomain);
        return (0, response_1.SuccessResponse)(res, {
            message: "Fawry settings updated successfully",
            fawry: {
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
        const callbackUrl = `${req.subdomain}/api/fawry_callback`;
        const resolvedBaseUrl = fawryBaseUrl && fawryBaseUrl.toLowerCase() === "live" ? "Live" : "Staging";
        await db.insert(schema_1.fawry).values({
            name,
            logo: logoUrl,
            merchant_code: merchant_code || null,
            merchant_secret_key,
            fawry_base_url: resolvedBaseUrl,
            status: status !== undefined ? Boolean(status) : true,
            callback_url: callbackUrl,
        });
        const created = await db.select().from(schema_1.fawry).limit(1);
        return (0, response_1.SuccessResponse)(res, {
            message: "Fawry settings created successfully",
            fawry: {
                ...created[0],
                callback_url: callbackUrl,
            },
        }, 201);
    }
}
