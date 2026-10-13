"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionsRelations = exports.permissions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const roles_1 = require("./roles");
exports.permissions = (0, mysql_core_1.mysqlTable)("perimission", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    role_id: (0, mysql_core_1.char)("role_id", { length: 36 })
        .notNull()
        .references(() => roles_1.roles.id, { onDelete: "cascade" }),
    permission: (0, mysql_core_1.varchar)("permission", { length: 255 }).notNull(),
    actions: (0, mysql_core_1.json)("actions").$type().notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.permissionsRelations = (0, drizzle_orm_1.relations)(exports.permissions, ({ one }) => ({
    role: one(roles_1.roles, {
        fields: [exports.permissions.role_id],
        references: [roles_1.roles.id],
    }),
}));
