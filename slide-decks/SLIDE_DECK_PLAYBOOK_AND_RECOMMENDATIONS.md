---
id: SGG-DOC-SLIDE-DECK-STRATEGY
fileClass: doc
type: presentation_playbook
status: active
title: "Small Goods Gym - Slide Deck Presentation Playbook & Strategy"
created_by: "Antigravity (Gemini 3.8 Flash)"
date_created: 2026-09-06
updated_by: "Antigravity (Gemini 3.8 Flash)"
last_updated_on: 2026-09-06
last_revision_reason: "Initial creation of slide deck strategy and audience routing for Joel Mullen and Javier."
target_asset: "Architecting_Elite_Performance.pdf"
---

# Slide Deck Playbook: *Architecting Elite Performance*

> **Core Rule:** Do **not** send the full 15-slide PDF cold as an attachment to Joel on WhatsApp.  
> The deck contains deep academic computer science theory (Lehman’s Laws, Liskov Substitution, GRASP Patterns, IEEE Ethics) that risks creating sticker shock, intimidating a boutique gym owner, or putting his developer (Javier) on the defensive.

Instead, use this playbook to split the deck into two targeted presentations: **The Coach’s Cut** (for Joel & Holly) and **The Engineer’s Handshake** (for Javier).

---

## 1. Audience 1: Joel Mullen & Holly Hunt (The "Coach's Cut")

**Format:** Live 15-minute screen-share on Google Meet/Zoom, OR a lightweight 6-slide PDF export.  
**Focus:** Solving his spreadsheet headaches, athlete gym-floor usability, and the February deadline.

### Which Slides to Show (6 Slides Only):

| Slide # | Slide Title | What to Say / Talking Point |
| :--- | :--- | :--- |
| **Slide 1** | *Engineering Design Stamina* | "Joel, this isn't generic software off the shelf. It’s custom-engineered around the barbell and your coaching philosophy." |
| **Slide 3** | *The Core Bottleneck: Resolving Systemic Failure* | "Here is what we mapped out earlier this year: your team is losing 15+ hours a week copying YouTube links into scattered spreadsheets. We are replacing that with one unified dashboard." |
| **Slide 5** | *Agile Collaboration: Gym Floor ↔ Codebase* | "We aren't building in a dark room. The ultimate test of whether this app works happens mid-workout with chalk on hands, not in a conference room." |
| **Slide 6** | *Gym-Floor UX: Designing for the Sweaty Hand* | "Look at this mobile screen: one exercise at a time, massive buttons in the thumb reach zone, no tiny spreadsheets to zoom into when you're fatigued." |
| **Slide 7** | *Neurological Flow & Input Resilience* | "If an athlete mistypes `22..5` with shaking hands, the app auto-corrects it to `22.5kg` rather than throwing an annoying error popup mid-session." |
| **Slide 12** | *Phase 2 Horizon: The VBT & AI Co-Pilot* | "This is your vision for limb lengths and bar velocity. The system calculates joint angles and velocity loss in real time to suggest program progressions for you and Holly." |
| **Slide 14** | *The Strategic Delivery Timeline (Oct – Feb)* | "Here is the exact flight plan to have the core app running for your athletes in February, while laying the foundation for the AI engine." |

> **Skip for Joel:** Slides 2, 4, 8, 9, 10, 11, and 13. (Too technical/academic for a founder check-in).

---

## 2. Audience 2: Javier (The "Engineer's Handshake")

**Format:** 1-on-1 Technical Alignment Call with Javier.  
**Focus:** Establishing respect, showing you are not replacing his backend, and presenting clean architectural boundaries.

### Which Slides to Show to Javier:

| Slide # | Slide Title | What to Say / Technical Context |
| :--- | :--- | :--- |
| **Slide 8** | *Decoupling the Core* | "Javier, we are not touching your auth shell. Your user tables, permissions, and security stay completely intact. Our Next.js PWA and FastAPI engine attach via clean API adapters." |
| **Slide 9** | *SOLID Principles* | "We’re using Dependency Inversion (DIP) so if your endpoint schemas evolve, our UI doesn't break." |
| **Slide 10** | *GRASP Patterns: Architectural Shock Absorbers* | "We’ve designed Protected Variations / Mediators between systems. We absorb data shocks so neither of us blocks the other." |
| **Slide 11** | *Python ETL Pipelines* | "We wrote the extraction scripts (`simulate-sheets-migration.py`) to standardize Joel's historical spreadsheets into clean PostgreSQL tables, so you don't have to manually format his data." |

---

## 3. Tomorrow Morning Action Plan & WhatsApp Draft

When you message Joel in the morning, keep it warm, simple, and low-friction. 

### Ready-to-Send WhatsApp Message for Joel:

> Morning Joel! Had a chance to go through your voice note and review our earlier system mapping. 
>
> What you described—the low-noise events hub, the video-linked program delivery for February, and the limb length/velocity AI co-pilot—is 100% doable. We don't need to rebuild what Javier has already done; we just need to plug in the athlete interface and the coaching logic.
>
> I put together a quick visual walkthrough showing how the gym-floor set logger and Holly's biomechanical setup notes actually work on a phone.
>
> Do you have 15 minutes for a quick video call sometime today or tomorrow so I can share my screen and show you what it looks like?

---

## 4. Key Artifacts in the Repository Ready for Tomorrow

* **Interactive Athlete Prototype:** `C:\Users\kamil\PROJECTS\small-goods-gym\workout-logger-preview.html`
* **Interactive Biomechanics Dashboard:** `C:\Users\kamil\PROJECTS\small-goods-gym\athlete-profile-preview.html`
* **Full Slide Deck:** `C:\Users\kamil\PROJECTS\small-goods-gym\slide-decks\Architecting_Elite_Performance.pdf`
* **Database & Migration Scripts:** `C:\Users\kamil\PROJECTS\small-goods-gym\seed-database.sql` & `simulate-sheets-migration.py`
