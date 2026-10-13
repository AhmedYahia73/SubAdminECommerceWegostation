"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.citiesRelations = exports.cities = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const zones_1 = require("./zones");
const addresses_1 = require("./addresses");
exports.cities = (0, mysql_core_1.mysqlTable)("city", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    status: (0, mysql_core_1.boolean)("status").default(true).notNull(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
exports.citiesRelations = (0, drizzle_orm_1.relations)(exports.cities, ({ many }) => ({
    zones: many(zones_1.zones),
    addresses: many(addresses_1.addresses),
}));
