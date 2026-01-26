/**
 * Dashboard Page - Premium Redesign (Mobile Optimized)
 * Focus: Clarity, Luxury, and Mobile Responsiveness
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
  Zap,
  ArrowRight,
  Clock,
  Calendar,
  Crown,
  FileText,
  Search,
  Trophy,
} from "lucide-react";
import "@/styles/arabic-font.css";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { usage, fetchUsage } = useSubscriptionStore();
  const { userNotes, statistics, fetchUserNotes, fetchStatistics } = useNotesStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserNotes(user.id);
      fetchStatistics(user.id);
      fetchUsage(user.id);
    }
  }, [user?.id, fetchUserNotes, fetchStatistics, fetchUsage]);

  // Welcoming Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

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

  return (
    <div className="min-h-screen bg-black text-white selection:bg-emerald-500/30">
      <TopHeader />

      <main className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-12 max-w-6xl">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-6 md:space-y-8"
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

            {/* Subscription Badge - Compact Mobile */}
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

          {/* 2. Primary Actions - CREATION CENTER - Optimized for Mobile */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">

            {/* Action 1: Smart Summary */}
            <div
              onClick={() => navigate('/notes/new')}
              className="group relative h-40 md:h-56 rounded-2xl md:rounded-4xl bg-gray-900/50 border border-gray-800 hover:border-emerald-500/50 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10"
            >
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative h-full p-5 md:p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-black border border-gray-800 group-hover:border-emerald-500/50 flex items-center justify-center transition-colors">
                    <Sparkles className="w-5 h-5 md:w-7 md:h-7 text-emerald-400" />
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-emerald-400 transition-colors">Note Summary</h3>
                  <p className="text-xs md:text-sm text-gray-400 line-clamp-2 md:line-clamp-none leading-relaxed">
                    Buat ringkasan cepat poin-poin penting kajian.
                  </p>
                </div>
              </div>

              {/* Decorative Big Icon */}
              <Sparkles className="absolute -bottom-6 -right-6 w-32 h-32 md:w-48 md:h-48 text-emerald-500/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            </div>

            {/* Action 2: Deep Note */}
            <div
              onClick={() => navigate('/deep-note/create')}
              className="group relative h-40 md:h-56 rounded-2xl md:rounded-4xl bg-gray-900/50 border border-gray-800 hover:border-purple-500/50 cursor-pointer overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative h-full p-5 md:p-8 flex flex-col justify-between z-10">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-black border border-gray-800 group-hover:border-purple-500/50 flex items-center justify-center transition-colors">
                    <Zap className="w-5 h-5 md:w-7 md:h-7 text-purple-400" />
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 group-hover:text-purple-400 transition-colors">Deep Note</h3>
                  <p className="text-xs md:text-sm text-gray-400 line-clamp-2 md:line-clamp-none leading-relaxed">
                    Analisis mendalam & komprehensif dengan AI Advanced.
                  </p>
                </div>
              </div>

              {/* Decorative Big Icon */}
              <Zap className="absolute -bottom-6 -right-6 w-32 h-32 md:w-48 md:h-48 text-purple-500/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
            </div>

          </motion.div>

          {/* 3. Quick Shortcuts */}
          <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {/* Library */}
            <div
              onClick={() => navigate('/notes')}
              className="col-span-2 sm:col-span-1 bg-gray-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">Library</p>
                  <p className="text-[10px] md:text-xs text-gray-400">{statistics?.totalNotes || 0} Catatan</p>
                </div>
              </div>
            </div>

            {/* Deep Note Archive */}
            <div
              onClick={() => navigate('/deep-note')}
              className="col-span-2 sm:col-span-1 bg-gray-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">Deep Notes</p>
                  <p className="text-[10px] md:text-xs text-gray-400">Lihat Arsip</p>
                </div>
              </div>
            </div>

            {/* Quest */}
            <div
              onClick={() => navigate('/quest')}
              className="col-span-2 sm:col-span-1 bg-gray-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">Quest</p>
                  <p className="text-[10px] md:text-xs text-gray-400">Test Knowledge</p>
                </div>
              </div>
            </div>

            {/* Content Studio */}
            <div
              onClick={() => navigate('/content-studio')}
              className="col-span-2 sm:col-span-1 bg-gray-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-pink-500/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-white">Visualist</p>
                  <p className="text-[10px] md:text-xs text-gray-400">Create Content</p>
                </div>
              </div>
            </div>

            {/* Search - Optimized labels */}
            <div
              className="col-span-2 bg-gray-900/30 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-800 hover:bg-gray-900 transition-colors cursor-pointer flex items-center justify-between group"
              onClick={() => navigate('/notes')}
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                <span className="text-xs md:text-sm text-gray-400 group-hover:text-white transition-colors">
                  Cari catatan...
                </span>
              </div>
              <div className="hidden sm:block px-2 py-1 rounded bg-black border border-gray-800 text-[10px] text-gray-500 font-mono">
                Tap to search
              </div>
            </div>
          </motion.div>

          {/* 4. Recent Activity */}
          <motion.div variants={item} className="space-y-3 md:space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                Lanjutkan Belajar
              </h2>
              <button
                onClick={() => navigate('/notes')}
                className="text-xs md:text-sm text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                Lihat Semua
              </button>
            </div>

            <div className="grid gap-2 md:gap-3">
              {userNotes.length > 0 ? (
                userNotes.slice(0, 3).map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => navigate(`/notes/${note.id}`)}
                    className="group flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl bg-gray-900/30 border border-gray-800 hover:border-gray-700 hover:bg-gray-900/60 cursor-pointer transition-all"
                  >
                    {/* Icon Identifier - Smaller on mobile */}
                    <div className={cn(
                      "w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center shrink-0",
                      note.sourceMetadata?.has_deep_note
                        ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    )}>
                      {note.sourceMetadata?.has_deep_note ? <Zap className="w-4 h-4 md:w-5 md:h-5" /> : <Sparkles className="w-4 h-4 md:w-5 md:h-5" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5 md:space-y-1">
                      <h4 className="font-semibold text-white text-sm md:text-base line-clamp-1 md:line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {note.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500">
                        <span>{new Date(note.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</span>
                        <span className="w-0.5 h-0.5 md:w-1 md:h-1 rounded-full bg-gray-700" />
                        <span className={cn(
                          note.sourceMetadata?.has_deep_note ? "text-purple-400" : "text-emerald-400"
                        )}>
                          {note.sourceMetadata?.has_deep_note ? "Deep Note" : "Note Summary"}
                        </span>
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="text-gray-600 group-hover:text-white transition-colors shrink-0">
                      <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 md:py-12 bg-gray-900/30 rounded-xl md:rounded-2xl border border-gray-800 border-dashed">
                  <p className="text-sm text-gray-500">Belum ada catatan aktivitas.</p>
                </div>
              )}
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}
