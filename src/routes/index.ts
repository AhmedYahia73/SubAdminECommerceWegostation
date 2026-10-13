import { Router } from "express";
import subAdminRoute from "./sub_admin";
import uploadRoute from "./upload";

const route = Router();

// Dedicated form-data upload routes
route.use("/upload", uploadRoute);

// Mount SubAdmin multi-tenancy routes
route.use("/sub_admin", subAdminRoute);

export default route;