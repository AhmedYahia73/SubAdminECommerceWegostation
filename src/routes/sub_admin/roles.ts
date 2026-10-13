import { Router } from "express";
import {
  getAllRoles,
  getRolesSelection,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  bulkDeleteRoles,
} from "../../controllers/sub_admin/roles";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createRoleSchema,
  updateRoleSchema,
  roleIdParamSchema,
} from "../../validators/sub_admin/roles";
import { bulkDeleteSchema } from "../../validators/sub_admin/common";

const router = Router();

router.post("/bulk-delete", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteRoles));
router.delete("/bulk", checkOnlyAdmin(), validate(bulkDeleteSchema), catchAsync(bulkDeleteRoles));

router.get("/", checkOnlyAdmin(), catchAsync(getAllRoles));
router.get("/select", checkOnlyAdmin(), catchAsync(getRolesSelection));
router.get("/:id", checkOnlyAdmin(), validate(roleIdParamSchema), catchAsync(getRoleById));
router.post("/", checkOnlyAdmin(), validate(createRoleSchema), catchAsync(createRole));
router.put("/:id", checkOnlyAdmin(), validate(updateRoleSchema), catchAsync(updateRole));
router.delete("/:id", checkOnlyAdmin(), validate(roleIdParamSchema), catchAsync(deleteRole));

export default router;
