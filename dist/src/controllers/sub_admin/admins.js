"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAdmins = getAllAdmins;
exports.getAdminsLists = getAdminsLists;
exports.getAdminsSelection = getAdminsSelection;
exports.getAdminById = getAdminById;
exports.createAdmin = createAdmin;
exports.updateAdmin = updateAdmin;
exports.deleteAdmin = deleteAdmin;
exports.bulkDeleteAdmins = bulkDeleteAdmins;
exports.loginTenantAdmin = loginTenantAdmin;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const pagination_1 = require("../../utils/pagination");
// 1. Get All Admins (Paginated, includes role_name, excludes password)
async function getAllAdmins(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.admins);
    const total = Number(countResult?.total || 0);
    const list = await db
        .select({
        id: schema_1.admins.id,
        name: schema_1.admins.name,
        email: schema_1.admins.email,
        phone: schema_1.admins.phone,
        role_id: schema_1.admins.role_id,
        role_name: schema_1.roles.name,
        status: schema_1.admins.status,
        createdAt: schema_1.admins.createdAt,
        updatedAt: schema_1.admins.updatedAt,
    })
        .from(schema_1.admins)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.admins.role_id, schema_1.roles.id))
        .limit(limit)
        .offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        admins: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// 2. Get Admins Relational Lists (all related tables needed for creation/edit form)
async function getAdminsLists(req, res) {
    const db = req.db;
    const rolesList = await db
        .select({
        id: schema_1.roles.id,
        name: schema_1.roles.name,
    })
        .from(schema_1.roles);
    return (0, response_1.SuccessResponse)(res, { roles: rolesList }, 200);
}
// 3. Get Admins Selection for Dropdowns (id, name)
async function getAdminsSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.admins.id,
        name: schema_1.admins.name,
    })
        .from(schema_1.admins)
        .where((0, drizzle_orm_1.eq)(schema_1.admins.status, true));
    return (0, response_1.SuccessResponse)(res, { admins: list }, 200);
}
// 4. Get Admin By ID
async function getAdminById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db
        .select({
        id: schema_1.admins.id,
        name: schema_1.admins.name,
        email: schema_1.admins.email,
        phone: schema_1.admins.phone,
        role_id: schema_1.admins.role_id,
        role_name: schema_1.roles.name,
        status: schema_1.admins.status,
        createdAt: schema_1.admins.createdAt,
        updatedAt: schema_1.admins.updatedAt,
    })
        .from(schema_1.admins)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.admins.role_id, schema_1.roles.id))
        .where((0, drizzle_orm_1.eq)(schema_1.admins.id, id))
        .limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Admin not found");
    return (0, response_1.SuccessResponse)(res, { admin: row[0] }, 200);
}
// 5. Create Admin
async function createAdmin(req, res) {
    const db = req.db;
    const { name, email, phone, password, role_id, status } = req.body;
    // Check email uniqueness
    const existingEmail = await db
        .select({ id: schema_1.admins.id })
        .from(schema_1.admins)
        .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
        .limit(1);
    if (existingEmail[0]) {
        throw new Errors_1.ConflictError("Admin with this email already exists");
    }
    // Check phone uniqueness
    const existingPhone = await db
        .select({ id: schema_1.admins.id })
        .from(schema_1.admins)
        .where((0, drizzle_orm_1.eq)(schema_1.admins.phone, phone))
        .limit(1);
    if (existingPhone[0]) {
        throw new Errors_1.ConflictError("Admin with this phone number already exists");
    }
    // Verify role existence
    const existingRole = await db
        .select({ id: schema_1.roles.id })
        .from(schema_1.roles)
        .where((0, drizzle_orm_1.eq)(schema_1.roles.id, role_id))
        .limit(1);
    if (!existingRole[0]) {
        throw new Errors_1.NotFound("Assigned role not found");
    }
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    await db.insert(schema_1.admins).values({
        name,
        email,
        phone,
        password: hashedPassword,
        role_id,
        status: status ?? true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Admin created successfully" }, 201);
}
// 6. Update Admin
async function updateAdmin(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, email, phone, password, role_id, status } = req.body;
    const existing = await db.select().from(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Admin not found");
    if (email && email !== existing[0].email) {
        const emailTaken = await db
            .select({ id: schema_1.admins.id })
            .from(schema_1.admins)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.admins.email, email), (0, drizzle_orm_1.ne)(schema_1.admins.id, id)))
            .limit(1);
        if (emailTaken[0]) {
            throw new Errors_1.ConflictError("Email already in use by another admin");
        }
    }
    if (phone && phone !== existing[0].phone) {
        const phoneTaken = await db
            .select({ id: schema_1.admins.id })
            .from(schema_1.admins)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.admins.phone, phone), (0, drizzle_orm_1.ne)(schema_1.admins.id, id)))
            .limit(1);
        if (phoneTaken[0]) {
            throw new Errors_1.ConflictError("Phone number already in use by another admin");
        }
    }
    if (role_id && role_id !== existing[0].role_id) {
        const roleExists = await db
            .select({ id: schema_1.roles.id })
            .from(schema_1.roles)
            .where((0, drizzle_orm_1.eq)(schema_1.roles.id, role_id))
            .limit(1);
        if (!roleExists[0]) {
            throw new Errors_1.NotFound("Assigned role not found");
        }
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
    if (status !== undefined)
        updateData.status = status;
    if (password !== undefined) {
        updateData.password = await bcrypt_1.default.hash(password, 10);
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.admins).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.admins.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Admin updated successfully" }, 200);
}
// 7. Delete Admin
async function deleteAdmin(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Admin not found");
    await db.delete(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Admin deleted successfully" }, 200);
}
// 8. Bulk Delete Admins
async function bulkDeleteAdmins(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.admins).where((0, drizzle_orm_1.inArray)(schema_1.admins.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching admins found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.admins).where((0, drizzle_orm_1.inArray)(schema_1.admins.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} admin(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
// 9. Admin Login (verifies email, password, and status = true strictly against admin table)
async function loginTenantAdmin(req, res) {
    const db = req.db;
    const { email, password } = req.body;
    const adminRows = await db
        .select({
        id: schema_1.admins.id,
        name: schema_1.admins.name,
        email: schema_1.admins.email,
        phone: schema_1.admins.phone,
        password: schema_1.admins.password,
        role_id: schema_1.admins.role_id,
        role_name: schema_1.roles.name,
        status: schema_1.admins.status,
    })
        .from(schema_1.admins)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.admins.role_id, schema_1.roles.id))
        .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
        .limit(1);
    if (!adminRows[0]) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    if (!adminRows[0].status) {
        throw new Errors_1.UnauthorizedError("Your admin account is inactive. Please contact the administrator.");
    }
    const match = await bcrypt_1.default.compare(password, adminRows[0].password);
    if (!match) {
        throw new Errors_1.UnauthorizedError("Invalid email or password");
    }
    const token = (0, auth_1.generateAdminToken)({
        id: adminRows[0].id,
        name: adminRows[0].name,
        email: adminRows[0].email,
        phone: adminRows[0].phone,
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Admin login successful",
        token,
        admin: {
            id: adminRows[0].id,
            name: adminRows[0].name,
            email: adminRows[0].email,
            phone: adminRows[0].phone,
            role_id: adminRows[0].role_id,
            role_name: adminRows[0].role_name,
        },
    }, 200);
}
