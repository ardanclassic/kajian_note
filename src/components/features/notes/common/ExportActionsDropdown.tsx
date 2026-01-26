/**
 * ExportActionsDialog Component  
 * Fullscreen dialog for all export/send actions
 * Mobile-first design with better UX
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, FileText, FileDown, Send, MessageCircle, Lock, Crown, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { exportNoteToPDF, exportNoteToMarkdown } from "@/utils/exportUtils";
import { SendToTelegramButton } from "./SendToTelegramButton";
import { SendToWhatsAppButton } from "./SendToWhatsAppButton";
import type { Note } from "@/types/notes.types";
import { isSendPDFAvailable } from "@/config/env";

interface ExportActionsDropdownProps {
  note: Note;
  className?: string;
}

type ViewMode = "menu" | "telegram" | "whatsapp";

export function ExportActionsDropdown({ note, className = "" }: ExportActionsDropdownProps) {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("menu");
  const [isExporting, setIsExporting] = useState(false);
  const [isChildLoading, setIsChildLoading] = useState(false);

  // Check permissions
  const canExport = true;
  const sendPDFConfigured = isSendPDFAvailable();

  // Handle export PDF (native print)
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportNoteToPDF(note);
      setOpen(false);
    } catch (error) {
      console.error("Export PDF error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export Markdown
  const handleExportMarkdown = () => {
    try {
      exportNoteToMarkdown(note);
      setOpen(false);
    } catch (error) {
      console.error("Export Markdown error:", error);
    }
  };

  // Reset to menu when dialog closes
  const handleOpenChange = (isOpen: boolean) => {
    // Prevent closing if loading
    if (!isOpen && (isExporting || isChildLoading)) {
      return;
    }

    setOpen(isOpen);
    if (!isOpen) {
      setViewMode("menu");
    }
  };

  const isLoading = isExporting || isChildLoading;

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={`gap-2 ${className}`}
        disabled={isLoading}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>

      {/* Fullscreen Dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md p-0 gap-0 bg-background border-border/50 h-dvh sm:h-auto sm:max-h-[90vh] flex flex-col"
          showCloseButton={!isLoading}
          onInteractOutside={(e) => {
            if (isLoading) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (isLoading) e.preventDefault();
          }}
        >
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border/50 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {viewMode !== "menu" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -ml-2"
                    onClick={() => setViewMode("menu")}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <DialogTitle className="text-base font-semibold">
                  {viewMode === "menu" && "Export Options"}
                  {viewMode === "telegram" && "Via Telegram"}
                  {viewMode === "whatsapp" && "Via WhatsApp"}
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
              {/* Main Menu */}
              {viewMode === "menu" && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-4 space-y-3"
                >
                  {/* Export PDF */}
                  <motion.button
                    onClick={handleExportPDF}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-4 flex items-center gap-4 rounded-xl bg-yellow-500/5 hover:bg-yellow-500/10 border border-yellow-500/20 transition-all duration-200 text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors shrink-0">
                      {isExporting ? (
                        <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                      ) : (
                        <FileText className="w-6 h-6 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base text-foreground">
                        {isExporting ? "Generating PDF..." : "Export PDF"}
                      </div>
                      <div className="text-sm text-muted-foreground">Via print dialog</div>
                    </div>
                  </motion.button>

                  {/* Send to Telegram */}
                  {sendPDFConfigured && (
                    canExport ? (
                      <motion.button
                        onClick={() => setViewMode("telegram")}
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full p-4 flex items-center gap-4 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 transition-all duration-200 text-left group disabled:opacity-50"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors shrink-0">
                          <Send className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-foreground">Send to Telegram</div>
                          <div className="text-sm text-muted-foreground">Direct to your Telegram</div>
                        </div>
                      </motion.button>
                    ) : (
                      <div className="w-full p-4 flex items-center gap-4 rounded-xl bg-muted/20 border border-border/50 opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/30 shrink-0">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-foreground flex items-center gap-2">
                            Send to Telegram
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div className="text-sm text-muted-foreground">Premium only</div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Send to WhatsApp */}
                  {sendPDFConfigured && (
                    canExport ? (
                      <motion.button
                        onClick={() => setViewMode("whatsapp")}
                        disabled={isLoading}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full p-4 flex items-center gap-4 rounded-xl bg-green-500/5 hover:bg-green-500/10 border border-green-500/20 transition-all duration-200 text-left group disabled:opacity-50"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors shrink-0">
                          <MessageCircle className="w-6 h-6 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-foreground">Send to WhatsApp</div>
                          <div className="text-sm text-muted-foreground">Share via WhatsApp link</div>
                        </div>
                      </motion.button>
                    ) : (
                      <div className="w-full p-4 flex items-center gap-4 rounded-xl bg-muted/20 border border-border/50 opacity-50 cursor-not-allowed">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-muted/30 shrink-0">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-base text-foreground flex items-center gap-2">
                            Send to WhatsApp
                            <Crown className="w-4 h-4 text-yellow-500" />
                          </div>
                          <div className="text-sm text-muted-foreground">Premium only</div>
                        </div>
                      </div>
                    )
                  )}

                  {/* Export Markdown */}
                  <motion.button
                    onClick={handleExportMarkdown}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-4 flex items-center gap-4 rounded-xl bg-fuchsia-500/5 hover:bg-fuchsia-500/10 border border-fuchsia-500/20 transition-all duration-200 text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-fuchsia-500/20 group-hover:bg-fuchsia-500/30 transition-colors shrink-0">
                      <FileDown className="w-6 h-6 text-fuchsia-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base text-foreground">Export Markdown</div>
                      <div className="text-sm text-muted-foreground">Download sebagai .md</div>
                    </div>
                  </motion.button>

                  {/* Premium CTA */}
                  {!canExport && sendPDFConfigured && (
                    <div className="mt-4 p-4 rounded-xl bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-5 h-5 text-yellow-500" />
                        <span className="font-bold text-sm text-yellow-600 dark:text-yellow-500">
                          Upgrade to Premium
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Dapatkan fitur send to Telegram & WhatsApp
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Telegram View */}
              {viewMode === "telegram" && (
                <motion.div
                  key="telegram"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6"
                >
                  <SendToTelegramButton
                    note={note}
                    variant="default"
                    size="default"
                    className="w-full"
                    onExit={() => setViewMode("menu")}
                    onLoadingChange={setIsChildLoading}
                    onSuccess={() => {
                      setTimeout(() => setOpen(false), 2000);
                    }}
                  />
                </motion.div>
              )}

              {/* WhatsApp View */}
              {viewMode === "whatsapp" && (
                <motion.div
                  key="whatsapp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="p-6"
                >
                  <SendToWhatsAppButton
                    note={note}
                    variant="default"
                    size="default"
                    className="w-full"
                    onExit={() => setViewMode("menu")}
                    onLoadingChange={setIsChildLoading}
                    onSuccess={() => {
                      setTimeout(() => setOpen(false), 2000);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
