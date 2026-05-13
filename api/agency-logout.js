import {
  AGENCY_SESSION_COOKIE,
  clearSessionCookie,
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    success: "已退出登录",
    failed: "退出登录失败",
  },
  en: {
    success: "Logged out",
    failed: "Failed to log out",
  },
  ko: {
    success: "로그아웃되었습니다",
    failed: "로그아웃 실패",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const language = req.body?.language || "zh";
  const text = messages[["zh", "en", "ko"].includes(language) ? language : "zh"];

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
      message: text.success,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
