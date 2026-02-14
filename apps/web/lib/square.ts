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
  currency?: string;
};

export type SquareCreateOrderInput = {
  locationId: string;
  referenceId: string;
  idempotencyKey: string;
  customerId?: string;
  lineItems: Array<{
    name: string;
    quantity: string; // Square expects a string quantity
    basePriceMoney: SquareMoney;
    note?: string;
  }>;
  // Optional order modifiers (use when applicable)
  taxes?: any[];
  discounts?: any[];
  serviceCharges?: any[];
};

export type SquareCreateOrderResult = {
  orderId: string;
  order?: any;
};

export type SquareCreateExternalPaymentInput = {
  idempotencyKey: string;
  amountMoney: { amount: bigint; currency: string };
  orderId: string;
  locationId: string;
  customerId?: string;
  externalSource?: string; // e.g. "Hookah+"
  note?: string;
};

export type SquareCreateExternalPaymentResult = {
  paymentId: string;
  payment?: any;
};

export type SquareGetPaymentResult = {
  payment?: any;
};

export type SquareCreateRefundInput = {
  idempotencyKey: string;
  paymentId: string;
  amountMoney: { amount: bigint; currency: string };
  reason?: string;
};

export type SquareCreateRefundResult = {
  refundId: string;
  refund?: any;
};

export class SquareApiError extends Error {
  public status: number;
  public bodyText: string;
  public retryAfterSeconds?: number;

  constructor(message: string, opts: { status: number; bodyText: string; retryAfterSeconds?: number }) {
    super(message);
    this.name = "SquareApiError";
    this.status = opts.status;
    this.bodyText = opts.bodyText;
    this.retryAfterSeconds = opts.retryAfterSeconds;
  }
}

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

export function getSquareVersion(): string {
  return process.env.SQUARE_VERSION || "2025-10-16";
}

export function getSquareOrderSourceName(): string {
  return process.env.SQUARE_ORDER_SOURCE_NAME || "Hookah+";
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

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

function computeBackoffMs(attempt: number) {
  const base = 250;
  const max = 5000;
  const exp = Math.min(max, base * Math.pow(2, attempt - 1));
  const jitter = Math.floor(Math.random() * 150);
  return exp + jitter;
}

function parseRetryAfterSeconds(value: string | null): number | undefined {
  if (!value) return undefined;
  const asNum = Number(value);
  if (!Number.isNaN(asNum) && asNum >= 0) return asNum;
  // If it's an HTTP date, ignore for MVP.
  return undefined;
}

export async function squareFetch<T>(
  accessToken: string,
  path: string,
  init: RequestInit & { method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" } = { method: "GET" }
): Promise<T> {
  const env = getSquareEnv();
  const url = `${getSquareConnectBaseUrl(env)}${path}`;

  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Square-Version": getSquareVersion(),
        ...(init.headers || {}),
      },
    });

    const text = await res.text();
    if (res.ok) return text ? (JSON.parse(text) as T) : ({} as T);

    const retryAfterSeconds = parseRetryAfterSeconds(res.headers.get("retry-after"));
    const isRetryable =
      res.status === 429 ||
      (res.status >= 500 && res.status <= 599);

    // If not retryable or last attempt, throw.
    if (!isRetryable || attempt === maxAttempts) {
      throw new SquareApiError(`Square API error ${res.status}`, {
        status: res.status,
        bodyText: text,
        retryAfterSeconds,
      });
    }

    // Rate limit / transient errors: exponential backoff (+ honor Retry-After if present).
    const waitMs = retryAfterSeconds !== undefined ? retryAfterSeconds * 1000 : computeBackoffMs(attempt);
    await sleep(waitMs);
  }

  // Unreachable, but TS wants a return/throw.
  throw new SquareApiError("Square API error (exhausted retries)", { status: 500, bodyText: "" });
}

export async function squareListLocations(accessToken: string): Promise<SquareLocation[]> {
  const out = await squareFetch<{ locations?: SquareLocation[] }>(accessToken, "/v2/locations", { method: "GET" });
  return out.locations || [];
}

export async function squareRetrieveLocation(accessToken: string, locationId: string) {
  return await squareFetch<{ location?: SquareLocation }>(accessToken, `/v2/locations/${locationId}`, { method: "GET" });
}

