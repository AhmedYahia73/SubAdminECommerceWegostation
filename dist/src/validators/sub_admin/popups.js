"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.popupIdParamSchema = exports.updatePopupSchema = exports.createPopupSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const multilingualNameSchema = zod_1.default
    .record(zod_1.default.string(), zod_1.default.string({ required_error: "Language translation must be a string" }))
    .refine((obj) => Object.keys(obj).length > 0 && Object.values(obj).some((v) => v.trim().length > 0), { message: "At least one language is required for name" });
const optionalMultilingualSchema = zod_1.default
    .record(zod_1.default.string(), zod_1.default.string())
    .optional()
    .nullable();
exports.createPopupSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: multilingualNameSchema,
        image: zod_1.default
            .array(zod_1.default.string().min(1, "Image string cannot be empty"), {
            required_error: "At least one image is required",
        })
            .min(1, "At least one image is required"),
        link: zod_1.default.string().max(500, "Link cannot exceed 500 characters").optional().nullable(),
        description: optionalMultilingualSchema,
    }),
});
exports.updatePopupSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Popup ID is required" }).min(1, "Popup ID is required"),
    }),
    body: zod_1.default.object({
        name: multilingualNameSchema.optional(),
        image: zod_1.default
            .array(zod_1.default.string().min(1, "Image string cannot be empty"))
            .min(1, "Image array cannot be empty")
            .optional(),
        link: zod_1.default.string().max(500, "Link cannot exceed 500 characters").optional().nullable(),
        description: optionalMultilingualSchema,
    }),
});
exports.popupIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Popup ID is required" }).min(1, "Popup ID is required"),
    }),
});
