"use client"

import { useState } from "react"
import {
  AlertTriangle,
  ArrowRight,
  BellOff,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSearch,
  Globe,
  Loader2,
  Phone,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  DEMO_TODAY,
  FILING_LABEL,
  INVOICES,
  ROUTING,
  VENDOR_BY_ID,
  ageInDays,
  formatDate,
  formatINR,
  type InvoiceState,
} from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { BUCKET_STYLES, FilingHistory, StatusChip, TriageBadge } from "./status-badges"

interface Props {
  invoiceId: string | null
  state: DashboardState
  onClose: () => void
  onUpdateStatus: (id: string, next: InvoiceState, message: string) => void
}

interface TinyFishResult {
  status: "verified" | "mismatch" | "unknown"
  sourceUrl: string
  retrievedAt: string
  taxpayerStatus: string
  filingFrequency: string
  einvoiceApplicable: boolean
  notes: string
}

function Signal({
  index,
  title,
  pass,
  result,
  detail,
  children,
}: {
  index: number
  title: string
  pass: boolean
  result: string
  detail: string
  children?: React.ReactNode
}) {
  return (
    <li className="flex gap-3 py-3.5">
      <span
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-xs",
          pass
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
            : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
        )}
      >
        {pass ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Signal {index} · {title}
          </span>
          <span
            className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-md",
              pass
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            )}
          >
            {result}
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
        {children}
      </div>
    </li>
  )
}

