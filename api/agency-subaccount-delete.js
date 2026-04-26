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