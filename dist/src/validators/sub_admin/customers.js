"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerIdParamSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createCustomerSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Name is required" }).min(1, "Name is required"),
        phone: zod_1.default.string({ required_error: "Phone is required" }).min(1, "Phone is required"),
        email: zod_1.default.string({ required_error: "Email is required" }).email("Invalid email"),
        order_num: zod_1.default.number().int().optional(),
        order_sum: zod_1.default.number().int().optional(),
        image: zod_1.default.string().optional().nullable(),
        password: zod_1.default.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters long"),
    }),
});
exports.updateCustomerSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Customer ID is required" }).uuid("Invalid customer ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1).optional(),
        phone: zod_1.default.string().min(1).optional(),
        email: zod_1.default.string().email("Invalid email").optional(),
        order_num: zod_1.default.number().int().optional(),
        order_sum: zod_1.default.number().int().optional(),
        image: zod_1.default.string().optional().nullable(),
        password: zod_1.default.string().min(6).optional(),
    }),
});
exports.customerIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Customer ID is required" }).uuid("Invalid customer ID"),
    }),
});
