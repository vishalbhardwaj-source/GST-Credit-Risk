---
target: vite-app/src/App.tsx
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\visha\\Downloads\\GST-credit\\vite-app\\src\\App.tsx"
target_fingerprint: "sha256:f50794b22a7bbd617242e6720ab88269800c2841deae6271df7085ddec08f33c"
target_path: "C:\\Users\\visha\\Downloads\\GST-credit\\vite-app\\src\\App.tsx"
timestamp: 2026-11-03T11-26-36Z
slug: vite-app-src-app-tsx
closed: true
---
Method: dual-agent (A: ac7a7c48-51ff-4cc5-b2c5-365137bf5c1e · B: e7d78533-9582-44e0-8954-bc845973b806)

#### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 3/4 | Live connection pulse and routing skeletons work well; lacks export confirmation toast |
| 2 | Match System / Real World | 4/4 | Flawless Indian GST terminology (Sec 16(2)(aa), Rule 37A Nov 30 cutoff, Rule 48(4) IRN, ₹ formatting) |
| 3 | User Control and Freedom | 3/4 | Filter reset available; Detail panel claims (Esc) dismiss but lacks keyboard listener |
| 4 | Consistency and Standards | 2/4 | Color system drift; AiChatDrawer introduces 5 conflicting palettes violating Signal Dominance |
| 5 | Error Prevention | 3/4 | Bucket filters disabled pre-routing; Reset Demo lacks destructive action confirmation |
| 6 | Recognition Rather Than Recall | 3/4 | Monospace formatting for tax keys; table score numbers lack calculation breakdown tooltips |
| 7 | Flexibility and Efficiency | 2/4 | Zero keyboard navigation for table rows (arrow keys, Enter/Space); no bulk batch actions |
| 8 | Aesthetic and Minimalist Design | 2/4 | Atmospheric Electric Lavender palette, but cluttered above-the-fold with 4 stacked briefing panels |
| 9 | Error Recovery | 3/4 | Seamless fallback to standalone demo mode when backend API is offline; actionable empty states |
| 10 | Help and Documentation | 3/4 | Rich inline statutory citations; lacks centralized keyboard shortcut guide or scoring rubric modal |
| **Total** | | **28/40** | **Good (Solid Foundation, Refinement Needed)** |

#### Design Specificity Verdict

**LLM Assessment:** Deeply grounded and non-interchangeable. The composition, 3-signal triage model (Safe to Hold, Watch, Chase Now), AP commercial retention leverage calculations, 4-state IRN footprints, and filing periodicity are uniquely tailored to Indian corporate tax compliance under the CGST Act and Rule 37A. It solves a real enterprise dilemma rather than offering generic accounting templates.

**Deterministic Scan:** The automated scanner flagged 4 issues across 2 files:
- `side-tab` (2 warnings): Left 3px accent border on hover in `index.css:349` (`.invoice-table-row:hover td:first-child`) and in `InvoiceDetailPanel.tsx:1069`.
- `overused-font` (1 warning): Standard `Inter` font stack in `index.css:49`.
- `gradient-text` (1 warning): Multi-stop text gradient in `index.css:164` on the overview hero headline.

**Visual Overlays:** Deterministic scan verified in code; no live browser overlay injected into active view.

#### Overall Impression
The interface succeeds as an authoritative, instrument-dense compliance cockpit. It replaces reconciliation anxiety with crisp operational clarity. However, it is front-loaded with vertical briefing clutter and lacks keyboard accessibility and strict token adherence.

#### What's Working
1. **Action-Oriented Triage Over Raw Mismatches:** Transforms a raw 30-invoice discrepancy list into three clear operational postures (Safe to Hold, Watch, Chase Now), preserving vendor trust while safeguarding cash.
2. **Statutory & Legal Fidelity:** Precise adherence to CGST statutory rules, Rule 37A deadlines, Section 50(1) interest mechanics, and e-invoicing thresholds.
3. **Multi-Layered Explainability:** Transparent score breakdowns combining additive formula weights, LightGBM tree models, and TreeSHAP attribution.

#### Priority Issues
- **[P1] Missing Keyboard Accessibility & Non-Standard Modal Semantics**
  - *Why it matters:* Keyboard-only and assistive technology users cannot navigate, inspect, or dismiss invoices. The detail drawer promises `(Esc)` in its title but has no event listener.
  - *Fix:* Add `tabIndex={0}`, `role="button"`, and `onKeyDown` handlers to table rows; add `Escape` key listener, `role="dialog"`, and focus trapping to modals and drawers.
  - *Suggested command:* `/impeccable harden`

- **[P1] Accidental Data Loss Risk on "Reset Demo"**
  - *Why it matters:* Clicking "Reset Demo" immediately wipes custom uploaded enterprise ledgers without confirmation.
  - *Fix:* Add an explicit confirmation dialog before wiping active custom datasets.
  - *Suggested command:* `/impeccable harden`

- **[P2] Above-the-Fold Vertical Clutter & Redundant Executive Briefings**
  - *Why it matters:* Four stacked orientation panels push the primary invoice table below the fold on standard displays.
  - *Fix:* Collapse the Situation Synopsis by default, streamline KPI cards into a single telemetry strip, and prioritize table visibility.
  - *Suggested command:* `/impeccable distill`

- **[P2] Color System Fragmentation & Semantic Violations in AiChatDrawer**
  - *Why it matters:* AiChatDrawer introduces 5 theme presets that violate the Signal Dominance Rule (Mint emerald confuses Safe to Hold). Stray hex codes bypass CSS design tokens.
  - *Fix:* Lock AiChatDrawer to Electric Lavender and replace inline hex codes with CSS variables (`var(--safe-color)`, `var(--navy-border)`).
  - *Suggested command:* `/impeccable polish`

- **[P3] Developer Failure-Simulation Checkbox Exposed in Production View**
  - *Why it matters:* In-drawer test checkboxes (`⚡ Simulate: Portal Captcha / HTTP 429 Timeout`) diminish enterprise credibility.
  - *Fix:* Move simulation controls to the ML Diagnostics modal or hide them behind a developer settings toggle.
  - *Suggested command:* `/impeccable clarify`

#### Persona Red Flags
- **Alex (Power User):** Cannot navigate rows with arrow keys (`↑`/`↓`), lacks bulk-select actions for batch exports or retention holds, and `Escape` key fails to dismiss drawers.
- **Jordan (First-Timer):** Overwhelmed by 7 competing header buttons with differing visual weights; confused by developer failure simulation checkboxes.
- **Sam (Accessibility User):** Table rows lack interactive role announcements; modal focus leaks into the background page; `--navy-dim` (`#7A6B90`) fails WCAG AA 4.5:1 contrast on dark navy.

#### Minor Observations
- Column header text triggers sort, but clicking empty space within the `<th>` cell does not.
- Filter search clear button (`X`) lacks an `aria-label`.
- "Test Any GSTIN" header button uses an un-tokenized sky-blue border (`#38bdf8`) competing with primary actions.

#### Questions to Consider
- What if the 3 triage buckets were top-level work queue tabs (starting on "Chase Now") rather than passive filter tags?
- Could a one-click "Generate Rule 37A Demand Notice" button in the Chase Now drawer automate supplier follow-up directly?
- What if the Situation Synopsis auto-minimized once routing is executed, immediately dedicating full viewport height to the data table?
