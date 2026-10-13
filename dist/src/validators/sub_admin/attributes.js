"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueIdParamSchema = exports.updateValueSchema = exports.createValueSchema = exports.attributeIdParamSchema = exports.updateAttributeSchema = exports.createAttributeSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const multilingualNameSchema = zod_1.default
    .record(zod_1.default.string(), zod_1.default.string({ required_error: "Language translation must be a string" }))
    .refine((obj) => Object.keys(obj).length > 0 && Object.values(obj).some((v) => v.trim().length > 0), { message: "At least one language is required for name" });
exports.createAttributeSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: multilingualNameSchema,
        values: zod_1.default
            .array(zod_1.default.object({
            name: multilingualNameSchema,
        }))
            .optional(),
    }),
});
exports.updateAttributeSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Attribute ID is required" }).min(1, "Attribute ID is required"),
    }),
    body: zod_1.default.object({
        name: multilingualNameSchema.optional(),
        values: zod_1.default
            .array(zod_1.default.object({
            id: zod_1.default.string().optional(),
            name: multilingualNameSchema,
        }))
            .optional(),
    }),
});
exports.attributeIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Attribute ID is required" }).min(1, "Attribute ID is required"),
    }),
});
exports.createValueSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Attribute ID is required" }).min(1, "Attribute ID is required"),
    }),
    body: zod_1.default.object({
        name: multilingualNameSchema,
    }),
});
exports.updateValueSchema = zod_1.default.object({
    params: zod_1.default.object({
        valueId: zod_1.default.string({ required_error: "Value ID is required" }).min(1, "Value ID is required"),
    }),
    body: zod_1.default.object({
        name: multilingualNameSchema,
    }),
});
exports.valueIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        valueId: zod_1.default.string({ required_error: "Value ID is required" }).min(1, "Value ID is required"),
    }),
});
