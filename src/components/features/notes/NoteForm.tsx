/**
 * NoteForm Component - FIXED
 * Create and edit note form
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Save, X, Plus, Globe, Lock, Loader2 } from "lucide-react";
import { createNoteSchema, type CreateNoteFormData } from "@/schemas/notes.schema";
import type { Note } from "@/types/notes.types";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";

interface NoteFormProps {
  note?: Note; // For edit mode
  onSubmit: (data: CreateNoteFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function NoteForm({ note, onSubmit, onCancel, isSubmitting = false }: NoteFormProps) {
  const { user } = useAuthStore();
  const { usage, fetchUsage } = useSubscriptionStore();
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [tagError, setTagError] = useState<string | null>(null);

  const isEditMode = !!note;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateNoteFormData>({
    resolver: zodResolver(createNoteSchema) as any,
    defaultValues: {
      title: note?.title || "",
      content: note?.content || "",
      isPublic: note?.isPublic || false,
      tags: note?.tags || [],
    },
  });

  const isPublic = watch("isPublic");

  // Fetch usage on mount
  useEffect(() => {
    if (user?.id) {
      fetchUsage(user.id);
    }
  }, [user?.id]);

  // Update form tags when state changes
  useEffect(() => {
    setValue("tags", tags);
  }, [tags, setValue]);

  // Handle add tag
  const handleAddTag = () => {
    setTagError(null);

    if (!tagInput.trim()) return;

    const newTag = tagInput.trim().toLowerCase();

    // Validation
    if (newTag.length < 2) {
      setTagError("Tag minimal 2 karakter");
      return;
    }

    if (newTag.length > 20) {
      setTagError("Tag maksimal 20 karakter");
      return;
    }

    if (!/^[a-z0-9-]+$/.test(newTag)) {
      setTagError("Tag hanya boleh huruf kecil, angka, dan dash");
      return;
    }

    if (tags.includes(newTag)) {
      setTagError("Tag sudah ada");
      return;
    }

    // Check limit
    if (usage && tags.length >= usage.tagsLimit) {
      setTagError(`Maksimal ${usage.tagsLimit} tag. Upgrade untuk lebih banyak.`);
      return;
    }

    setTags([...tags, newTag]);
    setTagInput("");
  };

  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    setTagError(null);
  };

  // Handle tag input keypress
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle form submit
  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      await onSubmit({
        ...data,
        tags,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  // Check if can create public note
  const canPublic = usage?.tier !== "free";

  return (
    <form onSubmit={handleFormSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Catatan" : "Buat Catatan Baru"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul <span className="text-destructive">*</span>
            </Label>
            <Input id="title" placeholder="Masukkan judul catatan..." {...register("title")} disabled={isSubmitting} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Konten <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="content"
              rows={10}
              placeholder="Tulis catatan Anda di sini..."
              className="w-full px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              {...register("content")}
              disabled={isSubmitting}
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">
              Tag
              {usage && (
                <span className="text-muted-foreground ml-2 text-xs">
                  ({tags.length}/{usage.tagsLimit === Infinity ? "∞" : usage.tagsLimit})
                </span>
              )}
            </Label>

            {/* Tag Input */}
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Tambah tag (huruf kecil, angka, dash)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                disabled={isSubmitting}
              />
              <Button type="button" onClick={handleAddTag} disabled={isSubmitting} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {tagError && <p className="text-sm text-destructive">{tagError}</p>}

            {/* Tags List */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isSubmitting}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility Toggle - FIXED */}
          <div className="space-y-2">
            <Label>Visibilitas</Label>
            <div className="flex items-center gap-4">
              {/* Private */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value=""
                  checked={!isPublic}
                  onChange={() => setValue("isPublic", false)}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
                <span className="flex items-center gap-1 text-sm">
                  <Lock className="w-4 h-4" />
                  Pribadi
                </span>
              </label>

              {/* Public */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value=""
                  checked={isPublic}
                  onChange={() => setValue("isPublic", true)}
                  disabled={isSubmitting || !canPublic}
                  className="cursor-pointer disabled:cursor-not-allowed"
                />
                <span className="flex items-center gap-1 text-sm">
                  <Globe className="w-4 h-4" />
                  Publik
                  {!canPublic && (
                    <Badge variant="outline" className="text-xs ml-1">
                      Premium
                    </Badge>
                  )}
                </span>
              </label>
            </div>
            {!canPublic && isPublic && (
              <p className="text-sm text-muted-foreground">Catatan publik hanya tersedia untuk Premium & Advance</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? "Menyimpan..." : "Membuat..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Simpan" : "Buat Catatan"}
              </>
            )}
          </Button>

          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Batal
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
