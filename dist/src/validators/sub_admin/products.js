"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productIdParamSchema = exports.updateProductSchema = exports.createProductSchema = exports.variantItemSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.variantItemSchema = zod_1.default.object({
    id: zod_1.default.string().uuid().optional(),
    value_ids: zod_1.default.array(zod_1.default.string()).min(1, "At least one value ID is required"),
    sku: zod_1.default.string().optional().nullable(),
    quantity: zod_1.default.number().int().default(1),
    price: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]).default(0),
    image: zod_1.default.string().optional().nullable(),
});
exports.createProductSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, { message: "At least the primary language name is required" }),
        description: zod_1.default.record(zod_1.default.string()).optional().nullable(),
        category_id: zod_1.default.string({ required_error: "Category ID is required" }).uuid("Invalid category ID"),
        sub_category_id: zod_1.default.string().uuid("Invalid sub category ID").optional().nullable(),
        brand_id: zod_1.default.string().uuid("Invalid brand ID").optional().nullable(),
        discount_id: zod_1.default.string().uuid("Invalid discount ID").optional().nullable(),
        flash_discount_id: zod_1.default.string().uuid("Invalid flash discount ID").optional().nullable(),
        tax_id: zod_1.default.string().uuid("Invalid tax ID").optional().nullable(),
        warrantly_id: zod_1.default.string().uuid("Invalid warranty ID").optional().nullable(),
        warrantly_note: zod_1.default.string().optional().nullable(),
        today_deal: zod_1.default.boolean().optional(),
        free_shipping: zod_1.default.boolean().optional(),
        shipping_days: zod_1.default.number().int().optional(),
        published: zod_1.default.boolean().optional(),
        image: zod_1.default.string({ required_error: "Main product image is required" }).min(1, "Main product image is required"),
        gallery: zod_1.default.array(zod_1.default.string()).optional().nullable(),
        product_values: zod_1.default.array(exports.variantItemSchema).optional(),
    }),
});
exports.updateProductSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Product ID is required" }).uuid("Invalid product ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).optional(),
        description: zod_1.default.record(zod_1.default.string()).optional().nullable(),
        category_id: zod_1.default.string().uuid("Invalid category ID").optional(),
        sub_category_id: zod_1.default.string().uuid("Invalid sub category ID").optional().nullable(),
        brand_id: zod_1.default.string().uuid("Invalid brand ID").optional().nullable(),
        discount_id: zod_1.default.string().uuid("Invalid discount ID").optional().nullable(),
        flash_discount_id: zod_1.default.string().uuid("Invalid flash discount ID").optional().nullable(),
        tax_id: zod_1.default.string().uuid("Invalid tax ID").optional().nullable(),
        warrantly_id: zod_1.default.string().uuid("Invalid warranty ID").optional().nullable(),
        warrantly_note: zod_1.default.string().optional().nullable(),
        today_deal: zod_1.default.boolean().optional(),
        free_shipping: zod_1.default.boolean().optional(),
        shipping_days: zod_1.default.number().int().optional(),
        published: zod_1.default.boolean().optional(),
        image: zod_1.default.string().optional(),
        gallery: zod_1.default.array(zod_1.default.string()).optional().nullable(),
        product_values: zod_1.default.array(exports.variantItemSchema).optional(),
    }),
});
exports.productIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Product ID is required" }).uuid("Invalid product ID"),
    }),
});
