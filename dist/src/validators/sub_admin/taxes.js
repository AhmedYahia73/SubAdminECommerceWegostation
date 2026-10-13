"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taxIdParamSchema = exports.updateTaxSchema = exports.createTaxSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createTaxSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, {
            message: "At least the primary language name is required",
        }),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]),
        type: zod_1.default.enum(["percentage", "value"]),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.updateTaxSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Tax ID is required" }).uuid("Invalid tax ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).optional(),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]).optional(),
        type: zod_1.default.enum(["percentage", "value"]).optional(),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.taxIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Tax ID is required" }).uuid("Invalid tax ID"),
    }),
});
