export type Bucket = "safe" | "watch" | "chase"
export type FilingPattern = "quarterly" | "monthly" | "late" | "erratic"
export type FilingMark = "on-time" | "late" | "missed" | "not-due"
export type InvoiceStatus = "open" | "contacted" | "snoozed" | "resolved"
export type ApLeverage = "high" | "medium" | "none"

export interface Vendor {
  id: string
  name: string
  city: string
  gstin: string
  pattern: FilingPattern
  history: FilingMark[]
}

export interface Invoice {
  id: string
  invoiceNo: string
  vendorId: string
  invoiceDate: string
  itc: number
  irnFound: boolean
  irnRef: string | null
  apOutstanding: number
  apDueDate: string | null
}

export interface InvoiceState {
  status: InvoiceStatus
  snoozedUntil?: string
}

export interface RoutingResult {
  bucket: Bucket
  probability: number
  window: string
  rule: string
  explanation: string
  nextAction: string
  leverage: ApLeverage
}

export const DEMO_TODAY = new Date("2026-10-19T09:00:00+05:30")

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
export function formatINR(n: number) {
  return inr.format(n)
}

const dateFmt = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Kolkata" })
export function formatDate(iso: string) {
  return dateFmt.format(new Date(`${iso}T00:00:00+05:30`))
}

export const FILING_MONTHS = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"]

export const FILING_LABEL: Record<FilingPattern, string> = {
  quarterly: "Quarterly (QRMP)",
  monthly: "Monthly, on time",
  late: "Habitually late",
  erratic: "Erratic",
}

export const BUCKET_LABEL: Record<Bucket, string> = {
  safe: "Safe to Hold",
  watch: "Watch",
  chase: "Chase Now",
}

const Q: FilingMark[] = ["not-due", "not-due", "on-time", "not-due", "not-due", "on-time"]
const M: FilingMark[] = ["on-time", "on-time", "on-time", "on-time", "on-time", "on-time"]

export const VENDORS: Vendor[] = [
  { id: "v01", name: "Shree Ganesh Packaging Works", city: "Pune", gstin: "27AAKFS••••1Z3", pattern: "quarterly", history: Q },
  { id: "v02", name: "Kaveri Steel Traders", city: "Bengaluru", gstin: "29AADCK••••1Z8", pattern: "monthly", history: M },
  { id: "v03", name: "Annapurna Agro Supplies", city: "Indore", gstin: "23ABHPA••••1ZK", pattern: "quarterly", history: Q },
  { id: "v04", name: "Sahyadri Logistics LLP", city: "Nashik", gstin: "27AAQFS••••1Z1", pattern: "monthly", history: M },
  { id: "v05", name: "Vardhman Polymers", city: "Ahmedabad", gstin: "24AAJFV••••1Z6", pattern: "quarterly", history: Q },
  { id: "v06", name: "Lakshmi Electricals", city: "Chennai", gstin: "33ACMPL••••1ZQ", pattern: "monthly", history: ["on-time", "on-time", "late", "on-time", "on-time", "on-time"] },
  { id: "v07", name: "Narmada Office Stationers", city: "Vadodara", gstin: "24AAGFN••••1Z2", pattern: "late", history: ["late", "late", "on-time", "late", "late", "late"] },
  { id: "v08", name: "Bharat Fasteners Co.", city: "Ludhiana", gstin: "03AABFB••••1Z9", pattern: "quarterly", history: Q },
  { id: "v09", name: "Deccan Print House", city: "Hyderabad", gstin: "36AAEFD••••1Z4", pattern: "monthly", history: M },
  { id: "v10", name: "Ganga Chemicals Pvt Ltd", city: "Kanpur", gstin: "09AACCG••••1Z7", pattern: "late", history: ["late", "on-time", "late", "late", "late", "late"] },
  { id: "v11", name: "Konark Engineering Services", city: "Bhubaneswar", gstin: "21AAHFK••••1Z5", pattern: "quarterly", history: Q },
  { id: "v12", name: "Malabar Spice Exports", city: "Kochi", gstin: "32AAMFM••••1ZD", pattern: "erratic", history: ["on-time", "missed", "late", "missed", "on-time", "late"] },
  { id: "v13", name: "Rajdhani Tech Solutions", city: "New Delhi", gstin: "07AAPCR••••1ZT", pattern: "erratic", history: ["late", "missed", "missed", "late", "on-time", "missed"] },
  { id: "v14", name: "Pioneer Courier Services", city: "Mumbai", gstin: "27AAJCP••••1ZM", pattern: "erratic", history: ["missed", "late", "missed", "missed", "late", "missed"] },
]

