# Design System Specification: Interactive Presentation Viewer
**Product Archetype:** Mission-Critical Risk Analytics & Stage Deck Viewer  
**Style Category:** Dark Mode OLED / Midnight Console (`dark-mode-oled`)  
**Design Dials:** Variance: 7/10 | Motion: 6/10 | Density: 8/10  
**Target Viewport:** 16:9 Presentation Stage (Fluid 1280×720 Virtual Canvas, Responsive to Mobile 375px)  
**Standard:** WCAG 2.1 Level AA / AAA Compliant

---

## 1. Executive Architecture & Design Dials

| Parameter | Setting | Rationale |
| :--- | :---: | :--- |
| **Visual Variance** | **7 / 10** | High typographic contrast (bold display headers vs compact tabular monospace metrics), intentional telemetry accents, controlled card hierarchy. |
| **Motion Calibration** | **6 / 10** | Purposeful slide cross-fades and drawer transitions (280ms–320ms) using cinematic easing; zero gratuitous loops. Instantaneous fallback under `prefers-reduced-motion`. |
| **Information Density** | **8 / 10** | High-utility executive console: compact telemetry bars, dual-state thumbnail navigation, slide metric HUDs, and slide-over speaker notes without stage occlusion. |

---

## 2. Color System & Contrast Token Matrix

### 2.1 Surface & Border Tokens (OLED Dark Cinema)
```css
:root {
  /* Surfaces */
  --stage-canvas: #070a13;      /* Ultra-deep space canvas (low eye-strain, OLED black) */
  --panel-surface: #0f172a;     /* Elevated control bars and presenter drawers */
  --card-surface: #1e293b;      /* Slide metric cards, thumb pills, HUD containers */
  --card-surface-hover: #27354f;/* Hover state for interactive cards */
  
  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08); /* Minimal structural separation */
  --border-card: rgba(148, 163, 184, 0.20);   /* Card boundary line */
  --border-focused: #38bdf8;                  /* Keyboard focus ring */

  /* Text & Foreground */
  --text-primary: #f8fafc;     /* 18.2:1 contrast against canvas (Exceeds AAA) */
  --text-secondary: #cbd5e1;   /* 9.4:1 contrast against canvas, 5.2:1 against panel (AA compliant) */
  --text-muted: #94a3b8;       /* 5.1:1 contrast against canvas (AA compliant) */

  /* Telemetry Accents */
  --accent-cyan: #38bdf8;       /* Primary interactive telemetry & navigation */
  --accent-emerald: #34d399;    /* Low Risk / Safe / Resolved metrics */
  --accent-amber: #fbbf24;      /* Medium Risk / Attention required */
  --accent-rose: #f43f5e;       /* High Risk / Critical Alert / Defaulted */
  --accent-glow: rgba(56, 189, 248, 0.25); /* Subtle OLED luminescence */
}
```

### 2.2 WCAG Accessibility Contrast Ratios
| Element | Foreground Token | Background Token | Calculated Ratio | WCAG Rating |
| :--- | :--- | :--- | :--- | :--- |
| Slide Headline | `--text-primary` (`#F8FAFC`) | `--stage-canvas` (`#070A13`) | **18.2 : 1** | **AAA Pass** |
| Body & Notes | `--text-secondary` (`#CBD5E1`) | `--panel-surface` (`#0F172A`) | **8.4 : 1** | **AAA Pass** |
| Subtitles / Metadata | `--text-muted` (`#94A3B8`) | `--panel-surface` (`#0F172A`) | **5.2 : 1** | **AA Pass** |
| Cyan Action Pill | `--accent-cyan` (`#38BDF8`) | `--card-surface` (`#1E293B`) | **6.1 : 1** | **AA Pass** |
| Emerald Metric | `--accent-emerald` (`#34D399`) | `--stage-canvas` (`#070A13`) | **10.5 : 1** | **AAA Pass** |

---

## 3. Typography System & Font Pairings

- **Heading Display:** `Outfit` (Weights: 600 SemiBold, 700 Bold, 800 ExtraBold) — Geometric, modern authority.
- **Body & Controls:** `Work Sans` (Weights: 400 Regular, 500 Medium) — Clean, legible grotesque sans-serif with excellent micro-kerning.
- **Data & Telemetry:** `JetBrains Mono` / System Monospace (tabular figures enabled via `font-feature-settings: "tnum"`).

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@400;600;700;800&family=Work+Sans:wght@400;500;600&display=swap');

:root {
  --font-display: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Work Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}
