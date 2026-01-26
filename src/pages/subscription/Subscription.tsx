/**
 * Subscription Page - COMPLETE REDESIGN
 * Compact, clean, professional with Home page design system
 * Black bg, emerald accents, mobile-first approach
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { TopHeader } from "@/components/layout/TopHeader";
import { UpgradeModal } from "@/components/features/subscription/UpgradeModal";
import { PricingTable } from "@/components/features/subscription/PricingTable";
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
  ArrowLeft,
  Calendar,
  Info,
  Zap,
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
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400 mx-auto" />
          <p className="text-gray-400 font-medium text-sm">Memuat data subscription...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Alert className="max-w-md border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-gray-300">
            Silakan login terlebih dahulu untuk mengakses halaman ini
          </AlertDescription>
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

  return (
    <div className="min-h-screen bg-black">
      {/* Glow Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Grid */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), 
                             linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Header - Sticky */}
      <TopHeader backButton backTo="/dashboard" />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 max-w-7xl">
        {/* Hero Section - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 py-4 md:py-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 rounded-full text-emerald-400 text-sm font-semibold shadow-lg shadow-emerald-500/20">
            <Crown className="h-4 w-4" />
            Subscription Management
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
            Tingkatkan Pengalaman Anda
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            Pilih paket yang sesuai dengan kebutuhan Anda
          </p>
        </motion.div>

        {/* Expiry Warning - Compact */}
        {user.subscriptionTier !== "free" && user.subscriptionStatus === "active" && isExpiringSoon && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Alert className="border-2 border-orange-500/30 bg-orange-500/10 max-w-2xl mx-auto">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-orange-400" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="font-bold text-white">Subscription Akan Berakhir</div>
                  <AlertDescription className="text-gray-300 text-sm">
                    Subscription Anda akan berakhir dalam{" "}
                    <span className="font-bold text-orange-400">{daysRemaining} hari</span>
                  </AlertDescription>
                  <Button
                    size="sm"
                    onClick={() => setUpgradeModalOpen(true)}
                    className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    Perpanjang Sekarang
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Current Subscription Card - Redesigned */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <div className="group relative bg-black rounded-2xl p-6 md:p-8 border border-gray-800 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden">
            {/* Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                  >
                    <Crown className="h-7 w-7 md:h-8 md:w-8 text-emerald-400" />
                  </motion.div>

                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white capitalize">{user.subscriptionTier}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {user.subscriptionTier === "free"
                        ? "Paket dasar untuk memulai"
                        : user.subscriptionTier === "premium"
                          ? "Paket populer untuk pengguna aktif"
                          : "Paket lengkap tanpa batas"}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full ${user.subscriptionStatus === "active"
                      ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/20 border border-red-500/30 text-red-400"
                    }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-bold text-sm">
                    {user.subscriptionStatus === "active" ? "Aktif" : "Tidak Aktif"}
                  </span>
                </div>
              </div>

              {/* Progress & Dates */}
              {user.subscriptionTier !== "free" && currentSubscription && (
                <>
                  <div className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent" />

                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Waktu Tersisa</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="font-bold text-white">{daysRemaining} hari</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Mulai
                        </div>
                        <div className="font-bold text-white">
                          {new Date(currentSubscription.start_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>

                      <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          Berakhir
                        </div>
                        <div className="font-bold text-white">
                          {new Date(currentSubscription.end_date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUpgradeModalOpen(true)}
                className="w-full py-4 rounded-xl font-semibold bg-gray-900 border border-emerald-500/50 text-white hover:bg-gray-800 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                {user.subscriptionTier === "free" ? (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Upgrade ke Premium
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5" />
                    Perpanjang atau Upgrade
                  </>
                )}
              </motion.button>
            </div>

            {/* Sharp Corner Highlights */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
              <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
            </div>
          </div>
        </motion.div>

        {/* Pricing Plans Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
              <Zap className="h-4 w-4" />
              Pilih Paket
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white">Paket yang Sesuai untuk Anda</h2>

            <p className="text-gray-400 max-w-2xl mx-auto">Semua paket termasuk fitur dasar dan dukungan pelanggan</p>
          </div>

          <PricingTable currentTier={user.subscriptionTier} onSelectPlan={handleSelectPlan} />
        </motion.div>

        {/* Transaction History - Compact */}
        {subscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6 max-w-4xl mx-auto"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white">Riwayat Transaksi</h2>
              <p className="text-gray-400 text-sm">Semua subscription dan perpanjangan Anda</p>
            </div>

            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((sub, index) => {
                const isPaid = sub.tier !== "free";
                const isActive = sub.status === "active";

                return (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="group"
                  >
                    <div className="bg-black rounded-xl p-4 border border-gray-800 hover:border-emerald-500/30 transition-all">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                            <Crown className="h-5 w-5 text-emerald-400" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white capitalize">{sub.tier}</span>
                              <div
                                className={`px-2 py-0.5 rounded-full text-xs font-bold ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-800 text-gray-400"
                                  }`}
                              >
                                {sub.status}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400">
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
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          {isPaid ? (
                            <>
                              <div className="text-lg font-black text-emerald-400">{formatPrice(sub.amount)}</div>
                              <div className="text-xs text-gray-400 capitalize">{sub.payment_method || "Manual"}</div>
                            </>
                          ) : (
                            <div className="px-3 py-1 bg-gray-800 rounded-full text-xs font-bold text-gray-400">
                              Gratis
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Info Card - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-black rounded-xl p-6 border border-gray-800">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Info className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-white mb-1">Informasi Penting</h3>
                <p className="text-sm text-gray-400">Hal yang perlu Anda ketahui tentang subscription</p>
              </div>
            </div>

            <div className="space-y-2">
              {[
                "Subscription akan otomatis aktif setelah pembayaran berhasil",
                "Perpanjangan dapat dilakukan kapan saja sebelum masa aktif berakhir",
                "Data catatan Anda tetap aman meskipun subscription berakhir",
              ].map((text, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p className="text-sm text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
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
