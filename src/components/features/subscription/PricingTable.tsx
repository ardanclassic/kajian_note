/**
 * PricingTable Component - COMPLETE REDESIGN
 * Follows Home page pricing section design with detailed features
 */

import { PAYMENT_CONFIG, formatPrice, type SubscriptionTier } from "@/config/payment";
import { Check, X, Sparkles, Crown, BookOpen, ArrowRight, Zap, Shield, FileText, Send, Share2 } from "lucide-react";
import { motion } from "framer-motion";

interface PricingTableProps {
  currentTier: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
}

export function PricingTable({ currentTier, onSelectPlan }: PricingTableProps) {
  const plans = [
    {
      tier: "free" as SubscriptionTier,
      name: "Free",
      description: "Untuk mencoba platform",
      price: PAYMENT_CONFIG.prices.free,
      icon: BookOpen,
      popular: false,
      features: [
        { text: "10 catatan maksimal", included: true },
        { text: "Pencarian & filter catatan", included: true },
        { text: "Organisasi dengan tag", included: true },
        { text: "Username + PIN login", included: true },
        { text: "Akses via web & mobile", included: true },
        { text: "AI Summary", included: true },
        { text: "Export PDF", included: false },
        { text: "Kirim ke Telegram", included: false },
        { text: "Bagikan via WhatsApp", included: false },
      ],
    },
    {
      tier: "premium" as SubscriptionTier,
      name: "Premium",
      description: "Paling populer",
      price: PAYMENT_CONFIG.prices.premium,
      icon: Crown,
      popular: true,
      features: [
        { text: "Semua fitur Free", included: true },
        { text: "100 catatan maksimal", included: true },
        { text: "Export ke PDF", included: true },
        { text: "Kirim ke Telegram", included: true },
        { text: "Bagikan via WhatsApp", included: true },
        { text: "Unlimited AI Summary", included: true },
        { text: "Priority support", included: true },
      ],
    },
    {
      tier: "advance" as SubscriptionTier,
      name: "Advance",
      description: "Untuk power user",
      price: PAYMENT_CONFIG.prices.advance,
      icon: Sparkles,
      popular: false,
      features: [
        { text: "Semua fitur Premium", included: true },
        { text: "Unlimited catatan", included: true },
        { text: "Unlimited AI Summary", included: true },
        { text: "Custom export format", included: true },
        { text: "Early access fitur baru", included: true },
        { text: "Dedicated support", included: true },
        { text: "API access", included: true },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan, index) => {
        const isCurrent = currentTier === plan.tier;
        const Icon = plan.icon;

        return (
          <motion.div
            key={plan.tier}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative h-full"
          >
            {/* Popular Badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                <div className="px-6 py-2 bg-gray-900 border border-emerald-500/50 rounded-full text-emerald-400 font-bold text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Terpopuler
                </div>
              </div>
            )}

            {/* Card */}
            <div
              className={`group relative h-full bg-black rounded-2xl p-8 border transition-all duration-500 hover:-translate-y-1 overflow-hidden ${
                plan.popular
                  ? "border-emerald-500/50 shadow-xl shadow-emerald-500/20"
                  : "border-gray-800 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
              } ${isCurrent ? "ring-2 ring-emerald-500/30" : ""}`}
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
              </div>

              {/* Current Badge */}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
                    Paket Aktif
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                {/* Header */}
                <div className="flex gap-3 mb-6">
                  {/* Icon */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`relative inline-flex w-14 h-14 rounded-xl ${
                      plan.popular ? "bg-gray-900 border border-emerald-500/30" : "bg-gray-900 border border-gray-800"
                    } items-center justify-center shadow-lg group-hover:shadow-emerald-500/30 transition-shadow`}
                  >
                    <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                    <Icon className={`relative h-7 w-7 ${plan.popular ? "text-emerald-400" : "text-emerald-400"}`} />
                  </motion.div>

                  {/* Tier Info */}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-gray-400 text-sm">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black ${plan.popular ? "text-emerald-400" : "text-white"}`}>
                      {formatPrice(plan.price)}
                    </span>
                    {plan.tier !== "free" && <span className="text-gray-400">/bulan</span>}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-linear-to-r from-transparent via-gray-800 to-transparent mb-6" />

                {/* Features */}
                <div className="flex-1 space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                          feature.included ? "bg-emerald-500/20" : "bg-gray-800"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-gray-600" />
                        )}
                      </div>
                      <span
                        className={`text-sm leading-relaxed ${
                          feature.included ? "text-gray-300" : "text-gray-500 line-through opacity-40"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectPlan(plan.tier)}
                  disabled={isCurrent}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-gray-900 border border-gray-800 text-gray-500 cursor-not-allowed"
                      : plan.popular
                      ? "bg-gray-900 border border-emerald-500/50 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40"
                      : "bg-transparent text-white border border-gray-800 hover:bg-gray-900/50 hover:border-gray-700"
                  }`}
                >
                  {isCurrent ? (
                    "Paket Aktif"
                  ) : plan.tier === "free" ? (
                    "Mulai Gratis"
                  ) : (
                    <>
                      Upgrade Sekarang
                      <ArrowRight className="h-5 w-5" />
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
        );
      })}
    </div>
  );
}
