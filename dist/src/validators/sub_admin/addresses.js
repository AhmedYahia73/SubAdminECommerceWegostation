"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressIdParamSchema = exports.updateAddressSchema = exports.createAddressSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createAddressSchema = zod_1.default.object({
    body: zod_1.default.object({
        customer_id: zod_1.default.string({ required_error: "Customer ID is required" }).uuid("Invalid customer ID"),
        city_id: zod_1.default.string({ required_error: "City ID is required" }).uuid("Invalid city ID"),
        zone_id: zod_1.default.string({ required_error: "Zone ID is required" }).uuid("Invalid zone ID"),
        building_num: zod_1.default.string().optional().nullable(),
        floor: zod_1.default.string().optional().nullable(),
        address: zod_1.default.string({ required_error: "Address is required" }).min(1, "Address is required"),
        street: zod_1.default.string().optional().nullable(),
        additional_data: zod_1.default.string().optional().nullable(),
        lat: zod_1.default.union([zod_1.default.number(), zod_1.default.string()]).optional().nullable(),
        lng: zod_1.default.union([zod_1.default.number(), zod_1.default.string()]).optional().nullable(),
    }),
});
exports.updateAddressSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Address ID is required" }).uuid("Invalid address ID"),
    }),
    body: zod_1.default.object({
        customer_id: zod_1.default.string().uuid().optional(),
        city_id: zod_1.default.string().uuid().optional(),
        zone_id: zod_1.default.string().uuid().optional(),
        building_num: zod_1.default.string().optional().nullable(),
        floor: zod_1.default.string().optional().nullable(),
        address: zod_1.default.string().min(1).optional(),
        street: zod_1.default.string().optional().nullable(),
        additional_data: zod_1.default.string().optional().nullable(),
        lat: zod_1.default.union([zod_1.default.number(), zod_1.default.string()]).optional().nullable(),
        lng: zod_1.default.union([zod_1.default.number(), zod_1.default.string()]).optional().nullable(),
    }),
});
exports.addressIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Address ID is required" }).uuid("Invalid address ID"),
    }),
});
