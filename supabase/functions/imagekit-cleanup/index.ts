/**
 * Supabase Edge Function: imagekit-cleanup
 * 
 * Purpose: Automatically delete expired PDF files from ImageKit
 * Trigger: Called by cron job every hour
 * 
 * Flow:
 * 1. Query expired files from database
 * 2. Delete files from ImageKit
 * 3. Update deleted_at in database
 * 4. Return cleanup summary
 */ import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
/**
 * Safe base64 encode (handles special characters in private key)
 */ function safeBase64Encode(str) {
  try {
    return btoa(str);
  } catch  {
    // Fallback for Unicode/special characters
    return btoa(unescape(encodeURIComponent(str)));
  }
}
/**
 * Delete file from ImageKit
 */ async function deleteFromImageKit(fileId, privateKey) {
  try {
    const authHeader = "Basic " + safeBase64Encode(`${privateKey}:`);
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[ImageKit] Delete failed for ${fileId}:`, errorData);
      return false;
    }
    console.log(`[ImageKit] ✅ Deleted: ${fileId}`);
    return true;
  } catch (error) {
    console.error(`[ImageKit] Error deleting ${fileId}:`, error);
    return false;
  }
}
/**
 * Main cleanup handler
 */ serve(async (req)=>{
  const startTime = Date.now();
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
  };
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    console.log("[Cleanup] Starting ImageKit cleanup job...");
    // Initialize Supabase client with service role key (bypass RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Get ImageKit credentials
    const imagekitPrivateKey = Deno.env.get("IMAGEKIT_PRIVATE_KEY");
    if (!imagekitPrivateKey) {
      throw new Error("IMAGEKIT_PRIVATE_KEY not configured");
    }
    // Step 1: Query expired files from database
    console.log("[Cleanup] Querying expired files...");
    const { data: expiredFiles, error: queryError } = await supabase.from("imagekit_temp_uploads").select("id, file_id, file_url, file_name, expires_at").lt("expires_at", new Date().toISOString()).is("deleted_at", null).order("expires_at", {
      ascending: true
    });
    if (queryError) {
      throw new Error(`Database query failed: ${queryError.message}`);
    }
    console.log(`[Cleanup] Found ${expiredFiles?.length || 0} expired files`);
    if (!expiredFiles || expiredFiles.length === 0) {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      return new Response(JSON.stringify({
        success: true,
        message: "No expired files to clean up",
        stats: {
          foundExpired: 0,
          deleted: 0,
          failed: 0,
          duration: `${duration}s`
        }
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      });
    }
    // Step 2: Delete files from ImageKit
    console.log("[Cleanup] Deleting files from ImageKit...");
    let deletedCount = 0;
    let failedCount = 0;
    const errors = [];
    const deletedFileIds = [];
    for (const file of expiredFiles){
      console.log(`[Cleanup] Processing: ${file.file_name} (${file.file_id})`);
      const deleted = await deleteFromImageKit(file.file_id, imagekitPrivateKey);
      if (deleted) {
        deletedCount++;
        deletedFileIds.push(file.id);
      } else {
        failedCount++;
        errors.push(`Failed to delete ${file.file_name} (${file.file_id})`);
      }
    }
    // Step 3: Update deleted_at in database for successfully deleted files
    if (deletedFileIds.length > 0) {
      console.log(`[Cleanup] Updating database for ${deletedFileIds.length} deleted files...`);
      const { error: updateError } = await supabase.from("imagekit_temp_uploads").update({
        deleted_at: new Date().toISOString()
      }).in("id", deletedFileIds);
      if (updateError) {
        console.error("[Cleanup] Failed to update database:", updateError);
        errors.push(`Database update failed: ${updateError.message}`);
      } else {
        console.log(`[Cleanup] ✅ Database updated for ${deletedFileIds.length} files`);
      }
    }
    // Step 4: Return summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const response = {
      success: failedCount === 0,
      message: `Cleanup completed: ${deletedCount} deleted, ${failedCount} failed`,
      stats: {
        foundExpired: expiredFiles.length,
        deleted: deletedCount,
        failed: failedCount,
        duration: `${duration}s`
      }
    };
    if (errors.length > 0) {
      response.errors = errors;
    }
    console.log("[Cleanup] Job completed:", response.stats);
    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("[Cleanup] Fatal error:", error);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    return new Response(JSON.stringify({
      success: false,
      message: `Cleanup failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      stats: {
        foundExpired: 0,
        deleted: 0,
        failed: 0,
        duration: `${duration}s`
      },
      errors: [
        error instanceof Error ? error.message : "Unknown error"
      ]
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
}); /* ==============================================================
 * DEPLOYMENT NOTES
 * ==============================================================
 * 
 * 1. Required Environment Variables (set in Supabase Dashboard):
 *    - SUPABASE_URL (auto-set)
 *    - SUPABASE_SERVICE_ROLE_KEY (auto-set)
 *    - IMAGEKIT_PRIVATE_KEY (manual - add in Settings > Edge Functions > Secrets)
 *    - IMAGEKIT_PUBLIC_KEY (optional)
 *    - IMAGEKIT_URL_ENDPOINT (optional)
 * 
 * 2. Deploy Command:
 *    supabase functions deploy imagekit-cleanup
 * 
 * 3. Test Invoke:
 *    curl -i --location --request POST \
 *      'https://YOUR_PROJECT.supabase.co/functions/v1/imagekit-cleanup' \
 *      --header 'Authorization: Bearer YOUR_ANON_KEY' \
 *      --header 'Content-Type: application/json'
 * 
 * 4. Setup Cron (Next step - Tahap 5):
 *    Will be configured via pg_cron to run every hour
 * 
 * ==============================================================
 */ 
