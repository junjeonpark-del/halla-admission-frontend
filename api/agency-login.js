import {
  AGENCY_SESSION_COOKIE,
  json,
  setSessionCookie,
  signSession,
  supabaseAdmin,
  verifyPassword,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const { username = "", password = "" } = req.body || {};

    if (!String(username).trim()) {
      return json(res, 400, { success: false, message: "请输入账号" });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: "请输入密码" });
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("username", String(username).trim())
      .limit(1)
      .maybeSingle();

    if (accountError) throw accountError;

    if (!account) {
      return json(res, 400, { success: false, message: "账号不存在" });
    }

    const passwordOk = verifyPassword(String(password), account.password);
    if (!passwordOk) {
      return json(res, 400, { success: false, message: "密码错误" });
    }

    const { data: agency, error: agencyError } = await supabaseAdmin
      .from("agencies")
      .select("*")
      .eq("id", account.agency_id)
      .single();

    if (agencyError) throw agencyError;

    if (!agency) {
      return json(res, 400, { success: false, message: "机构不存在" });
    }

    if (String(agency.status) === "pending") {
      return json(res, 403, { success: false, message: "机构尚未审核通过" });
    }

    if (String(agency.status) === "rejected") {
      return json(res, 403, { success: false, message: "机构审核未通过" });
    }

    if (String(agency.status) === "disabled") {
      return json(res, 403, { success: false, message: "机构已停用" });
    }

    if (account.is_active !== true) {
      return json(res, 403, { success: false, message: "账号尚未启用" });
    }

    const sessionPayload = {
      agency_id: agency.id,
      agency_account_id: account.id,
      username: account.username,
      account_name: account.account_name || "",
      agency_name: agency.agency_name || "",
      role: "agency",
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
      message: error.message || "登录失败",
    });
  }
}
