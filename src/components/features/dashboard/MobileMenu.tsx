/**
 * Mobile Menu Component - Dark Mode with Emerald Glow
 * Refactored: Following design-guidelines.md
 * ✅ Pure black background
 * ✅ Emerald glow accents
 * ✅ Sharp corner highlights
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MenuItem {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  badge?: string;
  adminOnly?: boolean;
}

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
  userTier?: string;
  menuItems: MenuItem[];
}

export function MobileMenu({
  isOpen,
  onClose,
  userRole = "member",
  userName = "User",
  userTier = "free",
  menuItems,
}: MobileMenuProps) {
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const menuVariants: any = {
    hidden: { x: "100%" },
    visible: {
      x: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
    exit: {
      x: "100%",
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
      },
    }),
  };

  const getTierBadgeColor = () => {
    if (userTier === "advance") return "bg-gradient-to-r from-purple-500 to-pink-500";
    if (userTier === "premium") return "bg-gradient-to-r from-emerald-500 to-cyan-500";
    return "bg-gray-800 border border-gray-700";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-black border-l border-gray-800 shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-gray-800 overflow-hidden">
                {/* Glow Orb */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                <h2 className="text-lg font-bold text-white">Menu</h2>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="relative z-10 hover:bg-gray-900 hover:border-emerald-500/30 border border-gray-800"
                >
                  <X className="h-5 w-5 text-white" />
                </Button>
              </div>

              {/* User Info Card */}
              <div className="relative p-6 border-b border-gray-800 overflow-hidden">
                {/* Background Pattern */}
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

                <div className="relative z-10 bg-gray-900 rounded-2xl p-4 border border-gray-800">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-black border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                      <User className="h-6 w-6 text-emerald-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{userName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        {/* Tier Badge */}
                        <div
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getTierBadgeColor()}`}
                        >
                          {(userTier === "premium" || userTier === "advance") && (
                            <Crown className="h-3 w-3 text-white" />
                          )}
                          <span className="text-white uppercase">{userTier}</span>
                        </div>
                        {/* Role Badge */}
                        <div className="inline-flex px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-300 rounded-full text-xs font-semibold uppercase">
                          {userRole}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item, index) => {
                  if (item.adminOnly && userRole !== "admin") return null;

                  return (
                    <motion.div key={index} custom={index} variants={itemVariants} initial="hidden" animate="visible">
                      <button
                        onClick={() => {
                          item.onClick();
                          onClose();
                        }}
                        className="group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-transparent border border-transparent hover:bg-gray-900 hover:border-emerald-500/30 transition-all duration-300 text-left overflow-hidden"
                      >
                        {/* Glow on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute inset-0 bg-emerald-500/5" />
                        </div>

                        {/* Icon */}
                        <div className="relative z-10 w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 group-hover:border-emerald-500/30 flex items-center justify-center transition-colors shrink-0">
                          <item.icon className="h-5 w-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                        </div>

                        {/* Label */}
                        <span className="relative z-10 flex-1 text-base font-medium text-gray-300 group-hover:text-white transition-colors">
                          {item.label}
                        </span>

                        {/* Badge */}
                        {item.badge && (
                          <div className="relative z-10 px-2.5 py-1 bg-gray-800 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold">
                            {item.badge}
                          </div>
                        )}

                        {/* Corner Highlight */}
                        <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute top-0 right-0 w-px h-8 bg-linear-to-b from-emerald-500/50 to-transparent" />
                          <div className="absolute top-0 right-0 h-px w-8 bg-linear-to-l from-emerald-500/50 to-transparent" />
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="relative p-6 border-t border-gray-800 overflow-hidden">
                {/* Glow Orb */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />

                <p className="relative z-10 text-xs text-gray-500 text-center font-medium">Kajian Notes © 2025</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
