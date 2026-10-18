"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = exports.loginTenantAdmin = void 0;
exports.login = login;
const schema_1 = require("../../models/schema");
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const Errors_1 = require("../../Errors");
const response_1 = require("../../utils/response");
const auth_1 = require("../../utils/auth");
const tenantDb_1 = require("../../models/tenantDb");
const users_1 = require("../../models/central/users");
/**
 * Ensures a tenant database connection is available for the request.
 * If req.db is already initialized by tenantMiddleware, it is returned directly.
 * Otherwise, resolves the subdomain from the request (headers, query, hostname),
 * verifies it against the central users table and active subscription,
 * and attaches the tenant db to req.db.
 */
async function resolveTenantDb(req) {
    if (req.db) {
        return req.db;
    }
    const subdomain = (0, tenantDb_1.extractSubdomain)(req);
    if (!subdomain) {
        throw new Errors_1.NotFound("Subdomain not found");
    }
    // Verify subdomain exists in central database users table
    const tenantUser = await tenantDb_1.centralDb
        .select()
        .from(users_1.users)
        .where((0, drizzle_orm_1.eq)(users_1.users.subdomain, subdomain))
        .limit(1);
    if (!tenantUser[0]) {
        throw new Errors_1.NotFound("Subdomain not found");
    }
    const currentTenant = tenantUser[0];
    // Verify active subscription
    const active = (0, tenantDb_1.isSubscriptionActive)(currentTenant.start_date, currentTenant.end_date);
    if (!active) {
        throw new Errors_1.ForbiddenError("Tenant subscription has expired or is inactive");
    }
    const tenantDb = (0, tenantDb_1.getTenantDb)(subdomain);
    req.subdomain = subdomain;
    req.tenant = currentTenant;
    req.db = tenantDb;
    return tenantDb;
}
/**
 * Controller for Admin Login in Tenant Wildcard Schema
 *
 * Authenticates against the tenant schema's `admin` table.
 * Supports login using either `email` or `phone` together with `password`.
 * Also accepts generic fields such as `identifier` or `emailOrPhone`.
 */
async function login(req, res) {
    const db = await resolveTenantDb(req);
    const { email, phone, identifier, emailOrPhone, username, password } = req.body;
    const emailInput = email?.toString().trim();
    const phoneInput = phone?.toString().trim();
    const generalInput = (identifier || emailOrPhone || username)?.toString().trim();
    const searchConditions = [];
    if (emailInput)
        searchConditions.push((0, drizzle_orm_1.eq)(schema_1.admins.email, emailInput));
    if (phoneInput)
        searchConditions.push((0, drizzle_orm_1.eq)(schema_1.admins.phone, phoneInput));
    if (generalInput) {
        searchConditions.push((0, drizzle_orm_1.eq)(schema_1.admins.email, generalInput));
        searchConditions.push((0, drizzle_orm_1.eq)(schema_1.admins.phone, generalInput));
    }
    if (searchConditions.length === 0) {
        throw new Errors_1.BadRequest("Email or phone is required");
    }
    if (!password) {
        throw new Errors_1.BadRequest("Password is required");
    }
    // Query admin matching email OR phone in the tenant database
    const adminRows = await db
        .select({
        id: schema_1.admins.id,
        name: schema_1.admins.name,
        email: schema_1.admins.email,
        phone: schema_1.admins.phone,
        password: schema_1.admins.password,
        role_id: schema_1.admins.role_id,
        role_name: schema_1.roles.name,
        status: schema_1.admins.status,
        createdAt: schema_1.admins.createdAt,
        updatedAt: schema_1.admins.updatedAt,
    })
        .from(schema_1.admins)
        .leftJoin(schema_1.roles, (0, drizzle_orm_1.eq)(schema_1.admins.role_id, schema_1.roles.id))
        .where(searchConditions.length === 1 ? searchConditions[0] : (0, drizzle_orm_1.or)(...searchConditions))
        .limit(1);
    const admin = adminRows[0];
    if (!admin) {
        throw new Errors_1.UnauthorizedError("Invalid email/phone or password");
    }
    // Ensure admin account is active
    if (!admin.status) {
        throw new Errors_1.UnauthorizedError("Your admin account is inactive. Please contact the administrator.");
    }
    // Verify password with bcrypt
    const isMatch = await bcrypt_1.default.compare(password, admin.password);
    if (!isMatch) {
        throw new Errors_1.UnauthorizedError("Invalid email/phone or password");
    }
    // Generate JWT token
    const token = (0, auth_1.generateAdminToken)({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
    });
    return (0, response_1.SuccessResponse)(res, {
        message: "Admin login successful",
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            phone: admin.phone,
            role_id: admin.role_id,
            role_name: admin.role_name,
            status: admin.status,
        },
    }, 200);
}
// Aliases for compatibility
exports.loginTenantAdmin = login;
exports.loginAdmin = login;
