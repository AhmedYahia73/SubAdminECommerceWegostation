"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sub_admin_1 = __importDefault(require("./sub_admin"));
const upload_1 = __importDefault(require("./upload"));
const callbacks_1 = __importDefault(require("./callbacks"));
const route = (0, express_1.Router)();
// Payment gateway callbacks (e.g. /api/gedia_callback, /api/paymob_callback, etc.)
route.use("/", callbacks_1.default);
// Dedicated form-data upload routes
route.use("/upload", upload_1.default);
// Mount SubAdmin multi-tenancy routes
route.use("/sub_admin", sub_admin_1.default);
exports.default = route;
