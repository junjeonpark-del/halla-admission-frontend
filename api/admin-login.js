import {
  ADMIN_SESSION_COOKIE,
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
      return json(res, 400, { success: false, message: "请输入管理员账号" });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: "请输入密码" });
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admin_accounts")
      .select("*")
      .eq("username", String(username).trim())
      .limit(1)
      .maybeSingle();

    if (adminError) throw adminError;

    if (!admin) {
      return json(res, 400, { success: false, message: "管理员账号不存在" });
    }

    const passwordOk = verifyPassword(String(password), admin.password);
    if (!passwordOk) {
      return json(res, 400, { success: false, message: "密码错误" });
    }

    if (admin.is_active !== true) {
      return json(res, 403, { success: false, message: "管理员账号已停用" });
    }

    const sessionPayload = {
      admin_id: admin.id,
      username: admin.username,
      name: admin.name || "",
      email: admin.email || "",
      role: "admin",
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
      message: error.message || "管理员登录失败",
    });
  }
}
