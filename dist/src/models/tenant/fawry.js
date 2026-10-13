"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fawry = exports.fawryBaseUrlEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.fawryBaseUrlEnum = (0, mysql_core_1.mysqlEnum)("fawry_base_url", ["Staging", "Live"]);
exports.fawry = (0, mysql_core_1.mysqlTable)("fawry", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    logo: (0, mysql_core_1.varchar)("logo", { length: 500 }).notNull(),
    merchant_code: (0, mysql_core_1.text)("merchant_code"),
    merchant_secret_key: (0, mysql_core_1.text)("merchant_secret_key").notNull(),
    fawry_base_url: (0, mysql_core_1.mysqlEnum)("fawry_base_url", ["Staging", "Live"])
        .notNull()
        .default("Staging"),
    status: (0, mysql_core_1.boolean)("status").notNull().default(true),
    callback_url: (0, mysql_core_1.varchar)("callback_url", { length: 500 }).default("{subdomain}/api/fawry_callback"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
