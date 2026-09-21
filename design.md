# Small Goods Gym — Brand Identity & UI Design System
**Document ID:** `SGG-SPEC-DESIGN-001`  
**Version:** `1.0.0`  
**Status:** `Canonical Brand & Design Specification`  
**Extracted From:** Live Webflow Production Stylesheets (`small-goods-gym.webflow.shared.css`) & Official Brand Assets  
**Target Applications:** React Native (Expo) Mobile App, Gym-Floor Logger, Coach Leverages Suite, Event RSVP System  

---

## 1. Aesthetic Philosophy: "Neo-Brutalist High Performance"

Small Goods Gym rejects generic, sterile, corporate fitness app aesthetics (e.g., Equinox, MyFitnessPal). The visual identity is **punchy, tactile, confident, and utilitarian**:

* **Heavy Black Borders:** High-contrast `border: 2px solid #000000;` anchors actionable components, inputs, and cards.
* **Hard-Edge "Sticker" Drop Shadows:** Unblurred, high-impact offset shadows (`box-shadow: 4px 4px 0 0 #000000;` on interactive items; `8px 8px 0 0 #000000;` on feature hero cards).
* **Vibrant Color Blocking:** Electric purples, acid greens, and pastel creams create unmistakable visual hierarchy under harsh gym-floor lighting.
* **Barbell-First Ergonomics:** Touch targets engineered for chalk-dusted, trembling hands following Fitts's Law ($64\times64\text{ dp}$ high-frequency buttons).

---

## 2. Official Logo & Sticker Asset

* **Canonical File:** [`images/small-goods-logo_sticker@2x-p-500.png`](./images/small-goods-logo_sticker@2x-p-500.png)
* **Form Factor:** Dynamic inverted triangle / shield with stylized upper crown teeth.
* **Sticker Effect:** 3px solid black border with a 45° black drop-shadow contour.
* **Signature Brand Gradient:**
  * **Top Right:** Warm Gold (`#FFB800` / `#FFA000`)
  * **Mid-Angle:** Fiery Coral Red (`#E95766` / `#FF4500`)
  * **Bottom Apex:** Electric Royal Purple (`#4724BA` / `#6A3CF4`)

```css
/* Authentic Small Goods Gradient */
background: linear-gradient(135deg, #ffb800 0%, #e95766 50%, #4724ba 100%);
```

---

## 3. The Official Color Palette (Exact Webflow Tokens)

```css
:root {
  /* --- BRAND CORE --- */
  --purple-heart:     #4724ba;   /* Signature Royal Purple (Primary Brand) */
  --electric-violet:  #6a3cf4;   /* Interactive High-Voltage Purple */
  --black:            #000000;   /* Pure Black (Borders, Drop Shadows, Dark Canvas) */
  --white:            #ffffff;   /* Pure White */

  /* --- HIGH-VOLTAGE ACCENTS --- */
  --inch-worm:        #9aef0f;   /* Acid / Neon Lime (Success, Completed Sets, Rest Done) */
  --golden-fizz:      #ecfd28;   /* High-Voltage Lemon Yellow (Active Highlights) */
  --sweet-corn:       #f8ef8d;   /* Pastel Butter Yellow (Tips, Callout Cards) */
  --mandy:            #e95766;   /* Coral Red / Pink (Alerts, Injury Triage, Cancellation) */
  --red-pen:          #cc0029;   /* High-Alert Crimson (Over-capacity, Severe Restrictions) */

  /* --- SURFACE & CARD TONES --- */
  --kidnapper:        #e7ebd3;   /* Pale Pistachio / Sage Cream (Neutral Light Surface) */
  --bon-jour:         #f6f4f6;   /* Crisp Off-White Card Surface */
  --champagne:        #faf2ce;   /* Warm Buttercream Surface */
  --edgewater:        #d1e6e4;   /* Soft Ice Mint (NDIS & Clinical Reports) */
  --ship-gray:        #48444e;   /* Neutral Charcoal (Muted Labels, Secondary Text) */
  --masala:           #3c3331;   /* Warm Espresso Dark */
  --frangipani:       #feddba;   /* Warm Peach (Contact / Intake Surfaces) */
  --green-pea:        #1a5250;   /* Deep Forest Athletic Teal (Physio / Clinical Gate) */
}
```

### Semantic Color Mapping for the App

| UI Element / Purpose | Color Token | Hex Code | Usage Rationale |
| :--- | :--- | :--- | :--- |
| **Primary Actions / Active Tabs** | `--electric-violet` | `#6A3CF4` | High contrast on dark gym-floor screens. |
| **Complete Set / Success State** | `--inch-worm` | `#9AEF0F` | Instant, unmistakable visual confirmation (sub-400ms Doherty threshold). |
| **Clinical Flags / Active Triage** | `--mandy` | `#E95766` | Holly Hunt's injury interceptor and acute restriction warnings. |
| **Coach Directives & Cues** | `--sweet-corn` | `#F8EF8D` | Friendly, readable coaching cards for stance & bar placement adjustments. |
| **VBT Telemetry & Velocity** | `--edgewater` / Cyan | `#D1E6E4` | Objective hardware numbers (Enode & Activforce 2). |
| **Borders & Drop Shadows** | `--black` | `#000000` | Heavy 2px solid outlines & 4px/8px offset shadows. |

---

## 4. Typography Hierarchy (The Webflow Trio)

The Small Goods web infrastructure utilizes three distinct Google Fonts loaded via CDN:

