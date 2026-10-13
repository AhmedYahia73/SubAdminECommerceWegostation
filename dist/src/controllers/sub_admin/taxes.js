"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTaxes = getAllTaxes;
exports.getTaxesSelection = getTaxesSelection;
exports.getTaxById = getTaxById;
exports.createTax = createTax;
exports.updateTax = updateTax;
exports.deleteTax = deleteTax;
exports.bulkDeleteTaxes = bulkDeleteTaxes;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const pagination_1 = require("../../utils/pagination");
async function getAllTaxes(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.taxes);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.taxes).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
    }));
    return (0, response_1.SuccessResponse)(res, {
        taxes: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getTaxesSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.taxes.id,
        name: schema_1.taxes.name,
    })
        .from(schema_1.taxes)
        .where((0, drizzle_orm_1.eq)(schema_1.taxes.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { taxes: formatted }, 200);
}
async function getTaxById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.taxes).where((0, drizzle_orm_1.eq)(schema_1.taxes.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Tax not found");
    const tax = {
        ...row[0],
        localized_name: (0, localization_1.getLocalizedText)(row[0].name, lang),
    };
    return (0, response_1.SuccessResponse)(res, { tax }, 200);
}
async function createTax(req, res) {
    const db = req.db;
    const { name, amount, type, status } = req.body;
    await db.insert(schema_1.taxes).values({
        name,
        amount: String(amount),
        type,
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Tax created successfully" }, 201);
}
async function updateTax(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, amount, type, status } = req.body;
    const existing = await db.select().from(schema_1.taxes).where((0, drizzle_orm_1.eq)(schema_1.taxes.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Tax not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (amount !== undefined)
        updateData.amount = String(amount);
    if (type !== undefined)
        updateData.type = type;
    if (status !== undefined)
        updateData.status = status;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.taxes).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.taxes.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Tax updated successfully" }, 200);
}
async function deleteTax(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.taxes).where((0, drizzle_orm_1.eq)(schema_1.taxes.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Tax not found");
    await db.delete(schema_1.taxes).where((0, drizzle_orm_1.eq)(schema_1.taxes.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Tax deleted successfully" }, 200);
}
async function bulkDeleteTaxes(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.taxes).where((0, drizzle_orm_1.inArray)(schema_1.taxes.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching taxes found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.taxes).where((0, drizzle_orm_1.inArray)(schema_1.taxes.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} tax(es) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
