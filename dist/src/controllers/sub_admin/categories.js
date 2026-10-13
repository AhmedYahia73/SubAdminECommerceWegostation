"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCategories = getAllCategories;
exports.getCategoriesSelection = getCategoriesSelection;
exports.getCategoryById = getCategoryById;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.bulkDeleteCategories = bulkDeleteCategories;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
async function getAllCategories(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.categories);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.categories).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        ...item,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
    }));
    return (0, response_1.SuccessResponse)(res, {
        categories: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
async function getCategoriesSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.categories.id,
        name: schema_1.categories.name,
    })
        .from(schema_1.categories);
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { categories: formatted }, 200);
}
async function getCategoryById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Category not found");
    const category = {
        ...row[0],
        localized_name: (0, localization_1.getLocalizedText)(row[0].name, lang),
    };
    return (0, response_1.SuccessResponse)(res, { category }, 200);
}
async function createCategory(req, res) {
    const db = req.db;
    const { name, category_id, order_number, banner, icon, cover_image } = req.body;
    let bannerUrl = null;
    let iconUrl = null;
    let coverImageUrl = null;
    if (banner)
        bannerUrl = await (0, imageService_1.uploadImage)(req, banner, "uploads");
    if (icon)
        iconUrl = await (0, imageService_1.uploadImage)(req, icon, "uploads");
    if (cover_image)
        coverImageUrl = await (0, imageService_1.uploadImage)(req, cover_image, "uploads");
    await db.insert(schema_1.categories).values({
        name,
        category_id: category_id ?? null,
        order_number: order_number ?? 0,
        banner: bannerUrl,
        icon: iconUrl,
        cover_image: coverImageUrl,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Category created successfully" }, 201);
}
async function updateCategory(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, category_id, order_number, banner, icon, cover_image } = req.body;
    const existing = await db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Category not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (category_id !== undefined)
        updateData.category_id = category_id;
    if (order_number !== undefined)
        updateData.order_number = order_number;
    if (banner !== undefined && banner !== existing[0].banner) {
        if (banner) {
            updateData.banner = await (0, imageService_1.updateImage)(req, banner, "uploads", existing[0].banner);
        }
        else {
            await (0, imageService_1.deleteImage)(existing[0].banner);
            updateData.banner = null;
        }
    }
    if (icon !== undefined && icon !== existing[0].icon) {
        if (icon) {
            updateData.icon = await (0, imageService_1.updateImage)(req, icon, "uploads", existing[0].icon);
        }
        else {
            await (0, imageService_1.deleteImage)(existing[0].icon);
            updateData.icon = null;
        }
    }
    if (cover_image !== undefined && cover_image !== existing[0].cover_image) {
        if (cover_image) {
            updateData.cover_image = await (0, imageService_1.updateImage)(req, cover_image, "uploads", existing[0].cover_image);
        }
        else {
            await (0, imageService_1.deleteImage)(existing[0].cover_image);
            updateData.cover_image = null;
        }
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.categories).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id));
    }
    return (0, response_1.SuccessResponse)(res, { message: "Category updated successfully" }, 200);
}
async function deleteCategory(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Category not found");
    if (existing[0].banner)
        await (0, imageService_1.deleteImage)(existing[0].banner);
    if (existing[0].icon)
        await (0, imageService_1.deleteImage)(existing[0].icon);
    if (existing[0].cover_image)
        await (0, imageService_1.deleteImage)(existing[0].cover_image);
    await db.delete(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Category deleted successfully" }, 200);
}
async function bulkDeleteCategories(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.categories).where((0, drizzle_orm_1.inArray)(schema_1.categories.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching categories found", deletedCount: 0 }, 200);
    }
    for (const item of existing) {
        if (item.banner)
            await (0, imageService_1.deleteImage)(item.banner);
        if (item.icon)
            await (0, imageService_1.deleteImage)(item.icon);
        if (item.cover_image)
            await (0, imageService_1.deleteImage)(item.cover_image);
    }
    await db.delete(schema_1.categories).where((0, drizzle_orm_1.inArray)(schema_1.categories.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} category(ies) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
