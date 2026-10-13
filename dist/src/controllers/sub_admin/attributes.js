"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAttributes = getAllAttributes;
exports.getAttributesSelection = getAttributesSelection;
exports.getAttributeById = getAttributeById;
exports.createAttribute = createAttribute;
exports.updateAttribute = updateAttribute;
exports.deleteAttribute = deleteAttribute;
exports.bulkDeleteAttributes = bulkDeleteAttributes;
exports.addValueToAttribute = addValueToAttribute;
exports.updateValue = updateValue;
exports.deleteValue = deleteValue;
exports.bulkDeleteValues = bulkDeleteValues;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const localization_1 = require("../../utils/localization");
const pagination_1 = require("../../utils/pagination");
// 1. Get All Attributes with their Values (Paginated)
async function getAllAttributes(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const { page, limit, offset } = (0, pagination_1.getPaginationParams)(req);
    const [countResult] = await db.select({ total: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.attributes);
    const total = Number(countResult?.total || 0);
    const pagedAttributes = await db.select().from(schema_1.attributes).limit(limit).offset(offset);
    const attrIds = pagedAttributes.map((a) => a.id);
    const allValues = attrIds.length > 0
        ? await db.select().from(schema_1.values).where((0, drizzle_orm_1.inArray)(schema_1.values.attribute_id, attrIds))
        : [];
    // Group values by attribute_id
    const valuesByAttr = new Map();
    for (const val of allValues) {
        if (!valuesByAttr.has(val.attribute_id)) {
            valuesByAttr.set(val.attribute_id, []);
        }
        valuesByAttr.get(val.attribute_id).push(val);
    }
    const formatted = pagedAttributes.map((attr) => {
        const attrValues = valuesByAttr.get(attr.id) || [];
        return {
            id: attr.id,
            name: (0, localization_1.getLocalizedText)(attr.name, lang),
            names: attr.name,
            createdAt: attr.createdAt,
            updatedAt: attr.updatedAt,
            values: attrValues.map((v) => ({
                id: v.id,
                name: (0, localization_1.getLocalizedText)(v.name, lang),
                names: v.name,
                createdAt: v.createdAt,
                updatedAt: v.updatedAt,
            })),
        };
    });
    return (0, response_1.SuccessResponse)(res, {
        attributes: formatted,
        pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
    }, 200);
}
// 2. Get Attributes Selection for Product Dropdowns / Variants
async function getAttributesSelection(req, res) {
    const db = req.db;
    const lang = req.query.lang;
    const allAttributes = await db
        .select({
        id: schema_1.attributes.id,
        name: schema_1.attributes.name,
    })
        .from(schema_1.attributes);
    const allValues = await db
        .select({
        id: schema_1.values.id,
        name: schema_1.values.name,
        attribute_id: schema_1.values.attribute_id,
    })
        .from(schema_1.values);
    const valuesByAttr = new Map();
    for (const val of allValues) {
        if (!valuesByAttr.has(val.attribute_id)) {
            valuesByAttr.set(val.attribute_id, []);
        }
        valuesByAttr.get(val.attribute_id).push({
            id: val.id,
            name: (0, localization_1.getLocalizedText)(val.name, lang),
        });
    }
    const formatted = allAttributes.map((attr) => ({
        id: attr.id,
        name: (0, localization_1.getLocalizedText)(attr.name, lang),
        values: valuesByAttr.get(attr.id) || [],
    }));
    return (0, response_1.SuccessResponse)(res, { attributes: formatted }, 200);
}
// 3. Get Attribute By ID with its Values
async function getAttributeById(req, res) {
    const db = req.db;
    const { id } = req.params;
    const lang = req.query.lang;
    const row = await db.select().from(schema_1.attributes).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id)).limit(1);
    if (!row[0])
        throw new Errors_1.NotFound("Attribute not found");
    const attrValues = await db.select().from(schema_1.values).where((0, drizzle_orm_1.eq)(schema_1.values.attribute_id, id));
    const formatted = {
        id: row[0].id,
        name: (0, localization_1.getLocalizedText)(row[0].name, lang),
        names: row[0].name,
        createdAt: row[0].createdAt,
        updatedAt: row[0].updatedAt,
        values: attrValues.map((v) => ({
            id: v.id,
            name: (0, localization_1.getLocalizedText)(v.name, lang),
            names: v.name,
            createdAt: v.createdAt,
            updatedAt: v.updatedAt,
        })),
    };
    return (0, response_1.SuccessResponse)(res, { attribute: formatted }, 200);
}
// 4. Create Attribute with optional Values
async function createAttribute(req, res) {
    const db = req.db;
    const { name, values: valuesList } = req.body;
    // Insert Attribute
    const [insertResult] = (await db.insert(schema_1.attributes).values({ name }));
    // Fetch newly created attribute
    const createdAttr = await db
        .select()
        .from(schema_1.attributes)
        .where((0, drizzle_orm_1.eq)(schema_1.attributes.name, name))
        .orderBy(schema_1.attributes.createdAt)
        .limit(1);
    const attributeId = createdAttr[0]?.id;
    // Insert Values if provided
    if (attributeId && Array.isArray(valuesList) && valuesList.length > 0) {
        for (const valItem of valuesList) {
            if (valItem.name) {
                await db.insert(schema_1.values).values({
                    attribute_id: attributeId,
                    name: valItem.name,
                });
            }
        }
    }
    return (0, response_1.SuccessResponse)(res, { message: "Attribute and its values created successfully", id: attributeId }, 201);
}
// 5. Update Attribute and Sync its Values
async function updateAttribute(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name, values: valuesList } = req.body;
    const existing = await db.select().from(schema_1.attributes).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Attribute not found");
    // Update attribute name if provided
    if (name !== undefined) {
        await db.update(schema_1.attributes).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id));
    }
    // Sync values if provided
    if (Array.isArray(valuesList)) {
        const existingValues = await db.select().from(schema_1.values).where((0, drizzle_orm_1.eq)(schema_1.values.attribute_id, id));
        const existingValIds = new Set(existingValues.map((v) => v.id));
        const keepValIds = new Set();
        for (const valItem of valuesList) {
            if (valItem.id && existingValIds.has(valItem.id)) {
                // Update existing value
                await db
                    .update(schema_1.values)
                    .set({ name: valItem.name })
                    .where((0, drizzle_orm_1.eq)(schema_1.values.id, valItem.id));
                keepValIds.add(valItem.id);
            }
            else if (valItem.name) {
                // Insert new value
                await db.insert(schema_1.values).values({
                    attribute_id: id,
                    name: valItem.name,
                });
            }
        }
        // Delete values that were omitted from valuesList
        const toDeleteIds = existingValues
            .filter((v) => !keepValIds.has(v.id))
            .map((v) => v.id);
        if (toDeleteIds.length > 0) {
            await db.delete(schema_1.values).where((0, drizzle_orm_1.inArray)(schema_1.values.id, toDeleteIds));
        }
    }
    return (0, response_1.SuccessResponse)(res, { message: "Attribute updated successfully" }, 200);
}
// 6. Delete Single Attribute
async function deleteAttribute(req, res) {
    const db = req.db;
    const { id } = req.params;
    const existing = await db.select().from(schema_1.attributes).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id)).limit(1);
    if (!existing[0])
        throw new Errors_1.NotFound("Attribute not found");
    // Values are deleted via ON DELETE CASCADE in database
    await db.delete(schema_1.attributes).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id));
    return (0, response_1.SuccessResponse)(res, { message: "Attribute deleted successfully" }, 200);
}
// 7. Bulk Delete Attributes
async function bulkDeleteAttributes(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.attributes).where((0, drizzle_orm_1.inArray)(schema_1.attributes.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching attributes found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.attributes).where((0, drizzle_orm_1.inArray)(schema_1.attributes.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} attribute(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
// 8. Add Single Value to Attribute
async function addValueToAttribute(req, res) {
    const db = req.db;
    const { id } = req.params;
    const { name } = req.body;
    const existingAttr = await db.select().from(schema_1.attributes).where((0, drizzle_orm_1.eq)(schema_1.attributes.id, id)).limit(1);
    if (!existingAttr[0])
        throw new Errors_1.NotFound("Attribute not found");
    await db.insert(schema_1.values).values({
        attribute_id: id,
        name,
    });
    return (0, response_1.SuccessResponse)(res, { message: "Value added to attribute successfully" }, 201);
}
// 9. Update Single Value
async function updateValue(req, res) {
    const db = req.db;
    const { valueId } = req.params;
    const { name } = req.body;
    const existingVal = await db.select().from(schema_1.values).where((0, drizzle_orm_1.eq)(schema_1.values.id, valueId)).limit(1);
    if (!existingVal[0])
        throw new Errors_1.NotFound("Value not found");
    await db.update(schema_1.values).set({ name }).where((0, drizzle_orm_1.eq)(schema_1.values.id, valueId));
    return (0, response_1.SuccessResponse)(res, { message: "Value updated successfully" }, 200);
}
// 10. Delete Single Value
async function deleteValue(req, res) {
    const db = req.db;
    const { valueId } = req.params;
    const existingVal = await db.select().from(schema_1.values).where((0, drizzle_orm_1.eq)(schema_1.values.id, valueId)).limit(1);
    if (!existingVal[0])
        throw new Errors_1.NotFound("Value not found");
    await db.delete(schema_1.values).where((0, drizzle_orm_1.eq)(schema_1.values.id, valueId));
    return (0, response_1.SuccessResponse)(res, { message: "Value deleted successfully" }, 200);
}
// 11. Bulk Delete Values
async function bulkDeleteValues(req, res) {
    const db = req.db;
    const { ids } = req.body;
    const existing = await db.select().from(schema_1.values).where((0, drizzle_orm_1.inArray)(schema_1.values.id, ids));
    if (existing.length === 0) {
        return (0, response_1.SuccessResponse)(res, { message: "No matching values found", deletedCount: 0 }, 200);
    }
    await db.delete(schema_1.values).where((0, drizzle_orm_1.inArray)(schema_1.values.id, ids));
    return (0, response_1.SuccessResponse)(res, {
        message: `${existing.length} value(s) deleted successfully`,
        deletedCount: existing.length,
    }, 200);
}
