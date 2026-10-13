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
exports.tenantMiddleware = tenantMiddleware;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const tenantSchema = __importStar(require("./schema"));
const users_1 = require("./central/users");
const drizzle_orm_1 = require("drizzle-orm");
const Errors_1 = require("../Errors");
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
// 3. Subdomain Multi-Tenancy Middleware
async function tenantMiddleware(req, res, next) {
    try {
        let subdomain = req.headers["x-subdomain"] || "";
        if (!subdomain && req.hostname) {
            const parts = req.hostname.split(".");
            if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
                subdomain = parts[0];
            }
        }
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
        // Attach tenant db instance and info to request
        req.subdomain = subdomain;
        req.tenant = tenantUser[0];
        req.db = getTenantDb(subdomain);
        next();
    }
    catch (error) {
        next(error);
    }
}
