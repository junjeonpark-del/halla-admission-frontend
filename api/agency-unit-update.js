import {
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以管理分机构",
    missingId: "缺少分机构ID",
    unitMissing: "分机构不存在",
    defaultUnitBlocked: "主机构信息请通过编辑机构信息修改",
    nameRequired: "请填写分机构名称",
    nameExists: "该分机构名称已存在",
    success: "分机构已更新",
    failed: "分机构更新失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can manage branches",
    missingId: "Missing branch ID",
    unitMissing: "Branch does not exist",
    defaultUnitBlocked: "Please edit the main agency information from Agency Information",
    nameRequired: "Please enter the branch name",
    nameExists: "This branch name already exists",
    success: "Branch updated",
    failed: "Failed to update branch",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 분기관을 관리할 수 있습니다",
    missingId: "분기관 ID가 없습니다",
    unitMissing: "분기관이 존재하지 않습니다",
    defaultUnitBlocked: "본부 정보는 기관 정보 수정에서 변경해 주세요",
    nameRequired: "분기관명을 입력해 주세요",
    nameExists: "이미 존재하는 분기관명입니다",
    success: "분기관이 수정되었습니다",
    failed: "분기관 수정 실패",
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

    const { id, name = "", note = "", is_active } = req.body || {};
    const unitId = String(id || "").trim();

    if (!unitId) {
      return json(res, 400, { success: false, message: text.missingId });
    }

    const { data: unit, error: unitError } = await supabaseAdmin
      .from("agency_units")
      .select("id, agency_id, name, is_default, is_active")
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

    const nextName = String(name).trim();

    if (!nextName) {
      return json(res, 400, { success: false, message: text.nameRequired });
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
          message: text.nameExists,
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
      message: text.success,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
