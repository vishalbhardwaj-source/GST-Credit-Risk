"use client"

import { useMemo, useState } from "react"
import { ArrowUpDown, Check, ChevronDown, Download, ExternalLink, FilterX, HelpCircle, Play, Search, SearchX, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  BUCKET_LABEL,
  FILING_LABEL,
  INVOICES,
  ROUTING,
  VENDORS,
  VENDOR_BY_ID,
  ageInDays,
  formatDate,
  formatINR,
  type Bucket,
} from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { BUCKET_STYLES, FilingPatternLabel, IrnBadge, LeverageLabel, StatusChip, TriageBadge } from "./status-badges"

type TabValue = "all" | Bucket
type Opt = { value: string; label: string }

const VENDOR_OPTS: Opt[] = [{ value: "all", label: "All Vendors" }, ...VENDORS.map((v) => ({ value: v.id, label: v.name }))]
const AMOUNT_OPTS: Opt[] = [
  { value: "all", label: "Any Amount" },
  { value: "lt200", label: "Under ₹200" },
  { value: "200-350", label: "₹200 – ₹350" },
  { value: "gt350", label: "Over ₹350" },
]
const AGE_OPTS: Opt[] = [
  { value: "all", label: "Any Aging" },
  { value: "lt30", label: "< 30 days" },
  { value: "30-45", label: "30 – 45 days" },
  { value: "gt45", label: "> 45 days" },
]
const IRN_OPTS: Opt[] = [
  { value: "all", label: "Any IRN Status" },
  { value: "found", label: "IRN Verified" },
  { value: "missing", label: "IRN Missing" },
]
const FILING_OPTS: Opt[] = [
  { value: "all", label: "Any Filing Pattern" },
  ...(Object.keys(FILING_LABEL) as (keyof typeof FILING_LABEL)[]).map((k) => ({ value: k, label: FILING_LABEL[k] })),
]

const DEFAULT_FILTERS = { vendor: "all", amount: "all", age: "all", irn: "all", filing: "all" }
const SEVERITY: Record<string, number> = { chase: 0, watch: 1, safe: 2 }

