import { Request, Response } from "express";
import { roles } from "../../models/schema";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export async function getAllRoles(req: Request, res: Response) {
  const db = req.db;
  const list = await db.select().from(roles);
  return SuccessResponse(res, { roles: list }, 200);
}

export async function getRolesSelection(req: Request, res: Response) {
  const db = req.db;
  const list = await db
    .select({
      id: roles.id,
      name: roles.name,
    })
    .from(roles);

  return SuccessResponse(res, { roles: list }, 200);
}

export async function getRoleById(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const row = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!row[0]) throw new NotFound("Role not found");

  return SuccessResponse(res, { role: row[0] }, 200);
}

export async function createRole(req: Request, res: Response) {
  const db = req.db;
  const { name } = req.body;

  await db.insert(roles).values({ name });
  return SuccessResponse(res, { message: "Role created successfully" }, 201);
}

export async function updateRole(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const { name } = req.body;

  const existing = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Role not found");

  if (name !== undefined) {
    await db.update(roles).set({ name }).where(eq(roles.id, id));
  }

  return SuccessResponse(res, { message: "Role updated successfully" }, 200);
}

export async function deleteRole(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const existing = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Role not found");

  await db.delete(roles).where(eq(roles.id, id));
  return SuccessResponse(res, { message: "Role deleted successfully" }, 200);
}
