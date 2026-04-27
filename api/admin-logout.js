import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookie,
  json,
  supabaseAdmin,
  validateAdminSession,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = await validateAdminSession(req);

    if (session?.admin_id) {
      const nextSessionVersion = Number(session.session_version || 0) + 1;

      const { error } = await supabaseAdmin
        .from("admin_accounts")
        .update({
          session_version: nextSessionVersion,
        })
        .eq("id", session.admin_id);

      if (error) throw error;
    }

    clearSessionCookie(res, ADMIN_SESSION_COOKIE);

    return json(res, 200, {
      success: true,
      message: "已退出登录",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "退出登录失败",
    });
  }
}
