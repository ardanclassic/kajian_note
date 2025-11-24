/**
 * Notes Validation Schemas
 * Zod schemas for notes form validation
 */

import { z } from "zod";
import { SYSTEM_LIMITS } from "@/config/subscriptionLimits";

/**
 * Note title validation rules
 * - Required
 * - 3-100 characters
 */
export const noteTitleSchema = z
  .string()
  .min(3, "Judul minimal 3 karakter")
  .max(100, "Judul maksimal 100 karakter")
  .trim();

/**
 * Note content validation rules
 * - Required
 * - 10-50000 characters
 */
export const noteContentSchema = z
  .string()
  .min(10, "Konten minimal 10 karakter")
  .max(50000, "Konten maksimal 50.000 karakter")
  .trim();

/**
 * Tag validation rules
 * - Lowercase alphanumeric with dash
 * - 2-20 characters
 */
export const tagSchema = z
  .string()
  .min(2, "Tag minimal 2 karakter")
  .max(20, "Tag maksimal 20 karakter")
  .regex(/^[a-z0-9-]+$/, "Tag hanya boleh huruf kecil, angka, dan dash")
  .trim();

/**
 * Tags array validation
 * - Optional
 * - Max 5 tags per note (system limit)
 */
export const tagsSchema = z
  .array(tagSchema)
  .max(SYSTEM_LIMITS.maxTagsPerNote, `Maksimal ${SYSTEM_LIMITS.maxTagsPerNote} tag per catatan`)
  .optional()
  .default([]);

/**
 * Create note form schema
 */
export const createNoteSchema = z.object({
  title: noteTitleSchema,
  content: noteContentSchema,
  isPublic: z.boolean().optional().default(false),
  tags: tagsSchema,
});

export type CreateNoteFormData = z.infer<typeof createNoteSchema>;

/**
 * Update note form schema
 */
export const updateNoteSchema = z
  .object({
    title: noteTitleSchema.optional(),
    content: noteContentSchema.optional(),
    isPublic: z.boolean().optional(),
    isPinned: z.boolean().optional(),
    tags: tagsSchema,
  })
  .refine((data) => Object.values(data).some((val) => val !== undefined), {
    message: "Minimal satu field harus diisi",
  });

export type UpdateNoteFormData = z.infer<typeof updateNoteSchema>;

/**
 * Note filter form schema
 */
export const noteFilterSchema = z.object({
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  tags: tagsSchema,
  search: z.string().optional(),
});

export type NoteFilterFormData = z.infer<typeof noteFilterSchema>;

/**
 * Note export form schema
 */
export const noteExportSchema = z.object({
  format: z.enum(["pdf", "markdown", "text"]),
  includeMetadata: z.boolean().optional().default(true),
});

export type NoteExportFormData = z.infer<typeof noteExportSchema>;
