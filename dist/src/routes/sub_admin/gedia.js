"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gedia_1 = require("../../controllers/sub_admin/gedia");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const gedia_2 = require("../../validators/sub_admin/gedia");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// 1. View Gedia Configuration
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(gedia_1.getGedia));
// 2. Create or Update Gedia Configuration (Supports POST and PUT)
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(gedia_2.createUpdateGediaSchema), (0, catchAsync_1.catchAsync)(gedia_1.createOrUpdateGedia));
router.put("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(gedia_2.createUpdateGediaSchema), (0, catchAsync_1.catchAsync)(gedia_1.createOrUpdateGedia));
exports.default = router;
