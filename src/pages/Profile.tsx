/**
 * Profile Page - Dark Mode with Emerald Glow
 * Refactored: Custom Header Design + ScrollToTop
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Compact & modern interface
 */

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollToTopButton } from "@/components/common/ScrollToTopButton";
import EditProfileForm from "@/components/features/profile/EditProfileForm";
import ChangePINForm from "@/components/features/profile/ChangePINForm";
import {
  User,
  Shield,
  Crown,
  Calendar,
  Phone,
  Mail,
  Edit,
  Key,
  CreditCard,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function Profile() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "change-pin">("profile");

  useEffect(() => {
    if (location.state?.forced || location.pathname === "/profile/change-pin") {
      setActiveTab("change-pin");
    }
  }, [location]);

  if (!user) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const userInfo = [
    { icon: Shield, label: "Role", value: user.role.toUpperCase(), type: "badge" },
    { icon: Crown, label: "Subscription", value: user.subscriptionTier.toUpperCase(), type: "badge" },
    ...(user.phone ? [{ icon: Phone, label: "Telepon", value: user.phone }] : []),
    { icon: Mail, label: "Email", value: user.email },
    ...((user as any).paymentEmail
      ? [{ icon: CreditCard, label: "Email Pembayaran", value: (user as any).paymentEmail }]
      : []),
    {
      icon: Calendar,
      label: "Bergabung",
      value: new Date(user.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Sticky Action Buttons Bar */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-900">
        <div className="container mx-auto px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="group flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400 transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Tab Buttons */}
            <Button
              variant={activeTab === "profile" ? "default" : "outline"}
              onClick={() => setActiveTab("profile")}
              size="sm"
              className={
                activeTab === "profile"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20"
                  : "bg-gray-900 border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400"
              }
            >
              <Edit className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant={activeTab === "change-pin" ? "default" : "outline"}
              onClick={() => setActiveTab("change-pin")}
              size="sm"
              className={
                activeTab === "change-pin"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/20"
                  : "bg-gray-900 border-gray-800 hover:border-emerald-500/50 text-gray-400 hover:text-emerald-400"
              }
            >
              <Key className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">PIN</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="relative border-b border-gray-900 overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/10 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/3 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {/* Title & User Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/10 flex-shrink-0 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" />
                )}
              </div>

              {/* Title & Username */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight truncate">
                  {user.fullName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-400">@{user.username}</span>
                  <Badge
                    variant={user.subscriptionTier !== "free" ? "default" : "secondary"}
                    className={
                      user.subscriptionTier !== "free" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/50" : ""
                    }
                  >
                    {user.subscriptionTier.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            {/* Forced PIN Change Alert */}
            {user.forcePasswordChange && (
              <motion.div variants={item}>
                <div className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-yellow-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center shrink-0">
                      <AlertCircle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-0.5 text-yellow-400">Anda harus mengganti PIN</h3>
                      <p className="text-xs text-yellow-500">
                        PIN Anda telah direset oleh admin. Silakan buat PIN baru untuk keamanan akun.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Card */}
            <motion.div variants={item}>
              <Card className="bg-transparent py-0 md:py-6 md:bg-gray-900/50 border-none md:border-gray-800">
                <CardContent className="p-0 md:px-6 ">
                  {/* Info Grid */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {userInfo.map((info, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-black border border-gray-800 flex items-center justify-center shrink-0">
                          <info.icon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">{info.label}</p>
                          {info.type === "badge" ? (
                            <Badge
                              variant={
                                info.label === "Subscription" && user.subscriptionTier !== "free"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                info.label === "Subscription" && user.subscriptionTier !== "free"
                                  ? "mt-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/50"
                                  : "mt-1"
                              }
                            >
                              {info.value}
                            </Badge>
                          ) : (
                            <p className="text-sm font-medium text-white truncate">{info.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <div className="mt-6 pt-6 border-t border-gray-800">
                      <p className="text-xs text-gray-500 mb-2">Bio</p>
                      <p className="text-sm text-gray-300">{user.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === "profile" ? (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Edit Profil</CardTitle>
                    <CardDescription className="text-gray-400">Perbarui informasi profil Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <EditProfileForm />
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white">Ubah PIN</CardTitle>
                    <CardDescription className="text-gray-400">Buat PIN baru untuk keamanan akun Anda</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChangePINForm forced={user.forcePasswordChange} />
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
