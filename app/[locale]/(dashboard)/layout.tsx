import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border/80 bg-background/80 ps-4 pe-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 md:px-6 rtl:flex-row-reverse">
          <SidebarTrigger className="-ms-1 size-8 rounded-lg hover:bg-muted/80 rtl:ms-0 rtl:-me-1" />
          <Separator orientation="vertical" className="h-5" />
          <span className="text-sm font-medium tracking-tight text-foreground/90">
            Novex
          </span>
        </header>
        <div className="flex flex-1 flex-col p-6 md:p-8 lg:p-10">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
