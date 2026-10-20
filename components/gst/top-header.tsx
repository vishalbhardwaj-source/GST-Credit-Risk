"use client"

import { Building2, CheckCircle2, ChevronDown, Clock, Download, ExternalLink, HelpCircle, Layers, Menu, Moon, Shield, Sun } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { COMPANIES, PERIODS } from "@/lib/gst-data"
import { cn } from "@/lib/utils"
import type { Phase } from "./dashboard-shell"
import { DemoBadge } from "./status-badges"

interface Props {
  company: string
  onCompanyChange: (c: string) => void
  period: string
  onPeriodChange: (p: string) => void
  phase: Phase
  lastRoutedAt: Date | null
  onOpenMobileNav: () => void
}

const companyItems = COMPANIES.map((c) => ({ value: c.id, label: c.name }))

export function TopHeader({
  company,
  onCompanyChange,
  period,
  onPeriodChange,
  phase,
  lastRoutedAt,
  onOpenMobileNav,
}: Props) {
  const busy = phase === "matching" || phase === "routing"
  const status = busy
    ? "Signal routing in progress…"
    : lastRoutedAt
    ? `Routed today at ${lastRoutedAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`
    : "GSTR-2B Synced · 14 Oct 2026"

  const selectedCompany = COMPANIES.find((c) => c.id === company)

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-2xs">
      <div className="flex h-15 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-muted-foreground hover:text-foreground"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>

          {/* Company Selector */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground border border-border/60">
              <Building2 className="size-4" />
            </span>
            <Select value={company} onValueChange={(v) => v && onCompanyChange(v as string)} items={companyItems}>
              <SelectTrigger
                className="h-9 min-w-0 max-w-[220px] sm:max-w-[280px] bg-card border-border/80 text-xs font-semibold shadow-2xs"
                aria-label="Buyer company"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPANIES.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    <span className="flex flex-col text-left">
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{c.gstin}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Return Filing Period Selector */}
          <Select value={period} onValueChange={(v) => v && onPeriodChange(v as string)} items={PERIODS}>
            <SelectTrigger
              className="hidden h-9 sm:flex bg-card border-border/80 text-xs font-semibold shadow-2xs"
              aria-label="GST filing return period"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs font-medium">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Status Indicator and User Profile */}
        <div className="flex items-center gap-3">
          <div
            className="hidden items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs text-muted-foreground md:flex shadow-2xs"
            role="status"
            aria-live="polite"
          >
            <span className="relative flex size-2">
              {busy && <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/70" />}
              <span className={cn("relative inline-flex size-2 rounded-full", busy ? "bg-primary" : "bg-emerald-500")} />
            </span>
            <span className="font-medium text-foreground">{status}</span>
          </div>

          <DemoBadge className="hidden sm:inline-flex" />

          {/* User Account / CA Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all outline-none"
                  aria-label="Account menu"
                />
              }
            >
              <Avatar className="size-8.5 border border-border/80">
                <AvatarFallback className="bg-gradient-to-tr from-primary to-primary/80 text-xs font-bold text-primary-foreground">
                  CA
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5 shadow-xl border-border/80">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="px-2 py-1.5">
                  <span className="block text-xs font-bold text-foreground">CA Priya Raman</span>
                  <span className="block text-[11px] font-normal text-muted-foreground">GST & Corporate Advisory</span>
                  <span className="mt-1 inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    Lead Reviewer
                  </span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs font-medium">Reconciliation Parameters</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-medium">TinyFish API Settings</DropdownMenuItem>
              <DropdownMenuItem className="text-xs font-medium">Audit Trail Log</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs font-medium text-rose-500">Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
