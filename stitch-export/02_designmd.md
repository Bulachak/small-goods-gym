1. Aesthetic Philosophy: "Neo-Brutalist High-Performance"
Small Goods does not look like a generic corporate gym app (e.g. Equinox or MyFitnessPal). Their visual identity is Neo-Brutalist, playful, punchy, and confident:


Heavy Black Borders: Elements use crisp border: 2px solid #000;.

Hard Drop Shadows ("Sticker Effect"): Unblurred, high-contrast offset shadows (box-shadow: 4px 4px 0 0 #000; and 8px 8px 0 0 #000;), matching the exact outline style of their logo sticker!

Boutique Color Blocking: High-voltage neon and pastel accents set against deep blacks and electric purples.
2. The Official Color Palette (Exact Webflow Tokens)
css
:root {
/* Brand Core */
--purple-heart:     #4724ba;   /* The Signature Small Goods Royal Purple */
--electric-violet:  #6a3cf4;   /* High-voltage interactive purple/action */
--black:            #000000;   /* Pure black for borders & hard shadows */
--white:            #ffffff;   /* Pure white */
/* High-Contrast Highlights */
--inch-worm:        #9aef0f;   /* Acid/Neon Lime (used on green success/action buttons) */
--golden-fizz:      #ecfd28;   /* Electric Lemon Yellow */
--sweet-corn:       #f8ef8d;   /* Pastel Butter Yellow */
--mandy:            #e95766;   /* Coral Pink/Red (alerts, active flags, triage) */
/* Subtle Warm & Cool Neutrals */
--kidnapper:        #e7ebd3;   /* Muted Pale Sage / Pistachio cream */
--bon-jour:         #f6f4f6;   /* Off-white background card tone */
--champagne:        #faf2ce;   /* Pale warm cream */
--edgewater:        #d1e6e4;   /* Soft ice mint */
--ship-gray:        #48444e;   /* Neutral charcoal for muted text */
--frangipani:       #feddba;   /* Warm peach */
--green-pea:        #1a5250;   /* Deep athletic forest green */
}
The Official Sticker Logo Gradient:
From your local sticker image (small-goods-logo_sticker@2x-p-500.png):


Top Right: Warm Gold (#FFB800 / #FFA000)

Center / Angle: Fiery Coral Red (#E95766 / #FF4500)

Bottom Point: Electric Purple (#4724BA / #6A3CF4)

Container: Dynamic inverted shield/triangle with crown ridges and a solid black sticker drop shadow.
3. Typography Hierarchy (The Webflow Trio)
Their site loads three Google Fonts via: family=Poppins:300,400,500,600,700 | Roboto+Mono:300,400,500,600,700 | Reenie+Beanie:300,400,500,600,700
RoleFont FamilyWeightsWhere It Is UsedPrimary Headings & BodyPoppins, sans-serif300 (Light body), 700 (Bold titles)Main page headings, descriptions, buttons, and navigation. Clean and modern.Data, Badges & HardwareRoboto Mono, monospace400, 600, 700.tag-2 badges (coach, physio, owner), barbell weights, reps, VBT velocity, and timestamps.Coach's Voice & AnnotationsReenie Beanie, cursive400Human handwritten coaching notes, form cues, and personal lifter tips (e.g. "in short,", "gainsofholly", "move_or_be_moved").
4. UI Components & Webflow Design Patterns
Buttons (.btn)
css
.btn {
background-color: var(--electric-violet); /* #6a3cf4 */
color: var(--white);
border: 2px solid #000;
border-radius: 0.5em; /* Rounded pill / soft rectangle */
box-shadow: 4px 4px 0 0 #000; /* Neo-brutalist offset shadow */
font-family: 'Poppins', sans-serif;
font-weight: 700;
text-align: center;
}
/* Active / Green button */
.btn.green {
background-color: var(--inch-worm); /* #9aef0f */
color: #000;
}
Badges & Tags (.tag-2)
css
.tag-2 {
font-family: 'Roboto Mono', monospace;
font-size: 11px;
font-weight: 700;
text-transform: lowercase;
border: 2px solid #000;
border-radius: 18px;
padding: 3px 10px;
}
/* Solid purple tag */
.tag-2.purple-heart {
background-color: var(--purple-heart);
color: #fff;
}
/* Outlined tag */
.tag-2.purple-heart.outlined {
background-color: transparent;
color: var(--purple-heart);
border-color: var(--purple-heart);
}
Cards (.card / .intro-card)
css
.card {
border: 2px solid #000;
border-radius: 1em;
box-shadow: 4px 4px 0 0 #000;
background-color: var(--bon-jour); /* Or dark theme variant */
}