"use client"

import { BarChart3, Info, PieChart, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { BUCKET_LABEL, formatINR, type Bucket } from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { getBucketTotals } from "./kpi-cards"
import { BUCKET_STYLES } from "./status-badges"

const BUCKETS: Bucket[] = ["safe", "watch", "chase"]

export function TriageSummary({ state }: { state: DashboardState }) {
  const { totals, atRisk } = getBucketTotals(state)
  const routedCount = BUCKETS.reduce((s, b) => s + totals[b].count, 0)
  const routedAmount = BUCKETS.reduce((s, b) => s + totals[b].amount, 0)
  const maxAmount = Math.max(1, ...BUCKETS.map((b) => totals[b].amount))
  const hasData = routedCount > 0

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/80 bg-card p-5 shadow-sm">
      <header className="flex items-center justify-between border-b border-border/60 pb-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Exposure Risk & Action Breakdown</h2>
          <p className="text-xs text-muted-foreground">Distribution of unmatched credit across decision categories</p>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Open Invoices Only
        </span>
      </header>

      <div className="mt-4 grid flex-1 gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,1.4fr)]">
        {/* Left: Total exposure block */}
        <div className="flex flex-col justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total ITC At Risk
            </span>
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
              {formatINR(atRisk)}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Tax credit subject to Section 16(2)(aa) verification
            </p>
          </div>

          {hasData && totals.chase.count + totals.watch.count > 0 ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-foreground">
              <span className="font-bold text-amber-700 dark:text-amber-300">
                {formatINR(totals.chase.amount + totals.watch.amount)}
              </span>{" "}
              demands active follow-up across {totals.chase.count + totals.watch.count} high-priority invoices.
            </div>
          ) : (
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              Run routing to quantify actionable exposure vs self-correcting invoices.
            </div>
          )}
        </div>

        {/* Middle: Progress Bar & Count Breakdown */}
        <div className="flex flex-col justify-between rounded-xl border border-border/60 bg-muted/20 p-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Invoice Distribution
            </span>
            <div
              className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-muted/80 p-0.5 shadow-inner"
              role="img"
              aria-label={
                hasData
                  ? BUCKETS.map((b) => `${totals[b].count} ${BUCKET_LABEL[b]}`).join(", ")
                  : "No invoices routed yet"
              }
            >
              {BUCKETS.map((b) => (
                <span
                  key={b}
                  className={cn("h-full rounded-full transition-all duration-700 ease-out", BUCKET_STYLES[b].bar)}
                  style={{
                    width: `${
                      routedCount ? (totals[b].count / Math.max(routedCount, 1)) * (routedCount / 30) * 100 : 0
                    }%`,
                  }}
                />
              ))}
            </div>
          </div>

          <dl className="mt-4 grid grid-cols-3 gap-2 text-center pt-3 border-t border-border/40">
            {BUCKETS.map((b) => (
              <div key={b} className="flex flex-col items-center">
                <dt className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <span className={cn("size-2 rounded-full", BUCKET_STYLES[b].dot)} aria-hidden />
                  <span className="truncate">{BUCKET_LABEL[b].split(" ")[0]}</span>
                </dt>
                <dd className="mt-1 text-xl font-bold tabular-nums text-foreground">
                  {hasData ? totals[b].count : "—"}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Right: Detailed Bar Charts by Bucket */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-3">
            Financial Impact by Category
          </span>

          {hasData ? (
            <ul className="flex flex-col gap-3">
              {BUCKETS.map((b) => {
                const t = totals[b]
                const share = routedAmount ? Math.round((t.amount / routedAmount) * 100) : 0
                return (
                  <li key={b} className="grid grid-cols-[85px_1fr_auto] items-center gap-2.5 text-xs">
                    <span className="font-semibold text-foreground truncate">{BUCKET_LABEL[b]}</span>
                    <div className="h-5 overflow-hidden rounded-md bg-muted/80 p-0.5">
                      <div
                        className={cn("h-full rounded-sm transition-all duration-700 ease-out", BUCKET_STYLES[b].bar)}
                        style={{ width: `${(t.amount / maxAmount) * 100}%` }}
                      />
                    </div>
                    <div className="w-28 text-right tabular-nums">
                      <span className="font-bold text-foreground">{formatINR(t.amount)}</span>
                      <span className="text-muted-foreground font-medium text-[11px]"> ({share}%)</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className="flex flex-col gap-3 py-2" aria-hidden>
              {[80, 45, 25].map((w) => (
                <div key={w} className="grid grid-cols-[85px_1fr] items-center gap-2.5">
                  <span className="h-3.5 rounded bg-muted/60" />
                  <span className="h-5 rounded-md bg-muted/60" style={{ width: `${w}%` }} />
                </div>
              ))}
              <p className="mt-2 text-xs text-muted-foreground italic">
                Execute routing to see exposure distribution across risk categories.
              </p>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
