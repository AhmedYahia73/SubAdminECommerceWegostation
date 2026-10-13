"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.warrantyIdParamSchema = exports.updateWarrantySchema = exports.createWarrantySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createWarrantySchema = zod_1.default.object({
    body: zod_1.default.object({
        text: zod_1.default.record(zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj)[0]?.trim().length > 0, {
            message: "At least the primary language text is required",
        }),
        logo: zod_1.default.string().optional().nullable(),
        period: zod_1.default.string().optional().nullable(),
    }),
});
exports.updateWarrantySchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Warranty ID is required" }).uuid("Invalid warranty ID"),
    }),
    body: zod_1.default.object({
        text: zod_1.default.record(zod_1.default.string()).optional(),
        logo: zod_1.default.string().optional().nullable(),
        period: zod_1.default.string().optional().nullable(),
    }),
});
exports.warrantyIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Warranty ID is required" }).uuid("Invalid warranty ID"),
    }),
});
