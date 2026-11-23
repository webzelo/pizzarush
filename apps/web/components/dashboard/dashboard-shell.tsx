import type { ReactNode } from "react"

import { Separator } from "@workspace/ui/components/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { TooltipProvider } from "@workspace/ui/components/tooltip"

import type { AccountRole } from "@/lib/auth/roles"

import { AppSidebar, type DashboardUser } from "./app-sidebar"
import { DashboardBreadcrumb } from "./dashboard-breadcrumb"

type DashboardShellProps = {
  role: AccountRole
  user: DashboardUser
  children: ReactNode
}

/** Shared sidebar + content frame used by all three dashboards. */
export function DashboardShell({ role, user, children }: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar role={role} user={user} />
        <SidebarInset className="min-h-svh min-w-0">
          <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-4" />
            <DashboardBreadcrumb role={role} />
          </header>
          <div className="flex w-full max-w-none min-w-0 flex-1 flex-col gap-6 bg-muted/20 p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
