#!/usr/bin/env node
/**
 * CODIGO Guest + Demo QR Flow — Checklist
 * Run after codigo:seed and codigo:verify to prep for full demo.
 * See: docs/partners/district/CODIGO_GUEST_DEMO_QR_TASK_BRIEF.md
 */

const guestUrl = process.env.NEXT_PUBLIC_GUEST_BASE_URL || 'https://guest.hookahplus.net';
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';

console.log(`
--- CODIGO Guest + Demo QR Flow ---

1. Generate Demo QR
   → ${appUrl}/admin/qr?mode=demo
   → Lounge: CODIGO, Table: 301, Demo mode ON
   → Output: ${guestUrl}/guest/CODIGO?tableId=301&ref=demo

2. Guest scans QR → opens guest app
   → Session resolve/join in CODIGO app instance

3. Env (Guest build)
   → NEXT_PUBLIC_APP_URL = ${appUrl}
   → NEXT_PUBLIC_GUEST_BASE_URL = ${guestUrl}

4. E2E flow
   → Staff creates session (FSD)
   → Guest requests coal (guest app)
   → Kitchen sees BOH "Guest Refill Requests"

5. Session in FSD
   → Ensure app (localhost:3002) is running when guest enters
   → Guest enter calls app /api/session/resolve → session created in app DB
   → FSD at /fire-session-dashboard?lounge=CODIGO shows sessions
`);
