import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  BookOpen,
  LayoutDashboard,
  User,
  LogOut,

  Crown,
  Users,
  ChevronsUpDown,
  Heart,
  Info,
  X,
  Palette,
  Wand2,
  Target
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
import logo from "@/assets/images/logo.png";
import { cn } from "@/lib/utils";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { isMobile, setOpenMobile, state } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);

  const isCollapsed = state === "collapsed";

  const handleNavigation = (url: string) => {
    navigate(url);
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
      title: "Content Studio",
      url: "/content-studio",
      icon: Palette,
      isActive: location.pathname.startsWith("/content-studio"),
    },
    {
      title: "Prompt Studio",
      url: "/prompt-studio",
      icon: Wand2,
      isActive: location.pathname.startsWith("/prompt-studio"),
    },
    {
      title: "Quest",
      url: "/quest",
      icon: Target,
      isActive: location.pathname.startsWith("/quest"),
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
        {/* Header Section */}
        <SidebarHeader className="h-20 flex items-center border-b border-gray-800/30 px-4 group-data-[collapsible=icon]:px-0">
          <div className={cn(
            "flex items-center w-full transition-all duration-300",
            isCollapsed ? "justify-center" : "justify-between"
          )}>
            <button
              className="flex items-center gap-3 cursor-pointer group focus:outline-none"
              onClick={() => handleNavigation('/')}
            >
              <div className={cn(
                "relative flex items-center justify-center rounded-2xl transition-all duration-300",
                isCollapsed ? "w-10 h-10 shadow-lg shadow-emerald-500/10" : "w-10 h-10 shadow-emerald-500/20"
              )}>
                <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors" />
                <img src={logo} alt="Alwaah Logo" className="w-8 h-8 object-cover rounded-full relative z-10" />
              </div>

              {!isCollapsed && (
                <div className="grid flex-1 text-left leading-tight">
                  <span className="font-bold text-lg text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                    Alwaah
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-semibold">
                    AI Assistant
                  </span>
                </div>
              )}
            </button>

            {/* Close Button Mobile Only */}
            {isMobile && (
              <button
                onClick={() => setOpenMobile(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </SidebarHeader>

        {/* Content Section */}
        <SidebarContent className="bg-black pt-6 px-3">
          {/* Main Menu */}
          <SidebarGroup className="p-0 space-y-4">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">
                Menu
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className={cn("gap-2", isCollapsed && "items-center gap-4")}>
                {mainNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => handleNavigation(item.url)}
                      isActive={item.isActive}
                      className={cn(
                        "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                        isCollapsed ? "h-11 w-11 justify-center p-0" : "h-11 px-3",
                        item.isActive
                          ? "bg-emerald-500/10 text-emerald-400 shadow-[inset_3px_0_0_0_#10b981]"
                          : "text-gray-400 hover:bg-gray-900/60 hover:text-gray-200"
                      )}
                    >
                      {/* Active State Gradient Background (Subtle) */}
                      {item.isActive && !isCollapsed && (
                        <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-transparent opacity-50" />
                      )}

                      <item.icon className={cn(
                        "transition-colors duration-200 z-10",
                        isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5",
                        item.isActive ? "text-emerald-400" : "group-hover:text-emerald-400"
                      )} />

                      {!isCollapsed && (
                        <span className={cn(
                          "text-sm font-medium z-10",
                          item.isActive ? "text-emerald-400" : "group-hover:text-white"
                        )}>
                          {item.title}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Admin Menu */}
          {adminNavItems.length > 0 && (
            <SidebarGroup className="p-0 mt-6 space-y-4">
              {!isCollapsed && (
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-widest px-2 mb-2">
                  Admin
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className={cn("gap-2", isCollapsed && "items-center gap-4")}>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        onClick={() => handleNavigation(item.url)}
                        className={cn(
                          "w-full flex items-center gap-3 rounded-xl transition-all duration-200 group",
                          isCollapsed ? "h-11 w-11 justify-center p-0" : "h-11 px-3",
                          "text-gray-400 hover:bg-gray-900/60 hover:text-gray-200"
                        )}
                      >
                        <item.icon className={cn(
                          "transition-colors duration-200",
                          isCollapsed ? "w-5 h-5" : "w-4.5 h-4.5",
                          "group-hover:text-amber-400"
                        )} />
                        {!isCollapsed && (
                          <span className="text-sm font-medium group-hover:text-white">{item.title}</span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>

        {/* Footer Section */}
        <SidebarFooter className="bg-black border-t border-gray-800/30 p-2 md:p-4">
          <SidebarMenu className={cn(isCollapsed && "items-center")}>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "w-full rounded-xl transition-all duration-200 hover:bg-gray-900 border border-transparent hover:border-gray-800",
                      isCollapsed ? "h-12 w-12 justify-center p-0" : "h-auto px-3 py-2"
                    )}
                  >
                    <Avatar className={cn("rounded-lg border border-gray-800", isCollapsed ? "h-9 w-9" : "h-9 w-9")}>
                      <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
                      <AvatarFallback className="rounded-lg bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/20">
                        {user?.fullName?.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight ml-3">
                          <span className="truncate font-semibold text-gray-200 group-hover:text-white transition-colors">
                            {user?.fullName}
                          </span>
                          <span className="truncate text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                            {user?.email}
                          </span>
                        </div>
                        <ChevronsUpDown className="ml-auto size-4 text-gray-600 group-hover:text-gray-400" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-60 rounded-xl bg-[#0a0a0a] border border-gray-800 text-gray-400 shadow-2xl p-2"
                  side="bottom"
                  align="end"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal mb-2">
                    <div className="flex items-center gap-3 px-3 py-2.5 text-left text-sm bg-gray-900/50 rounded-lg border border-gray-800/50">
                      <Avatar className="h-9 w-9 rounded-lg border border-gray-700/50">
                        <AvatarImage src={user?.avatarUrl || undefined} alt={user?.fullName} />
                        <AvatarFallback className="rounded-lg bg-emerald-950 text-emerald-400 font-bold">
                          {user?.fullName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-white">{user?.fullName}</span>
                        <span className="truncate text-xs text-gray-500">{user?.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuGroup className="space-y-1">
                    <DropdownMenuItem onClick={() => handleNavigation('/profile')} className="group focus:bg-gray-800 focus:text-white cursor-pointer rounded-lg py-2.5 px-3 transition-colors">
                      <User className="mr-3 h-4 w-4 group-hover:text-emerald-400 transition-colors" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/subscription')} className="group focus:bg-gray-800 focus:text-white cursor-pointer rounded-lg py-2.5 px-3 transition-colors">
                      <Crown className="mr-3 h-4 w-4 group-hover:text-amber-400 transition-colors" />
                      <span>Upgrade Plan</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/donation')} className="group focus:bg-gray-800 focus:text-white cursor-pointer rounded-lg py-2.5 px-3 transition-colors">
                      <Heart className="mr-3 h-4 w-4 group-hover:text-pink-400 transition-colors" />
                      <span>Donasi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavigation('/about')} className="group focus:bg-gray-800 focus:text-white cursor-pointer rounded-lg py-2.5 px-3 transition-colors">
                      <Info className="mr-3 h-4 w-4 group-hover:text-blue-400 transition-colors" />
                      <span>Tentang Kami</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>

                  <DropdownMenuSeparator className="bg-gray-800/50 my-2" />

                  <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="group text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer rounded-lg py-2.5 px-3 transition-colors">
                    <LogOut className="mr-3 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
      </Sidebar >
    </>
  );
}
