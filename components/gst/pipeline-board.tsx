"use client"

import { AnimatePresence, LayoutGroup, MotionConfig, motion } from "motion/react"
import { ArrowRight, CalendarClock, Check, Eye, FileCheck2, FileSearch, Inbox, Info, Play, ShieldAlert, Sparkles, Wallet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  BUCKET_LABEL,
  FILING_LABEL,
  INVOICES,
  ROUTING,
  VENDOR_BY_ID,
  formatINR,
  type Bucket,
  type Invoice,
} from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { BUCKET_STYLES, TriageBadge } from "./status-badges"

const BUCKETS: Bucket[] = ["safe", "watch", "chase"]
const LANE_Y = [16, 50, 84]

const BUCKET_STROKE: Record<Bucket, string> = {
  safe: "stroke-emerald-500",
  watch: "stroke-amber-500",
  chase: "stroke-rose-500",
}

const BUCKET_HINT: Record<Bucket, string> = {
  safe: "Likely to self-correct in subsequent GSTR-1",
  watch: "Conflicting signals — monitor or hold AP",
  chase: "Act immediately or prepare for ITC reversal",
}

const FLOW_WORD: Record<Bucket, string> = {
  safe: "Safe to Hold",
  watch: "Watch",
  chase: "Chase Now",
}

type SignalKey = "irn" | "ap" | "filing"
const SIGNALS: { key: SignalKey; label: string; hint: string; icon: typeof Wallet }[] = [
  { key: "irn", label: "IRN / e-Invoice Status", hint: "Registration verified on IRP", icon: FileCheck2 },
  { key: "ap", label: "Accounts Payable Leverage", hint: "Unpaid buyer invoice balance", icon: Wallet },
  { key: "filing", label: "Historical Filing Track", hint: "Supplier GSTR-1 consistency", icon: CalendarClock },
]

function readSignals(inv: Invoice): Record<SignalKey, { value: string; pass: boolean }> {
  const vendor = VENDOR_BY_ID[inv.vendorId]
  return {
    irn: { value: inv.irnFound ? "IRN Found" : "No IRN", pass: inv.irnFound },
    ap: {
      value: inv.apOutstanding > 0 ? `${formatINR(inv.apOutstanding)} Unpaid` : "Fully Paid",
      pass: inv.apOutstanding > 0,
    },
    filing: {
      value: FILING_LABEL[vendor.pattern],
      pass: vendor.pattern === "quarterly" || vendor.pattern === "monthly",
    },
  }
}

