# Small Goods Gym • Technical Documentation & System Blueprints

Welcome to the central technical documentation and sports science blueprints for **Small Goods Gym** (Morley, Perth, Western Australia).

This documentation hub covers the mobile UI architecture, tactile gym-floor logging interfaces, anthropometric lever diagnostics, non-invasive Cloudflare integration for Javier, and the 1,309-chunk sports science knowledge base grounded in Joel Mullen's coaching methodology.

---

## 🚀 Live Interactive Web Prototypes

You can test every prototype directly on your phone or desktop in any browser:

| Prototype | Live Hosted Link | Description |
| :--- | :--- | :--- |
| **Canonical 6-Tab Suite** | [**Launch Web App**](https://bulachak.github.io/small-goods-gym/index.html) | Full 6-module gym-floor suite: tactile logger, 5-segment lever lab, 12-platform capacity cap, NDIS analytics, Javier architecture handshake, and floating Goat AI drawer. |
| **Goat AI Co-Pilot** | [**Launch Goat AI Coach**](https://bulachak.github.io/small-goods-gym/small-goods-coach-demo.html) | Fullscreen AI coaching companion speaking in Joel's warm, accessible voice. Grounded in *The Small Goods Way* 5 movement categories and deterministic 90s triage. |
| **Athlete Profile View** | [**Launch Athlete Profile**](https://bulachak.github.io/small-goods-gym/athlete-profile-preview.html) | Anthropometry card, leverage tags (long femurs / short torso), PB tracker, and biomechanical ratios. |
| **Tactile Floor Logger** | [**Launch Floor Logger**](https://bulachak.github.io/small-goods-gym/workout-logger-preview.html) | Big-button tactile workout logging interface replacing pinch-and-zoom Google Sheets on the gym floor. |

---

## 🧭 Documentation Roadmap

### 1. Executive Handover & Architecture Overview
* [**19-javier-architecture-review-and-d1-schema-reconciliation.md**](./19-javier-architecture-review-and-d1-schema-reconciliation.md)  
  *Technical review of Javier Pereira's architecture brief (`SGApp Architecture Overview.pdf`), live D1 `users` table audit, R2 vs Stream storage strategy, and non-breaking schema reconciliation.*
* [**SGApp Architecture Overview.pdf**](./SGApp%20Architecture%20Overview.pdf)  
  *Original PDF architecture overview received from Joel Mullen on behalf of Javier Pereira (September 22, 2026).*
* [**18-joel-javier-production-handover-and-partnership-letter.md**](./18-joel-javier-production-handover-and-partnership-letter.md)  
  *Executive handover letter, production asset ledger, zero-cost operational structure ($0/mo), and partnership framework.*
* [**17-production-infrastructure-and-zero-cost-handover-architecture.md**](./17-production-infrastructure-and-zero-cost-handover-architecture.md)  
  *End-to-end production architecture topology, free-tier resource allocation, latency targets (<15ms local cache), and deployment verification steps.*

---

### 2. Lead Systems Developer Guides (For Javier)
* [**09-javier-hardware-and-ai-integration-guide.md**](./09-javier-hardware-and-ai-integration-guide.md)  
  *Primary developer guide: Non-invasive 3-tier architecture, Clerk JWT verification in Cloudflare Workers, Cloudflare D1 (SQLite) schema, and reverse proxy routing.*
* [**17-production-infrastructure-and-zero-cost-handover-architecture.md**](./17-production-infrastructure-and-zero-cost-handover-architecture.md)  
  *End-to-end production architecture topology, free-tier resource allocation, latency targets (<15ms local cache), and deployment verification steps.*
* [**01-mobile-architecture-and-mvp-roadmap.md**](./01-mobile-architecture-and-mvp-roadmap.md)  
  *Mobile architecture principles, thumb-reach target ergonomics (64x64 dp), and the February 2027 MVP milestone roadmap.*
* [**02-gym-floor-ui-and-vbt-architecture.md**](./02-gym-floor-ui-and-vbt-architecture.md)  
  *Gym floor UI state machines, Enode VBT speed sensor ingestion, and tactile button design.*
* [**03-docker-deployment-and-sheets-migration.md**](./03-docker-deployment-and-sheets-migration.md) & [**04-data-migration-pipeline-and-audit-metrics.md**](./04-data-migration-pipeline-and-audit-metrics.md)  
  *Automated migration scripts for moving legacy Google Sheets athlete logs into structured SQLite/D1 tables.*
* [**05-phase-1-database-seeding-and-coach-strategy.md**](./05-phase-1-database-seeding-and-coach-strategy.md)  
  *Initial database seed routines for exercise libraries, movement categories, and platform configurations.*

---

### 3. Coaching Framework & Athlete Experience (For Joel)
* [**16-the-small-goods-way-coaching-framework-and-ai-architecture.md**](./16-the-small-goods-way-coaching-framework-and-ai-architecture.md)  
  *Full synthesis of Joel Mullen's coaching system: The 5 movement categories (Range Adders, Co-ordinators, Accelerators, Force Builders, Volume Builders), session ordering rules, and the Universal Progressive Disclosure Triad.*
* [**06-biomechanical-dashboard-and-leverage-analysis.md**](./06-biomechanical-dashboard-and-leverage-analysis.md)  
  *5-segment anthropometric lever lab (femur, torso, forearm, upper arm, shoulder width), moment arm calculations, and squat stance optimization.*
* [**13-arena-powerlifting-benchmark-and-lifter-passport-blueprint.md**](./13-arena-powerlifting-benchmark-and-lifter-passport-blueprint.md)  
  *Lifter passport blueprint: attempt cards, meet preparation tracking, and rank progression.*
* [**14-parafencing-and-small-goods-gamification-blueprint.md**](./14-parafencing-and-small-goods-gamification-blueprint.md)  
  *Adaptive sports integration, inclusive strength progression, and community engagement models.*

---

### 4. Sports Science Engine & Multilingual Ingestion
* [**07-advanced-sports-science-and-vbt-reference-dossier.md**](./07-advanced-sports-science-and-vbt-reference-dossier.md)  
  *Comprehensive scientific dossier: Yuri Verkhoshansky (Supertraining), Vladimir Zatsiorsky (Science and Practice of Strength Training), Dr. Dan Cleather (Force), Dr. Bryan Mann (VBT), and Vladimir Issurin (Block Periodization).*
* [**08-knowledge-base-architecture-and-vector-eval.md**](./08-knowledge-base-architecture-and-vector-eval.md)  
  *SQLite FTS5 BM25 search architecture, chunking benchmarks, retrieval latency (<15ms), and precision evaluation.*
* [**10-russian-and-multilingual-source-ingestion-and-rag-playbook.md**](./10-russian-and-multilingual-source-ingestion-and-rag-playbook.md)  
  *Multi-stage text ingestion and translation pipeline for Russian sports science source texts.*
* [**11-whatsapp-bot-architecture-and-deployment-guide.md**](./11-whatsapp-bot-architecture-and-deployment-guide.md)  
  *Production deployment guide for Meta WhatsApp Cloud API and Twilio webhooks for platform booking and triage.*

---

## 📦 Drop-In React Native Package

A complete, production-ready Expo (React Native) package matching this architecture is available directly in the repository under [`expo-handover/`](../expo-handover/):

* **UI Components:** [`expo-handover/components/`](../expo-handover/components/) (Tactile Floor Logger, Biomechanical Lever HUD, Goat AI Co-Pilot, Platform RSVP Modal, Lifter Passport Card).
* **Cloudflare Worker Proxy:** [`expo-handover/worker/worker-chat-proxy.ts`](../expo-handover/worker/worker-chat-proxy.ts) (Lightweight edge proxy to Gemini with athlete context injection).
* **Database Schema:** [`expo-handover/database/schema-cloudflare-d1.sql`](../expo-handover/database/schema-cloudflare-d1.sql) (SQLite D1 schema for athletes, 12-platform reservations, logs, and biomechanics).
* **Developer README:** [`expo-handover/README.md`](../expo-handover/README.md) (Step-by-step setup guide for Javier).

---

*Authored by: Kamilla Gafurzianova, OLY*  
*Sports Technology Systems Architect • Head Coach, USA Parafencing National Team*
