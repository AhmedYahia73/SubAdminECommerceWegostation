"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admins_1 = require("../../controllers/sub_admin/admins");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const admins_2 = require("../../validators/sub_admin/admins");
const common_1 = require("../../validators/sub_admin/common");
const router = (0, express_1.Router)();
// Public: Admin Login on tenant subdomain
router.post("/login", (0, validation_1.validate)(admins_2.adminLoginSchema), (0, catchAsync_1.catchAsync)(admins_1.loginTenantAdmin));
// Bulk delete operations (MUST precede /:id)
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(admins_1.bulkDeleteAdmins));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(admins_1.bulkDeleteAdmins));
// Query operations
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(admins_1.getAllAdmins));
router.get("/lists", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(admins_1.getAdminsLists));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(admins_1.getAdminsSelection));
// CRUD operations
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(admins_2.adminIdParamSchema), (0, catchAsync_1.catchAsync)(admins_1.getAdminById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(admins_2.createAdminSchema), (0, catchAsync_1.catchAsync)(admins_1.createAdmin));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(admins_2.updateAdminSchema), (0, catchAsync_1.catchAsync)(admins_1.updateAdmin));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(admins_2.adminIdParamSchema), (0, catchAsync_1.catchAsync)(admins_1.deleteAdmin));
exports.default = router;
