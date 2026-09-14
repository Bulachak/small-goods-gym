# Design System: Neo-Brutalist High-Performance

## Brand & Style

The design system embodies "Neo-Brutalist High-Performance" — an unapologetic fusion of elite athletic capability and playful, boutique street-culture aesthetics. Far removed from clinical corporate health trackers or monochromatic warehouse gym templates, the visual identity pairs high-octane velocity with tangible tactile personality.

Key tenets:
- **Playful Defiance:** Rejection of muted minimalism in favor of saturated, electric color blocking and physical sticker-like elements.
- **Precision Rawness:** High-density data metrics, barbell telemetry, and VBT velocity values delivered with monospaced rigor alongside expressive, warm cursive coaching notes.
- **Physicality & Tactility:** Every interface element feels punchy and punch-out-able, anchored by 2px solid black boundaries and unblurred hard drop shadows reminiscent of vinyl gym decals and barbell plates.

## Layout & Spacing

The layout is built on a 12-column dynamic fluid grid on desktop and tablet, converting to a single-column layout on mobile viewports.
- **Rhythm & Alignments:** Consistent 8px baseline rhythm. Sections utilize generous outer paddings (`margin`) to let heavy-bordered modules breathe without feeling cramped.
- **Card Clustering:** Component groups lean on asymmetric flex arrangements and stacked sticker offsets rather than tight, sterile grids. Elements frequently overlap or skew slightly to produce an athletic workshop mood.

## Elevation & Depth

This design system completely repudiates blurry, atmospheric drop shadows. Depth is governed strictly by hard-edge Neo-Brutalist extrusion:
- **Base Border Rule:** Every elevation container, card, badge, and button maintains a mandatory `2px solid #000000`.
- **Level 1 Elevation (Sticker Micro):** `box-shadow: 2px 2px 0 0 #000000;` used for secondary tags, chips, and small interactive toggles.
- **Level 2 Elevation (Standard Action / Card):** `box-shadow: 4px 4px 0 0 #000000;` applied to standard `.btn`, input focus panels, and `.intro-card` containers.
- **Level 3 Elevation (Hero / Stacker):** `box-shadow: 8px 8px 0 0 #000000;` applied to standout hero graphics, floating modals, and the signature sticker shield logo.
- **Interaction Depth (Press Effect):** On `:hover`, buttons slightly translate (`translate(-2px, -2px)`) while shadow expands to `6px 6px 0 0 #000000`. On `:active`, elements translate down-right (`translate(2px, 2px)`) with shadow reducing to `2px 2px 0 0 #000000`, creating physical mechanical actuation.

## Components

### Buttons (`.btn`)
- **Primary Violet:** Background `#6A3CF4`, text `#FFFFFF`, font Poppins Bold (700), border `2px solid #000000`, shadow `4px 4px 0 0 #000000`, radius `0.5em`.
- **Action Green (`.btn.green`):** Background `#9AEF0F` (`inch-worm`), text `#000000`, border `2px solid #000000`, shadow `4px 4px 0 0 #000000`.
- **Destructive / High Triage:** Background `#E95766` (`mandy`), text `#FFFFFF`, border `2px solid #000000`.
- **States:** Active clicks drop the shadow offset to `1px 1px 0 0 #000000` with an authentic tactile sink.

### Badges & Micro-Pills (`.tag-2`)
- Monospaced typography: Roboto Mono 700, 11px, strict lowercase, letter-spacing `0.04em`.
- Border `2px solid #000000`, radius `18px`, padding `3px 10px`.
- Variants:
  - `.tag-2.purple-heart`: Background `#4724BA`, text `#FFFFFF`.
  - `.tag-2.purple-heart.outlined`: Background transparent, text `#4724BA`, border `2px solid #4724BA`.
  - `.tag-2.lime`: Background `#9AEF0F`, text `#000000`.
  - `.tag-2.coach`: Background `#ECFD28`, text `#000000`.

### Cards & Intro Containers (`.card`, `.intro-card`)
- Background defaults to `bon-jour` (`#F6F4F6`) or warm neutrals (`champapper`, `kidnapper`).
- Border `2px solid #000000`, radius `1em` (16px), shadow `4px 4px 0 0 #000000`.
- Header areas frequently integrate coach annotations (`Reenie Beanie`) floating diagonally over the upper boundary.

