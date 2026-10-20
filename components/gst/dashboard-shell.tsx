"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"
import { AlertCircle, FileCheck, Info, Sparkles, X } from "lucide-react"
import { AppSidebar, type ViewId } from "./app-sidebar"
import { TopHeader } from "./top-header"
import { OverviewView } from "./overview-view"
import { InvoiceQueue } from "./invoice-queue"
import { InvoiceDetailSheet } from "./invoice-detail-sheet"
import { VendorsView } from "./vendors-view"
import { ImportsView } from "./imports-view"
import { ReportsView } from "./reports-view"
import { COMPANIES, INVOICES, PERIODS, ROUTING, type Bucket, type InvoiceState } from "@/lib/gst-data"

export type Phase = "idle" | "matching" | "routing" | "done"

const ROUTE_ORDER = [...INVOICES].sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate)).map((i) => i.id)
const MATCH_MS = 1400
const STEP_MS = 100

export interface DashboardState {
  phase: Phase
  routed: Set<string>
  currentId: string | null
  statuses: Record<string, InvoiceState>
  bucketOf: (id: string) => Bucket | null
}

function initialStatuses(): Record<string, InvoiceState> {
  return Object.fromEntries(INVOICES.map((i) => [i.id, { status: "open" as const }]))
}

export function DashboardShell() {
  const [view, setView] = useState<ViewId>("overview")
  const [phase, setPhase] = useState<Phase>("idle")
  const [routedIds, setRoutedIds] = useState<string[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [statuses, setStatuses] = useState(initialStatuses)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [company, setCompany] = useState(COMPANIES[0].id)
  const [period, setPeriod] = useState(PERIODS[0].value)
  const [lastRoutedAt, setLastRoutedAt] = useState<Date | null>(null)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [showPitchBanner, setShowPitchBanner] = useState(true)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const fileInput = useRef<HTMLInputElement>(null)

  const clearTimers = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const routed = useMemo(() => new Set(routedIds), [routedIds])
  const bucketOf = useCallback((id: string) => (routed.has(id) ? ROUTING[id].bucket : null), [routed])

  const resetRouting = useCallback(() => {
    clearTimers()
    setPhase("idle")
    setRoutedIds([])
    setCurrentId(null)
    setStatuses(initialStatuses())
    setLastRoutedAt(null)
  }, [])

  const runPipeline = useCallback(() => {
    clearTimers()
    setRoutedIds([])
    setCurrentId(null)
    setPhase("matching")
    setView((v) => (v === "overview" || v === "queue" ? v : "overview"))

    timers.current.push(
      setTimeout(() => {
        setPhase("routing")
        ROUTE_ORDER.forEach((id, i) => {
          timers.current.push(
            setTimeout(() => {
              setCurrentId(id)
              setRoutedIds((prev) => [...prev, id])
            }, i * STEP_MS),
          )
        })
        timers.current.push(
          setTimeout(
            () => {
              setPhase("done")
              setCurrentId(null)
              setLastRoutedAt(new Date())
              toast.success("Triage Complete", {
                description: "30 discrepancies triaged: 25 Safe to Hold, 4 Watch, 1 Chase Now.",
              })
            },
            ROUTE_ORDER.length * STEP_MS + 400,
          ),
        )
      }, MATCH_MS),
    )
  }, [])

  const updateStatus = useCallback((id: string, next: InvoiceState, message: string) => {
    let previous: InvoiceState | undefined
    setStatuses((s) => {
      previous = s[id]
      return { ...s, [id]: next }
    })
    toast(message, {
      action: {
        label: "Undo",
        onClick: () => previous && setStatuses((s) => ({ ...s, [id]: previous! })),
      },
    })
  }, [])

  const handleUpload = (file: File | undefined) => {
    if (!file) return
    resetRouting()
    const job = new Promise<void>((resolve) => setTimeout(resolve, 1200))
    toast.promise(job, {
      loading: `Ingesting ${file.name}…`,
      success: "Register parsed. 30 synthetic mismatches identified against GSTR-2B.",
      error: "Could not parse file",
    })
    if (fileInput.current) fileInput.current.value = ""
  }

  const openUpload = () => fileInput.current?.click()

  const state: DashboardState = { phase, routed, currentId, statuses, bucketOf }
  const companyName = COMPANIES.find((c) => c.id === company)?.name ?? ""

  return (
    <div className="tower tower-grid flex min-h-dvh bg-background text-foreground antialiased selection:bg-primary/20">
      <AppSidebar
        view={view}
        onNavigate={(v) => {
          setView(v)
          setMobileNavOpen(false)
        }}
        mobileOpen={mobileNavOpen}
        onMobileOpenChange={setMobileNavOpen}
        openCount={INVOICES.filter((i) => statuses[i.id].status !== "resolved").length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          company={company}
          onCompanyChange={(c) => {
            setCompany(c)
            resetRouting()
            toast(`Switched buyer workspace`, {
              description: `Viewing data for ${COMPANIES.find((x) => x.id === c)?.name}`,
            })
          }}
          period={period}
          onPeriodChange={(p) => {
            setPeriod(p)
            resetRouting()
          }}
          phase={phase}
          lastRoutedAt={lastRoutedAt}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />

        {/* Hackathon Pitch Alignment Strip */}
        {showPitchBanner && (
          <aside className="border-b border-primary/20 bg-primary/10 px-4 py-2 sm:px-6 lg:px-8 text-xs text-primary flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <Sparkles className="size-4 shrink-0 text-primary animate-pulse" />
              <span>
                <strong className="font-semibold text-foreground">Kritical Hacks Prototype:</strong> Decision engine turns GSTR-2B mismatches into an explainable action queue backed by IRN, AP context, and TinyFish live evidence.
              </span>
            </div>
            <button
              onClick={() => setShowPitchBanner(false)}
              className="p-1 rounded-md hover:bg-primary/20 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Dismiss banner"
            >
              <X className="size-3.5" />
            </button>
          </aside>
        )}

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-6">
            {view === "overview" && (
              <OverviewView
                state={state}
                companyName={companyName}
                onRun={runPipeline}
                onReset={resetRouting}
                onUpload={openUpload}
                onSelect={setSelectedId}
              />
            )}
            {view === "queue" && (
              <InvoiceQueue state={state} onSelect={setSelectedId} onRun={runPipeline} standalone />
            )}
            {view === "vendors" && <VendorsView state={state} />}
            {view === "imports" && <ImportsView onUpload={openUpload} />}
            {view === "reports" && <ReportsView state={state} onRun={runPipeline} />}

            <footer className="flex items-start gap-2 border-t border-border/60 pt-4 text-[11px] text-muted-foreground">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              <span>
                <strong className="font-semibold text-foreground">Hackathon Demonstration Model.</strong> Built in accordance with Kritical Hacks 2026 specifications. Financial metrics represent synthetic benchmark scenarios and are not intended as legal tax determination.
              </span>
            </footer>
          </div>
        </main>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept=".csv,.xlsx,.xls,.json"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleUpload(e.target.files?.[0])}
      />

      <InvoiceDetailSheet
        invoiceId={selectedId}
        state={state}
        onClose={() => setSelectedId(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  )
}
