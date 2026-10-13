"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.staffIdParamSchema = exports.updateStaffSchema = exports.createStaffSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createStaffSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Name is required" }).min(1, "Name is required"),
        email: zod_1.default.string({ required_error: "Email is required" }).email("Invalid email"),
        phone: zod_1.default.string({ required_error: "Phone is required" }).min(1, "Phone is required"),
        password: zod_1.default.string({ required_error: "Password is required" }).min(6, "Password must be at least 6 characters long"),
        role_id: zod_1.default.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
    }),
});
exports.updateStaffSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Staff ID is required" }).uuid("Invalid staff ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1).optional(),
        email: zod_1.default.string().email("Invalid email").optional(),
        phone: zod_1.default.string().min(1).optional(),
        password: zod_1.default.string().min(6).optional(),
        role_id: zod_1.default.string().uuid().optional(),
    }),
});
exports.staffIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Staff ID is required" }).uuid("Invalid staff ID"),
    }),
});
