"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralDb = void 0;
exports.getTenantDb = getTenantDb;
exports.extractSubdomain = extractSubdomain;
exports.isSubscriptionActive = isSubscriptionActive;
exports.tenantMiddleware = tenantMiddleware;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const tenantSchema = __importStar(require("./schema"));
const users_1 = require("./central/users");
const packages_1 = require("./central/packages");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../Errors");
const http_status_codes_1 = require("http-status-codes");
const localization_1 = require("../utils/localization");
require("dotenv/config");
// 1. Central Database Pool & Instance
const centralPool = promise_1.default.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_CENTRAL_NAME || process.env.DB_NAME || "systigo",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});
exports.centralDb = (0, mysql2_1.drizzle)(centralPool);
// 2. Cache of Tenant Database Pools
const tenantPools = new Map();
function getTenantDb(subdomain) {
    const cached = tenantPools.get(subdomain);
    if (cached)
        return cached;
    const pool = promise_1.default.createPool({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: subdomain, // In MySQL wildcard multi-tenancy, each tenant schema is its subdomain database
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    });
    const tenantDb = (0, mysql2_1.drizzle)(pool, { schema: tenantSchema, mode: "default" });
    tenantPools.set(subdomain, tenantDb);
    return tenantDb;
}
/**
 * Extracts subdomain from request:
 * 1. Header 'x-subdomain'
 * 2. Query param 'subdomain'
 * 3. Host / Hostname: part before the first dot '.' (e.g. ahmed.wego.com -> ahmed)
 */
function extractSubdomain(req) {
    let subdomain = req.headers["x-subdomain"] || "";
    if (subdomain) {
        return subdomain.trim().toLowerCase();
    }
    if (req.query?.subdomain && typeof req.query.subdomain === "string") {
        return req.query.subdomain.trim().toLowerCase();
    }
    const rawHost = req.headers.host || req.hostname || "";
    const cleanHost = rawHost.split(":")[0].trim().toLowerCase();
    if (cleanHost) {
        const parts = cleanHost.split(".");
        // Example: ahmed.wego.com -> parts = ["ahmed", "wego", "com"]
        // Subdomain is the segment before the first "." (المقطع اللى قبل .)
        if (parts.length > 1) {
            if (parts[0] === "www" && parts.length > 2) {
                subdomain = parts[1];
            }
            else if (parts[0] !== "localhost" && parts[0] !== "127") {
                subdomain = parts[0];
            }
        }
    }
    return subdomain;
}
/**
 * Checks whether the tenant's central subscription is currently active:
 * users.start_date <= now() AND users.end_date >= now()
 */
function isSubscriptionActive(startDateVal, endDateVal) {
    if (!startDateVal || !endDateVal) {
        return false;
    }
    const now = new Date();
    const toDateString = (val) => {
        if (typeof val === "string") {
            return val.slice(0, 10);
        }
        return val.toISOString().slice(0, 10);
    };
    const startStr = toDateString(startDateVal);
    const endStr = toDateString(endDateVal);
    const todayUtcStr = now.toISOString().slice(0, 10);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayLocalStr = `${year}-${month}-${day}`;
    const isStartValid = startStr <= todayUtcStr || startStr <= todayLocalStr;
    const isEndValid = endStr >= todayUtcStr || endStr >= todayLocalStr;
    return isStartValid && isEndValid;
}
// 3. Subdomain Multi-Tenancy Middleware
async function tenantMiddleware(req, res, next) {
    try {
        const subdomain = extractSubdomain(req);
        if (!subdomain) {
            throw new Errors_1.NotFound("Subdomain not found");
        }
        // Verify subdomain exists in central database users table
        const tenantUser = await exports.centralDb
            .select()
            .from(users_1.users)
            .where((0, drizzle_orm_1.eq)(users_1.users.subdomain, subdomain))
            .limit(1);
        if (!tenantUser[0]) {
            throw new Errors_1.NotFound("Subdomain not found");
        }
        const currentTenant = tenantUser[0];
        // Check subscription active: start_date <= now() AND end_date >= now()
        const isCallbackEndpoint = req.path.includes("_callback") || req.originalUrl.includes("_callback");
        const active = isSubscriptionActive(currentTenant.start_date, currentTenant.end_date);
        if (!active && !isCallbackEndpoint) {
            const lang = req.query.lang || req.headers["lang"] || "en";
            // Fetch all packages from central database
            const centralPackages = await exports.centralDb
                .select({
                id: packages_1.packages.id,
                name: packages_1.packages.name,
                type: packages_1.packages.type,
                price: packages_1.packages.price,
                status: packages_1.packages.status,
            })
                .from(packages_1.packages);
            const formattedPackages = centralPackages.map((pkg) => ({
                id: pkg.id,
                name: (0, localization_1.getLocalizedText)(pkg.name, lang, "en"),
                type: pkg.type,
                price: pkg.price,
                status: pkg.status,
            }));
            return res.status(http_status_codes_1.StatusCodes.FORBIDDEN).json({
                status: false,
                success: false,
                message: "Tenant subscription has expired or is inactive",
                packages: formattedPackages,
            });
        }
        // Attach tenant db instance and info to request
        req.subdomain = subdomain;
        req.tenant = currentTenant;
        req.db = getTenantDb(subdomain);
        next();
    }
    catch (error) {
        next(error);
    }
}
