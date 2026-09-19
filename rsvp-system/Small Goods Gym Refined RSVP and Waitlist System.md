# Small Goods Gym • 12-Platform Capacity & Waitlist System Specification
**Document ID:** `SGG-SPEC-RSVP-001`  
**Target Facility:** Small Goods Gym (Morley, Perth, WA)  
**Stakeholders:** Joel Mullen (Head Coach), Holly Hunt (Physiotherapy), Javier Pereira (Lead Systems Developer)  
**Core Components:** [`refined-rsvp-system.tsx`](./refined-rsvp-system.tsx) • [`refined-rsvp-backend-v2.py`](./refined-rsvp-backend-v2.py) • [`refined-rsvp-migration.sql`](./refined-rsvp-migration.sql)  

---

## 1. Operational Context & Gym Floor Constraints

Small Goods Gym operates under specific physical, coaching, and clinical boundaries that distinguish it from mass-market fitness facilities:
1. **Strict 12-Platform Capacity Cap:** Head coach Joel Mullen enforces a strict 12-lifter limit per barbell session to guarantee uncompromised 1-on-1 coaching oversight.
2. **Holly Hunt Biomechanical Care Gateway:** Athletes flagged with active rehabilitation restrictions or acute joint-shear risk are systematically protected from booking contraindicated sessions.
3. **Gym-Floor Network Dead-Zones:** Low-signal basement/gym areas require robust offline action queuing so lifters can RSVP without UI freezes.
4. **Automated FIFO Waitlist Management:** When an active attendee cancels, the system atomically promotes the next waitlisted lifter without manual coach intervention.

---

## 2. System Architecture & Component Flow

```mermaid
flowchart TD
    subgraph MobileClient["Athlete Mobile Client (Expo / PWA)"]
        UI["12-Platform RSVP Card<br/>(Fitts's Law 64dp Button)"]
        OfflineQueue["Offline Action Queue<br/>(IndexedDB / AsyncStorage)"]
        PhysioCard["Physio Care Warning Modal<br/>(Injury Restriction Alert)"]
    end

    subgraph EdgeAPI["API Gateway Router"]
        Router["RSVP Endpoint Router<br/>(POST / DELETE /api/v1/events/rsvp)"]
        RehabCheck{"Athlete Has Active<br/>Injury Flag?"}
        OverrideCheck{"Coach / Athlete<br/>Override Submitted?"}
        CapCheck{"Current Attendees<br/>< 12 Platforms?"}
    end

    subgraph DataTier["Relational Storage (Cloudflare D1 / SQLite)"]
        T_Events["events (12-Platform Limit)"]
        T_RSVP["event_rsvps (Status: attending)"]
        T_Waitlist["event_rsvps (Status: waitlisted, Position #)"]
        Trigger["trg_waitlist_fifo_promotion<br/>(Atomic Auto-Elevation on Cancel)"]
    end

    UI -->|1-Tap RSVP| Router
    UI -.->|Network Disconnected| OfflineQueue
    OfflineQueue -.->|Connection Restored| Router

    Router --> RehabCheck
    RehabCheck -->|Yes| OverrideCheck
    OverrideCheck -->|No| PhysioCard
    OverrideCheck -->|Yes (Logged)| CapCheck
    RehabCheck -->|No| CapCheck

    CapCheck -->|Yes (< 12)| T_RSVP
    CapCheck -->|No (>= 12)| T_Waitlist

    T_RSVP -->|Attendee Cancels| Trigger
    Trigger -->|Pop Next in Queue| T_RSVP
```

---

## 3. Architectural Highlights

### A. Holly Hunt's Biomechanical Care Gateway
In adherence to sports-science safety standards, an athlete's physical welfare supersedes class capacity:
- **Interception:** When an athlete attempts to RSVP for a session with high joint-shear demands (e.g., *Olympic Weightlifting: Clean & Jerk*), the backend inspects their `athlete_profiles` record.
- **Guardrail:** If an active injury flag is detected, the API returns a `403 Forbidden` with a detailed `physio_warning` payload.
- **Resolution:** The UI displays a high-contrast Physio Care Warning card. The athlete or coach must explicitly review Holly's clinical notes and submit an `override_rehab_warning=True` parameter to proceed, creating an immutable audit trail.

### B. Offline Mobile Queueing (Doherty Threshold & Postel's Law)
- **Sub-250ms Response:** Tapping "RSVP" triggers immediate optimistic UI state transitions with haptic confirmation (`navigator.vibrate` / Expo Haptics), keeping interaction latency well beneath the 400ms Doherty Threshold.
- **Offline Resiliency:** Under network failure, actions are serialized into an offline local queue. The application displays an "Offline - Queued" badge and automatically replays requests when connectivity is restored.

### C. Database-Level FIFO Promotion Trigger
Queue management is enforced at the database layer to guarantee atomic consistency and prevent race conditions:
- When an attendee cancels their reservation, an internal trigger (`trg_waitlist_fifo_promotion`) immediately activates.
- The earliest queued record (`status = 'waitlisted'`, ordered by `queue_position ASC`) is promoted to `status = 'attending'`.
- All subsequent waitlist positions are decremented by 1.

---

## 4. Component Manifest

| Component File | Role & Technology |
| :--- | :--- |
| [`refined-rsvp-system.tsx`](./refined-rsvp-system.tsx) | Complete React interactive prototype with real-time state simulator, dead-zone toggles, and Physio Care Warning modal. |
| [`refined-rsvp-backend-v2.py`](./refined-rsvp-backend-v2.py) | API router implementing Pydantic validation, injury checks, 12-platform capacity enforcement, and clean error handling. |
| [`refined-rsvp-migration.sql`](./refined-rsvp-migration.sql) | Relational migration script adding `queue_position`, `rehab_warning_overridden`, and automated FIFO triggers. |
| [`refined-rsvp-test-suite.py`](./refined-rsvp-test-suite.py) | Automated 7-test suite validating the entire lifecycle in under 0.1 seconds. |
