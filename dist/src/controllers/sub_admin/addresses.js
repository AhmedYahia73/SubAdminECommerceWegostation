"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAddresses = getAllAddresses;
exports.getAddressLists = getAddressLists;
exports.getAddressById = getAddressById;
exports.createAddress = createAddress;
exports.updateAddress = updateAddress;
exports.deleteAddress = deleteAddress;
exports.bulkDeleteAddresses = bulkDeleteAddresses;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const pagination_1 = require("../../utils/pagination");
async function getAllAddresses(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.addresses);
    const total = Number(countResult?.total || 0);
    const list = await db
        .select({
        id: schema_1.addresses.id,
        customer_id: schema_1.addresses.customer_id,
        customer_name: schema_1.customers.name,
        city_id: schema_1.addresses.city_id,
        zone_id: schema_1.addresses.zone_id,
        building_num: schema_1.addresses.building_num,
        floor: schema_1.addresses.floor,
        address: schema_1.addresses.address,
        street: schema_1.addresses.street,
        additional_data: schema_1.addresses.additional_data,
        lat: schema_1.addresses.lat,
        lng: schema_1.addresses.lng,
        createdAt: schema_1.addresses.createdAt,
        updatedAt: schema_1.addresses.updatedAt,
    })
        .from(schema_1.addresses)
        .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.addresses.customer_id, schema_1.customers.id))
        .limit(limit)
        .offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        map_url: (0, localization_1.getGoogleMapsUrl)(item.lat, item.lng),
    }));
    return (0, response_1.SuccessResponse)(res, {
        addresses: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// Relational Lists Endpoint for Creating / Editing Addresses
async function getAddressLists(req, res) {
    const db = req.db;
    const customersList = await db
        .select({ id: schema_1.customers.id, name: schema_1.customers.name })
        .from(schema_1.customers);
    const citiesRaw = await db
        .select({ id: schema_1.cities.id, name: schema_1.cities.name })
        .from(schema_1.cities)
        .where((0, drizzle_orm_1.eq)(schema_1.cities.status, true));
    const citiesList = citiesRaw.map((c) => ({
        id: c.id,
        name: Array.isArray(c.name) ? c.name[0] : c.name,
    }));
    const zonesRaw = await db
        .select({ id: schema_1.zones.id, name: schema_1.zones.name, city_id: schema_1.zones.city_id })
        .from(schema_1.zones)
        .where((0, drizzle_orm_1.eq)(schema_1.zones.status, true));
    const zonesList = zonesRaw.map((z) => ({
        id: z.id,
        name: Array.isArray(z.name) ? z.name[0] : z.name,
        city_id: z.city_id,
    }));
    return (0, response_1.SuccessResponse)(res, {
        customers: customersList,
        cities: citiesList,
        zones: zonesList,
    }, 200);
}
async function getAddressById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db
        .select({
        id: schema_1.addresses.id,
        customer_id: schema_1.addresses.customer_id,
        customer_name: schema_1.customers.name,
        city_id: schema_1.addresses.city_id,
        zone_id: schema_1.addresses.zone_id,
        building_num: schema_1.addresses.building_num,
        floor: schema_1.addresses.floor,
        address: schema_1.addresses.address,
        street: schema_1.addresses.street,
        additional_data: schema_1.addresses.additional_data,
        lat: schema_1.addresses.lat,
        lng: schema_1.addresses.lng,
        createdAt: schema_1.addresses.createdAt,
        updatedAt: schema_1.addresses.updatedAt,
    })
        .from(schema_1.addresses)
        .leftJoin(schema_1.customers, (0, drizzle_orm_1.eq)(schema_1.addresses.customer_id, schema_1.customers.id))
        .where((0, drizzle_orm_1.eq)(schema_1.addresses.id, id))
        .limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Address not found");
    const address = {
        ...row[0],
        map_url: (0, localization_1.getGoogleMapsUrl)(row[0].lat, row[0].lng),
    };
    return (0, response_1.SuccessResponse)(res, { address }, 200);
}
async function createAddress(req, res) {
    const db = req.db;
    const { customer_id, city_id, zone_id, building_num, floor, address, street, additional_data, lat, lng, } = req.body;
    const customerExists = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, customer_id)).limit(1);
    if (!customerExists[0])
        throw new Errors_1.NotFound("Customer not found");
    const cityExists = await db.select({ id: schema_1.cities.id }).from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, city_id)).limit(1);
    if (!cityExists[0])
        throw new Errors_1.NotFound("City not found");
    const zoneExists = await db.select({ id: schema_1.zones.id }).from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, zone_id)).limit(1);
    if (!zoneExists[0])
        throw new Errors_1.NotFound("Zone not found");
    await db.insert(schema_1.addresses).values({
        customer_id,
        city_id,
        zone_id,
        building_num: building_num ?? null,
        floor: floor ?? null,
        address,
        street: street ?? null,
        additional_data: additional_data ?? null,
        lat: lat !== undefined && lat !== null ? String(lat) : null,
        lng: lng !== undefined && lng !== null ? String(lng) : null,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Address created successfully" }, 201);
}
async function updateAddress(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { customer_id, city_id, zone_id, building_num, floor, address, street, additional_data, lat, lng, } = req.body;
    const existing = await db.select().from(schema_1.addresses).where((0, drizzle_orm_1.eq)(schema_1.addresses.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Address not found");
    if (customer_id) {
        const customerExists = await db.select({ id: schema_1.customers.id }).from(schema_1.customers).where((0, drizzle_orm_1.eq)(schema_1.customers.id, customer_id)).limit(1);
        if (!customerExists[0])
            throw new Errors_1.NotFound("Customer not found");
    }
    if (city_id) {
        const cityExists = await db.select({ id: schema_1.cities.id }).from(schema_1.cities).where((0, drizzle_orm_1.eq)(schema_1.cities.id, city_id)).limit(1);
        if (!cityExists[0])
            throw new Errors_1.NotFound("City not found");
    }
    if (zone_id) {
        const zoneExists = await db.select({ id: schema_1.zones.id }).from(schema_1.zones).where((0, drizzle_orm_1.eq)(schema_1.zones.id, zone_id)).limit(1);
        if (!zoneExists[0])
            throw new Errors_1.NotFound("Zone not found");
    }
    const updateData = {};
    if (customer_id !== undefined)
        updateData.customer_id = customer_id;
    if (city_id !== undefined)
        updateData.city_id = city_id;
    if (zone_id !== undefined)
        updateData.zone_id = zone_id;
    if (building_num !== undefined)
        updateData.building_num = building_num;
    if (floor !== undefined)
        updateData.floor = floor;
    if (address !== undefined)
        updateData.address = address;
    if (street !== undefined)
        updateData.street = street;
    if (additional_data !== undefined)
        updateData.additional_data = additional_data;
    if (lat !== undefined)
        updateData.lat = lat !== null ? String(lat) : null;
    if (lng !== undefined)
        updateData.lng = lng !== null ? String(lng) : null;
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.addresses).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.addresses.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Address updated successfully" }, 200);
}
async function deleteAddress(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.addresses).where((0, drizzle_orm_1.eq)(schema_1.addresses.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Address not found");
    await db.delete(schema_1.addresses).where((0, drizzle_orm_1.eq)(schema_1.addresses.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Address deleted successfully" }, 200);
}
async function bulkDeleteAddresses(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.addresses).where((0, drizzle_orm_1.inArray)(schema_1.addresses.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching addresses found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.addresses).where((0, drizzle_orm_1.inArray)(schema_1.addresses.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} address(es) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
