"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountIdParamSchema = exports.updateDiscountSchema = exports.createDiscountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createDiscountSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, {
            message: "At least the primary language name is required",
        }),
        type: zod_1.default.enum(["percentage", "value"]),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.updateDiscountSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Discount ID is required" }).uuid("Invalid discount ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).optional(),
        type: zod_1.default.enum(["percentage", "value"]).optional(),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]).optional(),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.discountIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Discount ID is required" }).uuid("Invalid discount ID"),
    }),
});
