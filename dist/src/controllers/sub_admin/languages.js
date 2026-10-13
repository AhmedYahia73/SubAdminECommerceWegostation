"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLanguages = getAllLanguages;
exports.getLanguagesSelection = getLanguagesSelection;
exports.getLanguageById = getLanguageById;
exports.createLanguage = createLanguage;
exports.updateLanguage = updateLanguage;
exports.deleteLanguage = deleteLanguage;
exports.bulkDeleteLanguages = bulkDeleteLanguages;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
async function getAllLanguages(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.languages);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.languages).limit(limit).offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        languages: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getLanguagesSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.languages.id,
        name: schema_1.languages.name,
    })
        .from(schema_1.languages)
        .where((0, drizzle_orm_1.eq)(schema_1.languages.status, true));
    return (0, response_1.SuccessResponse)(res, { languages: list }, 200);
}
async function getLanguageById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.languages).where((0, drizzle_orm_1.eq)(schema_1.languages.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Language not found");
    return (0, response_1.SuccessResponse)(res, { language: row[0] }, 200);
}
async function createLanguage(req, res) {
    const db = req.db;
    const { name, status } = req.body;
    await db.insert(schema_1.languages).values({
        name,
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Language created successfully" }, 201);
}
async function updateLanguage(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, status } = req.body;
    const existing = await db.select().from(schema_1.languages).where((0, drizzle_orm_1.eq)(schema_1.languages.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Language not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (status !== undefined)
        updateData.status = status;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.languages).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.languages.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Language updated successfully" }, 200);
}
async function deleteLanguage(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.languages).where((0, drizzle_orm_1.eq)(schema_1.languages.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Language not found");
    await db.delete(schema_1.languages).where((0, drizzle_orm_1.eq)(schema_1.languages.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Language deleted successfully" }, 200);
}
async function bulkDeleteLanguages(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.languages).where((0, drizzle_orm_1.inArray)(schema_1.languages.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching languages found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.languages).where((0, drizzle_orm_1.inArray)(schema_1.languages.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} language(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
