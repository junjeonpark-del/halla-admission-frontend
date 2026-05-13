import {
  AGENCY_SESSION_COOKIE,
  json,
  setSessionCookie,
  signSession,
  supabaseAdmin,
  verifyPassword,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    usernameRequired: "请输入账号",
    passwordRequired: "请输入密码",
    accountMissing: "账号不存在",
    passwordWrong: "密码错误",
    agencyMissing: "机构不存在",
    agencyPending: "机构尚未审核通过",
    agencyRejected: "机构审核未通过",
    agencyDisabled: "机构已停用",
    accountInactive: "登录尚未启用",
    failed: "登录失败",
  },
  en: {
    usernameRequired: "Please enter your account",
    passwordRequired: "Please enter your password",
    accountMissing: "Account does not exist",
    passwordWrong: "Incorrect password",
    agencyMissing: "Agency does not exist",
    agencyPending: "Agency has not been approved yet",
    agencyRejected: "Agency approval was rejected",
    agencyDisabled: "Agency has been disabled",
    accountInactive: "Login has not been enabled yet",
    failed: "Login failed",
  },
  ko: {
    usernameRequired: "계정을 입력해 주세요",
    passwordRequired: "비밀번호를 입력해 주세요",
    accountMissing: "계정이 존재하지 않습니다",
    passwordWrong: "비밀번호가 올바르지 않습니다",
    agencyMissing: "기관이 존재하지 않습니다",
    agencyPending: "기관이 아직 승인되지 않았습니다",
    agencyRejected: "기관 승인이 거절되었습니다",
    agencyDisabled: "기관이 비활성화되었습니다",
    accountInactive: "로그인이 아직 활성화되지 않았습니다",
    failed: "로그인 실패",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const language = req.body?.language || "zh";
  const text = messages[["zh", "en", "ko"].includes(language) ? language : "zh"];

  try {
    const { username = "", password = "" } = req.body || {};

    if (!String(username).trim()) {
      return json(res, 400, { success: false, message: text.usernameRequired });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: text.passwordRequired });
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("username", String(username).trim())
      .limit(1)
      .maybeSingle();

    if (accountError) throw accountError;

    if (!account) {
      return json(res, 400, { success: false, message: text.accountMissing });
    }

    const passwordOk = verifyPassword(String(password), account.password);
    if (!passwordOk) {
      return json(res, 400, { success: false, message: text.passwordWrong });
    }

    const { data: agency, error: agencyError } = await supabaseAdmin
      .from("agencies")
      .select("*")
      .eq("id", account.agency_id)
      .single();

    if (agencyError) throw agencyError;

    if (!agency) {
      return json(res, 400, { success: false, message: text.agencyMissing });
    }

    if (String(agency.status) === "pending") {
      return json(res, 403, { success: false, message: text.agencyPending });
    }

    if (String(agency.status) === "rejected") {
      return json(res, 403, { success: false, message: text.agencyRejected });
    }

    if (String(agency.status) === "disabled") {
      return json(res, 403, { success: false, message: text.agencyDisabled });
    }

    if (account.is_active !== true) {
      return json(res, 403, { success: false, message: text.accountInactive });
    }

    const nextSessionVersion = Number(account.session_version || 0) + 1;

    const { error: sessionVersionError } = await supabaseAdmin
      .from("agency_accounts")
      .update({
        session_version: nextSessionVersion,
      })
      .eq("id", account.id);

    if (sessionVersionError) throw sessionVersionError;

    const sessionPayload = {
      agency_id: agency.id,
      agency_account_id: account.id,
      agency_unit_id: account.agency_unit_id || null,
      username: account.username,
      account_name: account.account_name || "",
      agency_name: agency.agency_name || "",
      is_primary: account.is_primary === true,
      role: "agency",
      session_version: nextSessionVersion,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    const token = signSession(sessionPayload);

    setSessionCookie(res, token, AGENCY_SESSION_COOKIE);

    return json(res, 200, {
      success: true,
      session: sessionPayload,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
