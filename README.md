# Small Goods Gym • Systems Architecture & Interactive Demo Suite

[![Live Demo Hub](https://img.shields.io/badge/Live%20Demo-6--Tab%20Suite-9aef0f?style=for-the-badge&logo=google-chrome&logoColor=black)](https://bulachak.github.io/small-goods-gym/live-demo-hub.html)
[![Goat AI Coach](https://img.shields.io/badge/Goat%20AI-Co--Pilot%20Prototype-4724ba?style=for-the-badge&logo=openai&logoColor=white)](https://bulachak.github.io/small-goods-gym/small-goods-coach-demo.html)
[![Brand Showcase](https://img.shields.io/badge/Brand%20Showcase-Webflow%20Tokens-f8ef8d?style=for-the-badge&logo=webflow&logoColor=black)](https://bulachak.github.io/small-goods-gym/index.html)

Sports technology architecture, tactile gym-floor interfaces, Soviet sports-science knowledge retrieval (FTS5 BM25), and biomechanical modeling built for **Small Goods Gym** (Morley, Perth, Western Australia).

---

## 🚀 Live Interactive Web Demos (1-Tap Mobile & Desktop)

All prototypes are hosted live on GitHub Pages and can be launched directly in any browser:

| Prototype | Live Hosted Link | Description | Local Source |
| :--- | :--- | :--- | :--- |
| **6-Tab Live Demo Hub** | [**Launch Live Demo Hub**](https://bulachak.github.io/small-goods-gym/live-demo-hub.html) | Complete 6-module gym-floor suite: tactile logger, Enode VBT speed tracking (`0.64 m/s`), biomechanical lever calculator, 12-platform capacity cap, NDIS analytics, Javier architecture handshake, and floating Goat AI widget (🐐). | [`live-demo-hub.html`](./live-demo-hub.html) |
| **Goat AI Co-Pilot** | [**Launch Goat AI Coach**](https://bulachak.github.io/small-goods-gym/small-goods-coach-demo.html) | Dedicated full-screen AI coaching companion speaking in Joel's warm, accessible voice. Employs the **Universal Progressive Disclosure Triad** (intuitive somatic cues for day-1 beginners, deep biomechanical torques & VBT for national competitors), Joel's 5 movement categories, and deterministic 90s triage. | [`small-goods-coach-demo.html`](./small-goods-coach-demo.html) |
| **Main Brand Showcase** | [**Launch Brand Showcase**](https://bulachak.github.io/small-goods-gym/index.html) | Webflow design token wall (Inch Worm `#9aef0f`, Purple Heart `#4724ba`, Sweet Corn `#f8ef8d`), typography trio (*Poppins*, *Roboto Mono*, *Reenie Beanie*), and responsive layouts. | [`index.html`](./index.html) |
| **Athlete Profile View** | [**Launch Athlete Profile**](https://bulachak.github.io/small-goods-gym/athlete-profile-preview.html) | Anthropometry card, leverage tags (long femurs / short torso), PB tracker, and biomechanical ratios. | [`athlete-profile-preview.html`](./athlete-profile-preview.html) |
| **Tactile Floor Logger** | [**Launch Floor Logger**](https://bulachak.github.io/small-goods-gym/workout-logger-preview.html) | Big-button tactile workout logging interface optimized for sweaty hands and high CNS fatigue. | [`workout-logger-preview.html`](./workout-logger-preview.html) |

---

## 🧠 Core System Capabilities

### 1. Goat AI Sports-Science Co-Pilot (Accessible Across All Levels)
- **Universal Progressive Disclosure Protocol:** Communicates equally comfortably with a day-one beginner who has never touched a barbell (plain-English sensory metaphors like *"settling into an armchair"* or *"ripping the newspaper between your feet"*) and a PhD biomechanist or national champion lifter (moment arms, $dF/dt$, $m/s$ velocity loss cutoffs).
- **The Small Goods Way Integration:** Fully implements Joel Mullen's 5 movement categories (*Range Adders*, *Co-ordinators*, *Accelerators*, *Force Builders*, *Volume Builders*) and fatigue-prevention session ordering sequences.
- **Strict Grounding:** Grounded in a 1,309-chunk indexed Soviet sports science knowledge base (Verkhoshansky, Zatsiorsky, Cleather, Mann, Issurin).
- **Deterministic 90-Second In-Session Triage:** Live floor decision tree for missed lifts (velocity decay $>15\%$ triggers immediate 5–7.5% load drop or session termination; structural pain $>3/10$ regresses to high-stability Range Adders and routes to Holly Hunt Physiotherapy).

### 2. Gym-Floor Tactile Interface
- Designed adhering to Fitts's Law, Hick's Law, and the Doherty Threshold (<400ms feedback).
- Big-button targets (minimum 64×64 dp) positioned for thumb-arc accessibility during fatigue.
- Direct Enode VBT speed sensor integration and 12-platform capacity cap enforcement.

### 3. Non-Invasive Integration with Javier's Production Stack
- Aligned directly with Javier's verified stack: **Expo (React Native)** on frontend, **Cloudflare Workers** (serverless edge), **Cloudflare D1 (SQLite)**, and **Clerk** authentication.
- Connects via a lightweight reverse proxy worker without modifying existing user auth or database tables.
- Architecture integration blueprint available in [`docs/09-javier-hardware-and-ai-integration-guide.md`](./docs/09-javier-hardware-and-ai-integration-guide.md).

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
├── docs/                           # Technical architecture & sports science blueprints
│   ├── 01-mobile-architecture...   # Mobile UX & Javier integration blueprint
│   ├── 02-gym-floor-ui...          # Gym floor tactile interface & VBT engine
│   ├── 06-biomechanical-dash...    # Anthropometric leverage diagnostic model
│   ├── 09-javier-hardware...       # Developer guide for Javier
│   ├── 13-arena-powerlifting...    # Arena powerlifting benchmark blueprint
│   ├── 16-the-small-goods-way...   # Joel Mullen coaching framework & AI architecture
├── expo-handover/                  # Production React Native (Expo) & Cloudflare D1 package
│   ├── components/                 # React Native UI (Goat AI, Levers, Logger, RSVP, Lifter Passport)
│   ├── worker/                     # Cloudflare Worker reverse proxy to Gemini
│   ├── database/                   # Cloudflare D1 SQLite relational schema
│   └── README.md                   # Step-by-step developer guide for Javier
├── rsvp-system/                    # 12-Platform RSVP & waitlist logic
└── tools/                          # RAG ingestion and benchmark tools
```
