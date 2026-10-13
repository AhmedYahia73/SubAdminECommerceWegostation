import { Request, Response } from "express";
import { warranties } from "../../models/schema";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";
import { getLocalizedText } from "../../utils/localization";
import { uploadImage, updateImage, deleteImage } from "../../services/imageService";

export async function getAllWarranties(req: Request, res: Response) {
  const db = req.db;
  const lang = req.query.lang as string | undefined;

  const list = await db.select().from(warranties);
  const formatted = list.map((item) => ({
    ...item,
    text: getLocalizedText(item.text, lang),
    texts: item.text,
  }));

  return SuccessResponse(res, { warranties: formatted }, 200);
}

export async function getWarrantiesSelection(req: Request, res: Response) {
  const db = req.db;
  const lang = req.query.lang as string | undefined;

  const list = await db
    .select({
      id: warranties.id,
      text: warranties.text,
    })
    .from(warranties);

  const formatted = list.map((item) => ({
    id: item.id,
    name: getLocalizedText(item.text, lang),
  }));

  return SuccessResponse(res, { warranties: formatted }, 200);
}

export async function getWarrantyById(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const lang = req.query.lang as string | undefined;

  const row = await db.select().from(warranties).where(eq(warranties.id, id)).limit(1);
  if (!row[0]) throw new NotFound("Warranty not found");

  const warranty = {
    ...row[0],
    localized_text: getLocalizedText(row[0].text, lang),
  };

  return SuccessResponse(res, { warranty }, 200);
}

export async function createWarranty(req: Request, res: Response) {
  const db = req.db;
  const { text, logo, period } = req.body;

  let logoUrl: string | null = null;
  if (logo) {
    logoUrl = await uploadImage(req, logo, "uploads");
  }

  await db.insert(warranties).values({
    text,
    logo: logoUrl,
    period: period ?? null,
  });

  return SuccessResponse(res, { message: "Warranty created successfully" }, 201);
}

export async function updateWarranty(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const { text, logo, period } = req.body;

  const existing = await db.select().from(warranties).where(eq(warranties.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Warranty not found");

  const updateData: Partial<typeof warranties.$inferInsert> = {};
  if (text !== undefined) updateData.text = text;
  if (period !== undefined) updateData.period = period;

  if (logo !== undefined && logo !== existing[0].logo) {
    if (logo) {
      updateData.logo = await updateImage(req, logo, "uploads", existing[0].logo);
    } else {
      await deleteImage(existing[0].logo);
      updateData.logo = null;
    }
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(warranties).set(updateData).where(eq(warranties.id, id));
  }

  return SuccessResponse(res, { message: "Warranty updated successfully" }, 200);
}

export async function deleteWarranty(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const existing = await db.select().from(warranties).where(eq(warranties.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Warranty not found");

  if (existing[0].logo) {
    await deleteImage(existing[0].logo);
  }

  await db.delete(warranties).where(eq(warranties.id, id));
  return SuccessResponse(res, { message: "Warranty deleted successfully" }, 200);
}
