---
name: GST Credit-at-Risk Forecaster
description: Autonomous 3-Signal Action Triage Engine with Multi-Provider AI Tax Copilot
colors:
  primary: "#b794f6"
  primary-hover: "#9f6ff0"
  neutral-bg: "#170d24"
  neutral-surface: "#1e1230"
  neutral-card: "#23172f"
  neutral-card-hover: "#2c1d3a"
  border: "#3b2a4a"
  border-hover: "#5a4070"
  text-primary: "#f8fafc"
  text-heading: "#ffffff"
  text-muted: "#a89bc2"
  text-dim: "#7a6b90"
  safe: "#10b981"
  safe-light: "#34d399"
  watch: "#f59e0b"
  watch-light: "#fbbf24"
  chase: "#ef4444"
  chase-light: "#f87171"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.02em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.md}"
    padding: "11px 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.neutral-card}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

# Design System: GST Credit-at-Risk Forecaster

## Overview

**Creative North Star: "The High-Frequency Compliance Cockpit"**

The GST Credit-at-Risk Forecaster is a mission-critical, instrument-dense operational terminal for Indian enterprise finance teams. The interface delivers tactical clarity over millions of rupees in statutory tax exposure through an electric dark-canvas palette. It replaces the anxiety of month-end AP reconciliation with calm, surgical precision, presenting dense financial telemetry through a layered hierarchy of deep violets, obsidian card containers, and glowing lavender telemetry signals.

Every visual element exists to serve rapid, error-free operational decisions. Data density is balanced with purposeful luminance: background surfaces recede into deep nocturnal violets (`#170D24`), while actionable risk indicators (Safe, Watch, Chase) cut through the darkness with crisp semantic luminescence. Anti-reference: Bland, light-mode generic enterprise accounting tables with unstyled borders, and noisy, toy-like pastel dashboards lacking compliance gravitas.

**Key Characteristics:**
- **Deep Nocturnal Violet Foundation:** Multi-layered dark theme anchored by Midnight Violet and Obsidian Plum, reducing fatigue during intensive reconciliation marathons.
- **Electric Lavender Command Accent:** Radiant lavender-purple gradient accents signifying AI-driven autonomy, predictive triage, and executive controls.
- **Tri-Signal Semantic Luminescence:** Uncompromised status illumination using Emerald, Amber, and Crimson glows that map directly to the 3-signal operational buckets.
- **Surgical Identifier Precision:** High-contrast tabular layout with monospace rendering for statutory keys (GSTIN, IRN, HSN).

## Colors

The palette establishes an authoritative, high-contrast dark environment where functional status colors dominate visual attention over purely decorative hues.

### Primary Accent
- **Electric Lavender** (`#B794F6` / hover: `#9F6FF0`): Primary call-to-action triggers, AI copilot indicators, active tab markers, focus rings, and glowing interactive elements.

### Neutral & Surface
- **Midnight Violet** (`#170D24`): Main application canvas background, infused with soft radial gradient highlights.
- **Obsidian Plum Surface** (`#1E1230`): Modal drawers, slide-in inspectors, and elevated header bars.
- **Obsidian Card Container** (`#23172F` / hover: `#2C1D3A`): Base background for metric KPI cards, table surfaces, and filter panels.
- **Subtle Plum Border** (`#3B2A4A` / hover: `#5A4070`): Crisp 1px structural framing separating adjacent data regions.
- **Text Primary** (`#F8FAFC`): Primary data readouts, numerical values, and body text.
- **Text Heading** (`#FFFFFF`): Primary headers, titles, and active modal labels.
- **Text Muted** (`#A89BC2`): Secondary metadata, table column headers, and helper descriptors.
- **Text Dim** (`#7A6B90`): Placeholder copy, inactive toggles, and tertiary hints.

### Status & Triage Semantics
- **Sovereign Emerald (Safe to Hold)** (`#10B981` / light: `#34D399` / bg: `rgba(16, 185, 129, 0.12)` / border: `rgba(16, 185, 129, 0.3)`): Invoices protected by strong commercial AP retention leverage and verified e-invoice footprints.
- **Caution Amber (Watch)** (`#F59E0B` / light: `#FBBF24` / bg: `rgba(245, 158, 11, 0.12)` / border: `rgba(245, 158, 11, 0.3)`): Moderate tax risk invoices approaching statutory deadlines requiring monitored vendor follow-up.
- **Breach Crimson (Chase Now)** (`#EF4444` / light: `#F87171` / bg: `rgba(239, 68, 68, 0.12)` / border: `rgba(239, 68, 68, 0.3)`): Critical exposure invoices with zero AP leverage and broken filing periodicity requiring immediate CFO escalation.

