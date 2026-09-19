# Small Goods Gym • Systems Architecture & Interactive Demo Suite

[![Live Demo Hub](https://img.shields.io/badge/Live%20Demo-6--Tab%20Suite-9aef0f?style=for-the-badge&logo=google-chrome&logoColor=black)](https://bulachak.github.io/small-goods-gym/live-demo-hub.html)
[![Goat AI Coach](https://img.shields.io/badge/Goat%20AI-Co--Pilot%20Prototype-4724ba?style=for-the-badge&logo=openai&logoColor=white)](https://bulachak.github.io/small-goods-gym/small-goods-coach-demo.html)
[![Brand Showcase](https://img.shields.io/badge/Brand%20Showcase-Webflow%20Tokens-f8ef8d?style=for-the-badge&logo=webflow&logoColor=black)](https://bulachak.github.io/small-goods-gym/index.html)
[![Client Drive](https://img.shields.io/badge/Google%20Drive-Client%20Deliverables-4285f4?style=for-the-badge&logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1o7D7GksP6ble-piJuJAAgRSNLIK_7SVZ?usp=sharing)

Sports technology architecture, tactile gym-floor interfaces, Soviet sports-science knowledge retrieval (FTS5 BM25), and biomechanical modeling built for **Small Goods Gym** (Morley, Perth, Western Australia).

---

## 🚀 Live Interactive Web Demos (1-Tap Mobile & Desktop)

All prototypes are hosted live on GitHub Pages and can be launched directly in any browser:

| Prototype | Live Hosted Link | Description | Local Source |
| :--- | :--- | :--- | :--- |
| **6-Tab Live Demo Hub** | [**Launch Live Demo Hub**](https://bulachak.github.io/small-goods-gym/live-demo-hub.html) | Complete 6-module gym-floor suite: tactile logger, Enode VBT speed tracking (`0.64 m/s`), biomechanical lever calculator, 12-platform capacity cap, NDIS analytics, Javier architecture handshake, and floating Goat AI widget (🐐). | [`live-demo-hub.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/live-demo-hub.html) |
| **Goat AI Co-Pilot** | [**Launch Goat AI Coach**](https://bulachak.github.io/small-goods-gym/small-goods-coach-demo.html) | Dedicated full-screen AI coaching companion speaking in Joel's voice (*"G'day! Let's get to work"*), running deterministic 90-second missed-lift triage and Verkhoshansky / Zatsiorsky / Cleather citations. | [`small-goods-coach-demo.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/small-goods-coach-demo.html) |
| **Main Brand Showcase** | [**Launch Brand Showcase**](https://bulachak.github.io/small-goods-gym/index.html) | Webflow design token wall (Inch Worm `#9aef0f`, Purple Heart `#4724ba`, Sweet Corn `#f8ef8d`), typography trio (*Poppins*, *Roboto Mono*, *Reenie Beanie*), and responsive layouts. | [`index.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/index.html) |
| **Athlete Profile View** | [**Launch Athlete Profile**](https://bulachak.github.io/small-goods-gym/athlete-profile-preview.html) | Anthropometry card, leverage tags (long femurs / short torso), PB tracker, and biomechanical ratios. | [`athlete-profile-preview.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/athlete-profile-preview.html) |
| **Tactile Floor Logger** | [**Launch Floor Logger**](https://bulachak.github.io/small-goods-gym/workout-logger-preview.html) | Big-button tactile workout logging interface optimized for sweaty hands and high CNS fatigue. | [`workout-logger-preview.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/workout-logger-preview.html) |
| **NDIS Evidence Pack** | [**Launch NDIS Pack**](https://bulachak.github.io/small-goods-gym/NDIS_Clinical_Evidence_Pack_Participant_P.html) | Clinical mobility scorecards, range-of-motion metrics, and report generator for support coordinators. | [`NDIS_Clinical_Evidence_Pack_Participant_P.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/NDIS_Clinical_Evidence_Pack_Participant_P.html) |
| **Executive Briefing** | [**Launch Executive Briefing**](https://bulachak.github.io/small-goods-gym/Joel_Call_Prep_and_Executive_Briefing.html) | Executive call preparation, meeting debrief, and technical specifications. | [`Joel_Call_Prep_and_Executive_Briefing.html`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/Joel_Call_Prep_and_Executive_Briefing.html) |

---

## 📁 Shared Cloud Deliverables

- **Client Deliverables Google Drive:** [Open Client Folder](https://drive.google.com/drive/folders/1o7D7GksP6ble-piJuJAAgRSNLIK_7SVZ?usp=sharing)
- **Project Archive Google Drive:** [Open Archive Folder](https://drive.google.com/drive/folders/1oYHlfjHvNT6LrcAKzKySbHAUHqUdLM1G?usp=drive_link)

---

## 🧠 Core System Capabilities

### 1. Goat AI Sports-Science Co-Pilot
- Grounded in a 1,309-chunk indexed Soviet sports science knowledge base (Verkhoshansky, Zatsiorsky, Cleather, Mann, Issurin).
- Deterministic 90-second triage protocol for missed lifts (velocity drop >15% triggers load reduction or set termination).
- Biomechanical torque analysis for long-femur lifters (Cleather stance scaling, moment arms, low-bar placement).

### 2. Gym-Floor Tactile Interface
- Designed adhering to Fitts's Law, Hick's Law, and the Doherty Threshold (<400ms feedback).
- Big-button targets (minimum 64×64 dp) positioned for thumb-arc accessibility during fatigue.
- Direct Enode VBT speed sensor integration and 12-platform capacity cap enforcement.

### 3. Non-Invasive Integration with Javier's Production Stack
- Aligned directly with Javier's verified stack: **Expo (React Native)** on frontend, **Cloudflare Workers** (serverless edge), **Cloudflare D1 (SQLite)**, and **Clerk** authentication.
- Connects via a lightweight reverse proxy worker without modifying existing user auth or database tables.
- Full debrief and schema boundary specification available at [`docs/15-joel-javier-mila-technical-alignment-and-architecture-debrief-2026-09-18.md`](file:///c:/Users/kamil/PROJECTS/small-goods-gym/docs/15-joel-javier-mila-technical-alignment-and-architecture-debrief-2026-09-18.md).

### 4. WhatsApp Bot Gateway
- Direct webhook endpoints for Meta WhatsApp Cloud API and Twilio Sandbox.
- Allows lifters to check platform availability, reserve training slots, or receive set triage directly in WhatsApp.

---

## 🛠️ Repository Directory Guide

```text
small-goods-gym/
├── live-demo-hub.html              # 6-Tab flagship interactive operating hub
├── small-goods-coach-demo.html     # Fullscreen Goat AI Coach companion prototype
├── index.html                      # Brand token wall & architecture showcase
├── athlete-profile-preview.html    # Athlete profile & anthropometry preview
├── workout-logger-preview.html     # Tactile workout logger floor preview
├── NDIS_Clinical_Evidence_Pack...  # Clinical mobility evidence generator
├── Joel_Call_Prep_and_Executive... # Executive briefing HTML
├── docs/                           # 15 comprehensive technical & scientific specifications
│   ├── 01-mobile-architecture...   # Mobile UX & Javier integration blueprint
│   ├── 09-javier-hardware...       # Developer guide for Javier
│   ├── 12-joel-mullen-exec...      # Executive follow-up and demo package
│   ├── 15-joel-javier-mila-tech... # 3-Way technical alignment debrief & architecture roadmap
│   └── markdown_books/             # Digitized Soviet sports science library
├── rsvp-system/                    # 12-Platform RSVP & waitlist logic
└── tools/                          # RAG ingestion and benchmark tools
```
