import {
  json,
  supabaseAdmin,
  validateAdminSession,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    notLoggedIn: "管理员未登录",
    needApplication: "缺少申请ID",
    failed: "读取操作日志失败",
  },
  en: {
    notLoggedIn: "Admin is not logged in",
    needApplication: "Application ID is required",
    failed: "Failed to load operation logs",
  },
  ko: {
    notLoggedIn: "관리자 로그인이 필요합니다",
    needApplication: "지원서 ID가 필요합니다",
    failed: "작업 로그를 불러오지 못했습니다",
  },
};

function getLanguage(req) {
  const language = req.query?.language || "zh";
  return ["zh", "en", "ko"].includes(language)
    ? language
    : "zh";
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, {
      success: false,
      message: "Method Not Allowed",
    });
  }

  const text = messages[getLanguage(req)];

  try {
    const session = await validateAdminSession(req);

    if (!session?.admin_id) {
      return json(res, 401, {
        success: false,
        message: text.notLoggedIn,
      });
    }

    const applicationId = String(
      req.query?.application_id || ""
    ).trim();

    if (!applicationId) {
      return json(res, 400, {
        success: false,
        message: text.needApplication,
      });
    }

    const { data, error } = await supabaseAdmin
      .from("application_audit_logs")
      .select(
        "id, application_id, material_file_id, action_type, operator_id, operator_name, changed_fields, details, created_at"
      )
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false })
      .limit(4);

    if (error) throw error;

    res.setHeader("Cache-Control", "no-store");

    return json(res, 200, {
      success: true,
      logs: data || [],
    });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}