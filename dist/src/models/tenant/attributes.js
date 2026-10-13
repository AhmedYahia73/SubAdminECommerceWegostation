"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.attributesRelations = exports.attributes = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const values_1 = require("./values");
const productAttributes_1 = require("./productAttributes");
exports.attributes = (0, mysql_core_1.mysqlTable)("attribute", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.attributesRelations = (0, drizzle_orm_1.relations)(exports.attributes, ({ many }) => ({
    values: many(values_1.values),
    productAttributes: many(productAttributes_1.productAttributes),
}));
