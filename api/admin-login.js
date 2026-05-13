import {
  ADMIN_SESSION_COOKIE,
  json,
  setSessionCookie,
  signSession,
  supabaseAdmin,
  verifyPassword,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    usernameRequired: "请输入管理员账号",
    passwordRequired: "请输入密码",
    accountMissing: "管理员账号不存在",
    passwordWrong: "密码错误",
    accountInactive: "管理员账号已停用",
    failed: "管理员登录失败",
  },
  en: {
    usernameRequired: "Please enter the admin account",
    passwordRequired: "Please enter the password",
    accountMissing: "Admin account does not exist",
    passwordWrong: "Incorrect password",
    accountInactive: "Admin account has been disabled",
    failed: "Admin login failed",
  },
  ko: {
    usernameRequired: "관리자 계정을 입력해 주세요",
    passwordRequired: "비밀번호를 입력해 주세요",
    accountMissing: "관리자 계정이 존재하지 않습니다",
    passwordWrong: "비밀번호가 올바르지 않습니다",
    accountInactive: "관리자 계정이 비활성화되었습니다",
    failed: "관리자 로그인 실패",
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

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_accounts")
      .select("*")
      .eq("username", String(username).trim())
      .limit(1)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
      return json(res, 400, { success: false, message: text.accountMissing });
    }

    const passwordOk = verifyPassword(String(password), admin.password);
    if (!passwordOk) {
      return json(res, 400, { success: false, message: text.passwordWrong });
    }

    if (admin.is_active !== true) {
      return json(res, 403, { success: false, message: text.accountInactive });
    }

    const nextSessionVersion = Number(admin.session_version || 0) + 1;

    const { error: sessionVersionError } = await supabaseAdmin
      .from("admin_accounts")
      .update({
        session_version: nextSessionVersion,
      })
      .eq("id", admin.id);

    if (sessionVersionError) throw sessionVersionError;

    const sessionPayload = {
      admin_id: admin.id,
      username: admin.username,
      name: admin.name || "",
      email: admin.email || "",
      role: "admin",
      session_version: nextSessionVersion,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };

    const token = signSession(sessionPayload);

    setSessionCookie(res, token, ADMIN_SESSION_COOKIE);

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
