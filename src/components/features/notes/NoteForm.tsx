/**
 * NoteForm Component - ENHANCED with Sticky Action Buttons
 * - Auto-save to localStorage (debounced)
 * - Load persisted data on mount
 * - Tiptap editor integration
 * - Sticky action buttons at bottom
 */

import { useState, useEffect, useCallback } from "react";
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
import { Save, Plus, Loader2, Tag as TagIcon, Type, FileText, X, AlertCircle } from "lucide-react";
import { createNoteSchema, type CreateNoteFormData } from "@/schemas/notes.schema";
import { SYSTEM_LIMITS } from "@/config/subscriptionLimits";
import { debounce, cn } from "@/lib/utils";
import { loadFormData, saveFormFields } from "@/utils/formPersistence";
import type { Note } from "@/types/notes.types";
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
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(note?.tags || []);
  const [content, setContent] = useState(note?.content || "");
  const [isScrolled, setIsScrolled] = useState(false);

  const isEditMode = !!note;
  const maxTagsPerNote = SYSTEM_LIMITS.maxTagsPerNote;

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
  const title = watch("title");

  // Detect window scroll for action buttons shadow
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const clientHeight = window.innerHeight;

      // Show shadow when not at bottom (with 50px threshold)
      setIsScrolled(scrollHeight - scrollTop - clientHeight > 50);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load persisted data on mount (only for new notes)
  useEffect(() => {
    if (!isEditMode) {
      const persisted = loadFormData();
      if (persisted?.formData && !note) {
        const {
          title: savedTitle,
          content: savedContent,
          tags: savedTags,
          isPublic: savedIsPublic,
        } = persisted.formData;

        // Only restore if note prop is not provided (i.e., not from YouTube import)
        if (savedTitle) {
          setValue("title", savedTitle);
        }
        if (savedContent) {
          setContent(savedContent);
          setValue("content", savedContent);
        }
        if (savedTags && savedTags.length > 0) {
          setTags(savedTags);
          setValue("tags", savedTags);
        }
        setValue("isPublic", savedIsPublic);

        console.log("[NoteForm] Form data dipulihkan dari localStorage");
      }
    }
  }, [isEditMode, note, setValue]);

  // Initialize content state from note prop
  useEffect(() => {
    if (note?.content) {
      setContent(note.content);
    }
  }, [note?.content]);

  // Debounced auto-save function
  const debouncedSave = useCallback(
    debounce((title: string, content: string, tags: string[], isPublic: boolean) => {
      if (!isEditMode) {
        saveFormFields(title, content, tags, isPublic);
        console.log("[NoteForm] Auto-saved to localStorage");
      }
    }, 1000), // 1 second debounce
    [isEditMode]
  );

  // Auto-save when form fields change
  useEffect(() => {
    if (!isEditMode) {
      debouncedSave(title, content, tags, isPublic);
    }
  }, [title, content, tags, isPublic, debouncedSave, isEditMode]);

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

    if (tags.length >= maxTagsPerNote) {
      toast.error("Batas tag tercapai", {
        description: `Maksimal ${maxTagsPerNote} tag per catatan`,
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

  const canPublic = user?.subscriptionTier !== "free";
  const tagLimitPercentage = (tags.length / maxTagsPerNote) * 100;
  const isNearLimit = tagLimitPercentage >= 80;
  const isAtLimit = tags.length >= maxTagsPerNote;

  return (
    <>
      <motion.form
        onSubmit={handleFormSubmit}
        initial="initial"
        animate="animate"
        variants={cardVariants}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-none md:border-muted bg-card/50 backdrop-blur-sm overflow-visible">
          <CardContent className="p-0 md:p-6 space-y-4 pb-24 md:pb-28">
            {/* Title Field */}
            <div className="space-y-2 mb-8">
              <Label htmlFor="title" className="text-sm flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Masukkan judul catatan..."
                {...register("title")}
                disabled={isSubmitting}
                className="border-muted focus:border-primary/50 transition-colors"
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
                <FileText className="w-4 h-4 text-primary" />
                Konten <span className="text-red-500">*</span>
              </Label>
              <div className="border border-muted rounded-lg overflow-visible focus-within:border-primary/50 transition-colors">
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

            {/* Tags Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tags" className="text-sm flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-primary" />
                  Tag
                </Label>
                <Badge
                  variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
                  className="text-xs gap-1"
                >
                  {tags.length}/{maxTagsPerNote}
                  {isNearLimit && !isAtLimit && <AlertCircle className="w-3 h-3" />}
                </Badge>
              </div>

              {/* Tag Input */}
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="tambah-tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  disabled={isSubmitting || isAtLimit}
                  className="border-muted focus:border-primary/50 transition-colors text-sm"
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

              {/* Tag Limit Warning */}
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
                      <strong>Batas tag tercapai!</strong> Maksimal {maxTagsPerNote} tag per catatan.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tags List */}
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
                          className="gap-1 pl-2 pr-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors"
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

              <p className="text-xs text-muted-foreground">
                Maksimal {maxTagsPerNote} tag per catatan. Tag membantu organisir catatan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sticky Action Buttons - Outside Card */}
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 z-10",
            "bg-background/95 backdrop-blur-md",
            "border-t transition-all duration-200",
            "p-4 md:p-6",
            isScrolled && "shadow-2xl shadow-black/20"
          )}
        >
          <div className="container mx-auto max-w-4xl">
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
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
          </div>
        </div>
      </motion.form>
    </>
  );
}
