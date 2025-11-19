/**
 * Dashboard Page - Mobile First Design
 * Updated: Compact Recent Notes Section
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useNotesStore } from "@/store/notesStore";
import { MobileMenu } from "@/components/features/dashboard/MobileMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Sparkles,
  ArrowRight,
  ChevronRight,
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { currentSubscription, usage, fetchUsage } = useSubscriptionStore();
  const { userNotes, statistics, fetchUserNotes, fetchStatistics } = useNotesStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUserNotes, fetchStatistics, fetchUsage]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
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
    { icon: LogOut, label: "Logout", onClick: handleLogout },
  ];

  const stats = [
    {
      title: "Total Catatan",
      value: statistics?.totalNotes ?? 0,
      limit: usage?.notesLimit === Infinity ? "∞" : usage?.notesLimit ?? 0,
      icon: BookOpen,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Catatan Publik",
      value: statistics?.publicNotes ?? 0,
      icon: Share2,
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  const quickActions = [
    { icon: Plus, label: "Catatan Baru", path: "/notes/new", gradient: "from-blue-500 to-cyan-500" },
    { icon: BookOpen, label: "Lihat Catatan", path: "/notes", gradient: "from-purple-500 to-pink-500" },
    { icon: Crown, label: "Subscription", path: "/subscription", gradient: "from-orange-500 to-red-500" },
    { icon: Settings, label: "Pengaturan", path: "/settings", gradient: "from-gray-500 to-gray-600" },
  ];

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

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        userRole={user.role}
        userName={user.fullName}
        userTier={user.subscriptionTier}
        menuItems={menuItems}
      />

      {/* Header - Simple & Clean */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold hidden sm:inline">Kajian Notes</span>
          </div>

          <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          {/* Welcome Section */}
          <motion.div variants={item} className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Assalamu'alaikum, <br className="sm:hidden" />
              {user.fullName}
            </h1>
          </motion.div>

          {/* Stats Grid - Mobile Optimized */}
          <motion.div variants={item} className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden">
                <div className={`absolute inset-0 bg-linear-to-br ${stat.gradient} opacity-5`} />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{stat.value}</span>
                        {stat.limit && <span className="text-xl text-muted-foreground">/ {stat.limit}</span>}
                      </div>
                    </div>
                    <div className={`p-3 rounded-xl bg-linear-to-br ${stat.gradient}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {stat.limit && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(
                            (stat.value / (typeof stat.limit === "string" ? stat.value : Number(stat.limit))) * 100,
                            100
                          )}%`,
                        }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${stat.gradient}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Quick Actions - Compact Grid */}
          <motion.div variants={item}>
            <div className="space-y-3">
              <h2 className="text-lg font-semibold px-1">Navigasi Cepat</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {quickActions.map((action, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate(action.path)}
                    className="relative overflow-hidden rounded-xl bg-card border p-4 text-left transition-all hover:shadow-md hover:border-primary/30 group"
                  >
                    <div className="md:flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-linear-to-br ${action.gradient} flex items-center justify-center shrink-0`}
                      >
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="font-medium text-sm leading-tight mt-3 md:mt-0">{action.label}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Recent Notes */}
          <motion.div variants={item}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Catatan Terbaru</CardTitle>
                    <CardDescription>Aktivitas terkini Anda</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/notes")}>
                    <span className="hidden sm:inline">Semua</span>
                    <ArrowRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-3">
                {userNotes.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                    {userNotes.slice(0, 6).map((note, idx) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/notes/${note.id}`)}
                        className="group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-accent cursor-pointer transition-all"
                      >
                        {/* Icon */}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                            {note.title}
                          </h4>
                          {note.tags.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              {note.tags.slice(0, 2).map((tag) => (
                                <span key={tag} className="text-[10px] text-muted-foreground">
                                  #{tag}
                                </span>
                              ))}
                              {note.tags.length > 2 && (
                                <span className="text-[10px] text-muted-foreground">+{note.tags.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="hidden md:block h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-2">Belum ada catatan</p>
                    <p className="text-sm text-muted-foreground mb-4">Mulai buat catatan kajian pertama Anda</p>
                    <Button onClick={() => navigate("/notes/new")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Buat Catatan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription CTA */}
          {user.subscriptionTier === "free" && (
            <motion.div variants={item}>
              <div className="relative overflow-hidden rounded-xl border border-primary/50 bg-linear-to-br from-primary/5 to-transparent p-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-primary/20 to-transparent rounded-full blur-2xl" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-primary/30 to-primary/10 flex items-center justify-center shrink-0">
                    <Crown className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5">Upgrade Premium</h3>
                    <p className="text-xs text-muted-foreground">Unlimited catatan & fitur eksklusif</p>
                  </div>
                  <Button size="sm" onClick={() => navigate("/subscription")} className="hidden md:block shrink-0">
                    Lihat
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
