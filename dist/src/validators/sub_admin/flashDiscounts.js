"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flashDiscountIdParamSchema = exports.updateFlashDiscountSchema = exports.createFlashDiscountSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createFlashDiscountSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, {
            message: "At least the primary language name is required",
        }),
        type: zod_1.default.enum(["percentage", "value"]),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]),
        status: zod_1.default.boolean().optional(),
        start_date: zod_1.default.string().datetime({ message: "start_date must be an ISO date string" }),
        end_date: zod_1.default.string().datetime({ message: "end_date must be an ISO date string" }),
    }),
});
exports.updateFlashDiscountSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Flash discount ID is required" }).uuid("Invalid flash discount ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.record(zod_1.default.string()).optional(),
        type: zod_1.default.enum(["percentage", "value"]).optional(),
        amount: zod_1.default.union([zod_1.default.number(), zod_1.default.string().regex(/^\d+(\.\d{1,2})?$/)]).optional(),
        status: zod_1.default.boolean().optional(),
        start_date: zod_1.default.string().datetime().optional(),
        end_date: zod_1.default.string().datetime().optional(),
    }),
});
exports.flashDiscountIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Flash discount ID is required" }).uuid("Invalid flash discount ID"),
    }),
});