```html
<link href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700|Roboto+Mono:300,400,500,600,700|Reenie+Beanie:300,400,500,600,700" rel="stylesheet">
```

### Font Roles & Rules

```
┌────────────────────────────────────────────────────────────────────────┐
│  1. POPPINS (Primary Geometric Sans-Serif)                             │
│     - Headings (h1: 700 Bold, clamp(2.0rem, 2.69rem))                  │
│     - Button labels (700 Bold, text-transform: uppercase / title-case) │
│     - General body prose (300 Light / 400 Regular)                     │
├────────────────────────────────────────────────────────────────────────┤
│  2. ROBOTO MONO (Monospaced Technical Font)                            │
│     - Set numbers, reps, loads (e.g., "100.0 kg × 5")                  │
│     - Enode velocity telemetry (e.g., "0.62 m/s")                      │
│     - .tag-2 badges (e.g., "#longfemurs", "coach", "physio")           │
│     - Timers, timestamps, and database IDs                             │
├────────────────────────────────────────────────────────────────────────┤
│  3. REENIE BEANIE (Casual Handwritten Script)                          │
│     - Coach's personal tips & form cues                                │
│     - Holly's handwritten physio notes                                 │
│     - Casual marginalia & stickers (e.g., "drive knees outward!")      │
└────────────────────────────────────────────────────────────────────────┘
```

### Zero-Orphan & Text Wrapping Standard
Per human-machine interface rules:
* Headings: `text-wrap: balance;`
* Paragraphs & Cards: `text-wrap: pretty;`
* Short sentences (2–4 words) and prepositions (*in, to, on, with, for*) must be glued with `\u00A0` to eliminate trailing single-word wraps.

---

## 5. UI Component Specifications

### 5.1 Buttons (`.btn`)
```css
/* Standard Action Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-color: var(--electric-violet);
  color: var(--white);
  border: 2px solid var(--black);
  border-radius: 0.5em; /* 8px rounded rect or 9999px pill */
  box-shadow: 4px 4px 0 0 var(--black);
  padding: 0.85em 2em;
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease-in-out;
}

.btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 0 var(--black);
}

.btn:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 0 var(--black);
}

/* Success / Complete Set Variant */
.btn.green {
  background-color: var(--inch-worm);
  color: var(--black);
}

/* Warning / Cancellation Variant */
.btn.mandy {
  background-color: var(--mandy);
  color: var(--white);
}
```

### 5.2 Badges & Leverage Tags (`.tag-2`)
```css
.tag-2 {
  display: inline-flex;
  align-items: center;
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  text-transform: lowercase;
  border: 2px solid var(--black);
  border-radius: 18px;
  padding: 3px 10px;
  letter-spacing: 0.02em;
}

/* Solid Purple Tag */
.tag-2.purple-heart {
  background-color: var(--purple-heart);
  color: var(--white);
}

/* Outlined Tag */
.tag-2.purple-heart.outlined {
  background-color: transparent;
  color: var(--purple-heart);
  border-color: var(--purple-heart);
}

/* Acid Green Active Tag */
.tag-2.inch-worm {
  background-color: var(--inch-worm);
  color: var(--black);
}
```

### 5.3 Cards & Content Containers
```css
/* Neo-Brutalist Content Card */
.sg-card {
  background-color: #0f172a; /* Dark variant */
  border: 2px solid var(--black);
  border-radius: 1rem;
  box-shadow: 4px 4px 0 0 var(--black);
  padding: 1.5rem;
  position: relative;
}

/* Highlighted / Coaching Card */
.sg-card.coaching {
  background-color: rgba(248, 239, 141, 0.08); /* Sweet-corn tint */
  border: 2px solid var(--sweet-corn);
}

/* Clinical Triage Interceptor Card */
.sg-card.triage {
  background-color: rgba(233, 87, 102, 0.08); /* Mandy tint */
  border: 2px solid var(--mandy);
}
```

---

## 6. Tailwind CSS Preset Configuration

For developers integrating into Next.js (`tailwind.config.js`):

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        sg: {
          purple: '#4724ba',
          violet: '#6a3cf4',
          lime: '#9aef0f',
          lemon: '#ecfd28',
          corn: '#f8ef8d',
          coral: '#e95766',
          sage: '#e7ebd3',
          mint: '#d1e6e4',
          charcoal: '#48444e',
          cream: '#faf2ce',
          teal: '#1a5250',
        }
      },
      fontFamily: {
        sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['Roboto Mono', 'ui-monospace', 'monospace'],
        hand: ['Reenie Beanie', 'cursive'],
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0 0 #000000',
        'brutal': '4px 4px 0 0 #000000',
        'brutal-lg': '8px 8px 0 0 #000000',
      },
      borderWidth: {
        '3': '3px',
      }
    }
  }
};
```

---

## 7. Quality Assurance Checklist

- [x] All high-frequency gym-floor actions use minimum $48\times48\text{ dp}$ targets (ideally $64\times64\text{ dp}$).
- [x] Telemetry values (kg, reps, m/s, time) rendered exclusively in **Roboto Mono**.
- [x] Cues and handwritten physio feedback rendered in **Reenie Beanie**.
- [x] Primary actions use **Electric Violet** or **Inch Worm** (Acid Lime) with 4px hard black shadows.
- [x] Rest timers provide audio/visual sub-400ms state updates without page reloading.
- [x] Authentic Small Goods sticker logo embedded in headers and splash screens.
