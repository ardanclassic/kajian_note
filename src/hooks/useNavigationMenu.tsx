import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import {
  BookOpen,
  Crown,
  User,
  Users,
  LogOut,

  Sparkles
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

export interface MenuItem {
  icon: any;
  label: string;
  onClick: () => void;
  badge?: string;
  adminOnly?: boolean;
}

export const useNavigationMenu = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleConfirmLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems: MenuItem[] = [
    { icon: Sparkles, label: "Note Summary", onClick: () => navigate("/notes") },

    { icon: Crown, label: "Subscription", onClick: () => navigate("/subscription") },
    { icon: User, label: "Profile", onClick: () => navigate("/profile") },
    { icon: Users, label: "Kelola Users", onClick: () => navigate("/admin/users"), adminOnly: true },
    { icon: LogOut, label: "Logout", onClick: handleLogoutClick },
  ];

  const LogoutDialog = () => (
    <ConfirmDialog
      open={showLogoutDialog}
      onOpenChange={setShowLogoutDialog}
      title="Keluar dari Akun?"
      description="Apakah Anda yakin ingin keluar dari akun Anda?"
      confirmText="Ya, Keluar"
      cancelText="Batal"
      onConfirm={handleConfirmLogout}
      variant="warning"
      showCancel={true}
    />
  );

  return { menuItems, LogoutDialog };
};
