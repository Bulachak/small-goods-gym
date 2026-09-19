# Small Goods Gym • Interactive Waitlist & Progress Tracker UI Specification
**Document ID:** `SGG-SPEC-UI-002`  
**Target Component:** [`waitlist-progress-bar.tsx`](./waitlist-progress-bar.tsx)  
**Stakeholders:** Joel Mullen (Head Coach), Holly Hunt (Physiotherapy), Javier Pereira (Lead Systems Developer)  
**Design System Reference:** [`design.md`](../design.md) (Neo-Brutalist High Performance)  

---

## 1. Overview & Human-Computer Interaction (HCI) Principles

The **Waitlist Progress Bar & Position Tracker UI** manages platform reservations, capacity thresholds, and waitlist queues under real-world athletic training conditions.

The component incorporates five foundational HCI principles:
1. **Fitts's Law (Thumb-Zone Ergonomics):** High-fatigue training reduces fine-motor dexterity. The primary 1-tap action button spans the full width of the mobile interface and is anchored within the natural lower-third sweeping arc of the user's thumb.
2. **Doherty Threshold (Sub-200ms State Transitions):** All reservation interactions trigger immediate visual and haptic state transitions within **200 milliseconds** (`navigator.vibrate` on web / Expo Haptics on mobile), eliminating double-tap confusion.
3. **Progressive Disclosure & Hick's Law:** Complex database state is simplified into an intuitive dual-state visual capacity gauge.
4. **Postel's Law (Offline Synchronization Engine):** When network dead-zones occur, client actions are optimistically confirmed and queued locally, automatically synchronizing once connectivity is restored.
5. **Biomechanical Safety Interception:** Automated blocking of athletes with active physical rehabilitation flags.

---

## 2. Visual Capacity State Machine

```mermaid
stateDiagram-v2
    [*] --> OpenCapacity: Event Created (0/12)
    
    state OpenCapacity {
        description: Emerald Gradient (1-11 Attendees)
        action: 1-Tap Instant Reservation
    }

    OpenCapacity --> AtCapacity: 12th Athlete Confirms
    
    state AtCapacity {
        description: Solid Gold Badge (12/12 Platforms Full)
        action: Waitlist Activation
    }

    AtCapacity --> WaitlistActive: 13th+ Athlete RSVPs
    
    state WaitlistActive {
        description: Coral / Orange Gradient (Queue Position #1, #2, ...)
        action: Incremental FIFO Waitlist Placement
    }

    WaitlistActive --> OpenCapacity: Active Attendee Cancels (FIFO Auto-Promotion)
    AtCapacity --> OpenCapacity: Active Attendee Cancels (Platform Opens)
    WaitlistActive --> WaitlistActive: Waitlisted Athlete Withdraws (Positions Decrement)
```

---

## 3. UI States & Color Palette Mapping

The component adheres strictly to Small Goods Gym's Neo-Brutalist design tokens:

| Capacity State | Attendees / Cap | Gauge Visual Style | Badge Text & Label |
| :--- | :--- | :--- | :--- |
| **Open** | 1 to 11 / 12 | Smooth Emerald Gradient (`#9aef0f` to `#2ea043`) | `"Platforms Available (X open)"` |
| **Full** | Exactly 12 / 12 | High-Contrast Butter Yellow (`#f8ef8d`) | `"Session Full • 12/12 Platforms"` |
| **Waitlisted** | > 12 | Warning Coral / Orange (`#e95766` to `#ff7849`) | `"Waitlist Active • Position #X"` |
| **Offline** | Any (No Signal) | Muted Slate with Pulse Badge (`#6e7681`) | `"Offline • Queued Locally"` |

---

## 4. Interactive Simulation Controls

Built into [`waitlist-progress-bar.tsx`](./waitlist-progress-bar.tsx) for developer demonstration and stakeholder review:
- **"Gym Dead-Zone" Simulator Toggle:** Simulates cellular disconnects to demonstrate offline optimistic UI rendering and asynchronous synchronization.
- **"Trigger Cancellation" Button:** Simulates an active attendee releasing their platform, demonstrating instantaneous auto-promotion of the next waitlisted lifter.
- **"Toggle Physio Restriction" Button:** Simulates an athlete with an active joint injury flag, demonstrating the interception modal.

---

## 5. Mobile & Web Integration

The component is written in modular TypeScript and Tailwind CSS, and maps directly to the React Native equivalent in [`expo-handover/components/PlatformRSVPModal.tsx`](../expo-handover/components/PlatformRSVPModal.tsx).
