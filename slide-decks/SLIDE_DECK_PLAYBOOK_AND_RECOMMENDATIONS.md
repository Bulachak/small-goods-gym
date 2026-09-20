# Small Goods Gym • Executive Presentation & Slide Deck Architecture Guide
**Document ID:** `SGG-DOC-SLIDE-DECK-STRATEGY`  
**Author:** Kamilla Gafurzianova, OLY  
**Target Deck Asset:** [`Architecting_Elite_Performance.pdf`](./Architecting_Elite_Performance.pdf)  
**Stakeholders:** Joel Mullen (Head Coach), Holly Hunt (Physiotherapy), Javier Pereira (Lead Systems Developer)  

---

## 1. Executive Presentation Strategy

The slide deck *Architecting Elite Performance* establishes the engineering, sports science, and UX rigor behind the Small Goods Gym platform. 

To maximize alignment across diverse stakeholder backgrounds, presentation delivery is divided into two focused tracks:
1. **The Coach's Cut (for Joel Mullen & Holly Hunt):** Focuses on eliminating manual spreadsheet maintenance, athlete gym-floor usability under high fatigue, and the February production timeline.
2. **The Engineer's Handshake (for Javier Pereira):** Focuses on non-invasive edge integration, preserving his existing auth shell, and delivering drop-in React Native components.

---

## 2. Audience Track 1: Joel Mullen & Holly Hunt ("The Coach's Cut")

**Format:** 15-minute screen-share or focused 6-slide executive brief.  
**Focus:** Operational efficiency, athlete experience, biomechanical leverage diagnostics.

| Slide # | Slide Title | Strategic Core Message |
| :--- | :--- | :--- |
| **Slide 1** | *Engineering Design Stamina* | "Joel, this system is custom-engineered around the barbell, your unique 12-platform limit, and your coaching standards." |
| **Slide 3** | *Resolving Operational Bottlenecks* | "Your team currently loses 15+ hours weekly copying video links across scattered spreadsheets. We consolidate that into a single, unified mobile dashboard." |
| **Slide 5** | *Gym Floor ↔ Codebase Collaboration* | "We build from the gym floor out. The true test of our UX occurs with chalk on hands and high heart rates, not in an abstract office." |
| **Slide 6** | *Gym-Floor UX: Designing for the Sweaty Hand* | "One exercise per card, 64dp buttons positioned in the thumb reach arc, and zero tiny cells to pinch-to-zoom during a workout." |
| **Slide 7** | *Neurological Flow & Error Resilience* | "If an athlete types `22..5` with shaking hands, the interface auto-corrects to `22.5 kg` rather than halting the session with an error alert." |
| **Slide 12** | *Biomechanics & VBT Engine* | "Calculates 4-segment anthropometry (femur, torso, humerus, forelimb) and velocity drop-off in real time to suggest precise load adjustments." |

---

## 3. Audience Track 2: Javier Pereira ("The Engineer's Handshake")

**Format:** 1-on-1 Technical Architecture Review.  
**Focus:** Clean boundary decoupling, serverless edge routing, zero auth disruption.

| Slide # | Slide Title | Technical Handshake Context |
| :--- | :--- | :--- |
| **Slide 8** | *Decoupling the Core* | "Javier, we preserve your existing authentication and permissions completely intact. Our mobile package connects via lightweight edge proxy workers." |
| **Slide 9** | *SOLID Principles & Inversion* | "We apply Dependency Inversion so that if API schema evolutions occur, the React Native client interfaces remain completely stable." |
| **Slide 10** | *Protected Variations & Mediators* | "Architectural shock absorbers isolate client components from database migrations, ensuring zero blocking dependencies between our workflows." |
| **Slide 11** | *Edge Relational Migration* | "We provide complete SQLite DDL scripts for Cloudflare D1 with automated triggers for GDPR/PII compliance, keeping query latencies sub-15ms." |

---

## 4. Associated System Assets

- **Interactive Web App (Canonical):** [`index.html`](../index.html)
- **React Native Handover Directory:** [`expo-handover/`](../expo-handover/)
- **Full Slide Deck PDF:** [`slide-decks/Architecting_Elite_Performance.pdf`](./Architecting_Elite_Performance.pdf)
- **Developer Integration Guide:** [`javier-integration-guide.md`](../javier-integration-guide.md)
