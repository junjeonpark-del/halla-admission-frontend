import {
  AGENCY_SESSION_COOKIE,
  clearSessionCookie,
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = await validateAgencySession(req);

    if (session?.agency_account_id) {
      const nextSessionVersion = Number(session.session_version || 0) + 1;

      const { error } = await supabaseAdmin
        .from("agency_accounts")
        .update({
          session_version: nextSessionVersion,
        })
        .eq("id", session.agency_account_id);

      if (error) throw error;
    }

    clearSessionCookie(res, AGENCY_SESSION_COOKIE);

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
