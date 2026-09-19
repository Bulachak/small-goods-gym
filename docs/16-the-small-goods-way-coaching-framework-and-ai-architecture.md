# The Small Goods Way • Coaching Framework & AI Architecture
**Document ID:** `SGG-DOC-COACHING-001`  
**Author:** Joel Mullen (Founder & Head Coach, Small Goods Gym) & Kamilla Gafurzianova, OLY  
**Target Applications:** Goat AI Co-Pilot, React Native Floor Logger, Cloudflare Worker Prompt Engine  
**Date:** September 19, 2026  

---

## 1. Training Philosophy

Training the Small Goods Way means understanding two foundational principles deeply and simply:

1. **Good training starts with seeing the person in front of you and creating an environment full of opportunities to develop.**  
2. **Good training ends with the standards set and expectations kept. No amount of help will help you if you don’t work for it and work to a high standard.**

### The Yin and Yang of Small Goods Gym
We balance compassion and uncompromising athletic rigor through these commitments:

1. **No development worth having happens quickly or without sacrifice.**  
2. **We must make the training environment enjoyable enough to continue turning up long enough to see clear transformations in strength.**  
3. **We must see the people in our care clearly and give them opportunities to communicate with us so that we have an accurate read on their training situation.**  
4. **We assume the right person, given the right opportunities in the right environment, will do the right thing for their development as often as they can.**  
5. **We challenge people when that assumption doesn't hold true, in a manner appropriate for their situation.**  
6. **We give people good work to do and stand alongside them throughout the process to catalyze growth.**  
7. **We balance care and understanding with the discipline and interests of a person’s "best version of self" in mind.**

---

## 2. Training Methodology

The Small Goods method of strength progression hinges around four pillars:

1. **Range:** Having access to the necessary range of motion (ROM) for an exercise.
2. **Force Production:** Being able to produce sufficient force throughout that complete range.
3. **Rate of Force Development (RFD):** Producing force rapidly relative to the time constraints of the task.
4. **Coordination:** Coordinating force expression in the necessary time window within an efficient motor pattern.

---

## 3. Core Tenets (Physics & Biomechanical Principles)

1. **Force, Mass, and Impulse:** We are a biological body acting within physical time and space. Movement occurs when a net force changes an object's velocity over time. Change in velocity is dictated by impulse ($\mathbf{J} = \int \mathbf{F} \, dt$). To maximize athletic outcome, we manipulate applied force ($\mathbf{F}$), system mass ($m$), and time window ($dt$).
2. **Structural Basis for Force:** Muscle contractions generate force, tendons transfer force, and rigid bones act as levers. Maximizing physical outcomes requires:
   - Sufficient muscle cross-sectional area (CSA).
   - Tendons adapted to handle high strain and transfer forces efficiently.
   - Bone density and structural alignment capable of resisting high forces.
3. **Neuromuscular Drive:** Muscle contraction force depends on high-threshold motor unit (HTMU) recruitment and discharge rates (rate coding). Generating large neural drive requires meeting optimal starting conditions: adequate systemic recovery, low joint pain, and maximal psychological intent.
4. **RFD vs. Max Velocity:**
   - **Accelerations / RFD:** Producing maximum force in minimum time against moderate-to-heavy loads.
   - **Max Velocity / Speed:** Contractions occurring at extremely high contraction speeds, often at lower loads or via overspeed/assisted conditions.
5. **Efficiency and Variation:** Efficient movement minimizes energy leaks and optimizes joint leverage. While individual anatomical variations dictate unique mechanics, high force production and RFD only transfer to performance when channeled through an efficient motor strategy.
6. **Mind-Body Integration:** The human mind governs physical execution. Mentality, perception of effort, and belief directly influence motor output, rate coding, and movement quality.

---

## 4. Key Values

- **Become a Stronger ‘You’:** Reshaping lives by pushing for physical, emotional, psychological, and social strength.
- **Extending Comfort Zones:** Understanding and welcoming discomfort as a primary vehicle for growth.
- **Be More Yourself:** Being a safe home for a "misfit" community where all are welcomed, encouraged to be who they are, and inspired to grow alongside peers like them.
- **Find the Joy in Caring:** We give a little more not because we have to, but because it’s how we improve and where we find happiness.
- **Look for Answers Together:** We face many problems as we push for growth. Rather than adding to those problems, we search for answers and include others in our search.

---

## 5. How We Solve Physical Problems

### A. Hypertrophy & Density Constraints
Muscle growth relies on recruiting high-threshold motor units (HTMUs) near failure or under high intent:
- **Lengthened-State Bias:** We prioritize loading muscle groups at longer muscle lengths (e.g., hamstrings, quads, triceps) where stretch-mediated hypertrophy mechanisms are strongest. We do not force lengthened-bias loading on muscle architectures that do not benefit from it.
- **Time Efficiency:** For clients constrained by time, we deploy high-density protocols (Myo-rep sets, Giant sets).
- **Speed Interference Protection:** High-volume, slow, proximity-to-failure training creates central and local fatigue that interferes with velocity adaptations. We use a **Minimum Effective Dose (MED)** for high-fatigue hypertrophy work, leveraging high-intent speed work to recruit HTMUs without blunting speed.

