import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentRole } from '../lib/auth';
import { hasCodigoAccess } from '../lib/codigo-access';

/**
 * Server component: gates CODIGO operator routes.
 * Redirects to /codigo/access-expired if user lacks valid CODIGO access.
 * Admin/owner roles bypass. First Light mode bypasses (caller checks env).
 */
export async function CodigoAccessGate({ children }: { children: React.ReactNode }) {
  const firstLightMode = process.env.FIRST_LIGHT_MODE === 'true';
  if (firstLightMode) return <>{children}</>;

  const user = await getCurrentUser();
  if (!user) {
    redirect('/login?redirect=/codigo/operator');
  }

  const role = await getCurrentRole();
  const isAdminOrOwner = role === 'owner' || role === 'admin';

  const hasAccess = await hasCodigoAccess(user.id, isAdminOrOwner);
  if (!hasAccess) {
    redirect('/codigo/access-expired');
  }

  return <>{children}</>;
}
