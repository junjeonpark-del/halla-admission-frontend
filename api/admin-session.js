import {
  json,
  requireSession,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const session = requireSession(req, "admin");

  if (!session) {
    return json(res, 401, { success: false, message: "未登录" });
  }

  return json(res, 200, {
    success: true,
    session,
  });
}
