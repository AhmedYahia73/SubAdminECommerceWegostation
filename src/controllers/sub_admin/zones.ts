import { Request, Response } from "express";
import { zones, cities } from "../../models/schema";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export async function getAllZones(req: Request, res: Response) {
  const db = req.db;
  const list = await db.select().from(zones);
  return SuccessResponse(res, { zones: list }, 200);
}

export async function getZoneLists(req: Request, res: Response) {
  const db = req.db;

  const citiesRaw = await db
    .select({
      id: cities.id,
      name: cities.name,
    })
    .from(cities)
    .where(eq(cities.status, true));

  const citiesList = citiesRaw.map((c) => ({
    id: c.id,
    name: Array.isArray(c.name) ? c.name[0] : c.name,
  }));

  return SuccessResponse(res, { cities: citiesList }, 200);
}

export async function getZonesSelection(req: Request, res: Response) {
  const db = req.db;
  const list = await db
    .select({
      id: zones.id,
      name: zones.name,
      city_id: zones.city_id,
    })
    .from(zones)
    .where(eq(zones.status, true));

  const formatted = list.map((item) => ({
    id: item.id,
    name: Array.isArray(item.name) ? item.name[0] : item.name,
    city_id: item.city_id,
  }));

  return SuccessResponse(res, { zones: formatted }, 200);
}

export async function getZoneById(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const row = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
  if (!row[0]) throw new NotFound("Zone not found");

  return SuccessResponse(res, { zone: row[0] }, 200);
}

export async function createZone(req: Request, res: Response) {
  const db = req.db;
  const { name, city_id, status } = req.body;

  const cityExists = await db.select({ id: cities.id }).from(cities).where(eq(cities.id, city_id)).limit(1);
  if (!cityExists[0]) throw new NotFound("City not found");

  await db.insert(zones).values({
    name,
    city_id,
    status: status !== undefined ? status : true,
  });

  return SuccessResponse(res, { message: "Zone created successfully" }, 201);
}

export async function updateZone(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const { name, city_id, status } = req.body;

  const existing = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Zone not found");

  if (city_id) {
    const cityExists = await db.select({ id: cities.id }).from(cities).where(eq(cities.id, city_id)).limit(1);
    if (!cityExists[0]) throw new NotFound("City not found");
  }

  const updateData: Partial<typeof zones.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;
  if (city_id !== undefined) updateData.city_id = city_id;
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length > 0) {
    await db.update(zones).set(updateData).where(eq(zones.id, id));
  }

  return SuccessResponse(res, { message: "Zone updated successfully" }, 200);
}

export async function deleteZone(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const existing = await db.select().from(zones).where(eq(zones.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Zone not found");

  await db.delete(zones).where(eq(zones.id, id));
  return SuccessResponse(res, { message: "Zone deleted successfully" }, 200);
}
