import { Router } from "express";
import {
  getAllProducts,
  getProductLists,
  getProductsSelection,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../../controllers/sub_admin/products";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
} from "../../validators/sub_admin/products";
import { bulkDeleteSchema } from "../../validators/sub_admin/common";

const router = Router();

router.post("/bulk-delete", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteProducts));
router.delete("/bulk", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteProducts));

router.get("/", checkOnlyAdmin(), catchAsync(getAllProducts));
router.get("/lists", checkOnlyAdmin(), catchAsync(getProductLists));
router.get("/select", checkOnlyAdmin(), catchAsync(getProductsSelection));
router.get("/:id", checkOnlyAdmin(), validate(productIdParamSchema), catchAsync(getProductById));
router.post("/", checkOnlyAdmin(), validate(createProductSchema), catchAsync(createProduct));
router.put("/:id", checkOnlyAdmin(), validate(updateProductSchema), catchAsync(updateProduct));
router.delete("/:id", checkOnlyAdmin(), validate(productIdParamSchema), catchAsync(deleteProduct));

export default router;
