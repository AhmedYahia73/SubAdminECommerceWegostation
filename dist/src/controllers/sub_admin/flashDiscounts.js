"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFlashDiscounts = getAllFlashDiscounts;
exports.getFlashDiscountsSelection = getFlashDiscountsSelection;
exports.getFlashDiscountById = getFlashDiscountById;
exports.createFlashDiscount = createFlashDiscount;
exports.updateFlashDiscount = updateFlashDiscount;
exports.deleteFlashDiscount = deleteFlashDiscount;
exports.bulkDeleteFlashDiscounts = bulkDeleteFlashDiscounts;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const pagination_1 = require("../../utils/pagination");
async function getAllFlashDiscounts(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.flashDiscounts);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.flashDiscounts).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
    }));
    return (0, response_1.SuccessResponse)(res, {
        flash_discounts: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getFlashDiscountsSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.flashDiscounts.id,
        name: schema_1.flashDiscounts.name,
    })
        .from(schema_1.flashDiscounts)
        .where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { flashDiscounts: formatted }, 200);
}
async function getFlashDiscountById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.flashDiscounts).where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Flash discount not found");
    const flashDiscount = {
        ...row[0],
        localized_name: (0, localization_1.getLocalizedText)(row[0].name, lang),
    };
    return (0, response_1.SuccessResponse)(res, { flashDiscount }, 200);
}
async function createFlashDiscount(req, res) {
    const db = req.db;
    const { name, type, amount, status, start_date, end_date } = req.body;
    await db.insert(schema_1.flashDiscounts).values({
        name,
        type,
        amount: String(amount),
        status: status !== undefined ? status : true,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
    });
    return (0, response_1.SuccessResponse)(res, { message: "Flash discount created successfully" }, 201);
}
async function updateFlashDiscount(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, type, amount, status, start_date, end_date } = req.body;
    const existing = await db.select().from(schema_1.flashDiscounts).where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Flash discount not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (type !== undefined)
        updateData.type = type;
    if (amount !== undefined)
        updateData.amount = String(amount);
    if (status !== undefined)
        updateData.status = status;
    if (start_date !== undefined)
        updateData.start_date = new Date(start_date);
    if (end_date !== undefined)
        updateData.end_date = new Date(end_date);
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.flashDiscounts).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Flash discount updated successfully" }, 200);
}
async function deleteFlashDiscount(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.flashDiscounts).where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Flash discount not found");
    await db.delete(schema_1.flashDiscounts).where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Flash discount deleted successfully" }, 200);
}
async function bulkDeleteFlashDiscounts(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.flashDiscounts).where((0, drizzle_orm_1.inArray)(schema_1.flashDiscounts.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching flash discounts found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.flashDiscounts).where((0, drizzle_orm_1.inArray)(schema_1.flashDiscounts.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} flash discount(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
