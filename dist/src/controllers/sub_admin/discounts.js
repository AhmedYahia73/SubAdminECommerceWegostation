"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDiscounts = getAllDiscounts;
exports.getDiscountsSelection = getDiscountsSelection;
exports.getDiscountById = getDiscountById;
exports.createDiscount = createDiscount;
exports.updateDiscount = updateDiscount;
exports.deleteDiscount = deleteDiscount;
exports.bulkDeleteDiscounts = bulkDeleteDiscounts;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const pagination_1 = require("../../utils/pagination");
async function getAllDiscounts(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.discounts);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.discounts).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
    }));
    return (0, response_1.SuccessResponse)(res, {
        discounts: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getDiscountsSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.discounts.id,
        name: schema_1.discounts.name,
    })
        .from(schema_1.discounts)
        .where((0, drizzle_orm_1.eq)(schema_1.discounts.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { discounts: formatted }, 200);
}
async function getDiscountById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.discounts).where((0, drizzle_orm_1.eq)(schema_1.discounts.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Discount not found");
    const discount = {
        ...row[0],
        localized_name: (0, localization_1.getLocalizedText)(row[0].name, lang),
    };
    return (0, response_1.SuccessResponse)(res, { discount }, 200);
}
async function createDiscount(req, res) {
    const db = req.db;
    const { name, type, amount, status } = req.body;
    await db.insert(schema_1.discounts).values({
        name,
        type,
        amount: String(amount),
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Discount created successfully" }, 201);
}
async function updateDiscount(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, type, amount, status } = req.body;
    const existing = await db.select().from(schema_1.discounts).where((0, drizzle_orm_1.eq)(schema_1.discounts.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Discount not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (type !== undefined)
        updateData.type = type;
    if (amount !== undefined)
        updateData.amount = String(amount);
    if (status !== undefined)
        updateData.status = status;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.discounts).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.discounts.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Discount updated successfully" }, 200);
}
async function deleteDiscount(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.discounts).where((0, drizzle_orm_1.eq)(schema_1.discounts.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Discount not found");
    await db.delete(schema_1.discounts).where((0, drizzle_orm_1.eq)(schema_1.discounts.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Discount deleted successfully" }, 200);
}
async function bulkDeleteDiscounts(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.discounts).where((0, drizzle_orm_1.inArray)(schema_1.discounts.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching discounts found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.discounts).where((0, drizzle_orm_1.inArray)(schema_1.discounts.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} discount(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
