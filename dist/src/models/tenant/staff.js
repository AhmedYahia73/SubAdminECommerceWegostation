"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffRelations = exports.staff = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const roles_1 = require("./roles");
exports.staff = (0, mysql_core_1.mysqlTable)("staff", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 50 }).notNull().unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }).notNull(),
    role_id: (0, mysql_core_1.char)("role_id", { length: 36 })
        .notNull()
        .references(() => roles_1.roles.id, { onDelete: "restrict" }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.staffRelations = (0, drizzle_orm_1.relations)(exports.staff, ({ one }) => ({
    role: one(roles_1.roles, {
        fields: [exports.staff.role_id],
        references: [roles_1.roles.id],
    }),
}));
