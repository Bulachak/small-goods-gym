# Small Goods Gym — Joel Mullen Call Prep & Executive Briefing
**Call Date & Time:** Monday, September 14 at 8:00 PM Pacific Time (11:00 AM Tuesday, AWST - Perth)  
**Zoom Target:** Joel Mullen (`joel@smallgoodsgym.com`)  
**Prepared For:** Kamilla  

---

## 1. Executive Summary & Strategic Positioning

Joel Mullen is the founder and head coach of **Small Goods Gym** in Morley, Perth. He runs a boutique strength, powerlifting, and athletic rehabilitation facility alongside **Holly Hunt** (Competitive Powerlifter, Olympic Weightlifter, and Physiotherapist).

Small Goods is unique because it blends elite strength culture with **NDIS Capacity Building** (unregistered provider for Plan-Managed and Self-Managed participants) and objective clinical testing (**Activforce 2 Dynamometer** for isometric peak force/ROM and **Enode Accelerometer** for velocity-based training).

### Your Unique Positioning on the Call
- You are **not** an agency salesperson pitching mockups.
- You are a **Sports Technology Architect** with an Olympic and Paralympic/adaptive sports background.
- You understand his coaching philosophy, his clinical workflow with Holly, and his NDIS compliance pressures.
- You are presenting **working, tested software** that respects and integrates with the backend security groundwork built by his developer, **Javier**.

---

## 2. Joel's Original Audio Brief Decoded

