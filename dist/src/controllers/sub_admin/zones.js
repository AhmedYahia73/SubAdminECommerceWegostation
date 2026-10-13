"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllZones = getAllZones;
exports.getZoneLists = getZoneLists;
exports.getZonesSelection = getZonesSelection;
exports.getZoneById = getZoneById;
exports.createZone = createZone;
exports.updateZone = updateZone;
exports.deleteZone = deleteZone;
exports.bulkDeleteZones = bulkDeleteZones;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
async function getAllZones(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.zones);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.zones).limit(limit).offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        zones: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getZoneLists(req, res) {
    const db = req.db;
    const citiesRaw = await db
        .select({
        id: schema_1.cities.id,
        name: schema_1.cities.name,
    })
        .from(schema_1.cities)
        .where((0, drizzle_orm_1.eq)(schema_1.cities.status, true));
    const citiesList = citiesRaw.map((c) => ({
        id: c.id,
        name: Array.isArray(c.name) ? c.name[0] : c.name,
    }));
    return (0, response_1.SuccessResponse)(res, { cities: citiesList }, 200);
}
async function getZonesSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.zones.id,
        name: schema_1.zones.name,
        city_id: schema_1.zones.city_id,
    })
        .from(schema_1.zones)
        .where((0, drizzle_orm_1.eq)(schema_1.zones.status, true));
    const formatted = list.map((item) => ({
        id: item.id,
        name: Array.isArray(item.name) ? item.name[0] : item.name,
        city_id: item.city_id,
    }));
    return (0, response_1.SuccessResponse)(res, { zones: formatted }, 200);
}
async function getZoneById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Zone not found");
    return (0, response_1.SuccessResponse)(res, { zone: row[0] }, 200);
}
async function createZone(req, res) {
    const db = req.db;
    const { name, city_id, status } = req.body;
    const cityExists = await db.select({ id: schema_1.cities.id }).from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, city_id)).limit(1);
    if (!cityExists[0])
        throw new Errors_1.NotFound("City not found");
    await db.insert(schema_1.zones).values({
        name,
        city_id,
        status: status !== undefined ? status : true,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Zone created successfully" }, 201);
}
async function updateZone(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, city_id, status } = req.body;
    const existing = await db.select().from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Zone not found");
    if (city_id) {
        const cityExists = await db.select({ id: schema_1.cities.id }).from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, city_id)).limit(1);
        if (!cityExists[0])
            throw new Errors_1.NotFound("City not found");
    }
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (city_id !== undefined)
        updateData.city_id = city_id;
    if (status !== undefined)
        updateData.status = status;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.zones).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Zone updated successfully" }, 200);
}
async function deleteZone(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Zone not found");
    await db.delete(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Zone deleted successfully" }, 200);
}
async function bulkDeleteZones(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.zones).where((0, drizzle_orm_1.inArray)(schema_1.zones.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching zones found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.zones).where((0, drizzle_orm_1.inArray)(schema_1.zones.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} zone(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
