// Lightweight signed-session helper (no external deps, works on Cloudflare's Web Crypto runtime).
// A session token is:  base64url(expiryMillis) + "." + base64url(HMAC-SHA256(expiryMillis, SESSION_SECRET))

function toBase64Url(bytes) {
  let str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const bin = atob(str);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return new Uint8Array(sig);
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 saat

export async function createSessionToken(secret) {
  const expiry = Date.now() + SESSION_TTL_MS;
  const expiryStr = String(expiry);
  const sig = await hmac(secret, expiryStr);
  return `${toBase64Url(new TextEncoder().encode(expiryStr))}.${toBase64Url(sig)}`;
}

export async function verifySessionToken(token, secret) {
  if (!token || !token.includes(".")) return false;
  const [expiryPart, sigPart] = token.split(".");
  let expiryStr;
  try {
    expiryStr = new TextDecoder().decode(fromBase64Url(expiryPart));
  } catch {
    return false;
  }
  const expected = await hmac(secret, expiryStr);
  const expectedStr = toBase64Url(expected);
  if (expectedStr !== sigPart) return false;
  const expiry = Number(expiryStr);
  if (!expiry || Date.now() > expiry) return false;
  return true;
}

export function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookieHeader(token, maxAgeSeconds) {
  return `session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

export function clearSessionCookieHeader() {
  return `session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
