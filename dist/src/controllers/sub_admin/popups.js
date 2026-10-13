"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPopups = getAllPopups;
exports.getPopupsSelection = getPopupsSelection;
exports.getPopupById = getPopupById;
exports.createPopup = createPopup;
exports.updatePopup = updatePopup;
exports.deletePopup = deletePopup;
exports.bulkDeletePopups = bulkDeletePopups;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = require("crypto");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
function formatImageUrl(req, img) {
    if (!img)
        return "";
    if (img.startsWith("http://") || img.startsWith("https://"))
        return img;
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `${req.protocol}://${req.get("host")}/${cleanPath}`;
}
function parseImages(raw, req) {
    let list = [];
    if (Array.isArray(raw)) {
        list = raw;
    }
    else if (typeof raw === "string") {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed))
                list = parsed;
            else if (typeof parsed === "string")
                list = [parsed];
        }
        catch {
            list = [raw];
        }
    }
    return list.map((img) => formatImageUrl(req, img));
}
// 1. Get All Popups (Paginated, images as links, multilingual names)
async function getAllPopups(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.popups);
    const total = Number(countResult?.total || 0);
    const list = await db.select().from(schema_1.popups).limit(limit).offset(offset);
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
        names: item.name,
        image: parseImages(item.image, req),
        link: item.link,
        description: item.description ? (0, localization_1.getLocalizedText)(item.description, lang) : null,
        descriptions: item.description ?? null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    }));
    return (0, response_1.SuccessResponse)(res, {
        popups: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// 2. Get Popups Selection for Dropdowns (id, name)
async function getPopupsSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.popups.id,
        name: schema_1.popups.name,
    })
        .from(schema_1.popups);
    const formatted = list.map((item) => ({
        id: item.id,
        name: (0, localization_1.getLocalizedText)(item.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { popups: formatted }, 200);
}
// 3. Get Popup By ID
async function getPopupById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Popup not found");
    const formatted = {
        id: row[0].id,
        name: (0, localization_1.getLocalizedText)(row[0].name, lang),
        names: row[0].name,
        image: parseImages(row[0].image, req),
        link: row[0].link,
        description: row[0].description ? (0, localization_1.getLocalizedText)(row[0].description, lang) : null,
        descriptions: row[0].description ?? null,
        createdAt: row[0].createdAt,
        updatedAt: row[0].updatedAt,
    };
    return (0, response_1.SuccessResponse)(res, { popup: formatted }, 200);
}
// 4. Create Popup (multilingual name & description, base64 images array to full links)
async function createPopup(req, res) {
    const db = req.db;
    const { name, image, link, description } = req.body;
    // Upload base64 images into uploads/ and collect URLs
    const imageUrls = await Promise.all(image.map(async (img) => {
        if (img.startsWith("http://") || img.startsWith("https://"))
            return img;
        return await (0, imageService_1.uploadImage)(req, img, "uploads");
    }));
    const popupId = (0, crypto_1.randomUUID)();
    await db.insert(schema_1.popups).values({
        id: popupId,
        name,
        image: imageUrls,
        link: link ?? null,
        description: description ?? null,
    });
    const created = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, popupId)).limit(1);
    return (0, response_1.SuccessResponse)(res, {
        message: "Popup created successfully",
        popup: {
            id: created[0].id,
            name: created[0].name,
            image: parseImages(created[0].image, req),
            link: created[0].link,
            description: created[0].description,
            createdAt: created[0].createdAt,
            updatedAt: created[0].updatedAt,
        },
    }, 201);
}
// 5. Update Popup (sync image array, remove unused photos, update multilingual fields)
async function updatePopup(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, image, link, description } = req.body;
    const existing = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Popup not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (link !== undefined)
        updateData.link = link;
    if (description !== undefined)
        updateData.description = description;
    // Sync images array if provided
    if (image !== undefined) {
        const oldImages = Array.isArray(existing[0].image)
            ? existing[0].image
            : [];
        const newImageList = Array.isArray(image) ? image : [];
        // Delete photos removed from old image list
        for (const oldUrl of oldImages) {
            if (!newImageList.includes(oldUrl)) {
                await (0, imageService_1.deleteImage)(oldUrl);
            }
        }
        // Upload any new base64 photos in new image list
        const resolvedUrls = await Promise.all(newImageList.map(async (img) => {
            if (img.startsWith("http://") || img.startsWith("https://"))
                return img;
            return await (0, imageService_1.uploadImage)(req, img, "uploads");
        }));
        updateData.image = resolvedUrls;
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.popups).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id));
    }
    const updated = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id)).limit(1);
    return (0, response_1.SuccessResponse)(res, {
        message: "Popup updated successfully",
        popup: {
            id: updated[0].id,
            name: updated[0].name,
            image: parseImages(updated[0].image, req),
            link: updated[0].link,
            description: updated[0].description,
            createdAt: updated[0].createdAt,
            updatedAt: updated[0].updatedAt,
        },
    }, 200);
}
// 6. Delete Popup (clean up all photos from uploads first)
async function deletePopup(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Popup not found");
    // Delete all photos from disk first
    const images = Array.isArray(existing[0].image)
        ? existing[0].image
        : [];
    for (const imgUrl of images) {
        await (0, imageService_1.deleteImage)(imgUrl);
    }
    await db.delete(schema_1.popups).where((0, drizzle_orm_1.eq)(schema_1.popups.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Popup deleted successfully" }, 200);
}
// 7. Bulk Delete Popups (clean up all photos across all matching popups first)
async function bulkDeletePopups(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.popups).where((0, drizzle_orm_1.inArray)(schema_1.popups.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching popups found", deletedCount: 0 }, 200);
    }
    // Delete all photos from disk first across all matching popups
    for (const item of existing) {
        const images = Array.isArray(item.image) ? item.image : [];
        for (const imgUrl of images) {
            await (0, imageService_1.deleteImage)(imgUrl);
        }
    }
    const popupIds = existing.map((p) => p.id);
    await db.delete(schema_1.popups).where((0, drizzle_orm_1.inArray)(schema_1.popups.id, popupIds));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} popup(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
