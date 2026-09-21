# Small Goods Gym • Developer Handover Package for Javier

**From:** Kamilla Gafurzianova, OLY & Team  
**To:** Javier Pereira (Lead Systems Developer, Small Goods Gym)  
**Date:** September 19, 2026  
**Context:** Prepared following our 3-way technical alignment call with Joel Mullen. Built specifically to match your verified production stack: **Expo (React Native)**, **Cloudflare Workers**, **Cloudflare D1 (SQLite)**, and **Clerk**.

---

## 📦 What Is Inside This Handover Package

This directory contains production-ready, drop-in assets designed to integrate seamlessly with your existing architecture without disrupting your authentication, permissions, or database foundation:

```text
expo-handover/
├── assets/                         # Production icons & logo (favicon.png, icon.png, adaptive-icon.png, logo.png)
├── components/
│   ├── index.ts                    # Unified barrel export for all mobile components
│   ├── GoatAICoPilot.tsx           # React Native Expo Chat Drawer & Quick-Triage HUD
│   ├── BiomechanicalLeverHUD.tsx   # 5-segment anthropometry calculator (femur, torso, forearm, upper arm, shoulder width)
│   ├── TactileFloorLogger.tsx      # Big-button floor workout logger with VBT speed inputs
│   ├── PlatformRSVPModal.tsx       # 12-platform capacity cap & waitlist queue modal
│   └── LifterPassportCard.tsx      # ArenaPL-style Lifter Passport with 9-attempt accordion & tier badges
├── worker/
│   ├── worker-chat-proxy.ts        # Cloudflare Worker reverse proxy to Google Gemini API
│   └── wrangler.toml               # Cloudflare Worker configuration & D1 binding
└── database/
    └── schema-cloudflare-d1.sql    # 8-table relational SQLite schema for Cloudflare D1
```

---

## 🚀 1. Integrating the React Native Components into Expo

All 5 components in `components/` are built using pure React Native and Expo primitives (`View`, `Text`, `TouchableOpacity`, `ScrollView`, `TextInput`, `Modal`). They require **zero DOM dependencies** and render cleanly on web, iOS, and Android.

### A. `GoatAICoPilot.tsx` (AI Assistant)
- **What it does:** Full-screen modal or drawer containing the sports-science co-pilot.
- **Props:**
  ```tsx
  <GoatAICoPilot
    visible={isChatOpen}
    onClose={() => setIsChatOpen(false)}
    apiEndpoint="https://api.smallgoodsgym.com.au/api/chat"
    clerkToken={sessionToken} // JWT from Clerk
    athleteProfile={{
      name: user.displayName,
      femurToTorsoRatio: 1.02,
      forearmToArmRatio: 0.88,
      shoulderWidthCm: 44,
      leverageTags: ['Long Femurs', 'Long Forearms'],
    }}
  />
  ```
- **Fallback:** If `apiEndpoint` is omitted, it automatically runs an offline deterministic triage engine (useful for local dev and patchy gym floor Wi-Fi).

### B. `BiomechanicalLeverHUD.tsx` (Anthropometric Diagnostic)
- **What it does:** Implements Joel's expanded 5-segment leverage model:
  - **Femurs & Torso:** Squat depth, stance width ($1.3\times$ biacromial breadth), sagittal moment arm.
  - **Forearm (Forelimb) & Upper Arm (Humerus):** Bench press touch point, elbow flexion, shoulder torque, clean front-rack angle.
  - **Shoulder Width (Biacromial Breadth):** Dan Cleather $1.6\times$ biacromial bench grip prescription for vertical forearms at chest touch.
  - **Ape Index:** Deadlift starting hip height and back angle.
- **Props:**
  ```tsx
  <BiomechanicalLeverHUD
    initialMeasurements={athleteBiometrics}
    onSave={(measurements, directives) => saveToD1(measurements)}
  />
  ```

### C. `TactileFloorLogger.tsx` (Gym-Floor Logger)
- **What it does:** Replaces clunky Google Sheets spreadsheets on the platform with fast 1-tap logging.
- Features $64\times64\text{ dp}$ touch targets, `-5kg`/`+2.5kg` modifiers, Enode VBT speed inputs (`m/s`), automated CNS fatigue warnings when bar speed drops >15%, and a 90-second countdown rest timer.

