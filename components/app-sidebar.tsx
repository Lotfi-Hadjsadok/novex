"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  Copy,
  ImageIcon,
  LayoutTemplate,
  Palette,
  Sparkles,
} from "lucide-react"

const navItems = [
  { title: "Ad copies", href: "/ad-copies", icon: Copy },
  { title: "Ad Creatives", href: "/ad-creatives", icon: Palette },
  { title: "Landing Pages", href: "/landing-pages", icon: LayoutTemplate },
  { title: "Edit Images", href: "/edit-images", icon: ImageIcon },
] as const

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border/80 px-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-sidebar-foreground transition-colors hover:text-sidebar-foreground/90"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="size-5" />
          </div>
          <span className="text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Novex
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map(({ title, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm">
                    <Link href={href}>
                      <Icon className="size-4 shrink-0" />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
