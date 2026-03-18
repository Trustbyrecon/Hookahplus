import { redirect } from 'next/navigation';

/**
 * Singular route for CODIGO sign-in.
 * Redirects to login with redirect=/codigo/operator so users land on CODIGO after auth.
 */
export default function CodigoLoginPage() {
  redirect('/login?redirect=/codigo/operator');
}
