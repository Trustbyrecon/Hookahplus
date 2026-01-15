import crypto from "crypto";

export type SquareEnv = "sandbox" | "production";

export type SquareMoney = {
  amount: bigint;
  currency: string; // e.g. "USD"
};

export type SquareLocation = {
  id: string;
  name?: string;
  status?: string;
};

export type SquareCreateOrderInput = {
  locationId: string;
  referenceId: string;
  idempotencyKey: string;
  lineItems: Array<{
    name: string;
    quantity: string; // Square expects a string quantity
    basePriceMoney: SquareMoney;
    note?: string;
  }>;
};

export type SquareCreateOrderResult = {
  orderId: string;
  order?: any;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

export function getSquareEnv(): SquareEnv {
  const raw = (process.env.SQUARE_ENV || "sandbox").toLowerCase();
  if (raw === "sandbox" || raw === "production") return raw;
  return "sandbox";
}

export function getSquareConnectBaseUrl(env: SquareEnv) {
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function getSquareOAuthBaseUrl(env: SquareEnv) {
  return env === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export function getSquareAuthorizeUrl(env: SquareEnv) {
  return env === "production"
    ? "https://connect.squareup.com/oauth2/authorize"
    : "https://connect.squareupsandbox.com/oauth2/authorize";
}

function base64UrlEncode(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecodeToBuffer(input: string) {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function getAesKey(): Buffer {
  const keyB64 = requireEnv("SQUARE_TOKEN_ENC_KEY");
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) throw new Error("SQUARE_TOKEN_ENC_KEY must be 32 bytes base64");
  return key;
}

export function encryptSecret(plaintext: string): string {
  const key = getAesKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // v1:<iv>.<ct>.<tag> (base64url parts)
  return [
    "v1",
    base64UrlEncode(iv),
    base64UrlEncode(ciphertext),
    base64UrlEncode(tag),
  ].join(":");
}

export function decryptSecret(enc: string): string {
  const key = getAesKey();
  const parts = enc.split(":");
  if (parts.length !== 4 || parts[0] !== "v1") throw new Error("Unsupported secret encoding");
  const iv = base64UrlDecodeToBuffer(parts[1]);
  const ciphertext = base64UrlDecodeToBuffer(parts[2]);
  const tag = base64UrlDecodeToBuffer(parts[3]);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export type SquareOAuthState = {
  loungeId: string;
  csrf: string;
  ts: number;
};

function getStateHmacKey(): Buffer {
  // Reuse the encryption key for state signing (MVP).
  return getAesKey();
}

export function signOAuthState(payload: SquareOAuthState): string {
  const body = base64UrlEncode(JSON.stringify(payload));
  const mac = crypto.createHmac("sha256", getStateHmacKey()).update(body).digest();
  return `${body}.${base64UrlEncode(mac)}`;
}

export function verifyOAuthState(state: string): SquareOAuthState {
  const [body, sig] = state.split(".");
  if (!body || !sig) throw new Error("Invalid state");
  const mac = crypto.createHmac("sha256", getStateHmacKey()).update(body).digest();
  const expected = base64UrlEncode(mac);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error("Invalid state signature");
  const decoded = JSON.parse(base64UrlDecodeToBuffer(body).toString("utf8"));
  if (!decoded?.loungeId) throw new Error("Invalid state payload");
  return decoded as SquareOAuthState;
}

export function buildSquareAuthorizeRedirect(params: {
  loungeId: string;
  redirectUri: string;
  scopes: string[];
}) {
  const env = getSquareEnv();
  const applicationId = requireEnv("SQUARE_APPLICATION_ID");

  const csrf = crypto.randomBytes(16).toString("hex");
  const state = signOAuthState({ loungeId: params.loungeId, csrf, ts: Date.now() });

  const url = new URL(getSquareAuthorizeUrl(env));
  url.searchParams.set("client_id", applicationId);
  url.searchParams.set("scope", params.scopes.join(" "));
  url.searchParams.set("session", "false");
  url.searchParams.set("state", state);
  url.searchParams.set("redirect_uri", params.redirectUri);
  return { url: url.toString(), state };
}

export async function squareFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit & { method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" } = { method: "GET" }
): Promise<T> {
  const env = getSquareEnv();
  const res = await fetch(`${getSquareConnectBaseUrl(env)}${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Square API error ${res.status}: ${text}`);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

export async function squareListLocations(accessToken: string): Promise<SquareLocation[]> {
  const out = await squareFetch<{ locations?: SquareLocation[] }>(accessToken, "/v2/locations", { method: "GET" });
  return out.locations || [];
}

export async function squareCreateOrder(accessToken: string, input: SquareCreateOrderInput): Promise<SquareCreateOrderResult> {
  const payload = {
    idempotency_key: input.idempotencyKey,
    order: {
      location_id: input.locationId,
      reference_id: input.referenceId,
      line_items: input.lineItems.map(li => ({
        name: li.name,
        quantity: li.quantity,
        base_price_money: {
          amount: li.basePriceMoney.amount.toString(),
          currency: li.basePriceMoney.currency,
        },
        ...(li.note ? { note: li.note } : {}),
      })),
    },
  };

  const out = await squareFetch<{ order?: any }>(accessToken, "/v2/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const orderId = out?.order?.id;
  if (!orderId) throw new Error("Square create order succeeded but returned no order.id");
  return { orderId, order: out.order };
}

export async function squareExchangeOAuthCode(params: {
  code: string;
  redirectUri: string;
}) {
  const env = getSquareEnv();
  const url = `${getSquareOAuthBaseUrl(env)}/oauth2/token`;

  const payload = {
    client_id: requireEnv("SQUARE_APPLICATION_ID"),
    client_secret: requireEnv("SQUARE_APPLICATION_SECRET"),
    code: params.code,
    grant_type: "authorization_code",
    redirect_uri: params.redirectUri,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Square OAuth token error ${res.status}: ${text}`);
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    merchant_id?: string;
    scope?: string;
  };
}

export function getAppBaseUrl(): string {
  return requireEnv("APP_BASE_URL").replace(/\/+$/g, "");
}

export function verifySquareWebhookSignature(params: {
  signatureHeader: string;
  rawBody: string;
  notificationUrl: string;
}) {
  const key = requireEnv("SQUARE_WEBHOOK_SIGNATURE_KEY");
  const message = params.notificationUrl + params.rawBody;
  const digest = crypto.createHmac("sha256", key).update(message, "utf8").digest("base64");
  const a = Buffer.from(params.signatureHeader, "utf8");
  const b = Buffer.from(digest, "utf8");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  return true;
}

