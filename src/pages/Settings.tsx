/**
 * Settings Page
 * Main settings page with tabs for different settings categories
 */

import { useState } from "react";
import { UserSettings } from "@/components/features/settings/UserSettings";
import { AppSettings } from "@/components/features/settings/AppSettings";
import { Button } from "@/components/ui/button";
import { User, Settings as SettingsIcon, Shield, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tab = "profile" | "app" | "security";

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  const tabs = [
    { id: "profile" as Tab, label: "Profil", icon: User },
    { id: "app" as Tab, label: "Aplikasi", icon: SettingsIcon },
    { id: "security" as Tab, label: "Keamanan", icon: Shield },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ChevronLeft className="h-4 w-4" />
          Kembali
        </Button>

        <h1 className="text-3xl font-bold">Pengaturan</h1>
        <p className="text-muted-foreground mt-2">Kelola profil dan preferensi akun Anda</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b">
          <nav className="flex gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === "profile" && <UserSettings />}
        {activeTab === "app" && <AppSettings />}
        {activeTab === "security" && <SecuritySettings />}
      </div>
    </div>
  );
}

/**
 * Security Settings Component
 * Placeholder for security settings (PIN change, etc.)
 */
function SecuritySettings() {
  return (
    <div className="rounded-lg border bg-card p-8 text-center">
      <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Pengaturan Keamanan</h3>
      <p className="text-sm text-muted-foreground mb-4">Fitur pengaturan keamanan akan segera hadir</p>
      <p className="text-xs text-muted-foreground">Hubungi admin untuk mengubah PIN atau mengatur keamanan akun</p>
    </div>
  );
}
