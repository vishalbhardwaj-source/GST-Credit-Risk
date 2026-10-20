"use client"

import { Building2, CheckCircle2, ChevronRight, ExternalLink, Filter, HelpCircle, ShieldAlert, Sparkles, TrendingUp } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { INVOICES, VENDORS, formatINR, type Bucket } from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { FilingHistory, FilingPatternLabel, TriageBadge } from "./status-badges"

const SEVERITY: Bucket[] = ["chase", "watch", "safe"]

export function VendorsView({ state }: { state: DashboardState }) {
  const rows = VENDORS.map((v) => {
    const invs = INVOICES.filter((i) => i.vendorId === v.id && state.statuses[i.id].status !== "resolved")
    const buckets = invs.map((i) => state.bucketOf(i.id)).filter(Boolean) as Bucket[]
    const worst = SEVERITY.find((b) => buckets.includes(b)) ?? null
    return { v, count: invs.length, itc: invs.reduce((s, i) => s + i.itc, 0), worst }
  }).sort((a, b) => b.itc - a.itc)

  return (
    <div className="flex flex-col gap-5 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Supplier Compliance Directory</h1>
          <p className="text-xs text-muted-foreground">
            {VENDORS.length} active suppliers evaluated on 6-month GSTR-1 return filing timeliness and credit risk.
          </p>
        </div>
        <span className="rounded-full bg-muted/80 px-3 py-1 text-xs font-semibold text-muted-foreground border border-border/60">
          Masked GSTINs · Demo Mode
        </span>
      </div>

      <section className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <Table className="min-w-[900px] text-xs">
          <TableHeader>
            <TableRow className="border-border/80 hover:bg-transparent bg-muted/20">
              <TableHead className="pl-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Supplier Name & Location</TableHead>
              <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">GSTIN</TableHead>
              <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Return Scheme</TableHead>
              <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Filing Track (Apr–Sep)</TableHead>
              <TableHead className="text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Open Flags</TableHead>
              <TableHead className="text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Total ITC Exposed</TableHead>
              <TableHead className="pr-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Worst Triage Tier</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(({ v, count, itc, worst }) => (
              <TableRow key={v.id} className="border-border/60 hover:bg-muted/30 transition-colors">
                <TableCell className="pl-5 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-xs">{v.name}</span>
                    <span className="text-[11px] text-muted-foreground">{v.city}</span>
                  </div>
                </TableCell>

                <TableCell className="font-mono text-xs text-muted-foreground font-medium py-3">
                  {v.gstin}
                </TableCell>

                <TableCell className="py-3">
                  <FilingPatternLabel pattern={v.pattern} />
                </TableCell>

                <TableCell className="py-3">
                  <FilingHistory history={v.history} />
                </TableCell>

                <TableCell className="text-right font-semibold tabular-nums text-foreground py-3">
                  {count}
                </TableCell>

                <TableCell className="text-right font-bold tabular-nums text-foreground py-3">
                  {formatINR(itc)}
                </TableCell>

                <TableCell className="pr-5 py-3">
                  {count ? (
                    <TriageBadge bucket={worst} />
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      All Reconciled
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-muted/20 px-5 py-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <Legend className="bg-emerald-500" label="Filed on time" />
            <Legend className="bg-amber-500" label="Filed late" />
            <Legend className="bg-rose-500" label="Return missed" />
            <Legend className="bg-muted-foreground/30" label="Not due (QRMP)" />
          </div>
          <span className="text-[11px] font-medium text-foreground/80">
            Source: 6-month statutory filing history
          </span>
        </footer>
      </section>
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 font-medium">
      <span className={`h-2.5 w-3.5 rounded-xs ${className}`} aria-hidden />
      {label}
    </span>
  )
}
