"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValuesRelations = exports.productValues = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const products_1 = require("./products");
exports.productValues = (0, mysql_core_1.mysqlTable)("product_values", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    product_id: (0, mysql_core_1.char)("product_id", { length: 36 })
        .notNull()
        .references(() => products_1.products.id, { onDelete: "cascade" }),
    value_ids: (0, mysql_core_1.json)("value_ids").$type().notNull(),
    sku: (0, mysql_core_1.varchar)("sku", { length: 100 }),
    quantity: (0, mysql_core_1.int)("quantity").default(1).notNull(),
    image: (0, mysql_core_1.varchar)("image", { length: 500 }),
    price: (0, mysql_core_1.decimal)("price", { precision: 10, scale: 2 }).default("0.00").notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.productValuesRelations = (0, drizzle_orm_1.relations)(exports.productValues, ({ one }) => ({
    product: one(products_1.products, {
        fields: [exports.productValues.product_id],
        references: [products_1.products.id],
    }),
}));
