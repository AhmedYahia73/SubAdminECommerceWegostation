"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProducts = getAllProducts;
exports.getProductLists = getProductLists;
exports.getProductsSelection = getProductsSelection;
exports.getProductById = getProductById;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
exports.bulkDeleteProducts = bulkDeleteProducts;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const imageService_1 = require("../../services/imageService");
const pagination_1 = require("../../utils/pagination");
const crypto_1 = require("crypto");
// 1. Get All Products with Localized Relations & Variants (Paginated)
async function getAllProducts(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.products);
    const total = Number(countResult?.total || 0);
    const allProducts = await db
        .select({
        id: schema_1.products.id,
        name: schema_1.products.name,
        description: schema_1.products.description,
        category_id: schema_1.products.category_id,
        category_name: schema_1.categories.name,
        sub_category_id: schema_1.products.sub_category_id,
        brand_id: schema_1.products.brand_id,
        brand_name: schema_1.brands.name,
        discount_id: schema_1.products.discount_id,
        discount_name: schema_1.discounts.name,
        flash_discount_id: schema_1.products.flash_discount_id,
        flash_discount_name: schema_1.flashDiscounts.name,
        tax_id: schema_1.products.tax_id,
        tax_name: schema_1.taxes.name,
        warrantly_id: schema_1.products.warrantly_id,
        warranty_text: schema_1.warranties.text,
        warrantly_note: schema_1.products.warrantly_note,
        today_deal: schema_1.products.today_deal,
        free_shipping: schema_1.products.free_shipping,
        shipping_days: schema_1.products.shipping_days,
        image: schema_1.products.image,
        gallery: schema_1.products.gallery,
        published: schema_1.products.published,
        createdAt: schema_1.products.createdAt,
        updatedAt: schema_1.products.updatedAt,
    })
        .from(schema_1.products)
        .leftJoin(schema_1.categories, (0, drizzle_orm_1.eq)(schema_1.products.category_id, schema_1.categories.id))
        .leftJoin(schema_1.brands, (0, drizzle_orm_1.eq)(schema_1.products.brand_id, schema_1.brands.id))
        .leftJoin(schema_1.discounts, (0, drizzle_orm_1.eq)(schema_1.products.discount_id, schema_1.discounts.id))
        .leftJoin(schema_1.flashDiscounts, (0, drizzle_orm_1.eq)(schema_1.products.flash_discount_id, schema_1.flashDiscounts.id))
        .leftJoin(schema_1.taxes, (0, drizzle_orm_1.eq)(schema_1.products.tax_id, schema_1.taxes.id))
        .leftJoin(schema_1.warranties, (0, drizzle_orm_1.eq)(schema_1.products.warrantly_id, schema_1.warranties.id))
        .limit(limit)
        .offset(offset);
    // Fetch all variants for these products
    const productIds = allProducts.map((p) => p.id);
    const allVariants = productIds.length > 0
        ? await db.select().from(schema_1.productValues).where((0, drizzle_orm_1.inArray)(schema_1.productValues.product_id, productIds))
        : [];
    const formatted = allProducts.map((p) => {
        const variants = allVariants.filter((v) => v.product_id === p.id);
        return {
            id: p.id,
            name: (0, localization_1.getLocalizedText)(p.name, lang),
            names: p.name,
            description: (0, localization_1.getLocalizedText)(p.description, lang),
            descriptions: p.description,
            category: p.category_id
                ? { id: p.category_id, name: (0, localization_1.getLocalizedText)(p.category_name, lang) }
                : null,
            sub_category: p.sub_category_id ? { id: p.sub_category_id } : null,
            brand: p.brand_id ? { id: p.brand_id, name: p.brand_name || "" } : null,
            discount: p.discount_id
                ? { id: p.discount_id, name: (0, localization_1.getLocalizedText)(p.discount_name, lang) }
                : null,
            flash_discount: p.flash_discount_id
                ? { id: p.flash_discount_id, name: (0, localization_1.getLocalizedText)(p.flash_discount_name, lang) }
                : null,
            tax: p.tax_id ? { id: p.tax_id, name: (0, localization_1.getLocalizedText)(p.tax_name, lang) } : null,
            warranty: p.warrantly_id
                ? { id: p.warrantly_id, name: (0, localization_1.getLocalizedText)(p.warranty_text, lang) }
                : null,
            warrantly_note: p.warrantly_note,
            today_deal: p.today_deal,
            free_shipping: p.free_shipping,
            shipping_days: p.shipping_days,
            image: p.image,
            gallery: p.gallery || [],
            published: p.published,
            variants,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        };
    });
    return (0, response_1.SuccessResponse)(res, {
        products: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// 2. Relational Lists Endpoint for Creating / Editing Products
async function getProductLists(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    // Categories
    const categoriesRaw = await db
        .select({ id: schema_1.categories.id, name: schema_1.categories.name })
        .from(schema_1.categories);
    const categoriesList = categoriesRaw.map((c) => ({
        id: c.id,
        name: (0, localization_1.getLocalizedText)(c.name, lang),
    }));
    // Brands
    const brandsList = await db
        .select({ id: schema_1.brands.id, name: schema_1.brands.name })
        .from(schema_1.brands);
    // Discounts
    const discountsRaw = await db
        .select({ id: schema_1.discounts.id, name: schema_1.discounts.name })
        .from(schema_1.discounts)
        .where((0, drizzle_orm_1.eq)(schema_1.discounts.status, true));
    const discountsList = discountsRaw.map((d) => ({
        id: d.id,
        name: (0, localization_1.getLocalizedText)(d.name, lang),
    }));
    // Flash Discounts
    const flashDiscountsRaw = await db
        .select({ id: schema_1.flashDiscounts.id, name: schema_1.flashDiscounts.name })
        .from(schema_1.flashDiscounts)
        .where((0, drizzle_orm_1.eq)(schema_1.flashDiscounts.status, true));
    const flashDiscountsList = flashDiscountsRaw.map((fd) => ({
        id: fd.id,
        name: (0, localization_1.getLocalizedText)(fd.name, lang),
    }));
    // Taxes
    const taxesRaw = await db
        .select({ id: schema_1.taxes.id, name: schema_1.taxes.name })
        .from(schema_1.taxes)
        .where((0, drizzle_orm_1.eq)(schema_1.taxes.status, true));
    const taxesList = taxesRaw.map((t) => ({
        id: t.id,
        name: (0, localization_1.getLocalizedText)(t.name, lang),
    }));
    // Warranties
    const warrantiesRaw = await db
        .select({ id: schema_1.warranties.id, text: schema_1.warranties.text })
        .from(schema_1.warranties);
    const warrantiesList = warrantiesRaw.map((w) => ({
        id: w.id,
        name: (0, localization_1.getLocalizedText)(w.text, lang),
    }));
    return (0, response_1.SuccessResponse)(res, {
        categories: categoriesList,
        brands: brandsList,
        discounts: discountsList,
        flash_discounts: flashDiscountsList,
        taxes: taxesList,
        warranties: warrantiesList,
    }, 200);
}
// 2.1 Selection List Endpoint for Products themselves
async function getProductsSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const list = await db
        .select({
        id: schema_1.products.id,
        name: schema_1.products.name,
    })
        .from(schema_1.products)
        .where((0, drizzle_orm_1.eq)(schema_1.products.published, true));
    const formatted = list.map((p) => ({
        id: p.id,
        name: (0, localization_1.getLocalizedText)(p.name, lang),
    }));
    return (0, response_1.SuccessResponse)(res, { products: formatted }, 200);
}
// 3. Get Product By ID
async function getProductById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db
        .select({
        id: schema_1.products.id,
        name: schema_1.products.name,
        description: schema_1.products.description,
        category_id: schema_1.products.category_id,
        category_name: schema_1.categories.name,
        sub_category_id: schema_1.products.sub_category_id,
        brand_id: schema_1.products.brand_id,
        brand_name: schema_1.brands.name,
        discount_id: schema_1.products.discount_id,
        discount_name: schema_1.discounts.name,
        flash_discount_id: schema_1.products.flash_discount_id,
        flash_discount_name: schema_1.flashDiscounts.name,
        tax_id: schema_1.products.tax_id,
        tax_name: schema_1.taxes.name,
        warrantly_id: schema_1.products.warrantly_id,
        warranty_text: schema_1.warranties.text,
        warrantly_note: schema_1.products.warrantly_note,
        today_deal: schema_1.products.today_deal,
        free_shipping: schema_1.products.free_shipping,
        shipping_days: schema_1.products.shipping_days,
        image: schema_1.products.image,
        gallery: schema_1.products.gallery,
        published: schema_1.products.published,
        createdAt: schema_1.products.createdAt,
        updatedAt: schema_1.products.updatedAt,
    })
        .from(schema_1.products)
        .leftJoin(schema_1.categories, (0, drizzle_orm_1.eq)(schema_1.products.category_id, schema_1.categories.id))
        .leftJoin(schema_1.brands, (0, drizzle_orm_1.eq)(schema_1.products.brand_id, schema_1.brands.id))
        .leftJoin(schema_1.discounts, (0, drizzle_orm_1.eq)(schema_1.products.discount_id, schema_1.discounts.id))
        .leftJoin(schema_1.flashDiscounts, (0, drizzle_orm_1.eq)(schema_1.products.flash_discount_id, schema_1.flashDiscounts.id))
        .leftJoin(schema_1.taxes, (0, drizzle_orm_1.eq)(schema_1.products.tax_id, schema_1.taxes.id))
        .leftJoin(schema_1.warranties, (0, drizzle_orm_1.eq)(schema_1.products.warrantly_id, schema_1.warranties.id))
        .where((0, drizzle_orm_1.eq)(schema_1.products.id, id))
        .limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Product not found");
    const variants = await db
        .select()
        .from(schema_1.productValues)
        .where((0, drizzle_orm_1.eq)(schema_1.productValues.product_id, id));
    const p = row[0];
    const product = {
        id: p.id,
        name: (0, localization_1.getLocalizedText)(p.name, lang),
        names: p.name,
        description: (0, localization_1.getLocalizedText)(p.description, lang),
        descriptions: p.description,
        category: p.category_id
            ? { id: p.category_id, name: (0, localization_1.getLocalizedText)(p.category_name, lang) }
            : null,
        sub_category: p.sub_category_id ? { id: p.sub_category_id } : null,
        brand: p.brand_id ? { id: p.brand_id, name: p.brand_name || "" } : null,
        discount: p.discount_id
            ? { id: p.discount_id, name: (0, localization_1.getLocalizedText)(p.discount_name, lang) }
            : null,
        flash_discount: p.flash_discount_id
            ? { id: p.flash_discount_id, name: (0, localization_1.getLocalizedText)(p.flash_discount_name, lang) }
            : null,
        tax: p.tax_id ? { id: p.tax_id, name: (0, localization_1.getLocalizedText)(p.tax_name, lang) } : null,
        warranty: p.warrantly_id
            ? { id: p.warrantly_id, name: (0, localization_1.getLocalizedText)(p.warranty_text, lang) }
            : null,
        warrantly_note: p.warrantly_note,
        today_deal: p.today_deal,
        free_shipping: p.free_shipping,
        shipping_days: p.shipping_days,
        image: p.image,
        gallery: p.gallery || [],
        published: p.published,
        variants,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
    };
    return (0, response_1.SuccessResponse)(res, { product }, 200);
}
// 4. Create Product with Images, Gallery, and Variants
async function createProduct(req, res) {
    const db = req.db;
    const { name, description, category_id, sub_category_id, brand_id, discount_id, flash_discount_id, tax_id, warrantly_id, warrantly_note, today_deal, free_shipping, shipping_days, published, image, gallery, product_values, } = req.body;
    // Validate Category
    const catExists = await db.select({ id: schema_1.categories.id }).from(schema_1.categories).where((0, drizzle_orm_1.eq)(schema_1.categories.id, category_id)).limit(1);
    if (!catExists[0])
        throw new Errors_1.NotFound("Category not found");
    // 1. Upload Main Image
    const mainImageUrl = await (0, imageService_1.uploadImage)(req, image, "uploads");
    // 2. Upload Gallery Images
    let galleryUrls = [];
    if (Array.isArray(gallery) && gallery.length > 0) {
        galleryUrls = await Promise.all(gallery.map(async (img) => {
            if (img.startsWith("http"))
                return img;
            return await (0, imageService_1.uploadImage)(req, img, "uploads");
        }));
    }
    const productId = (0, crypto_1.randomUUID)();
    // 3. Insert Product
    await db.insert(schema_1.products).values({
        id: productId,
        name,
        description: description ?? null,
        category_id,
        sub_category_id: sub_category_id ?? null,
        brand_id: brand_id ?? null,
        discount_id: discount_id ?? null,
        flash_discount_id: flash_discount_id ?? null,
        tax_id: tax_id ?? null,
        warrantly_id: warrantly_id ?? null,
        warrantly_note: warrantly_note ?? null,
        today_deal: today_deal ?? false,
        free_shipping: free_shipping ?? false,
        shipping_days: shipping_days ?? 0,
        published: published ?? true,
        image: mainImageUrl,
        gallery: galleryUrls,
    });
    // 4. Insert Variants (productValues)
    if (Array.isArray(product_values) && product_values.length > 0) {
        for (const v of product_values) {
            let variantImageUrl = null;
            if (v.image) {
                variantImageUrl = v.image.startsWith("http")
                    ? v.image
                    : await (0, imageService_1.uploadImage)(req, v.image, "uploads");
            }
            await db.insert(schema_1.productValues).values({
                product_id: productId,
                value_ids: v.value_ids,
                sku: v.sku ?? null,
                quantity: v.quantity !== undefined ? Number(v.quantity) : 1,
                price: v.price !== undefined ? String(v.price) : "0.00",
                image: variantImageUrl,
            });
        }
    }
    return (0, response_1.SuccessResponse)(res, { message: "Product created successfully", id: productId }, 201);
}
// 5. Update Product with Images, Gallery, and Variants
async function updateProduct(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, description, category_id, sub_category_id, brand_id, discount_id, flash_discount_id, tax_id, warrantly_id, warrantly_note, today_deal, free_shipping, shipping_days, published, image, gallery, product_values, } = req.body;
    const existing = await db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Product not found");
    const updateData = {};
    if (name !== undefined)
        updateData.name = name;
    if (description !== undefined)
        updateData.description = description;
    if (category_id !== undefined)
        updateData.category_id = category_id;
    if (sub_category_id !== undefined)
        updateData.sub_category_id = sub_category_id;
    if (brand_id !== undefined)
        updateData.brand_id = brand_id;
    if (discount_id !== undefined)
        updateData.discount_id = discount_id;
    if (flash_discount_id !== undefined)
        updateData.flash_discount_id = flash_discount_id;
    if (tax_id !== undefined)
        updateData.tax_id = tax_id;
    if (warrantly_id !== undefined)
        updateData.warrantly_id = warrantly_id;
    if (warrantly_note !== undefined)
        updateData.warrantly_note = warrantly_note;
    if (today_deal !== undefined)
        updateData.today_deal = today_deal;
    if (free_shipping !== undefined)
        updateData.free_shipping = free_shipping;
    if (shipping_days !== undefined)
        updateData.shipping_days = shipping_days;
    if (published !== undefined)
        updateData.published = published;
    // 1. Update Main Image if provided
    if (image !== undefined && image !== existing[0].image) {
        if (image.startsWith("http")) {
            updateData.image = image;
        }
        else {
            updateData.image = await (0, imageService_1.updateImage)(req, image, "uploads", existing[0].image);
        }
    }
    // 2. Update Gallery if provided
    if (gallery !== undefined) {
        const oldGallery = existing[0].gallery || [];
        const newGalleryList = Array.isArray(gallery) ? gallery : [];
        // Delete photos removed from old gallery
        for (const oldUrl of oldGallery) {
            if (!newGalleryList.includes(oldUrl)) {
                await (0, imageService_1.deleteImage)(oldUrl);
            }
        }
        // Upload any new base64 photos in new gallery
        const resolvedGalleryUrls = await Promise.all(newGalleryList.map(async (img) => {
            if (img.startsWith("http"))
                return img;
            return await (0, imageService_1.uploadImage)(req, img, "uploads");
        }));
        updateData.gallery = resolvedGalleryUrls;
    }
    if (Object.keys(updateData).length > 0) {
        await db.update(schema_1.products).set(updateData).where((0, drizzle_orm_1.eq)(schema_1.products.id, id));
    }
    // 3. Update Variants if provided
    if (Array.isArray(product_values)) {
        const oldVariants = await db
            .select()
            .from(schema_1.productValues)
            .where((0, drizzle_orm_1.eq)(schema_1.productValues.product_id, id));
        // Delete old variant images that are not retained
        const keepImageUrls = product_values
            .map((v) => v.image)
            .filter((img) => img && img.startsWith("http"));
        for (const oldV of oldVariants) {
            if (oldV.image && !keepImageUrls.includes(oldV.image)) {
                await (0, imageService_1.deleteImage)(oldV.image);
            }
        }
        // Clear existing variants and insert updated list
        await db.delete(schema_1.productValues).where((0, drizzle_orm_1.eq)(schema_1.productValues.product_id, id));
        for (const v of product_values) {
            let variantImageUrl = null;
            if (v.image) {
                variantImageUrl = v.image.startsWith("http")
                    ? v.image
                    : await (0, imageService_1.uploadImage)(req, v.image, "uploads");
            }
            await db.insert(schema_1.productValues).values({
                product_id: id,
                value_ids: v.value_ids,
                sku: v.sku ?? null,
                quantity: v.quantity !== undefined ? Number(v.quantity) : 1,
                price: v.price !== undefined ? String(v.price) : "0.00",
                image: variantImageUrl,
            });
        }
    }
    return (0, response_1.SuccessResponse)(res, { message: "Product updated successfully" }, 200);
}
// 6. Delete Product and its Images, Gallery, and Variants
async function deleteProduct(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Product not found");
    // 1. Delete Main Image
    if (existing[0].image) {
        await (0, imageService_1.deleteImage)(existing[0].image);
    }
    // 2. Delete Gallery Images
    const galleryUrls = existing[0].gallery || [];
    for (const url of galleryUrls) {
        await (0, imageService_1.deleteImage)(url);
    }
    // 3. Delete Variant Images
    const variants = await db
        .select()
        .from(schema_1.productValues)
        .where((0, drizzle_orm_1.eq)(schema_1.productValues.product_id, id));
    for (const v of variants) {
        if (v.image) {
            await (0, imageService_1.deleteImage)(v.image);
        }
    }
    // 4. Delete Variants and Product Record
    await db.delete(schema_1.productValues).where((0, drizzle_orm_1.eq)(schema_1.productValues.product_id, id));
    await db.delete(schema_1.products).where((0, drizzle_orm_1.eq)(schema_1.products.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Product deleted successfully" }, 200);
}
async function bulkDeleteProducts(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.products).where((0, drizzle_orm_1.inArray)(schema_1.products.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching products found", deletedCount: 0 }, 200);
    }
    // 1. Delete all images across all matching products
    for (const item of existing) {
        if (item.image) {
            await (0, imageService_1.deleteImage)(item.image);
        }
        const galleryUrls = item.gallery || [];
        for (const url of galleryUrls) {
            await (0, imageService_1.deleteImage)(url);
        }
    }
    // 2. Delete all variant images
    const variants = await db
        .select()
        .from(schema_1.productValues)
        .where((0, drizzle_orm_1.inArray)(schema_1.productValues.product_id, ids));
    for (const v of variants) {
        if (v.image) {
            await (0, imageService_1.deleteImage)(v.image);
        }
    }
    // 3. Delete records
    await db.delete(schema_1.productValues).where((0, drizzle_orm_1.inArray)(schema_1.productValues.product_id, ids));
    await db.delete(schema_1.products).where((0, drizzle_orm_1.inArray)(schema_1.products.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} product(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
