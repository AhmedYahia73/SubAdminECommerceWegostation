import { Router } from "express";
import {
  getAllRoles,
  getRolesSelection,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "../../controllers/sub_admin/roles";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
} from "../../validators/sub_admin/roles";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllRoles));
router.get("/select", checkOnlyAdmin(), catchAsync(getRolesSelection));
router.get("/:id", checkOnlyAdmin(), validate(roleIdParamSchema), catchAsync(getRoleById));
router.post("/", checkOnlyAdmin(), validate(createRoleSchema), catchAsync(createRole));
router.put("/:id", checkOnlyAdmin(), validate(updateRoleSchema), catchAsync(updateRole));
router.delete("/:id", checkOnlyAdmin(), validate(roleIdParamSchema), catchAsync(deleteRole));

export default router;
