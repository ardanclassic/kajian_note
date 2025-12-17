// src/pages/admin/ManualPaymentRecovery.tsx
/**
 * Manual Payment Recovery
 * Untuk admin mencocokkan manual payment yang email-nya tidak match
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Search, CheckCircle } from "lucide-react";

export function ManualPaymentRecovery() {
  const [searchEmail, setSearchEmail] = useState("");
  const [webhookData, setWebhookData] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search unmatched webhook by payment email
  const searchUnmatchedWebhook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payment_webhooks")
        .select("*")
        .eq("customer_email", searchEmail)
        .eq("processed", true)
        .not("error_message", "is", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        toast.error("Webhook tidak ditemukan untuk email ini");
        setWebhookData(null);
        return;
      }

      setWebhookData(data);
      toast.success("Webhook ditemukan!");

      // Search possible users (fuzzy match by name/username)
      const emailUsername = searchEmail.split("@")[0].toLowerCase();
      const { data: possibleUsers } = await supabase
        .from("users")
        .select("id, username, email, full_name")
        .or(`username.ilike.%${emailUsername}%,email.ilike.%${emailUsername}%,full_name.ilike.%${emailUsername}%`);

      setUsers(possibleUsers || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mencari webhook");
    } finally {
      setLoading(false);
    }
  };

  // Manually match webhook to user
  const manualMatch = async () => {
    if (!webhookData || !selectedUser) {
      toast.error("Pilih user terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const { payload } = webhookData;
      const { data: webhookPayload } = payload;
      const { message_data } = webhookPayload;
      const { refId, items, totals } = message_data;

      const productTitle = items?.[0]?.title?.toLowerCase() || "";
      const tier = productTitle.includes("advance") ? "advance" : "premium";

      // Update subscription
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_tier: tier,
          subscription_status: "active",
          subscription_start_date: startDate.toISOString(),
          subscription_end_date: endDate.toISOString(),
        })
        .eq("id", selectedUser.id);

      if (updateError) throw updateError;

      // Insert subscription record
      const { error: insertError } = await supabase.from("subscriptions").insert({
        user_id: selectedUser.id,
        tier: tier,
        status: "active",
        payment_method: "lynk_id",
        payment_id: refId,
        payment_status: "success",
        amount: totals?.grandTotal || 0,
        currency: "IDR",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        customer_email: webhookData.customer_email,
        customer_name: message_data.customer?.name,
        customer_phone: message_data.customer?.phone,
      });

      if (insertError) throw insertError;

      // Mark webhook as processed successfully
      await supabase
        .from("payment_webhooks")
        .update({
          error_message: null,
          matched_user_id: selectedUser.id,
        })
        .eq("id", webhookData.id);

      // Create admin alert for manual match
      await supabase.from("admin_alerts").insert({
        type: "manual_payment_match",
        severity: "medium",
        message: `Manual match: ${webhookData.customer_email} → ${selectedUser.email}`,
        data: {
          webhook_id: webhookData.id,
          user_id: selectedUser.id,
          payment_email: webhookData.customer_email,
          user_email: selectedUser.email,
        },
        resolved: true,
      });

      toast.success(`Subscription ${tier} berhasil diaktifkan untuk ${selectedUser.email}`);

      // Reset form
      setWebhookData(null);
      setSelectedUser(null);
      setUsers([]);
      setSearchEmail("");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Gagal manual matching");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Manual Payment Recovery</CardTitle>
          <CardDescription>Cocokkan manual pembayaran yang email-nya tidak match dengan sistem</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Search Webhook */}
          <div className="space-y-2">
            <Label htmlFor="email">Email yang Digunakan untuk Pembayaran</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="email@yang-digunakan-bayar.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Button onClick={searchUnmatchedWebhook} disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                Cari
              </Button>
            </div>
          </div>

          {/* Step 2: Show Webhook Info */}
          {webhookData && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Webhook Ditemukan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Payment ID:</span> {webhookData.payment_id}
                </div>
                <div>
                  <span className="font-semibold">Email di Webhook:</span> {webhookData.customer_email}
                </div>
                <div>
                  <span className="font-semibold">Tanggal:</span> {new Date(webhookData.created_at).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Error:</span> {webhookData.error_message}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Select User */}
          {webhookData && users.length > 0 && (
            <div className="space-y-2">
              <Label>Pilih User yang Tepat</Label>
              <Select
                onValueChange={(value: any) => {
                  const user = users.find((u) => u.id === value);
                  setSelectedUser(user);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Step 4: Manual search if no users found */}
          {webhookData && users.length === 0 && (
            <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
              <p className="text-sm text-destructive">
                Tidak ada user yang cocok. Silakan cari manual berdasarkan username atau email di database.
              </p>
            </div>
          )}

          {/* Step 5: Confirm Button */}
          {webhookData && selectedUser && (
            <div className="space-y-4">
              <Card className="bg-primary/10 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Akan mengaktifkan subscription untuk: {selectedUser.email}</span>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={manualMatch} disabled={loading} className="w-full" size="lg">
                {loading ? "Memproses..." : "Konfirmasi & Aktifkan Subscription"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
