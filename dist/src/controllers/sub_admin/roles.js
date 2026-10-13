"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRoles = getAllRoles;
exports.getRolesSelection = getRolesSelection;
exports.getRoleById = getRoleById;
exports.createRole = createRole;
exports.updateRole = updateRole;
exports.deleteRole = deleteRole;
exports.bulkDeleteRoles = bulkDeleteRoles;
exports.createPermission = createPermission;
exports.updatePermission = updatePermission;
exports.deletePermission = deletePermission;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
function parseActions(actions) {
    if (Array.isArray(actions))
        return actions;
    if (typeof actions === "string") {
        try {
            const parsed = JSON.parse(actions);
            if (Array.isArray(parsed))
                return parsed;
        }
        catch {
            return [actions];
        }
    }
    return [];
}
// 1. Get All Roles with their Permissions (Paginated)
async function getAllRoles(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.roles);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.roles).limit(limit).offset(offset);
    const roleIds = list.map((r) => r.id);
    const allPerms = roleIds.length > 0
        ? await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.inArray)(schema_1.permissions.role_id, roleIds))
        : [];
    const permsByRole = new Map();
    for (const perm of allPerms) {
        if (!permsByRole.has(perm.role_id)) {
            permsByRole.set(perm.role_id, []);
        }
        permsByRole.get(perm.role_id).push(perm);
    }
    const formatted = list.map((role) => {
        const rolePerms = permsByRole.get(role.id) || [];
        return {
            id: role.id,
            name: role.name,
            createdAt: role.createdAt,
            updatedAt: role.updatedAt,
            permissions: rolePerms.map((p) => ({
                id: p.id,
                permission: p.permission,
                actions: parseActions(p.actions),
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
        };
    });
    return (0, response_1.SuccessResponse)(res, {
        roles: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// 2. Get Roles Selection for Dropdowns (id, name)
async function getRolesSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.roles.id,
        name: schema_1.roles.name,
    })
        .from(schema_1.roles);
    return (0, response_1.SuccessResponse)(res, { roles: list }, 200);
}
// 3. Get Role By ID with its Permissions
async function getRoleById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Role not found");
    const rolePerms = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.role_id, id));
    const formatted = {
        id: row[0].id,
        name: row[0].name,
        createdAt: row[0].createdAt,
        updatedAt: row[0].updatedAt,
        permissions: rolePerms.map((p) => ({
            id: p.id,
            permission: p.permission,
            actions: parseActions(p.actions),
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        })),
    };
    return (0, response_1.SuccessResponse)(res, { role: formatted }, 200);
}
// 4. Create Role with Multi Permissions & Actions Array
async function createRole(req, res) {
    const db = req.db;
    const { name, permissions: permissionsList } = req.body;
    const roleId = (0, crypto_1.randomUUID)();
    // Insert Role
    await db.insert(schema_1.roles).values({
        id: roleId,
        name,
    });
    // Insert Permissions if provided
    if (Array.isArray(permissionsList) && permissionsList.length > 0) {
        for (const item of permissionsList) {
            if (item.permission && Array.isArray(item.actions)) {
                await db.insert(schema_1.permissions).values({
                    id: item.id || (0, crypto_1.randomUUID)(),
                    role_id: roleId,
                    permission: item.permission,
                    actions: item.actions,
                });
            }
        }
    }
    // Fetch created role with its permissions
    const createdRole = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, roleId)).limit(1);
    const createdPerms = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.role_id, roleId));
    return (0, response_1.SuccessResponse)(res, {
        message: "Role and permissions created successfully",
        role: {
            id: createdRole[0].id,
            name: createdRole[0].name,
            createdAt: createdRole[0].createdAt,
            updatedAt: createdRole[0].updatedAt,
            permissions: createdPerms.map((p) => ({
                id: p.id,
                permission: p.permission,
                actions: parseActions(p.actions),
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
        },
    }, 201);
}
// 5. Update Role and Sync its Permissions
async function updateRole(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, permissions: permissionsList } = req.body;
    const existing = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Role not found");
    if (name !== undefined) {
        await db.update(schema_1.roles).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
    }
    // Sync permissions if provided
    if (Array.isArray(permissionsList)) {
        const existingPerms = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.role_id, id));
        const existingById = new Map(existingPerms.map((p) => [p.id, p]));
        const existingByName = new Map(existingPerms.map((p) => [p.permission, p]));
        const keepIds = new Set();
        for (const item of permissionsList) {
            if (!item.permission)
                continue;
            if (item.id && existingById.has(item.id)) {
                // Update existing permission by ID
                await db
                    .update(schema_1.permissions)
                    .set({
                    permission: item.permission,
                    actions: item.actions,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.permissions.id, item.id));
                keepIds.add(item.id);
            }
            else if (!item.id && existingByName.has(item.permission)) {
                // Update existing permission matched by name
                const match = existingByName.get(item.permission);
                await db
                    .update(schema_1.permissions)
                    .set({
                    actions: item.actions,
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.permissions.id, match.id));
                keepIds.add(match.id);
            }
            else {
                // Insert new permission
                const newPermId = item.id || (0, crypto_1.randomUUID)();
                await db.insert(schema_1.permissions).values({
                    id: newPermId,
                    role_id: id,
                    permission: item.permission,
                    actions: item.actions,
                });
                keepIds.add(newPermId);
            }
        }
        // Delete permissions that are no longer in the list
        const toDeleteIds = existingPerms.filter((p) => !keepIds.has(p.id)).map((p) => p.id);
        if (toDeleteIds.length > 0) {
            await db.delete(schema_1.permissions).where((0, drizzle_orm_1.inArray)(schema_1.permissions.id, toDeleteIds));
        }
    }
    // Fetch updated role with permissions
    const updatedRole = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).limit(1);
    const updatedPerms = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.role_id, id));
    return (0, response_1.SuccessResponse)(res, {
        message: "Role updated successfully",
        role: {
            id: updatedRole[0].id,
            name: updatedRole[0].name,
            createdAt: updatedRole[0].createdAt,
            updatedAt: updatedRole[0].updatedAt,
            permissions: updatedPerms.map((p) => ({
                id: p.id,
                permission: p.permission,
                actions: parseActions(p.actions),
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
            })),
        },
    }, 200);
}
// 6. Delete Role (and cascade delete its permissions)
async function deleteRole(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Role not found");
    // Explicitly delete permissions first to ensure clean removal
    await db.delete(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.role_id, id));
    await db.delete(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Role deleted successfully" }, 200);
}
// 7. Bulk Delete Roles (and cascade delete their permissions)
async function bulkDeleteRoles(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.inArray)(schema_1.roles.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching roles found", deletedCount: 0 }, 200);
    }
    const roleIds = existing.map((r) => r.id);
    await db.delete(schema_1.permissions).where((0, drizzle_orm_1.inArray)(schema_1.permissions.role_id, roleIds));
    await db.delete(schema_1.roles).where((0, drizzle_orm_1.inArray)(schema_1.roles.id, roleIds));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} role(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
// 8. Individual Permission Endpoints
async function createPermission(req, res) {
    const db = req.db;
    const { id } = req.params; // role_id
    const { permission, actions } = req.body;
    const existingRole = await db.select().from(schema_1.roles).where((0, drizzle_orm_1.eq)(schema_1.roles.id, id)).limit(1);
    if (!existingRole[0])
        throw new Errors_1.NotFound("Role not found");
    const permId = (0, crypto_1.randomUUID)();
    await db.insert(schema_1.permissions).values({
        id: permId,
        role_id: id,
        permission,
        actions,
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Permission added to role successfully",
        permission: {
            id: permId,
            role_id: id,
            permission,
            actions,
        },
    }, 201);
}
async function updatePermission(req, res) {
    const db = req.db;
    const { permissionId } = req.params;
    const { permission, actions } = req.body;
    const existing = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, permissionId)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Permission not found");
    const updateData = {};
    if (permission !== undefined)
        updateData.permission = permission;
    if (actions !== undefined)
        updateData.actions = actions;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.permissions).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, permissionId));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Permission updated successfully" }, 200);
}
async function deletePermission(req, res) {
    const db = req.db;
    const { permissionId } = req.params;
    const existing = await db.select().from(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, permissionId)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Permission not found");
    await db.delete(schema_1.permissions).where((0, drizzle_orm_1.eq)(schema_1.permissions.id, permissionId));
    return (0, response_1.SuccessResponse)(res, { message: "Permission deleted successfully" }, 200);
}
