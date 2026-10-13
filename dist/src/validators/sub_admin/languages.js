"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.languageIdParamSchema = exports.updateLanguageSchema = exports.createLanguageSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createLanguageSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Name is required" }).min(1, "Name is required"),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.updateLanguageSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Language ID is required" }).uuid("Invalid language ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1, "Name cannot be empty").optional(),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.languageIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Language ID is required" }).uuid("Invalid language ID"),
    }),
});
