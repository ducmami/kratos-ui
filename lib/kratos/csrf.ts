const CSRF_HEADER = "x-csrf-token";

export function csrfHeaderName(): string {
  return CSRF_HEADER;
}

function envValue(name: string): string {
  return process.env[name] || "";
}

export function csrfCookieName(): string {
  return envValue("CSRF_COOKIE_NAME");
}

function csrfSecret(): string {
  return envValue("CSRF_COOKIE_SECRET");
}

export function csrfCookieSecure(): boolean {
  return envValue("DANGEROUSLY_DISABLE_SECURE_CSRF_COOKIES") !== "true";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sign(token: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(csrfSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(token),
  );
  return bytesToBase64Url(new Uint8Array(mac));
}

function safeEqual(a: string, b: string): boolean {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  if (left.length !== right.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) {
    diff |= left[i] ^ right[i];
  }
  return diff === 0;
}

export async function sealCsrfToken(token: string): Promise<string> {
  return `${token}.${await sign(token)}`;
}

export async function issueCsrfToken(): Promise<{
  token: string;
  cookieValue: string;
}> {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const token = bytesToBase64Url(bytes);
  return { token, cookieValue: await sealCsrfToken(token) };
}

export async function tokenFromCookie(
  cookieValue: string | undefined,
): Promise<string | null> {
  if (!cookieValue) {
    return null;
  }
  const dot = cookieValue.lastIndexOf(".");
  if (dot <= 0) {
    return null;
  }
  const token = cookieValue.slice(0, dot);
  const mac = cookieValue.slice(dot + 1);
  const expected = await sign(token);
  if (!safeEqual(mac, expected)) {
    return null;
  }
  return token;
}

export async function verifyCsrf(
  cookieValue: string | undefined,
  token: string | undefined,
): Promise<boolean> {
  if (!token) {
    return false;
  }
  const fromCookie = await tokenFromCookie(cookieValue);
  if (!fromCookie) {
    return false;
  }
  return safeEqual(fromCookie, token);
}
