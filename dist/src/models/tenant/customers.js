"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersRelations = exports.customers = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const addresses_1 = require("./addresses");
exports.customers = (0, mysql_core_1.mysqlTable)("customer", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 50 }).notNull().unique(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).notNull().unique(),
    order_num: (0, mysql_core_1.int)("order_num").default(0).notNull(),
    order_sum: (0, mysql_core_1.int)("order_sum").default(0).notNull(),
    image: (0, mysql_core_1.varchar)("image", { length: 500 }),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.customersRelations = (0, drizzle_orm_1.relations)(exports.customers, ({ many }) => ({
    addresses: many(addresses_1.addresses),
}));
