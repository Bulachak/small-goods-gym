# USA Parafencing & Small Goods Gym • ArenaPL Benchmark & Social Gamification Blueprint
**Document ID:** SGG-PF-ANALYSIS-002  
**Date:** September 16, 2026  
**Author:** Kamilla Gafurzianova, OLY & Antigravity (Google DeepMind Agentic Systems)  
**Stakeholders:** Kamilla Gafurzianova (Head Coach, USA Parafencing; Systems Architect), Joel Mullen (Small Goods Gym), Javier (Lead Systems Developer)  
**Live Google Doc:** https://docs.google.com/document/d/14ZbEJfbYG7nTJlIamFcYBEoxbJ3CPvX-aSG0SzRtGH4/edit  
**Live Master Google Sheet (5 Tabs):** https://docs.google.com/spreadsheets/d/1tHwWUHzROzQ5VsLkuUPJt8eC7KEQwG7yIgZmtdNELQI/edit  

---

## 1. Strategic Cross-Pollination Thesis
The athlete profile architecture from **Arena Powerlifting** ([arenapowerlifting.com](https://arenapowerlifting.com/u/amie-culverson-3096a8e764f1)) forwarded by Joel Mullen solves the exact visual, psychological, and storytelling challenges faced in the **USA Parafencing Road to LA28** application (`C:\Users\kamil\PROJECTS\parafencing-project`).

Traditional sports databases (OpenPowerlifting in strength, FIE/Ophardt in fencing) are sterile administrative spreadsheets. By adopting ArenaPL's **esports gamification**, **9-attempt/bout timeline accordions**, **clutch forensics**, and **1-click viral Instagram Story generators**, we elevate Team USA adaptive athletes into celebrated heroes, create immense athlete retention, and build an automated organic sponsor acquisition engine for the Road to LA28.

---

## 2. The Gamification Layer: Road to LA28 Tier Ladder
Arena Powerlifting successfully converted abstract IPF GL points (e.g. 76.93) into a recognizable tier badge (*"Silver 2"*). In USA Parafencing, world rankings and qualification points are often opaque to athletes and sponsors.

We establish a formal, gamified **LA28 Competitive Ladder** within `AthleteProfileView.tsx`:
1. **Diamond Tier:** World Rank 1–4 • Direct Paralympic Quota Holder
2. **Platinum Tier:** World Rank 5–8 • Active Quota Contender (Podium Candidate)
3. **Gold Tier:** World Rank 9–16 • World Cup Direct Elimination Core
4. **Silver Tier:** World Rank 17–32 / Top 3 USA • National Team Core
5. **Bronze Tier:** Domestic Circuit / Grassroots • 2032 Runway

---

## 3. Bout Forensics vs. Powerlifting Attempt Analytics
- **The 14-14 Priority Touch (The 3rd Attempt Make Rate Analog):**
  `Clutch Win Rate (%) = (Bouts Won at 14-14 / Total Bouts Reaching 14-14) * 100`
- **The 9-Attempt Accordion vs. Pool & DE Bout Matrix:**
  Expandable green (V) and red (D) pills showing 5-touch pool cards with touch indicator (`Ind`) and 15-touch DE progression.
- **Period 2 Adjustment Delta:**
  Measures whether an athlete gained or lost ground after the 1-minute break, providing a quantitative score for tactical coachability.
- **Tactical Action Distribution Bar:**
  Analog to SBD lift proportions, showing % touches scored via Attack on Prep vs. Parry-Riposte vs. Counter-Attack vs. Remise.

---

## 4. The Viral Social Media Engine: 1-Click Story Card Generator
Five tailor-made card templates for USA Parafencing:
1. **World Cup Podium Alert (9:16 Story)**
2. **Road to LA28 Quota Tracker (9:16 Story & 1:1 Feed)**
3. **Bout Day Matchup & Result Card (1:1 Feed & 16:9 Landscape)**
4. **Athlete Strip Passport / Digital Trading Card (4:5 Portrait)**
5. **Career Milestone & Personal Record Alert (9:16 Story)**

Strict brand standards:
- WCAG AAA contrast (white text on Navy `#131F48` >= 13:1).
- Mandatory crisp white backing on weapon illustrations (per `DESIGN.md` line 24).
- Single-line invariant on badges and buttons.
- Official fencing notation: W, V, D, TS, TR, Ind.

---

## 5. Technical Implementation Plan in `usa-parafencing-road-to-la28`
- `<AthleteHeroPassport />` component in `src/components/AthleteProfileView.tsx`
- `<TrophyCabinet />` component mapping `recentCompetitions` medals
- `<BoutTimelineAccordion />` mapping pool and DE rounds
- `<SocialStoryModal />` using client-side HTML5 Canvas for zero-latency mobile sharing.
