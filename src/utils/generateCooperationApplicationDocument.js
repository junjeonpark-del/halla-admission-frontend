import JSZip from "jszip";

const TEMPLATE_URL = "/templates/cooperation-application-template.docx";
const WORD_DOCUMENT_XML_PATH = "word/document.xml";

function escapeXmlText(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeFileNameSegment(value = "", fallback = "document") {
  const normalized = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ");

  return normalized || fallback;
}

function parseXml(xmlText) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(xmlText, "application/xml");
  const parserError = documentNode.querySelector("parsererror");

  if (parserError) {
    throw new Error("Failed to parse cooperation application template.");
  }

  return documentNode;
}

function directChildren(node, localName) {
  return Array.from(node.childNodes).filter((child) => child.localName === localName);
}

function getTables(documentNode) {
  const body = documentNode.getElementsByTagName("w:body")[0];
  return directChildren(body, "tbl");
}

function getRows(table) {
  return directChildren(table, "tr");
}

function getCells(row) {
  return directChildren(row, "tc");
}

function getTextNodes(cell) {
  return Array.from(cell.getElementsByTagName("w:t"));
}

function setCellText(cell, value) {
  if (!cell) return;

  const textNodes = getTextNodes(cell);
  const nextText = String(value ?? "");

  if (textNodes.length > 0) {
    textNodes[0].textContent = nextText;
    for (let index = 1; index < textNodes.length; index += 1) {
      textNodes[index].textContent = "";
    }
    return;
  }

  const paragraph = cell.getElementsByTagName("w:p")[0];
  if (!paragraph) return;

  const run = cell.ownerDocument.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
  const text = cell.ownerDocument.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
  text.textContent = nextText;
  run.appendChild(text);
  paragraph.appendChild(run);
}

