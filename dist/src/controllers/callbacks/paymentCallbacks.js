"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gediaCallback = gediaCallback;
exports.paymobCallback = paymobCallback;
exports.kashierCallback = kashierCallback;
exports.fawryCallback = fawryCallback;
const crypto_1 = __importDefault(require("crypto"));
const schema_1 = require("../../models/schema");
const response_1 = require("../../utils/response");
// 1. Geidea Callback Handler (POST & GET)
async function gediaCallback(req, res) {
    const db = req.db;
    const payload = { ...req.query, ...req.body };
    // Fetch tenant Geidea settings
    const config = db ? await db.select().from(schema_1.gedia).limit(1) : [];
    const gediaSettings = config[0] || null;
    console.log(`[Geidea Callback - Subdomain: ${req.subdomain}] Received:`, payload);
    return (0, response_1.SuccessResponse)(res, {
        gateway: "gedia",
        subdomain: req.subdomain,
        received: true,
        order_id: payload.orderId || payload.merchantReferenceId || null,
        status: payload.status || payload.orderStatus || "SUCCESS",
        configured: Boolean(gediaSettings),
        data: payload,
    }, 200);
}
// 2. Paymob Callback Handler (POST & GET)
async function paymobCallback(req, res) {
    const db = req.db;
    const queryHmac = req.query.hmac || "";
    const bodyHmac = req.body?.hmac || req.body?.obj?.hmac || "";
    const receivedHmac = queryHmac || bodyHmac;
    // Fetch tenant Paymob settings
    const config = db ? await db.select().from(schema_1.paymob).limit(1) : [];
    const paymobSettings = config[0] || null;
    let isValidHmac = false;
    if (paymobSettings?.hmac && req.body?.obj) {
        const obj = req.body.obj;
        // Paymob concatenation order for HMAC SHA512
        const concatenatedString = [
            obj.amount_cents,
            obj.created_at,
            obj.currency,
            obj.error_occured,
            obj.has_parent_transaction,
            obj.id,
            obj.integration_id,
            obj.is_3d_secure,
            obj.is_auth,
            obj.is_capture,
            obj.is_refunded,
            obj.is_standalone_payment,
            obj.is_voided,
            obj.order?.id,
            obj.owner,
            obj.pending,
            obj.source_data?.pan,
            obj.source_data?.sub_type,
            obj.source_data?.type,
            obj.success,
        ].join("");
        const calculatedHmac = crypto_1.default
            .createHmac("sha512", paymobSettings.hmac)
            .update(concatenatedString)
            .digest("hex");
        isValidHmac = calculatedHmac.toLowerCase() === receivedHmac.toLowerCase();
    }
    console.log(`[Paymob Callback - Subdomain: ${req.subdomain}] Verified: ${isValidHmac}`);
    const transactionData = req.body?.obj || req.body || req.query;
    return (0, response_1.SuccessResponse)(res, {
        gateway: "paymob",
        subdomain: req.subdomain,
        received: true,
        verified: isValidHmac,
        transaction_id: transactionData.id || null,
        success: transactionData.success ?? null,
        order_id: transactionData.order?.id || transactionData.order_id || null,
        data: transactionData,
    }, 200);
}
// 3. Kashier Callback Handler (POST & GET)
async function kashierCallback(req, res) {
    const db = req.db;
    const payload = { ...req.query, ...req.body };
    // Fetch tenant Kashier settings
    const config = db ? await db.select().from(schema_1.kashier).limit(1) : [];
    const kashierSettings = config[0] || null;
    let isValidSignature = false;
    if (kashierSettings?.secret_key && payload.signature) {
        // Generate signature from query parameters (excluding signature and mode)
        const keys = Object.keys(payload)
            .filter((k) => k !== "signature" && k !== "mode")
            .sort();
        const queryString = keys.map((k) => `${k}=${payload[k]}`).join("&");
        const calculatedSignature = crypto_1.default
            .createHmac("sha256", kashierSettings.secret_key)
            .update(queryString)
            .digest("hex");
        isValidSignature =
            calculatedSignature.toLowerCase() === String(payload.signature).toLowerCase();
    }
    console.log(`[Kashier Callback - Subdomain: ${req.subdomain}] Verified: ${isValidSignature}`);
    return (0, response_1.SuccessResponse)(res, {
        gateway: "kashier",
        subdomain: req.subdomain,
        received: true,
        verified: isValidSignature,
        order_id: payload.orderId || payload.merchantOrderId || null,
        payment_status: payload.paymentStatus || payload.status || null,
        data: payload,
    }, 200);
}
// 4. Fawry Callback Handler (POST & GET)
async function fawryCallback(req, res) {
    const db = req.db;
    const payload = { ...req.query, ...req.body };
    // Fetch tenant Fawry settings
    const config = db ? await db.select().from(schema_1.fawry).limit(1) : [];
    const fawrySettings = config[0] || null;
    let isValidSignature = false;
    const fawryRefNumber = payload.fawryRefNumber || "";
    const merchantRefNumber = payload.merchantRefNumber || payload.merchantRefNum || "";
    const paymentAmount = payload.paymentAmount ? Number(payload.paymentAmount).toFixed(2) : "";
    const orderAmount = payload.orderAmount ? Number(payload.orderAmount).toFixed(2) : "";
    const orderStatus = payload.orderStatus || "";
    const paymentMethod = payload.paymentMethod || "";
    const additionalAmount = payload.additionalAmount ? Number(payload.additionalAmount).toFixed(2) : "";
    const messageSignature = payload.messageSignature || "";
    if (fawrySettings?.merchant_secret_key && messageSignature) {
        const rawString = fawryRefNumber +
            merchantRefNumber +
            paymentAmount +
            orderAmount +
            orderStatus +
            paymentMethod +
            additionalAmount +
            fawrySettings.merchant_secret_key;
        const calculatedSignature = crypto_1.default
            .createHash("sha256")
            .update(rawString)
            .digest("hex");
        isValidSignature =
            calculatedSignature.toLowerCase() === String(messageSignature).toLowerCase();
    }
    console.log(`[Fawry Callback - Subdomain: ${req.subdomain}] Verified: ${isValidSignature}, Status: ${orderStatus}`);
    return (0, response_1.SuccessResponse)(res, {
        gateway: "fawry",
        subdomain: req.subdomain,
        received: true,
        verified: isValidSignature,
        order_status: orderStatus || "RECEIVED",
        fawry_ref_number: fawryRefNumber || null,
        merchant_ref_number: merchantRefNumber || null,
        data: payload,
    }, 200);
}
