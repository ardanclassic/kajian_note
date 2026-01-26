/**
 * User Validation Schemas
 * Zod schemas for user form validation
 */

import { z } from "zod";
import { fullNameSchema, usernameSchema, phoneSchema } from "./auth.schema";

/**
 * Bio validation rules
 * - Optional
 * - Max 200 characters
 */
export const bioSchema = z.string().max(200, "Bio maksimal 200 karakter").optional().or(z.literal(""));

/**
 * Avatar URL validation rules
 * - Optional
 * - Must be valid URL
 */
export const avatarUrlSchema = z.string().url("URL avatar tidak valid").optional().or(z.literal(""));

/**
 * Payment Email validation rules
 * - Optional but must be valid email if provided
 * - Used for Lynk.id payment matching
 */
export const paymentEmailSchema = z.string().email("Format email tidak valid").optional().or(z.literal(""));

/**
 * Role validation rules
 */
export const roleSchema = z.enum(["admin", "panitia", "ustadz", "member"]);

/**
 * Update profile form schema
 */
export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  email: z.string().email("Format email tidak valid").optional(), // NEW: Email update
  paymentEmail: paymentEmailSchema, // NEW: Payment email field
  bio: bioSchema,
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/**
 * Update username form schema
 */
export const updateUsernameSchema = z.object({
  username: usernameSchema,
});

export type UpdateUsernameFormData = z.infer<typeof updateUsernameSchema>;

/**
 * Update user form schema (admin only)
 */
export const updateUserSchema = z.object({
  fullName: fullNameSchema,
  username: usernameSchema,
  phone: phoneSchema,
  paymentEmail: paymentEmailSchema, // NEW: Admin can update payment email
  role: roleSchema,
  bio: bioSchema,
  isActive: z.boolean(),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

/**
 * Create user form schema (admin only)
 */
export const createUserSchema = z
  .object({
    fullName: fullNameSchema,
    username: usernameSchema,
    pin: z
      .string()
      .length(6, "PIN harus 6 digit")
      .regex(/^\d{6}$/, "PIN harus berupa angka"),
    confirmPin: z.string(),
    phone: phoneSchema,
    paymentEmail: paymentEmailSchema, // NEW: Optional payment email on creation
    role: roleSchema.optional().default("member"),
    bio: bioSchema,
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PIN tidak sama",
    path: ["confirmPin"],
  });

export type CreateUserFormData = z.infer<typeof createUserSchema>;

/**
 * User filter form schema
 */
export const userFilterSchema = z.object({
  role: roleSchema.optional(),
  subscriptionTier: z.enum(["free", "premium", "advance"]).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export type UserFilterFormData = z.infer<typeof userFilterSchema>;
