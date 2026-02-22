# KPI Instrumentation & Guardrails

All recommendations must include:

A) Venue summary
B) Primary surface changes
C) Micro-behavior rules
D) KPI instrumentation plan
E) Trust guardrails
F) Implementation notes

Throttle-back policy:
If guardrail KPI worsens by >15% over baseline for two consecutive peak windows:
- Reduce prompt cadence by 50%
- Suppress upsell prompts temporarily
- Recommend UI simplification

Autonomy Scaling:
- Venue identity remains fixed.
- Micro-behavior intensity may adapt within identity.
- Autonomy expands only after 60+ days of stable signal confidence.
