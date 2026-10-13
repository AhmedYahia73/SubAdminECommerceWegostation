import { Router } from "express";
import {
  getAllCategories,
  getCategoriesSelection,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
} from "../../controllers/sub_admin/categories";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
} from "../../validators/sub_admin/categories";
import { bulkDeleteSchema } from "../../validators/sub_admin/common";

const router = Router();

router.post("/bulk-delete", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteCategories));
router.delete("/bulk", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteCategories));

router.get("/", checkOnlyAdmin(), catchAsync(getAllCategories));
router.get("/select", checkOnlyAdmin(), catchAsync(getCategoriesSelection));
router.get("/:id", checkOnlyAdmin(), validate(categoryIdParamSchema), catchAsync(getCategoryById));
router.post("/", checkOnlyAdmin(), validate(createCategorySchema), catchAsync(createCategory));
router.put("/:id", checkOnlyAdmin(), validate(updateCategorySchema), catchAsync(updateCategory));
router.delete("/:id", checkOnlyAdmin(), validate(categoryIdParamSchema), catchAsync(deleteCategory));

export default router;
