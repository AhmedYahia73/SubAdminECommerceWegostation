"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zonesRelations = exports.zones = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const cities_1 = require("./cities");
const addresses_1 = require("./addresses");
exports.zones = (0, mysql_core_1.mysqlTable)("zone", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    city_id: (0, mysql_core_1.char)("city_id", { length: 36 })
        .notNull()
        .references(() => cities_1.cities.id, { onDelete: "cascade" }),
    status: (0, mysql_core_1.boolean)("status").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.zonesRelations = (0, drizzle_orm_1.relations)(exports.zones, ({ one, many }) => ({
    city: one(cities_1.cities, {
        fields: [exports.zones.city_id],
        references: [cities_1.cities.id],
    }),
    addresses: many(addresses_1.addresses),
}));
