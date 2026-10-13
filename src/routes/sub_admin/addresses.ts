import { Router } from "express";
import {
  getAllAddresses,
  getAddressLists,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../../controllers/sub_admin/addresses";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createAddressSchema,
  updateAddressSchema,
  addressIdParamSchema,
} from "../../validators/sub_admin/addresses";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllAddresses));
router.get("/lists", checkOnlyAdmin(), catchAsync(getAddressLists));
router.get("/:id", checkOnlyAdmin(), validate(addressIdParamSchema), catchAsync(getAddressById));
router.post("/", checkOnlyAdmin(), validate(createAddressSchema), catchAsync(createAddress));
router.put("/:id", checkOnlyAdmin(), validate(updateAddressSchema), catchAsync(updateAddress));
router.delete("/:id", checkOnlyAdmin(), validate(addressIdParamSchema), catchAsync(deleteAddress));

export default router;
