import type { LucideIcon } from "lucide-react";
import React from "react";

export type GuideSectionColor = "pink" | "emerald" | "rose" | "amber" | "blue" | "purple" | "slate";

interface GuideSectionProps {
  icon: LucideIcon;
  title: string;
  color: GuideSectionColor;
  children: React.ReactNode;
}

export function GuideSection({
  icon: Icon,
  title,
  color,
  children,
}: GuideSectionProps) {
  const colorClasses = {
    pink: "from-pink-900/20 to-rose-900/20 border-pink-500/30",
    emerald: "from-emerald-900/20 to-green-900/20 border-emerald-500/30",
    rose: "from-rose-900/20 to-red-900/20 border-rose-500/30",
    amber: "from-amber-900/20 to-yellow-900/20 border-amber-500/30",
    blue: "from-blue-900/20 to-cyan-900/20 border-blue-500/30",
    purple: "from-purple-900/20 to-violet-900/20 border-purple-500/30",
    slate: "from-slate-900/20 to-gray-900/20 border-slate-500/30",
  };

  return (
    <div
      className={`p-4 bg-linear-to-br ${colorClasses[color] || colorClasses.slate} border rounded-lg transition-all hover:shadow-lg hover:shadow-${color}-500/5`}
    >
      <div className="flex items-center gap-2 mb-3">
        {/* <Icon className={`w-5 h-5 ${iconColors[color] || iconColors.slate}`} /> */}
        <h3 className="text-lg font-bold text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}