| What Joel Said / Shared | The Real Root Problem / Anxiety | How You Address It on the Call |
| :--- | :--- | :--- |
| **"Javier built a backend shell (auth, user tables, security) but we have no real frontend UI."** | Fear of sunk cost, dev conflict, or missing his **February launch** deadline. | *"Javier did the heavy lifting on security. We built a decoupled client that talks directly to his auth tokens. He doesn't have to rewrite a single line."* |
| **"WhatsApp groups for events, competitions, and RSVP are chaotic."** | Group chats cause notification fatigue, lost signups, and no capacity caps for platform sessions. | Show the **RSVP & Waitlist UI** (12-spot platform cap, offline sync, 1-tap booking, auto-promotion). |
| **"I want clean program delivery and PB tracking with video demonstrations."** | Lifters struggle on the gym floor trying to read complex spreadsheets while sweating and fatigued. | Show the **Gym-Floor Mobile Logger** (single-card Hick's Law, 64px Fitts tap targets, instant Vimeo embed, sub-400ms feedback). |
| **"Long term, I want to track limb lengths, leverages, and VBT bar velocity for an AI co-pilot."** | Joel wants to differentiate Small Goods from generic commercial gym apps with genuine biomechanical science. | Show the **Biomechanical Dashboard** (femur/torso sliders, dynamic `#Long Femurs` tag, and Holly Hunt's clinical gateway). |

---

## 3. The 30-Minute Call Agenda & Narrative Arc

### 00:00 – 05:00 | Re-grounding & Rapport
- Re-ground the conversation in his Morley gym culture and his collaboration with Holly.
- Reassure him immediately about Javier: *"I know you've got Javier working on auth and user management. Everything we built is designed to plug right into his groundwork."*

### 05:00 – 15:00 | Live Prototype Walkthrough (Screen Share)
- **Demo 1:** Gym-Floor Mobile Logger (`workout-logger-preview.html`)
- **Demo 2:** Biomechanical Coach & Physio Dashboard (`athlete-profile-preview.html`)
- **Demo 3:** RSVP & Platform Waitlist Architecture

### 15:00 – 22:00 | NDIS, Clinical Rehab & Adaptive Athletics
- Connect his Activforce 2 dynamometer and Enode accelerometer usage with automated NDIS Plan Manager reporting.
- Position the app as a tool to protect and renew participant funding.

### 22:00 – 27:00 | Technical Handoff for Javier
- Explain the decoupled JWT handshake: Javier stays in charge of auth; FastAPI handles analytics and VBT.
- Reference the Developer Integration Guide (`javier-integration-guide.md`).

### 27:00 – 30:00 | Next Steps & February Roadmap
- Agree to send Javier the technical integration spec.
- Confirm Phase 1 focus: Gym-Floor Logger + RSVP/Waitlist for February rollout.

---

## 4. Live Demo Walkthrough Playbook (Click-by-Click)

### Demo 1: Gym-Floor Mobile Logger (`workout-logger-preview.html`)
*Open in mobile view (or narrow browser window).*

1. **The Frame:** *"Athletes on the floor have sweaty hands and central nervous system fatigue. We eliminated spreadsheet clutter by focusing on three ergonomic rules: 64px tap targets, showing only one movement at a time, and sub-400ms instant feedback."*
2. **Action 1:** Tap **`+2.5kg`** or **`+5kg`**. Show instant weight adjustment without typing on a soft keyboard.
3. **Action 2:** Tap **`Complete Set 1`**. Point out the immediate green confirmation state and the automatic rest-timer countdown.
4. **Action 3:** Highlight the **embedded demonstration video** directly above the set inputs. Lifters never leave the app to check movement standards.
5. **Action 4:** Scroll down to the **VBT Velocity Simulator**. Show how velocity decay below 0.75 m/s alerts the lifter before form breakdown occurs.

### Demo 2: Biomechanical Leverage & Coach Profile (`athlete-profile-preview.html`)
*Open in full desktop view.*

1. **The Frame:** *"Every lifter has different femur-to-torso proportions. A lifter with long femurs cannot squat the same way as someone with short femurs. Here is how your coaching eye is digitized."*
2. **Action 1:** Drag the **Femur Length slider to 48 cm** and **Torso Length to 42 cm**.
3. **Action 2:** Watch the ratio calculate live (1.14).
4. **Action 3:** Point out the dynamic badges: `#Long Femurs`, `#High Hip Squat`, `#Short Torso`.
5. **Action 4:** Review the **AI Biomechanical Directives**: stance recommendations, low-bar placement, and hip-hinge focus.
6. **Action 5:** Scroll to the **Holly Hunt Clinical Review Gateway**: show how athlete pain flags (e.g., lumbar tenderness) route directly into Holly’s physio triage queue with anthropometric data attached.

---

## 5. The Javier Handshake: Technical Architecture & Schemas

### Why Javier Will Love This Architecture
- **Zero Sunk Cost:** Javier’s auth shell, user management, and security roles remain 100% authoritative.
- **Decoupled JWT Flow:** The Next.js client authenticates with Javier's backend, receives a standard JWT bearer token, and forwards it to the FastAPI microservice.
- **Independent Velocity:** Frontend updates and sports science algorithms can evolve rapidly without risking Javier’s core database.

### The 5 Database Schema Tables Ready for Deployment
1. `athlete_profiles`: Height, femur length, torso length, arm span, auto-calculated leverage tags (linked to Javier’s `user_id`).
2. `exercises`: Movement categories, mechanical tags (`quad_dominant`, `hip_hinge`), and video demonstration links.
3. `workout_sessions`: Scheduled sessions, completion status, coach notes, and athlete subjective feedback.
4. `exercise_logs`: Granular set-by-set weight, reps, RPE (1–10), and accelerometer velocity ($m/s$).
5. `personal_bests`: Automatically aggregated historical records across all major lifts.

---

## 6. The NDIS & Adaptive Athletics Strategy (Your Secret Weapon)

Small Goods Gym is an **Unregistered NDIS Provider** delivering **Evidence-Based Capacity Building** for Plan-Managed and Self-Managed participants.

### The Problem Small Goods Faces
Plan Managers and Support Coordinators are required by the NDIA to show **measurable functional outcomes** to justify continuing participant funding. Traditional clinics rely on passive massage tables; Small Goods delivers real functional independence, fall prevention, and strength.

### How Our Software Solves This
1. **1-Click Audit-Ready Capacity Building Reports:**
   - Automatically exports peak force gains from the **Activforce 2 Dynamometer**.
   - Pulls velocity and power output metrics from the **Enode Accelerometer**.
   - Packages functional movement progress into a clean PDF ready for NDIA plan reviews.
2. **Carer / Support Coordinator Read-Only Portal:**
   - Gives plan managers direct access to progress metrics without Joel or Holly spending hours on manual paperwork.
3. **Adaptive Movement Presets:**
   - Built-in accommodation flags for seated/wheelchair lifting, grip-assist accessories, and unilateral variations.

### Killer Questions to Ask Joel on the Call
1. *"Joel, on the NDIS side, how many hours a week do you and Holly spend writing manual progress summaries for Plan Managers?"*
2. *"Are your Activforce 2 dynamometer and Enode accelerometer numbers currently living in separate silos from your workout logs?"*
3. *"When an NDIS plan review comes up, what specific evidence makes a Plan Manager immediately approve the next round of funding?"*
4. *"For lifters like 'P' or neuro-divergent athletes, does Holly track sensory or autonomic fatigue thresholds alongside physical RPE?"*

---

## 7. 1-Page On-Screen Call Cheat Sheet

```
================================================================================
           SMALL GOODS GYM CALL CHEAT SHEET (JOEL MULLEN)
================================================================================
TIME: Monday 8:00 PM PT (11:00 AM Tuesday Perth) | EMAIL: joel@smallgoodsgym.com
PARTNERS: Joel Mullen (Head Coach), Holly Hunt (Physio/Coach), Javier (Backend Dev)

CORE OBJECTIVE:
Show working software. Build trust. Prove seamless Javier integration. Position
Small Goods as the benchmark in strength, biomechanics, and NDIS capacity building.

--------------------------------------------------------------------------------
OPENING (2 mins):
"Joel, I looked at your setup in Morley, your work with Holly, and your NDIS athletes.
Javier built solid auth security. Today I'll show you the frontend and biomechanics
engine we built to sit on top of his work so you hit your February target."

DEMO SEQUENCE (10 mins):
1. workout-logger-preview.html -> 64px Fitts touch targets, single-movement card,
   inline video, sub-400ms haptic confirmation, VBT velocity dropoff.
2. athlete-profile-preview.html -> Femur/Torso sliders, ratio > 1.10 = #LongFemurs,
   AI coaching cue adjustments, Holly Hunt clinical injury interceptor.
3. RSVP System -> 12-spot platform cap, auto-waitlist, offline gym dead-zone queue.

JAVIER HANDSHAKE:
- Decoupled JWT Bearer Tokens: Javier authenticates, our PWA passes the token.
- No backend rewrite: Javier's user and permission tables stay 100% intact.
- Python FastAPI microservice handles VBT, limb leverage math, and progression.

NDIS / CLINICAL HOOKS (Hardware: Activforce 2 + Enode):
- Problem: Plan Managers need objective proof of Capacity Building for plan reviews.
- Solution: 1-click audit-ready PDF export showing peak force & functional gains.
- Kamilla Advantage: High-performance Olympic/Paralympic adaptive architecture.

KILLER QUESTIONS TO DROP:
- "How much time do you and Holly spend typing manual progress reports for Plan Managers?"
- "Are your Activforce 2 and Enode numbers currently siloed from your workout logs?"
- "What evidence makes a Plan Manager instantly say 'yes' to renewing funding?"

CLOSE & NEXT STEPS:
- Send Javier 'javier-integration-guide.md' for a 5-minute technical review.
- Lock in Phase 1 scope: Gym-floor logger + RSVP/Waitlist for February rollout.
================================================================================
```
