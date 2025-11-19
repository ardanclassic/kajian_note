/**
 * Mobile Menu Component - Fullscreen Overlay
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Menu Panel */}
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-y-0 right-0 w-full sm:w-80 bg-card border-l shadow-2xl z-50 overflow-y-auto"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-lg font-bold">Menu</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{userName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* User Info */}
              <div className="p-6 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{userName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={userTier === "free" ? "outline" : "default"} className="text-xs">
                        {userTier.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 p-4 space-y-2">
                {menuItems.map((item, index) => {
                  if (item.adminOnly && userRole !== "admin") return null;

                  return (
                    <motion.div key={index} custom={index} variants={itemVariants} initial="hidden" animate="visible">
                      <Button
                        variant="ghost"
                        className="w-full justify-start h-12 text-base"
                        onClick={() => {
                          item.onClick();
                          onClose();
                        }}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="p-6 border-t">
                <p className="text-xs text-muted-foreground text-center">Kajian Notes © 2025</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
