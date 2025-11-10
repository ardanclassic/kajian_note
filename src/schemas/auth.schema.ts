/**
 * Authentication Validation Schemas
 * Zod schemas for validating auth-related forms
 */

import { z } from "zod";

/**
 * Username validation schema
 * Rules: alphanumeric, 3-20 characters, lowercase
 */
export const usernameSchema = z
  .string()
  .min(3, "Username minimal 3 karakter")
  .max(20, "Username maksimal 20 karakter")
  .regex(/^[a-z0-9]+$/, "Username hanya boleh huruf kecil dan angka")
  .trim();

/**
 * PIN validation schema
 * Rules: exactly 6 digits
 */
export const pinSchema = z
  .string()
  .length(6, "PIN harus 6 digit")
  .regex(/^\d{6}$/, "PIN hanya boleh angka");

/**
 * Full name validation schema
 */
export const fullNameSchema = z
  .string()
  .min(3, "Nama lengkap minimal 3 karakter")
  .max(100, "Nama lengkap maksimal 100 karakter")
  .trim();

/**
 * Phone validation schema (optional)
 */
export const phoneSchema = z
  .string()
  .regex(/^(08|62)\d{8,12}$/, "Format nomor HP tidak valid")
  .optional()
  .or(z.literal(""));

/**
 * Login schema
 */
export const loginSchema = z.object({
  username: usernameSchema,
  pin: pinSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Register schema
 */
export const registerSchema = z
  .object({
    fullName: fullNameSchema,
    username: usernameSchema,
    pin: pinSchema,
    confirmPin: pinSchema,
    phone: phoneSchema,
  })
  .refine((data) => data.pin === data.confirmPin, {
    message: "PIN tidak sama",
    path: ["confirmPin"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * Change PIN schema
 */
export const changePINSchema = z
  .object({
    oldPin: pinSchema,
    newPin: pinSchema,
    confirmPin: pinSchema,
  })
  .refine((data) => data.newPin !== data.oldPin, {
    message: "PIN baru tidak boleh sama dengan PIN lama",
    path: ["newPin"],
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PIN baru tidak sama",
    path: ["confirmPin"],
  });

export type ChangePINFormData = z.infer<typeof changePINSchema>;

/**
 * Reset PIN schema (by admin)
 */
export const resetPINSchema = z
  .object({
    userId: z.string().uuid("User ID tidak valid"),
    newPin: pinSchema,
    confirmPin: pinSchema,
    tempPin: z.boolean().optional(),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "PIN tidak sama",
    path: ["confirmPin"],
  });

export type ResetPINFormData = z.infer<typeof resetPINSchema>;

/**
 * Forgot username schema
 */
export const forgotUsernameSchema = z.object({
  fullName: fullNameSchema,
  phone: z.string().regex(/^(08|62)\d{8,12}$/, "Format nomor HP tidak valid"),
});

export type ForgotUsernameFormData = z.infer<typeof forgotUsernameSchema>;