function setCellPlainText(cell, value) {
  if (!cell) return;

  const cellPr = directChildren(cell, "tcPr")[0]?.cloneNode(true);
  const documentNode = cell.ownerDocument;
  while (cell.firstChild) cell.removeChild(cell.firstChild);
  if (cellPr) cell.appendChild(cellPr);

  const paragraph = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:p");
  const run = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
  const text = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
  text.textContent = String(value ?? "");
  run.appendChild(text);
  paragraph.appendChild(run);
  cell.appendChild(paragraph);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function normalizeGender(value = "") {
  const text = String(value || "").trim().toLowerCase();
  if (["male", "m", "남", "남자", "男"].includes(text)) return "male";
  if (["female", "f", "여", "여자", "女"].includes(text)) return "female";
  return "";
}

function formatGender(value) {
  const gender = normalizeGender(value);
  if (gender === "male") return "☑ 남 (M)   □ 여 (F)";
  if (gender === "female") return "□ 남 (M)   ☑ 여 (F)";
  return "□ 남 (M)   □ 여 (F)";
}

function formatAcademicStatus(status, language) {
  const labels = {
    active: { zh: "在学", en: "Active", ko: "재학" },
    leave: { zh: "休学", en: "Leave", ko: "휴학" },
    completed: { zh: "结业", en: "Completed", ko: "수료" },
    graduated: { zh: "毕业", en: "Graduated", ko: "졸업" },
    withdrawn: { zh: "退学", en: "Withdrawn", ko: "제적" },
  };
  const locale = language === "en" ? "en" : language === "ko" ? "ko" : "zh";
  return labels[status]?.[locale] || status || "";
}

function buildEducationRows(student) {
  const values = [student?.education1, student?.education2, student?.education3];
  return values.map((value) => {
    if (!value) return { startDate: "", endDate: "", institution: "", location: "" };
    if (typeof value === "object") return value;

    const text = String(value);
    if (text.includes("|")) {
      const [datePart = "", institution = "", location = ""] = text.split("|").map((part) => part.trim());
      const [startDate = "", endDate = ""] = datePart.split("~").map((part) => part.trim());
      return { startDate, endDate, institution, location };
    }

    try {
      return JSON.parse(text);
    } catch {
      return { startDate: "", endDate: "", institution: text, location: "" };
    }
  });
}

function getLocalizedSnapshot(snapshot, language, prefix) {
  const locale = language === "en" ? "en" : language === "ko" ? "ko" : "zh";
  return (
    snapshot?.[`${prefix}_${locale}`] ||
    snapshot?.[`${prefix}_zh`] ||
    snapshot?.[`${prefix}_en`] ||
    snapshot?.[`${prefix}_ko`] ||
    ""
  );
}

export function buildCooperationApplicationFileName(student, language = "zh") {
  const name = sanitizeFileNameSegment(
    student?.english_name || student?.full_name_passport || student?.name || "student",
    "student"
  );
  const year = sanitizeFileNameSegment(student?.cooperation_admission_year || new Date().getFullYear(), "year");
  const label =
    language === "en"
      ? "Cooperation_Application"
      : language === "ko"
        ? "중외합작프로그램_지원서"
        : "中外合作办学申请表";
  const semesterLabel =
    language === "en"
      ? `${year}-SeptemberSemester`
      : language === "ko"
        ? `${year}-9월학기`
        : `${year}-9月学期`;

  return `${name}_${label}_${semesterLabel}.docx`;
}

export async function generateCooperationApplicationDocumentBlob({
  student,
  language = "zh",
  agencyName = "",
  universityName = "",
  partnerMajorName = "",
  hallaMajorName = "",
} = {}) {
  if (!student) throw new Error("Student data is required.");

  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${TEMPLATE_URL}`);
  }

  const buffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const xmlEntry = zip.file(WORD_DOCUMENT_XML_PATH);
  if (!xmlEntry) throw new Error("The template does not contain word/document.xml.");

  const xmlText = await xmlEntry.async("string");
  const documentNode = parseXml(xmlText);
  const tables = getTables(documentNode);
  const mainTable = tables[0];
  const rows = mainTable ? getRows(mainTable) : [];
  const educationRows = buildEducationRows(student);
  const snapshot = student.cooperation_snapshot || {};
  const admissionYear = student.cooperation_admission_year || "";
  const addressStreet = student.cooperation_address_street || "";
  const addressCity = student.cooperation_address_city || "";
  const addressCountry = student.cooperation_address_country || student.nationality || "China";
  const resolvedUniversity = universityName || getLocalizedSnapshot(snapshot, language, "university_name") || "大庆师范学院";
  const resolvedHallaMajor = hallaMajorName || getLocalizedSnapshot(snapshot, language, "halla_major_name") || student.cooperation_halla_major_name || "";
  const resolvedPartnerMajor = partnerMajorName || getLocalizedSnapshot(snapshot, language, "major_name") || student.major || "";
  const finalMajor = resolvedHallaMajor || resolvedPartnerMajor;

  const cell = (rowIndex, cellIndex) => getCells(rows[rowIndex] || [])[cellIndex];

  setCellText(cell(0, 1), resolvedUniversity);
  setCellText(cell(0, 3), finalMajor);
  setCellText(cell(2, 1), admissionYear ? `${admissionYear}년 9월학기 / ${admissionYear} September Semester` : "");
  setCellText(cell(4, 1), student.full_name_passport || student.name || student.english_name || "");
  setCellPlainText(cell(5, 1), formatGender(student.gender || student.sex));
  setCellText(cell(5, 3), student.nationality || "China");
  setCellText(cell(6, 1), formatDate(student.date_of_birth || student.birth_date));
  setCellText(cell(6, 3), student.email || "");
  setCellText(cell(7, 1), student.tel || student.phone || "");
  setCellText(cell(7, 3), formatAcademicStatus(student.cooperation_academic_status || "active", language));
  setCellPlainText(cell(8, 1), `(Street Address) : ${addressStreet}`);
  setCellPlainText(cell(9, 1), `(City) : ${addressCity}`);
  setCellPlainText(cell(9, 2), `(Country) : ${addressCountry}`);
  setCellText(cell(10, 1), student.cooperation_id_card_number || "");

  [13, 14, 15].forEach((rowIndex, index) => {
    const item = educationRows[index] || {};
    setCellText(cell(rowIndex, 0), [formatDate(item.startDate), formatDate(item.endDate)].filter(Boolean).join(" ~ "));
    setCellText(cell(rowIndex, 1), item.institution || "");
    setCellText(cell(rowIndex, 2), item.location || "");
  });

  const footerTable = tables[4];
  const footerRows = footerTable ? getRows(footerTable) : [];
  const footerCell = getCells(footerRows[0] || [])[0];
  const today = new Date();
  setCellPlainText(
    footerCell,
    `위 내용 확인하셨습니까? ☑ 확인했습니다. Do you acknowledge the above? ☑ I acknowledge\n${today.getFullYear()}년 ${String(today.getMonth() + 1).padStart(2, "0")}월 ${String(today.getDate()).padStart(2, "0")}일    신청인(Applicant): ${student.full_name_passport || student.name || student.english_name || ""}`
  );

  const nextXml = new XMLSerializer().serializeToString(documentNode);
  zip.file(WORD_DOCUMENT_XML_PATH, nextXml);

  return zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}

export async function downloadCooperationApplicationDocument(options) {
  const blob = await generateCooperationApplicationDocumentBlob(options);
  const fileName = buildCooperationApplicationFileName(options?.student, options?.language);
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}
