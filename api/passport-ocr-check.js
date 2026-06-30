import { json, requireSession } from "./_agencyAuth.js";

const MAX_OCR_FILE_BYTES = 3 * 1024 * 1024;

const messages = {
  zh: {
    invalidSession: "未登录或登录失效",
    missingAzureConfig: "Azure Document Intelligence 环境变量未配置",
    missingFile: "缺少护照文件内容",
    fileTooLarge: "护照 OCR 文件过大。请上传 3MB 以下的 PDF，或手动核对护照信息。",
    azureQueryFailed: (status) => `Azure 查询失败（HTTP ${status}）`,
    azureOcrFailed: "Azure 护照识别失败",
    azureTimeout: "Azure 护照识别超时，请稍后重试",
    azureAnalyzeFailed: (status, text) => `Azure 分析请求失败（HTTP ${status}）：${text}`,
    missingOperationLocation: "Azure 未返回 operation-location",
    failed: "护照识别失败",
  },
  en: {
    invalidSession: "Not logged in or session has expired",
    missingAzureConfig: "Azure Document Intelligence environment variables are not configured",
    missingFile: "Missing passport file content",
    fileTooLarge: "Passport OCR file is too large. Please upload a PDF under 3MB or check the passport manually.",
    azureQueryFailed: (status) => `Azure query failed (HTTP ${status})`,
    azureOcrFailed: "Azure passport recognition failed",
    azureTimeout: "Azure passport recognition timed out. Please try again later.",
    azureAnalyzeFailed: (status, text) => `Azure analyze request failed (HTTP ${status}): ${text}`,
    missingOperationLocation: "Azure did not return operation-location",
    failed: "Passport recognition failed",
  },
  ko: {
    invalidSession: "로그인되어 있지 않거나 로그인이 만료되었습니다",
    missingAzureConfig: "Azure Document Intelligence 환경 변수가 설정되지 않았습니다",
    missingFile: "여권 파일 내용이 없습니다",
    fileTooLarge: "여권 OCR 파일이 너무 큽니다. 3MB 이하의 PDF를 업로드하거나 여권 정보를 수동으로 확인해 주세요.",
    azureQueryFailed: (status) => `Azure 조회 실패(HTTP ${status})`,
    azureOcrFailed: "Azure 여권 인식 실패",
    azureTimeout: "Azure 여권 인식 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.",
    azureAnalyzeFailed: (status, text) => `Azure 분석 요청 실패(HTTP ${status}): ${text}`,
    missingOperationLocation: "Azure가 operation-location을 반환하지 않았습니다",
    failed: "여권 인식 실패",
  },
};

