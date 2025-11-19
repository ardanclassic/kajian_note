/**
 * Profile Page - Clean Modern Design
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/features/profile/EditProfileForm";
import ChangePINForm from "@/components/features/profile/ChangePINForm";
import { User, Shield, Crown, Calendar, Phone, Mail, Edit, Key, CreditCard, AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";

export default function Profile() {
  const location = useLocation();
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
    <div className="min-h-screen bg-background">
      {/* Page Header with Stats */}
      <PageHeader
        badgeIcon={User}
        badgeText="Profile"
        title="Profil Saya"
        description="Kelola informasi profil dan keamanan akun"
        showBackButton
        backTo="/dashboard"
        backLabel="Dashboard"
      />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Forced PIN Change Alert */}
          {user.forcePasswordChange && (
            <motion.div variants={item}>
              <div className="relative overflow-hidden rounded-xl border border-yellow-500/50 bg-linear-to-br from-yellow-500/10 to-transparent p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-yellow-500/30 to-yellow-500/10 flex items-center justify-center shrink-0">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5 text-yellow-800 dark:text-yellow-400">
                      Anda harus mengganti PIN
                    </h3>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                      PIN Anda telah direset oleh admin. Silakan buat PIN baru untuk keamanan akun.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Profile Card */}
          <motion.div variants={item}>
            <Card>
              <CardContent>
                {/* Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">{user.fullName}</h2>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {userInfo.map((info, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <info.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{info.label}</p>
                        {info.type === "badge" ? (
                          <Badge
                            variant={
                              info.label === "Subscription" && user.subscriptionTier !== "free"
                                ? "default"
                                : "secondary"
                            }
                            className="mt-1"
                          >
                            {info.value}
                          </Badge>
                        ) : (
                          <p className="text-sm font-medium truncate">{info.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {user.bio && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Bio</p>
                    <p className="text-sm">{user.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={item} className="grid grid-cols-2 gap-3">
            <Button
              variant={activeTab === "profile" ? "default" : "outline"}
              onClick={() => setActiveTab("profile")}
              className="w-full"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </Button>
            <Button
              variant={activeTab === "change-pin" ? "default" : "outline"}
              onClick={() => setActiveTab("change-pin")}
              className="w-full"
            >
              <Key className="h-4 w-4 mr-2" />
              Ubah PIN
            </Button>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "profile" ? (
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profil</CardTitle>
                  <CardDescription>Perbarui informasi profil Anda</CardDescription>
                </CardHeader>
                <CardContent>
                  <EditProfileForm />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Ubah PIN</CardTitle>
                  <CardDescription>Buat PIN baru untuk keamanan akun Anda</CardDescription>
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
  );
}
