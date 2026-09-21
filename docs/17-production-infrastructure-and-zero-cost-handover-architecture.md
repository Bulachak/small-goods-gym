# Small Goods Gym • Production Infrastructure & Zero-Cost Handover Architecture

**Document ID:** SGG-ARCH-007  
**Version:** 1.0.0 (Production Verified)  
**Date:** September 19, 2026  
**Status:** Approved & Handoff Ready  
**Authors:** Kamilla Gafurzianova, OLY ("Mila") & Sports Technology Architecture Team  
**Audience:** Joel Mullen (Founder & Head Coach), Javier Pereira (Lead Systems Developer), Kamilla Gafurzianova  

---

## Visual Architecture Assets

- **Vector SVG (Infinite Zoom / Mobile Retina Master):** [production-infrastructure-architecture.svg](./assets/production-infrastructure-architecture.svg)
- **Interactive Markdown Mermaid Source:** Fully rendered inline in [Section 2](#2-production-infrastructure--data-flow-architecture).

---

## 1. Executive Summary & Financial Boundary Demarcation

Following the September 18, 2026 technical alignment call between Joel Mullen, Javier Pereira, and Kamilla Gafurzianova, the production architecture was definitively decoupled from all external Google Cloud Run and Firebase prototype containers.

### The Zero-Cost Rule for Kamilla Gafurzianova:
- **Kamilla's Hosting & Infrastructure Bill:** **$0.00 / month (Zero recurring liability).**
- **Decommissioned Systems:** All temporary Cloud Run containers and Firebase Firestore instances utilized during the exploratory sports-science RAG phase are decommissioned. Kamilla does **not** host, run, or pay for any production services, databases, or API tokens.
- **Production Ownership:** Small Goods Gym and Javier Pereira assume 100% operational, technical, and financial ownership of the production stack. The entire bot engine, Joel's coaching philosophy, and real-time biomechanical triage rules have been compiled into a drop-in serverless package in [`expo-handover/`](../expo-handover/) running natively inside Javier's Cloudflare infrastructure.

---

## 2. Production Infrastructure & Data Flow Architecture

The following diagram defines the 4 core architectural tiers, the data flow, and the strict ownership/billing boundary:

```mermaid
flowchart TD
    %% -------------------------------------------------------------
    %% STYLING DIRECTIVES & COLOR CLASSES
    %% -------------------------------------------------------------
    classDef clientStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef workerStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef d1Style fill:#1e1b4b,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef geminiStyle fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#f8fafc;
    classDef zeroCostStyle fill:#3b0764,stroke:#c084fc,stroke-width:2px,color:#f8fafc,stroke-dasharray: 5 5;

    %% -------------------------------------------------------------
    %% TIER 1: CLIENT APPLICATION TIER (EXPO & CLERK)
    %% -------------------------------------------------------------
    subgraph TIER1 ["📱 1. Client Tier (Expo React Native: iOS, Android & Web)"]
        ATHLETE["🏋️ Lifter / Coach on Morley Gym Floor"]
        EXPO_APP["📱 Expo React Native Client (Javier's App)<br/>• GoatAICoPilot.tsx (Sports Science Chat Drawer)<br/>• BiomechanicalLeverHUD.tsx (Limb Ratio Diagnostic)<br/>• TactileFloorLogger.tsx (64px Touch Targets, VBT)<br/>• PlatformRSVPModal.tsx (12-Platform Enforcer)<br/>• LifterPassportCard.tsx (ArenaPL Meet Record)"]
        CLERK_AUTH["🔐 Clerk Authentication Provider<br/>• User Registration & Sessions<br/>• Bearer JWT Token Issuance<br/>• Billed to: Small Goods Gym"]
    end

    %% -------------------------------------------------------------
    %% TIER 2: SERVERLESS EDGE & TRANSACTIONAL STORAGE (CLOUDFLARE)
    %% -------------------------------------------------------------
    subgraph TIER2 ["☁️ 2. Production Edge & Storage Tier (Javier's Cloudflare Account)"]
        CF_ROUTER["🛡️ Cloudflare Edge Router & CORS<br/>• Endpoint: POST /api/chat<br/>• Sub-1ms Global TLS Termination"]
        CF_WORKER["⚡ Cloudflare Worker AI Proxy (`worker-chat-proxy.ts`)<br/>• Clerk Bearer JWT Verification<br/>• Athlete Anthropometry Context Injection<br/>• System Instruction: 'The Small Goods Way'<br/>• VBT Cutoff Monitoring (Decay > 15% Trigger)<br/>• Sports Science Citation & Triage Parser<br/>• Free Tier: 100,000 requests / day"]
        CF_D1[("🗄️ Cloudflare D1 SQLite Database (`schema-d1.sql`)<br/>• users (Clerk ID, Role, Status)<br/>• biometrics (GDPR-Isolated Measurements)<br/>• exercises & program_sets (VBT Logs)<br/>• events & 12-platform RSVPs<br/>• Free Tier: 5,000,000 reads / day")]
    end

    %% -------------------------------------------------------------
    %% TIER 3: INTELLIGENCE & INFERENCE (GOOGLE AI STUDIO)
    %% -------------------------------------------------------------
    subgraph TIER3 ["🧠 3. AI Inference Tier (Billed to Small Goods Gym)"]
        GEMINI_API["🤖 Google Gemini 2.5 Flash API<br/>• Model: gemini-2.5-flash:generateContent<br/>• Sub-800ms Time-to-First-Token (TTFT)<br/>• Conversational Progressive Disclosure Format"]
        SG_SECRET["🔑 Worker Secret: GEMINI_API_KEY<br/>• Generated in Joel's Google AI Studio Project<br/>• Bound via: wrangler secret put GEMINI_API_KEY<br/>• Billed to: Small Goods Gym Credit Card"]
    end

    %% -------------------------------------------------------------
    %% TIER 4: ADVISORY & ARCHITECT BOUNDARY (KAMILLA GAFURZIANOVA)
    %% -------------------------------------------------------------
    subgraph TIER4 ["🛑 4. Advisory & Architect Demarcation (Kamilla Gafurzianova)"]
        MILA_BOUNDARY["👤 Kamilla Gafurzianova, OLY (Sports Tech Architect)<br/>• Deliverables: React Native Code, Schemas, Prompts<br/>• Cloud Run & Firestore: DECOMMISSIONED<br/>• Ongoing Hosting & Token Cost: $0.00 / month"]
    end

    %% -------------------------------------------------------------
    %% DATA FLOW & INTERACTIONS
    %% -------------------------------------------------------------
    ATHLETE -->|"1. Inputs set or asks coaching question"| EXPO_APP
    EXPO_APP -->|"2. Authenticates user session"| CLERK_AUTH
    CLERK_AUTH -.->|"3. Issues Bearer JWT token"| EXPO_APP
    
    EXPO_APP ==>|"4. POST /api/chat (Header: Bearer JWT + Body)"| CF_ROUTER
    CF_ROUTER -->|"5. Dispatches request"| CF_WORKER

    CF_WORKER <-->|"6. Queries limb ratios / saves VBT set logs"| CF_D1
    SG_SECRET -.->|"7. Provides encrypted API key"| CF_WORKER
    
    CF_WORKER ==>|"8. Invokes Gemini 2.5 Flash with Grounded System Instruction"| GEMINI_API
    GEMINI_API -->|"9. Streams structured coaching reply"| CF_WORKER
    
    CF_WORKER -->|"10. Returns { reply, citations, triageAlert }"| EXPO_APP
    EXPO_APP -->|"11. Renders coaching cue & rest timer HUD"| ATHLETE

    MILA_BOUNDARY -.-x|"Zero active traffic / zero hosting liability"| TIER2

    %% -------------------------------------------------------------
    %% CLASS ASSIGNMENTS
    %% -------------------------------------------------------------
    class ATHLETE,EXPO_APP,CLERK_AUTH clientStyle;
    class CF_ROUTER,CF_WORKER workerStyle;
    class CF_D1 d1Style;
    class GEMINI_API,SG_SECRET geminiStyle;
    class MILA_BOUNDARY zeroCostStyle;
```

---

## 3. Infrastructure Ledger & Billing Accountability Matrix

Every production service is mapped directly to its billing account, free tier threshold, and financial owner. **Kamilla Gafurzianova's financial liability is explicitly zero across all layers.**

| Service / Resource | Purpose | Provider & Environment | Free Tier Allowance | Production Billing Owner | Kamilla's Monthly Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Mobile App Shell** | iOS & Android Member App | Expo Application Services (EAS) / App Store | Standard open-source Expo CLI | Small Goods Gym / Javier | **$0.00** |
| **Authentication** | User login, JWT sessions, roles | Clerk | 10,000 Monthly Active Users (MAU) | Small Goods Gym | **$0.00** |
| **AI Reverse Proxy** | Routes chat & executes VBT rules | Cloudflare Workers (`worker-chat-proxy.ts`) | 100,000 requests / day free | Small Goods Gym / Javier | **$0.00** |
| **Relational Database** | Users, PII-isolated biometrics, sets | Cloudflare D1 (SQLite - `schema-cloudflare-d1.sql`) | 5,000,000 reads / day free | Small Goods Gym / Javier | **$0.00** |
| **Media / Demonstration Storage** | Movement demo videos & lifter clips | Cloudflare R2 | 10 GB storage free | Small Goods Gym / Javier | **$0.00** |
| **LLM Inference** | Sports science coaching & triage | Google Gemini 2.5 Flash via AI Studio | 15 RPM / 1M TPM free tier; fractions of a cent thereafter | Small Goods Gym (Joel Mullen's account) | **$0.00** |
| **Legacy Cloud Run / Firestore** | Prototype development container | Google Cloud Platform | **DECOMMISSIONED** | **DECOMMISSIONED** | **$0.00** |

---

## 4. Architectural Component Deep Dive

### 4.1 Client Layer: Expo React Native (`expo-handover/components/`)
All mobile UI components are built using pure React Native and Expo primitives (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `TextInput`, `Modal`), requiring zero browser DOM dependencies:
1. **`GoatAICoPilot.tsx`:** Sports science co-pilot drawer with offline deterministic fast-path fallback and streaming chat interface.
2. **`BiomechanicalLeverHUD.tsx`:** 4-segment anthropometry diagnostic calculating joint moment arms and stance adjustments for femurs, torso, upper arm (humerus), and forearm (forelimb).
3. **`TactileFloorLogger.tsx`:** High-contrast gym-floor workout logger featuring $64\times64\text{ dp}$ touch targets, Enode/VBT speed logging ($m/s$), and automatic CNS fatigue alerts when bar velocity drops $>15\%$.
4. **`PlatformRSVPModal.tsx`:** Enforces Small Goods Gym's strict 12-platform capacity cap with automated waitlist queueing.
5. **`LifterPassportCard.tsx`:** Arena Powerlifting-style competitive passport featuring a visual 9-attempt accordion grid and IPF GL points tier ladder.

### 4.2 Serverless Edge Layer: Cloudflare Worker (`expo-handover/worker/worker-chat-proxy.ts`)
The Cloudflare Worker functions as the secure AI gateway:
- **CORS Handling:** Handles preflight `OPTIONS` and permits cross-origin requests from the Expo app on mobile and web.
- **Clerk JWT Verification:** Inspects incoming `Authorization: Bearer <token>` headers to guarantee requests originate from authenticated Small Goods members.
- **Biomechanical Prompt Grounding:** Automatically binds the member's limb ratios (`femurToTorsoRatio`, `forearmToArmRatio`, `leverageTags`) into the prompt.
- **Ingestion of "The Small Goods Way":** Hardcodes Joel Mullen's 5 movement categories (*Range Adders $\to$ Co-ordinators $\to$ Accelerators $\to$ Force Builders $\to$ Volume Builders*), MED grinder limits, and the Universal Conversational Accessibility Protocol.
- **VBT Alert Parsing:** Detects velocity drop keywords and returns structured programmatic alerts (`triageAlert: { type: 'drop_load', action: 'Drop load 5%-7.5%' }`).

### 4.3 Database Layer: Cloudflare D1 (`expo-handover/database/schema-cloudflare-d1.sql`)
An 8-table relational SQLite schema hosted entirely within Javier's Cloudflare account:
- **Strict PII Separation:** Personally identifiable information (`users`) is decoupled from physical measurements (`biometrics`).
- **Automated Anonymization Trigger:** SQLite trigger `trg_anonymize_member_biometrics` wipes millimetric limb lengths when a member transitions to hiatus or archived status, preserving non-identifiable categorical tags (`["long_femur"]`) for gym-wide biomechanical modeling.

---

## 5. Javier's Deployment Runbook (Zero-Friction Setup)

Javier can deploy the complete AI backend to his Cloudflare account in under 3 minutes:

### Step 1: Clone or Copy the Handover Package
```bash
cd expo-handover/worker
```

### Step 2: Configure the Secret (Billed to Small Goods)
Joel or Javier generates an API key in [Google AI Studio](https://aistudio.google.com/) using Small Goods Gym's Google account:
```bash
npx wrangler secret put GEMINI_API_KEY
# Enter Small Goods Gym's Gemini API key when prompted
```

### Step 3: Deploy the Worker to Javier's Cloudflare Account
```bash
npx wrangler deploy
```
*The Worker is now live at `https://<javier-subdomain>.workers.dev/api/chat` or mapped to `https://api.smallgoodsgym.com.au/api/chat`.*

### Step 4: Execute the D1 Database Schema
```bash
cd ../database
npx wrangler d1 execute small_goods_d1 --file=./schema-cloudflare-d1.sql
```

### Step 5: Connect Expo Components
In the Expo mobile project:
```tsx
import { GoatAICoPilot } from './components/GoatAICoPilot';

<GoatAICoPilot
  visible={isChatOpen}
  onClose={() => setIsChatOpen(false)}
  apiEndpoint="https://api.smallgoodsgym.com.au/api/chat"
  clerkToken={sessionToken}
  athleteProfile={{
    name: user.displayName,
    femurToTorsoRatio: 1.15,
    forearmToArmRatio: 0.92,
    leverageTags: ['Long Femurs', 'Long Forearms'],
  }}
/>
```

---

## 6. Verification & Decommissioning Sign-Off

1. **Client Isolation:** The mobile app never contains API keys, database credentials, or secret tokens.
2. **Serverless Scalability:** Cloudflare Workers and D1 require zero container orchestration, zero patch management, and zero idle server costs.
3. **Financial Protection:** Kamilla Gafurzianova has zero billing accounts attached to the production Small Goods Gym runtime.
