"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sub_admin_1 = __importDefault(require("./sub_admin"));
const upload_1 = __importDefault(require("./upload"));
const route = (0, express_1.Router)();
// Dedicated form-data upload routes
route.use("/upload", upload_1.default);
// Mount SubAdmin multi-tenancy routes
route.use("/sub_admin", sub_admin_1.default);
exports.default = route;
