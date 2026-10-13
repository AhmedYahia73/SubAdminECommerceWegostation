"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productsRelations = exports.products = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const categories_1 = require("./categories");
const brands_1 = require("./brands");
const discounts_1 = require("./discounts");
const flashDiscounts_1 = require("./flashDiscounts");
const taxes_1 = require("./taxes");
const warranties_1 = require("./warranties");
const productAttributes_1 = require("./productAttributes");
const productValues_1 = require("./productValues");
exports.products = (0, mysql_core_1.mysqlTable)("products", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    description: (0, mysql_core_1.json)("description").$type(),
    category_id: (0, mysql_core_1.char)("category_id", { length: 36 })
        .notNull()
        .references(() => categories_1.categories.id, { onDelete: "restrict" }),
    sub_category_id: (0, mysql_core_1.char)("sub_category_id", { length: 36 })
        .references(() => categories_1.categories.id, { onDelete: "set null" }),
    brand_id: (0, mysql_core_1.char)("brand_id", { length: 36 })
        .references(() => brands_1.brands.id, { onDelete: "set null" }),
    discount_id: (0, mysql_core_1.char)("discount_id", { length: 36 })
        .references(() => discounts_1.discounts.id, { onDelete: "set null" }),
    flash_discount_id: (0, mysql_core_1.char)("flash_discount_id", { length: 36 })
        .references(() => flashDiscounts_1.flashDiscounts.id, { onDelete: "set null" }),
    tax_id: (0, mysql_core_1.char)("tax_id", { length: 36 })
        .references(() => taxes_1.taxes.id, { onDelete: "set null" }),
    image: (0, mysql_core_1.varchar)("image", { length: 500 }).notNull(),
    warrantly_id: (0, mysql_core_1.char)("warrantly_id", { length: 36 })
        .references(() => warranties_1.warranties.id, { onDelete: "set null" }),
    warrantly_note: (0, mysql_core_1.text)("warrantly_note"),
    today_deal: (0, mysql_core_1.boolean)("today_deal").default(false).notNull(),
    free_shipping: (0, mysql_core_1.boolean)("free_shipping").default(false).notNull(),
    shipping_days: (0, mysql_core_1.int)("shipping_days").default(0).notNull(),
    gallery: (0, mysql_core_1.json)("gallery").$type(),
    published: (0, mysql_core_1.boolean)("published").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.productsRelations = (0, drizzle_orm_1.relations)(exports.products, ({ one, many }) => ({
    category: one(categories_1.categories, {
        fields: [exports.products.category_id],
        references: [categories_1.categories.id],
    }),
    subCategory: one(categories_1.categories, {
        fields: [exports.products.sub_category_id],
        references: [categories_1.categories.id],
    }),
    brand: one(brands_1.brands, {
        fields: [exports.products.brand_id],
        references: [brands_1.brands.id],
    }),
    discount: one(discounts_1.discounts, {
        fields: [exports.products.discount_id],
        references: [discounts_1.discounts.id],
    }),
    flashDiscount: one(flashDiscounts_1.flashDiscounts, {
        fields: [exports.products.flash_discount_id],
        references: [flashDiscounts_1.flashDiscounts.id],
    }),
    tax: one(taxes_1.taxes, {
        fields: [exports.products.tax_id],
        references: [taxes_1.taxes.id],
    }),
    warranty: one(warranties_1.warranties, {
        fields: [exports.products.warrantly_id],
        references: [warranties_1.warranties.id],
    }),
    attributes: many(productAttributes_1.productAttributes),
    variants: many(productValues_1.productValues),
}));
