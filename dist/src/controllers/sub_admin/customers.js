"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCustomers = getAllCustomers;
exports.getCustomersSelection = getCustomersSelection;
exports.getCustomerById = getCustomerById;
exports.createCustomer = createCustomer;
exports.updateCustomer = updateCustomer;
exports.deleteCustomer = deleteCustomer;
exports.bulkDeleteCustomers = bulkDeleteCustomers;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
async function getAllCustomers(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.customers);
    const total = Number(countResult?.total || 0);
    const list = await db
        .select({
        id: schema_1.customers.id,
        name: schema_1.customers.name,
        phone: schema_1.customers.phone,
        email: schema_1.customers.email,
        order_num: schema_1.customers.order_num,
        order_sum: schema_1.customers.order_sum,
        image: schema_1.customers.image,
        createdAt: schema_1.customers.createdAt,
        updatedAt: schema_1.customers.updatedAt,
    })
        .from(schema_1.customers)
        .limit(limit)
        .offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        customers: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getCustomersSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.customers.id,
        name: schema_1.customers.name,
    })
        .from(schema_1.customers);
    return (0, response_1.SuccessResponse)(res, { customers: list }, 200);
}
async function getCustomerById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db
        .select({
        id: schema_1.customers.id,
        name: schema_1.customers.name,
        phone: schema_1.customers.phone,
        email: schema_1.customers.email,
        order_num: schema_1.customers.order_num,
        order_sum: schema_1.customers.order_sum,
        image: schema_1.customers.image,
        createdAt: schema_1.customers.createdAt,
        updatedAt: schema_1.customers.updatedAt,
    })
        .from(schema_1.customers)
        .where((0, drizzle_orm_1.eq)(schema_1.customers.id, id))
        .limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Customer not found");
    return (0, response_1.SuccessResponse)(res, { customer: row[0] }, 200);
}
async function createCustomer(req, res) {
    const db = req.db;
    const { name, phone, email, order_num, order_sum, image, password } = req.body;
    const existingEmail = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.email, email)).limit(1);
    if (existingEmail[0])
        throw new Errors_1.ConflictError("Email already exists");
    const existingPhone = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.phone, phone)).limit(1);
    if (existingPhone[0])
        throw new Errors_1.ConflictError("Phone already exists");
    let imageUrl = null;
    if (image) {
        imageUrl = await (0, imageService_1.uploadImage)(req, image, "uploads");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await db.insert(schema_1.customers).values({
        name,
        phone,
        email,
        order_num: order_num ?? 0,
        order_sum: order_sum ?? 0,
        image: imageUrl,
        password: hashedPassword,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Customer created successfully" }, 201);
}
async function updateCustomer(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, phone, email, order_num, order_sum, image, password } = req.body;
    const existing = await db.select().from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Customer not found");
    if (email && email !== existing[0].email) {
        const emailTaken = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.email, email), (0, drizzle_orm_1.ne)(schema_1.customers.id, id))).limit(1);
        if (emailTaken[0])
            throw new Errors_1.ConflictError("Email already exists");
    }
    if (phone && phone !== existing[0].phone) {
        const phoneTaken = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.customers.phone, phone), (0, drizzle_orm_1.ne)(schema_1.customers.id, id))).limit(1);
        if (phoneTaken[0])
            throw new Errors_1.ConflictError("Phone already exists");
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (phone !== undefined)
        updateData.phone = phone;
    if (email !== undefined)
        updateData.email = email;
    if (order_num !== undefined)
        updateData.order_num = order_num;
    if (order_sum !== undefined)
        updateData.order_sum = order_sum;
    if (password !== undefined)
        updateData.password = await bcrypt_1.default.hash(password, 10);
    if (image !== undefined && image !== existing[0].image) {
        if (image) {
            updateData.image = await (0, imageService_1.updateImage)(req, image, "uploads", existing[0].image);
        }
        else {
            await (0, imageService_1.deleteImage)(existing[0].image);
            updateData.image = null;
        }
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.customers).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Customer updated successfully" }, 200);
}
async function deleteCustomer(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Customer not found");
    if (existing[0].image) {
        await (0, imageService_1.deleteImage)(existing[0].image);
    }
    await db.delete(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Customer deleted successfully" }, 200);
}
async function bulkDeleteCustomers(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.customers).where((0, drizzle_orm_1.inArray)(schema_1.customers.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching customers found", deletedCount: 0 }, 200);
    }
    for (const item of existing) {
        if (item.image) {
            await (0, imageService_1.deleteImage)(item.image);
        }
    }
    await db.delete(schema_1.customers).where((0, drizzle_orm_1.inArray)(schema_1.customers.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} customer(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