export async function squareCreateOrder(accessToken: string, input: SquareCreateOrderInput): Promise<SquareCreateOrderResult> {
  const payload = {
    idempotency_key: input.idempotencyKey,
    order: {
      location_id: input.locationId,
      reference_id: input.referenceId,
      source: { name: getSquareOrderSourceName() },
      ...(input.customerId ? { customer_id: input.customerId } : {}),
      line_items: input.lineItems.map(li => ({
        name: li.name,
        quantity: li.quantity,
        base_price_money: {
          amount: li.basePriceMoney.amount.toString(),
          currency: li.basePriceMoney.currency,
        },
        ...(li.note ? { note: li.note } : {}),
      })),
      ...(input.taxes ? { taxes: input.taxes } : {}),
      ...(input.discounts ? { discounts: input.discounts } : {}),
      ...(input.serviceCharges ? { service_charges: input.serviceCharges } : {}),
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

export async function squareCreateExternalPayment(
  accessToken: string,
  input: SquareCreateExternalPaymentInput
): Promise<SquareCreateExternalPaymentResult> {
  const payload: any = {
    idempotency_key: input.idempotencyKey,
    source_id: "EXTERNAL",
    amount_money: {
      amount: input.amountMoney.amount.toString(),
      currency: input.amountMoney.currency,
    },
    location_id: input.locationId,
    order_id: input.orderId,
    autocomplete: true,
    external_details: {
      type: "OTHER",
      source: input.externalSource || getSquareOrderSourceName(),
    },
  };
  if (input.customerId) payload.customer_id = input.customerId;
  if (input.note) payload.note = input.note;

  const out = await squareFetch<{ payment?: any }>(accessToken, "/v2/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const paymentId = out?.payment?.id;
  if (!paymentId) throw new Error("Square create payment succeeded but returned no payment.id");
  return { paymentId, payment: out.payment };
}

export async function squareGetPayment(accessToken: string, paymentId: string): Promise<SquareGetPaymentResult> {
  return await squareFetch<{ payment?: any }>(accessToken, `/v2/payments/${paymentId}`, { method: "GET" });
}

export async function squarePayOrder(accessToken: string, params: { orderId: string; idempotencyKey: string; paymentIds: string[] }) {
  const payload = { idempotency_key: params.idempotencyKey, payment_ids: params.paymentIds };
  return await squareFetch<{ order?: any }>(accessToken, `/v2/orders/${params.orderId}/pay`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function squareCancelOrder(accessToken: string, params: { orderId: string; orderVersion: number; idempotencyKey: string }) {
  const payload = {
    idempotency_key: params.idempotencyKey,
    order: { state: "CANCELED", version: params.orderVersion },
  };
  return await squareFetch<{ order?: any }>(accessToken, `/v2/orders/${params.orderId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function squareCreateRefund(accessToken: string, input: SquareCreateRefundInput): Promise<SquareCreateRefundResult> {
  const payload: any = {
    idempotency_key: input.idempotencyKey,
    payment_id: input.paymentId,
    amount_money: {
      amount: input.amountMoney.amount.toString(),
      currency: input.amountMoney.currency,
    },
    reason: input.reason || "Refund requested in partner app",
  };

  const out = await squareFetch<{ refund?: any }>(accessToken, "/v2/refunds", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const refundId = out?.refund?.id;
  if (!refundId) throw new Error("Square create refund succeeded but returned no refund.id");
  return { refundId, refund: out.refund };
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

export async function squareRefreshOAuthToken(params: { refreshToken: string }) {
  const env = getSquareEnv();
  const url = `${getSquareOAuthBaseUrl(env)}/oauth2/token`;

  const payload = {
    client_id: requireEnv("SQUARE_APPLICATION_ID"),
    client_secret: requireEnv("SQUARE_APPLICATION_SECRET"),
    refresh_token: params.refreshToken,
    grant_type: "refresh_token",
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Square OAuth refresh error ${res.status}: ${text}`);
  return JSON.parse(text) as {
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    merchant_id?: string;
    scope?: string;
  };
}

export async function squareRevokeToken(params: { accessToken: string }) {
  // Spec: https://developer.squareup.com/reference/square/oauth-api/revoke-token
  const env = getSquareEnv();
  const url = `${getSquareOAuthBaseUrl(env)}/oauth2/revoke`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Client ${requireEnv("SQUARE_APPLICATION_SECRET")}`,
      "Square-Version": getSquareVersion(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: requireEnv("SQUARE_APPLICATION_ID"),
      access_token: params.accessToken,
      revoke_only_access_token: false,
    }),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`Square OAuth revoke error ${res.status}: ${text}`);
  return text ? JSON.parse(text) as { success: boolean } : { success: true };
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