function Chip({
  inv,
  bucket,
  active,
  onSelect,
}: {
  inv: Invoice
  bucket: Bucket | null
  active: boolean
  onSelect: (id: string) => void
}) {
  const s = bucket ? BUCKET_STYLES[bucket] : null
  return (
    <motion.button
      layoutId={inv.id}
      layout
      type="button"
      onClick={() => onSelect(inv.id)}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      title={`${inv.invoiceNo} · ${VENDOR_BY_ID[inv.vendorId].name}`}
      aria-label={`${inv.invoiceNo}, ${formatINR(inv.itc)}${bucket ? `, ${BUCKET_LABEL[bucket]}` : ", untriaged"}`}
      className={cn(
        "rounded-md border px-2 py-1 font-mono text-[11px] font-semibold tabular-nums leading-none transition-all focus-visible:outline-2 focus-visible:outline-ring cursor-pointer hover:scale-105 active:scale-95 shadow-2xs",
        s
          ? cn(s.soft, "border-border/60 hover:border-border", s.text)
          : "border-border/70 bg-card text-muted-foreground hover:text-foreground hover:bg-muted",
        active && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {formatINR(inv.itc)}
    </motion.button>
  )
}

function RadarRings({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden", className)} aria-hidden>
      {[88, 64, 40].map((pct) => (
        <span
          key={pct}
          className="absolute aspect-square rounded-full border border-foreground/[0.04]"
          style={{ width: `${pct}%` }}
        />
      ))}
      <span className="absolute h-px w-full bg-foreground/[0.03]" />
      <span className="absolute h-full w-px bg-foreground/[0.03]" />
    </div>
  )
}

function Connector({ from, to, active, activeLane, tone }: { from: "one" | "three"; to: "one" | "three"; active: boolean; activeLane?: number; tone?: Bucket }) {
  const paths: { d: string; lane: number }[] = []
  if (from === "one" && to === "three") {
    LANE_Y.forEach((y, lane) => paths.push({ d: `M0 50 C50 50, 50 ${y}, 100 ${y}`, lane }))
  } else {
    LANE_Y.forEach((y, lane) => paths.push({ d: `M0 ${y} C50 ${y}, 50 50, 100 50`, lane }))
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" aria-hidden>
      {paths.map(({ d, lane }) => {
        const highlighted = active && (activeLane === undefined || activeLane === lane)
        return (
          <path
            key={d}
            d={d}
            fill="none"
            vectorEffect="non-scaling-stroke"
            strokeWidth={highlighted ? 2 : 1}
            className={cn(
              "transition-colors duration-150",
              highlighted ? cn(tone ? BUCKET_STROKE[tone] : "stroke-primary", "signal-flow") : "stroke-border/60"
            )}
          />
        )
      })}
    </svg>
  )
}

function SignalNode({
  signal,
  reading,
  routing,
}: {
  signal: (typeof SIGNALS)[number]
  reading?: { value: string; pass: boolean }
  routing: boolean
}) {
  const Icon = signal.icon
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col justify-center gap-1.5 rounded-xl border border-border/80 bg-card/90 px-3.5 py-2.5 shadow-2xs transition-all",
        routing && "border-primary/50 shadow-sm shadow-primary/10"
      )}
    >
      <span className="flex items-center gap-2 text-xs font-bold text-foreground">
        <Icon className="size-4 shrink-0 text-primary" aria-hidden />
        <span className="truncate">{signal.label}</span>
      </span>
      <AnimatePresence mode="wait" initial={false}>
        {reading ? (
          <motion.span
            key={reading.value}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex min-w-0 items-center gap-2 text-xs"
          >
            <span
              className={cn(
                "flex size-4.5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold shadow-2xs",
                reading.pass
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
              )}
            >
              {reading.pass ? <Check className="size-3" aria-hidden /> : <X className="size-3" aria-hidden />}
            </span>
            <span className="truncate font-semibold text-foreground">{reading.value}</span>
          </motion.span>
        ) : (
          <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate text-[11px] text-muted-foreground">
            {signal.hint}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function DecisionNode({ bucket, live }: { bucket: Bucket | null; live: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
      <span className="relative flex size-12 items-center justify-center rounded-full border border-border/80 bg-card shadow-md">
        <span className="absolute inset-1 rounded-full border border-dashed border-border" />
        {live && <span className="absolute inset-0 animate-ping rounded-full border border-primary/40 [animation-duration:1.2s]" />}
        <span
          className={cn(
            "relative size-3 rounded-full transition-colors duration-150 shadow-xs",
            bucket ? BUCKET_STYLES[bucket].dot : "bg-muted-foreground/40"
          )}
        />
      </span>
    </div>
  )
}

function BucketLane({
  bucket,
  items,
  currentId,
  phase,
  onSelect,
}: {
  bucket: Bucket
  items: Invoice[]
  currentId: string | null
  phase: DashboardState["phase"]
  onSelect: (id: string) => void
}) {
  const s = BUCKET_STYLES[bucket]
  const amount = items.reduce((sum, i) => sum + i.itc, 0)
  return (
    <div className="relative flex min-h-24 min-w-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xs">
      <span className={cn("absolute inset-y-0 left-0 w-1.5", s.bar)} aria-hidden />
      <div className="flex items-center justify-between gap-2 py-2 pl-4 pr-3.5 border-b border-border/40">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="whitespace-nowrap text-xs font-bold">{BUCKET_LABEL[bucket]}</span>
          <span className="hidden truncate text-[11px] text-muted-foreground sm:inline">{BUCKET_HINT[bucket]}</span>
        </span>
        <span className="whitespace-nowrap text-[11px] tabular-nums text-muted-foreground">
          <motion.span key={items.length} initial={{ opacity: 0.3 }} animate={{ opacity: 1 }} className={cn("text-xs font-bold", s.text)}>
            {items.length} items
          </motion.span>
          {amount > 0 && <span className="font-semibold text-foreground"> · {formatINR(amount)}</span>}
        </span>
      </div>
      <div className="flex flex-1 flex-wrap content-start gap-1.5 px-4 py-2.5">
        {items.map((inv) => (
          <Chip key={inv.id} inv={inv} bucket={bucket} active={inv.id === currentId} onSelect={onSelect} />
        ))}
        {items.length === 0 && (
          <span className="text-[11px] text-muted-foreground italic">
            {phase === "idle" ? "Awaiting routing trigger" : "Awaiting matches…"}
          </span>
        )}
      </div>
    </div>
  )
}

export function PipelineBoard({
  state,
  onSelect,
  onRun,
}: {
  state: DashboardState
  onSelect: (id: string) => void
  onRun: () => void
}) {
  const { phase, routed, currentId, bucketOf } = state
  const untriaged = INVOICES.filter((i) => !routed.has(i.id))
  const current = currentId ? INVOICES.find((i) => i.id === currentId) : null
  const currentRoute = current ? ROUTING[current.id] : null
  const currentVendor = current ? VENDOR_BY_ID[current.vendorId] : null
  const readings = current ? readSignals(current) : null
  const routing = phase === "routing" && !!current
  const byBucket = Object.fromEntries(BUCKETS.map((b) => [b, INVOICES.filter((i) => bucketOf(i.id) === b)])) as Record<
    Bucket,
    Invoice[]
  >
  const activeBucket = currentRoute?.bucket

  return (
    <article className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-sm" aria-labelledby="routing-heading">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-3.5 bg-muted/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <h2 id="routing-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Live Signal Routing Engine
            </h2>
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-bold tabular-nums tracking-tight text-foreground" aria-live="polite">
            <span>{INVOICES.length} Discrepancies</span>
            <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
            {BUCKETS.map((b, i) => (
              <span key={b} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-muted-foreground/60" aria-hidden>·</span>}
                <span className={cn(phase === "idle" ? "text-muted-foreground" : BUCKET_STYLES[b].text, "font-bold")}>
                  {phase === "idle" ? "–" : byBucket[b].length} {FLOW_WORD[b]}
                </span>
              </span>
            ))}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-muted/80 px-2.5 py-1 font-mono text-xs font-semibold tabular-nums text-foreground border border-border/60">
            {routed.size}/{INVOICES.length} Routed
          </span>
          {phase === "idle" && (
            <Button size="sm" onClick={onRun} className="h-8 font-semibold shadow-xs">
              <Play className="size-3.5 mr-1.5 fill-current" />
              Start Routing
            </Button>
          )}
        </div>
      </header>

      <MotionConfig reducedMotion="user">
        <LayoutGroup>
          <div className="grid gap-4 p-4 lg:h-[460px] lg:grid-cols-[minmax(0,1fr)_44px_210px_68px_minmax(0,1.4fr)] lg:gap-0">
            {/* Input Lane: Unmatched Register Lines */}
            <div className="relative flex min-h-44 flex-col overflow-hidden rounded-xl border border-border/80 bg-muted/30">
              <RadarRings />
              <div className="relative flex items-center justify-between gap-2 border-b border-border/50 px-3.5 py-2 bg-muted/40">
                <span className="text-xs font-bold text-foreground">Inbound Flags</span>
                <span className="text-[11px] tabular-nums text-muted-foreground">
                  <span className="font-bold text-foreground">{untriaged.length}</span> missing from 2B
                </span>
              </div>
              <div className="relative flex flex-1 flex-wrap content-start gap-1.5 p-3">
                {phase === "matching" && (
                  <div className="absolute inset-0 z-10 flex flex-col justify-center gap-2.5 bg-card/95 p-4 backdrop-blur-xs">
                    <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <FileSearch className="size-4 text-primary animate-pulse" aria-hidden />
                      Reconciling purchase register against GSTR-2B…
                    </span>
                    <Progress value={null} className="h-1.5" aria-label="Matching in progress" />
                    <span className="text-[11px] leading-snug text-muted-foreground">
                      412 register records parsed · 382 matched · 30 flags routed to diagnostic engine
                    </span>
                  </div>
                )}
                {untriaged.map((inv) => (
                  <Chip key={inv.id} inv={inv} bucket={null} active={false} onSelect={onSelect} />
                ))}
                {untriaged.length === 0 && (
                  <div className="flex size-full flex-col items-center justify-center gap-1.5 py-10 text-center text-xs text-muted-foreground">
                    <Inbox className="size-5 text-muted-foreground/60" aria-hidden />
                    <span className="font-semibold text-foreground">All Invoices Triaged</span>
                    <span className="text-[11px]">Inspect any invoice tile in the right lanes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Connecting Svg Line 1 */}
            <div className="relative hidden lg:block">
              <Connector from="one" to="three" active={routing} />
            </div>

            {/* Middle: 3 Signals Nodes */}
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3 lg:grid-cols-1 lg:grid-rows-3">
              {SIGNALS.map((sig) => (
                <SignalNode key={sig.key} signal={sig} reading={readings?.[sig.key]} routing={routing} />
              ))}
            </div>

            {/* Connecting Svg Line 2 & Decision Node */}
            <div className="relative hidden lg:flex">
              <div className="relative flex-1">
                <Connector from="three" to="one" active={routing} />
              </div>
              <div className="relative flex-1">
                <Connector
                  from="one"
                  to="three"
                  active={routing}
                  activeLane={activeBucket ? BUCKETS.indexOf(activeBucket) : undefined}
                  tone={activeBucket}
                />
              </div>
              <DecisionNode bucket={activeBucket ?? null} live={routing} />
            </div>

            {/* Output: 3 Decision Category Lanes */}
            <div className="grid grid-cols-1 gap-2.5 lg:grid-rows-3">
              {BUCKETS.map((b) => (
                <BucketLane key={b} bucket={b} items={byBucket[b]} currentId={currentId} phase={phase} onSelect={onSelect} />
              ))}
            </div>
          </div>
        </LayoutGroup>
      </MotionConfig>

      {/* Footer Diagnostic Output */}
      <footer className="min-h-[56px] border-t border-border/80 bg-muted/20 px-5 py-3" aria-live="polite">
        <AnimatePresence mode="wait">
          {current && currentRoute && currentVendor ? (
            <motion.div
              key={current.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08 }}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-foreground">{current.invoiceNo}</span>
                <span className="text-muted-foreground">·</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">{currentVendor.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-muted-foreground">{currentRoute.rule}</span>
                <TriageBadge bucket={currentRoute.bucket} />
              </div>
            </motion.div>
          ) : phase === "done" ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between text-xs text-muted-foreground">
              <p>
                <strong className="font-bold text-foreground">Routing Complete:</strong> 30 mismatches classified with evidence-backed next actions. Click any invoice pill to open full diagnostic sheet.
              </p>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                100% Signal Coverage
              </span>
            </motion.div>
          ) : phase === "matching" ? (
            <motion.p key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-medium text-muted-foreground">
              Reconciling purchase register against GSTR-2B database…
            </motion.p>
          ) : (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <p>
                <strong className="font-semibold text-foreground">30 Invoices Missing from GSTR-2B.</strong> Evaluates IRN presence, accounts payable retention leverage, and supplier compliance history to triage exposure.
              </p>
              <span className="text-[11px] font-medium text-primary">Ready to execute</span>
            </motion.div>
          )}
        </AnimatePresence>
      </footer>
    </article>
  )
}
