"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLoginSchema = exports.adminIdParamSchema = exports.updateAdminSchema = exports.createAdminSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createAdminSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Admin name is required" }).min(1, "Admin name is required"),
        email: zod_1.default.string({ required_error: "Email is required" }).email("Invalid email format"),
        phone: zod_1.default.string({ required_error: "Phone is required" }).min(1, "Phone is required"),
        password: zod_1.default
            .string({ required_error: "Password is required" })
            .min(6, "Password must be at least 6 characters long"),
        role_id: zod_1.default.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
        status: zod_1.default.boolean().optional().default(true),
    }),
});
exports.updateAdminSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Admin ID is required" }).uuid("Invalid admin ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1, "Name cannot be empty").optional(),
        email: zod_1.default.string().email("Invalid email format").optional(),
        phone: zod_1.default.string().min(1, "Phone cannot be empty").optional(),
        password: zod_1.default.string().min(6, "Password must be at least 6 characters long").optional(),
        role_id: zod_1.default.string().uuid("Invalid role ID").optional(),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.adminIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Admin ID is required" }).uuid("Invalid admin ID"),
    }),
});
exports.adminLoginSchema = zod_1.default.object({
    body: zod_1.default.object({
        email: zod_1.default.string({ required_error: "Email is required" }).email("Invalid email format"),
        password: zod_1.default.string({ required_error: "Password is required" }).min(1, "Password is required"),
    }),
});
