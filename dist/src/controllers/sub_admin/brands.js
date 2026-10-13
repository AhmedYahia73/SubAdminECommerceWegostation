"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBrands = getAllBrands;
exports.getBrandsSelection = getBrandsSelection;
exports.getBrandById = getBrandById;
exports.createBrand = createBrand;
exports.updateBrand = updateBrand;
exports.deleteBrand = deleteBrand;
exports.bulkDeleteBrands = bulkDeleteBrands;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
async function getAllBrands(req, res) {
    const db = req.db;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.brands);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.brands).limit(limit).offset(offset);
    return (0, response_1.SuccessResponse)(res, {
        brands: list,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getBrandsSelection(req, res) {
    const db = req.db;
    const list = await db
        .select({
        id: schema_1.brands.id,
        name: schema_1.brands.name,
    })
        .from(schema_1.brands);
    return (0, response_1.SuccessResponse)(res, { brands: list }, 200);
}
async function getBrandById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const row = await db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Brand not found");
    return (0, response_1.SuccessResponse)(res, { brand: row[0] }, 200);
}
async function createBrand(req, res) {
    const db = req.db;
    const { name, logo } = req.body;
    const logoUrl = await (0, imageService_1.uploadImage)(req, logo, "uploads");
    await db.insert(schema_1.brands).values({
        name,
        logo: logoUrl,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Brand created successfully" }, 201);
}
async function updateBrand(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, logo } = req.body;
    const existing = await db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Brand not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (logo !== undefined && logo !== existing[0].logo) {
        updateData.logo = await (0, imageService_1.updateImage)(req, logo, "uploads", existing[0].logo);
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.brands).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Brand updated successfully" }, 200);
}
async function deleteBrand(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Brand not found");
    await (0, imageService_1.deleteImage)(existing[0].logo);
    await db.delete(schema_1.brands).where((0, drizzle_orm_1.eq)(schema_1.brands.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Brand deleted successfully" }, 200);
}
async function bulkDeleteBrands(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.brands).where((0, drizzle_orm_1.inArray)(schema_1.brands.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching brands found", deletedCount: 0 }, 200);
    }
    for (const item of existing) {
        if (item.logo) {
            await (0, imageService_1.deleteImage)(item.logo);
        }
    }
    await db.delete(schema_1.brands).where((0, drizzle_orm_1.inArray)(schema_1.brands.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} brand(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
