"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kashier = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.kashier = (0, mysql_core_1.mysqlTable)("kashier", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    logo: (0, mysql_core_1.varchar)("logo", { length: 500 }).notNull(),
    api_key: (0, mysql_core_1.text)("api_key").notNull(),
    secret_key: (0, mysql_core_1.text)("secret_key").notNull(),
    merchant_id: (0, mysql_core_1.text)("merchant_id").notNull(),
    status: (0, mysql_core_1.boolean)("status").notNull().default(true),
    callback_url: (0, mysql_core_1.varchar)("callback_url", { length: 500 }).default("{subdomain}/api/kashier_callback"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
