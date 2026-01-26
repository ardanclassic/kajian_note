/**
 * TiptapEditor Component - ENHANCED with STICKY TOOLBAR (Page Scroll)
 * - Toolbar sticky relatif terhadap viewport
 * - Editor content expand natural (NO internal scroll)
 * - Scrollbar di window/page level
 */

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Quote,
  Undo,
  Redo,
  Link2,
  Link2Off,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
  maxLength?: number; // Optional max character limit (for Deep Note: 100K)
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Tulis catatan Anda di sini...",
  disabled = false,
  minHeight = "250px",
  maxLength, // No default - unlimited if not specified
}: TiptapEditorProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-indigo-300 underline hover:text-amber-400 transition-colors",
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none p-4 rounded-md",
          "prose-headings:text-foreground prose-p:text-foreground",
          "prose-strong:text-foreground prose-em:text-foreground",
          "prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground",
          "prose-blockquote:border-indigo-500 prose-blockquote:text-muted-foreground",
          `min-h-[${minHeight}]`
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editable: !disabled,
  });

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Update editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // Detect window scroll for toolbar shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!editor) {
    return null;
  }

  // Add link handler
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL:", previousUrl);

    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  // Toolbar button component
  const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    disabled?: boolean;
    icon: any;
    title: string;
  }) => (
    <motion.div whileHover={{ scale: disabled ? 1 : 1.05 }} whileTap={{ scale: disabled ? 1 : 0.95 }}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "h-8 w-8 p-0 transition-colors",
          isActive ? "bg-indigo-500/20 text-amber-400 hover:bg-indigo-500/30" : "hover:bg-muted/80"
        )}
        title={title}
      >
        <Icon className="w-4 h-4" />
      </Button>
    </motion.div>
  );

  return (
    <div className="border-0 rounded-lg overflow-visible bg-background">
      {/* Toolbar - STICKY (relatif terhadap viewport) */}
      <div
        className={cn(
          "sticky top-16 z-10",
          "border-b bg-muted/95 backdrop-blur-md",
          "p-2 flex flex-wrap gap-1",
          "transition-all duration-200",
          "rounded-t-lg",
          isScrolled && "shadow-lg shadow-black/10"
        )}
      >
        {/* Text Formatting */}
        <div className="flex gap-0.5 pr-2 mr-1 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            disabled={disabled || !editor.can().chain().focus().toggleBold().run()}
            icon={Bold}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            disabled={disabled || !editor.can().chain().focus().toggleItalic().run()}
            icon={Italic}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            disabled={disabled || !editor.can().chain().focus().toggleStrike().run()}
            icon={Strikethrough}
            title="Strikethrough"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-0.5 pr-2 mr-1 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            icon={Heading2}
            title="Heading 2"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-0.5 pr-2 mr-1 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            disabled={disabled}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            disabled={disabled}
            icon={ListOrdered}
            title="Numbered List"
          />
        </div>

        {/* Blockquote */}
        <div className="flex gap-0.5 pr-2 mr-1 border-r border-border">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            disabled={disabled}
            icon={Quote}
            title="Quote"
          />
        </div>

        {/* Link */}
        <div className="flex gap-0.5 pr-2 mr-1 border-r border-border">
          <ToolbarButton
            onClick={setLink}
            isActive={editor.isActive("link")}
            disabled={disabled}
            icon={Link2}
            title="Add Link"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            disabled={disabled || !editor.isActive("link")}
            icon={Link2Off}
            title="Remove Link"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-0.5">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().chain().focus().undo().run()}
            icon={Undo}
            title="Undo (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().chain().focus().redo().run()}
            icon={Redo}
            title="Redo (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Editor Content - Natural Expansion (NO internal scroll) */}
      <div
        className={cn("prose-editor transition-opacity p-3 md:px-0", disabled && "opacity-60 cursor-not-allowed")}
        style={{ minHeight }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
