import { redirect } from 'next/navigation';

/**
 * Singular route for CODIGO sign-in.
 * Redirects to login with redirect=/codigo so users land on CODIGO root after auth.
 * CODIGO root routes to onboard (3-step flow) or operator based on completion.
 */
export default function CodigoLoginPage() {
  redirect('/login?redirect=/codigo');
}
