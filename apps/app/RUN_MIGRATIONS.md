# Running Prisma/Supabase migrations for the app build

Some operator-onboarding actions (stage updates, notes, test-link sends) rely on the `reflex_events` table. If you see a warning like:

```
The reflex_events table does not exist. Please run database migrations.
```

run the app migrations against the Supabase database backing the app build:

```bash
# From the repo root
npm run db:migrate:app
```

That command runs `npx prisma migrate deploy` inside `apps/app`, applying any pending migrations (including the `reflex_events` schema) to whatever database is configured via `apps/app/.env[.local]`.

Run this once per environment (local, staging, prod) whenever:

- A teammate adds a new migration under `supabase/migrations/…`
- You connect the app to a fresh Supabase project
- You see the “table does not exist” alert inside `/admin/operator-onboarding`

After the command finishes, refresh `/admin/operator-onboarding` and retry the action; stage changes and quick actions will work once the schema exists.

