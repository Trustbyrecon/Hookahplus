/**
 * Square OAuth 2.0 Integration
 * Handles OAuth flow for Square App Marketplace
 */

interface SquareTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface SquareMerchantInfo {
  id: string;
  locations: string[];
  businessName?: string;
}

export class SquareOAuth {
  private static readonly API_VERSION = '2024-01-18';

  private static getAppUrl(): string {
    // Vercel env vars are sometimes pasted with quotes/backticks. Normalize defensively.
    let appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002').trim();
    appUrl = appUrl.replace(/^`|`$/g, '').replace(/^"|"$/g, '').replace(/^'|'$/g, '');
    appUrl = appUrl.replace(/\/+$/g, '');
    return appUrl;
  }

  private static getEnv(): 'sandbox' | 'production' {
    const raw = (process.env.SQUARE_ENV || '').toLowerCase();
    if (raw === 'sandbox' || raw === 'production') return raw;
    // Heuristic fallback: sandbox client IDs start with "sandbox-".
    const clientId = process.env.SQUARE_APPLICATION_ID?.trim() || '';
    if (clientId.startsWith('sandbox-')) return 'sandbox';
    return 'production';
  }

  private static getBaseUrl(): string {
    return this.getEnv() === 'sandbox'
      ? 'https://connect.squareupsandbox.com'
      : 'https://connect.squareup.com';
  }

  /**
   * Generate authorization URL for OAuth flow
   */
  static getAuthorizationUrl(state: string): string {
    const clientId = process.env.SQUARE_APPLICATION_ID?.trim();
    if (!clientId) {
      throw new Error('SQUARE_APPLICATION_ID environment variable is required');
    }

    // Validate Application ID format
    if (!clientId.startsWith('sandbox-sq0idb-') && !clientId.startsWith('sq0idb-')) {
      console.warn('[Square OAuth] Application ID format may be incorrect. Expected format: sandbox-sq0idb-... or sq0idb-...');
    }

    const redirectUri = `${this.getAppUrl()}/api/square/oauth/callback`;
    const scopes = [
      'ORDERS_WRITE',
      'ORDERS_READ',
      'PAYMENTS_WRITE',
      'MERCHANT_PROFILE_READ',
      'LOCATIONS_READ'
    ].join(' ');

    // Ensure clientId has no whitespace or newlines
    const cleanClientId = clientId.trim().replace(/[\r\n]/g, '');
    
    const params = new URLSearchParams({
      client_id: cleanClientId,
      scope: scopes,
      session: 'false',
      state: state
    });

    // Build URL with redirect_uri as separate parameter (Square expects it this way)
    const baseUrl = this.getBaseUrl();
    const authUrl = `${baseUrl}/oauth2/authorize?${params.toString()}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    
    // Log for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Square OAuth] Generated auth URL:', {
        env: this.getEnv(),
        baseUrl,
        clientId: clientId.substring(0, 20) + '...',
        redirectUri,
        hasState: !!state
      });
    }

    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCode(code: string): Promise<SquareTokens> {
    const clientId = process.env.SQUARE_APPLICATION_ID;
    const clientSecret = process.env.SQUARE_APPLICATION_SECRET;
    const redirectUri = `${this.getAppUrl()}/api/square/oauth/callback`;

    if (!clientId || !clientSecret) {
      throw new Error('Square OAuth credentials not configured');
    }

    const response = await fetch(`${this.getBaseUrl()}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': this.API_VERSION
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Square OAuth token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_at ? Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000) : 2592000, // 30 days default
      tokenType: data.token_type || 'Bearer'
    };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<SquareTokens> {
    const clientId = process.env.SQUARE_APPLICATION_ID;
    const clientSecret = process.env.SQUARE_APPLICATION_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Square OAuth credentials not configured');
    }

    const response = await fetch(`${this.getBaseUrl()}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': this.API_VERSION
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Square OAuth token refresh failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || refreshToken, // May not return new refresh token
      expiresIn: data.expires_at ? Math.floor((new Date(data.expires_at).getTime() - Date.now()) / 1000) : 2592000,
      tokenType: data.token_type || 'Bearer'
    };
  }

  /**
   * Get merchant information from Square API
   */
  static async getMerchantInfo(accessToken: string): Promise<SquareMerchantInfo> {
    const response = await fetch(`${this.getBaseUrl()}/v2/merchants`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': this.API_VERSION
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get merchant info: ${error}`);
    }

    const data = await response.json();
    const merchant = data.merchant?.[0];
    
    if (!merchant) {
      throw new Error('No merchant found');
    }

    // Get locations
    const locationsResponse = await fetch(`${this.getBaseUrl()}/v2/locations`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': this.API_VERSION
      }
    });

    let locationIds: string[] = [];
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      locationIds = locationsData.locations?.map((loc: any) => loc.id) || [];
    }

    return {
      id: merchant.id,
      locations: locationIds,
      businessName: merchant.business_name
    };
  }

  /**
   * Revoke access token (for disconnect)
   */
  static async revokeToken(accessToken: string): Promise<void> {
    const clientId = process.env.SQUARE_APPLICATION_ID;
    const clientSecret = process.env.SQUARE_APPLICATION_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Square OAuth credentials not configured');
    }

    const response = await fetch(`${this.getBaseUrl()}/oauth2/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Square-Version': this.API_VERSION,
        'Authorization': `Client ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: JSON.stringify({
        access_token: accessToken
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to revoke token: ${error}`);
    }
  }
}

