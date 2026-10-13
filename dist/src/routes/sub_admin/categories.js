"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_1 = require("../../controllers/sub_admin/categories");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const categories_2 = require("../../validators/sub_admin/categories");
const common_1 = require("../../validators/sub_admin/common");
const upload_1 = require("../../middlewares/upload");
const router = (0, express_1.Router)();
const categoryUpload = (0, upload_1.uploadFieldsImages)([
    { name: "banner", maxCount: 1 },
    { name: "icon", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
]);
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(categories_1.bulkDeleteCategories));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(categories_1.bulkDeleteCategories));
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(categories_1.getAllCategories));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(categories_1.getCategoriesSelection));
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(categories_2.categoryIdParamSchema), (0, catchAsync_1.catchAsync)(categories_1.getCategoryById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), categoryUpload, (0, validation_1.validate)(categories_2.createCategorySchema), (0, catchAsync_1.catchAsync)(categories_1.createCategory));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), categoryUpload, (0, validation_1.validate)(categories_2.updateCategorySchema), (0, catchAsync_1.catchAsync)(categories_1.updateCategory));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(categories_2.categoryIdParamSchema), (0, catchAsync_1.catchAsync)(categories_1.deleteCategory));
exports.default = router;
