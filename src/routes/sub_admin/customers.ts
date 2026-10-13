import { Router } from "express";
import {
  getAllCustomers,
  getCustomersSelection,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../controllers/sub_admin/customers";
import { catchAsync } from "../../utils/catchAsync";
import { validate } from "../../middlewares/validation";
import { checkOnlyAdmin } from "../../middlewares/checkpermission";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerIdParamSchema,
} from "../../validators/sub_admin/customers";

const router = Router();

router.get("/", checkOnlyAdmin(), catchAsync(getAllCustomers));
router.get("/select", checkOnlyAdmin(), catchAsync(getCustomersSelection));
router.get("/:id", checkOnlyAdmin(), validate(customerIdParamSchema), catchAsync(getCustomerById));
router.post("/", checkOnlyAdmin(), validate(createCustomerSchema), catchAsync(createCustomer));
router.put("/:id", checkOnlyAdmin(), validate(updateCustomerSchema), catchAsync(updateCustomer));
router.delete("/:id", checkOnlyAdmin(), validate(customerIdParamSchema), catchAsync(deleteCustomer));

export default router;
