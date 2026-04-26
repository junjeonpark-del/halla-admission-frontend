import {
  AGENCY_SESSION_COOKIE,
  clearSessionCookie,
  json,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  clearSessionCookie(res, AGENCY_SESSION_COOKIE);

  return json(res, 200, {
    success: true,
    message: "已退出登录",
  });
}