### Form Inputs & Checkboxes
- **Inputs:** Background `#FFFFFF`, border `2px solid #000000`, radius `8px`, shadow `2px 2px 0 0 #000000`. On `:focus`, border thickens to `2px solid #6A3CF4` with shadow `4px 4px 0 0 #000000`.
- **Checkboxes & Radios:** Custom box with `2px solid #000000`, sharp checkmark fills in `#9AEF0F` or `#6A3CF4`, unblurred 2px offset shadow.

### Telemetry / Velocity Data Blocks
- Encapsulated containers pairing Roboto Mono metric numbers with tiny uppercase labels.
- Dual-tone borders separating the metric value from status indicators.

### Sticker-Style Badges
- Floating inverted shield geometry with offset black hard drops (`8px 8px 0 0 #000000`).
- Gradient fill transitioning from `#FFA000` through `#E95766` to `#4724BA`.

## Theme
```json
{
  "bodyFontFamily": "Poppins",
  "colorMode": "LIGHT",
  "colorVariant": "FIDELITY",
  "customColor": "#4724ba",
  "designMd": "---\nname: Neo-Brutalist High-Performance\ncolors:\n  surface: '#fbf9fb'\n  surface-dim: '#dbd9db'\n  surface-bright: '#fbf9fb'\n  surface-container-lowest: '#ffffff'\n  surface-container-low: '#f5f3f5'\n  surface-container: '#efedef'\n  surface-container-high: '#e9e7e9'\n  surface-container-highest: '#e4e2e4'\n  on-surface: '#1b1c1d'\n  on-surface-variant: '#484554'\n  inverse-surface: '#303032'\n  inverse-on-surface: '#f2f0f2'\n  outline: '#797586'\n  outline-variant: '#c9c4d7'\n  surface-tint: '#6043d3'\n  primary: '#300099'\n  on-primary: '#ffffff'\n  primary-container: '#4724ba'\n  on-primary-container: '#b7a9ff'\n  inverse-primary: '#cabeff'\n  secondary: '#5c28e6'\n  on-secondary: '#ffffff'\n  secondary-container: '#754bff'\n  on-secondary-container: '#f8f2ff'\n  tertiary: '#1f3600'\n  on-tertiary: '#ffffff'\n  tertiary-container: '#2f4f00'\n  on-tertiary-container: '#7fc800'\n  error: '#ba1a1a'\n  on-error: '#ffffff'\n  error-container: '#ffdad6'\n  on-error-container: '#93000a'\n  primary-fixed: '#e6deff'\n  primary-fixed-dim: '#cabeff'\n  on-primary-fixed: '#1c0062'\n  on-primary-fixed-variant: '#4825bb'\n  secondary-fixed: '#e7deff'\n  secondary-fixed-dim: '#cbbeff'\n  on-secondary-fixed: '#1e0060'\n  on-secondary-fixed-variant: '#4b00d4'\n  tertiary-fixed: '#a4fa23'\n  tertiary-fixed-dim: '#8cdc00'\n  on-tertiary-fixed: '#102000'\n  on-tertiary-fixed-variant: '#304f00'\n  background: '#fbf9fb'\n  on-background: '#1b1c1d'\n  surface-variant: '#e4e2e4'\n  purple-heart: '#4724BA'\n  electric-violet: '#6A3CF4'\n  inch-worm: '#9AEF0F'\n  golden-fizz: '#ECFD28'\n  sweet-corn: '#F8EF8D'\n  mandy: '#E95766'\n  kidnapper: '#E7EBD3'\n  bon-jour: '#F6F4F6'\n  champagne: '#FAF2CE'\n  edgewater: '#D1E6E4'\n  ship-gray: '#48444E'\n  frangipani: '#FEDDBA'\n  green-pea: '#1A5250'\n  black: '#000000'\n  white: '#FFFFFF'\n  sticker-gold: '#FFA000'\n  sticker-coral: '#FF4500'\ntypography:\n  display-hero:\n    fontFamily: Poppins\n    fontSize: 56px\n    fontWeight: '800'\n    lineHeight: 64px\n    letterSpacing: -0.03em\n  display-hero-mobile:\n    fontFamily: Poppins\n    fontSize: 36px\n    fontWeight: '800'\n    lineHeight: 44px\n    letterSpacing: -0.02em\n  headline-lg:\n    fontFamily: Poppins\n    fontSize: 40px\n    fontWeight: '700'\n    lineHeight: 48px\n    letterSpacing: -0.02em\n  headline-lg-mobile:\n    fontFamily: Poppins\n    fontSize: 28px\n    fontWeight: '700'\n    lineHeight: 36px\n    letterSpacing: -0.01em\n  headline-md:\n    fontFamily: Poppins\n    fontSize: 28px\n    fontWeight: '700'\n    lineHeight: 36px\n  headline-sm:\n    fontFamily: Poppins\n    fontSize: 22px\n    fontWeight: '600'\n    lineHeight: 30px\n  body-lg:\n    fontFamily: Poppins\n    fontSize: 18px\n    fontWeight: '400'\n    lineHeight: 28px\n  body-md:\n    fontFamily: Poppins\n    fontSize: 15px\n    fontWeight: '400'\n    lineHeight: 24px\n  body-sm:\n    fontFamily: Poppins\n    fontSize: 13px\n    fontWeight: '400'\n    lineHeight: 20px\n  data-metric:\n    fontFamily: Roboto Mono\n    fontSize: 32px\n    fontWeight: '700'\n    lineHeight: 36px\n    letterSpacing: -0.02em\n  data-label:\n    fontFamily: Roboto Mono\n    fontSize: 11px\n    fontWeight: '700'\n    lineHeight: 14px\n    letterSpacing: 0.04em\n  coach-cue:\n    fontFamily: Reenie Beanie\n    fontSize: 24px\n    fontWeight: '400'\n    lineHeight: 26px\n  coach-cue-lg:\n    fontFamily: Reenie Beanie\n    fontSize: 32px\n    fontWeight: '400'\n    lineHeight: 34px\nrounded:\n  sm: 0.25rem\n  DEFAULT: 0.5rem\n  md: 0.75rem\n  lg: 1rem\n  xl: 1.5rem\n  full: 9999px\nspacing:\n  gutter: 1.5rem\n  gutter-mobile: 1rem\n  margin: 2.5rem\n  margin-mobile: 1.25rem\n  space-xs: 0.25rem\n  space-sm: 0.5rem\n  space-md: 1rem\n  space-lg: 1.5rem\n  space-xl: 2.5rem\n---\n\n## Brand & Style\n\nThe design system embodies \"Neo-Brutalist High-Performance\" — an unapologetic fusion of elite athletic capability and playful, boutique street-culture aesthetics. Far removed from clinical corporate health trackers or monochromatic warehouse gym templates, the visual identity pairs high-octane velocity with tangible tactile personality.\n\nKey tenets:\n- **Playful Defiance:** Rejection of muted minimalism in favor of saturated, electric color blocking and physical sticker-like elements.\n- **Precision Rawness:** High-density data metrics, barbell telemetry, and VBT velocity values delivered with monospaced rigor alongside expressive, warm cursive coaching notes.\n- **Physicality & Tactility:** Every interface element feels punchy and punch-out-able, anchored by 2px solid black boundaries and unblurred hard drop shadows reminiscent of vinyl gym decals and barbell plates.\n\n## Colors\n\nThe palette balances deep brand grounding with high-voltage interactive pops and muted athletic tints:\n- **Primary & Interactive Purples:** `purple-heart` (#4724BA) anchors primary brand containers and display titles. `electric-violet` (#6A3CF4) acts as the high-energy trigger for primary CTAs, hover states, and navigational highlights.\n- **High-Contrast Accelerators:** `inch-worm` (#9AEF0F) delivers explosive kinetic energy on secondary action triggers (`.btn.green`) and completed state indicators. `golden-fizz` (#ECFD28) and `sweet-corn` (#F8EF8D) provide warnings, PR badges, and highlight fills. `mandy` (#E95766) handles triage alerts, active telemetry flags, and cardiac zones.\n- **Tactile Neutral Fields:** `bon-jour` (#F6F4F6) acts as the principal card surface. Background accents leverage `kidnapper` (pale pistachio sage), `champagne` (warm cream), and `edgewater` (ice mint) to section content blocks dynamically without visual fatigue. `ship-gray` (#48444E) provides soft secondary body copy, while `green-pea` (#1A5250) introduces deep athletic structure.\n- **The Sticker Shield Gradient:** Multi-stop linear progression from top-right `sticker-gold` (#FFA000) through `mandy`/`sticker-coral` (#FF4500) down to `purple-heart` (#4724BA).\n\n## Typography\n\nThe design system implements a deliberate three-tier typographic engine:\n\n1. **Structural Voice (Poppins):** Modern, geometric, clean. Used for hero headings, page titles, navigation, and core body narrative. Display headlines use tighter letter-spacing and heavy weights (700, 800) to command authority.\n2. **Telemetry & Hardware (Roboto Mono):** Applied strictly to performance output, rep tallies, micro-tags, timestamps, VBT m/s readouts, barbell loads, and technical labels. All labels utilize uppercase or strict lowercase treatment with explicit tracking.\n3. **The Coach’s Annotation (Reenie Beanie):** A tactile handwritten script rendered at an angle (-2deg to -4deg) for physical cues, training tips (\"in short,\", \"move_or_be_moved\"), and coach markup over formal data charts.\n\n## Layout & Spacing\n\nThe layout is built on a 12-column dynamic fluid grid on desktop and tablet, converting to a single-column layout on mobile viewports.\n- **Rhythm & Alignments:** Consistent 8px baseline rhythm. Sections utilize generous outer paddings (`margin`) to let heavy-bordered modules breathe without feeling cramped.\n- **Card Clustering:** Component groups lean on asymmetric flex arrangements and stacked sticker offsets rather than tight, sterile grids. Elements frequently overlap or skew slightly to produce an athletic workshop mood.\n\n## Elevation & Depth\n\nThis design system completely repudiates blurry, atmospheric drop shadows. Depth is governed strictly by hard-edge Neo-Brutalist extrusion:\n- **Base Border Rule:** Every elevation container, card, badge, and button maintains a mandatory `2px solid #000000`.\n- **Level 1 Elevation (Sticker Micro):** `box-shadow: 2px 2px 0 0 #000000;` used for secondary tags, chips, and small interactive toggles.\n- **Level 2 Elevation (Standard Action / Card):** `box-shadow: 4px 4px 0 0 #000000;` applied to standard `.btn`, input focus panels, and `.intro-card` containers.\n- **Level 3 Elevation (Hero / Stacker):** `box-shadow: 8px 8px 0 0 #000000;` applied to standout hero graphics, floating modals, and the signature sticker shield logo.\n- **Interaction Depth (Press Effect):** On `:hover`, buttons slightly translate (`translate(-2px, -2px)`) while shadow expands to `6px 6px 0 0 #000000`. On `:active`, elements translate down-right (`translate(2px, 2px)`) with shadow reducing to `2px 2px 0 0 #000000`, creating physical mechanical actuation.\n\n## Shapes\n\nThe shape vocabulary sits deliberately between crisp brutalism and friendly boutique geometry:\n- **Cards & Intro Containers:** Smooth 1rem (`rounded-lg` / 16px) corners combined with stiff 2px black boundaries.\n- **Buttons (`.btn`):** 0.5rem (8px) corner radius, balancing punchy industrial edges with tactile pressability.\n- **Tags & Badges (`.tag-2`):** Fully rounded pill capsules (18px border radius) to contrast against rectangular content blocks.\n- **Stickers & Decals:** Organic SVG boundaries with thick outward black sticker margins and multi-axis drop strokes.\n\n## Components\n\n### Buttons (`.btn`)\n- **Primary Violet:** Background `#6A3CF4`, text `#FFFFFF`, font Poppins Bold (700), border `2px solid #000000`, shadow `4px 4px 0 0 #000000`, radius `0.5em`.\n- **Action Green (`.btn.green`):** Background `#9AEF0F` (`inch-worm`), text `#000000`, border `2px solid #000000`, shadow `4px 4px 0 0 #000000`.\n- **Destructive / High Triage:** Background `#E95766` (`mandy`), text `#FFFFFF`, border `2px solid #000000`.\n- **States:** Active clicks drop the shadow offset to `1px 1px 0 0 #000000` with an authentic tactile sink.\n\n### Badges & Micro-Pills (`.tag-2`)\n- Monospaced typography: Roboto Mono 700, 11px, strict lowercase, letter-spacing `0.04em`.\n- Border `2px solid #000000`, radius `18px`, padding `3px 10px`.\n- Variants:\n  - `.tag-2.purple-heart`: Background `#4724BA`, text `#FFFFFF`.\n  - `.tag-2.purple-heart.outlined`: Background transparent, text `#4724BA`, border `2px solid #4724BA`.\n  - `.tag-2.lime`: Background `#9AEF0F`, text `#000000`.\n  - `.tag-2.coach`: Background `#ECFD28`, text `#000000`.\n\n### Cards & Intro Containers (`.card`, `.intro-card`)\n- Background defaults to `bon-jour` (`#F6F4F6`) or warm neutrals (`champapper`, `kidnapper`).\n- Border `2px solid #000000`, radius `1em` (16px), shadow `4px 4px 0 0 #000000`.\n- Header areas frequently integrate coach annotations (`Reenie Beanie`) floating diagonally over the upper boundary.\n\n### Form Inputs & Checkboxes\n- **Inputs:** Background `#FFFFFF`, border `2px solid #000000`, radius `8px`, shadow `2px 2px 0 0 #000000`. On `:focus`, border thickens to `2px solid #6A3CF4` with shadow `4px 4px 0 0 #000000`.\n- **Checkboxes & Radios:** Custom box with `2px solid #000000`, sharp checkmark fills in `#9AEF0F` or `#6A3CF4`, unblurred 2px offset shadow.\n\n### Telemetry / Velocity Data Blocks\n- Encapsulated containers pairing Roboto Mono metric numbers with tiny uppercase labels.\n- Dual-tone borders separating the metric value from status indicators.\n\n### Sticker-Style Badges\n- Floating inverted shield geometry with offset black hard drops (`8px 8px 0 0 #000000`).\n- Gradient fill transitioning from `#FFA000` through `#E95766` to `#4724BA`.",
  "headlineFontFamily": "Poppins",
  "labelFontFamily": "Roboto Mono",
  "namedColors": {
    "background": "#fbf9fb",
    "black": "#000000",
    "bon-jour": "#F6F4F6",
    "champagne": "#FAF2CE",
    "edgewater": "#D1E6E4",
    "electric-violet": "#6A3CF4",
    "error": "#ba1a1a",
    "error_container": "#ffdad6",
    "frangipani": "#FEDDBA",
    "golden-fizz": "#ECFD28",
    "green-pea": "#1A5250",
    "inch-worm": "#9AEF0F",
    "inverse_on_surface": "#f2f0f2",
    "inverse_primary": "#cabeff",
    "inverse_surface": "#303032",
    "kidnapper": "#E7EBD3",
    "mandy": "#E95766",
    "on_background": "#1b1c1d",
    "on_error": "#ffffff",
    "on_error_container": "#93000a",
    "on_primary": "#ffffff",
    "on_primary_container": "#b7a9ff",
    "on_primary_fixed": "#1c0062",
    "on_primary_fixed_variant": "#4825bb",
    "on_secondary": "#ffffff",
    "on_secondary_container": "#f8f2ff",
    "on_secondary_fixed": "#1e0060",
    "on_secondary_fixed_variant": "#4b00d4",
    "on_surface": "#1b1c1d",
    "on_surface_variant": "#484554",
    "on_tertiary": "#ffffff",
    "on_tertiary_container": "#7fc800",
    "on_tertiary_fixed": "#102000",
    "on_tertiary_fixed_variant": "#304f00",
    "outline": "#797586",
    "outline_variant": "#c9c4d7",
    "primary": "#300099",
    "primary_container": "#4724ba",
    "primary_fixed": "#e6deff",
    "primary_fixed_dim": "#cabeff",
    "purple-heart": "#4724BA",
    "secondary": "#5c28e6",
    "secondary_container": "#754bff",
    "secondary_fixed": "#e7deff",
    "secondary_fixed_dim": "#cbbeff",
    "ship-gray": "#48444E",
    "sticker-coral": "#FF4500",
    "sticker-gold": "#FFA000",
    "surface": "#fbf9fb",
    "surface_bright": "#fbf9fb",
    "surface_container": "#efedef",
    "surface_container_high": "#e9e7e9",
    "surface_container_highest": "#e4e2e4",
    "surface_container_low": "#f5f3f5",
    "surface_container_lowest": "#ffffff",
    "surface_dim": "#dbd9db",
    "surface_tint": "#6043d3",
    "surface_variant": "#e4e2e4",
    "sweet-corn": "#F8EF8D",
    "tertiary": "#1f3600",
    "tertiary_container": "#2f4f00",
    "tertiary_fixed": "#a4fa23",
    "tertiary_fixed_dim": "#8cdc00",
    "white": "#FFFFFF"
  },
  "overrideNeutralColor": "#f6f4f6",
  "overridePrimaryColor": "#4724ba",
  "overrideSecondaryColor": "#6a3cf4",
  "overrideTertiaryColor": "#9aef0f",
  "roundness": "ROUND_EIGHT",
  "spacing": {
    "gutter": "1.5rem",
    "gutter-mobile": "1rem",
    "margin": "2.5rem",
    "margin-mobile": "1.25rem",
    "space-lg": "1.5rem",
    "space-md": "1rem",
    "space-sm": "0.5rem",
    "space-xl": "2.5rem",
    "space-xs": "0.25rem"
  },
  "spacingScale": 2,
  "typography": {
    "body-lg": {
      "fontFamily": "Poppins",
      "fontSize": "18px",
      "fontWeight": "400",
      "lineHeight": "28px"
    },
    "body-md": {
      "fontFamily": "Poppins",
      "fontSize": "15px",
      "fontWeight": "400",
      "lineHeight": "24px"
    },
    "body-sm": {
      "fontFamily": "Poppins",
      "fontSize": "13px",
      "fontWeight": "400",
      "lineHeight": "20px"
    },
    "coach-cue": {
      "fontFamily": "Reenie Beanie",
      "fontSize": "24px",
      "fontWeight": "400",
      "lineHeight": "26px"
    },
    "coach-cue-lg": {
      "fontFamily": "Reenie Beanie",
      "fontSize": "32px",
      "fontWeight": "400",
      "lineHeight": "34px"
    },
    "data-label": {
      "fontFamily": "Roboto Mono",
      "fontSize": "11px",
      "fontWeight": "700",
      "letterSpacing": "0.04em",
      "lineHeight": "14px"
    },
    "data-metric": {
      "fontFamily": "Roboto Mono",
      "fontSize": "32px",
      "fontWeight": "700",
      "letterSpacing": "-0.02em",
      "lineHeight": "36px"
    },
    "display-hero": {
      "fontFamily": "Poppins",
      "fontSize": "56px",
      "fontWeight": "800",
      "letterSpacing": "-0.03em",
      "lineHeight": "64px"
    },
    "display-hero-mobile": {
      "fontFamily": "Poppins",
      "fontSize": "36px",
      "fontWeight": "800",
      "letterSpacing": "-0.02em",
      "lineHeight": "44px"
    },
    "headline-lg": {
      "fontFamily": "Poppins",
      "fontSize": "40px",
      "fontWeight": "700",
      "letterSpacing": "-0.02em",
      "lineHeight": "48px"
    },
    "headline-lg-mobile": {
      "fontFamily": "Poppins",
      "fontSize": "28px",
      "fontWeight": "700",
      "letterSpacing": "-0.01em",
      "lineHeight": "36px"
    },
    "headline-md": {
      "fontFamily": "Poppins",
      "fontSize": "28px",
      "fontWeight": "700",
      "lineHeight": "36px"
    },
    "headline-sm": {
      "fontFamily": "Poppins",
      "fontSize": "22px",
      "fontWeight": "600",
      "lineHeight": "30px"
    }
  }
}
```
