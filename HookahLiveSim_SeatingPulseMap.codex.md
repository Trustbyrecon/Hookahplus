# ΔHookahLiveSim_SeatingPulseMap

## Simulation Objective

Model a **realistic live session scenario** using:

* Reflex Flywheel Engine
* Hookah+ Flavor Flow Dashboard logic
* Customer personas
* Dynamic seating layouts
* Table turnover analytics
* Staff bandwidth constraints

This codex aligns `/demo` and `/dashboard` to represent the **same real-time trust landscape**, with data powering both staff view and owner journey simulation.

---

## Simulation Parameters

### Lounge Seating Layout Types

| Type      | Max Seats | Notes                                                  |
| --------- | --------- | ------------------------------------------------------ |
| High Boy  | 2         | Ideal for fast turnover pairs                          |
| Sofa      | 6         | Good for mid-size groups, off-peak preferred           |
| Sectional | 8         | Typically booked for 3+ guests, higher loyalty trigger |
| Bar       | 10        | Used for overflow or solo sippers / couples            |

### Personas

| Name    | Type      | Visit Freq | Loyalty Profile        | Refill Sensitivity |
| ------- | --------- | ---------- | ---------------------- | ------------------ |
| Kayla   | Beginner  | 3x/wk      | Trying new flavors     | High               |
| Darnell | Socialite | 1x/wk      | Brings friends         | Medium             |
| Zay     | Pro       | Daily      | Loyal, always same mix | Low                |

### Staff Constraint

* 1 Staff
* 6 Hour Shift (360 mins)
* Table Turnover: 45 mins/session
* Average: ~8 sessions per table max (if full efficiency)

---

## Session Flow Simulation

### Section: "Red Sofa" (6 seats)

* 3 people on 1 hookah (Kayla + Zay + 1 Guest)
* Time: 6:30PM (Peak)
* Flavors: Peach + Grape + Mint
* Duration: 48 mins
* Status: **Refill Alert triggered** (auto on dashboard)
* Loyalty Delta: +3 (Zay), +1 (Kayla), +0.5 (Guest)

### Section: "Back Sectional" (8 seats)

* Group of 5
* Persona Mix: 2 Beginners, 2 Socialites, 1 Pro
* Time: 4:00PM (Off-Peak)
* Flavors: Lemon + Mint
* Duration: 50 mins
* Status: **Burnout Triggered**
* Loyalty: Varies (Pro: +3, Beginners: +1 ea)

### Section: "High Boy 2" (2 seats)

* 1 Pro user (Zay), Solo
* Flavor: Grape only
* Time: 7:45PM
* Session: 40 mins
* Status: Stable
* Loyalty: +3, auto-prompt Alie Whisper with TrustArc displayed

### Bar Area (5 guests scattered)

* Mixed seat behavior, dynamic overlays
* Whisper: "Want to join a session?"
* Loyalty: Low → Reflex prompt offered

---

## Data Outputs for `/dashboard` (Staff View)

* Table blocks auto-tagged by layout type
* Refill or Burnout highlights driven by timer
* Loyalty Signal shown per persona w/ hover notes
* SessionNotes available for recall
* Whisper trigger logs shown per section

## Data Outputs for `/demo` (Owner Preview)

* Session journey replay
* Flavor path impact on loyalty
* Overlay animations (Trust Arc rise)
* Whisper interaction map per persona

---

## Reflex Loop: Real-Time Trigger Chain

1. **Timer Threshold** (e.g. 45m) → triggers `WhisperTrigger`
2. **Staff Refill** → logs `MemoryPulseTracker`
3. **Customer Feedback** → activates `TrustArcDisplay`
4. **Loyalty Gain** → reflects across `/demo` and `/dashboard`
5. **New flavor combo** → updates `/flavors`
6. **Trust Overlay** → nudges customer toward another session

---

## Next Steps

* [ ] Enable live feed between `/dashboard` + `/demo`
* [ ] Auto-generate `SimRun_Alpha001.yaml` for testing
* [ ] Run Reflex Drift Detector to catch burnout/refill lag

---

## Codex Tag

`ΔHookahLiveSim_SeatingPulseMap`
