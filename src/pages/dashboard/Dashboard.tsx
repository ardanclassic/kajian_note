/**
 * Dashboard Page - Premium Redesign (Mobile Optimized)
 * Focus: Clarity, Luxury, and Mobile Responsiveness
 * Updated: Reorganized for Core Features (Note Summary, Content Studio, Prompt Studio, Quest)
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useNotesStore } from "@/store/notesStore";
import { TopHeader } from "@/components/layout/TopHeader";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Calendar,
  Crown,
  Trophy,
  Palette,
  Wand2,
  Layout
} from "lucide-react";
import "@/styles/arabic-font.css";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchUsage } = useSubscriptionStore();
  const { statistics, fetchUserNotes, fetchStatistics } = useNotesStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUserNotes, fetchStatistics, fetchUsage]);

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

  if (!user) return null;

  const features = [
    {
      title: "Note Summary",
      description: "Buat ringkasan kajian otomatis dengan AI.",
      icon: Sparkles,
      color: "emerald",
      url: "/notes/new",
      bgGradient: "from-emerald-500/5",
      borderColor: "hover:border-emerald-500/50",
      iconColor: "text-emerald-400",
      groupHoverText: "group-hover:text-emerald-400",
      shadow: "hover:shadow-emerald-500/10"
    },
    {
      title: "Content Studio",
      description: "Ubah catatan jadi konten visual menarik.",
      icon: Palette,
      color: "pink",
      url: "/content-studio",
      bgGradient: "from-pink-500/5",
      borderColor: "hover:border-pink-500/50",
      iconColor: "text-pink-400",
      groupHoverText: "group-hover:text-pink-400",
      shadow: "hover:shadow-pink-500/10"
    },
    {
      title: "Prompt Studio",
      description: "Generate prompt AI yang presisi & powerful.",
      icon: Wand2,
      color: "violet",
      url: "/prompt-studio",
      bgGradient: "from-violet-500/5",
      borderColor: "hover:border-violet-500/50",
      iconColor: "text-violet-400",
      groupHoverText: "group-hover:text-violet-400",
      shadow: "hover:shadow-violet-500/10"
    },
    {
      title: "Quest",
      description: "Uji pemahaman via kuis interaktif.",
      icon: Trophy,
      color: "amber",
      url: "/quest",
      bgGradient: "from-amber-500/5",
      borderColor: "hover:border-amber-500/50",
      iconColor: "text-amber-400",
      groupHoverText: "group-hover:text-amber-400",
      shadow: "hover:shadow-amber-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <TopHeader />

      <main className="container mx-auto px-4 py-4 md:py-8 space-y-8 max-w-6xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* 1. Welcome Section */}
          <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="space-y-3 md:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-900/50 border border-gray-800 rounded-full text-[10px] md:text-xs font-medium text-gray-400">
                <Calendar className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span>
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white">
                <span className="arabic-tajawal text-3xl sm:text-5xl">أهلا وسهلا</span>
                <span className="hidden sm:inline">, </span>
                <br className="sm:hidden" />
                <span className="text-lg sm:text-4xl font-bold mt-1 block sm:inline sm:mt-0 text-emerald-400">
                  {user.fullName}
                </span>
              </h1>
            </div>

            {/* Subscription Badge */}
            <div
              onClick={() => navigate('/subscription')}
              className={cn(
                "w-full md:w-auto cursor-pointer group flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all duration-300",
                user.subscriptionTier === 'free'
                  ? "bg-gray-900 border-gray-800 hover:border-emerald-500/30"
                  : "bg-emerald-950/20 border-emerald-500/30 hover:bg-emerald-900/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                user.subscriptionTier === 'free' ? "bg-gray-800" : "bg-emerald-500/20"
              )}>
                <Crown className={cn("w-4 h-4 md:w-5 md:h-5", user.subscriptionTier === 'free' ? "text-gray-400" : "text-emerald-400")} />
              </div>
              <div className="flex flex-row md:flex-col justify-between items-center md:items-start flex-1 gap-2">
                <div className="text-left">
                  <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">Status Langganan</p>
                  <p className={cn("font-bold text-sm capitalize leading-none mt-0.5", user.subscriptionTier === 'free' ? "text-white" : "text-emerald-400")}>
                    {user.subscriptionTier} Plan
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 md:hidden" />
              </div>
            </div>
          </motion.div>

          {/* 2. Main Features Grid - 2x2 Layout */}
          <motion.div variants={item}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  onClick={() => navigate(feature.url)}
                  className={cn(
                    "group relative h-40 md:h-48 rounded-2xl bg-gray-900/40 border border-gray-800 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl",
                    feature.borderColor,
                    feature.shadow
                  )}
                >
                  {/* Hover Gradient Background */}
                  <div className={cn(
                    "absolute inset-0 bg-linear-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                    feature.bgGradient
                  )} />

                  {/* Content */}
                  <div className="relative h-full p-5 md:p-6 flex flex-col justify-between z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-11 h-11 md:w-12 md:h-12 rounded-xl bg-black border border-gray-800 flex items-center justify-center transition-all group-hover:border-gray-700 group-hover:bg-gray-900">
                        <feature.icon className={cn("w-5 h-5 md:w-6 md:h-6", feature.iconColor)} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>

                    <div>
                      <h3 className={cn(
                        "text-xl font-bold text-white mb-2 transition-colors",
                        feature.groupHoverText
                      )}>
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Decorative Big Icon - Positioned absolutely */}
                  <feature.icon className={cn(
                    "absolute -bottom-6 -right-6 w-32 h-32 opacity-5 transform group-hover:scale-110 transition-transform duration-700 pointer-events-none",
                    feature.iconColor
                  )} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3. Secondary/Shortcuts - Library & Stats */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Library Card */}
            <div
              onClick={() => navigate('/notes')}
              className="bg-gray-900/30 rounded-2xl p-5 border border-gray-800 hover:bg-gray-900/50 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">Library</h4>
                  <p className="text-sm text-gray-400">{statistics?.totalNotes || 0} Catatan Tersimpan</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
            </div>

            {/* Dashboard Overview / Layout */}
            {/* Ideally this could be another metric or link to Profile/Settings. Let's make it 'Ringkasan Aktivitas' placeholder or just fill grid */}
            <div className="bg-gray-900/20 rounded-2xl p-5 border border-gray-800 flex items-center justify-between opacity-80">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                  <Layout className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-300">Total Aktivitas</h4>
                  <p className="text-sm text-gray-500">{statistics?.totalNotes || 0} items created</p>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
