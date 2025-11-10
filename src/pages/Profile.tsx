/**
 * Profile Page
 * User profile management page
 */

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import EditProfileForm from "@/components/features/profile/EditProfileForm";
import ChangePINForm from "@/components/features/profile/ChangePINForm";
import { User, Shield, Crown, Calendar, Phone, Mail, Edit, Key, CreditCard } from "lucide-react";

export default function Profile() {
  const location = useLocation();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "change-pin">("profile");

  // Check if forced to change PIN
  useEffect(() => {
    if (location.state?.forced || location.pathname === "/profile/change-pin") {
      setActiveTab("change-pin");
    }
  }, [location]);

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "panitia":
        return "bg-blue-500 text-white";
      case "ustadz":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Get subscription badge color
  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case "premium":
        return "bg-blue-500 text-white";
      case "advance":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profil Saya</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
      </div>

      {/* Forced PIN Change Alert */}
      {user.forcePasswordChange && (
        <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-400">Anda harus mengganti PIN</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-500">
                  PIN Anda telah direset oleh admin. Silakan buat PIN baru untuk keamanan akun Anda.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informasi Akun</CardTitle>
          <CardDescription>Detail akun dan status subscription Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-primary" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Role */}
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge className={getRoleBadgeColor(user.role)}>{user.role.toUpperCase()}</Badge>
              </div>
            </div>

            {/* Subscription */}
            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Subscription</p>
                <Badge className={getSubscriptionBadgeColor(user.subscriptionTier)}>
                  {user.subscriptionTier.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telepon</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-xs truncate">{user.email}</p>
              </div>
            </div>

            {/* Payment Email - NEW */}
            {(user as any).paymentEmail && (
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email Pembayaran</p>
                  <p className="font-medium text-xs truncate">{(user as any).paymentEmail}</p>
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bergabung</p>
                <p className="font-medium">
                  {new Date(user.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Last Login */}
            {user.lastLoginAt && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Login Terakhir</p>
                  <p className="font-medium">
                    {new Date(user.lastLoginAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Bio</p>
              <p className="text-sm">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === "profile" ? "default" : "outline"}
          onClick={() => setActiveTab("profile")}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Profil
        </Button>
        <Button
          variant={activeTab === "change-pin" ? "default" : "outline"}
          onClick={() => setActiveTab("change-pin")}
          className="flex-1"
        >
          <Key className="h-4 w-4 mr-2" />
          Ubah PIN
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Profil</CardTitle>
            <CardDescription>Perbarui informasi profil Anda</CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm />
          </CardContent>
        </Card>
      )}

      {activeTab === "change-pin" && (
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
    </div>
  );
}
