"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.warranties = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.warranties = (0, mysql_core_1.mysqlTable)("warranty", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    text: (0, mysql_core_1.json)("text").$type().notNull(),
    logo: (0, mysql_core_1.varchar)("logo", { length: 500 }),
    period: (0, mysql_core_1.varchar)("period", { length: 100 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
