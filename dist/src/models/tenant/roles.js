"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rolesRelations = exports.roles = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const permissions_1 = require("./permissions");
const staff_1 = require("./staff");
exports.roles = (0, mysql_core_1.mysqlTable)("role", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.rolesRelations = (0, drizzle_orm_1.relations)(exports.roles, ({ many }) => ({
    permissions: many(permissions_1.permissions),
    staff: many(staff_1.staff),
}));
