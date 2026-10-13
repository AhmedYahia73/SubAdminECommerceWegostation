"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tenantDb_1 = require("../models/tenantDb");
const paymentCallbacks_1 = require("../controllers/callbacks/paymentCallbacks");
const catchAsync_1 = require("../utils/catchAsync");
const router = (0, express_1.Router)();
// Resolve tenant wildcard schema based on subdomain
router.use(tenantDb_1.tenantMiddleware);
// 1. Geidea Callback
router.post("/gedia_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.gediaCallback));
router.get("/gedia_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.gediaCallback));
// 2. Paymob Callback
router.post("/paymob_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.paymobCallback));
router.get("/paymob_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.paymobCallback));
// 3. Kashier Callback
router.post("/kashier_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.kashierCallback));
router.get("/kashier_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.kashierCallback));
// 4. Fawry Callback
router.post("/fawry_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.fawryCallback));
router.get("/fawry_callback", (0, catchAsync_1.catchAsync)(paymentCallbacks_1.fawryCallback));
exports.default = router;
