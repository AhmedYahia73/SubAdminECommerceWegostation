"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGedia = getGedia;
exports.createOrUpdateGedia = createOrUpdateGedia;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const BadRequest_1 = require("../../Errors/BadRequest");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
// 1. View Gedia Configuration (Returns single record)
async function getGedia(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const rows = await db.select().from(schema_1.gedia).limit(1);
    const host = req.get("host") || `${req.subdomain}.domain.com`;
    const fullCallbackUrl = `${req.protocol}://${host}/api/gedia_callback`;
    if (!rows[0]) {
        return (0, response_1.SuccessResponse)(res, {
            gedia: null,
            callback_url: `${req.subdomain}/api/gedia_callback`,
            full_callback_url: fullCallbackUrl,
        }, 200);
    }
    const item = rows[0];
    const callbackUrl = (item.callback_url || "{subdomain}/api/gedia_callback").replace("{subdomain}", req.subdomain);
    const formatted = {
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
        callback_url: callbackUrl,
        full_callback_url: fullCallbackUrl,
    };
    return (0, response_1.SuccessResponse)(res, { gedia: formatted }, 200);
}
// 2. Create or Update Gedia Configuration (Upsert)
async function createOrUpdateGedia(req, res) {
    const db = req.db;
    const { name, public_key, api_password, environment, status } = req.body;
    const logoInput = req.file || req.body.logo;
    const existing = await db.select().from(schema_1.gedia).limit(1);
    if (existing[0]) {
        // Update existing record
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (public_key !== undefined)
            updateData.public_key = public_key;
        if (api_password !== undefined)
            updateData.api_password = api_password;
        if (environment !== undefined)
            updateData.environment = environment;
        if (status !== undefined)
            updateData.status = Boolean(status);
        if (logoInput) {
            updateData.logo = await (0, imageService_1.updateImage)(req, logoInput, "uploads", existing[0].logo);
        }
        await db.update(schema_1.gedia).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.gedia.id, existing[0].id));
        const updated = await db.select().from(schema_1.gedia).where((0, drizzle_orm_1.eq)(schema_1.gedia.id, existing[0].id)).limit(1);
        const callbackUrl = (updated[0].callback_url || "{subdomain}/api/gedia_callback").replace("{subdomain}", req.subdomain);
        return (0, response_1.SuccessResponse)(res, {
            message: "Gedia settings updated successfully",
            gedia: {
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
        const callbackUrl = `${req.subdomain}/api/gedia_callback`;
        await db.insert(schema_1.gedia).values({
            name,
            logo: logoUrl,
            public_key,
            api_password,
            environment: environment || "egypt",
            status: status !== undefined ? Boolean(status) : true,
            callback_url: callbackUrl,
        });
        const created = await db.select().from(schema_1.gedia).limit(1);
        return (0, response_1.SuccessResponse)(res, {
            message: "Gedia settings created successfully",
            gedia: {
                ...created[0],
                callback_url: callbackUrl,
            },
        }, 201);
    }
}
