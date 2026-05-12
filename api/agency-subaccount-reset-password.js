import {
  hashPassword,
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

    if (!session?.agency_id || !session?.agency_account_id) {
      return json(res, 401, { success: false, message: "登录已失效" });
    }

    if (session.is_primary !== true) {
      return json(res, 403, {
        success: false,
        message: "只有主账号可以重置密码",
      });
    }

    const { id = "", new_password = "" } = req.body || {};

    if (!String(id).trim()) {
      return json(res, 400, { success: false, message: "缺少账号ID" });
    }

    if (!String(new_password).trim()) {
      return json(res, 400, { success: false, message: "请输入新密码" });
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("id", id)
      .eq("agency_id", session.agency_id)
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
      .eq("id", id)
      .eq("agency_id", session.agency_id);

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