function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Opt[]
  className?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => v && onChange(v as string)} items={options}>
      <SelectTrigger size="sm" aria-label={label} className={cn("min-w-0 bg-background/80 h-8 text-xs font-medium border-border/80", value !== "all" && "border-primary/60 text-primary bg-primary/5", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface Props {
  state: DashboardState
  onSelect: (id: string) => void
  onRun: () => void
  standalone?: boolean
}

export function InvoiceQueue({ state, onSelect, onRun, standalone }: Props) {
  const [tab, setTab] = useState<TabValue>("all")
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const setFilter = (k: keyof typeof DEFAULT_FILTERS) => (v: string) => setFilters((f) => ({ ...f, [k]: v }))
  const filtersActive = query !== "" || Object.values(filters).some((v) => v !== "all")

  const { phase, bucketOf, statuses } = state
  const routedAny = state.routed.size > 0

  const counts = useMemo(() => {
    const c = { all: INVOICES.length, safe: 0, watch: 0, chase: 0 }
    INVOICES.forEach((i) => {
      const b = bucketOf(i.id)
      if (b) c[b]++
    })
    return c
  }, [bucketOf])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = INVOICES.filter((inv) => {
      const v = VENDOR_BY_ID[inv.vendorId]
      const age = ageInDays(inv.invoiceDate)
      if (tab !== "all" && bucketOf(inv.id) !== tab) return false
      if (q && !`${inv.invoiceNo} ${v.name} ${v.gstin} ${v.city}`.toLowerCase().includes(q)) return false
      if (filters.vendor !== "all" && inv.vendorId !== filters.vendor) return false
      if (filters.amount === "lt200" && inv.itc >= 200) return false
      if (filters.amount === "200-350" && (inv.itc < 200 || inv.itc > 350)) return false
      if (filters.amount === "gt350" && inv.itc <= 350) return false
      if (filters.age === "lt30" && age >= 30) return false
      if (filters.age === "30-45" && (age < 30 || age > 45)) return false
      if (filters.age === "gt45" && age <= 45) return false
      if (filters.irn === "found" && !inv.irnFound) return false
      if (filters.irn === "missing" && inv.irnFound) return false
      if (filters.filing !== "all" && v.pattern !== filters.filing) return false
      return true
    })
    if (phase === "done") {
      return [...list].sort((a, b) => {
        const ra = statuses[a.id].status === "resolved" ? 1 : 0
        const rb = statuses[b.id].status === "resolved" ? 1 : 0
        if (ra !== rb) return ra - rb
        const sa = SEVERITY[ROUTING[a.id].bucket]
        const sb = SEVERITY[ROUTING[b.id].bucket]
        return sa !== sb ? sa - sb : b.itc - a.itc
      })
    }
    return [...list].sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate))
  }, [tab, query, filters, bucketOf, phase, statuses])

  const clearFilters = () => {
    setQuery("")
    setFilters(DEFAULT_FILTERS)
  }

  const bucketTabEmpty = tab !== "all" && !routedAny

  return (
    <section aria-labelledby="queue-heading" className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
      <header className="flex flex-col gap-3 border-b border-border/80 px-5 pt-4 bg-muted/20">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {standalone ? (
            <div>
              <h1 id="queue-heading" className="text-xl font-bold tracking-tight text-foreground">
                Audit Discrepancy Queue
              </h1>
              <p className="text-xs text-muted-foreground">
                Invoices recorded in buyer purchase register but not reflected in GSTR-2B.
              </p>
            </div>
          ) : (
            <div>
              <h2 id="queue-heading" className="text-sm font-bold text-foreground">
                Invoice Triage Queue
              </h2>
              <p className="text-xs text-muted-foreground">
                Prioritized action list with signal breakdown and estimated resolution horizon
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-foreground border border-border/60">
              Showing {rows.length} of {INVOICES.length}
            </span>
          </div>
        </div>

        {/* Category Tabs with Counts */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
          <TabsList variant="line" className="h-10 gap-4 overflow-x-auto">
            {(["all", "safe", "watch", "chase"] as TabValue[]).map((t) => (
              <TabsTrigger key={t} value={t} className="flex-none px-1 text-xs font-semibold data-[state=active]:text-primary">
                {t !== "all" && <span className={cn("size-2 rounded-full mr-1.5", BUCKET_STYLES[t].dot)} aria-hidden />}
                {t === "all" ? "All Invoices" : BUCKET_LABEL[t]}
                <span className="ml-1.5 rounded-full bg-muted/80 px-2 py-0.5 text-[10px] font-bold tabular-nums text-muted-foreground">
                  {t === "all" ? counts.all : routedAny ? counts[t] : "–"}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-2.5 border-b border-border/80 bg-muted/30 px-5 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search invoice, vendor, or GSTIN…"
            aria-label="Search invoices"
            className="h-8.5 bg-background pl-9 text-xs font-medium border-border/80"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex lg:flex-1 lg:flex-wrap lg:justify-end">
          <FilterSelect label="Vendor" value={filters.vendor} onChange={setFilter("vendor")} options={VENDOR_OPTS} className="lg:w-44" />
          <FilterSelect label="Amount" value={filters.amount} onChange={setFilter("amount")} options={AMOUNT_OPTS} className="lg:w-32" />
          <FilterSelect label="Age" value={filters.age} onChange={setFilter("age")} options={AGE_OPTS} className="lg:w-28" />
          <FilterSelect label="IRN Status" value={filters.irn} onChange={setFilter("irn")} options={IRN_OPTS} className="lg:w-32" />
          <FilterSelect label="Filing Pattern" value={filters.filing} onChange={setFilter("filing")} options={FILING_OPTS} className="lg:w-40" />
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs font-medium text-muted-foreground hover:text-foreground">
              <FilterX className="size-3.5 mr-1" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {bucketTabEmpty ? (
        <div className="flex flex-col items-center gap-3 px-4 py-16 text-center">
          <p className="text-sm font-bold text-foreground">Invoices Not Routed Yet</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Execute the pipeline routing engine above to categorize all 30 mismatches into explainable decision tiers.
          </p>
          <Button size="sm" onClick={onRun} disabled={phase === "matching" || phase === "routing"} className="mt-1 font-semibold">
            <Play className="size-3.5 mr-1.5 fill-current" />
            Run Pipeline Routing
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2.5 px-4 py-16 text-center">
          <SearchX className="size-6 text-muted-foreground/60" aria-hidden />
          <p className="text-sm font-semibold text-foreground">No matching invoices found</p>
          <p className="text-xs text-muted-foreground">Try adjusting your search terms or filter selections.</p>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 text-xs">
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table className="min-w-[1200px] text-xs">
            <TableHeader>
              <TableRow className="border-border/80 hover:bg-transparent bg-muted/15">
                <TableHead className="pl-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Invoice No</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Vendor Name</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Date</TableHead>
                <TableHead className="text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">ITC At Risk</TableHead>
                <TableHead className="text-right font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Age</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">IRN Check</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">AP Retention</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Filing Track</TableHead>
                <TableHead className="font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Triage Tier</TableHead>
                <TableHead className="pr-5 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">Resolution Horizon</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((inv) => {
                const v = VENDOR_BY_ID[inv.vendorId]
                const r = ROUTING[inv.id]
                const bucket = bucketOf(inv.id)
                const age = ageInDays(inv.invoiceDate)
                const st = statuses[inv.id]

                return (
                  <TableRow
                    key={inv.id}
                    tabIndex={0}
                    onClick={() => onSelect(inv.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        onSelect(inv.id)
                      }
                    }}
                    aria-label={`Open ${inv.invoiceNo} from ${v.name}`}
                    className={cn(
                      "group cursor-pointer transition-colors border-border/60 hover:bg-muted/40 focus-visible:bg-accent/40 focus-visible:outline-none",
                      st.status === "resolved" && "opacity-50"
                    )}
                  >
                    <TableCell className="pl-5 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                          {inv.invoiceNo}
                        </span>
                        <StatusChip status={st.status} />
                      </div>
                    </TableCell>

                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="max-w-56 truncate font-semibold text-foreground">{v.name}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{v.gstin}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 tabular-nums text-muted-foreground">
                      {formatDate(inv.invoiceDate)}
                    </TableCell>

                    <TableCell className="py-3 text-right font-bold tabular-nums text-foreground">
                      {formatINR(inv.itc)}
                    </TableCell>

                    <TableCell className={cn("py-3 text-right tabular-nums font-semibold", age > 45 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground")}>
                      {age}d
                    </TableCell>

                    <TableCell className="py-3">
                      <IrnBadge found={inv.irnFound} />
                    </TableCell>

                    <TableCell className="py-3">
                      <LeverageLabel leverage={r.leverage} />
                    </TableCell>

                    <TableCell className="py-3">
                      <FilingPatternLabel pattern={v.pattern} />
                    </TableCell>

                    <TableCell className="py-3">
                      <TriageBadge bucket={bucket} />
                    </TableCell>

                    <TableCell className="py-3 pr-5">
                      {bucket ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-14 overflow-hidden rounded-full bg-muted" aria-hidden>
                            <div className={cn("h-full rounded-full transition-all duration-300", BUCKET_STYLES[bucket].bar)} style={{ width: `${r.probability}%` }} />
                          </div>
                          <span className="font-bold tabular-nums text-foreground">{r.probability}%</span>
                          <span className="truncate text-[11px] text-muted-foreground max-w-[120px]">
                            {r.window.split(" · ")[1] ?? r.window}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Awaiting Routing</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
