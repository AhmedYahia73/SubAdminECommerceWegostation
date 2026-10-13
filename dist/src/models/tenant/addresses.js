"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressesRelations = exports.addresses = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const customers_1 = require("./customers");
const cities_1 = require("./cities");
const zones_1 = require("./zones");
exports.addresses = (0, mysql_core_1.mysqlTable)("address", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    customer_id: (0, mysql_core_1.char)("customer_id", { length: 36 })
        .notNull()
        .references(() => customers_1.customers.id, { onDelete: "cascade" }),
    city_id: (0, mysql_core_1.char)("city_id", { length: 36 })
        .notNull()
        .references(() => cities_1.cities.id, { onDelete: "restrict" }),
    zone_id: (0, mysql_core_1.char)("zone_id", { length: 36 })
        .notNull()
        .references(() => zones_1.zones.id, { onDelete: "restrict" }),
    building_num: (0, mysql_core_1.varchar)("building_num", { length: 50 }),
    floor: (0, mysql_core_1.varchar)("floor", { length: 50 }),
    address: (0, mysql_core_1.text)("address").notNull(),
    street: (0, mysql_core_1.varchar)("street", { length: 255 }),
    additional_data: (0, mysql_core_1.text)("additional_data"),
    lat: (0, mysql_core_1.decimal)("lat", { precision: 10, scale: 8 }),
    lng: (0, mysql_core_1.decimal)("lng", { precision: 11, scale: 8 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.addressesRelations = (0, drizzle_orm_1.relations)(exports.addresses, ({ one }) => ({
    customer: one(customers_1.customers, {
        fields: [exports.addresses.customer_id],
        references: [customers_1.customers.id],
    }),
    city: one(cities_1.cities, {
        fields: [exports.addresses.city_id],
        references: [cities_1.cities.id],
    }),
    zone: one(zones_1.zones, {
        fields: [exports.addresses.zone_id],
        references: [zones_1.zones.id],
    }),
}));
