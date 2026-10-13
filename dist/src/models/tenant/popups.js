"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.popups = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.popups = (0, mysql_core_1.mysqlTable)("popup", {
    id: (0, mysql_core_1.char)("id", { length: 36 })
        .primaryKey()
        .default((0, drizzle_orm_1.sql) `(UUID())`),
    image: (0, mysql_core_1.json)("image").$type().notNull(),
    link: (0, mysql_core_1.varchar)("link", { length: 500 }),
    name: (0, mysql_core_1.json)("name").$type().notNull(),
    description: (0, mysql_core_1.json)("description").$type(),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow().notNull(),
});
