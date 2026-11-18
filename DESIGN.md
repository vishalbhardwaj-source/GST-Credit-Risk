---
name: GST Credit-at-Risk Forecaster
description: Neutral Carbon & Titanium Architecture for Autonomous 3-Signal Indirect Tax Reconciliation
colors:
  primary: "#f4f4f6"
  primary-hover: "#ffffff"
  primary-text: "#090a0c"
  neutral-bg: "#090a0c"
  neutral-surface: "#111215"
  neutral-card: "#181a1f"
  neutral-card-hover: "#202228"
  border: "#26282f"
  border-hover: "#383a43"
  text-primary: "#ffffff"
  text-heading: "#ffffff"
  text-muted: "#9497a1"
  text-dim: "#636773"
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
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
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
    textColor: "{colors.primary-text}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
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

**Creative North Star: "Neutral Carbon & Titanium Precision Terminal"**

The GST Credit-at-Risk Forecaster embraces an austere, sophisticated neutral monochrome and titanium slate aesthetic. By stripping away saturated colored tints (purples, bright blues, and golds), the interface achieves timeless Swiss operational discipline: Pure Obsidian Carbon foundations (`#090A0C`), Dark Zinc surfaces (`#111215`, `#181A1F`), crisp neutral silver hairline dividers (`#26282F`), and surgical high-contrast typography (`#FFFFFF`, `#E4E5E8`).

Color is reserved strictly for operational telemetry: functional status luminescences (Safe to Hold, Watch, Chase Now) stand out with absolute clarity against the silent, distraction-free neutral slate canvas. Anti-reference: Saturated neon themes, arbitrary pastel accents, and noisy multi-colored decorations that distract from high-stakes statutory compliance decisions.

**Key Characteristics:**
- **Monochrome Carbon & Zinc Foundation:** Restrained dark canvas (`#090A0C`, `#111215`, `#181A1F`), eliminating visual fatigue during intensive month-end reconciliation cycles.
- **Titanium White Command Accent:** High-contrast neutral white interactive controls (`#F4F4F6` with `#090A0C` typography) ensuring prominent, unmistakable action affordances.
- **Subtle Silver Architectural Hairlines:** Clean 1px structural framing (`#26282F`, hover: `#383A43`) providing disciplined spatial hierarchy without visual clutter.
- **Surgical Semantic Luminescence:** Status illumination (Emerald, Amber, Crimson) used only where risk triage is conveyed.
- **Tabular Monospace Precision:** Pristine tabular monospace (`JetBrains Mono`) for financial figures, 15-character GSTINs, and 64-character IRN hashes.

## Colors

The palette establishes an authoritative, high-contrast neutral environment where chromatic hue is deployed exclusively for semantic meaning.

### Primary Accents & Neutral Foreground
- **Titanium White (Primary Action)** (`#F4F4F6` / hover: `#FFFFFF` / text: `#090A0C`): Primary triggers, buttons, and prominent active controls.
- **Neutral Silver (Secondary Accent)** (`#CBD0D8` / hover: `#FFFFFF`): Subtle active badges, focus indicators, and interactive links.

### Neutral Surfaces
- **Obsidian Carbon Canvas** (`#090A0C`): Main application canvas background without distracting colored gradients.
- **Dark Zinc Panel** (`#111215`): Elevated header bars, modal backdrops, and navigation panels.
- **Graphite Slate Card** (`#181A1F` / hover: `#202228`): Container backgrounds for KPI metric panels, table rows, and filters.
- **Silver-Slate Border** (`#26282F` / hover: `#383A43`): Structural framing.
- **Text Heading** (`#FFFFFF`): Primary headers, titles, and modal captions.
- **Text Primary** (`#E4E5E8`): Primary data readouts, numerical figures, and body copy.
- **Text Muted** (`#9497A1`): Table column headers, helper notes, and secondary metadata.
- **Text Dim** (`#636773`): Placeholder copy, inactive states, and tertiary hints.

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
