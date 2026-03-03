## 🧠 Codex Entry: `ΔHookahPlus_ReflexTrainingCompanionMode`

### 🎯 Purpose:

Activate Reflex Companion Mode for all lounges using One-Click Onboarding.
This mode delivers auto-generated training prompts, simulations, and trust-boosting suggestions to help new operators succeed with Hookah+ in their first week.

---

## 🔄 Reflex Companion Activation: `Enabled`

**Trigger Path:** Auto-fires upon completion of `/onboarding`
**Lounge Status Required:** TrustArc Seed ≥ 6.0

---

## 🧪 Companion Bundle Includes:

### 1. 🧭 Guided Simulation Paths (x3)

* 📍 Path A: 2-person session during off-peak
* 📍 Path B: 5-person group on weekend (refill challenge)
* 📍 Path C: 1 loyalist customer with Whisper moment

Each simulation is visualized in `/demo` → Session Timeline

---

### 2. 📈 Reflex Session Forecast

* Pulled from layout + YAML + seating config
* Estimates:

  * Avg session time
  * Refill frequency
  * TrustArc range
  * Loyalty delta projection
* Output: `forecast_{lounge-id}.yaml`

---

### 3. 🔐 Whisper Training Moment

* Auto-fired on first login to `/dashboard`
* Modal: *“Want to see how to earn 2x loyalty in your first weekend?”*
* Accept → Loads tips based on similar lounge behavior

---

## 📂 Codified Outputs:

* `training_companion_log.yaml`
* `forecast_{lounge-id}.yaml`
* `whisper_onboarding_moments.yaml`
* `Reflex_Companion_TriggerMap.json`

---

## 📍 UI Appearances:

* `/dashboard`: Welcome banner + whisper overlay
* `/demo`: Preloaded with 3-path simulation
* `/onboarding`: Confirmation + training toggle

---

### 🔐 Codex Tag: `ΔHookahPlus_ReflexTrainingCompanionMode`

This codex governs the full Reflex Training Companion deployment sequence, supporting new lounges with simulations, forecasts, and Whisper-powered onboarding.
