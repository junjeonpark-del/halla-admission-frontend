import {
  json,
  supabaseAdmin,
  validateAdminSession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "管理员登录已失效",
    missingAgencyId: "缺少机构ID",
    agencyMissing: "机构不存在",
    failed: "同步机构本部失败",
  },
  en: {
    invalidSession: "Admin session has expired",
    missingAgencyId: "Missing agency ID",
    agencyMissing: "Agency does not exist",
    failed: "Failed to sync the agency headquarters branch",
  },
  ko: {
    invalidSession: "관리자 로그인이 만료되었습니다",
    missingAgencyId: "기관 ID가 없습니다",
    agencyMissing: "기관이 존재하지 않습니다",
    failed: "기관 본부 분기관 동기화 실패",
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  const language = req.body?.language || "zh";
  const text = messages[["zh", "en", "ko"].includes(language) ? language : "zh"];

  try {
    const session = await validateAdminSession(req);

    if (!session?.admin_id) {
      return json(res, 401, { success: false, message: text.invalidSession });
    }

    const { agency_id = "" } = req.body || {};
    const agencyId = String(agency_id || "").trim();

    if (!agencyId) {
      return json(res, 400, { success: false, message: text.missingAgencyId });
    }

    const { data: agency, error: agencyError } = await supabaseAdmin
      .from("agencies")
      .select("id, agency_name")
      .eq("id", agencyId)
      .single();

    if (agencyError) throw agencyError;

    if (!agency) {
      return json(res, 404, { success: false, message: text.agencyMissing });
    }

    let unitId = "";

    const { data: defaultUnits, error: defaultUnitError } = await supabaseAdmin
      .from("agency_units")
      .select("id")
      .eq("agency_id", agencyId)
      .eq("is_default", true)
      .limit(1);

    if (defaultUnitError) throw defaultUnitError;

    if (defaultUnits && defaultUnits.length > 0) {
      unitId = defaultUnits[0].id;
    } else {
      const { data: sameNameUnits, error: sameNameError } = await supabaseAdmin
        .from("agency_units")
        .select("id")
        .eq("agency_id", agencyId)
        .eq("name", agency.agency_name)
        .limit(1);

      if (sameNameError) throw sameNameError;

      if (sameNameUnits && sameNameUnits.length > 0) {
        unitId = sameNameUnits[0].id;

        const { error: updateUnitError } = await supabaseAdmin
          .from("agency_units")
          .update({
            is_default: true,
            is_active: true,
          })
          .eq("id", unitId)
          .eq("agency_id", agencyId);

        if (updateUnitError) throw updateUnitError;
      } else {
        const { data: newUnit, error: insertUnitError } = await supabaseAdmin
          .from("agency_units")
          .insert({
            agency_id: agencyId,
            name: agency.agency_name,
            note: null,
            is_default: true,
            is_active: true,
          })
          .select("id")
          .single();

        if (insertUnitError) throw insertUnitError;

        unitId = newUnit.id;
      }
    }

    const { error: accountUpdateError } = await supabaseAdmin
      .from("agency_accounts")
      .update({
        agency_unit_id: unitId,
      })
      .eq("agency_id", agencyId)
      .is("agency_unit_id", null);

    if (accountUpdateError) throw accountUpdateError;

    return json(res, 200, {
      success: true,
      agency_unit_id: unitId,
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
