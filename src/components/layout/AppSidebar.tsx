import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  User,
  LogOut,
  Sparkles,
  Zap,
  Crown,
  Users,
  ChevronsUpDown,
  Heart,
  Paintbrush,
  Info,
  X,

  Map,
  Palette
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ThemeSettings } from "@/components/features/theme/ThemeSettings";
import logo from "@/assets/images/logo.png";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isMobile, setOpenMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
  const [showThemeSettings, setShowThemeSettings] = React.useState(false);

  const handleNavigation = (url: string) => {
    navigate(url);
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  // Main navigation items
  const mainNavItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: location.pathname === "/dashboard",
    },
    {
      title: "Note Summary",
      url: "/notes",
      icon: BookOpen,
      isActive: location.pathname === "/notes" || location.pathname.startsWith("/notes/"),
    },
    {
      title: "Deep Note",
      url: "/deep-note",
      icon: Zap,
      isActive: location.pathname.startsWith("/deep-note"),
    },
    {
      title: "Memory Journey",
      url: "/memory-journey",
      icon: Map,
      isActive: location.pathname.startsWith("/memory-journey"),
    },
    {
      title: "Content Studio",
      url: "/content-studio",
      icon: Palette,
      isActive: location.pathname.startsWith("/content-studio"),
    },
  ];

  const adminNavItems = user?.role === "admin" ? [
    {
      title: "Manage Users",
      url: "/admin/users",
      icon: Users,
    }
  ] : [];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  return (
    <>
      <Sidebar collapsible="icon" {...props} className="border-r border-gray-800 bg-black">
        <SidebarHeader className="h-16 flex items-center border-b border-gray-800/50 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 px-4">
          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <button
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left bg-transparent border-none p-0 focus:outline-none"
              onClick={() => handleNavigation('/')}
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-full shrink-0 group-data-[collapsible=icon]:size-12 shadow-md shadow-emerald-500/20">
                <img src={logo} alt="Alwaah Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-bold text-lg text-white">Alwaah</span>
                <span className="truncate text-xs text-gray-400">AI Assistant</span>
              </div>
            </button>

            {/* Close Button Mobile Only */}
            {isMobile && (
              <button
                onClick={() => setOpenMobile(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-black pt-2">
          <SidebarGroup className="group-data-[collapsible=icon]:px-2 py-0">
            <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1 group-data-[collapsible=icon]:hidden">Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      size="lg"
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.url)}
                      isActive={item.isActive}
                      className="hover:bg-gray-900 hover:text-emerald-400 data-[active=true]:bg-emerald-500/10 data-[active=true]:text-emerald-400 transition-all font-medium py-2.5 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                    >
                      {item.icon && <item.icon className="w-5! h-5! text-gray-400 group-hover:text-emerald-400 group-data-[active=true]:text-emerald-400 shrink-0 group-data-[collapsible=icon]:w-6! group-data-[collapsible=icon]:h-6!" />}
                      <span className="text-sm ml-1">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {adminNavItems.length > 0 && (
            <SidebarGroup className="group-data-[collapsible=icon]:px-2 py-0">
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 mb-1 mt-2 group-data-[collapsible=icon]:hidden">Admin</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        size="lg"
                        tooltip={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className="hover:bg-gray-900 hover:text-emerald-400 transition-all font-medium py-2.5 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
                      >
                        {item.icon && <item.icon className="w-5! h-5! shrink-0 group-data-[collapsible=icon]:w-6! group-data-[collapsible=icon]:h-6!" />}
                        <span className="text-sm ml-1">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        <SidebarFooter className="bg-black border-t border-gray-800/50 p-2 group-data-[collapsible=icon]:p-3">
          <SidebarMenu className="group-data-[collapsible=icon]:items-center">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-emerald-500/10 data-[state=open]:text-emerald-400 hover:bg-gray-900 hover:text-white group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12"
                  >
                    <Avatar className="h-8 w-8 rounded-lg shrink-0 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                      <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
                      <AvatarFallback className="rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                        {user?.fullName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-white">{user?.fullName}</span>
                      <span className="truncate text-xs text-gray-400">{user?.email}</span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl bg-black border border-gray-800 text-gray-200 shadow-2xl p-2"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal mb-2">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm bg-gray-900/50 rounded-lg">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
                        <AvatarFallback className="rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                          {user?.fullName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-white">{user?.fullName}</span>
                        <span className="truncate text-xs text-gray-400">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg py-2">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/subscription')} className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg py-2">
                      <Crown className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>Upgrade Plan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/donation')} className="focus:bg-pink-500/10 focus:text-pink-400 cursor-pointer rounded-lg py-2">
                      <Heart className="mr-2 h-4 w-4 text-pink-500" />
                      <span>Donasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/about')} className="focus:bg-emerald-500/10 focus:text-emerald-400 cursor-pointer rounded-lg py-2">
                      <Sparkles className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>Tentang Kami</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-gray-800 my-2" />

                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem onClick={() => setShowThemeSettings(true)} className="focus:bg-blue-500/10 focus:text-blue-400 cursor-pointer rounded-lg py-2">
                      <Paintbrush className="mr-2 h-4 w-4 text-blue-500" />
                      <span>Tampilan & Font</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-gray-800 my-2" />

                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="text-red-400 focus:text-red-400 focus:bg-red-950/20 cursor-pointer rounded-lg py-2">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <ConfirmDialog
          open={showLogoutDialog}
          onOpenChange={setShowLogoutDialog}
          title="Keluar dari Akun?"
          description="Apakah Anda yakin ingin keluar?"
          confirmText="Logout"
          cancelText="Batal"
          onConfirm={handleLogout}
          variant="danger"
        />

        <ThemeSettings
          open={showThemeSettings}
          onClose={() => setShowThemeSettings(false)}
        />
      </Sidebar >
    </>
  );
}
