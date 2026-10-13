"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const popups_1 = require("../../controllers/sub_admin/popups");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const popups_2 = require("../../validators/sub_admin/popups");
const common_1 = require("../../validators/sub_admin/common");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// Bulk delete operations (MUST precede /:id)
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(popups_1.bulkDeletePopups));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(popups_1.bulkDeletePopups));
// Query operations
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(popups_1.getAllPopups));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(popups_1.getPopupsSelection));
// CRUD operations
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(popups_2.popupIdParamSchema), (0, catchAsync_1.catchAsync)(popups_1.getPopupById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadMultipleImages)("image", 10), (0, validation_1.validate)(popups_2.createPopupSchema), (0, catchAsync_1.catchAsync)(popups_1.createPopup));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadMultipleImages)("image", 10), (0, validation_1.validate)(popups_2.updatePopupSchema), (0, catchAsync_1.catchAsync)(popups_1.updatePopup));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(popups_2.popupIdParamSchema), (0, catchAsync_1.catchAsync)(popups_1.deletePopup));
exports.default = router;
