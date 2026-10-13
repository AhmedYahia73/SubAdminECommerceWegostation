"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryIdParamSchema = exports.updateCategorySchema = exports.createCategorySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCategorySchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, {
            message: "At least the primary language name is required",
        }),
        category_id: zod_1.default.string().uuid().optional().nullable(),
        order_number: zod_1.default.number().int().optional(),
        banner: zod_1.default.string().optional().nullable(),
        icon: zod_1.default.string().optional().nullable(),
        cover_image: zod_1.default.string().optional().nullable(),
    }),
});
exports.updateCategorySchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Category ID is required" }).uuid("Invalid category ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).optional(),
        category_id: zod_1.default.string().uuid().optional().nullable(),
        order_number: zod_1.default.number().int().optional(),
        banner: zod_1.default.string().optional().nullable(),
        icon: zod_1.default.string().optional().nullable(),
        cover_image: zod_1.default.string().optional().nullable(),
    }),
});
exports.categoryIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Category ID is required" }).uuid("Invalid category ID"),
    }),
});
