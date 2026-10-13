"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kashier_1 = require("../../controllers/sub_admin/kashier");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const kashier_2 = require("../../validators/sub_admin/kashier");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// 1. View Kashier Configuration
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(kashier_1.getKashier));
// 2. Create or Update Kashier Configuration (Supports POST and PUT)
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(kashier_2.createUpdateKashierSchema), (0, catchAsync_1.catchAsync)(kashier_1.createOrUpdateKashier));
router.put("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(kashier_2.createUpdateKashierSchema), (0, catchAsync_1.catchAsync)(kashier_1.createOrUpdateKashier));
exports.default = router;
