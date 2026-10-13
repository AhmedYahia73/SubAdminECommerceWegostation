import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as tenantSchema from "./schema";
import { users } from "./central/users";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { NotFound } from "../Errors";
import "dotenv/config";

// 1. Central Database Pool & Instance
const centralPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_CENTRAL_NAME || process.env.DB_NAME || "systigo",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const centralDb = drizzle(centralPool);

// 2. Cache of Tenant Database Pools
const tenantPools = new Map<string, MySql2Database<typeof tenantSchema>>();

export function getTenantDb(subdomain: string): MySql2Database<typeof tenantSchema> {
  const cached = tenantPools.get(subdomain);
  if (cached) return cached;

  const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: subdomain, // In MySQL wildcard multi-tenancy, each tenant schema is its subdomain database
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const tenantDb = drizzle(pool, { schema: tenantSchema, mode: "default" });
  tenantPools.set(subdomain, tenantDb);
  return tenantDb;
}

// 3. Subdomain Multi-Tenancy Middleware
export async function tenantMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let subdomain = (req.headers["x-subdomain"] as string) || "";

    if (!subdomain && req.hostname) {
      const parts = req.hostname.split(".");
      if (parts.length > 1 && parts[0] !== "www" && parts[0] !== "localhost") {
        subdomain = parts[0];
      }
    }

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

    // Attach tenant db instance and info to request
    req.subdomain = subdomain;
    req.tenant = tenantUser[0];
    req.db = getTenantDb(subdomain);

    next();
  } catch (error) {
    next(error);
  }
}