### Named Rules
**The Signal Dominance Rule.** Semantic status colors (Emerald, Amber, Crimson) are strictly reserved for statutory compliance and risk classifications. They must never be repurposed for generic UI decoration or arbitrary button styles.

**The Lavender Restraint Rule.** Electric Lavender is the primary brand accent and is confined to ≤10% of any given viewport surface to preserve its high-priority visual punch.

## Typography

**Display Font:** Inter (with `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif` fallback)  
**Body Font:** Inter  
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` fallback)  

**Character:** Clean, objective sans-serif engineered for rapid horizontal scanning across dense financial grids, paired with strict fixed-width monospace for statutory alpha-numeric identifiers.

### Hierarchy
- **Display** (700 weight, 32px / 2rem, 1.2 line-height, -0.02em letter-spacing): Application header titles, hero metrics, and modal dialog titles.
- **Headline** (700 weight, 20px / 1.25rem, 1.3 line-height): KPI card aggregate numbers and section headers.
- **Title** (600 weight, 14px / 0.875rem, 1.4 line-height): Section sub-headings, filter section labels, and modal tab headers.
- **Body** (400 weight, 13px / 0.8125rem, 1.5 line-height): Primary table cells, narrative explanations, and AI copilot responses.
- **Label** (700 weight, 11px / 0.6875rem, 0.02em letter-spacing): Badges, table header column text (uppercase), and status indicators.
- **Code / Monospace** (500–700 weight, 11–12px): 15-character GSTINs, 64-character IRN hashes, invoice numbers, and HSN codes.

### Named Rules
**The Monospace Identifier Rule.** Any statutory tax identifier—GSTIN, 64-character IRN hash, HSN code, or invoice reference number—must always render in JetBrains Mono to prevent optical character confusion (such as 0 vs O or 1 vs I).

## Layout

The application employs a full-width, single-pane command center architecture designed for high-density 1080p and 1440p enterprise displays, scaling gracefully down to mobile:
- **Max Width Container:** Fluid layouts with max-width limits up to `1600px` for dense data tables, centered with `16px` to `24px` horizontal padding.
- **Rhythm & Spacing:** Strict 4px/8px modular grid scale (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`).
- **Header & Control Bar:** Persistent top navigation bar displaying live financial KPIs, filter controls, view toggles (Overview vs. Dashboard), and trigger buttons.
- **Split Drawer Architecture:** When inspecting an invoice or engaging the AI Copilot, a 620px slide-in drawer emerges from the right margin, maintaining full visibility of the underlying data table without page shifts.
- **Responsive Adaptability:** On viewports below 1024px, multi-column KPI grids collapse from 4-across to 2-across or single columns, and filter controls stack into a vertical filter sheet.

## Elevation & Depth

Surfaces are flat-at-rest with depth created through tonal dark-violet stratification, crisp border dividers, and subtle ambient glows.

### Shadow Vocabulary
- **KPI Resting** (`box-shadow: 0 4px 16px rgba(0, 0, 0, 0.20)`): Subtle separation for cards on top of the midnight violet base canvas.
- **KPI Hover** (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35)`): Slight elevation lift on interactive cards.
- **Primary Button Glow** (`box-shadow: 0 4px 16px rgba(183, 148, 246, 0.25)`): Subtle electric lavender halo surrounding primary actions.
- **Primary Button Hover** (`box-shadow: 0 6px 20px rgba(183, 148, 246, 0.40)`): Intensified glow accompanied by a `-1px` transform lift.
- **Slide-in Drawer** (`box-shadow: -16px 0 40px rgba(0, 0, 0, 0.60)`): Deep structural shadow establishing the inspector drawer above all table elements.
- **Status Glows** (`box-shadow: 0 0 10px rgba(color, 0.08)`): Diffuse halos highlighting active triage badges.

### Named Rules
**The Flat-By-Default Rule.** Surfaces rest flat with crisp 1px borders (`#3B2A4A`); drop shadows and radial glows appear strictly in response to interaction (hover, active focus) or critical risk states.

## Shapes

