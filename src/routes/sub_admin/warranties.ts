import { Router } from "express";
import {
  getAllWarranties,
  getWarrantiesSelection,
  getWarrantyById,
  createWarranty,
  updateWarranty,
  deleteWarranty,
} from "../../controllers/sub_admin/warranties";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createWarrantySchema,
  updateWarrantySchema,
  warrantyIdParamSchema,
} from "../../validators/sub_admin/warranties";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllWarranties));
router.get("/select", checkOnlyAdmin(), catchAsync(getWarrantiesSelection));
router.get("/:id", checkOnlyAdmin(), validate(warrantyIdParamSchema), catchAsync(getWarrantyById));
router.post("/", checkOnlyAdmin(), validate(createWarrantySchema), catchAsync(createWarranty));
router.put("/:id", checkOnlyAdmin(), validate(updateWarrantySchema), catchAsync(updateWarranty));
router.delete("/:id", checkOnlyAdmin(), validate(warrantyIdParamSchema), catchAsync(deleteWarranty));

export default router;
