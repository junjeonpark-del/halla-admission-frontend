import {
  json,
  supabaseAdmin,
  validateAgencySession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "登录已失效",
    primaryOnly: "只有主账号可以新增分机构",
    nameRequired: "请填写分机构名称",
    nameExists: "该分机构名称已存在",
    success: "分机构创建成功",
    failed: "分机构创建失败",
  },
  en: {
    invalidSession: "Login session has expired",
    primaryOnly: "Only the primary account can create branches",
    nameRequired: "Please enter the branch name",
    nameExists: "This branch name already exists",
    success: "Branch created successfully",
    failed: "Failed to create branch",
  },
  ko: {
    invalidSession: "로그인이 만료되었습니다",
    primaryOnly: "주 계정만 분기관을 생성할 수 있습니다",
    nameRequired: "분기관명을 입력해 주세요",
    nameExists: "이미 존재하는 분기관명입니다",
    success: "분기관이 생성되었습니다",
    failed: "분기관 생성 실패",
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

    const { name = "", note = "" } = req.body || {};
    const unitName = String(name).trim();

    if (!unitName) {
      return json(res, 400, { success: false, message: text.nameRequired });
    }

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from("agency_units")
      .select("id")
      .eq("agency_id", session.agency_id)
      .eq("name", unitName)
      .limit(1);

    if (existingError) throw existingError;

    if (existingRows && existingRows.length > 0) {
      return json(res, 400, {
        success: false,
        message: text.nameExists,
      });
    }

    const { error } = await supabaseAdmin.from("agency_units").insert({
      agency_id: session.agency_id,
      name: unitName,
      note: String(note).trim() || null,
      is_default: false,
      is_active: true,
    });

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
