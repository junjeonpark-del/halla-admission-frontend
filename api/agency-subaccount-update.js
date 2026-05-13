import {
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以修改账号",
    missingId: "缺少账号ID",
    usernameRequired: "请填写用户名",
    usernameLength: "用户名长度必须为 4~20 位",
    usernameNoChinese: "用户名不能包含中文",
    accountMissing: "账号不存在",
    primaryCannotDisable: "主账号不能停用",
    branchRequired: "请选择所属分机构",
    branchMissing: "所属分机构不存在",
    branchInactive: "所属分机构已停用",
    usernameExists: "该用户名已存在，请更换",
    success: "账号信息已更新",
    failed: "修改账号失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can edit accounts",
    missingId: "Missing account ID",
    usernameRequired: "Please enter a username",
    usernameLength: "Username must be 4-20 characters",
    usernameNoChinese: "Username cannot contain Chinese characters",
    accountMissing: "Account does not exist",
    primaryCannotDisable: "The primary account cannot be disabled",
    branchRequired: "Please select a branch",
    branchMissing: "Branch does not exist",
    branchInactive: "Branch has been disabled",
    usernameExists: "This username already exists. Please choose another one.",
    success: "Account information updated",
    failed: "Failed to update account",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 계정을 수정할 수 있습니다",
    missingId: "계정 ID가 없습니다",
    usernameRequired: "아이디를 입력해 주세요",
    usernameLength: "아이디는 4~20자여야 합니다",
    usernameNoChinese: "아이디에는 중국어를 사용할 수 없습니다",
    accountMissing: "계정이 존재하지 않습니다",
    primaryCannotDisable: "주 계정은 비활성화할 수 없습니다",
    branchRequired: "소속 분기관을 선택해 주세요",
    branchMissing: "소속 분기관이 존재하지 않습니다",
    branchInactive: "소속 분기관이 비활성화되었습니다",
    usernameExists: "이미 존재하는 아이디입니다. 다른 아이디를 사용하세요.",
    success: "계정 정보가 수정되었습니다",
    failed: "계정 수정 실패",
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
      id = "",
      username = "",
      account_name = "",
      phone = "",
      email = "",
      agency_unit_id = "",
      is_active = true,
    } = req.body || {};

    const cleanUsername = String(username).trim();

    if (!String(id).trim()) {
      return json(res, 400, { success: false, message: text.missingId });
    }

    if (!cleanUsername) {
      return json(res, 400, { success: false, message: text.usernameRequired });
    }

    if (cleanUsername.length < 4 || cleanUsername.length > 20) {
      return json(res, 400, { success: false, message: text.usernameLength });
    }

    if (hasChinese(cleanUsername)) {
      return json(res, 400, { success: false, message: text.usernameNoChinese });
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("id", id)
      .eq("agency_id", session.agency_id)
      .single();

    if (targetError) throw targetError;

    if (!target) {
      return json(res, 404, { success: false, message: text.accountMissing });
    }

    if (target.is_primary === true && is_active !== true) {
      return json(res, 400, { success: false, message: text.primaryCannotDisable });
    }

    let nextAgencyUnitId = target.agency_unit_id || null;

    if (target.is_primary !== true) {
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

      nextAgencyUnitId = unitRow.id;
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", cleanUsername);

    if (existingError) throw existingError;

    const conflict = (existingRows || []).find((item) => item.id !== id);
    if (conflict) {
      return json(res, 400, { success: false, message: text.usernameExists });
    }

    const payload = {
      username: cleanUsername,
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
      message: text.success,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
