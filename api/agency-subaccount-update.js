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

    if (!session || !session.agency_id) {
      return json(res, 401, { success: false, message: "未登录或登录失效" });
    }
    const { data: currentAccount, error: currentAccountError } = await supabaseAdmin
  .from("agency_accounts")
  .select("*")
  .eq("id", session.agency_account_id)
  .eq("agency_id", session.agency_id)
  .single();

if (currentAccountError) throw currentAccountError;

if (!currentAccount || currentAccount.is_primary !== true) {
  return json(res, 403, {
    success: false,
    message: "只有主账号可以修改账号",
  });
}

    const {
  id = "",
  username = "",
  account_name = "",
  phone = "",
  email = "",
  agency_unit_id = "",
  is_active = true,
} = req.body || {};

    if (!String(id).trim()) {
      return json(res, 400, { success: false, message: "缺少账号ID" });
    }

    if (!String(username).trim()) {
      return json(res, 400, { success: false, message: "请填写用户名" });
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

    if (target.is_primary === true && is_active !== true) {
      return json(res, 400, { success: false, message: "主账号不能停用" });
    }

    let nextAgencyUnitId = target.agency_unit_id || null;

if (target.is_primary !== true) {
  if (!String(agency_unit_id).trim()) {
    return json(res, 400, { success: false, message: "请选择所属分机构" });
  }

  const { data: unitRow, error: unitError } = await supabaseAdmin
    .from("agency_units")
    .select("id, agency_id, is_active")
    .eq("id", String(agency_unit_id).trim())
    .eq("agency_id", session.agency_id)
    .maybeSingle();

  if (unitError) throw unitError;

  if (!unitRow) {
    return json(res, 400, { success: false, message: "所属分机构不存在" });
  }

  if (unitRow.is_active !== true) {
    return json(res, 400, { success: false, message: "所属分机构已停用" });
  }

  nextAgencyUnitId = unitRow.id;
}

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", String(username).trim());

    if (existingError) throw existingError;

    const conflict = (existingRows || []).find((item) => item.id !== id);
    if (conflict) {
      return json(res, 400, { success: false, message: "该用户名已存在，请更换" });
    }

    const payload = {
  username: String(username).trim(),
  account_name: String(account_name).trim() || null,
  phone: String(phone).trim() || null,
  email: String(email).trim() || null,
  agency_unit_id: target.is_primary === true ? target.agency_unit_id : nextAgencyUnitId,
  is_active: target.is_primary === true ? true : is_active === true,
};

    const { error } = await supabaseAdmin
      .from("agency_accounts")
      .update(payload)
      .eq("id", id)
      .eq("agency_id", session.agency_id);

    if (error) throw error;

    return json(res, 200, {
      success: true,
      message: "账号信息已更新",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "修改账号失败",
    });
  }
}