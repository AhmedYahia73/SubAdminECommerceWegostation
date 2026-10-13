"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = require("../../controllers/sub_admin/products");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const products_2 = require("../../validators/sub_admin/products");
const common_1 = require("../../validators/sub_admin/common");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
const productUpload = (0, upload_1.uploadFieldsImages)([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
]);
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(products_1.bulkDeleteProducts));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(products_1.bulkDeleteProducts));
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(products_1.getAllProducts));
router.get("/lists", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(products_1.getProductLists));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(products_1.getProductsSelection));
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(products_2.productIdParamSchema), (0, catchAsync_1.catchAsync)(products_1.getProductById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), productUpload, (0, validation_1.validate)(products_2.createProductSchema), (0, catchAsync_1.catchAsync)(products_1.createProduct));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), productUpload, (0, validation_1.validate)(products_2.updateProductSchema), (0, catchAsync_1.catchAsync)(products_1.updateProduct));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(products_2.productIdParamSchema), (0, catchAsync_1.catchAsync)(products_1.deleteProduct));
exports.default = router;
