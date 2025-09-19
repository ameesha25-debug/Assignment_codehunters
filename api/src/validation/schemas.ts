import { z } from "zod";

export const PaginationQuery = z.object({
  search: z.string().trim().optional().default(""),
  category: z.string().trim().optional(),
  sort: z.enum(["price", "rating", "name", "new"]).optional().default("new"),
  order: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12)
});

export const CreateProductBody = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.coerce.number().positive(),
  category: z.string().min(2),
  badge: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional()
});

export const SignupBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
});

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