function getLanguage(req) {
  const value = req.body?.language || "zh";
  return ["zh", "en", "ko"].includes(value) ? value : "zh";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeEndpoint(value) {
  return String(value || "").replace(/\/+$/, "");
}

function getFieldText(field) {
  if (!field) return "";

  const candidates = [
    field.valueString,
    field.content,
    field.valueDate,
    field.valueCountryRegion,
    field.valuePhoneNumber,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  if (typeof field.valueNumber === "number") {
    return String(field.valueNumber);
  }

  return "";
}

function buildFieldDebug(fields) {
  return Object.entries(fields || {}).reduce((acc, [key, field]) => {
    acc[key] = {
      value: getFieldText(field),
      content: typeof field?.content === "string" ? field.content : "",
      confidence:
        typeof field?.confidence === "number" ? field.confidence : null,
    };
    return acc;
  }, {});
}

function pickField(fields, names) {
  for (const name of names) {
    if (fields && fields[name]) {
      const value = getFieldText(fields[name]);
      if (value) return value;
    }
  }

  const normalizedNames = names.map((name) =>
    String(name).toLowerCase().replace(/[^a-z0-9]/g, "")
  );

  for (const [key, field] of Object.entries(fields || {})) {
    const normalizedKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalizedNames.includes(normalizedKey)) {
      const value = getFieldText(field);
      if (value) return value;
    }
  }

  return "";
}

function normalizeMrzName(value) {
  return String(value || "")
    .replace(/</g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseMrzFromText(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/\s+/g, ""))
    .filter(Boolean);

  const mrzStartIndex = lines.findIndex((line) => /^P[A-Z0-9<]/i.test(line));
  if (mrzStartIndex === -1 || !lines[mrzStartIndex + 1]) {
    return {};
  }

  const line1 = lines[mrzStartIndex].toUpperCase();
  const line2 = lines[mrzStartIndex + 1].toUpperCase();

  const namePart = line1.slice(5);
  const [surname = "", given = ""] = namePart.split("<<");
  const lastName = normalizeMrzName(surname);
  const givenNames = normalizeMrzName(given);
  const passportName = [lastName, givenNames]
    .filter(Boolean)
    .join(" ")
    .trim();

  const passportNo = line2.slice(0, 9).replace(/</g, "").trim();
  const dobRaw = line2.slice(13, 19);
  const expirationRaw = line2.slice(21, 27);

  let dateOfBirth = "";
  if (/^\d{6}$/.test(dobRaw)) {
    const yy = Number(dobRaw.slice(0, 2));
    const yyyy = yy > 30 ? 1900 + yy : 2000 + yy;
    dateOfBirth = `${yyyy}-${dobRaw.slice(2, 4)}-${dobRaw.slice(4, 6)}`;
  }

  let dateOfExpiration = "";
  if (/^\d{6}$/.test(expirationRaw)) {
    const yy = Number(expirationRaw.slice(0, 2));
    const currentYear = new Date().getUTCFullYear();
    const yearCandidates = [1900 + yy, 2000 + yy, 2100 + yy];
    const yyyy = yearCandidates.reduce((closest, candidate) =>
      Math.abs(candidate - currentYear) < Math.abs(closest - currentYear)
        ? candidate
        : closest
    );

    dateOfExpiration =
      `${yyyy}-${expirationRaw.slice(2, 4)}-${expirationRaw.slice(4, 6)}`;
  }

  return {
    passportName,
    lastName,
    givenNames,
    passportNo,
    dateOfBirth,
    dateOfExpiration,
  };
}

function normalizePassportCountryValue(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function isUzbekistanPassport(fields, fullText) {
  const countryValues = [
    pickField(fields, [
      "CountryRegion",
      "Country",
      "CountryCode",
      "IssuingCountry",
      "Nationality",
      "NationalityCountryRegion",
    ]),
    fullText,
  ];

  return countryValues.some((value) => {
    const normalized = normalizePassportCountryValue(value);
    return (
      normalized.includes("uzb") ||
      normalized.includes("uzbekistan") ||
      normalized.includes("republicofuzbekistan") ||
      normalized.includes("ozbekiston") ||
      normalized.includes("uzbekiston")
    );
  });
}

function cleanPassportNamePart(value) {
  return String(value || "")
    .replace(/[^\p{L}\s.'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyPassportNameLine(value) {
  const text = cleanPassportNamePart(value);
  if (!text) return false;
  if (text.length < 2 || text.length > 60) return false;
  if (!/[A-Za-z]/.test(text)) return false;

  const normalized = normalizePassportCountryValue(text);
  const blocked = [
    "surname",
    "familyasi",
    "names",
    "ismi",
    "father",
    "fathersname",
    "otasiningismi",
    "nationality",
    "fuqaroligi",
    "dateofbirth",
    "passport",
    "document",
    "sex",
    "placeofbirth",
  ];

  return !blocked.some((item) => normalized.includes(item));
}

function pickUzbekistanFatherName(fields, fullText) {
  const fieldValue = pickField(fields, [
    "FatherName",
    "FathersName",
    "FatherFullName",
    "Patronymic",
    "MiddleName",
  ]);

  if (fieldValue) return cleanPassportNamePart(fieldValue);

  const lines = String(fullText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (let index = 0; index < lines.length; index += 1) {
    const normalized = normalizePassportCountryValue(lines[index]);

    if (
      normalized.includes("fathersname") ||
      normalized.includes("otasiningismi")
    ) {
      const sameLineParts = lines[index].split(/[:：]/);
      const sameLineCandidate = sameLineParts.length > 1
        ? sameLineParts.slice(1).join(" ")
        : "";

      if (isLikelyPassportNameLine(sameLineCandidate)) {
        return cleanPassportNamePart(sameLineCandidate);
      }

      for (let offset = 1; offset <= 3; offset += 1) {
        const candidate = lines[index + offset] || "";
        if (isLikelyPassportNameLine(candidate)) {
          return cleanPassportNamePart(candidate);
        }
      }
    }
  }

  return "";
}

function buildDefaultPassportName(fields, fullText) {
  const fullName = pickField(fields, [
    "FullName",
    "FullGivenName",
    "Name",
    "NameOfHolder",
    "HolderName",
    "DocumentName",
  ]);
  if (fullName) return fullName;

  const surname = pickField(fields, [
    "LastName",
    "Surname",
    "FamilyName",
    "PrimaryIdentifier",
  ]);
  const given = pickField(fields, [
    "FirstName",
    "GivenName",
    "GivenNames",
    "SecondaryIdentifier",
  ]);

  const normalName = [surname, given].filter(Boolean).join(" ").trim();
  if (normalName) return normalName;

  return parseMrzFromText(fullText).passportName || "";
}

function buildUzbekistanPassportName(fields, fullText) {
  const surname = pickField(fields, [
    "LastName",
    "Surname",
    "FamilyName",
    "PrimaryIdentifier",
  ]);
  const given = pickField(fields, [
    "FirstName",
    "GivenName",
    "GivenNames",
    "Names",
    "SecondaryIdentifier",
  ]);
  const fatherName = pickUzbekistanFatherName(fields, fullText);

  const structuredName = [surname, given]
    .map(cleanPassportNamePart)
    .filter(Boolean)
    .join(" ")
    .trim();

  const baseName = structuredName || buildDefaultPassportName(fields, fullText);
  if (!fatherName) return baseName;

  const normalizedBase = normalizePassportCountryValue(baseName);
  const normalizedFather = normalizePassportCountryValue(fatherName);

  if (normalizedBase.includes(normalizedFather)) {
    return baseName;
  }

  return [baseName, fatherName]
    .map(cleanPassportNamePart)
    .filter(Boolean)
    .join(" ")
    .trim();
}

function buildPassportName(fields, fullText) {
  if (isUzbekistanPassport(fields, fullText)) {
    const uzbekistanName = buildUzbekistanPassportName(fields, fullText);
    if (uzbekistanName) return uzbekistanName;
  }

  return buildDefaultPassportName(fields, fullText);
}

function buildPassportNameParts(fields, fullText) {
  const mrzResult = parseMrzFromText(fullText);

  const lastName =
    pickField(fields, [
      "LastName",
      "Surname",
      "FamilyName",
      "PrimaryIdentifier",
    ]) ||
    mrzResult.lastName ||
    "";

  const givenNames =
    pickField(fields, [
      "FirstName",
      "GivenName",
      "GivenNames",
      "Names",
      "SecondaryIdentifier",
    ]) ||
    mrzResult.givenNames ||
    "";

  return {
    lastName: cleanPassportNamePart(lastName),
    givenNames: cleanPassportNamePart(givenNames),
  };
}

function buildPassportNo(fields, fullText) {
  return (
    pickField(fields, [
      "DocumentNumber",
      "PassportNumber",
      "PassportNo",
      "PassportNum",
      "IdNumber",
      "IDNumber",
      "Number",
    ]) ||
    parseMrzFromText(fullText).passportNo ||
    ""
  );
}

function normalizeOcrDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw
    .replace(/[年月.]/g, "/")
    .replace(/日/g, "")
    .replace(/-/g, "/")
    .replace(/\s+/g, "/")
    .replace(/\/+/g, "/")
    .trim();

  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("/");
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  if (/^\d{8}$/.test(normalized)) {
    return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
  }

  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(normalized)) {
    const [first, second, year] = normalized.split("/");
    const month = Number(first) > 12 ? second : first;
    const day = Number(first) > 12 ? first : second;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return raw;
}

function buildDateOfBirth(fields, fullText) {
  const rawDate =
    pickField(fields, [
      "DateOfBirth",
      "BirthDate",
      "DOB",
      "DateBirth",
      "Birth",
    ]) ||
    parseMrzFromText(fullText).dateOfBirth ||
    "";

  return normalizeOcrDate(rawDate);
}

function normalizePassportDate(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const monthNumbers = {
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    sept: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12",
  };

  const dayFirstMatch = raw.match(
    /^(\d{1,2})[\s./-]+([A-Za-z]{3,9})[\s,./-]+(\d{4})$/i
  );

  if (dayFirstMatch) {
    const [, day, monthName, year] = dayFirstMatch;
    const month = monthNumbers[monthName.toLowerCase()];

    if (month) {
      return validatePassportDate(
        `${year}-${month}-${String(day).padStart(2, "0")}`
      );
    }
  }

  const yearFirstMatch = raw.match(
    /^(\d{4})[\s./-]+([A-Za-z]{3,9})[\s,./-]+(\d{1,2})$/i
  );

  if (yearFirstMatch) {
    const [, year, monthName, day] = yearFirstMatch;
    const month = monthNumbers[monthName.toLowerCase()];

    if (month) {
      return validatePassportDate(
        `${year}-${month}-${String(day).padStart(2, "0")}`
      );
    }
  }

  return validatePassportDate(normalizeOcrDate(raw));
}

function validatePassportDate(value) {
  const normalized = String(value || "").trim();
  const match = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) return "";

  const [, year, month, day] = match;
  const parsed = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day))
  );

  if (
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(month) ||
    parsed.getUTCDate() !== Number(day)
  ) {
    return "";
  }

  return normalized;
}

