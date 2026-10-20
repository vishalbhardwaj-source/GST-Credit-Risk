"use client"

import { BarChart3, Building2, ChevronRight, FileBarChart, IndianRupee, Layers, LayoutDashboard, ListChecks, ShieldCheck, Sparkles, Upload } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { DemoBadge } from "./status-badges"

export type ViewId = "overview" | "queue" | "vendors" | "imports" | "reports"

const NAV: { id: ViewId; label: string; icon: typeof LayoutDashboard; description: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, description: "Control tower & pipeline" },
  { id: "queue", label: "Invoice Queue", icon: ListChecks, description: "Discrepancy audit list" },
  { id: "vendors", label: "Vendors", icon: Building2, description: "Compliance history" },
  { id: "imports", label: "Imports", icon: Upload, description: "Register & 2B sources" },
  { id: "reports", label: "Reports", icon: FileBarChart, description: "CA export & summaries" },
]

interface Props {
  view: ViewId
  onNavigate: (v: ViewId) => void
  mobileOpen: boolean
  onMobileOpenChange: (o: boolean) => void
  openCount: number
}

function SidebarBody({ view, onNavigate, openCount }: Pick<Props, "view" | "onNavigate" | "openCount">) {
  return (
    <div className="flex h-full flex-col justify-between p-3">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3.5 rounded-xl bg-muted/40 border border-border/50 mb-3">
          <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
            <IndianRupee className="size-4.5 stroke-[2.5]" aria-hidden />
            <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <div className="min-w-0 flex-1 leading-tight">
            <span className="block text-sm font-bold tracking-tight text-foreground truncate">
              GST Forecaster
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Risk Engine
              </span>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">v1.2</span>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav aria-label="Main" className="px-1 py-1">
          <p className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Workspace
          </p>
          <ul className="flex flex-col gap-1">
            {NAV.map(({ id, label, icon: Icon }) => {
              const active = view === id
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(id)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-150",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={cn("size-4 shrink-0 transition-transform group-hover:scale-105", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="truncate">{label}</span>
                    </div>

                    {id === "queue" && (
                      <span
                        className={cn(
                          "ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                          active
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {openCount}
                      </span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="space-y-2 px-1">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-3 text-xs leading-relaxed">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <Sparkles className="size-3.5" />
            <span>Kritical Hacks 2026</span>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
            Explainable AI decision engine backed by TinyFish web verification.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 text-[10px] text-muted-foreground">
          <span>Seeded Demo Workspace</span>
          <DemoBadge />
        </div>
      </div>
    </div>
  )
}

export function AppSidebar({ view, onNavigate, mobileOpen, onMobileOpenChange, openCount }: Props) {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-border/80 bg-sidebar lg:block">
        <SidebarBody view={view} onNavigate={onNavigate} openCount={openCount} />
      </aside>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-68 bg-sidebar p-0 text-sidebar-foreground" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SidebarBody view={view} onNavigate={onNavigate} openCount={openCount} />
        </SheetContent>
      </Sheet>
    </>
  )
}
