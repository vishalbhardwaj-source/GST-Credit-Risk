import { cn } from "@/lib/utils"
import {
  BUCKET_LABEL,
  FILING_LABEL,
  FILING_MONTHS,
  type ApLeverage,
  type Bucket,
  type FilingMark,
  type FilingPattern,
  type InvoiceStatus,
} from "@/lib/gst-data"

export const BUCKET_STYLES: Record<Bucket, { dot: string; badge: string; bar: string; text: string; soft: string }> = {
  safe: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20 border-emerald-500/20",
    bar: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
    soft: "bg-emerald-500/5",
  },
  watch: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20 border-amber-500/20",
    bar: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
    soft: "bg-amber-500/5",
  },
  chase: {
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20 border-rose-500/20",
    bar: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
    soft: "bg-rose-500/5",
  },
}

const pill = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap shadow-2xs"

export function TriageBadge({ bucket, className }: { bucket: Bucket | null; className?: string }) {
  if (!bucket) {
    return (
      <span className={cn(pill, "bg-muted/80 text-muted-foreground ring-border/60", className)}>
        <span className="size-1.5 rounded-full bg-muted-foreground/50" aria-hidden />
        Untriaged
      </span>
    )
  }
  const s = BUCKET_STYLES[bucket]
  return (
    <span className={cn(pill, s.badge, className)}>
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {BUCKET_LABEL[bucket]}
    </span>
  )
}

export function IrnBadge({ found }: { found: boolean }) {
  return found ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <span className="size-1 rounded-full bg-emerald-500" />
      Verified
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
      <span className="size-1 rounded-full bg-rose-500" />
      Missing
    </span>
  )
}

const LEVERAGE_LABEL: Record<ApLeverage, string> = { high: "High Hold", medium: "Partial", none: "None (Paid)" }

export function LeverageLabel({ leverage }: { leverage: ApLeverage }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
      <span className="flex gap-0.5" aria-hidden>
        {[0, 1].map((i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-1 rounded-xs transition-colors",
              (leverage === "high" && i < 2) || (leverage === "medium" && i === 0)
                ? "bg-primary"
                : "bg-muted-foreground/20"
            )}
          />
        ))}
      </span>
      <span
        className={cn(
          leverage === "high"
            ? "text-primary"
            : leverage === "medium"
            ? "text-foreground"
            : "text-muted-foreground"
        )}
      >
        {LEVERAGE_LABEL[leverage]}
      </span>
    </span>
  )
}

export function FilingPatternLabel({ pattern }: { pattern: FilingPattern }) {
  const tone =
    pattern === "erratic"
      ? "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20"
      : pattern === "late"
      ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-foreground bg-muted/60 border-border/60"
  return (
    <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap", tone)}>
      {FILING_LABEL[pattern]}
    </span>
  )
}

const MARK_STYLE: Record<FilingMark, string> = {
  "on-time": "bg-emerald-500",
  late: "bg-amber-500",
  missed: "bg-rose-500",
  "not-due": "bg-muted-foreground/25",
}
const MARK_LABEL: Record<FilingMark, string> = {
  "on-time": "Filed on time",
  late: "Filed late",
  missed: "Not filed",
  "not-due": "Not due (quarterly)",
}

export function FilingHistory({ history, showLabels = false }: { history: FilingMark[]; showLabels?: boolean }) {
  return (
    <ol className="flex items-end gap-1.5" aria-label="GSTR-1 filing history, last six months">
      {history.map((m, i) => (
        <li key={FILING_MONTHS[i]} className="flex flex-col items-center gap-1">
          <span
            className={cn("block h-3.5 w-4.5 rounded-xs transition-transform hover:scale-110", MARK_STYLE[m])}
            title={`${FILING_MONTHS[i]}: ${MARK_LABEL[m]}`}
          />
          <span className={cn("text-[10px] font-medium text-muted-foreground", !showLabels && "sr-only")}>
            {FILING_MONTHS[i]}
            <span className="sr-only">: {MARK_LABEL[m]}</span>
          </span>
        </li>
      ))}
    </ol>
  )
}

const STATUS_STYLE: Record<Exclude<InvoiceStatus, "open">, string> = {
  contacted: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30",
  snoozed: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30",
}

export function StatusChip({ status }: { status: InvoiceStatus }) {
  if (status === "open") return null
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-2xs",
        STATUS_STYLE[status]
      )}
    >
      {status}
    </span>
  )
}

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 shadow-2xs",
        className
      )}
    >
      <span className="size-1 rounded-full bg-amber-500 animate-pulse" />
      Demo Data
    </span>
  )
}
