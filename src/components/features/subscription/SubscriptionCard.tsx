/**
 * SubscriptionCard Component - COMPLETE REDESIGN
 * Beautiful card for displaying current subscription with detailed info
 */

import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Calendar, Check, Sparkles, Crown, BookOpen, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { motion } from "framer-motion";

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  status: "active" | "expired" | "cancelled";
  startDate?: string;
  endDate?: string;
  onUpgrade?: () => void;
  isCurrentTier?: boolean;
}

export function SubscriptionCard({
  tier,
  status,
  startDate,
  endDate,
  onUpgrade,
  isCurrentTier = false,
}: SubscriptionCardProps) {
  const features = PAYMENT_CONFIG.features[tier];
  const price = PAYMENT_CONFIG.prices[tier];

  const tierConfig = {
    free: {
      label: "Free",
      icon: BookOpen,
      color: "gray",
    },
    premium: {
      label: "Premium",
      icon: Crown,
      color: "emerald",
    },
    advance: {
      label: "Advance",
      icon: Sparkles,
      color: "emerald",
    },
  };

  const statusConfig = {
    active: {
      label: "Aktif",
      color: "emerald",
      icon: CheckCircle2,
    },
    expired: {
      label: "Kadaluarsa",
      color: "red",
      icon: AlertCircle,
    },
    cancelled: {
      label: "Dibatalkan",
      color: "gray",
      icon: AlertCircle,
    },
  };

  const config = tierConfig[tier];
  const statusInfo = statusConfig[status];
  const Icon = config.icon;
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      <div
        className={`relative bg-black rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
          isCurrentTier
            ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20"
            : "border-gray-800 hover:border-emerald-500/30"
        }`}
      >
        {/* Glow Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {/* Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative w-16 h-16 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-shadow"
              >
                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <Icon className="relative h-8 w-8 text-emerald-400" />
              </motion.div>

              {/* Tier Info */}
              <div>
                <h3 className="text-3xl font-black text-white mb-1">{config.label}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">{formatPrice(price)}</span>
                  {tier !== "free" && <span className="text-gray-400">/bulan</span>}
                </div>
              </div>
            </div>

            {/* Status Badge */}
            {isCurrentTier && (
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  status === "active"
                    ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                    : status === "expired"
                    ? "bg-red-500/20 border border-red-500/30 text-red-400"
                    : "bg-gray-500/20 border border-gray-500/30 text-gray-400"
                }`}
              >
                <StatusIcon className="h-4 w-4" />
                <span className="font-bold text-sm">{statusInfo.label}</span>
              </div>
            )}
          </div>

          {/* Period Info */}
          {isCurrentTier && tier !== "free" && startDate && endDate && (
            <div className="p-4 bg-gray-900 rounded-xl border border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-black border border-emerald-500/30 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Periode Langganan</div>
                  <div className="font-semibold text-white">
                    {format(new Date(startDate), "dd MMM yyyy", { locale: id })} -{" "}
                    {format(new Date(endDate), "dd MMM yyyy", { locale: id })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent" />

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Fitur yang Anda Dapatkan
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <span className="text-sm text-gray-300">
                  {features.maxNotes === -1 ? "Unlimited catatan" : `Maksimal ${features.maxNotes} catatan`}
                </span>
              </div>

              {features.exportPdf && (
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300">Export PDF & Markdown</span>
                </div>
              )}

              {features.exportPdf && (
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300">Kirim ke Telegram & WhatsApp</span>
                </div>
              )}

              {tier === "free" && (
                <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-gray-300">AI Summary</span>
                </div>
              )}

              {tier === "advance" && (
                <>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-300">Custom export format</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900 rounded-lg">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <span className="text-sm text-gray-300">Early access fitur baru</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Upgrade Button */}
          {onUpgrade && (tier === "free" || !isCurrentTier) && (
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onUpgrade}
              className="w-full py-4 rounded-xl font-semibold bg-gray-900 border border-emerald-500/50 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
            >
              {isCurrentTier && tier === "free" ? (
                <>
                  <Sparkles className="h-5 w-5" />
                  Upgrade Sekarang
                  <ArrowRight className="h-5 w-5" />
                </>
              ) : (
                <>
                  Upgrade ke {config.label}
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>
          )}
        </div>

        {/* Sharp Corner Highlights */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
          <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
        </div>
      </div>
    </motion.div>
  );
}
