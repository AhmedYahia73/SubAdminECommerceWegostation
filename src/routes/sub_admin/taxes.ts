import { Router } from "express";
import {
  getAllTaxes,
  getTaxesSelection,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
} from "../../controllers/sub_admin/taxes";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createTaxSchema,
  updateTaxSchema,
  taxIdParamSchema,
} from "../../validators/sub_admin/taxes";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllTaxes));
router.get("/select", checkOnlyAdmin(), catchAsync(getTaxesSelection));
router.get("/:id", checkOnlyAdmin(), validate(taxIdParamSchema), catchAsync(getTaxById));
router.post("/", checkOnlyAdmin(), validate(createTaxSchema), catchAsync(createTax));
router.put("/:id", checkOnlyAdmin(), validate(updateTaxSchema), catchAsync(updateTax));
router.delete("/:id", checkOnlyAdmin(), validate(taxIdParamSchema), catchAsync(deleteTax));

export default router;
