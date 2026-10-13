"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashDiscounts = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.flashDiscounts = (0, mysql_core_1.mysqlTable)("flash_discount", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    type: (0, mysql_core_1.mysqlEnum)("type", ["percentage", "value"]).notNull(),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    status: (0, mysql_core_1.boolean)("status").default(true).notNull(),
    start_date: (0, mysql_core_1.timestamp)("start_date").notNull(),
    end_date: (0, mysql_core_1.timestamp)("end_date").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
