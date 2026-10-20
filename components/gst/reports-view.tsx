"use client"

import { CheckCircle2, Download, FileSpreadsheet, FileText, Layers, Play, ShieldAlert, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { BUCKET_LABEL, FILING_LABEL, INVOICES, ROUTING, VENDOR_BY_ID, ageInDays, formatINR } from "@/lib/gst-data"
import type { DashboardState } from "./dashboard-shell"
import { TriageSummary } from "./triage-summary"

function downloadCsv(state: DashboardState) {
  const header = [
    "Invoice No",
    "Supplier Name",
    "GSTIN (Masked)",
    "Invoice Date",
    "ITC at Risk (INR)",
    "Aging (Days)",
    "IRN Status",
    "AP Balance (INR)",
    "Filing Scheme",
    "Triage Category",
    "Est Self-Correction %",
    "Audit Status",
  ]
  const lines = INVOICES.map((i) => {
    const v = VENDOR_BY_ID[i.vendorId]
    const r = ROUTING[i.id]
    return [
      i.invoiceNo,
      v.name,
      v.gstin,
      i.invoiceDate,
      i.itc,
      ageInDays(i.invoiceDate),
      i.irnFound ? "Verified" : "Missing",
      i.apOutstanding,
      FILING_LABEL[v.pattern],
      BUCKET_LABEL[r.bucket],
      r.probability,
      state.statuses[i.id].status,
    ]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      .join(",")
  })
  const blob = new Blob(
    [["# GST CREDIT-AT-RISK AUDIT EXPORT · Demo Workspace", header.join(","), ...lines].join("\n")],
    { type: "text/csv" }
  )
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `gst-credit-audit-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.success("Audit report exported successfully", {
    description: "30 invoice records with triage recommendations exported to CSV.",
  })
}

export function ReportsView({ state, onRun }: { state: DashboardState; onRun: () => void }) {
  const routed = state.phase === "done"
  const attention = INVOICES.filter((i) => ROUTING[i.id].bucket !== "safe")

  return (
    <div className="flex flex-col gap-6 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Audit & Advisory Reports</h1>
          <p className="text-xs text-muted-foreground">
            Monthly reconciliation export and triage summary for Chartered Accountants and finance leadership.
          </p>
        </div>
        <Button
          onClick={() => downloadCsv(state)}
          disabled={!routed}
          className="font-semibold shadow-xs"
        >
          <Download className="size-4 mr-2" />
          Export Audit Dossier (CSV)
        </Button>
      </div>

      {!routed ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/80 bg-card px-6 py-20 text-center shadow-sm">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <FileSpreadsheet className="size-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Report Not Available</h2>
          <p className="max-w-md text-xs text-muted-foreground">
            Execute pipeline routing first to generate the comprehensive risk report and actionable resolution recommendations.
          </p>
          <Button size="sm" onClick={onRun} disabled={state.phase !== "idle"} className="mt-2 font-semibold">
            <Play className="size-3.5 mr-1.5 fill-current" />
            Run Pipeline Routing
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <TriageSummary state={state} />

          <section className="rounded-2xl border border-border/80 bg-card shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
            <header className="border-b border-border/80 bg-muted/20 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground">High Priority Action Queue</h2>
                <p className="text-xs text-muted-foreground">
                  Invoices classified under Watch and Chase Now requiring follow-up before next GSTR-3B
                </p>
              </div>
              <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-xs font-bold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                {attention.length} Critical Items
              </span>
            </header>

            <ul className="divide-y divide-border/60 overflow-y-auto max-h-[500px]">
              {attention.map((i) => {
                const r = ROUTING[i.id]
                return (
                  <li
                    key={i.id}
                    className="flex flex-col gap-2 p-4 transition-colors hover:bg-muted/30 sm:flex-row sm:items-start sm:gap-5"
                  >
                    <div className="sm:w-60 sm:shrink-0">
                      <p className="font-mono text-xs font-bold text-foreground">{i.invoiceNo}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {VENDOR_BY_ID[i.vendorId].name}
                      </p>
                      <p className="text-[11px] font-bold text-primary tabular-nums mt-0.5">
                        {formatINR(i.itc)} ITC exposed
                      </p>
                    </div>

                    <div className="min-w-0 flex-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{r.rule}</span>
                      </div>
                      <p className="mt-1 text-muted-foreground leading-relaxed">{r.nextAction}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
