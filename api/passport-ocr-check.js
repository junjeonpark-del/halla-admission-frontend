import { json, requireSession } from "./_agencyAuth.js";

const MAX_OCR_FILE_BYTES = 3 * 1024 * 1024;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEndpoint(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getFieldText(field) {
  if (!field) return "";

  if (typeof field.valueString === "string" && field.valueString.trim()) {
    return field.valueString.trim();
  }

  if (typeof field.content === "string" && field.content.trim()) {
    return field.content.trim();
  }

  if (typeof field.valueDate === "string" && field.valueDate.trim()) {
    return field.valueDate.trim();
  }

  if (
    typeof field.valueCountryRegion === "string" &&
    field.valueCountryRegion.trim()
  ) {
    return field.valueCountryRegion.trim();
  }

  return "";
}

function pickField(fields, names) {
  for (const name of names) {
    if (fields && fields[name]) {
      const value = getFieldText(fields[name]);
      if (value) return value;
    }
  }
  return "";
}

function buildPassportName(fields) {
  const fullName = pickField(fields, ["FullName", "FullGivenName", "Name"]);
  if (fullName) return fullName;

  const given = pickField(fields, ["GivenNames", "GivenName", "FirstName"]);
  const surname = pickField(fields, ["Surname", "LastName", "FamilyName"]);

  return [given, surname].filter(Boolean).join(" ").trim();
}

async function pollAnalyzeResult(operationLocation, key) {
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i += 1) {
    const response = await fetch(operationLocation, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
      },
    });

    let result = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(
        (result && result.error && result.error.message) ||
          `Azure 查询失败（HTTP ${response.status}）`
      );
    }

    const status = String((result && result.status) || "").toLowerCase();

    if (status === "succeeded") {
      return result;
    }

    if (status === "failed") {
      throw new Error(
        (result && result.error && result.error.message) || "Azure 护照识别失败"
      );
    }

    await sleep(1500);
  }

  throw new Error("Azure 护照识别超时，请稍后重试");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, {
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    const session = requireSession(req, "agency");

    if (!session?.agency_id) {
      return json(res, 401, {
        success: false,
        message: "未登录或登录失效",
      });
    }

    const endpoint = normalizeEndpoint(process.env.AZURE_DI_ENDPOINT);
    const key = process.env.AZURE_DI_KEY;

    if (!endpoint || !key) {
      return json(res, 500, {
        success: false,
        message: "Azure Document Intelligence 环境变量未配置",
      });
    }

    const { fileBase64 = "", mimeType = "", fileName = "" } = req.body || {};

    if (!String(fileBase64).trim()) {
      return json(res, 400, {
        success: false,
        message: "缺少护照文件内容",
      });
    }

    const binary = Buffer.from(String(fileBase64), "base64");

    if (binary.byteLength > MAX_OCR_FILE_BYTES) {
      return json(res, 413, {
        success: false,
        message: "Passport OCR file is too large. Please upload a PDF under 3MB or check the passport manually.",
      });
    }

    const analyzeUrl =
      `${endpoint}/documentintelligence/documentModels/prebuilt-idDocument:analyze` +
      `?api-version=2024-11-30`;

    const analyzeResponse = await fetch(analyzeUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": mimeType || "application/octet-stream",
      },
      body: binary,
    });

    if (!analyzeResponse.ok) {
      const text = await analyzeResponse.text();
      throw new Error(
        `Azure 分析请求失败（HTTP ${analyzeResponse.status}）：${text}`
      );
    }

    const operationLocation =
      analyzeResponse.headers.get("operation-location") ||
      analyzeResponse.headers.get("Operation-Location");

    if (!operationLocation) {
      throw new Error("Azure 未返回 operation-location");
    }

    const result = await pollAnalyzeResult(operationLocation, key);

    const document =
      result &&
      result.analyzeResult &&
      result.analyzeResult.documents &&
      result.analyzeResult.documents[0]
        ? result.analyzeResult.documents[0]
        : null;

    const fields = (document && document.fields) || {};

    const passportName = buildPassportName(fields);
    const passportNo = pickField(fields, [
      "DocumentNumber",
      "PassportNumber",
      "IdNumber",
    ]);
    const dateOfBirth = pickField(fields, ["DateOfBirth", "BirthDate"]);

    return json(res, 200, {
      success: true,
      file_name: fileName || "",
      passport_name: passportName || "",
      passport_no: passportNo || "",
      date_of_birth: dateOfBirth || "",
      raw_fields: Object.keys(fields || {}),
    });
  } catch (error) {
    console.error("passport-ocr-check error:", error);

    return json(res, 500, {
      success: false,
      message: error.message || "护照识别失败",
    });
  }
}
