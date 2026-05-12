import {
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
        message: "只有主账号可以删除子账号",
      });
    }

    const { id = "" } = req.body || {};

    if (!String(id).trim()) {
      return json(res, 400, { success: false, message: "缺少账号ID" });
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

    if (target.is_primary === true) {
      return json(res, 400, { success: false, message: "主账号不能删除" });
    }

    const { error } = await supabaseAdmin
      .from("agency_accounts")
      .delete()
      .eq("id", id)
      .eq("agency_id", session.agency_id);

    if (error) throw error;

    return json(res, 200, {
      success: true,
      message: "账号已删除",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "删除账号失败",
    });
  }
}