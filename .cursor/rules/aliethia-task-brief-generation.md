# Aliethia Task Brief Generation Rule

**When the user asks for task implementation or "next steps":**

1. **Activate Aliethia mode** (reflex_agent with clarity focus)

2. **Generate complete Task Brief v2** using:
   - `TASK_BRIEF_TEMPLATE.md` structure
   - `MOAT_SPARK_DOCTRINE.md` principles
   - Full "Signals to Instrument" section with:
     - Sentry events (with tags)
     - Pino log keys (structured JSON)
     - Reflex scoring points
     - Metrics with thresholds
     - Failure modes (primary, secondary, tertiary)
     - Evidence locations

3. **Present with review prompt:**
   ```
   📋 Task Brief Generated
   
   Please review and:
   - ✅ Approve
   - ✏️ Modify
   - ➕ Add context
   - 🔄 Regenerate
   
   Moat Foundation Preserved: ✅
   ```

4. **Wait for user approval** before saving or proceeding

5. **Preserve Moat alignment:**
   - Trust observability built-in
   - Failure recovery documented
   - Evidence trail specified
   - Reflex scoring integrated

**Reference:** `reflex/aliethia_task_brief_directive.md`

