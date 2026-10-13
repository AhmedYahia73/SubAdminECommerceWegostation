import { Router } from "express";
import subAdminRoute from "./sub_admin";

const route = Router();

// Mount SubAdmin multi-tenancy routes
route.use("/sub_admin", subAdminRoute);

export default route;
