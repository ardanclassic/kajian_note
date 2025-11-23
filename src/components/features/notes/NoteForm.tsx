/**
 * NoteForm Component - ENHANCED UI/UX
 * Compact, clean, beautiful with Tiptap editor
 * With Framer Motion animations & mobile responsive
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TiptapEditor } from "@/components/features/notes/TiptapEditor";
import { Save, Plus, Globe, Lock, Loader2, Tag as TagIcon, Type, FileText, X, Check, AlertCircle } from "lucide-react";
import { createNoteSchema, type CreateNoteFormData } from "@/schemas/notes.schema";
import type { Note } from "@/types/notes.types";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useAuthStore } from "@/store/authStore";

interface NoteFormProps {
  note?: Note;
  onSubmit: (data: CreateNoteFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

// Animation variants
const cardVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const tagVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export function NoteForm({ note, onSubmit, onCancel, isSubmitting = false }: NoteFormProps) {
  const { user } = useAuthStore();
  const { usage, fetchUsage } = useSubscriptionStore();
  const [tagInput, setTagInput] = useState("");

  // FIXED: Initialize with note values directly, not empty
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

  // Initialize content state from note prop
  useEffect(() => {
    if (note?.content) {
      setContent(note.content);
    }
  }, [note?.content]);

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

    if (content.length < 10) {
      setError("content", {
        type: "manual",
        message: "Konten minimal 10 karakter",
      });
    } else if (content.length > 50000) {
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
    const text = html.replace(/<[^>]*>/g, "").trim();
    setContent(text.length > 0 ? html : "");
  };

  // Handle add tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const newTag = tagInput.trim().toLowerCase();

    if (newTag.length < 2) {
      toast.error("Tag terlalu pendek", { description: "Tag minimal 2 karakter" });
      return;
    }

    if (newTag.length > 20) {
      toast.error("Tag terlalu panjang", { description: "Tag maksimal 20 karakter" });
      return;
    }

    if (!/^[a-z0-9-]+$/.test(newTag)) {
      toast.error("Format tag tidak valid", { description: "Hanya huruf kecil, angka, dan dash (-)" });
      return;
    }

    if (tags.includes(newTag)) {
      toast.warning("Tag sudah ada", { description: `Tag "${newTag}" sudah ditambahkan` });
      return;
    }

    if (usage && tags.length >= usage.tagsLimit) {
      toast.error("Batas tag tercapai", {
        description: `Maksimal ${usage.tagsLimit} tag untuk tier ${usage.tier}`,
        duration: 5000,
      });
      return;
    }

    setTags([...tags, newTag]);
    setTagInput("");
    toast.success("Tag ditambahkan", { description: `"${newTag}" berhasil ditambahkan`, duration: 2000 });
  };

  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
    toast.info("Tag dihapus", { description: `"${tag}" telah dihapus`, duration: 2000 });
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
        content,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  });

  const canPublic = usage?.tier !== "free";
  const tagLimitPercentage = usage ? (tags.length / usage.tagsLimit) * 100 : 0;
  const isNearLimit = tagLimitPercentage >= 80;
  const isAtLimit = usage ? tags.length >= usage.tagsLimit : false;
  const isUserAtTagLimit = usage ? usage.tagsUsed >= usage.tagsLimit : false;
  const canAddMoreTags = !isUserAtTagLimit || (isEditMode && tags.length > 0);

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      initial="initial"
      animate="animate"
      variants={cardVariants}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-muted bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-4 md:p-6 space-y-4">
          {/* Title Field - Compact */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm flex items-center gap-2">
              <Type className="w-4 h-4 text-indigo-300" />
              Judul <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Masukkan judul catatan..."
              {...register("title")}
              disabled={isSubmitting}
              className="border-muted focus:border-indigo-500/50 transition-colors"
            />
            {errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.title.message}
              </motion.p>
            )}
          </div>

          {/* Content Field - Tiptap Editor */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-300" />
              Konten <span className="text-red-500">*</span>
            </Label>
            <div className="border border-muted rounded-lg overflow-hidden focus-within:border-indigo-500/50 transition-colors">
              <TiptapEditor
                content={content}
                onChange={handleContentChange}
                placeholder="Tulis catatan Anda di sini..."
                disabled={isSubmitting}
                minHeight="250px"
              />
            </div>
            {errors.content && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {errors.content.message}
              </motion.p>
            )}
            <p className="text-xs text-muted-foreground">Gunakan toolbar untuk format teks</p>
          </div>

          {/* Tags Field - Compact */}
          {canAddMoreTags ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags" className="text-sm flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-indigo-300" />
                  Tag
                </Label>
                {usage && (
                  <Badge
                    variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
                    className="text-xs gap-1"
                  >
                    {tags.length}/{usage.tagsLimit === Infinity ? "∞" : usage.tagsLimit}
                    {isNearLimit && !isAtLimit && <AlertCircle className="w-3 h-3" />}
                  </Badge>
                )}
              </div>

              {/* Tag Input - Compact */}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="tambah-tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={isSubmitting || isAtLimit}
                  className="border-muted focus:border-indigo-500/50 transition-colors text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  disabled={isSubmitting || isAtLimit || !tagInput.trim()}
                  variant="secondary"
                  size="sm"
                  className="px-3"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Tag Limit Warnings - Compact */}
              <AnimatePresence>
                {isAtLimit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-md"
                  >
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <strong>Batas tag tercapai!</strong> Maksimal {usage?.tagsLimit} tag.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tags List - Animated */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  <AnimatePresence>
                    {tags.map((tag) => (
                      <motion.div
                        key={tag}
                        variants={tagVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
                          variant="secondary"
                          className="gap-1 pl-2 pr-1 bg-indigo-500/10 text-amber-400 border-indigo-500/20 hover:bg-indigo-500/20 transition-colors"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-red-500 transition-colors p-0.5 rounded-sm hover:bg-red-500/10"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ) : (
            // Tag field hidden alert
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
            >
              <p className="text-xs text-amber-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Field tag disembunyikan.</strong> Anda sudah mencapai batas {usage?.tagsLimit} tag unik. Hapus
                  tag yang tidak digunakan atau upgrade ke Premium.
                </span>
              </p>
            </motion.div>
          )}

          {/* Visibility Toggle - Compact */}
          <div className="space-y-2">
            <Label className="text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-300" />
              Visibilitas
            </Label>
            <div className="flex gap-3">
              {/* Private */}
              <motion.label
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                  !isPublic
                    ? "border-indigo-500/50 bg-indigo-500/10 shadow-sm"
                    : "border-border hover:border-indigo-500/30 hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  value=""
                  checked={!isPublic}
                  onChange={() => setValue("isPublic", false)}
                  disabled={isSubmitting}
                  className="sr-only"
                />
                <Lock className={`w-4 h-4 ${!isPublic ? "text-indigo-300" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${!isPublic ? "text-indigo-300" : "text-foreground"}`}>
                  Pribadi
                </span>
                {!isPublic && <Check className="w-4 h-4 text-indigo-300" />}
              </motion.label>

              {/* Public */}
              <motion.label
                whileHover={canPublic ? { scale: 1.02 } : {}}
                whileTap={canPublic ? { scale: 0.98 } : {}}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  !canPublic
                    ? "opacity-50 cursor-not-allowed"
                    : isPublic
                    ? "border-green-500/50 bg-green-500/10 shadow-sm cursor-pointer"
                    : "border-border hover:border-green-500/30 hover:bg-green-500/5 cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  value=""
                  checked={isPublic}
                  onChange={() => setValue("isPublic", true)}
                  disabled={isSubmitting || !canPublic}
                  className="sr-only"
                />
                <Globe className={`w-4 h-4 ${isPublic ? "text-green-500" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${isPublic ? "text-green-500" : "text-foreground"}`}>Publik</span>
                {isPublic && <Check className="w-4 h-4 text-green-500" />}
                {!canPublic && (
                  <Badge variant="outline" className="text-xs ml-1">
                    Premium
                  </Badge>
                )}
              </motion.label>
            </div>
            {!canPublic && isPublic && (
              <p className="text-xs text-muted-foreground">Catatan publik hanya untuk Premium & Advance</p>
            )}
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white"
            >
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
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="px-6">
                Batal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.form>
  );
}
