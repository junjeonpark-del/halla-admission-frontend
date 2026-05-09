import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AGENCY_SESSION_SECRET = process.env.AGENCY_SESSION_SECRET;
export const ADMIN_SESSION_COOKIE = "admin_session";
export const AGENCY_SESSION_COOKIE = "agency_session";

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

if (!AGENCY_SESSION_SECRET) {
  throw new Error("Missing AGENCY_SESSION_SECRET");
}

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

export function json(res, status, payload) {
  res.status(status).json(payload);
}

export function parseCookies(req) {
  const raw = req.headers.cookie || "";
  const cookies = {};

  raw.split(";").forEach((part) => {
    const idx = part.indexOf("=");
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(value);
    } catch {
      cookies[key] = value;
    }
  });

  return cookies;
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, storedPassword) {
  if (!storedPassword) return false;

  // 兼容旧明文密码
  if (!String(storedPassword).startsWith("scrypt:")) {
    return password === storedPassword;
  }

  const [, salt, hash] = String(storedPassword).split(":");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export function signSession(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", AGENCY_SESSION_SECRET)
    .update(body)
    .digest("base64url");

  return `${body}.${sig}`;
}

export function verifySession(token) {
  if (!token || !token.includes(".")) return null;

  const [body, sig] = token.split(".");
  const expected = crypto
    .createHmac("sha256", AGENCY_SESSION_SECRET)
    .update(body)
    .digest("base64url");

  if (sig !== expected) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (!payload) return null;

    if (payload.exp && Date.now() > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

function buildSessionCookie(name, token, maxAge) {
  const isProd = process.env.NODE_ENV === "production";
  const encodedToken = token ? encodeURIComponent(token) : "";
  const maxAgePart = typeof maxAge === "number" ? `; Max-Age=${maxAge}` : "";
  return `${name}=${encodedToken}; Path=/; HttpOnly; SameSite=Lax${maxAgePart}; ${isProd ? "Secure;" : ""}`;
}

export function setSessionCookie(res, token, cookieName = AGENCY_SESSION_COOKIE) {
  res.setHeader(
    "Set-Cookie",
    buildSessionCookie(cookieName, token)
  );
}

export function clearSessionCookie(res, cookieName = AGENCY_SESSION_COOKIE) {
  res.setHeader(
    "Set-Cookie",
    buildSessionCookie(cookieName, "", 0)
  );
}

export function requireSession(req, role) {
  const cookies = parseCookies(req);
  const cookieName = role === "admin" ? ADMIN_SESSION_COOKIE : AGENCY_SESSION_COOKIE;
  const session = verifySession(cookies[cookieName]);

  if (!session || (role && session.role !== role)) {
    return null;
  }

  return session;
}

export async function validateAgencySession(req) {
  const session = requireSession(req, "agency");

  if (!session || !session.agency_account_id) {
    return null;
  }

  const { data: account, error } = await supabaseAdmin
    .from("agency_accounts")
    .select("id, agency_id, agency_unit_id, is_active, is_primary, session_version")
    .eq("id", session.agency_account_id)
    .maybeSingle();

  if (error) throw error;

  if (!account || account.is_active !== true) {
    return null;
  }

  if (String(account.agency_id) !== String(session.agency_id)) {
    return null;
  }

  if (Number(account.session_version || 0) !== Number(session.session_version || 0)) {
    return null;
  }

  return {
  ...session,
  agency_unit_id: account.agency_unit_id || null,
  is_primary: account.is_primary === true,
};

}

export async function validateAdminSession(req) {
  const session = requireSession(req, "admin");

  if (!session || !session.admin_id) {
    return null;
  }

  const { data: admin, error } = await supabaseAdmin
    .from("admin_accounts")
    .select("id, is_active, session_version")
    .eq("id", session.admin_id)
    .maybeSingle();

  if (error) throw error;

  if (!admin || admin.is_active !== true) {
    return null;
  }

  if (Number(admin.session_version || 0) !== Number(session.session_version || 0)) {
    return null;
  }

  return session;
}
