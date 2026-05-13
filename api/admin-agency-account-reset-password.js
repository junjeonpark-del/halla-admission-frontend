import {
  hashPassword,
  json,
  requireSession,
  supabaseAdmin,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "管理员登录状态无效，请重新登录",
    missingAgencyId: "缺少机构ID",
    missingAccountId: "缺少账号ID",
    passwordRequired: "请输入新密码",
    passwordLength: "新密码至少需要 6 位",
    accountMissing: "账号不存在",
    success: "密码已重置",
    failed: "重置密码失败",
  },
  en: {
    invalidSession: "Admin session is invalid. Please log in again.",
    missingAgencyId: "Missing agency ID",
    missingAccountId: "Missing account ID",
    passwordRequired: "Please enter a new password",
    passwordLength: "New password must be at least 6 characters",
    accountMissing: "Account does not exist",
    success: "Password has been reset",
    failed: "Password reset failed",
  },
  ko: {
    invalidSession: "관리자 로그인 상태가 유효하지 않습니다. 다시 로그인해 주세요",
    missingAgencyId: "기관 ID가 없습니다",
    missingAccountId: "계정 ID가 없습니다",
    passwordRequired: "새 비밀번호를 입력해 주세요",
    passwordLength: "새 비밀번호는 최소 6자 이상이어야 합니다",
    accountMissing: "계정이 존재하지 않습니다",
    success: "비밀번호가 재설정되었습니다",
    failed: "비밀번호 재설정 실패",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const language = req.body?.language || "zh";
  const text = messages[["zh", "en", "ko"].includes(language) ? language : "zh"];

  try {
    const session = requireSession(req, "admin");

    if (!session || !session.admin_id) {
      return json(res, 401, {
        success: false,
        message: text.invalidSession,
      });
    }

    const {
      agency_id = "",
      account_id = "",
      new_password = "",
    } = req.body || {};

    if (!String(agency_id).trim()) {
      return json(res, 400, { success: false, message: text.missingAgencyId });
    }

    if (!String(account_id).trim()) {
      return json(res, 400, { success: false, message: text.missingAccountId });
    }

    if (!String(new_password).trim()) {
      return json(res, 400, { success: false, message: text.passwordRequired });
    }

    if (String(new_password).trim().length < 6) {
      return json(res, 400, { success: false, message: text.passwordLength });
    }

    const { data: target, error: targetError } = await supabaseAdmin
      .from("agency_accounts")
      .select("*")
      .eq("id", account_id)
      .eq("agency_id", agency_id)
      .single();

    if (targetError) throw targetError;

    if (!target) {
      return json(res, 404, { success: false, message: text.accountMissing });
    }

    const { error } = await supabaseAdmin
      .from("agency_accounts")
      .update({
        password: hashPassword(String(new_password)),
      })
      .eq("id", account_id)
      .eq("agency_id", agency_id);

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
