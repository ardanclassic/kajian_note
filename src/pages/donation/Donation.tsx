/**
 * Donation Page - Premium Design
 * Beautiful, luxurious, professional donation page
 * Mobile-friendly with emerald accents
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { TopHeader } from "@/components/layout/TopHeader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  Copy,
  Sparkles,
  CheckCircle2,
  Zap,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Payment methods
const paymentMethods = [
  {
    id: "qris",
    name: "QRIS",
    description: "Scan QR untuk semua e-wallet & bank",
    icon: QrCode,
    qr: "/images/qr-qris.png", // placeholder - ganti dengan QR code asli
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "gopay",
    name: "GoPay",
    description: "Transfer ke nomor GoPay",
    number: "081234567890",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
  },
  {
    id: "bca",
    name: "BCA",
    description: "Transfer ke rekening BCA",
    number: "1234567890",
    accountName: "Alwaah",
    color: "from-blue-600 to-blue-500",
    bgColor: "bg-blue-600/10",
    borderColor: "border-blue-600/30",
    textColor: "text-blue-400",
  },
];

export default function Donation() {
  const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0]);

  const handleCopyNumber = (number: string) => {
    navigator.clipboard.writeText(number);
    toast.success("Nomor berhasil disalin!");
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background Orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed bottom-20 left-20 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />

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

      {/* Header */}
      <TopHeader backButton backTo="/dashboard" />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 md:py-12 space-y-8 md:space-y-12 max-w-5xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6 py-4 md:py-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-pink-500/50 rounded-full text-pink-400 text-sm font-semibold shadow-lg shadow-pink-500/20"
          >
            <Heart className="h-4 w-4 fill-current" />
            Dukung Kami
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
            Bantu Kami Berkembang
          </h1>

          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto mt-8">
            Donasi Anda membantu kami terus mengembangkan fitur-fitur terbaik dan memberikan layanan gratis untuk semua
          </p>
        </motion.div>

        {/* Payment Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-black text-white">Pilih Metode Pembayaran</h2>
            <p className="text-gray-400 text-sm">Donasi dengan nominal berapapun sangat berarti bagi kami</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {paymentMethods.map((method, index) => {
              const isSelected = selectedPayment.id === method.id;
              const Icon = method.icon || Heart;

              return (
                <motion.button
                  key={method.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => setSelectedPayment(method)}
                  className={cn(
                    "relative group bg-black rounded-2xl p-6 border-2 transition-all overflow-hidden",
                    isSelected
                      ? `${method.borderColor} shadow-lg`
                      : "border-gray-800 hover:border-gray-700"
                  )}
                >
                  {/* Glow Effect */}
                  {isSelected && (
                    <div className="absolute inset-0 opacity-20">
                      <div className={`absolute inset-0 bg-gradient-to-br ${method.color} blur-xl`} />
                    </div>
                  )}

                  {/* Content */}
                  <div className="relative z-10 space-y-4 text-center">
                    <div className={cn(
                      "w-14 h-14 mx-auto rounded-xl flex items-center justify-center",
                      method.bgColor,
                      `border ${method.borderColor}`
                    )}>
                      <Icon className={cn("h-7 w-7", method.textColor)} />
                    </div>

                    <div>
                      <div className={cn("font-bold text-lg mb-1", isSelected ? method.textColor : "text-white")}>
                        {method.name}
                      </div>
                      <div className="text-xs text-gray-400">{method.description}</div>
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center",
                        method.bgColor,
                        `border ${method.borderColor}`
                      )}
                    >
                      <CheckCircle2 className={cn("h-4 w-4", method.textColor)} />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Payment Details */}
          <motion.div
            key={selectedPayment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-black rounded-2xl p-6 md:p-8 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 max-w-2xl mx-auto"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center border",
                  selectedPayment.bgColor,
                  selectedPayment.borderColor
                )}>
                  {selectedPayment.icon ? (
                    <selectedPayment.icon className={cn("h-6 w-6", selectedPayment.textColor)} />
                  ) : (
                    <Heart className={cn("h-6 w-6", selectedPayment.textColor)} />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-lg">{selectedPayment.name}</div>
                  <div className="text-sm text-gray-400">{selectedPayment.description}</div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

              {/* QRIS QR Code */}
              {selectedPayment.id === "qris" && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-2xl">
                      {/* Placeholder QR Code - ganti dengan QR asli */}
                      <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                        <QrCode className="h-32 w-32 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-4">
                      Scan QR code dengan aplikasi e-wallet atau mobile banking Anda
                    </p>
                  </div>
                </div>
              )}

              {/* Number-based payment (GoPay, BCA) */}
              {selectedPayment.number && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-2">
                      {selectedPayment.accountName ? "Nomor Rekening" : "Nomor"}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-900 rounded-lg px-4 py-3 font-mono text-lg font-bold text-white">
                        {selectedPayment.number}
                      </div>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleCopyNumber(selectedPayment.number!)}
                        className="h-12 w-12 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <Copy className="h-4 w-4 text-emerald-400" />
                      </Button>
                    </div>
                  </div>

                  {selectedPayment.accountName && (
                    <div>
                      <div className="text-xs text-gray-400 mb-2">Atas Nama</div>
                      <div className="bg-gray-900 rounded-lg px-4 py-3 font-semibold text-white">
                        {selectedPayment.accountName}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Alert className="border-emerald-500/30 bg-emerald-500/5">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-gray-300 text-sm">
                  Setelah transfer, konfirmasi pembayaran Anda melalui email atau WhatsApp kami
                </AlertDescription>
              </Alert>
            </div>
          </motion.div>
        </motion.div>

        {/* Why Donate Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-black rounded-2xl p-6 md:p-8 border border-gray-800">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Zap className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-black text-white text-xl mb-2">Mengapa Donasi?</h3>
                <p className="text-sm text-gray-400">Donasi Anda membantu kami untuk:</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Mengembangkan fitur-fitur baru yang lebih canggih",
                "Menjaga server tetap cepat dan stabil",
                "Memberikan layanan gratis untuk semua pengguna",
                "Meningkatkan keamanan dan privasi data",
              ].map((text, i) => (
                <div key={i} className="flex gap-3 p-4 bg-gray-900 rounded-xl border border-gray-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4 py-8"
        >
          <div className="inline-flex items-center gap-2 text-pink-400">
            <Heart className="h-6 w-6 fill-current" />
            <span className="text-2xl md:text-3xl font-black">Terima Kasih!</span>
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <p className="text-gray-400 max-w-xl mx-auto">
            Setiap donasi, sekecil apapun, sangat berarti bagi kami dan membantu menjaga layanan ini tetap berjalan
          </p>
        </motion.div>
      </div>
    </div>
  );
}
