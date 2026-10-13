"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdateKashierSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const multilingualNameSchema = zod_1.default.union([
    zod_1.default.string().min(1, "Name is required").transform((val) => ({ en: val, ar: val })),
    zod_1.default.record(zod_1.default.string(), zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj).some((v) => v.trim().length > 0), { message: "At least one language is required for name" }),
]);
exports.createUpdateKashierSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: multilingualNameSchema,
        logo: zod_1.default.string().min(1).optional(),
        api_key: zod_1.default.string({ required_error: "API key is required" }).min(1, "API key is required"),
        secret_key: zod_1.default.string({ required_error: "Secret key is required" }).min(1, "Secret key is required"),
        merchant_id: zod_1.default.string().min(1).optional(),
        merchent_id: zod_1.default.string().min(1).optional(),
        status: zod_1.default
            .preprocess((val) => (typeof val === "string" ? val === "true" || val === "1" : val), zod_1.default.boolean())
            .default(true),
    }).refine((data) => data.merchant_id || data.merchent_id, {
        message: "merchant_id (or merchent_id) is required",
        path: ["merchant_id"],
    }),
});