function snoozeDate() {
  const d = new Date(DEMO_TODAY)
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function InvoiceDetailSheet({ invoiceId, state, onClose, onUpdateStatus }: Props) {
  const inv = invoiceId ? INVOICES.find((i) => i.id === invoiceId) : null

  return (
    <Sheet open={!!inv} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full gap-0 p-0 sm:max-w-[500px] border-l border-border/80 bg-card shadow-2xl flex flex-col h-full"
      >
        {inv && <DetailBody inv={inv} state={state} onUpdateStatus={onUpdateStatus} />}
      </SheetContent>
    </Sheet>
  )
}

function DetailBody({
  inv,
  state,
  onUpdateStatus,
}: {
  inv: (typeof INVOICES)[number]
  state: DashboardState
  onUpdateStatus: Props["onUpdateStatus"]
}) {
  const v = VENDOR_BY_ID[inv.vendorId]
  const r = ROUTING[inv.id]
  const bucket = state.bucketOf(inv.id)
  const st = state.statuses[inv.id]
  const goodFiler = v.pattern === "quarterly" || v.pattern === "monthly"

  // TinyFish live evidence state simulation
  const [tinyFishLoading, setTinyFishLoading] = useState(false)
  const [tinyFishResult, setTinyFishResult] = useState<TinyFishResult | null>(null)

  const handleRunTinyFish = () => {
    setTinyFishLoading(true)
    setTimeout(() => {
      setTinyFishLoading(false)
      setTinyFishResult({
        status: inv.irnFound ? "verified" : "unknown",
        sourceUrl: `https://services.gst.gov.in/services/searchtpbypan?gstin=${v.gstin}`,
        retrievedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        taxpayerStatus: "Active Regular Taxpayer",
        filingFrequency: v.pattern === "quarterly" ? "QRMP Scheme" : "Monthly GSTR-1",
        einvoiceApplicable: inv.irnFound,
        notes: inv.irnFound
          ? "Supplier is registered for e-Invoicing. Public portal shows active GSTIN with valid legal trade name."
          : "Supplier record found on official GST portal. No e-invoicing mandatory threshold flag detected for this turnover tier.",
      })
    }, 1200)
  }

  return (
    <>
      <SheetHeader className="border-b border-border/80 bg-muted/20 px-6 py-4.5 pr-14">
        <div className="flex flex-wrap items-center gap-2">
          <TriageBadge bucket={bucket} />
          <StatusChip status={st.status} />
          {st.status === "snoozed" && st.snoozedUntil && (
            <span className="text-[11px] font-medium text-muted-foreground">
              snoozed until {formatDate(st.snoozedUntil)}
            </span>
          )}
        </div>
        <SheetTitle className="font-mono text-lg font-bold tracking-tight text-foreground mt-1">
          {inv.invoiceNo}
        </SheetTitle>
        <SheetDescription className="text-xs text-muted-foreground">
          {v.name} · {v.city} · <span className="font-mono font-medium text-foreground">{v.gstin}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {/* Core Metric Highlights */}
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 text-center">
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">ITC At Risk</span>
            <p className="mt-1 text-base font-bold text-foreground tabular-nums">{formatINR(inv.itc)}</p>
          </div>
          <div className="border-x border-border/60">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Invoice Date</span>
            <p className="mt-1 text-xs font-semibold text-foreground">{formatDate(inv.invoiceDate)}</p>
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Aging</span>
            <p className="mt-1 text-xs font-bold text-foreground tabular-nums">
              {ageInDays(inv.invoiceDate)} days
            </p>
          </div>
        </div>

        {/* Explainable Triage Decision Card */}
        {bucket ? (
          <div
            className={cn(
              "rounded-xl border p-4.5 shadow-xs transition-all",
              BUCKET_STYLES[bucket].soft,
              "border-border/60"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Triage Decision Logic
              </span>
              <span className="text-xs font-mono font-bold">{r.probability}% Confidence</span>
            </div>
            <p className={cn("mt-1.5 text-sm font-bold leading-snug", BUCKET_STYLES[bucket].text)}>
              {r.rule}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-foreground/85">{r.explanation}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/40 p-4 text-xs text-muted-foreground text-center">
            Invoice awaiting pipeline routing run. Signal indicators below are calculated and available.
          </div>
        )}

        {/* Three Explainable Signal Pipelines */}
        <section aria-labelledby="signals-heading">
          <h3 id="signals-heading" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            3-Signal Diagnostic Breakdown
          </h3>
          <ol className="mt-2 divide-y divide-border/60 rounded-xl border border-border/70 bg-card p-3 shadow-xs">
            <Signal
              index={1}
              title="IRN / e-Invoice Footprint"
              pass={inv.irnFound}
              result={inv.irnFound ? "IRN Verified" : "No IRN Record"}
              detail={
                inv.irnFound
                  ? "Matched in synthetic Invoice Registration Portal (IRP) extract. Invoice payload generated."
                  : "No IRN registered on IRP for this invoice number and vendor GSTIN."
              }
            >
              {inv.irnRef && (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-muted/60 px-2 py-1 font-mono text-[11px] text-muted-foreground">
                  <span>IRN:</span>
                  <span className="font-semibold text-foreground truncate max-w-[280px]">{inv.irnRef}</span>
                </div>
              )}
            </Signal>

            <Signal
              index={2}
              title="Accounts Payable Leverage"
              pass={inv.apOutstanding > 0}
              result={inv.apOutstanding > 0 ? `${formatINR(inv.apOutstanding)} Unpaid` : "Fully Paid"}
              detail={
                inv.apOutstanding > 0 && inv.apDueDate
                  ? `${r.leverage === "high" ? "High leverage hold" : "Partial leverage"}. Payment due on ${formatDate(
                      inv.apDueDate
                    )}.`
                  : "Buyer has zero outstanding payable balance. No payment hold available as leverage."
              }
            />

            <Signal
              index={3}
              title="Historical Filing Track Record"
              pass={goodFiler}
              result={FILING_LABEL[v.pattern]}
              detail="Supplier GSTR-1 compliance track record over the preceding 6 months."
            >
              <div className="mt-3">
                <FilingHistory history={v.history} showLabels />
              </div>
            </Signal>
          </ol>
        </section>

        {/* TinyFish Public Web Investigation Block (Hackathon Highlight) */}
        <section className="rounded-xl border border-primary/30 bg-gradient-to-b from-primary/5 via-card to-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Globe className="size-3.5" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground">TinyFish Live Evidence Brief</h4>
                <p className="text-[11px] text-muted-foreground">Independent live public web verification</p>
              </div>
            </div>

            {!tinyFishResult && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRunTinyFish}
                disabled={tinyFishLoading}
                className="h-8 border-primary/40 bg-primary/5 text-primary hover:bg-primary/10 text-xs font-semibold"
              >
                {tinyFishLoading ? (
                  <>
                    <Loader2 className="size-3 mr-1.5 animate-spin" />
                    Fetching Web…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3 mr-1.5 text-primary" />
                    Run Evidence Check
                  </>
                )}
              </Button>
            )}
          </div>

          {tinyFishResult && (
            <div className="mt-3.5 space-y-2.5 rounded-lg border border-border/70 bg-card p-3 text-xs fade-up">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-3.5" />
                  Public Verification Completed
                </span>
                <span className="text-[10px] text-muted-foreground">{tinyFishResult.retrievedAt}</span>
              </div>

              <div className="space-y-1 text-muted-foreground">
                <p>
                  <strong className="text-foreground">GST Status:</strong> {tinyFishResult.taxpayerStatus}
                </p>
                <p>
                  <strong className="text-foreground">Filing Frequency:</strong> {tinyFishResult.filingFrequency}
                </p>
                <p className="text-[11px] leading-relaxed pt-1 text-foreground/80">{tinyFishResult.notes}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                <a
                  href={tinyFishResult.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <ExternalLink className="size-3" />
                  Source: GST Portal Public Registry
                </a>
                <span className="text-[10px] text-muted-foreground">Source-linked</span>
              </div>
            </div>
          )}
        </section>

        {/* Expected Correction Window & Action */}
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase text-muted-foreground">
              <Clock className="size-3 text-primary" aria-hidden />
              Resolution Horizon
            </p>
            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{r.probability}%</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{r.window}</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-accent/40 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-accent-foreground">
              Recommended Next Action
            </p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-foreground/90">{r.nextAction}</p>
          </div>
        </section>
      </div>

      <SheetFooter className="flex-row flex-wrap gap-2 border-t border-border/80 bg-muted/40 px-6 py-4">
        {st.status === "resolved" ? (
          <Button
            variant="outline"
            className="flex-1 font-semibold"
            onClick={() => onUpdateStatus(inv.id, { status: "open" }, `${inv.invoiceNo} reopened`)}
          >
            <RotateCcw className="size-4 mr-2" />
            Reopen Invoice
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="flex-1 font-medium"
              disabled={st.status === "contacted"}
              onClick={() => onUpdateStatus(inv.id, { status: "contacted" }, `Marked ${v.name} as contacted`)}
            >
              <Phone className="size-4 mr-1.5" />
              {st.status === "contacted" ? "Contacted" : "Mark Contacted"}
            </Button>
            <Button
              variant="outline"
              className="flex-1 font-medium"
              disabled={st.status === "snoozed"}
              onClick={() => {
                const until = snoozeDate()
                onUpdateStatus(inv.id, { status: "snoozed", snoozedUntil: until }, `Snoozed until ${formatDate(until)}`)
              }}
            >
              <BellOff className="size-4 mr-1.5" />
              Snooze 30d
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              onClick={() => onUpdateStatus(inv.id, { status: "resolved" }, `${inv.invoiceNo} marked as resolved`)}
            >
              <CheckCircle2 className="size-4 mr-1.5" />
              Resolve
            </Button>
          </>
        )}
      </SheetFooter>
    </>
  )
}