### B. Force Production & Stability
Force dictates acceleration ($\mathbf{a} = \frac{\mathbf{F}}{m}$). To maximize force production, training exercises must offer high external stability (e.g., Hatfield squats, chest-supported rows) so the central nervous system can express full motor unit drive without muscular co-contraction or balance bottlenecks.

### C. Acceleration & Impulse
To change velocity rapidly, we manipulate mass and contraction duration ($\Delta v = \frac{\mathbf{F} \Delta t}{m}$) to frequently expose the system to high accelerations tailored to task demands.

### D. Technical Coordination & Motor Patterns
High-quality motor execution requires training in low-fatigue states. Motor pattern refinement requires high consistency and execution speed matching or exceeding competition speeds. Coaches must observe and correct subtle technical degradation over time.

---

## 6. Exercise Classification & Tagging Taxonomy

Exercises are defined by their **Movement Pattern + Load Vector + Intent**:

| Category | Primary Target | Mechanical Goal | Example Protocols |
| :--- | :--- | :--- | :--- |
| **Range Adders** | Mobility & Terminal ROM Strength | Expand pain-free active ROM; build tissue tolerance at extended lengths. | RDLs, Deficit Deadlifts, Front Foot Elevated (FFE) Split Squats. |
| **Volume Builders** | Hypertrophy & Density | Maximize HTMU fatigue within tight time windows. | Myo-rep Leg Extensions, Hack Squat Giant Sets. |
| **Accelerators** | RFD & Rate Coding | Maximize acceleration and velocity output under submaximal loads. | Band-resisted Squats, Seated Box Jumps, Medicine Ball Throws. |
| **Co-ordinators** | Motor Pattern Efficiency | Refine motor skill, positioning, and rate coding in specific competition lifts. | Snatches, Low Hang Snatches, Paused Low Bar Squats. |
| **Force Builders** | Absolute Strength Ceiling | Overload absolute force capabilities using high stability or heavy resistance. | Hatfield Squats, Banded Hatfield Squats, Bounce Bench Presses. |

---

## 7. Session Ordering Logic & Programming Constraints

To prevent fatigue interference, AI prescription logic and gym-floor programming follow this strict sequence:

$$\text{1. Range Adders} \longrightarrow \text{2. Co-ordinators} \longrightarrow \text{3. Accelerators} \longrightarrow \text{4. Force Builders} \longrightarrow \text{5. Volume Builders}$$

### Fatigue Rules
1. **Fatigue Interference Guard:** Never place high-density Volume Builders (Myo-reps, Giant sets) prior to high-intent Accelerators or technical Co-ordinators.
2. **Speed/Power Focus Constraints:** For athletes prioritizing velocity or RFD, cap high-fatigue grinder sets (RPE 9–10) to a maximum of **20–25% of total session volume**.

---

## 8. AI Coaching Decision Engine

```mermaid
flowchart TD
    Issue["Client Physical Issue / Workout Ingestion"]
    PainCheck{"Is there joint pain (>3/10)<br/>or restricted ROM?"}
    
    subgraph RangePrescription["Range Adder Protocol"]
        RangeAdders["Prescribe Range Adders<br/>• Regress load by 15-20%<br/>• Maximize external stability<br/>• Load safely at available active ROM"]
    end

    subgraph GoalCheck["Performance Goal Triage"]
        Goal{"Is speed/power or skill<br/>the primary goal?"}
    end

    subgraph SpeedSkill["Co-ordinators & Accelerators"]
        CoordAccel["Prescribe Co-ordinators / Accelerators<br/>• Low-fatigue state (rest > 2-3 min)<br/>• Maximal movement intent & quality<br/>• Execution speed >= competition pace"]
    end

    subgraph ForceVolume["Force & Volume Builders"]
        ForceVol["Prescribe Force / Volume Builders<br/>• High external stability (Hatfield / supported)<br/>• Proximity to failure (RIR 1-2)<br/>• Dense protocols (Myo-reps) if time < 45m"]
    end

    Issue --> PainCheck
    PainCheck -->|Yes| RangeAdders
    PainCheck -->|No| Goal
    Goal -->|Yes (Speed/Skill)| CoordAccel
    Goal -->|No (Force/Hypertrophy)| ForceVol
```

### Automated Regression & Safety Guardrails
- **Pain Threshold Rule:** Any movement causing joint pain $>3/10$ must be immediately regressed to a higher-stability variant or a Range Adder at reduced load.
- **Volume Autoregulation:** If total session time available is $<45$ minutes, convert standard hypertrophy accessories into Myo-rep sets (1 activation set of 12–15 reps to failure, followed by 3–5 mini-sets of 3–5 reps with 15s rest) to preserve volume without sacrificing intensity.

---

## 9. Client Input Schema (Required Telemetry)

Before issuing any program modification, triage advice, or workout generation, the AI Co-Pilot collects or validates five inputs:

1. **Systemic Readiness / Fatigue:** `High` • `Moderate` • `Low`
2. **Joint Comfort / Pain Vector:** `0–10 Numeric Scale` + `Joint Location (Shoulder, Knee, Hip, Lumbar)`
3. **Session Time Availability:** `30 min` • `45 min` • `60 min` • `90 min`
4. **Primary Adaptational Focus:** `Range` • `Force` • `RFD/Speed` • `Coordination` • `Volume`
5. **Training Age & Competency:** `Novice` • `Intermediate` • `Advanced`