const VENDOR_PREFIX: Record<string, string> = {
  v01: "SGP", v02: "KST", v03: "AAS", v04: "SLL", v05: "VPL", v06: "LEL", v07: "NOS",
  v08: "BFC", v09: "DPH", v10: "GCP", v11: "KES", v12: "MSE", v13: "RTS", v14: "PCS",
}

type Seed = [vendorId: string, num: number, date: string, itc: number, irn: boolean, apOutstanding: number]

const SEEDS: Seed[] = [
  ["v01", 412, "2026-09-04", 420, true, 18400],
  ["v02", 1187, "2026-09-11", 180, true, 9600],
  ["v03", 76, "2026-08-22", 365, true, 12500],
  ["v04", 2304, "2026-09-18", 240, true, 0],
  ["v05", 519, "2026-09-02", 310, true, 7200],
  ["v06", 893, "2026-09-25", 155, true, 4100],
  ["v07", 128, "2026-08-29", 290, true, 6800],
  ["v08", 334, "2026-09-07", 405, true, 21300],
  ["v09", 1452, "2026-09-14", 210, true, 3900],
  ["v11", 61, "2026-08-27", 330, true, 15800],
  ["v02", 1203, "2026-09-21", 125, true, 9600],
  ["v01", 418, "2026-09-16", 260, true, 18400],
  ["v10", 707, "2026-09-09", 385, true, 11200],
  ["v04", 2331, "2026-09-26", 195, true, 5400],
  ["v03", 81, "2026-09-12", 300, true, 12500],
  ["v09", 1471, "2026-09-23", 220, true, 0],
  ["v08", 341, "2026-09-19", 340, true, 21300],
  ["v06", 902, "2026-09-28", 170, true, 4100],
  ["v11", 66, "2026-09-15", 280, true, 15800],
  ["v05", 527, "2026-09-20", 230, true, 7200],
  ["v07", 133, "2026-09-17", 315, true, 6800],
  ["v02", 1219, "2026-09-29", 145, true, 9600],
  ["v01", 425, "2026-09-27", 250, true, 18400],
  ["v03", 88, "2026-09-24", 270, true, 0],
  ["v08", 352, "2026-09-30", 460, true, 21300],
  ["v12", 2219, "2026-08-18", 1120, true, 0],
  ["v10", 714, "2026-08-25", 860, false, 11200],
  ["v05", 531, "2026-09-10", 690, false, 7200],
  ["v13", 3908, "2026-09-05", 480, false, 2600],
  ["v14", 5561, "2026-08-14", 2400, false, 0],
]

