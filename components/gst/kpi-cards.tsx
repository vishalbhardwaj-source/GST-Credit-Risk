"use client"

import { ArrowUpRight, CheckCircle2, Clock3, Eye, FileText, Layers, PauseCircle, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { BUCKET_LABEL, INVOICES, formatINR, type Bucket } from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { BUCKET_STYLES } from "./status-badges"

export function getBucketTotals(state: DashboardState) {
  const open = INVOICES.filter((i) => state.statuses[i.id].status !== "resolved")
  const totals: Record<Bucket, { count: number; amount: number }> = {
    safe: { count: 0, amount: 0 },
    watch: { count: 0, amount: 0 },
    chase: { count: 0, amount: 0 },
  }
  for (const inv of open) {
    const b = state.bucketOf(inv.id)
    if (b) {
      totals[b].count++
      totals[b].amount += inv.itc
    }
  }
  const atRisk = open.reduce((s, i) => s + i.itc, 0)
  return { totals, atRisk, openCount: open.length, resolvedCount: INVOICES.length - open.length }
}

const BUCKET_CONFIG: Record<
  Bucket,
  {
    icon: typeof Eye
    hint: string
    subhint: string
    glowClass: string
    accentColor: string
    trend: string
  }
> = {
  safe: {
    icon: PauseCircle,
    hint: "Safe to Hold",
    subhint: "Likely to self-correct in next GSTR-1",
    glowClass: "hover:shadow-[0_4px_20px_-2px_rgba(34,197,94,0.15)]",
    accentColor: "text-emerald-500 dark:text-emerald-400",
    trend: "83% expected resolution",
  },
  watch: {
    icon: Eye,
    hint: "Watch & Monitor",
    subhint: "Mixed signals, check before return filing",
    glowClass: "hover:shadow-[0_4px_20px_-2px_rgba(245,158,11,0.15)]",
    accentColor: "text-amber-500 dark:text-amber-400",
    trend: "Follow-up within 14 days",
  },
  chase: {
    icon: ShieldAlert,
    hint: "Chase Immediately",
    subhint: "Immediate vendor outreach or ITC reversal",
    glowClass: "hover:shadow-[0_4px_20px_-2px_rgba(239,68,68,0.18)]",
    accentColor: "text-rose-500 dark:text-rose-400",
    trend: "High financial exposure",
  },
}

export function KpiCards({ state }: { state: DashboardState }) {
  const { totals, atRisk, openCount, resolvedCount } = getBucketTotals(state)
  const loading = state.phase === "matching"
  const notRouted = state.phase === "idle" || loading

  const totalInvoices = INVOICES.length
  const resolutionRate = totalInvoices > 0 ? Math.round((resolvedCount / totalInvoices) * 100) : 0

  return (
    <section aria-label="Key metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Primary Hero Card: Total Exposure */}
      <article className="group relative overflow-hidden rounded-xl border border-border/80 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md">
        <div className="absolute -top-12 -right-12 size-28 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/15 transition-all" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldAlert className="size-4" aria-hidden />
            </span>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
              Total ITC Exposure
            </h2>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Clock3 className="size-3" />
            Active Period
          </span>
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <p className="text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {formatINR(atRisk)}
          </p>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <span className="font-medium text-foreground">
            {openCount} <span className="font-normal text-muted-foreground">unmatched items</span>
          </span>
          {resolvedCount > 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="size-3" />
              {resolvedCount} resolved ({resolutionRate}%)
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Needs review</span>
          )}
        </div>
      </article>

      {/* 3 Decision Buckets */}
      {(["safe", "watch", "chase"] as Bucket[]).map((b) => {
        const conf = BUCKET_CONFIG[b]
        const Icon = conf.icon
        const s = BUCKET_STYLES[b]
        const t = totals[b]

        return (
          <article
            key={b}
            className={cn(
              "group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md",
              conf.glowClass
            )}
          >
            {/* Top accent line */}
            <span className={cn("absolute inset-x-0 top-0 h-1", s.bar)} aria-hidden />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={cn("flex size-7 items-center justify-center rounded-lg", s.soft, conf.accentColor)}>
                  <Icon className="size-4" aria-hidden />
                </span>
                <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
                  {BUCKET_LABEL[b]}
                </h2>
              </div>
              <span className="text-[11px] font-mono font-medium text-muted-foreground/80">
                {notRouted ? "" : `${t.count} items`}
              </span>
            </div>

            {loading ? (
              <div className="mt-3 space-y-2" aria-label="Loading metric">
                <div className="h-8 w-24 animate-pulse rounded-md bg-muted" />
                <div className="h-3 w-36 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="text-3xl font-bold tracking-tight tabular-nums text-foreground">
                    {notRouted ? "—" : t.count}
                  </p>
                  {!notRouted && (
                    <span className="text-sm font-semibold tabular-nums text-muted-foreground">
                      {formatINR(t.amount)}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span className="truncate max-w-[150px] font-medium" title={conf.subhint}>
                    {notRouted ? "Awaiting routing run" : conf.subhint}
                  </span>
                  {!notRouted && (
                    <span className="text-[10px] uppercase tracking-wider font-semibold opacity-70">
                      {b === "safe" ? "Low Risk" : b === "watch" ? "Med Risk" : "Critical"}
                    </span>
                  )}
                </div>
              </>
            )}
          </article>
        )
      })}
    </section>
  )
}
