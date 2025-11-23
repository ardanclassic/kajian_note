/**
 * Subscription Page - MODERN REDESIGN WITH FRAMER MOTION
 * Beautiful, interactive subscription management with smooth animations
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UpgradeModal } from "@/components/features/subscription/UpgradeModal";
import { type SubscriptionTier, PAYMENT_CONFIG, formatPrice } from "@/config/payment";
import { supabase } from "@/lib/supabase";
import {
  Loader2,
  AlertCircle,
  Crown,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Shield,
  TrendingUp,
  Check,
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Infinity,
  Star,
  HelpCircle,
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

// Animation variants
const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export default function Subscription() {
  const navigate = useNavigate();
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
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-background via-background to-primary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Memuat data subscription...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Akses Ditolak</AlertTitle>
          <AlertDescription>Silakan login terlebih dahulu</AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentSubscription = subscriptions.find(
    (sub) => sub.status === "active" && sub.tier === user.subscriptionTier
  );

  const daysRemaining = currentSubscription?.end_date
    ? Math.ceil((new Date(currentSubscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const totalDays = 30;
  const progress = daysRemaining !== null ? ((totalDays - daysRemaining) / totalDays) * 100 : 0;
  const isExpiringSoon = daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;

  const plans = [
    {
      tier: "free" as SubscriptionTier,
      name: "Gratis",
      description: "Untuk memulai mencatat",
      icon: FileText,
      gradient: "from-gray-500 to-gray-600",
      popular: false,
    },
    {
      tier: "premium" as SubscriptionTier,
      name: "Premium",
      description: "Untuk pengguna aktif",
      icon: Star,
      gradient: "from-blue-500 to-purple-600",
      popular: true,
    },
    {
      tier: "advance" as SubscriptionTier,
      name: "Advance",
      description: "Untuk pengguna profesional",
      icon: Crown,
      gradient: "from-purple-600 to-pink-600",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b"
      >
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-2 hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto px-4 py-8 space-y-12 max-w-7xl"
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center space-y-4 py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4"
          >
            <Crown className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-primary">Subscription Management</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl leading-normal! font-bold bg-linear-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Tingkatkan Pengalaman Anda
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan Anda dan nikmati fitur premium tanpa batas
          </p>
        </motion.div>

        {/* Expiry Warning */}
        {user.subscriptionTier !== "free" && user.subscriptionStatus === "active" && isExpiringSoon && (
          <motion.div variants={itemVariants}>
            <Alert className="border-orange-500 bg-orange-500/10 backdrop-blur">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <AlertTitle className="text-orange-500">⚠️ Subscription Akan Berakhir</AlertTitle>
              <AlertDescription>
                Subscription Anda akan berakhir dalam <strong className="text-orange-600">{daysRemaining} hari</strong>.
                <Button
                  size="sm"
                  className="mt-3 bg-orange-500 hover:bg-orange-600"
                  onClick={() => setUpgradeModalOpen(true)}
                >
                  Perpanjang Sekarang
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Current Subscription Card */}
        <motion.div variants={itemVariants}>
          <Card className="relative overflow-hidden border-2 border-primary/20 bg-linear-to-br from-card/80 to-primary/5 backdrop-blur-xl">
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-purple-500/10 to-pink-500/10 animate-pulse" />

            <CardHeader className="relative">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <motion.div whileHover={{ scale: 1.05 }} className="inline-flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Crown className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl">
                      {user.subscriptionTier === "free"
                        ? "Gratis"
                        : user.subscriptionTier === "premium"
                        ? "Premium"
                        : "Advance"}
                    </CardTitle>
                  </motion.div>
                  <CardDescription className="text-base">
                    {user.subscriptionTier === "free"
                      ? "Paket dasar untuk memulai"
                      : user.subscriptionTier === "premium"
                      ? "Paket populer untuk pengguna aktif"
                      : "Paket lengkap tanpa batas"}
                  </CardDescription>
                </div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Badge
                    variant={user.subscriptionStatus === "active" ? "default" : "destructive"}
                    className="text-sm px-3 py-1 shadow-lg"
                  >
                    {user.subscriptionStatus === "active" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Aktif
                      </>
                    ) : (
                      "Tidak Aktif"
                    )}
                  </Badge>
                </motion.div>
              </div>
            </CardHeader>

            <CardContent className="relative space-y-6">
              {user.subscriptionTier !== "free" && currentSubscription && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Waktu Tersisa</span>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {daysRemaining} hari
                      </Badge>
                    </div>
                    <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-y-0 left-0 bg-linear-to-r from-primary to-purple-600 rounded-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-4 bg-background/50 rounded-lg border space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Mulai
                      </p>
                      <p className="font-semibold">
                        {new Date(currentSubscription.start_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-background/50 rounded-lg border space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Berakhir
                      </p>
                      <p className="font-semibold">
                        {new Date(currentSubscription.end_date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                {user.subscriptionTier === "free" ? (
                  <Button
                    className="w-full h-12 text-base shadow-lg"
                    size="lg"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Upgrade ke Premium
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-2"
                    size="lg"
                    onClick={() => setUpgradeModalOpen(true)}
                  >
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Perpanjang atau Upgrade
                  </Button>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Grid */}
        {user.subscriptionTier === "free" && (
          <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Lebih Banyak Catatan",
                description: "Dapatkan hingga 100 catatan atau unlimited",
                gradient: "from-blue-500 to-cyan-600",
              },
              {
                icon: Shield,
                title: "Fitur Premium",
                description: "Akses catatan publik, export PDF, dan lainnya",
                gradient: "from-green-500 to-emerald-600",
              },
              {
                icon: Infinity,
                title: "Tanpa Batas",
                description: "Paket Advance unlimited tanpa batasan",
                gradient: "from-purple-500 to-pink-600",
              },
            ].map((benefit, index) => (
              <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.05 }}>
                <Card className="relative overflow-hidden border-2 h-full">
                  <div className={`absolute inset-0 bg-linear-to-br ${benefit.gradient} opacity-10`} />
                  <CardHeader className="relative">
                    <benefit.icon
                      className={`h-10 w-10 bg-linear-to-br ${benefit.gradient} bg-clip-text text-transparent`}
                    />
                    <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pricing Plans */}
        <motion.div variants={itemVariants} className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold">Pilih Paket Yang Tepat</h2>
            <p className="text-muted-foreground text-lg">Semua paket termasuk fitur dasar dan dukungan</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan, index) => {
              const features = PAYMENT_CONFIG.features[plan.tier];
              const price = PAYMENT_CONFIG.prices[plan.tier];
              const isCurrent = user.subscriptionTier === plan.tier;

              return (
                <motion.div
                  key={plan.tier}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, rotateY: 2 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="relative"
                >
                  {plan.popular && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: 3 }}
                      className="absolute -top-4 left-1/2 -translate-x-1/2 z-10"
                    >
                      <Badge className="gap-1 px-3 py-1 shadow-lg bg-linear-to-r from-blue-600 to-purple-600">
                        <Sparkles className="h-3 w-3" />
                        Paling Populer
                      </Badge>
                    </motion.div>
                  )}

                  <Card
                    className={`relative overflow-hidden h-full ${
                      plan.popular ? "border-2 border-primary shadow-xl" : "border-2"
                    } ${isCurrent ? "bg-muted/50" : ""}`}
                  >
                    <div className={`absolute inset-0 bg-linear-to-br ${plan.gradient} opacity-5`} />

                    <CardHeader className="relative space-y-4 pb-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-14 h-14 rounded-2xl bg-linear-to-br ${plan.gradient} p-3 shadow-lg`}
                      >
                        <plan.icon className="w-full h-full text-white" />
                      </motion.div>

                      <div>
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">{plan.description}</CardDescription>
                      </div>

                      <div className="pt-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold">{formatPrice(price)}</span>
                          {plan.tier !== "free" && <span className="text-muted-foreground text-sm">/ bulan</span>}
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="relative space-y-6">
                      <div className="space-y-3">
                        {[
                          {
                            enabled: true,
                            text:
                              features.maxNotes === -1 ? (
                                <span className="font-semibold text-primary">Unlimited catatan</span>
                              ) : (
                                `Maksimal ${features.maxNotes} catatan`
                              ),
                          },
                          {
                            enabled: true,
                            text:
                              features.maxTags === -1 ? (
                                <span className="font-semibold text-primary">Unlimited tags</span>
                              ) : (
                                `Maksimal ${features.maxTags} tags`
                              ),
                          },
                          { enabled: features.publicNotes, text: "Catatan publik" },
                          { enabled: features.exportPdf, text: "Export PDF" },
                        ].map((feature, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className={`p-1 rounded-full ${feature.enabled ? "bg-green-500/10" : "bg-gray-200"}`}>
                              <Check className={`h-4 w-4 ${feature.enabled ? "text-green-500" : "text-gray-400"}`} />
                            </div>
                            <span
                              className={`text-sm flex-1 ${
                                !feature.enabled ? "text-muted-foreground line-through" : ""
                              }`}
                            >
                              {feature.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => handleSelectPlan(plan.tier)}
                          disabled={isCurrent}
                          variant={plan.popular ? "default" : "outline"}
                          className={`w-full h-11 ${
                            plan.popular ? `bg-linear-to-r ${plan.gradient} hover:opacity-90 border-0` : ""
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Paket Saat Ini
                            </>
                          ) : plan.tier === "free" ? (
                            "Paket Gratis"
                          ) : (
                            <>
                              Pilih {plan.name}
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Transaction History */}
        {subscriptions.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Riwayat Transaksi</h2>
              <p className="text-muted-foreground">Semua subscription dan perpanjangan Anda</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-3">
              {subscriptions.map((sub, index) => {
                const isPaid = sub.tier !== "free";
                const statusColor =
                  sub.status === "active"
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-gray-500/10 text-gray-600 border-gray-500/20";

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 10 }}
                  >
                    <Card className="hover:shadow-lg transition-all border-2">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-4">
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.5 }}
                              className="p-3 bg-primary/10 rounded-xl"
                            >
                              <Crown className="h-6 w-6 text-primary" />
                            </motion.div>
                            <div className="space-y-1">
                              <p className="font-bold capitalize flex items-center gap-2 text-lg">
                                {sub.tier}
                                <Badge className={`${statusColor} border`}>{sub.status}</Badge>
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
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
                          <div className="text-right space-y-1">
                            {isPaid ? (
                              <>
                                <p className="text-xl font-bold text-primary">{formatPrice(sub.amount)}</p>
                                <p className="text-xs text-muted-foreground capitalize flex items-center gap-1 justify-end">
                                  <Download className="h-3 w-3" />
                                  {sub.payment_method || "Manual"}
                                </p>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-sm">
                                Gratis
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* FAQ Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-2 bg-linear-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <CardTitle>Butuh Bantuan?</CardTitle>
              </div>
              <CardDescription>Hubungi admin jika Anda memiliki pertanyaan tentang subscription</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {[
                  "Subscription akan otomatis aktif setelah pembayaran berhasil",
                  "Perpanjangan dapat dilakukan kapan saja sebelum masa aktif berakhir",
                  "Data catatan Anda tetap aman meskipun subscription berakhir",
                ].map((text, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <p className="text-muted-foreground">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

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
