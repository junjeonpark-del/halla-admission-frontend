import {
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以删除分机构",
    missingId: "缺少分机构ID",
    unitMissing: "分机构不存在",
    defaultUnitBlocked: "主机构不能删除",
    hasAccounts: "该分机构下还有子账号，不能删除。请先停用或删除相关账号。",
    hasApplications: "该分机构下还有申请记录，不能删除。建议停用该分机构。",
    success: "分机构已删除",
    failed: "分机构删除失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can delete branches",
    missingId: "Missing branch ID",
    unitMissing: "Branch does not exist",
    defaultUnitBlocked: "The main agency branch cannot be deleted",
    hasAccounts: "This branch still has sub-accounts and cannot be deleted. Please disable or delete those accounts first.",
    hasApplications: "This branch still has application records and cannot be deleted. Please disable this branch instead.",
    success: "Branch deleted",
    failed: "Failed to delete branch",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 분기관을 삭제할 수 있습니다",
    missingId: "분기관 ID가 없습니다",
    unitMissing: "분기관이 존재하지 않습니다",
    defaultUnitBlocked: "본부 분기관은 삭제할 수 없습니다",
    hasAccounts: "해당 분기관에 하위 계정이 있어 삭제할 수 없습니다. 먼저 관련 계정을 비활성화하거나 삭제해 주세요.",
    hasApplications: "해당 분기관에 지원 기록이 있어 삭제할 수 없습니다. 해당 분기관을 비활성화하는 것을 권장합니다.",
    success: "분기관이 삭제되었습니다",
    failed: "분기관 삭제 실패",
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

    const { id } = req.body || {};
    const unitId = String(id || "").trim();

    if (!unitId) {
      return json(res, 400, { success: false, message: text.missingId });
    }

    const { data: unit, error: unitError } = await supabaseAdmin
      .from("agency_units")
      .select("id, agency_id, name, is_default")
      .eq("id", unitId)
      .eq("agency_id", session.agency_id)
      .single();

    if (unitError) throw unitError;

    if (!unit) {
      return json(res, 404, { success: false, message: text.unitMissing });
    }

    if (unit.is_default === true) {
      return json(res, 400, {
        success: false,
        message: text.defaultUnitBlocked,
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
        message: text.hasAccounts,
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
        message: text.hasApplications,
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
      message: text.success,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
