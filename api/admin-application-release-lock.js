import { json, requireSession, supabaseAdmin } from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = requireSession(req, "admin");

    if (!session?.admin_id) {
      return json(res, 401, { success: false, message: "未登录或登录失效" });
    }

    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { id = "" } = body || {};
    const admin_account_id = session.admin_id;

    if (!String(id).trim() || !String(admin_account_id).trim()) {
      return json(res, 400, { success: false, message: "缺少必要参数" });
    }

    const { error } = await supabaseAdmin
      .from("applications")
      .update({
        admin_editing_by_account_id: null,
        admin_editing_by_account_name: null,
        admin_editing_started_at: null,
      })
      .eq("id", id)
      .eq("admin_editing_by_account_id", admin_account_id);

    if (error) throw error;

    return json(res, 200, { success: true });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "释放管理员审核锁失败",
    });
  }
}
