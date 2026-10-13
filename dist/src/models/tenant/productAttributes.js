"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productAttributesRelations = exports.productAttributes = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const products_1 = require("./products");
const attributes_1 = require("./attributes");
exports.productAttributes = (0, mysql_core_1.mysqlTable)("product_attribute", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    product_id: (0, mysql_core_1.char)("product_id", { length: 36 })
        .notNull()
        .references(() => products_1.products.id, { onDelete: "cascade" }),
    attribute_id: (0, mysql_core_1.char)("attribute_id", { length: 36 })
        .notNull()
        .references(() => attributes_1.attributes.id, { onDelete: "cascade" }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.productAttributesRelations = (0, drizzle_orm_1.relations)(exports.productAttributes, ({ one }) => ({
    product: one(products_1.products, {
        fields: [exports.productAttributes.product_id],
        references: [products_1.products.id],
    }),
    attribute: one(attributes_1.attributes, {
        fields: [exports.productAttributes.attribute_id],
        references: [attributes_1.attributes.id],
    }),
}));
