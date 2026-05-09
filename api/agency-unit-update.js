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
        message: "只有主账号可以管理分机构",
      });
    }

    if (currentAccount.is_active !== true) {
      return json(res, 403, {
        success: false,
        message: "当前账号已停用",
      });
    }

    const { id, name = "", note = "", is_active } = req.body || {};
    const unitId = String(id || "").trim();

    if (!unitId) {
      return json(res, 400, { success: false, message: "缺少分机构ID" });
    }

    const { data: unit, error: unitError } = await supabaseAdmin
      .from("agency_units")
      .select("id, agency_id, name, is_default, is_active")
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
        message: "主机构信息请通过编辑机构信息修改",
      });
    }

    const nextName = String(name).trim();

    if (!nextName) {
      return json(res, 400, { success: false, message: "请填写分机构名称" });
    }

    if (nextName !== unit.name) {
      const { data: duplicatedRows, error: duplicatedError } = await supabaseAdmin
        .from("agency_units")
        .select("id")
        .eq("agency_id", session.agency_id)
        .eq("name", nextName)
        .neq("id", unitId)
        .limit(1);

      if (duplicatedError) throw duplicatedError;

      if (duplicatedRows && duplicatedRows.length > 0) {
        return json(res, 400, {
          success: false,
          message: "该分机构名称已存在",
        });
      }
    }

    const nextActive =
      typeof is_active === "boolean" ? is_active : unit.is_active === true;

    const { error: updateError } = await supabaseAdmin
      .from("agency_units")
      .update({
        name: nextName,
        note: String(note || "").trim() || null,
        is_active: nextActive,
      })
      .eq("id", unitId)
      .eq("agency_id", session.agency_id);

    if (updateError) throw updateError;

    if (nextActive === false) {
      const { error: disableAccountsError } = await supabaseAdmin
        .from("agency_accounts")
        .update({ is_active: false })
        .eq("agency_id", session.agency_id)
        .eq("agency_unit_id", unitId)
        .eq("is_primary", false);

      if (disableAccountsError) throw disableAccountsError;
    }

    return json(res, 200, {
      success: true,
      message: "分机构已更新",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "分机构更新失败",
    });
  }
}
