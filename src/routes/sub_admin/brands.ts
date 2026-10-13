import { Router } from "express";
import {
  getAllBrands,
  getBrandsSelection,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
} from "../../controllers/sub_admin/brands";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createBrandSchema,
  updateBrandSchema,
  brandIdParamSchema,
} from "../../validators/sub_admin/brands";
import { bulkDeleteSchema } from "../../validators/sub_admin/common";

const router = Router();

router.post("/bulk-delete", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteBrands));
router.delete("/bulk", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteBrands));

router.get("/", checkOnlyAdmin(), catchAsync(getAllBrands));
router.get("/select", checkOnlyAdmin(), catchAsync(getBrandsSelection));
router.get("/:id", checkOnlyAdmin(), validate(brandIdParamSchema), catchAsync(getBrandById));
router.post("/", checkOnlyAdmin(), validate(createBrandSchema), catchAsync(createBrand));
router.put("/:id", checkOnlyAdmin(), validate(updateBrandSchema), catchAsync(updateBrand));
router.delete("/:id", checkOnlyAdmin(), validate(brandIdParamSchema), catchAsync(deleteBrand));

export default router;
