import {
  hashPassword,
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
    message: "只有主账号可以新增子账号",
  });
}

    const {
      username = "",
      password = "",
      account_name = "",
      phone = "",
      email = "",
      is_active = true,
    } = req.body || {};

    if (!String(username).trim()) {
      return json(res, 400, { success: false, message: "请填写用户名" });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: "请填写密码" });
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", String(username).trim())
      .limit(1);

    if (existingError) throw existingError;

    if (existingRows && existingRows.length > 0) {
      return json(res, 400, { success: false, message: "该用户名已存在，请更换" });
    }

    const payload = {
      agency_id: session.agency_id,
      username: String(username).trim(),
      password: hashPassword(String(password)),
      account_name: String(account_name).trim() || null,
      phone: String(phone).trim() || null,
      email: String(email).trim() || null,
      is_primary: false,
      is_active: is_active === true,
    };

    const { error } = await supabaseAdmin.from("agency_accounts").insert(payload);

    if (error) throw error;

    return json(res, 200, {
      success: true,
      message: "子账号创建成功",
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || "创建子账号失败",
    });
  }
}