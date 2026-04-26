import {
  json,
  requireSession,
  supabaseAdmin,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const session = requireSession(req, "agency");

    if (!session?.agency_account_id) {
      return json(res, 401, { success: false, message: "未登录或登录失效" });
    }

    let body = req.body;

    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }

    const { id = "" } = body || {};
    const agency_account_id = session.agency_account_id;

    if (!String(id).trim() || !String(agency_account_id).trim()) {
      return json(res, 400, { success: false, message: "缺少必要参数" });
    }

    const { error } = await supabaseAdmin
      .from("applications")
      .update({
        editing_by_account_id: null,
        editing_by_account_name: null,
        editing_started_at: null,
      })
      .eq("id", id)
      .eq("editing_by_account_id", agency_account_id);

    if (error) throw error;

    return json(res, 200, { success: true });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "释放编辑锁失败",
    });
  }
}
