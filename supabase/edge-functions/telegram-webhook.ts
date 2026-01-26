import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers untuk allow request dari Telegram
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const update = await req.json();

    // Extract message
    const message = update.message;
    if (!message || !message.text) {
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    const chatId = message.chat.id;
    const text = message.text;
    const username = message.from?.username;

    // Handle /start command
    if (text === "/start") {
      await sendTelegramMessage(chatId, getStartMessage());
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /verify command
    if (text.startsWith("/verify ")) {
      const kajianUsername = text.replace("/verify ", "").trim();

      // Verify user in database
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, full_name")
        .eq("username", kajianUsername)
        .single();

      if (error || !user) {
        await sendTelegramMessage(
          chatId,
          `❌ Username "${kajianUsername}" tidak ditemukan.\n\nPastikan username Anda benar.`
        );
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Update user with chat_id
      const { error: updateError } = await supabase
        .from("users")
        .update({
          telegram_chat_id: chatId.toString(),
          telegram_verified_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        await sendTelegramMessage(chatId, "❌ Gagal verifikasi. Silakan coba lagi.");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      // Success!
      await sendTelegramMessage(
        chatId,
        `✅ Verifikasi Berhasil!\n\n` +
          `Username: ${user.username}\n` +
          `Nama: ${user.full_name}\n` +
          `Chat ID: ${chatId}\n\n` +
          `Anda sekarang dapat menerima PDF catatan dari Alwaah!`
      );

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /help command
    if (text === "/help") {
      await sendTelegramMessage(chatId, getHelpMessage());
      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    // Handle /status command
    if (text === "/status") {
      // Check if user verified
      const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

      const { data: user } = await supabase
        .from("users")
        .select("username, full_name, telegram_verified_at")
        .eq("telegram_chat_id", chatId.toString())
        .single();

      if (!user) {
        await sendTelegramMessage(chatId, "❌ Anda belum verifikasi.\n\nGunakan /verify username_anda");
        return new Response("OK", { status: 200, headers: corsHeaders });
      }

      await sendTelegramMessage(
        chatId,
        `📊 Status Verifikasi\n\n` +
          `✅ Status: Terverifikasi\n` +
          `👤 Username: ${user.username}\n` +
          `💬 Chat ID: ${chatId}\n` +
          `📅 Diverifikasi: ${new Date(user.telegram_verified_at).toLocaleDateString("id-ID")}`
      );

      return new Response("OK", { status: 200, headers: corsHeaders });
    }

    return new Response("OK", { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendTelegramMessage(chatId: number, text: string) {
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
    }),
  });
}

function getStartMessage(): string {
  return (
    `👋 Selamat datang di Alwaah Bot!\n\n` +
    `Bot ini digunakan untuk menerima PDF catatan kajian Anda langsung di Telegram.\n\n` +
    `📝 Cara Verifikasi:\n` +
    `1. Login ke Alwaah (alwaah.id)\n` +
    `2. Buka halaman Profil\n` +
    `3. Catat username Anda\n` +
    `4. Kirim perintah:\n` +
    `   /verify username_anda\n\n` +
    `Contoh:\n` +
    `/verify derrypratama\n\n` +
    `💡 Butuh bantuan? Kirim /help`
  );
}

function getHelpMessage(): string {
  return (
    `📖 Panduan Penggunaan Alwaah Bot\n\n` +
    `📝 Verifikasi Akun:\n` +
    `/verify username_anda\n\n` +
    `📊 Cek Status:\n` +
    `/status\n\n` +
    `❓ FAQ:\n\n` +
    `Q: Kenapa harus verifikasi?\n` +
    `A: Untuk menghubungkan akun Alwaah Anda dengan Telegram.\n\n` +
    `Q: Apakah aman?\n` +
    `A: Ya! Kami hanya menyimpan Chat ID Telegram Anda.\n\n` +
    `━━━━━━━━━━━━━━━━\n` +
    `Butuh bantuan lebih lanjut?\n` +
    `Hubungi: support@kajiannote.com`
  );
}
