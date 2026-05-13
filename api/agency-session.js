import {
  AGENCY_SESSION_COOKIE,
  clearSessionCookie,
  json,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    notLoggedIn: "未登录",
    failed: "机构会话校验失败",
  },
  en: {
    notLoggedIn: "Not logged in",
    failed: "Failed to verify agency session",
  },
  ko: {
    notLoggedIn: "로그인되어 있지 않습니다",
    failed: "기관 세션 확인 실패",
  },
};

function getLanguage(req) {
  const value = req.query?.language || "zh";
  return ["zh", "en", "ko"].includes(value) ? value : "zh";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const text = messages[getLanguage(req)];

  try {
    const session = await validateAgencySession(req);

    if (!session) {
      clearSessionCookie(res, AGENCY_SESSION_COOKIE);
      return json(res, 401, { success: false, message: text.notLoggedIn });
    }

    return json(res, 200, {
      success: true,
      session,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
