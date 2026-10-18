import z from "zod";

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().email("Invalid email format").optional(),
      phone: z.string().min(1, "Phone cannot be empty").optional(),
      identifier: z.string().min(1, "Identifier cannot be empty").optional(),
      password: z
        .string({ required_error: "Password is required" })
        .min(1, "Password is required"),
    })
    .refine((data) => data.email || data.phone || data.identifier, {
      message: "Either email, phone, or identifier is required",
      path: ["email"],
    }),
});