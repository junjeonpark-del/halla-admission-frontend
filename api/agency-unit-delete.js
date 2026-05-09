import {
  json,
  parseCookies,
  supabaseAdmin,
  verifySession,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  try {
    const cookies = parseCookies(req);
    const token = cookies.agency_session;
    const session = verifySession(token);

    if (!session || !session.agency_id || !session.agency_account_id) {
      return json(res, 401, { success: false, message: "登录已失效" });
    }

    const { data: currentAccount, error: currentAccountError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, agency_id, is_primary, is_active")
      .eq("id", session.agency_account_id)
      .eq("agency_id", session.agency_id)
      .single();

    if (currentAccountError) throw currentAccountError;

    if (!currentAccount || currentAccount.is_primary !== true) {
      return json(res, 403, {
        success: false,
        message: "只有主账号可以删除分机构",
      });
    }

    if (currentAccount.is_active !== true) {
      return json(res, 403, {
        success: false,
        message: "当前账号已停用",
      });
    }

    const { id } = req.body || {};
    const unitId = String(id || "").trim();

    if (!unitId) {
      return json(res, 400, { success: false, message: "缺少分机构ID" });
    }

    const { data: unit, error: unitError } = await supabaseAdmin
      .from("agency_units")
      .select("id, agency_id, name, is_default")
      .eq("id", unitId)
      .eq("agency_id", session.agency_id)
      .single();

    if (unitError) throw unitError;

    if (!unit) {
      return json(res, 404, { success: false, message: "分机构不存在" });
    }

    if (unit.is_default === true) {
      return json(res, 400, {
        success: false,
        message: "主机构不能删除",
      });
    }

    const { data: accountRows, error: accountError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id")
      .eq("agency_id", session.agency_id)
      .eq("agency_unit_id", unitId)
      .limit(1);

    if (accountError) throw accountError;

    if (accountRows && accountRows.length > 0) {
      return json(res, 400, {
        success: false,
        message: "该分机构下还有子账号，不能删除。请先停用或删除相关账号。",
      });
    }

    const { data: applicationRows, error: applicationError } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("agency_id", session.agency_id)
      .eq("agency_unit_id", unitId)
      .limit(1);

    if (applicationError) throw applicationError;

    if (applicationRows && applicationRows.length > 0) {
      return json(res, 400, {
        success: false,
        message: "该分机构下还有申请记录，不能删除。建议停用该分机构。",
      });
    }

    const { error: deleteError } = await supabaseAdmin
      .from("agency_units")
      .delete()
      .eq("id", unitId)
      .eq("agency_id", session.agency_id);

    if (deleteError) throw deleteError;

    return json(res, 200, {
      success: true,
      message: "分机构已删除",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "分机构删除失败",
    });
  }
}
