import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { Outlet } from "react-router-dom"
import { Toaster } from "@/components/ui/toaster"

export default function MainLayout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="bg-black text-white overflow-x-hidden w-full">
        <Outlet />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  )
}