function pseudoHash(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const hex = (h >>> 0).toString(16).padStart(8, "0")
  const tail = ((h * 7919) >>> 0).toString(16).padStart(8, "0").slice(0, 4)
  return `${hex.slice(0, 4)}…${tail}`
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00+05:30`)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const INVOICES: Invoice[] = SEEDS.map(([vendorId, num, date, itc, irn, ap], i) => {
  const invoiceNo = `${VENDOR_PREFIX[vendorId]}/26-27/${String(num).padStart(4, "0")}`
  return {
    id: `inv-${String(i + 1).padStart(2, "0")}`,
    invoiceNo,
    vendorId,
    invoiceDate: date,
    itc,
    irnFound: irn,
    irnRef: irn ? pseudoHash(invoiceNo) : null,
    apOutstanding: ap,
    apDueDate: ap > 0 ? addDays(date, 45) : null,
  }
})

export const VENDOR_BY_ID = Object.fromEntries(VENDORS.map((v) => [v.id, v])) as Record<string, Vendor>

export function ageInDays(iso: string) {
  const d = new Date(`${iso}T00:00:00+05:30`)
  return Math.floor((DEMO_TODAY.getTime() - d.getTime()) / 86_400_000)
}

export function apLeverage(inv: Invoice): ApLeverage {
  if (inv.apOutstanding <= 0) return "none"
  return inv.apOutstanding >= inv.itc * 20 ? "high" : "medium"
}

const FILING_PHRASE: Record<FilingPattern, string> = {
  quarterly: "habitual quarterly filer",
  monthly: "on-time monthly filer",
  late: "habitually late filer",
  erratic: "erratic filer",
}

const WINDOW: Record<FilingPattern, string> = {
  quarterly: "Next IFF / GSTR-1 · by 13 Nov 2026",
  monthly: "Next GSTR-1 · by 11 Nov 2026",
  late: "Late GSTR-1 · around 25 Nov 2026",
  erratic: "No reliable window",
}

export function routeInvoice(inv: Invoice): RoutingResult {
  const vendor = VENDOR_BY_ID[inv.vendorId]
  const leverage = apLeverage(inv)
  const goodFiler = vendor.pattern === "quarterly" || vendor.pattern === "monthly"
  const signals = [inv.irnFound, leverage !== "none", goodFiler].filter(Boolean).length

  let bucket: Bucket
  if (signals === 3 || (signals === 2 && inv.irnFound)) bucket = "safe"
  else if (signals === 0) bucket = "chase"
  else bucket = "watch"

  const probability = Math.min(
    96,
    15 +
      (inv.irnFound ? 35 : 0) +
      (leverage === "high" ? 20 : leverage === "medium" ? 12 : 0) +
      ({ quarterly: 28, monthly: 30, late: 12, erratic: 0 } as const)[vendor.pattern],
  )

  const rule = `${inv.irnFound ? "IRN found" : "No IRN"} + ${
    leverage === "none" ? "AP fully paid" : "unpaid AP"
  } + ${FILING_PHRASE[vendor.pattern]} → ${BUCKET_LABEL[bucket]}`

  const irnSentence = inv.irnFound
    ? "The invoice was registered on the IRP, so it exists and will flow to GSTR-1 once the vendor files."
    : "No e-invoice IRN was matched, so there is no independent proof the vendor will report this invoice."
  const apSentence =
    leverage === "none"
      ? "You have already paid this vendor in full, so there is no payment to hold back as leverage."
      : `You still owe ${formatINR(inv.apOutstanding)}, which gives you leverage to hold payment until the credit appears.`
  const filingSentence = {
    quarterly: "The vendor files quarterly, so gaps in monthly 2B usually close on their own.",
    monthly: "The vendor has filed GSTR-1 on time for six straight months.",
    late: "The vendor usually files late but does eventually file.",
    erratic: "The vendor has missed or delayed several recent filings.",
  }[vendor.pattern]

  const nextAction = {
    safe:
      leverage === "none"
        ? "No outreach needed. Re-check in the next 2B cycle."
        : "Hold the pending payment until the invoice appears in GSTR-2B. No outreach needed.",
    watch: inv.irnFound
      ? "Send a polite reminder before the vendor's next GSTR-1 due date and re-check in 14 days."
      : "Ask the vendor for the IRN / e-invoice copy and hold the pending payment until it is reported.",
    chase:
      "Call the vendor today, request the GSTR-1 filing or amendment, and plan to reverse this ITC if it is not reported by the next return.",
  }[bucket]

  return {
    bucket,
    probability,
    window: WINDOW[vendor.pattern],
    rule,
    explanation: `${irnSentence} ${apSentence} ${filingSentence}`,
    nextAction,
    leverage,
  }
}

export const ROUTING: Record<string, RoutingResult> = Object.fromEntries(
  INVOICES.map((inv) => [inv.id, routeInvoice(inv)]),
)

export const COMPANIES = [
  { id: "c1", name: "Anand Auto Components Pvt Ltd", gstin: "27AACCA••••1ZP" },
  { id: "c2", name: "Saraswati Textiles LLP", gstin: "24AAKFS••••1Z0" },
  { id: "c3", name: "Nilgiri Foods & Beverages", gstin: "33AAFCN••••1ZR" },
]

export const PERIODS = [
  { value: "2026-09", label: "Sep 2026 · GSTR-2B" },
  { value: "2026-08", label: "Aug 2026 · GSTR-2B" },
  { value: "2026-07", label: "Jul 2026 · GSTR-2B" },
]
