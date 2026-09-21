# Small Goods Gym: Backend Integration & AI Engine Handshake Guide

**Target Audience:** Javier (Backend Lead), Kamilla Gafurzianova (Sports Tech Architect), Joel Mullen (Founder)  
**Context:** Preparation for 3-Way Technical Alignment Call (Friday, Sep 19, 2026 @ 21:30 PT / Saturday, Sep 20, 2026 @ 12:30 AWST)  
**Target Milestone:** February 2027 Production MVP Launch  
**Document ID:** `SGG-DOC-09-JAVIER-INTEGRATION`  
**Date:** September 15, 2026  
**Created By:** Kamilla Gafurzianova, OLY (Sports Technology Systems Architecture)

---

## 1. Executive Summary & Partnership Philosophy

Javier has dedicated over three years to architecting the core infrastructure for Small Goods Gym, establishing robust foundations across authentication, user roles, billing, and edge routing. 

The purpose of this guide is to establish a **zero-friction, decoupled integration contract** between Javier's existing backend and the new high-performance client interfaces and AI co-pilot:
1. **Respect Existing Work:** Javier should **not** have to rewrite his database schemas, refactor his Cloudflare Workers, or adopt Python or vector database operations.
2. **Clear Separation of Concerns:** Transactional user/membership state remains in Javier's domain. AI sports science retrieval, computer vision kinematics, and conversational RAG run as an autonomous, self-contained microservice.
3. **Stateless API & JWT Handshake:** Communication occurs over clean, strongly-typed REST and WebSocket contracts secured by standard JWT bearer tokens verified via public JWKS or shared secret.
4. **Resilient Gym-Floor Offline Fast-Path:** Athletes lifting on the platform cannot wait 3 seconds or fail because of spotty gym WiFi. Deterministic session triage runs client-side in under 5ms, escalating to cloud RAG only for deep queries.

---

## 2. The 3-Tier System Topology

```mermaid
flowchart TD
    subgraph Client["Client Interfaces (Expo / React Native)"]
        A["Gym-Floor Logger & Set Tracker (`TactileFloorLogger.tsx`)"]
        B["Biomechanical Leverage HUD (`BiomechanicalLeverHUD.tsx`)"]
        C["Goat AI Co-Pilot Modal (`GoatAICoPilot.tsx`)"]
    end

    subgraph Auth["Authentication Boundary (Clerk)"]
        D["Clerk JWT Authentication"]
    end

    subgraph Javier["Javier's Platform (Cloudflare Serverless)"]
        E["Cloudflare Worker API Gateway"]
        F[("Cloudflare D1 (SQLite Database)")]
        G["Cloudflare R2 (Video Demonstration Storage)"]
        E <--> F
        E <--> G
    end

    subgraph AI["Sports Science & AI Engine"]
        H["Goat AI Proxy Worker (`worker-chat-proxy.ts`)"]
        I["Google Gemini 2.5 / Flash API"]
        J["Soviet Sports Science FTS5 Knowledge Base"]
        H <--> I
        H <--> J
    end

    Client -- "1. Clerk Session Token" --> Auth
    Client -- "2. Bearer JWT / CRUD" --> E
    Client -- "3. Authenticated POST /api/chat" --> H
    H -- "4. Read Biometrics (Isolated)" --> F
```

### Responsibility Matrix

| Responsibility Domain | Tier 1: Javier's Backend | Tier 2: AI & CV Engine | Tier 3: Client PWA |
| :--- | :--- | :--- | :--- |
| **Authentication & Auth0/JWT** | **Primary Owner** (Issues & Signs) | Verifies via JWKS / PubKey | Stores in secure storage |
| **User & Billing Records** | **Primary Owner** (Stripe & DB) | Read-only user metadata | Renders account UI |
| **Prescribed Workouts & Blocks** | **Primary Owner** (Storage & CRUD) | Context for AI cues | Local cache for offline sets |
| **Soviet Sports Science Knowledge** | None (Zero maintenance) | **Primary Owner** (FTS5 / SQLite) | Offline golden rules |
| **VBT Kinematics & CV Ingestion** | Stores summarized aggregates | **Primary Owner** (Calculations) | Captures 240fps video |
| **Live Chat & Natural Language** | Proxies / routes endpoint | **Primary Owner** (RAG Orchestration)| Interactive chat window |

---

## 3. Authentication Handshake (Stateless JWT Verification)

