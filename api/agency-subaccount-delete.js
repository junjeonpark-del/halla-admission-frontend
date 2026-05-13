import {
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以删除子账号",
    missingId: "缺少账号ID",
    accountMissing: "账号不存在",
    primaryCannotDelete: "主账号不能删除",
    success: "账号已删除",
    failed: "删除账号失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can delete sub-accounts",
    missingId: "Missing account ID",
    accountMissing: "Account does not exist",
    primaryCannotDelete: "The primary account cannot be deleted",
    success: "Account deleted",
    failed: "Failed to delete account",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 하위 계정을 삭제할 수 있습니다",
    missingId: "계정 ID가 없습니다",
    accountMissing: "계정이 존재하지 않습니다",
    primaryCannotDelete: "주 계정은 삭제할 수 없습니다",
    success: "계정이 삭제되었습니다",
    failed: "계정 삭제 실패",
  },
};

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
      return json(res, 403, {
        success: false,
        message: text.primaryOnly,
      });
    }

    const { id = "" } = req.body || {};

    if (!String(id).trim()) {
      return json(res, 400, { success: false, message: text.missingId });
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

    if (target.is_primary === true) {
      return json(res, 400, { success: false, message: text.primaryCannotDelete });
    }

    const { error } = await supabaseAdmin
      .from("agency_accounts")
      .delete()
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
