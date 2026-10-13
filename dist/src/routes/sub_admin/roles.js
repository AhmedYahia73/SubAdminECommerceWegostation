"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const roles_1 = require("../../controllers/sub_admin/roles");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const roles_2 = require("../../validators/sub_admin/roles");
const common_1 = require("../../validators/sub_admin/common");
const router = (0, express_1.Router)();
// Bulk delete operations (MUST precede /:id)
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(roles_1.bulkDeleteRoles));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(roles_1.bulkDeleteRoles));
// Individual Permission operations (MUST precede /:id)
router.put("/permissions/:permissionId", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.updatePermissionSchema), (0, catchAsync_1.catchAsync)(roles_1.updatePermission));
router.delete("/permissions/:permissionId", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.permissionIdParamSchema), (0, catchAsync_1.catchAsync)(roles_1.deletePermission));
// Role queries & selection
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(roles_1.getAllRoles));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(roles_1.getRolesSelection));
// Role CRUD
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.roleIdParamSchema), (0, catchAsync_1.catchAsync)(roles_1.getRoleById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.createRoleSchema), (0, catchAsync_1.catchAsync)(roles_1.createRole));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.updateRoleSchema), (0, catchAsync_1.catchAsync)(roles_1.updateRole));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.roleIdParamSchema), (0, catchAsync_1.catchAsync)(roles_1.deleteRole));
// Add permission to specific role
router.post("/:id/permissions", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(roles_2.createPermissionSchema), (0, catchAsync_1.catchAsync)(roles_1.createPermission));
exports.default = router;
