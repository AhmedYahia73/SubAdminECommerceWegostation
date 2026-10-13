"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesRelations = exports.categories = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.categories = (0, mysql_core_1.mysqlTable)("category", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    category_id: (0, mysql_core_1.char)("category_id", { length: 36 }),
    order_number: (0, mysql_core_1.int)("order_number").default(0).notNull(),
    banner: (0, mysql_core_1.varchar)("banner", { length: 500 }),
    icon: (0, mysql_core_1.varchar)("icon", { length: 500 }),
    cover_image: (0, mysql_core_1.varchar)("cover_image", { length: 500 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.categoriesRelations = (0, drizzle_orm_1.relations)(exports.categories, ({ one, many }) => ({
    parent: one(exports.categories, {
        fields: [exports.categories.category_id],
        references: [exports.categories.id],
        relationName: "sub_categories",
    }),
    subCategories: many(exports.categories, {
        relationName: "sub_categories",
    }),
}));