To ensure Javier does not need to build custom endpoints for the AI engine, the AI Engine validates requests using **standard JWT Bearer Tokens** already issued by Javier's Cloudflare Worker authentication layer.

### Verification Flow

```mermaid
sequenceDiagram
    autonumber
    actor Athlete as Athlete (PWA)
    participant CF as Javier's Cloudflare Worker
    participant DB as Cloudflare D1 (SQLite)
    participant AI as Cloudflare Worker AI Proxy

    Athlete->>CF: POST /api/auth/login (credentials)
    CF->>DB: Validate user & subscription
    DB-->>CF: Validated (role: member, tier: active)
    CF-->>Athlete: Return JWT (Signed with RS256 private key)

    Note over Athlete,AI: Gym Floor Session Active
    Athlete->>AI: POST /api/v1/chat (Bearer JWT + Athlete Context)
    AI->>CF: GET /.well-known/jwks.json (Cached public key)
    AI->>AI: Verify JWT signature & expiration (Zero DB lookup)
    AI-->>Athlete: 200 OK (Grounded Coaching Response + Citations)
```

### JWT Claims Specification

Javier's auth payload should include standard claims with optional athlete metadata in the claims payload:

```json
{
  "iss": "https://auth.smallgoodsgym.com",
  "sub": "usr_948271048",
  "aud": "https://api.smallgoodsgym.com",
  "iat": 1726700000,
  "exp": 1726786400,
  "role": "athlete",
  "gym_id": "small_goods_morley",
  "athlete_profile": {
    "first_name": "Marcus",
    "leverage_tag": "long_femurs",
    "femur_torso_ratio": 1.28,
    "active_block": "Transmutation",
    "primary_coach": "Joel Mullen"
  }
}
```

If Javier prefers a lightweight token containing only `sub` and `role`, the AI Engine can optionally fetch the athlete's leverage profile via an internal micro-call:
`GET https://api.smallgoodsgym.com/api/internal/athletes/{id}/biomechanics`
using an `X-Internal-Service-Key`.

---

## 4. REST & WebSocket API Contracts

### A. Conversational & Triage Endpoint: `POST /api/v1/chat`

Handles both deterministic quick-triage chips and deep sports science queries.