- **Base Radius:** `8px` (`0.5rem`) on buttons, cards, containers, modal dialogs, and text input fields.
- **Pill Badges:** `9999px` full-rounded pills for status badges, triage tags, and count chips.
- **Subtle Radius:** `6px` on inner nested chips and skeleton shimmer placeholders.
- **Borders:** Consistent `1px solid #3B2A4A` borders outlining containers, rising to `#5A4070` on hover and `rgba(183, 148, 246, 0.6)` on input focus.
- **Table Row Accent:** Active/hovered table rows receive a sharp `3px solid #B794F6` left indicator strip on the first cell.

## Components

### Buttons
- **Primary Action (`.gnani-btn-primary`):** Gradient fill `linear-gradient(135deg, #B794F6 0%, #9F6FF0 100%)`, dark text `#170D24`, font weight 700, 11px 22px padding, 8px radius. Hover: `-1px` vertical lift with amplified purple shadow. Active: `scale(0.98)`.
- **Secondary Action (`.gnani-btn-secondary`):** Obsidian card background `#23172F`, text `#F8FAFC`, border `1px solid #3B2A4A`, 10px 18px padding, 8px radius. Hover: `#2C1D3A` background, border `#5A4070`, `-1px` lift.

### Badges & Status Chips
- **Pill Badge (`.gnani-pill-badge`):** Full-rounded pill (`9999px`), `5px 12px` padding, 11px font size, bold uppercase. Includes animated pulsing dot (`.gnani-dot-pulse`).
- **Safe to Hold Badge (`.badge-safe`):** Background `rgba(16, 185, 129, 0.12)`, text `#34D399`, border `1px solid rgba(16, 185, 129, 0.3)`.
- **Watch Badge (`.badge-watch`):** Background `rgba(245, 158, 11, 0.12)`, text `#FBBF24`, border `1px solid rgba(245, 158, 11, 0.3)`.
- **Chase Now Badge (`.badge-chase`):** Background `rgba(239, 68, 68, 0.12)`, text `#F87171`, border `1px solid rgba(239, 68, 68, 0.3)`.

### Cards & Metric Panels
- **KPI Card (`.kpi-card`):** Background `#23172F`, border `1px solid #3B2A4A`, border-radius `8px`. Hover: `-2px` transform lift, border shifts to `rgba(183, 148, 246, 0.4)`.

### Inputs & Selects
- **Text Input & Dropdowns:** Background `#23172F`, text `#F8FAFC`, border `1px solid #3B2A4A`, placeholder `#7A6B90`. Focus: border shifts to `rgba(183, 148, 246, 0.6)`, with `0 0 0 3px rgba(183, 148, 246, 0.18)` glow ring.

### Inspector Drawers & Modals
- **Backdrop (`.modal-backdrop`):** Fixed full-screen overlay with `rgba(4, 7, 14, 0.78)` and `backdrop-filter: blur(6px)`.
- **Drawer (`.modal-content`):** Right-anchored slide-in panel (`max-width: 620px`), background `#1E1230`, border-left `1px solid #3B2A4A`, animated via `slideIn` cubic-bezier transition.

## Do's and Don'ts

### Do:
- **Do** format all GSTINs, IRN hashes, and monetary sums using `JetBrains Mono` with explicit spacing and thousands separators (₹).
- **Do** maintain the 3-tier status hierarchy: Safe to Hold (Emerald), Watch (Amber), and Chase Now (Crimson).
- **Do** apply `scale(0.98)` active states and `cubic-bezier(0.16, 1, 0.3, 1)` transitions on all interactive buttons.
- **Do** preserve the deep nocturnal violet canvas (`#170D24`) with subtle radial gradients for depth.
- **Do** accompany status colors with iconography and explicit text badges to meet WCAG AA accessibility standards.

### Don't:
- **Don't** introduce generic light-mode backgrounds or pure black (`#000000`) surfaces that disrupt the purple/navy tonal depth.
- **Don't** use saturated red, green, or amber for non-compliance decorations or general navigational elements.
- **Don't** use sharp 0px corners on interactive controls; adhere to the 8px component radius and 9999px badge pills.
- **Don't** obscure the primary data table behind blocking modal dialogues when an inspector drawer preserves operational context.
- **Don't** display uncalibrated or raw machine learning probability scores without the human-readable 0–100 calibrated routing score and corresponding operational action.
