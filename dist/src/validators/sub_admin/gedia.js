"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUpdateGediaSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const multilingualNameSchema = zod_1.default.union([
    zod_1.default.string().min(1, "Name is required").transform((val) => ({ en: val, ar: val })),
    zod_1.default.record(zod_1.default.string(), zod_1.default.string()).refine((obj) => Object.keys(obj).length > 0 && Object.values(obj).some((v) => v.trim().length > 0), { message: "At least one language is required for name" }),
]);
exports.createUpdateGediaSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: multilingualNameSchema,
        logo: zod_1.default.string().min(1).optional(),
        public_key: zod_1.default.string({ required_error: "Public key is required" }).min(1, "Public key is required"),
        api_password: zod_1.default.string({ required_error: "API password is required" }).min(1, "API password is required"),
        environment: zod_1.default.enum(["egypt", "saudi_arabia", "uae"], {
            required_error: "Environment must be egypt, saudi_arabia, or uae",
        }).default("egypt"),
        status: zod_1.default
            .preprocess((val) => (typeof val === "string" ? val === "true" || val === "1" : val), zod_1.default.boolean())
            .default(true),
    }),
});
