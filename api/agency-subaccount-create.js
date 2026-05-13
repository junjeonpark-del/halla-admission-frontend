import {
  hashPassword,
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以新增子账号",
    usernameRequired: "请填写用户名",
    usernameLength: "用户名长度必须为 4~20 位",
    usernameNoChinese: "用户名不能包含中文",
    passwordRequired: "请填写密码",
    branchRequired: "请选择所属分机构",
    branchMissing: "所属分机构不存在",
    branchInactive: "所属分机构已停用",
    usernameExists: "该用户名已存在，请更换",
    success: "子账号创建成功",
    failed: "创建子账号失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can create sub-accounts",
    usernameRequired: "Please enter a username",
    usernameLength: "Username must be 4-20 characters",
    usernameNoChinese: "Username cannot contain Chinese characters",
    passwordRequired: "Please enter a password",
    branchRequired: "Please select a branch",
    branchMissing: "Branch does not exist",
    branchInactive: "Branch has been disabled",
    usernameExists: "This username already exists. Please choose another one.",
    success: "Sub-account created successfully",
    failed: "Failed to create sub-account",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 하위 계정을 생성할 수 있습니다",
    usernameRequired: "아이디를 입력해 주세요",
    usernameLength: "아이디는 4~20자여야 합니다",
    usernameNoChinese: "아이디에는 중국어를 사용할 수 없습니다",
    passwordRequired: "비밀번호를 입력해 주세요",
    branchRequired: "소속 분기관을 선택해 주세요",
    branchMissing: "소속 분기관이 존재하지 않습니다",
    branchInactive: "소속 분기관이 비활성화되었습니다",
    usernameExists: "이미 존재하는 아이디입니다. 다른 아이디를 사용하세요.",
    success: "하위 계정이 생성되었습니다",
    failed: "하위 계정 생성 실패",
  },
};

const hasChinese = (value) => /[\u4e00-\u9fff]/.test(String(value || ""));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const language = req.body?.language || "zh";
  const text = messages[["zh", "en", "ko"].includes(language) ? language : "zh"];

  try {
    const session = await validateAgencySession(req);

    if (!session?.agency_id || !session?.agency_account_id) {
      return json(res, 401, { success: false, message: text.invalidSession });
    }

    if (session.is_primary !== true) {
      return json(res, 403, { success: false, message: text.primaryOnly });
    }

    const {
      username = "",
      password = "",
      account_name = "",
      phone = "",
      email = "",
      agency_unit_id = "",
      is_active = true,
    } = req.body || {};

    const cleanUsername = String(username).trim();

    if (!cleanUsername) {
      return json(res, 400, { success: false, message: text.usernameRequired });
    }

    if (cleanUsername.length < 4 || cleanUsername.length > 20) {
      return json(res, 400, { success: false, message: text.usernameLength });
    }

    if (hasChinese(cleanUsername)) {
      return json(res, 400, { success: false, message: text.usernameNoChinese });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: text.passwordRequired });
    }

    if (!String(agency_unit_id).trim()) {
      return json(res, 400, { success: false, message: text.branchRequired });
    }

    const { data: unitRow, error: unitError } = await supabaseAdmin
      .from("agency_units")
      .select("id, agency_id, is_active")
      .eq("id", String(agency_unit_id).trim())
      .eq("agency_id", session.agency_id)
      .maybeSingle();

    if (unitError) throw unitError;

    if (!unitRow) {
      return json(res, 400, { success: false, message: text.branchMissing });
    }

    if (unitRow.is_active !== true) {
      return json(res, 400, { success: false, message: text.branchInactive });
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", cleanUsername)
      .limit(1);

    if (existingError) throw existingError;

    if (existingRows && existingRows.length > 0) {
      return json(res, 400, { success: false, message: text.usernameExists });
    }

    const payload = {
      agency_id: session.agency_id,
      agency_unit_id: String(agency_unit_id).trim(),
      username: cleanUsername,
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
      message: text.success,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
