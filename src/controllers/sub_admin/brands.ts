import { Request, Response } from "express";
import { brands } from "../../models/schema";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { uploadImage, updateImage, deleteImage } from "../../services/imageService";

export async function getAllBrands(req: Request, res: Response) {
  const db = req.db;
  const list = await db.select().from(brands);
  return SuccessResponse(res, { brands: list }, 200);
}

export async function getBrandsSelection(req: Request, res: Response) {
  const db = req.db;
  const list = await db
    .select({
      id: brands.id,
      name: brands.name,
    })
    .from(brands);

  return SuccessResponse(res, { brands: list }, 200);
}

export async function getBrandById(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const row = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  if (!row[0]) throw new NotFound("Brand not found");

  return SuccessResponse(res, { brand: row[0] }, 200);
}

export async function createBrand(req: Request, res: Response) {
  const db = req.db;
  const { name, logo } = req.body;

  const logoUrl = await uploadImage(req, logo, "uploads");

  await db.insert(brands).values({
    name,
    logo: logoUrl,
  });

  return SuccessResponse(res, { message: "Brand created successfully" }, 201);
}

export async function updateBrand(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const { name, logo } = req.body;

  const existing = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Brand not found");

  const updateData: Partial<typeof brands.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;

  if (logo !== undefined && logo !== existing[0].logo) {
    updateData.logo = await updateImage(req, logo, "uploads", existing[0].logo);
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(brands).set(updateData).where(eq(brands.id, id));
  }

  return SuccessResponse(res, { message: "Brand updated successfully" }, 200);
}

export async function deleteBrand(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const existing = await db.select().from(brands).where(eq(brands.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Brand not found");

  await deleteImage(existing[0].logo);
  await db.delete(brands).where(eq(brands.id, id));

  return SuccessResponse(res, { message: "Brand deleted successfully" }, 200);
}
