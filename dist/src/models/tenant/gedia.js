"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gedia = exports.gediaEnvironmentEnum = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.gediaEnvironmentEnum = (0, mysql_core_1.mysqlEnum)("environment", [
    "egypt",
    "saudi_arabia",
    "uae",
]);
exports.gedia = (0, mysql_core_1.mysqlTable)("gedia", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    logo: (0, mysql_core_1.varchar)("logo", { length: 500 }).notNull(),
    public_key: (0, mysql_core_1.text)("public_key").notNull(),
    api_password: (0, mysql_core_1.text)("api_password").notNull(),
    environment: (0, mysql_core_1.mysqlEnum)("environment", [
        "egypt",
        "saudi_arabia",
        "uae",
    ]).notNull().default("egypt"),
    status: (0, mysql_core_1.boolean)("status").notNull().default(true),
    callback_url: (0, mysql_core_1.varchar)("callback_url", { length: 500 }).default("{subdomain}/api/gedia_callback"),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
