import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookie,
  json,
  validateAdminSession,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = await validateAdminSession(req);

    if (!session) {
      clearSessionCookie(res, ADMIN_SESSION_COOKIE);
      return json(res, 401, { success: false, message: "未登录" });
    }

    return json(res, 200, {
      success: true,
      session,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "管理员会话校验失败",
    });
  }
}
