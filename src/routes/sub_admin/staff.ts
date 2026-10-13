import { Router } from "express";
import {
  getAllStaff,
  getStaffLists,
  getStaffSelection,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../controllers/sub_admin/staff";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createStaffSchema,
  updateStaffSchema,
  staffIdParamSchema,
} from "../../validators/sub_admin/staff";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllStaff));
router.get("/lists", checkOnlyAdmin(), catchAsync(getStaffLists));
router.get("/select", checkOnlyAdmin(), catchAsync(getStaffSelection));
router.get("/:id", checkOnlyAdmin(), validate(staffIdParamSchema), catchAsync(getStaffById));
router.post("/", checkOnlyAdmin(), validate(createStaffSchema), catchAsync(createStaff));
router.put("/:id", checkOnlyAdmin(), validate(updateStaffSchema), catchAsync(updateStaff));
router.delete("/:id", checkOnlyAdmin(), validate(staffIdParamSchema), catchAsync(deleteStaff));

export default router;
