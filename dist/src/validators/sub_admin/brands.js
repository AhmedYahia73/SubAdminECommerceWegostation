"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandIdParamSchema = exports.updateBrandSchema = exports.createBrandSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createBrandSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Brand name is required" }).min(1, "Brand name is required"),
        logo: zod_1.default.string({ required_error: "Brand logo is required" }).min(1, "Brand logo is required"),
    }),
});
exports.updateBrandSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Brand ID is required" }).uuid("Invalid brand ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1, "Brand name cannot be empty").optional(),
        logo: zod_1.default.string().min(1).optional(),
    }),
});
exports.brandIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Brand ID is required" }).uuid("Invalid brand ID"),
    }),
});
