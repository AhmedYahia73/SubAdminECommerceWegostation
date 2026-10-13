"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCities = getAllCities;
exports.getCitiesSelection = getCitiesSelection;
exports.getCityById = getCityById;
exports.createCity = createCity;
exports.updateCity = updateCity;
exports.deleteCity = deleteCity;
exports.bulkDeleteCities = bulkDeleteCities;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
async function getAllCities(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.cities);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.cities).limit(limit).offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        cities: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getCitiesSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.cities.id,
        name: schema_1.cities.name,
    })
        .from(schema_1.cities)
        .where((0, drizzle_orm_1.eq)(schema_1.cities.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: Array.isArray(item.name) ? item.name[0] : item.name,
    }));
    return (0, response_1.SuccessResponse)(res, { cities: formatted }, 200);
}
async function getCityById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("City not found");
    return (0, response_1.SuccessResponse)(res, { city: row[0] }, 200);
}
async function createCity(req, res) {
    const db = req.db;
    const { name, status } = req.body;
    await db.insert(schema_1.cities).values({
        name,
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "City created successfully" }, 201);
}
async function updateCity(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, status } = req.body;
    const existing = await db.select().from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("City not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (status !== undefined)
        updateData.status = status;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.cities).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.cities.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "City updated successfully" }, 200);
}
async function deleteCity(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("City not found");
    await db.delete(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "City deleted successfully" }, 200);
}
async function bulkDeleteCities(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.cities).where((0, drizzle_orm_1.inArray)(schema_1.cities.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching cities found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.cities).where((0, drizzle_orm_1.inArray)(schema_1.cities.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} city(ies) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
