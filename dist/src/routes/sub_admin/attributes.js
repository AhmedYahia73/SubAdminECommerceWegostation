"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attributes_1 = require("../../controllers/sub_admin/attributes");
const catchAsync_1 = require("../../utils/catchAsync");
const validation_1 = require("../../middlewares/validation");
const checkpermission_1 = require("../../middlewares/checkpermission");
const attributes_2 = require("../../validators/sub_admin/attributes");
const common_1 = require("../../validators/sub_admin/common");
const router = (0, express_1.Router)();
// Bulk operations (MUST precede /:id)
router.post("/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(attributes_1.bulkDeleteAttributes));
router.delete("/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(attributes_1.bulkDeleteAttributes));
// Value Bulk operations
router.post("/values/bulk-delete", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(attributes_1.bulkDeleteValues));
router.delete("/values/bulk", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(common_1.bulkDeleteSchema), (0, catchAsync_1.catchAsync)(attributes_1.bulkDeleteValues));
// Individual Value operations
router.put("/values/:valueId", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.updateValueSchema), (0, catchAsync_1.catchAsync)(attributes_1.updateValue));
router.delete("/values/:valueId", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.valueIdParamSchema), (0, catchAsync_1.catchAsync)(attributes_1.deleteValue));
// Attribute list & selection
router.get("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(attributes_1.getAllAttributes));
router.get("/select", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(attributes_1.getAttributesSelection));
router.get("/lists", (0, checkpermission_1.checkOnlyAdmin)(), (0, catchAsync_1.catchAsync)(attributes_1.getAttributesSelection));
// Attribute CRUD
router.get("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.attributeIdParamSchema), (0, catchAsync_1.catchAsync)(attributes_1.getAttributeById));
router.post("/", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.createAttributeSchema), (0, catchAsync_1.catchAsync)(attributes_1.createAttribute));
router.put("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.updateAttributeSchema), (0, catchAsync_1.catchAsync)(attributes_1.updateAttribute));
router.delete("/:id", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.attributeIdParamSchema), (0, catchAsync_1.catchAsync)(attributes_1.deleteAttribute));
// Add value to specific attribute
router.post("/:id/values", (0, checkpermission_1.checkOnlyAdmin)(), (0, validation_1.validate)(attributes_2.createValueSchema), (0, catchAsync_1.catchAsync)(attributes_1.addValueToAttribute));
exports.default = router;