function extractDateNearLabel(fullText, labelPatterns) {
  const lines = String(fullText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const datePattern =
    /\b(?:\d{4}[./-]\d{1,2}[./-]\d{1,2}|\d{1,2}[./-]\d{1,2}[./-]\d{4}|\d{8}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}|\d{4}\s+[A-Za-z]{3,9}\s+\d{1,2})\b/g;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!labelPatterns.some((pattern) => pattern.test(line))) {
      continue;
    }

    const nearbyText = [
      line,
      lines[index + 1] || "",
      lines[index + 2] || "",
    ].join(" ");

    const candidates = nearbyText.match(datePattern) || [];

    for (const candidate of candidates) {
      const normalized = normalizePassportDate(candidate);
      if (normalized) return normalized;
    }
  }

  return "";
}

function buildDateOfIssue(fields, fullText) {
  const structuredDate = pickField(fields, [
    "DateOfIssue",
    "IssueDate",
    "DateIssued",
    "IssuedDate",
    "IssuanceDate",
    "DateOfIssuance",
  ]);

  const normalizedStructuredDate = normalizePassportDate(structuredDate);
  if (normalizedStructuredDate) return normalizedStructuredDate;

  return extractDateNearLabel(fullText, [
    /date\s+of\s+issue/i,
    /date\s+of\s+issuance/i,
    /issued\s+on/i,
    /签发日期/i,
    /簽發日期/i,
    /발급일/i,
    /발행일/i,
    /date\s+de\s+d[ée]livrance/i,
    /fecha\s+de\s+expedici[oó]n/i,
    /дата\s+выдачи/i,
  ]);
}

