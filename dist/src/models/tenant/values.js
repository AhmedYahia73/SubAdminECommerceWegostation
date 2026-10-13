"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valuesRelations = exports.values = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const attributes_1 = require("./attributes");
exports.values = (0, mysql_core_1.mysqlTable)("value", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    attribute_id: (0, mysql_core_1.char)("attribute_id", { length: 36 })
        .notNull()
        .references(() => attributes_1.attributes.id, { onDelete: "cascade" }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.valuesRelations = (0, drizzle_orm_1.relations)(exports.values, ({ one }) => ({
    attribute: one(attributes_1.attributes, {
        fields: [exports.values.attribute_id],
        references: [attributes_1.attributes.id],
    }),
}));
