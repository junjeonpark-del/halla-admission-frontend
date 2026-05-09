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
        message: "只有主账号可以新增分机构",
      });
    }

    if (currentAccount.is_active !== true) {
      return json(res, 403, {
        success: false,
        message: "当前账号已停用",
      });
    }

    const { name = "", note = "" } = req.body || {};
    const unitName = String(name).trim();

    if (!unitName) {
      return json(res, 400, { success: false, message: "请填写分机构名称" });
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_units")
      .select("id")
      .eq("agency_id", session.agency_id)
      .eq("name", unitName)
      .limit(1);

    if (existingError) throw existingError;

    if (existingRows && existingRows.length > 0) {
      return json(res, 400, {
        success: false,
        message: "该分机构名称已存在",
      });
    }

    const { error } = await supabaseAdmin.from("agency_units").insert({
      agency_id: session.agency_id,
      name: unitName,
      note: String(note).trim() || null,
      is_default: false,
      is_active: true,
    });

    if (error) throw error;

    return json(res, 200, {
      success: true,
      message: "分机构创建成功",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "分机构创建失败",
    });
  }
}