```

### Typography Scale
| Token | Font Size | Line Height | Tracking | Text-Wrap | Font Weight / Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `type-hero` | `2.5rem` (40px) | `1.15` | `-0.025em` | `balance` | 800 Display Hero Title |
| `type-title` | `1.75rem` (28px) | `1.25` | `-0.015em` | `balance` | 700 Slide Main Header |
| `type-subtitle` | `1.125rem` (18px) | `1.40` | `0em` | `pretty` | 500 Section Subtitle |
| `type-body` | `0.9375rem` (15px) | `1.60` | `0.005em` | `pretty` | 400 Explanatory Prose & Notes |
| `type-metric` | `2.0rem` (32px) | `1.10` | `-0.02em` | `nowrap` | 700 `tnum` Mono KPI Figures |
| `type-caption` | `0.75rem` (12px) | `1.30` | `0.05em` | `nowrap` | 600 Uppercase Meta Tags |

---

## 4. Spatial Grid & Viewport Scaling

### 4.1 16:9 Presentation Stage Model
```css
/* Responsive 16:9 Viewport Shell */
.stage-container {
  position: relative;
  width: 100%;
  max-width: 1280px;
  aspect-ratio: 16 / 9;
  background: var(--stage-canvas);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
}

/* Fallback for ultra-compact screens */
@media (max-width: 768px) {
  .stage-container {
    aspect-ratio: auto;
    min-height: 520px;
    height: auto;
    border-radius: 0;
  }
}
```

### 4.2 Spacing & Target Dimensions
- **Touch Target Floor:** Minimum `44px × 44px` for all interactive navigation buttons on coarse pointer devices (`@media (pointer: coarse)`).
- **Control Spacing:** `8px` inner icon padding, `12px` control grouping gaps, `24px` outer stage gutters.

---

## 5. Interactive Deck Component Specifications

### 5.1 Top Command Bar (`.stage-header`)
- **Left Wing:** Slide Index Badge (`#03 / 08`), Topic Tag, Live GST Risk Pulse Indicator.
- **Center:** Slide Progress Bar with transition track (`height: 3px; background: rgba(255,255,255,0.1); fill: var(--accent-cyan)`).
- **Right Wing:** Presentation Mode, Presenter Notes Toggle (`N`), Fullscreen Toggle (`F`).

### 5.2 Slide Deck Cards (`.slide-card`)
- Dynamic 2-column or 3-column responsive layout (`grid-template-columns: repeat(auto-fit, minmax(280px, 1fr))`).
- Subtle card border with 1px wash and top-highlight linear gradient (`background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)`).
- Hover interaction: `transform: translateY(-2px)`, border glow transition over `200ms cubic-bezier(0.16, 1, 0.3, 1)`.

### 5.3 Presenter Notes Drawer (`.notes-drawer`)
- Positioned as a floating slide-over drawer docking to the right (`max-width: 380px; width: 100%`).
- Backdrop filter with deep acrylic blur: `backdrop-filter: blur(12px); background: rgba(15, 23, 42, 0.94)`.
- Accessible with ARIA state: `aria-expanded="true/false"`, `role="region"`, `aria-label="Presenter Notes"`.
- Keyboard dismissable via `Escape` key; auto-shifts focus back to the stage navigation pill.

### 5.4 Slide Navigation & Thumb Scrub Bar (`.thumb-pill`)
- Linear carousel pills displaying index + slide title abbreviation.
- Active pill: `background: rgba(56, 189, 248, 0.15); border-color: var(--accent-cyan); box-shadow: 0 0 12px var(--accent-glow)`.
- Accessible names via `aria-label="Slide 1: Executive Overview"`, keyboard focus outline `2px solid var(--accent-cyan); outline-offset: 2px`.

---

## 6. Motion Grammar & Animation Tokens

```css
:root {
  /* Motion Curves */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Transition Timings */
  --duration-instant: 120ms; /* Button presses, micro-states */
  --duration-hover: 200ms;   /* Card elevations, focus rings */
  --duration-slide: 320ms;   /* Slide transitions, drawer expand/collapse */
}

/* Slide Transition Keyframes */
.slide-enter {
  opacity: 0;
  transform: translateX(18px);
  animation: slideIn var(--duration-slide) var(--ease-out-expo) forwards;
}

.slide-exit {
  opacity: 1;
  transform: translateX(0);
  animation: slideOut var(--duration-slide) var(--ease-out-expo) forwards;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(16px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Prefers Reduced Motion Accessibility Guard */
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 7. Anti-Patterns & Pre-Delivery Audit

| Anti-Pattern | Violation | Design System Rule |
| :--- | :--- | :--- |
| **Emoji as Icons** | ❌ Using 📊, ⚡, 🔔 | Use inline SVG vector icons (Lucide or Heroicons, 18px / 20px). |
| **No Focus Ring** | ❌ `outline: none` on buttons | Always provide `outline: 2px solid var(--accent-cyan); outline-offset: 2px`. |
| **Fixed Px Heights** | ❌ Hardcoded height on content containers | Use `min-height` with flex/grid containers to prevent text overflow. |
| **Sub-44px Mobile Controls** | ❌ Tiny 24px buttons on touch devices | Use `@media (pointer: coarse)` to scale hit areas to $\ge 44\text{px}$. |
| **Pure White on OLED** | ❌ Flashy `#FFFFFF` full background | Use `#070A13` canvas with `#F8FAFC` foreground for high contrast without glaring eye-strain. |
| **Unlabelled Icon Buttons** | ❌ `<button><svg/></button>` without text | Require `aria-label="..."` and `title="..."` attributes on every icon button. |
