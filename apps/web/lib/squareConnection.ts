import { prisma } from "@/apps/web/lib/prisma";
import {
  decryptSecret,
  encryptSecret,
  SquareApiError,
  squareRefreshOAuthToken,
} from "@/apps/web/lib/square";

export async function withSquareConnection<T>(
  loungeId: string,
  fn: (args: { accessToken: string; locationId: string; merchantId: string }) => Promise<T>
): Promise<T> {
  const conn = await prisma.squareConnection.findUnique({ where: { loungeId } });
  if (!conn) throw new Error(`Square not connected for loungeId=${loungeId}`);

  const accessToken = decryptSecret(conn.accessTokenEnc);

  try {
    return await fn({ accessToken, locationId: conn.locationId, merchantId: conn.merchantId });
  } catch (e: any) {
    // If auth error and refresh token exists, refresh and retry once.
    const isAuthErr = e instanceof SquareApiError && (e.status === 401 || e.status === 403);
    if (!isAuthErr || !conn.refreshTokenEnc) throw e;

    const refreshToken = decryptSecret(conn.refreshTokenEnc);
    const refreshed = await squareRefreshOAuthToken({ refreshToken });

    const accessTokenEnc = encryptSecret(refreshed.access_token);
    const refreshTokenEnc = refreshed.refresh_token ? encryptSecret(refreshed.refresh_token) : conn.refreshTokenEnc;
    const tokenExpiresAt = refreshed.expires_at ? new Date(refreshed.expires_at) : null;

    await prisma.squareConnection.update({
      where: { loungeId },
      data: {
        accessTokenEnc,
        refreshTokenEnc,
        tokenExpiresAt: tokenExpiresAt || undefined,
        merchantId: refreshed.merchant_id || conn.merchantId,
        scopes: refreshed.scope || conn.scopes,
      },
    });

    const newAccessToken = decryptSecret(accessTokenEnc);
    return await fn({ accessToken: newAccessToken, locationId: conn.locationId, merchantId: conn.merchantId });
  }
}

