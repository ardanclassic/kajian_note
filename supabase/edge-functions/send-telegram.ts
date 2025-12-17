/**
 * Supabase Edge Function: send-telegram
 * Send PDF file to user's Telegram via Telegram Bot API
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Request body interface
 */
interface SendTelegramRequest {
  chat_id: string;
  pdf_url: string;
  note_title: string;
  note_id?: string;
}

/**
 * Telegram sendDocument API response
 */
interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      type: string;
    };
    document?: {
      file_id: string;
      file_name: string;
      file_size: number;
    };
  };
  description?: string;
  error_code?: number;
}

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get Telegram bot token from environment
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN is not configured");
    }

    // Parse request body
    const body: SendTelegramRequest = await req.json();
    const { chat_id, pdf_url, note_title, note_id } = body;

    // Validate required fields
    if (!chat_id || !pdf_url || !note_title) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: chat_id, pdf_url, note_title",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[Telegram] Sending PDF to chat_id: ${chat_id}`);
    console.log(`[Telegram] Note: ${note_title}`);
    console.log(`[Telegram] PDF URL: ${pdf_url}`);

    // Step 1: Download PDF from ImageKit
    console.log("[Telegram] Downloading PDF from ImageKit...");
    const pdfResponse = await fetch(pdf_url);

    if (!pdfResponse.ok) {
      throw new Error(`Failed to download PDF: ${pdfResponse.statusText}`);
    }

    const pdfBlob = await pdfResponse.blob();
    const pdfSize = pdfBlob.size;
    console.log(`[Telegram] PDF downloaded: ${(pdfSize / 1024 / 1024).toFixed(2)} MB`);

    // Check Telegram file size limit (50 MB)
    if (pdfSize > 50 * 1024 * 1024) {
      throw new Error("PDF file size exceeds Telegram limit (50 MB)");
    }

    // Step 2: Prepare form data for Telegram
    const formData = new FormData();
    formData.append("chat_id", chat_id);
    formData.append("document", pdfBlob, `${sanitizeFilename(note_title)}.pdf`);

    // Add caption with note info
    const caption = generateCaption(note_title, note_id);
    formData.append("caption", caption);
    formData.append("parse_mode", "Markdown");

    // Step 3: Send to Telegram Bot API
    console.log("[Telegram] Sending to Telegram Bot API...");
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`;

    const telegramResponse = await fetch(telegramApiUrl, {
      method: "POST",
      body: formData,
    });

    const telegramData: TelegramResponse = await telegramResponse.json();

    if (!telegramData.ok) {
      throw new Error(
        `Telegram API error: ${telegramData.description || "Unknown error"} (code: ${telegramData.error_code})`
      );
    }

    console.log("[Telegram] PDF sent successfully!");
    console.log(`[Telegram] Message ID: ${telegramData.result?.message_id}`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "PDF sent to Telegram successfully",
        message_id: telegramData.result?.message_id,
        file_size: pdfSize,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[Telegram] Error:", error);

    // Return error response
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        success: false,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Generate caption for Telegram message
 */
function generateCaption(noteTitle: string, noteId?: string): string {
  const lines: string[] = [];

  lines.push("📚 *Catatan Kajian*");
  lines.push("");
  lines.push(`*${escapeMarkdown(noteTitle)}*`);
  lines.push("");

  if (noteId) {
    lines.push(`ID: \`${noteId}\``);
    lines.push("");
  }

  lines.push("━━━━━━━━━━━━━━━");
  lines.push("by Kajian Note_");

  return lines.join("\n");
}

/**
 * Escape special characters for Telegram Markdown
 */
function escapeMarkdown(text: string): string {
  // Escape special Markdown characters
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

/**
 * Sanitize filename for safe file naming
 */
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .substring(0, 50);
}
