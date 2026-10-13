"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionIdParamSchema = exports.updatePermissionSchema = exports.createPermissionSchema = exports.roleIdParamSchema = exports.updateRoleSchema = exports.createRoleSchema = exports.permissionItemSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.permissionItemSchema = zod_1.default.object({
    id: zod_1.default.string().optional(),
    permission: zod_1.default.string({ required_error: "Permission name is required" }).min(1, "Permission name cannot be empty"),
    actions: zod_1.default
        .array(zod_1.default.string().min(1, "Action cannot be empty"), {
        required_error: "Actions array is required",
    })
        .min(1, "At least one action is required"),
});
exports.createRoleSchema = zod_1.default.object({
    body: zod_1.default.object({
        name: zod_1.default.string({ required_error: "Role name is required" }).min(1, "Role name is required"),
        permissions: zod_1.default.array(exports.permissionItemSchema).optional(),
    }),
});
exports.updateRoleSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Role ID is required" }).min(1, "Role ID is required"),
    }),
    body: zod_1.default.object({
        name: zod_1.default.string().min(1, "Role name cannot be empty").optional(),
        permissions: zod_1.default.array(exports.permissionItemSchema).optional(),
    }),
});
exports.roleIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Role ID is required" }).min(1, "Role ID is required"),
    }),
});
exports.createPermissionSchema = zod_1.default.object({
    params: zod_1.default.object({
        id: zod_1.default.string({ required_error: "Role ID is required" }).min(1, "Role ID is required"),
    }),
    body: zod_1.default.object({
        permission: zod_1.default.string({ required_error: "Permission name is required" }).min(1, "Permission name cannot be empty"),
        actions: zod_1.default
            .array(zod_1.default.string().min(1, "Action cannot be empty"), {
            required_error: "Actions array is required",
        })
            .min(1, "At least one action is required"),
    }),
});
exports.updatePermissionSchema = zod_1.default.object({
    params: zod_1.default.object({
        permissionId: zod_1.default.string({ required_error: "Permission ID is required" }).min(1, "Permission ID is required"),
    }),
    body: zod_1.default.object({
        permission: zod_1.default.string().min(1, "Permission name cannot be empty").optional(),
        actions: zod_1.default
            .array(zod_1.default.string().min(1, "Action cannot be empty"))
            .min(1, "At least one action is required")
            .optional(),
    }),
});
exports.permissionIdParamSchema = zod_1.default.object({
    params: zod_1.default.object({
        permissionId: zod_1.default.string({ required_error: "Permission ID is required" }).min(1, "Permission ID is required"),
    }),
});
