"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllWarranties = getAllWarranties;
exports.getWarrantiesSelection = getWarrantiesSelection;
exports.getWarrantyById = getWarrantyById;
exports.createWarranty = createWarranty;
exports.updateWarranty = updateWarranty;
exports.deleteWarranty = deleteWarranty;
exports.bulkDeleteWarranties = bulkDeleteWarranties;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
async function getAllWarranties(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.warranties);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.warranties).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        text: (0, localization_1.getLocalizedText)(item.text, lang),
        texts: item.text,
    }));
    return (0, response_1.SuccessResponse)(res, {
        warranties: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getWarrantiesSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.warranties.id,
        text: schema_1.warranties.text,
    })
        .from(schema_1.warranties);
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.text, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { warranties: formatted }, 200);
}
async function getWarrantyById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.warranties).where((0, drizzle_orm_1.eq)(schema_1.warranties.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Warranty not found");
    const warranty = {
        ...row[0],
        localized_text: (0, localization_1.getLocalizedText)(row[0].text, lang),
    };
    return (0, response_1.SuccessResponse)(res, { warranty }, 200);
}
async function createWarranty(req, res) {
    const db = req.db;
    const { text, logo, period } = req.body;
    let logoUrl = null;
    if (logo) {
        logoUrl = await (0, imageService_1.uploadImage)(req, logo, "uploads");
    }
    await db.insert(schema_1.warranties).values({
        text,
        logo: logoUrl,
        period: period ?? null,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Warranty created successfully" }, 201);
}
async function updateWarranty(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { text, logo, period } = req.body;
    const existing = await db.select().from(schema_1.warranties).where((0, drizzle_orm_1.eq)(schema_1.warranties.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Warranty not found");
    const updateData = {};
    if (text !== undefined)
        updateData.text = text;
    if (period !== undefined)
        updateData.period = period;
    if (logo !== undefined && logo !== existing[0].logo) {
        if (logo) {
            updateData.logo = await (0, imageService_1.updateImage)(req, logo, "uploads", existing[0].logo);
        }
        else {
            await (0, imageService_1.deleteImage)(existing[0].logo);
            updateData.logo = null;
        }
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.warranties).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.warranties.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Warranty updated successfully" }, 200);
}
async function deleteWarranty(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.warranties).where((0, drizzle_orm_1.eq)(schema_1.warranties.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Warranty not found");
    if (existing[0].logo) {
        await (0, imageService_1.deleteImage)(existing[0].logo);
    }
    await db.delete(schema_1.warranties).where((0, drizzle_orm_1.eq)(schema_1.warranties.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Warranty deleted successfully" }, 200);
}
async function bulkDeleteWarranties(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.warranties).where((0, drizzle_orm_1.inArray)(schema_1.warranties.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching warranties found", deletedCount: 0 }, 200);
    }
    for (const item of existing) {
        if (item.logo) {
            await (0, imageService_1.deleteImage)(item.logo);
        }
    }
    await db.delete(schema_1.warranties).where((0, drizzle_orm_1.inArray)(schema_1.warranties.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} warranty(ies) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
