# Orchestrator Pack (Hookah+ MVP)

Drop-in task cards for agents to execute sequentially.

## Run Order

1. `1_repo.stabilizer.md` - Stabilize main branch
2. `2_stripe.catalog.seed.md` - Seed Stripe catalog
3. `3_pos.adapter.square.md` - Square POS adapter
4. `4_session.flow.bind.md` - Session flow binding
5. `5_roi.page.deploy.md` - ROI calculator page

## Conventions

- Write intermediate notes to `orchestrator/logs/*.md`
- Use SAFE paths first; CLEAN paths require explicit approval
- Add PR titles with prefix `[orchestrator]`

## Env

- Node 18+
- Next.js App Router
- Stripe TEST key in `stripe-seed/.env`
- `.env.local` for public price IDs (no secrets)

## Quick Start

```bash
# Create logs directory
mkdir -p orchestrator/logs

# Start with repo stabilization
# Follow each task card in order
# Check acceptance criteria before moving to next
```