#### Request Headers
```http
POST /api/v1/chat HTTP/1.1
Host: ai.smallgoodsgym.com
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Payload
```json
{
  "message": "I missed two snatches at 85kg. What should I adjust?",
  "conversation_history": [
    { "role": "user", "content": "Set 3 was 85kg x 1 (made)" },
    { "role": "assistant", "content": "Clean bar path, mean velocity 1.52 m/s." }
  ],
  "session_context": {
    "exercise": "Snatch",
    "prescribed_weight_kg": 85.0,
    "current_set": 5,
    "consecutive_misses": 2,
    "recent_bar_velocity_m_s": [1.48, 1.28, 1.15],
    "velocity_drop_pct": 22.3
  }
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "reply_text": "According to the Small Goods triage protocol: (1) Your bar velocity has dropped by 22.3% (from 1.48 m/s to 1.15 m/s), indicating acute central nervous system fatigue. Drop the load by 5-7.5% (to 77.5kg-80kg) immediately to preserve technical motor patterns. (2) Remember Verkhoshansky's rule: all power starts and ends with the legs. Do not rush the second pull with your arms.",
  "matched_faq": {
    "id": "faq-missed-lift",
    "category": "Session Triage"
  },
  "literature_citations": [
    {
      "author": "Yuri Verkhoshansky",
      "title": "Special Strength Training: A Practical Manual for Coaches",
      "page_num": 91,
      "snippet": "Fatigue causes immediate alterations in the force-time characteristics of explosive movements..."
    }
  ],
  "recommended_modifications": {
    "load_reduction_kg": 5.0,
    "suggested_next_weight_kg": 80.0,
    "rest_interval_seconds": 180,
    "flag_coach_review": false
  },
  "suggested_actions": [
    "Drop to 80kg for next set",
    "Take 3-minute recovery rest",
    "View Long Femurs Snatch Cue",
    "Flag set for Joel review"
  ]
}
```

---

### B. VBT Plate Kinematics Ingestion: `POST /api/v1/telemetry/vbt`

Receives automated computer vision tracking data derived from the standard 450mm IWF bumper plate invariant:

#### Request Payload
```json
{
  "athlete_id": "usr_948271048",
  "session_id": "ses_20260915_001",
  "set_number": 4,
  "exercise": "Snatch",
  "load_kg": 85.0,
  "tracking_method": "cv_450mm_plate",
  "metrics": {
    "plate_diameter_pixels": 342.5,
    "scale_factor_mm_per_pixel": 1.3138,
    "mean_concentric_velocity_m_s": 1.42,
    "peak_velocity_m_s": 1.89,
    "horizontal_displacement_drift_mm": 24.5,
    "catch_height_displacement_mm": 890.2,
    "velocity_loss_from_first_rep_pct": 6.5
  },
  "raw_trajectory_points": [
    { "frame": 1, "t_ms": 0, "x_mm": 0.0, "y_mm": 0.0 },
    { "frame": 12, "t_ms": 100, "x_mm": 4.2, "y_mm": 180.5 }
  ]
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "status": "processed",
  "vbt_zone": "Accelerative Strength",
  "fatigue_flag": false,
  "biomechanical_verdict": "Optimal trajectory. Horizontal drift within acceptable <35mm tolerance for lifters with long femurs."
}
```

---

### C. Vertical Jump Flight-Time Ingestion: `POST /api/v1/telemetry/jump`

Calculates jump height and reactive strength index (RSI) using high-FPS flight-time physics ($h = \frac{1}{8} g t^2$):

#### Request Payload
```json
{
  "athlete_id": "usr_948271048",
  "video_fps": 240,
  "takeoff_frame_index": 482,
  "landing_frame_index": 624,
  "flight_time_seconds": 0.5916,
  "jump_type": "Countermovement Jump (CMJ)"
}
```

#### Response Payload (HTTP 200 OK)
```json
{
  "flight_time_ms": 591.6,
  "calculated_height_cm": 42.92,
  "flight_physics_formula": "h = 1.22625 * (0.5916)^2 = 0.4292m",
  "percentile_vs_baseline": "+3.4%",
  "readiness_state": "GREEN_PRIMED"
}
```

---

## 5. Cloudflare Workers Proxy / Gateway Pattern

Javier can integrate the AI service into his existing Cloudflare environment without CORS friction using a simple 10-line reverse proxy route on his domain:

```typescript
// cloudflare-worker-router.ts
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Route AI & Coaching requests to the containerized concierge engine
    if (url.pathname.startsWith('/api/v1/coach') || url.pathname.startsWith('/api/v1/telemetry')) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = env.AI_ENGINE_BACKEND_HOST; // e.g., sgg-ai-engine.fly.dev or gcp cloud run
      
      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow',
      });

      return fetch(modifiedRequest);
    }

    // Default: Javier's existing Cloudflare D1 / auth handlers
    return handleStandardRequest(request, env);
  }
};
```

**Benefits of this setup:**
1. **Single Origin:** The PWA connects exclusively to `api.smallgoodsgym.com`. Zero CORS cross-origin complexities.
2. **Edge Security:** Cloudflare's DDoS protection, Web Application Firewall (WAF), and SSL termination cover both services simultaneously.
3. **Zero Maintenance for Javier:** The AI engine maintains its own SQLite knowledge base and Docker container.

---

## 6. Proposed Agenda for Friday 3-Way Alignment Call

**Date & Time:** Friday, September 19, 2026 @ 21:30 PT / Saturday, September 20 @ 12:30 AWST  
**Dial-in:** Google Meet (provided by Joel)  
**Duration:** 45 Minutes  

| Time | Duration | Topic | Goal / Output |
| :--- | :--- | :--- | :--- |
| **00:00 – 00:05** | 5 min | Welcome & Strategic Context | Joel recaps gym-floor priorities and community breakfast momentum. |
| **00:05 – 00:15** | 10 min | Interactive UI & Goat AI Demo | Kamilla walks through gym-floor PWA logger, leverage card, and literature search in action. |
| **00:15 – 00:30** | 15 min | Technical Architecture & Auth Review | Javier reviews Section 3 (JWT verify) and Section 5 (Cloudflare proxy route). Agree on payload contracts. |
| **00:30 – 00:40** | 10 min | Telemetry & Database Schema Alignment | Decide where anthropometric ratios (`#LongFemurs`) and monthly VBT aggregates live. |
| **00:40 – 00:45** | 5 min | Next Steps & February 2027 Feature Freeze | Set milestone dates for staging integration and field testing. |

---

*Authored by: Kamilla Gafurzianova, OLY*
