"use client"

import { CheckCircle2, ChevronRight, Download, Filter, HelpCircle, Loader2, Play, RotateCcw, Sparkles, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { DashboardState } from "./dashboard-shell"
import { KpiCards } from "./kpi-cards"
import { PipelineBoard } from "./pipeline-board"
import { TriageSummary } from "./triage-summary"
import { InvoiceQueue } from "./invoice-queue"

interface Props {
  state: DashboardState
  companyName: string
  onRun: () => void
  onReset: () => void
  onUpload: () => void
  onSelect: (id: string) => void
}

export function OverviewView({ state, companyName, onRun, onReset, onUpload, onSelect }: Props) {
  const busy = state.phase === "matching" || state.phase === "routing"

  return (
    <div className="flex flex-col gap-6 fade-up">
      {/* Hero Control Banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-r from-card/95 via-card/80 to-accent/20 p-6 shadow-sm backdrop-blur-md">
        <div className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 size-48 rounded-full bg-safe/10 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3" />
                Explainable Multi-Signal Triage
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">·</span>
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {companyName}
              </span>
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              GST Credit-at-Risk Forecaster
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Turns 30 purchase register discrepancies into a clear, actionable triage:{" "}
              <strong className="text-foreground font-semibold">Safe to Hold</strong>,{" "}
              <strong className="text-foreground font-semibold">Watch</strong>, or{" "}
              <strong className="text-foreground font-semibold">Chase Now</strong> — backed by IRN verification, payment leverage, and filing patterns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {state.phase === "done" && (
              <Button
                variant="outline"
                size="default"
                onClick={onReset}
                className="h-10 border-border/80 bg-background/50 hover:bg-muted"
              >
                <RotateCcw className="size-4 mr-2" />
                Reset Pipeline
              </Button>
            )}

            <Button
              variant="outline"
              size="default"
              onClick={onUpload}
              disabled={busy}
              className="h-10 border-border/80 bg-background/50 hover:bg-muted font-medium"
            >
              <Upload className="size-4 mr-2" />
              Upload Register
            </Button>

            <Button
              size="default"
              onClick={onRun}
              disabled={busy}
              className="h-10 bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.01]"
            >
              {busy ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Routing Invoices…
                </>
              ) : (
                <>
                  <Play className="size-4 mr-2 fill-current" />
                  {state.phase === "done" ? "Re-run Triage" : "Run Pipeline Routing"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick status bar inside banner */}
        <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>382 Matched in GSTR-2B</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500" />
            <span>30 Missing Invoices under Audit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-primary" />
            <span>TinyFish Public Web Agent Ready</span>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <KpiCards state={state} />

      {/* Interactive Signal Flow Diagram & Lanes */}
      <PipelineBoard state={state} onSelect={onSelect} onRun={onRun} />

      {/* Summary Analytics Breakdown */}
      <TriageSummary state={state} />

      {/* Actionable Table Queue */}
      <InvoiceQueue state={state} onSelect={onSelect} onRun={onRun} />
    </div>
  )
}
