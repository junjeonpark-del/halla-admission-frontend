import { json, requireSession, supabaseAdmin } from "./_agencyAuth.js";

const messages = {
  zh: {
    invalidSession: "未登录或登录失效",
    missingParams: "缺少必要参数",
    failed: "释放管理员审核锁失败",
  },
  en: {
    invalidSession: "Not logged in or session has expired",
    missingParams: "Missing required parameters",
    failed: "Failed to release admin review lock",
  },
  ko: {
    invalidSession: "로그인되어 있지 않거나 로그인이 만료되었습니다",
    missingParams: "필수 파라미터가 없습니다",
    failed: "관리자 심사 잠금 해제 실패",
  },
};

function getLanguage(body) {
  const value = body?.language || "zh";
  return ["zh", "en", "ko"].includes(value) ? value : "zh";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  let body = req.body;

  try {
    if (typeof body === "string") {
      body = JSON.parse(body || "{}");
    }
  } catch {
    body = {};
  }

  const text = messages[getLanguage(body)];

  try {
    const session = requireSession(req, "admin");

    if (!session?.admin_id) {
      return json(res, 401, { success: false, message: text.invalidSession });
    }

    const { id = "" } = body || {};
    const admin_account_id = session.admin_id;

    if (!String(id).trim() || !String(admin_account_id).trim()) {
      return json(res, 400, { success: false, message: text.missingParams });
    }

    const { error } = await supabaseAdmin
      .from("applications")
      .update({
        admin_editing_by_account_id: null,
        admin_editing_by_account_name: null,
        admin_editing_started_at: null,
      })
      .eq("id", id)
      .eq("admin_editing_by_account_id", admin_account_id);

    if (error) throw error;

    return json(res, 200, { success: true });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
