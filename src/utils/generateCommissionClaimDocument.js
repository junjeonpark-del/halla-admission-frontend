import JSZip from "jszip";

const TEMPLATE_URL = "/templates/commission-claim.docx";
const WORD_DOCUMENT_XML_PATH = "word/document.xml";

function toDate(value = new Date()) {
  const next = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

function formatKoreanDate(value = new Date()) {
  const date = toDate(value);
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function sanitizeFileNameSegment(value = "", fallback = "document") {
  const normalized = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ");
  return normalized || fallback;
}

export function getCommissionSettlementSeason(value = new Date()) {
  const date = toDate(value);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month <= 2) return { year: year - 1, intakeMonth: 9 };
  if (month <= 8) return { year, intakeMonth: 3 };
  return { year, intakeMonth: 9 };
}

function getTextNodes(node) {
  return Array.from(node.getElementsByTagName("w:t"));
}

function getNodeText(node) {
  return getTextNodes(node).map((item) => item.textContent || "").join("");
}

function setNodeText(node, value) {
  const textNodes = getTextNodes(node);
  if (textNodes.length === 0) return;

  textNodes[0].textContent = value;
  for (let index = 1; index < textNodes.length; index += 1) {
    textNodes[index].textContent = "";
  }
}

function getRowCells(row) {
  return Array.from(row.getElementsByTagName("w:tc"));
}

function setCellText(cells, index, value) {
  if (!cells[index]) return;
  setNodeText(cells[index], value);
}

function getApplicationTypeRank(item) {
  const type = String(item.application_type || "undergraduate").toLowerCase();
  if (type === "undergraduate") return 1;
  if (type === "graduate") return 2;
  if (type === "language") return 3;
  return 9;
}

function getCommissionTypeLabel(item) {
  const type = String(item.application_type || "undergraduate").toLowerCase();
  const degree = String(item.degree_level || "").toLowerCase();

  if (type === "undergraduate") return "학부";
  if (type === "language") return "어학연수";
  if (type === "graduate") {
    if (degree === "doctor") return "박사";
    if (degree === "master") return "석사";
    return "대학원";
  }

  return "";
}

function getGenderLabel(value) {
  const text = String(value || "").trim().toLowerCase();

  if (["male", "m", "男", "남"].includes(text)) return "남";
  if (["female", "f", "女", "여"].includes(text)) return "여";

  return value || "";
}

function normalizeStudentRows(students = []) {
  return [...students].sort((a, b) => {
    const typeDiff = getApplicationTypeRank(a) - getApplicationTypeRank(b);
    if (typeDiff !== 0) return typeDiff;

    const aName = String(a.english_name || a.full_name_passport || "").toLowerCase();
    const bName = String(b.english_name || b.full_name_passport || "").toLowerCase();
    return aName.localeCompare(bName);
  });
}

async function fetchTemplate() {
  const response = await fetch(TEMPLATE_URL);
  if (!response.ok) {
    throw new Error(`Failed to load template: ${TEMPLATE_URL}`);
  }
  return response.arrayBuffer();
}

function parseXml(xmlText) {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(xmlText, "application/xml");
  const parserError = documentNode.querySelector("parsererror");

  if (parserError) {
    throw new Error("Failed to parse document XML.");
  }

  return documentNode;
}

function fillSummaryRows(documentNode, agency, students, season, issuedAt) {
  const rows = Array.from(documentNode.getElementsByTagName("w:tr"));
  const agencyName = String(agency.agency_name || "").trim();
  const representative = String(
    agency.legal_representative || agency.contact_name || ""
  ).trim();

  rows.forEach((row) => {
    const text = getNodeText(row);
    const cells = getRowCells(row);

    if (text.includes("일자")) {
      setCellText(cells, 1, formatKoreanDate(issuedAt));
    }

    if (text.includes("발신")) {
      setCellText(cells, 1, agencyName);
    }

    if (text.includes("20**년*월학기")) {
      setNodeText(
        row,
        `2. 우리유학원은 ${season.year}년 ${season.intakeMonth}월학기에 귀대학교에 추천한 자비유학생 ${students.length}명에 대한 운영비를 아래와 같이 청구합니다.`
      );
    }

    if (text.includes("대표자")) {
      setCellText(cells, 2, representative ? `: ${representative}` : ":");
    }
  });
}

function fillStudentTable(documentNode, students) {
  const table = documentNode.getElementsByTagName("w:tbl")[0];
  if (!table) throw new Error("The template does not contain a table.");

  const rows = Array.from(table.getElementsByTagName("w:tr"));
  const headerIndex = rows.findIndex((row) => {
    const text = getNodeText(row);
    return text.includes("순번") && text.includes("구분") && text.includes("영문명");
  });

  const bankInfoIndex = rows.findIndex((row) => getNodeText(row).includes("은행정보"));

  if (headerIndex < 0 || bankInfoIndex < 0 || bankInfoIndex <= headerIndex + 1) {
    throw new Error("Student table structure was not recognized.");
  }

  const dataStartIndex = headerIndex + 1;
  const templateRow = rows[dataStartIndex].cloneNode(true);
  const tableBody = rows[dataStartIndex].parentNode;
  const insertBeforeRow = rows[bankInfoIndex];

  for (let index = bankInfoIndex - 1; index >= dataStartIndex; index -= 1) {
    tableBody.removeChild(rows[index]);
  }

  students.forEach((student, index) => {
    const row = templateRow.cloneNode(true);
    const cells = getRowCells(row);

    setCellText(cells, 0, "");
    setCellText(cells, 1, String(index + 1));
    setCellText(cells, 2, getCommissionTypeLabel(student));
    setCellText(cells, 3, "");
    setCellText(cells, 4, student.english_name || student.full_name_passport || "");
    setCellText(cells, 5, getGenderLabel(student.gender || student.sex));
    setCellText(cells, 6, student.date_of_birth || student.birth_date || "");

    tableBody.insertBefore(row, insertBeforeRow);
  });
}

function serializeXml(documentNode) {
  return new XMLSerializer().serializeToString(documentNode);
}

function triggerDownload(blob, fileName) {
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

export async function generateCommissionClaimDocx(
  agency,
  students,
  { season = getCommissionSettlementSeason(), issuedAt = new Date() } = {}
) {
  if (!agency?.agency_name) {
    throw new Error("Agency information is required.");
  }

  const sortedStudents = normalizeStudentRows(students);

  const buffer = await fetchTemplate();
  const zip = await JSZip.loadAsync(buffer);
  const xmlEntry = zip.file(WORD_DOCUMENT_XML_PATH);

  if (!xmlEntry) {
    throw new Error("The template does not contain word/document.xml.");
  }

  const xmlText = await xmlEntry.async("string");
  const documentNode = parseXml(xmlText);

  fillSummaryRows(documentNode, agency, sortedStudents, season, issuedAt);
  fillStudentTable(documentNode, sortedStudents);

  zip.file(WORD_DOCUMENT_XML_PATH, serializeXml(documentNode));

  const blob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const safeAgency = sanitizeFileNameSegment(agency.agency_name, "agency");
  triggerDownload(
    blob,
    `Commission_Claim_${safeAgency}_${season.year}-${season.intakeMonth}.docx`
  );
}
