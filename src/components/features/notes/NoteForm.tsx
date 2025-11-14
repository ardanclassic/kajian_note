/**
 * NoteForm Component - WITH TIPTAP
 * Create and edit note form
 * UPDATED: Replace textarea with Tiptap rich text editor
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TiptapEditor } from "@/components/features/notes/TiptapEditor";
import { Save, X, Plus, Globe, Lock, Loader2, AlertTriangle, Info, XCircle } from "lucide-react";
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
  const [content, setContent] = useState(note?.content || "");

  const isEditMode = !!note;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
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

  // Update form content when Tiptap changes
  useEffect(() => {
    setValue("content", content);

    // Validate content length
    if (content.length < 10) {
      setError("content", {
        type: "manual",
        message: "Konten minimal 10 karakter",
      });
    } else if (content.length > 10000) {
      setError("content", {
        type: "manual",
        message: "Konten maksimal 50.000 karakter",
      });
    } else {
      clearErrors("content");
    }
  }, [content, setValue, setError, clearErrors]);

  // Handle Tiptap content change
  const handleContentChange = (html: string) => {
    // Strip HTML tags for length validation
    const text = html.replace(/<[^>]*>/g, "").trim();
    setContent(text.length > 0 ? html : "");
  };

  // Handle add tag with professional notifications
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const newTag = tagInput.trim().toLowerCase();

    // Validation with toast notifications
    if (newTag.length < 2) {
      toast.error("Tag terlalu pendek", {
        description: "Tag minimal 2 karakter",
      });
      return;
    }

    if (newTag.length > 20) {
      toast.error("Tag terlalu panjang", {
        description: "Tag maksimal 20 karakter",
      });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(newTag)) {
      toast.error("Format tag tidak valid", {
        description: "Tag hanya boleh huruf kecil, angka, dan dash (-)",
      });
      return;
    }

    if (tags.includes(newTag)) {
      toast.warning("Tag sudah ada", {
        description: `Tag "${newTag}" sudah ditambahkan`,
      });
      return;
    }

    // Check limit
    if (usage && tags.length >= usage.tagsLimit) {
      toast.error("Batas tag tercapai", {
        description: `Maksimal ${usage.tagsLimit} tag untuk tier ${usage.tier}. Upgrade ke Premium untuk tag unlimited.`,
        duration: 5000,
      });
      return;
    }

    // Success - add tag
    setTags([...tags, newTag]);
    setTagInput("");

    // Show success feedback
    toast.success("Tag ditambahkan", {
      description: `"${newTag}" berhasil ditambahkan`,
      duration: 2000,
    });
  };

  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    toast.info("Tag dihapus", {
      description: `"${tag}" telah dihapus`,
      duration: 2000,
    });
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
        content, // Use Tiptap content
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  // Check if can create public note
  const canPublic = usage?.tier !== "free";

  // Calculate tag limit status
  const tagLimitPercentage = usage ? (tags.length / usage.tagsLimit) * 100 : 0;
  const isNearLimit = tagLimitPercentage >= 80;
  const isAtLimit = usage ? tags.length >= usage.tagsLimit : false;

  // Check if user's TOTAL unique tags reached limit (hide field completely)
  const isUserAtTagLimit = usage ? usage.tagsUsed >= usage.tagsLimit : false;
  const canAddMoreTags = !isUserAtTagLimit || (isEditMode && tags.length > 0);

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

          {/* Content - TIPTAP EDITOR */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Konten <span className="text-destructive">*</span>
            </Label>
            <TiptapEditor
              content={content}
              onChange={handleContentChange}
              placeholder="Tulis catatan Anda di sini..."
              disabled={isSubmitting}
              minHeight="250px"
            />
            {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            <p className="text-xs text-muted-foreground">Gunakan toolbar untuk format teks (Bold, Italic, List, dll)</p>
          </div>

          {/* Tags - HIDE if user at limit */}
          {canAddMoreTags ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags">Tag</Label>
                {usage && (
                  <Badge
                    variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
                    className="gap-1.5"
                  >
                    {tags.length}/{usage.tagsLimit === Infinity ? "∞" : usage.tagsLimit}
                    {isNearLimit && !isAtLimit && <AlertTriangle className="w-3 h-3" />}
                  </Badge>
                )}
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Tambah tag (huruf kecil, angka, dash)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={isSubmitting || isAtLimit}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={isSubmitting || isAtLimit || !tagInput.trim()}
                  variant="secondary"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Warning Alert - Near Limit */}
              {isNearLimit && !isAtLimit && (
                <Alert className="border-yellow-500/50 bg-yellow-500/10">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <AlertDescription className="text-sm text-yellow-700">
                    <strong>Hampir mencapai batas!</strong> Anda sudah menggunakan {tags.length} dari {usage?.tagsLimit}{" "}
                    tag. Upgrade ke Premium untuk tag unlimited.
                  </AlertDescription>
                </Alert>
              )}

              {/* Warning Alert - At Limit */}
              {isAtLimit && (
                <Alert variant="destructive">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    <strong>Batas tag tercapai!</strong> Maksimal {usage?.tagsLimit} tag untuk tier {usage?.tier}.
                    Upgrade ke Premium untuk menambah lebih banyak tag.
                  </AlertDescription>
                </Alert>
              )}

              {/* Info Alert - Free Tier */}
              {usage?.tier === "free" && tags.length === 0 && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription className="text-sm text-muted-foreground">
                    Tier Free: Maksimal {usage.tagsLimit} tag. Upgrade ke Premium untuk tag unlimited.
                  </AlertDescription>
                </Alert>
              )}

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
          ) : (
            // Show info alert when tag field is hidden
            <Alert variant="default" className="text-yellow-600">
              <XCircle className="w-4 h-4" />
              <AlertDescription className="text-yellow-600">
                <strong>Field tag disembunyikan.</strong> Anda sudah mencapai batas {usage?.tagsLimit} tag unik untuk
                tier {usage?.tier}. <br /> Hapus tag yang tidak digunakan atau upgrade ke Premium untuk tag unlimited.
              </AlertDescription>
            </Alert>
          )}

          {/* Visibility Toggle */}
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
