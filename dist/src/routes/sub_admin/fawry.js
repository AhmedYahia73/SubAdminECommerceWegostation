"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fawry_1 = require("../../controllers/sub_admin/fawry");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const fawry_2 = require("../../validators/sub_admin/fawry");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// 1. View Fawry Configuration
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(fawry_1.getFawry));
// 2. Create or Update Fawry Configuration (Supports POST and PUT)
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(fawry_2.createUpdateFawrySchema), (0, catchAsync_1.catchAsync)(fawry_1.createOrUpdateFawry));
router.put("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(fawry_2.createUpdateFawrySchema), (0, catchAsync_1.catchAsync)(fawry_1.createOrUpdateFawry));
exports.default = router;
