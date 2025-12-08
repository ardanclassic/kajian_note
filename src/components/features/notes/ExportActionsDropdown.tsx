/**
 * ExportActionsDropdown Component
 * Unified dropdown for all export/send actions
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ChevronDown, FileText, FileDown, Send, MessageCircle, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function ExportActionsDropdown({ note, className = "" }: ExportActionsDropdownProps) {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showTelegramButton, setShowTelegramButton] = useState(false);
  const [showWhatsAppButton, setShowWhatsAppButton] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Check permissions
  // const canExport = user?.subscriptionTier === "premium" || user?.subscriptionTier === "advance";
  const canExport = true;
  const sendPDFConfigured = isSendPDFAvailable();

  // Handle export PDF (native print)
  const handleExportPDF = async () => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      await exportNoteToPDF(note);
    } catch (error) {
      console.error("Export PDF error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle export Markdown
  const handleExportMarkdown = () => {
    setShowDropdown(false);
    try {
      exportNoteToMarkdown(note);
    } catch (error) {
      console.error("Export Markdown error:", error);
    }
  };

  // Handle send to Telegram
  const handleTelegramClick = () => {
    setShowDropdown(false);
    setShowTelegramButton(true);
    setShowWhatsAppButton(false);
  };

  // Handle send to WhatsApp
  const handleWhatsAppClick = () => {
    setShowDropdown(false);
    setShowWhatsAppButton(true);
    setShowTelegramButton(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDropdown(!showDropdown)}
        className="gap-2"
        disabled={isExporting}
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown className="w-3 h-3" />
      </Button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -right-[90%] md:right-0 mt-2 w-64 bg-background/80 rounded-lg shadow-lg overflow-hidden z-50"
          >
            {/* Export PDF (Native) */}
            <button
              onClick={handleExportPDF}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left mb-1"
            >
              <FileText className="w-4 h-4 text-yellow-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Export PDF</div>
                <div className="text-xs text-muted-foreground">Via print dialog</div>
              </div>
            </button>

            {/* Export Markdown */}
            <button
              onClick={handleExportMarkdown}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left border-t mb-1"
            >
              <FileDown className="w-4 h-4 text-fuchsia-500" />
              <div className="flex-1">
                <div className="font-medium text-sm">Export Markdown</div>
                <div className="text-xs text-muted-foreground">Download sebagai .md</div>
              </div>
            </button>

            {/* Send to Telegram */}
            {sendPDFConfigured ? (
              canExport ? (
                <button
                  onClick={handleTelegramClick}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left mb-1"
                >
                  <Send className="w-4 h-4 text-blue-400" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Send to Telegram</div>
                    <div className="text-xs text-muted-foreground">Direct to your Telegram</div>
                  </div>
                </button>
              ) : (
                <div className="px-4 py-3 flex items-center gap-3 opacity-50 cursor-not-allowed">
                  <Lock className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Send to Telegram
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Premium only</div>
                  </div>
                </div>
              )
            ) : null}

            {/* Send to WhatsApp */}
            {sendPDFConfigured ? (
              canExport ? (
                <button
                  onClick={handleWhatsAppClick}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-accent transition-colors text-left border-t mb-1"
                >
                  <MessageCircle className="w-4 h-4 text-green-500" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Send to WhatsApp</div>
                    <div className="text-xs text-muted-foreground">Share via WhatsApp link</div>
                  </div>
                </button>
              ) : (
                <div className="px-4 py-3 flex items-center gap-3 opacity-50 cursor-not-allowed border-t">
                  <Lock className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="font-medium text-sm flex items-center gap-2">
                      Send to WhatsApp
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <div className="text-xs text-muted-foreground">Premium only</div>
                  </div>
                </div>
              )
            ) : null}

            {/* Premium CTA (if free user) */}
            {!canExport && sendPDFConfigured && (
              <div className="px-4 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-t">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-semibold text-yellow-600">Upgrade to Premium</span>
                </div>
                <p className="text-xs text-muted-foreground">Dapatkan fitur send to Telegram & WhatsApp</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Telegram Button (when activated) */}
      <AnimatePresence>
        {showTelegramButton && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -right-full md:right-0 mt-2 w-80 z-50"
          >
            <div className="bg-background rounded-lg shadow-lg p-4">
              <SendToTelegramButton
                note={note}
                variant="default"
                size="sm"
                className="w-full"
                onExit={() => setShowTelegramButton(false)}
                onSuccess={() => {
                  setTimeout(() => setShowTelegramButton(false), 3000);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp Button (when activated) */}
      <AnimatePresence>
        {showWhatsAppButton && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -right-full md:right-0 mt-2 w-80 z-50"
          >
            <div className="bg-background rounded-lg shadow-lg p-4">
              <SendToWhatsAppButton
                note={note}
                variant="default"
                size="sm"
                className="w-full"
                onExit={() => setShowWhatsAppButton(false)}
                onSuccess={() => {
                  setTimeout(() => setShowWhatsAppButton(false), 5000);
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {(showDropdown || showTelegramButton || showWhatsAppButton) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowDropdown(false);
            setShowTelegramButton(false);
            setShowWhatsAppButton(false);
          }}
        />
      )}
    </div>
  );
}
