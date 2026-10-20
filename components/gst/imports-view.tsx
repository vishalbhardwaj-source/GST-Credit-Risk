"use client"

import { CheckCircle2, Clock, FileJson, FileSpreadsheet, HardDrive, ShieldCheck, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"

const HISTORY = [
  { icon: FileSpreadsheet, name: "purchase_register_sep26_demo.csv", kind: "Purchase Register", rows: "412 lines", when: "15 Oct 2026, 10:42", size: "48 KB" },
  { icon: FileJson, name: "gstr2b_sep26_demo.json", kind: "GSTR-2B Statement (GSTN)", rows: "382 invoices", when: "14 Oct 2026, 18:05", size: "124 KB" },
  { icon: FileSpreadsheet, name: "ap_ageing_sep26_demo.xlsx", kind: "AP Ageing Ledger", rows: "64 suppliers", when: "14 Oct 2026, 18:02", size: "32 KB" },
  { icon: FileJson, name: "einvoice_extract_demo.json", kind: "IRP e-Invoice Registry", rows: "355 IRNs", when: "14 Oct 2026, 17:58", size: "96 KB" },
]

export function ImportsView({ onUpload }: { onUpload: () => void }) {
  return (
    <div className="flex flex-col gap-6 fade-up">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Data Ingestion & Source Files</h1>
        <p className="text-xs text-muted-foreground">
          Import buyer ERP purchase registers, monthly GSTR-2B auto-drafted returns, and supplier AP ageing ledgers.
        </p>
      </div>

      {/* Upload Drag & Drop Area */}
      <button
        type="button"
        onClick={onUpload}
        className="group flex flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-border/80 bg-card/60 p-10 text-center transition-all hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring cursor-pointer shadow-xs"
      >
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
          <UploadCloud className="size-6" aria-hidden />
        </div>
        <span className="text-sm font-bold text-foreground">Upload Purchase Register or GSTR-2B</span>
        <span className="max-w-sm text-xs text-muted-foreground leading-relaxed">
          Accepts .csv, .xlsx, or .json formats. Files are processed locally in demo sandbox with synthetic anonymization.
        </span>
        <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/60 px-3 py-1 text-[11px] font-semibold text-muted-foreground">
          <HardDrive className="size-3" />
          Click to Browse Files
        </span>
      </button>

      {/* Ingestion Audit Trail */}
      <section className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
        <header className="flex items-center justify-between border-b border-border/80 bg-muted/20 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">Reconciliation Source Feeds</h2>
            <p className="text-xs text-muted-foreground">Synchronized data snapshots for current filing period</p>
          </div>
          <Button variant="outline" size="sm" onClick={onUpload} className="h-8 text-xs font-semibold">
            Add Source File
          </Button>
        </header>

        <ul className="divide-y divide-border/60">
          {HISTORY.map((h) => (
            <li key={h.name} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-muted-foreground border border-border/60">
                <h.icon className="size-4.5" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-bold text-foreground">{h.name}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {h.kind} · <span className="font-semibold text-foreground/80">{h.rows}</span> · {h.size}
                </p>
              </div>

              <span className="text-xs tabular-nums text-muted-foreground">{h.when}</span>

              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="size-3" />
                Validated
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
