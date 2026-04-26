import {
  hashPassword,
  json,
  requireSession,
  supabaseAdmin,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = requireSession(req, "admin");

    if (!session || !session.admin_id) {
      return json(res, 401, {
        success: false,
        message: "管理员登录状态无效，请重新登录",
      });
    }

    const {
      agency_id = "",
      account_id = "",
      new_password = "",
    } = req.body || {};

    if (!String(agency_id).trim()) {
      return json(res, 400, { success: false, message: "缺少机构ID" });
    }

    if (!String(account_id).trim()) {
      return json(res, 400, { success: false, message: "缺少账号ID" });
    }

        if (!String(new_password).trim()) {
      return json(res, 400, { success: false, message: "请输入新密码" });
    }

    if (String(new_password).trim().length < 6) {
      return json(res, 400, { success: false, message: "新密码至少需要 6 位" });
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("id", account_id)
      .eq("agency_id", agency_id)
      .single();

    if (targetError) throw targetError;

    if (!target) {
      return json(res, 404, { success: false, message: "账号不存在" });
    }

    const { error } = await supabaseAdmin
      .from("agency_accounts")
      .update({
        password: hashPassword(String(new_password)),
      })
      .eq("id", account_id)
      .eq("agency_id", agency_id);

    if (error) throw error;

    return json(res, 200, {
      success: true,
      message: "密码已重置",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "重置密码失败",
    });
  }
}
