"use client"

import { usePathname } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useLocale, useTranslations } from "next-intl"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { LanguageSwitcher } from "@/components/language-switcher"

const navItems = [
  { titleKey: "adCopies" as const, href: "/ad-copies", icon: Copy },
  { titleKey: "adCreatives" as const, href: "/ad-creatives", icon: Palette },
  { titleKey: "landingPages" as const, href: "/landing-pages", icon: LayoutTemplate },
  { titleKey: "editImages" as const, href: "/edit-images", icon: ImageIcon },
]

export function AppSidebar() {
  const locale = useLocale()
  const pathname = usePathname()
  const t = useTranslations("nav")
  const isRtl = locale === "ar"

  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      side={isRtl ? "right" : "left"}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <SidebarHeader className="border-b border-sidebar-border/80 ps-4 pe-4 py-5">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold text-sidebar-foreground transition-colors hover:text-sidebar-foreground/90 rtl:flex-row-reverse"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/20">
            <Sparkles className="size-5" />
          </div>
          <span className="text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            Novex
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="ps-2 pe-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map(({ titleKey, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname === href} className="rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:shadow-sm rtl:flex-row-reverse">
                    <Link href={href}>
                      <Icon className="size-4 shrink-0" />
                      <span>{t(titleKey)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="ps-3 pe-3 py-3 border-t border-sidebar-border/80 group-data-[collapsible=icon]:hidden">
        <LanguageSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
