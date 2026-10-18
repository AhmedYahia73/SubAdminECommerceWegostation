"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginSchema = zod_1.default.object({
    body: zod_1.default
        .object({
        email: zod_1.default.string().email("Invalid email format").optional(),
        phone: zod_1.default.string().min(1, "Phone cannot be empty").optional(),
        identifier: zod_1.default.string().min(1, "Identifier cannot be empty").optional(),
        password: zod_1.default
            .string({ required_error: "Password is required" })
            .min(1, "Password is required"),
    })
        .refine((data) => data.email || data.phone || data.identifier, {
        message: "Either email, phone, or identifier is required",
        path: ["email"],
    }),
});
