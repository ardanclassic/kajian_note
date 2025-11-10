/**
 * App Settings Component
 * Manage application preferences and settings
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Moon, Sun, Monitor, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Theme = "light" | "dark" | "system";

export function AppSettings() {
  const [theme, setTheme] = useState<Theme>("system");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedNotifications = localStorage.getItem("notifications");
    const savedAutoSave = localStorage.getItem("autoSave");

    if (savedTheme) setTheme(savedTheme);
    if (savedNotifications) setNotificationsEnabled(savedNotifications === "true");
    if (savedAutoSave) setAutoSave(savedAutoSave === "true");

    // Apply theme
    applyTheme(savedTheme || "system");
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }
  };

  // Handle theme change
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  // Handle save settings
  const handleSave = async () => {
    setIsLoading(true);

    try {
      // Save to localStorage
      localStorage.setItem("theme", theme);
      localStorage.setItem("notifications", String(notificationsEnabled));
      localStorage.setItem("autoSave", String(autoSave));

      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Pengaturan berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pengaturan Aplikasi</CardTitle>
        <CardDescription>Kelola preferensi aplikasi Anda</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Theme Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <Label className="text-base font-semibold">Tema</Label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Light Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange("light")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary ${
                theme === "light" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Sun className="h-6 w-6" />
              <span className="text-sm font-medium">Terang</span>
            </button>

            {/* Dark Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange("dark")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary ${
                theme === "dark" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Moon className="h-6 w-6" />
              <span className="text-sm font-medium">Gelap</span>
            </button>

            {/* System Theme */}
            <button
              type="button"
              onClick={() => handleThemeChange("system")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-primary ${
                theme === "system" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <Monitor className="h-6 w-6" />
              <span className="text-sm font-medium">Sistem</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Notifikasi</Label>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Aktifkan Notifikasi</div>
              <div className="text-xs text-muted-foreground">Terima notifikasi untuk pembaruan dan pengingat</div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notificationsEnabled ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notificationsEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Auto Save */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Penyimpanan</Label>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Simpan Otomatis</div>
              <div className="text-xs text-muted-foreground">
                Simpan perubahan secara otomatis saat mengedit catatan
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoSave(!autoSave)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                autoSave ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  autoSave ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={isLoading} className=" text-white">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
