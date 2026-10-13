import { Request, Response } from "express";
import { languages } from "../../models/schema";
import { eq } from "drizzle-orm";
import { NotFound } from "../../Errors";
import { SuccessResponse } from "../../utils/response";

export async function getAllLanguages(req: Request, res: Response) {
  const db = req.db;
  const list = await db.select().from(languages);
  return SuccessResponse(res, { languages: list }, 200);
}

export async function getLanguagesSelection(req: Request, res: Response) {
  const db = req.db;
  const list = await db
    .select({
      id: languages.id,
      name: languages.name,
    })
    .from(languages)
    .where(eq(languages.status, true));

  return SuccessResponse(res, { languages: list }, 200);
}

export async function getLanguageById(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const row = await db.select().from(languages).where(eq(languages.id, id)).limit(1);
  if (!row[0]) throw new NotFound("Language not found");

  return SuccessResponse(res, { language: row[0] }, 200);
}

export async function createLanguage(req: Request, res: Response) {
  const db = req.db;
  const { name, status } = req.body;

  await db.insert(languages).values({
    name,
    status: status !== undefined ? status : true,
  });

  return SuccessResponse(res, { message: "Language created successfully" }, 201);
}

export async function updateLanguage(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;
  const { name, status } = req.body;

  const existing = await db.select().from(languages).where(eq(languages.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Language not found");

  const updateData: Partial<typeof languages.$inferInsert> = {};
  if (name !== undefined) updateData.name = name;
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length > 0) {
    await db.update(languages).set(updateData).where(eq(languages.id, id));
  }

  return SuccessResponse(res, { message: "Language updated successfully" }, 200);
}

export async function deleteLanguage(req: Request, res: Response) {
  const db = req.db;
  const { id } = req.params;

  const existing = await db.select().from(languages).where(eq(languages.id, id)).limit(1);
  if (!existing[0]) throw new NotFound("Language not found");

  await db.delete(languages).where(eq(languages.id, id));
  return SuccessResponse(res, { message: "Language deleted successfully" }, 200);
}
