"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zoneIdParamSchema = exports.updateZoneSchema = exports.createZoneSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createZoneSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.array(zod_1.default.string()).min(1, "At least one zone name is required"),
        city_id: zod_1.default.string({ required_error: "City ID is required" }).uuid("Invalid city ID"),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.updateZoneSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Zone ID is required" }).uuid("Invalid zone ID"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.array(zod_1.default.string()).min(1).optional(),
        city_id: zod_1.default.string().uuid().optional(),
        status: zod_1.default.boolean().optional(),
    }),
});
exports.zoneIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Zone ID is required" }).uuid("Invalid zone ID"),
    }),
});