### D. `PlatformRSVPModal.tsx` (12-Platform Management)
- **What it does:** Enforces Small Goods' strict **12-platform capacity cap**.
- Visual grid of Platforms 1 through 12, 1-tap booking/release, and automated priority waitlist queue when all 12 spots are filled.

### E. `LifterPassportCard.tsx` (ArenaPL Lifter Passport)
- **What it does:** Implements the esports-grade athlete hero card and competitive record tracker inspired by Arena Powerlifting:
  - Visual 9-attempt accordion grid with green/red pills and attempt spread analytics (+kg).
  - IPF GL Points to Tier Ladder mapping (Diamond, Platinum, Gold, Silver 1–3, Bronze).
  - SBD Proportion Bar (Squat/Bench/Deadlift balance).
  - Career trophy case (medals and titles).
  - 1-tap viral Instagram Story Card export.

---

## ⚡ 2. Deploying the Cloudflare Worker AI Proxy

The script `worker/worker-chat-proxy.ts` allows the Expo app to talk to Google Gemini securely without exposing API keys on the mobile client:

1. Navigate to the worker directory:
   ```bash
   cd expo-handover/worker
   ```
2. Set your Gemini API key as a Cloudflare Worker secret:
   ```bash
   npx wrangler secret put GEMINI_API_KEY
   ```
   *(Enter Joel / Small Goods Gym's Google AI Studio API key when prompted. All token costs are billed directly to Small Goods Gym's account; Kamilla's hosting cost is strictly $0.00. Detailed architecture: [Doc 17](../docs/17-production-infrastructure-and-zero-cost-handover-architecture.md)).*
3. Deploy to your Cloudflare account:
   ```bash
   npx wrangler deploy
   ```
4. The worker exposes `POST /api/chat`, verifies the incoming Clerk `Authorization: Bearer <token>` header, injects the athlete's leverage context, and returns structured sports-science coaching responses with author/book citations.

---

## 🗄️ 3. Cloudflare D1 Relational Schema

The file `database/schema-cloudflare-d1.sql` contains the 8 core relational SQLite tables we aligned on:

1. `users`  -  Synced with Clerk (`clerk_user_id`, `email`, `role`, `membership_status`).
2. `biometrics`  -  **Strictly isolated from users for GDPR & California PII compliance.** Holds millimetric limb lengths, ratios, and categorical lever tags.
3. `exercises`  -  Exercise movement patterns, video URLs, and cues.
4. `user_programs`  -  12-week macrocycle and block tracking.
5. `program_sets`  -  Prescribed vs. logged load, reps, and Enode VBT velocities.
6. `events` & `event_rsvps`  -  12-platform sessions and community RSVP management.
7. `competition_records`  -  Historical and OpenPowerlifting meet records with 9-attempt breakdown.
8. `trophy_case`  -  Medals, state/national championships, and podium finishes.

### Privacy & Anonymization Trigger:
An automated SQLite trigger (`trg_anonymize_member_biometrics`) is included. When a member's `membership_status` transitions to `'hiatus'` or `'archived'`, all exact limb measurements in `biometrics` are wiped to `NULL`, while preserving non-identifiable categorical lever tags (`["long_femur"]`) for gym-wide biomechanical modeling.

### Applying to Cloudflare D1:
```bash
npx wrangler d1 execute small_goods_d1 --file=./database/schema-cloudflare-d1.sql
```

---

## 📱 4. How Joel's New Call Requirements Were Incorporated

1. **Upper Limb & Forearm Anthropometry:** Extended the kinematics engine to calculate bench press shoulder rotation, deadlift arm-hang height, and Olympic clean front-rack clearance using forearm and upper arm segments.
2. **Coaching Philosophy Grounding:** The Worker's system prompt is configured to ingest Joel's gym-floor cues, standards, and philosophy as soon as he shares his notes.
3. **12-Platform Limit:** Hardcoded platform array bounded by 12 slots with automatic overflow into the waitlist queue.
4. **Data Isolation:** Complete decoupling between PII (`users`) and physical metrics (`biometrics`).

---

## 🤝 5. Ongoing Communication

We have established the **Small Goods App WhatsApp group (`SG app`)** for rapid, lightweight check-ins, eliminating the friction of cross-timezone Zoom scheduling.

If you have any questions or want any tweaks to the component props or styling tokens, ping Kamilla directly in the WhatsApp group!
