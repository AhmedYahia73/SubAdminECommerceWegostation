"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymob_1 = require("../../controllers/sub_admin/paymob");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const paymob_2 = require("../../validators/sub_admin/paymob");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
// 1. View Paymob Configuration
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(paymob_1.getPaymob));
// 2. Create or Update Paymob Configuration (Supports POST and PUT)
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(paymob_2.createUpdatePaymobSchema), (0, catchAsync_1.catchAsync)(paymob_1.createOrUpdatePaymob));
router.put("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, upload_1.uploadSingleImage)("logo"), (0, validation_1.validate)(paymob_2.createUpdatePaymobSchema), (0, catchAsync_1.catchAsync)(paymob_1.createOrUpdatePaymob));
exports.default = router;
