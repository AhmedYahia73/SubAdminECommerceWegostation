import { Request, Response } from "express";
import { admins, roles } from "../../models/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import { NotFound, UnauthorizedError, BadRequest, ForbiddenError } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { generateAdminToken } from "../../utils/auth";
import { extractSubdomain, getTenantDb, centralDb, isSubscriptionActive } from "../../models/tenantDb";
import { users } from "../../models/central/users";

/**
 * Ensures a tenant database connection is available for the request.
 * If req.db is already initialized by tenantMiddleware, it is returned directly.
 * Otherwise, resolves the subdomain from the request (headers, query, hostname),
 * verifies it against the central users table and active subscription,
 * and attaches the tenant db to req.db.
 */
async function resolveTenantDb(req: Request) {
  if (req.db) {
    return req.db;
  }

  const subdomain = extractSubdomain(req);
  if (!subdomain) {
    throw new NotFound("Subdomain not found");
  }

  // Verify subdomain exists in central database users table
  const tenantUser = await centralDb
    .select()
    .from(users)
    .where(eq(users.subdomain, subdomain))
    .limit(1);

  if (!tenantUser[0]) {
    throw new NotFound("Subdomain not found");
  }

  const currentTenant = tenantUser[0];

  // Verify active subscription
  const active = isSubscriptionActive(currentTenant.start_date, currentTenant.end_date);
  if (!active) {
    throw new ForbiddenError("Tenant subscription has expired or is inactive");
  }

  const tenantDb = getTenantDb(subdomain);
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
export async function login(req: Request, res: Response) {
  const db = await resolveTenantDb(req);

  const { email, phone, identifier, emailOrPhone, username, password } = req.body;

  const emailInput = email?.toString().trim();
  const phoneInput = phone?.toString().trim();
  const generalInput = (identifier || emailOrPhone || username)?.toString().trim();

  const searchConditions = [];
  if (emailInput) searchConditions.push(eq(admins.email, emailInput));
  if (phoneInput) searchConditions.push(eq(admins.phone, phoneInput));
  if (generalInput) {
    searchConditions.push(eq(admins.email, generalInput));
    searchConditions.push(eq(admins.phone, generalInput));
  }

  if (searchConditions.length === 0) {
    throw new BadRequest("Email or phone is required");
  }

  if (!password) {
    throw new BadRequest("Password is required");
  }

  // Query admin matching email OR phone in the tenant database
  const adminRows = await db
    .select({
      id: admins.id,
      name: admins.name,
      email: admins.email,
      phone: admins.phone,
      password: admins.password,
      role_id: admins.role_id,
      role_name: roles.name,
      status: admins.status,
      createdAt: admins.createdAt,
      updatedAt: admins.updatedAt,
    })
    .from(admins)
    .leftJoin(roles, eq(admins.role_id, roles.id))
    .where(searchConditions.length === 1 ? searchConditions[0] : or(...searchConditions))
    .limit(1);

  const admin = adminRows[0];

  if (!admin) {
    throw new UnauthorizedError("Invalid email/phone or password");
  }

  // Ensure admin account is active
  if (!admin.status) {
    throw new UnauthorizedError("Your admin account is inactive. Please contact the administrator.");
  }

  // Verify password with bcrypt
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email/phone or password");
  }

  // Generate JWT token
  const token = generateAdminToken({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
  });

  return SuccessResponse(
    res,
    {
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
    },
    200
  );
}

// Aliases for compatibility
export const loginTenantAdmin = login;
export const loginAdmin = login;
