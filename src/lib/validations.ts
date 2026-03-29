import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
  firstname: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  firstname: z.string().optional(),
});

export const resetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password too long"),
});

export const suggestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title too long")
    .transform((s) => s.trim()),
  type: z.enum(["movie", "show", "other"]),
  tag: z.string().optional(),
  firstname: z.string().optional(),
});

export const approveSchema = z.object({
  suggestionId: z.number().int().positive(),
  action: z.enum(["approved", "denied"]),
});

export const voteSchema = z.object({
  contentId: z.number().int().positive(),
  voteType: z.enum(["up", "down"]),
  count: z.number().int().min(1).max(100).optional().default(1),
});

export const upNextSchema = z.object({
  title: z.string().min(1, "Title is required").max(200).transform((s) => s.trim()),
  type: z.enum(["movie", "show", "live"]),
  releaseDate: z.string().optional().or(z.literal("")).transform(v => v ? new Date(v) : null),
  hasCosplay: z.boolean(),
  details: z.string().max(500).optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SuggestInput = z.infer<typeof suggestSchema>;
export type ApproveInput = z.infer<typeof approveSchema>;
export type VoteInput = z.infer<typeof voteSchema>;
export type UpNextInput = z.infer<typeof upNextSchema>;
export type UpNextSchemaInput = z.input<typeof upNextSchema>;
