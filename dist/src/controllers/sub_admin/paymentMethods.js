"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPaymentMethods = getAllPaymentMethods;
exports.getPaymentMethodsSelection = getPaymentMethodsSelection;
exports.getPaymentMethodById = getPaymentMethodById;
exports.createPaymentMethod = createPaymentMethod;
exports.updatePaymentMethod = updatePaymentMethod;
exports.deletePaymentMethod = deletePaymentMethod;
exports.bulkDeletePaymentMethods = bulkDeletePaymentMethods;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
async function getAllPaymentMethods(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.paymentMethods);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.paymentMethods).limit(limit).offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        payment_methods: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getPaymentMethodsSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.paymentMethods.id,
        name: schema_1.paymentMethods.name,
    })
        .from(schema_1.paymentMethods)
        .where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: Array.isArray(item.name) ? item.name[0] : item.name,
    }));
    return (0, response_1.SuccessResponse)(res, { paymentMethods: formatted }, 200);
}
async function getPaymentMethodById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Payment method not found");
    return (0, response_1.SuccessResponse)(res, { paymentMethod: row[0] }, 200);
}
async function createPaymentMethod(req, res) {
    const db = req.db;
    const { name, description, icon, status } = req.body;
    const iconUrl = await (0, imageService_1.uploadImage)(req, icon, "uploads");
    await db.insert(schema_1.paymentMethods).values({
        name,
        description: description ?? null,
        icon: iconUrl,
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Payment method created successfully" }, 201);
}
async function updatePaymentMethod(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, description, icon, status } = req.body;
    const existing = await db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Payment method not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (status !== undefined)
        updateData.status = status;
    if (icon !== undefined && icon !== existing[0].icon) {
        updateData.icon = await (0, imageService_1.updateImage)(req, icon, "uploads", existing[0].icon);
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.paymentMethods).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Payment method updated successfully" }, 200);
}
async function deletePaymentMethod(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Payment method not found");
    await (0, imageService_1.deleteImage)(existing[0].icon);
    await db.delete(schema_1.paymentMethods).where((0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Payment method deleted successfully" }, 200);
}
async function bulkDeletePaymentMethods(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.paymentMethods).where((0, drizzle_orm_1.inArray)(schema_1.paymentMethods.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching payment methods found", deletedCount: 0 }, 200);
    }
    for (const item of existing) {
        if (item.icon) {
            await (0, imageService_1.deleteImage)(item.icon);
        }
    }
    await db.delete(schema_1.paymentMethods).where((0, drizzle_orm_1.inArray)(schema_1.paymentMethods.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} payment method(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
