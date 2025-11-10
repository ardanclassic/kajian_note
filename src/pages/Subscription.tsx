/**
 * Subscription Page - ENHANCED UI/UX with PageHeader
 * Beautiful, modern subscription management with best practices
 */

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { SimplePageHeader } from "@/components/common/PageHeader";
import { SubscriptionCard } from "@/components/features/subscription/SubscriptionCard";
import { PricingTable } from "@/components/features/subscription/PricingTable";
import { UpgradeModal } from "@/components/features/subscription/UpgradeModal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type SubscriptionTier } from "@/config/payment";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  CreditCard,
  History,
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface Subscription {
  id: string;
  tier: SubscriptionTier;
  status: string;
  start_date: string;
  end_date: string;
  amount: number;
  payment_method: string;
}

export default function Subscription() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("premium");

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast.error("Gagal memuat data subscription");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === "free") {
      toast.info("Anda sudah menggunakan paket gratis");
      return;
    }

    if (tier === user?.subscriptionTier) {
      toast.info("Anda sudah menggunakan paket ini");
      return;
    }

    setSelectedTier(tier);
    setUpgradeModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Memuat data subscription...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>Silakan login terlebih dahulu untuk mengakses halaman subscription</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentSubscription = subscriptions.find(
    (sub) => sub.status === "active" && sub.tier === user.subscriptionTier
  );

  // Calculate days remaining
  const daysRemaining = currentSubscription?.end_date
    ? Math.ceil((new Date(currentSubscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <SimplePageHeader
        badgeIcon={Crown}
        badgeText="Subscription Management"
        title="Tingkatkan Pengalaman Anda"
        description="Pilih paket yang sesuai dengan kebutuhan Anda dan nikmati fitur premium"
      />

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Expiry Warning */}
        {user.subscriptionTier !== "free" && user.subscriptionStatus === "active" && isExpiringSoon && (
          <Alert className="border-orange-500 bg-orange-500/10">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <AlertTitle>Subscription Akan Berakhir</AlertTitle>
            <AlertDescription>
              Subscription Anda akan berakhir dalam <strong>{daysRemaining} hari</strong> lagi. Perpanjang sekarang
              untuk tetap menikmati fitur premium.
              <Button size="sm" className="mt-3" onClick={() => setUpgradeModalOpen(true)}>
                Perpanjang Sekarang
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Current Subscription - Enhanced Card */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Subscription Aktif</h2>
              <p className="text-sm text-muted-foreground">Status dan detail paket Anda</p>
            </div>
          </div>

          {/* Current Tier Status Card */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Crown className="h-6 w-6 text-primary" />
                    {user.subscriptionTier === "free"
                      ? "Gratis"
                      : user.subscriptionTier === "premium"
                      ? "Premium"
                      : "Advance"}
                  </CardTitle>
                  <CardDescription>
                    {user.subscriptionTier === "free"
                      ? "Paket dasar untuk memulai"
                      : user.subscriptionTier === "premium"
                      ? "Paket populer untuk pengguna aktif"
                      : "Paket lengkap tanpa batas"}
                  </CardDescription>
                </div>
                <Badge variant={user.subscriptionStatus === "active" ? "default" : "destructive"} className="text-xs">
                  {user.subscriptionStatus === "active" ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aktif
                    </>
                  ) : (
                    "Tidak Aktif"
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subscription Details */}
              {user.subscriptionTier !== "free" && currentSubscription && (
                <div className="grid gap-3 p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mulai</span>
                    <span className="font-medium">
                      {new Date(currentSubscription.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Berakhir</span>
                    <span className="font-medium">
                      {new Date(currentSubscription.end_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {daysRemaining !== null && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Sisa Waktu</span>
                      <Badge variant="outline" className="font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        {daysRemaining} hari
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {user.subscriptionTier === "free" ? (
                <Button className="w-full" size="lg" onClick={() => setUpgradeModalOpen(true)}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upgrade ke Premium
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button variant="outline" className="w-full" onClick={() => setUpgradeModalOpen(true)}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Perpanjang atau Upgrade
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        {user.subscriptionTier === "free" && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardHeader>
                <Zap className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle className="text-lg">Lebih Banyak Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Dapatkan hingga 100 catatan atau unlimited dengan paket premium
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardHeader>
                <Shield className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle className="text-lg">Fitur Premium</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Akses catatan publik, export PDF, dan banyak lagi</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                <CardTitle className="text-lg">Tanpa Batas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Paket Advance memberikan akses unlimited tanpa batasan</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Plans */}
        <div>
          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl font-bold">Pilih Paket Yang Tepat</h2>
            <p className="text-muted-foreground">Semua paket sudah termasuk fitur dasar dan dukungan</p>
          </div>
          <PricingTable currentTier={user.subscriptionTier as SubscriptionTier} onSelectPlan={handleSelectPlan} />
        </div>

        {/* Subscription History */}
        {subscriptions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-primary/10 rounded-lg">
                <History className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Riwayat Subscription</h2>
                <p className="text-sm text-muted-foreground">Semua transaksi dan perpanjangan Anda</p>
              </div>
            </div>

            <div className="space-y-3">
              {subscriptions.map((sub) => {
                const isPaid = sub.tier !== "free";
                const statusColor =
                  sub.status === "active"
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-gray-500/10 text-gray-500 border-gray-500/20";

                return (
                  <Card key={sub.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Crown className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold capitalize flex items-center gap-2">
                              {sub.tier}
                              <Badge className={statusColor}>{sub.status}</Badge>
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(sub.start_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              -{" "}
                              {new Date(sub.end_date).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isPaid ? (
                            <>
                              <p className="text-lg font-bold">Rp {sub.amount.toLocaleString("id-ID")}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {sub.payment_method || "Manual"}
                              </p>
                            </>
                          ) : (
                            <Badge variant="outline">Gratis</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* FAQ / Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Butuh Bantuan?</CardTitle>
            <CardDescription>Hubungi admin jika Anda memiliki pertanyaan tentang subscription</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">Subscription akan otomatis aktif setelah pembayaran berhasil</p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">
                  Perpanjangan dapat dilakukan kapan saja sebelum masa aktif berakhir
                </p>
              </div>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-muted-foreground">Data catatan Anda tetap aman meskipun subscription berakhir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        selectedTier={selectedTier}
        userEmail={user.email || ""}
      />
    </div>
  );
}
