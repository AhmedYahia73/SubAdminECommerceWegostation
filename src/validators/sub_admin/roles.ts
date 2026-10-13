import z from "zod";

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Role name is required" }).min(1, "Role name is required"),
  }),
});

export const updateRoleSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Role name cannot be empty").optional(),
  }),
});

export const roleIdParamSchema = z.object({
  params: z.object({
    id: z.string({ required_error: "Role ID is required" }).uuid("Invalid role ID"),
  }),
});
