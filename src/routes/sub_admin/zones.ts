import { Router } from "express";
import {
  getAllZones,
  getZoneLists,
  getZonesSelection,
  getZoneById,
  createZone,
  updateZone,
  deleteZone,
} from "../../controllers/sub_admin/zones";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createZoneSchema,
  updateZoneSchema,
  zoneIdParamSchema,
} from "../../validators/sub_admin/zones";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllZones));
router.get("/lists", checkOnlyAdmin(), catchAsync(getZoneLists));
router.get("/select", checkOnlyAdmin(), catchAsync(getZonesSelection));
router.get("/:id", checkOnlyAdmin(), validate(zoneIdParamSchema), catchAsync(getZoneById));
router.post("/", checkOnlyAdmin(), validate(createZoneSchema), catchAsync(createZone));
router.put("/:id", checkOnlyAdmin(), validate(updateZoneSchema), catchAsync(updateZone));
router.delete("/:id", checkOnlyAdmin(), validate(zoneIdParamSchema), catchAsync(deleteZone));

export default router;
