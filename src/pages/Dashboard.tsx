/**
 * Dashboard Page - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Consistent spacing & animations
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useNotesStore } from "@/store/notesStore";
import { MobileMenu } from "@/components/features/dashboard/MobileMenu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/common/Loading";
import {
  BookOpen,
  Share2,
  FileText,
  Crown,
  User,
  LogOut,
  Settings,
  Users,
  Plus,
  Menu,
  Calendar,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import "@/styles/arabic-font.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentSubscription, usage, fetchUsage } = useSubscriptionStore();
  const { userNotes, statistics, fetchUserNotes, fetchStatistics } = useNotesStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUserNotes, fetchStatistics, fetchUsage]);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
    setIsMenuOpen(false);
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return <Loading fullscreen text="Memuat..." />;
  }

  const menuItems = [
    { icon: BookOpen, label: "Catatan", onClick: () => navigate("/notes") },
    { icon: Crown, label: "Subscription", onClick: () => navigate("/subscription") },
    { icon: User, label: "Profile", onClick: () => navigate("/profile") },
    { icon: Users, label: "Kelola Users", onClick: () => navigate("/admin/users"), adminOnly: true },
    { icon: Settings, label: "Pengaturan", onClick: () => navigate("/settings") },
    { icon: LogOut, label: "Logout", onClick: handleLogoutClick },
  ];

  const stats = [
    {
      title: "Total Catatan",
      value: statistics?.totalNotes ?? 0,
      limit: usage?.notesLimit === Infinity ? "∞" : usage?.notesLimit ?? 0,
      icon: BookOpen,
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Catatan Baru", path: "/notes/new" },
    { icon: BookOpen, label: "Lihat Catatan", path: "/notes" },
    { icon: Crown, label: "Subscription", path: "/subscription" },
    { icon: Settings, label: "Pengaturan", path: "/settings" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <div className="min-h-screen bg-black">
        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          userRole={user.role}
          userName={user.fullName}
          userTier={user.subscriptionTier}
          menuItems={menuItems}
        />

        {/* Header - Dark with emerald accent */}
        <header className="sticky top-0 z-40 w-full border-b border-gray-800 bg-black/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto max-w-7xl">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-xl bg-gray-900 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:inline">Kajian Notes</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(true)}
              className="hover:bg-gray-900 hover:border-emerald-500/30 border border-gray-800"
            >
              <Menu className="h-6 w-6 text-white" />
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            {/* Welcome Section */}
            <motion.div variants={item} className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-emerald-500/50 text-emerald-400 rounded-full text-sm font-semibold shadow-lg shadow-emerald-500/20">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white">
                <span className="arabic-tajawal ">السلام عليكم</span>, <br className="sm:hidden" />
                <span className="arabic-tajawal text-emerald-400">{user.fullName}</span>
              </h1>
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={item} className="grid gap-8 sm:grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-black rounded-2xl p-8 border border-gray-800 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-sm text-gray-400 mb-3">{stat.title}</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-black text-white">{stat.value}</span>
                          {stat.limit && <span className="text-2xl text-gray-500">/ {stat.limit}</span>}
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gray-900 border border-emerald-500/30">
                        <stat.icon className="h-6 w-6 text-emerald-400" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {stat.limit && (
                      <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(
                              (stat.value / (typeof stat.limit === "string" ? stat.value : Number(stat.limit))) * 100,
                              100
                            )}%`,
                          }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full bg-linear-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/50"
                        />
                      </div>
                    )}
                  </div>

                  {/* Corner Highlights */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
                    <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="space-y-4">
              <h2 className="text-xl font-bold text-white">Navigasi Cepat</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className="group relative bg-[#2e8b57]/30! rounded-2xl p-6 border border-gray-800 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-1 overflow-hidden text-left"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 bg-emerald-500/5 blur-xl" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 border border-emerald-500/30 flex items-center justify-center">
                        <action.icon className="h-6 w-6 text-emerald-400" />
                      </div>
                      <p className="font-semibold text-white text-sm">{action.label}</p>
                    </div>

                    {/* Corner Highlights */}
                    <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-px h-8 bg-linear-to-b from-emerald-500/50 to-transparent" />
                      <div className="absolute top-0 right-0 h-px w-8 bg-linear-to-l from-emerald-500/50 to-transparent" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Recent Notes */}
            <motion.div variants={item}>
              <div className="relative bg-black rounded-2xl sm:p-8 sm:border sm:border-gray-800 overflow-hidden">
                {/* Grid Pattern */}
                <div className="absolute inset-0 opacity-[0.015]">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)",
                      backgroundSize: "80px 80px",
                    }}
                  />
                </div>

                {/* Header */}
                <div className="relative z-10 flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Catatan Terbaru</h2>
                    <p className="text-gray-400">Aktivitas terkini Anda</p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/notes")}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                  >
                    <span className="hidden sm:inline">Lihat Semua</span>
                    <ArrowRight className="h-4 w-4 sm:ml-2" />
                  </Button>
                </div>

                {/* Notes List */}
                <div className="relative z-10">
                  {userNotes.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {userNotes.slice(0, 6).map((note, idx) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05, duration: 0.3 }}
                          onClick={() => navigate(`/notes/${note.id}`)}
                          className="group relative bg-gray-900 rounded-xl p-4 border border-gray-800 hover:border-emerald-500/30 cursor-pointer transition-all duration-300 overflow-hidden"
                        >
                          {/* Subtle Glow on Hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute inset-0 bg-emerald-500/5" />
                          </div>

                          {/* Content */}
                          <div className="relative z-10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
                                {note.title}
                              </h4>
                              {note.tags.length > 0 && (
                                <div className="flex items-center gap-1 mt-1">
                                  {note.tags.slice(0, 2).map((tag) => (
                                    <span key={tag} className="text-xs text-gray-500">
                                      #{tag}
                                    </span>
                                  ))}
                                  {note.tags.length > 2 && (
                                    <span className="text-xs text-gray-500">+{note.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-emerald-400 transition-colors shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 mx-auto bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-center mb-6">
                        <BookOpen className="h-10 w-10 text-gray-600" />
                      </div>
                      <p className="text-gray-300 font-semibold mb-2">Belum ada catatan</p>
                      <p className="text-sm text-gray-500 mb-6">Mulai buat catatan kajian pertama Anda</p>
                      <Button
                        onClick={() => navigate("/notes/new")}
                        className="bg-gray-900 text-white border border-emerald-500/50 hover:bg-emerald-500/10 shadow-lg shadow-emerald-500/20"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Buat Catatan
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Premium CTA */}
            {user.subscriptionTier === "free" && (
              <motion.div variants={item}>
                <div
                  onClick={() => navigate("/subscription")}
                  className="group relative bg-black rounded-2xl p-8 border border-emerald-500/50 hover:border-emerald-500 transition-all duration-500 cursor-pointer overflow-hidden"
                >
                  {/* Glow Orbs */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

                  {/* Content */}
                  <div className="relative z-10 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-emerald-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                      <Crown className="h-8 w-8 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white">Upgrade ke Premium</h3>
                        <Sparkles className="h-5 w-5 text-emerald-400" />
                      </div>
                      <p className="text-gray-400">Unlimited catatan & fitur eksklusif menanti Anda</p>
                    </div>
                    <ArrowRight className="h-6 w-6 text-emerald-400 hidden md:block shrink-0 group-hover:translate-x-1 transition-transform" />
                  </div>

                  {/* Corner Highlights */}
                  <div className="absolute top-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-0 right-0 w-px h-12 bg-linear-to-b from-emerald-500/50 to-transparent" />
                    <div className="absolute top-0 right-0 h-px w-12 bg-linear-to-l from-emerald-500/50 to-transparent" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Logout Dialog */}
      <ConfirmDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        title="Keluar dari Akun?"
        description={
          <div className="space-y-2">
            <p>Apakah Anda yakin ingin keluar dari akun Anda?</p>
            <p className="text-sm text-muted-foreground">
              Anda perlu login kembali untuk mengakses catatan dan fitur lainnya.
            </p>
          </div>
        }
        confirmText="Ya, Keluar"
        cancelText="Batal"
        onConfirm={handleConfirmLogout}
        variant="warning"
        isLoading={isLoggingOut}
        showCancel={true}
      />
    </>
  );
}
