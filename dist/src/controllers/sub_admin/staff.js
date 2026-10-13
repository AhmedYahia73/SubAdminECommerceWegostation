"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllStaff = getAllStaff;
exports.getStaffLists = getStaffLists;
exports.getStaffSelection = getStaffSelection;
exports.getStaffById = getStaffById;
exports.createStaff = createStaff;
exports.updateStaff = updateStaff;
exports.deleteStaff = deleteStaff;
exports.bulkDeleteStaff = bulkDeleteStaff;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
async function getAllStaff(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.staff);
    const total = Number(countResult?.total || 0);
    const list = await db
        .select({
        id: schema_1.staff.id,
        name: schema_1.staff.name,
        email: schema_1.staff.email,
        phone: schema_1.staff.phone,
        role_id: schema_1.staff.role_id,
        role_name: schema_1.roles.name,
        createdAt: schema_1.staff.createdAt,
        updatedAt: schema_1.staff.updatedAt,
    })
        .from(schema_1.staff)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.staff.role_id, schema_1.roles.id))
        .limit(limit)
        .offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        staff: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getStaffLists(req, res) {
    const db = req.db;
    const rolesList = await db
        .select({
        id: schema_1.roles.id,
        name: schema_1.roles.name,
    })
        .from(schema_1.roles);
    return (0, response_1.SuccessResponse)(res, { roles: rolesList }, 200);
}
async function getStaffSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.staff.id,
        name: schema_1.staff.name,
    })
        .from(schema_1.staff);
    return (0, response_1.SuccessResponse)(res, { staff: list }, 200);
}
async function getStaffById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db
        .select({
        id: schema_1.staff.id,
        name: schema_1.staff.name,
        email: schema_1.staff.email,
        phone: schema_1.staff.phone,
        role_id: schema_1.staff.role_id,
        role_name: schema_1.roles.name,
        createdAt: schema_1.staff.createdAt,
        updatedAt: schema_1.staff.updatedAt,
    })
        .from(schema_1.staff)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.staff.role_id, schema_1.roles.id))
        .where((0, drizzle_orm_1.eq)(schema_1.staff.id, id))
        .limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Staff member not found");
    return (0, response_1.SuccessResponse)(res, { staff: row[0] }, 200);
}
async function createStaff(req, res) {
    const db = req.db;
    const { name, email, phone, password, role_id } = req.body;
    const roleExists = await db.select({ id: schema_1.roles.id }).from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, role_id)).limit(1);
    if (!roleExists[0])
        throw new Errors_1.NotFound("Role not found");
    const existingEmail = await db.select({ id: schema_1.staff.id }).from(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.email, email)).limit(1);
    if (existingEmail[0])
        throw new Errors_1.ConflictError("Email already exists");
    const existingPhone = await db.select({ id: schema_1.staff.id }).from(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.phone, phone)).limit(1);
    if (existingPhone[0])
        throw new Errors_1.ConflictError("Phone already exists");
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await db.insert(schema_1.staff).values({
        name,
        email,
        phone,
        password: hashedPassword,
        role_id,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Staff member created successfully" }, 201);
}
async function updateStaff(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, email, phone, password, role_id } = req.body;
    const existing = await db.select().from(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Staff member not found");
    if (role_id) {
        const roleExists = await db.select({ id: schema_1.roles.id }).from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, role_id)).limit(1);
        if (!roleExists[0])
            throw new Errors_1.NotFound("Role not found");
    }
    if (email && email !== existing[0].email) {
        const emailTaken = await db.select({ id: schema_1.staff.id }).from(schema_1.staff).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.staff.email, email), (0, drizzle_orm_1.ne)(schema_1.staff.id, id))).limit(1);
        if (emailTaken[0])
            throw new Errors_1.ConflictError("Email already exists");
    }
    if (phone && phone !== existing[0].phone) {
        const phoneTaken = await db.select({ id: schema_1.staff.id }).from(schema_1.staff).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.staff.phone, phone), (0, drizzle_orm_1.ne)(schema_1.staff.id, id))).limit(1);
        if (phoneTaken[0])
            throw new Errors_1.ConflictError("Phone already exists");
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (email !== undefined)
        updateData.email = email;
    if (phone !== undefined)
        updateData.phone = phone;
    if (role_id !== undefined)
        updateData.role_id = role_id;
    if (password !== undefined)
        updateData.password = await bcrypt_1.default.hash(password, 10);
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.staff).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.staff.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Staff member updated successfully" }, 200);
}
async function deleteStaff(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Staff member not found");
    await db.delete(schema_1.staff).where((0, drizzle_orm_1.eq)(schema_1.staff.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Staff member deleted successfully" }, 200);
}
async function bulkDeleteStaff(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.staff).where((0, drizzle_orm_1.inArray)(schema_1.staff.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching staff members found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.staff).where((0, drizzle_orm_1.inArray)(schema_1.staff.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} staff member(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