function buildDateOfExpiration(fields, fullText) {
  const structuredDate = pickField(fields, [
    "DateOfExpiration",
    "ExpirationDate",
    "ExpiryDate",
    "DateOfExpiry",
    "ValidUntil",
  ]);

  const normalizedStructuredDate = normalizePassportDate(structuredDate);
  if (normalizedStructuredDate) return normalizedStructuredDate;

  const mrzDate = normalizePassportDate(
    parseMrzFromText(fullText).dateOfExpiration
  );
  if (mrzDate) return mrzDate;

  return extractDateNearLabel(fullText, [
    /date\s+of\s+expiration/i,
    /expiration\s+date/i,
    /date\s+of\s+expiry/i,
    /expiry\s+date/i,
    /valid\s+until/i,
    /有效期至/i,
    /有效期限/i,
    /만료일/i,
    /유효기간/i,
    /date\s+d['’]expiration/i,
    /fecha\s+de\s+caducidad/i,
    /действителен\s+до/i,
  ]);
}

async function pollAnalyzeResult(operationLocation, key, text) {
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
          text.azureQueryFailed(response.status)
      );
    }

    const status = String((result && result.status) || "").toLowerCase();

    if (status === "succeeded") {
      return result;
    }

    if (status === "failed") {
      throw new Error(
        (result && result.error && result.error.message) || text.azureOcrFailed
      );
    }

    await sleep(1500);
  }

  throw new Error(text.azureTimeout);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, {
      success: false,
      message: "Method Not Allowed",
    });
  }

  const text = messages[getLanguage(req)];

  try {
    const session = requireSession(req, "agency");

    if (!session?.agency_id) {
      return json(res, 401, {
        success: false,
        message: text.invalidSession,
      });
    }

    const endpoint = normalizeEndpoint(process.env.AZURE_DI_ENDPOINT);
    const key = process.env.AZURE_DI_KEY;

    if (!endpoint || !key) {
      return json(res, 500, {
        success: false,
        message: text.missingAzureConfig,
      });
    }

    const { fileBase64 = "", mimeType = "", fileName = "" } = req.body || {};

    if (!String(fileBase64).trim()) {
      return json(res, 400, {
        success: false,
        message: text.missingFile,
      });
    }

    const binary = Buffer.from(String(fileBase64), "base64");

    if (binary.byteLength > MAX_OCR_FILE_BYTES) {
      return json(res, 413, {
        success: false,
        message: text.fileTooLarge,
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
      const responseText = await analyzeResponse.text();
      throw new Error(
        text.azureAnalyzeFailed(analyzeResponse.status, responseText)
      );
    }

    const operationLocation =
      analyzeResponse.headers.get("operation-location") ||
      analyzeResponse.headers.get("Operation-Location");

    if (!operationLocation) {
      throw new Error(text.missingOperationLocation);
    }

    const result = await pollAnalyzeResult(operationLocation, key, text);

    const analyzeResult = result?.analyzeResult || {};
    const document = analyzeResult.documents?.[0] || null;
    const fields = document?.fields || {};
    const fullText = [
      analyzeResult.content || "",
      document?.content || "",
    ]
      .filter(Boolean)
      .join("\n");

        const passportName = buildPassportName(fields, fullText);
    const passportNameParts = buildPassportNameParts(fields, fullText);
    const passportNo = buildPassportNo(fields, fullText);
    const dateOfBirth = buildDateOfBirth(fields, fullText);
    const dateOfIssue = buildDateOfIssue(fields, fullText);
    const dateOfExpiration = buildDateOfExpiration(fields, fullText);

    return json(res, 200, {
      success: true,
      file_name: fileName || "",
           passport_name: passportName || "",
      last_name: passportNameParts.lastName || "",
      given_names: passportNameParts.givenNames || "",
      passport_no: passportNo || "",
      date_of_birth: dateOfBirth || "",
      date_of_issue: dateOfIssue || "",
      date_of_expiration: dateOfExpiration || "",
      raw_fields: Object.keys(fields || {}),
      field_debug: buildFieldDebug(fields),
      content_preview: fullText.slice(0, 1200),
      document_type: document?.docType || "",
      confidence:
        typeof document?.confidence === "number" ? document.confidence : null,
    });
  } catch (error) {
    console.error("passport-ocr-check error:", error);

    return json(res, 500, {
      success: false,
      message: error.message || text.failed,
    });
  }
}
