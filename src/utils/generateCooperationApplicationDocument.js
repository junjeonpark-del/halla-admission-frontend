import JSZip from "jszip";
import { supabase } from "../lib/supabase";

const TEMPLATE_URL = "/templates/cooperation-application-template.docx";
const WORD_DOCUMENT_XML_PATH = "word/document.xml";
const MATERIALS_BUCKET = "application-files";

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
  if (!node?.childNodes) return [];
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
  if (!cell) return [];
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

function getParagraphs(documentNode) {
  return Array.from(documentNode.getElementsByTagName("w:p"));
}

function getParagraphText(paragraph) {
  return Array.from(paragraph.getElementsByTagName("w:t"))
    .map((node) => node.textContent || "")
    .join("");
}

function setParagraphPlainText(paragraph, value) {
  if (!paragraph) return;
  const paragraphPr = directChildren(paragraph, "pPr")[0]?.cloneNode(true);
  const documentNode = paragraph.ownerDocument;
  while (paragraph.firstChild) paragraph.removeChild(paragraph.firstChild);
  if (paragraphPr) paragraph.appendChild(paragraphPr);

  const run = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
  const text = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
  text.textContent = String(value ?? "");
  run.appendChild(text);
  paragraph.appendChild(run);
}

function appendDrawingToParagraph(paragraph, drawingXml, replaceContent = false) {
  if (!paragraph || !drawingXml) return;
  const paragraphPr = directChildren(paragraph, "pPr")[0]?.cloneNode(true);
  const documentNode = paragraph.ownerDocument;
  const fragment = new DOMParser().parseFromString(`<root>${drawingXml}</root>`, "application/xml");
  const drawingNode = fragment.documentElement.firstChild;
  if (!drawingNode) return;

  if (replaceContent) {
    while (paragraph.firstChild) paragraph.removeChild(paragraph.firstChild);
    if (paragraphPr) paragraph.appendChild(paragraphPr);
  }

  const run = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:r");
  run.appendChild(documentNode.importNode(drawingNode, true));
  paragraph.appendChild(run);
}

function setCheckboxSymbols(cell, checkedIndexes = []) {
  if (!cell) return;
  const documentNode = cell.ownerDocument;
  const symbols = Array.from(cell.getElementsByTagName("w:sym"));

  symbols.forEach((symbol, index) => {
    const text = documentNode.createElementNS("http://schemas.openxmlformats.org/wordprocessingml/2006/main", "w:t");
    text.textContent = checkedIndexes.includes(index) ? "☑" : "□";
    symbol.parentNode?.replaceChild(text, symbol);
  });
}

function replaceCheckboxTextInNode(node, checkedLabels = []) {
  if (!node) return;
  const textNodes = Array.from(node.getElementsByTagName("w:t"));

  textNodes.forEach((textNode) => {
    let nextText = textNode.textContent || "";
    checkedLabels.forEach((label) => {
      nextText = nextText.replace(`□ ${label}`, `☑ ${label}`).replace(`□${label}`, `☑${label}`);
    });
    textNode.textContent = nextText;
  });
}

function replaceTextInParagraph(paragraph, replacements) {
  if (!paragraph) return;
  const textNodes = Array.from(paragraph.getElementsByTagName("w:t"));

  textNodes.forEach((node) => {
    let nextText = node.textContent || "";
    replacements.forEach(([from, to]) => {
      nextText = nextText.replace(from, to);
    });
    node.textContent = nextText;
  });
}

function replaceWingdingsCheckboxesByOrder(xmlText, gender) {
  let index = 0;
  const checkedIndexes = new Set([0, 1, 4, 5]);
  if (gender === "female") {
    checkedIndexes.add(3);
  } else {
    checkedIndexes.add(2);
  }

  return xmlText.replace(/<w:sym\b[^>]*w:font="Wingdings"[^>]*w:char="F0A8"[^>]*\/>/g, () => {
    const checked = checkedIndexes.has(index);
    index += 1;
    return `<w:t>${checked ? "☑" : "□"}</w:t>`;
  });
}

function replaceTextCheckboxes(xmlText) {
  return xmlText
    .replace(/□(\s*)확인했습니다/g, "☑$1확인했습니다")
    .replace(/□(\s*)I acknowledge/g, "☑$1I acknowledge")
    .replace(/□(\s*)동의함/g, "☑$1동의함")
    .replace(/□(\s*)I agree/g, "☑$1I agree");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function splitDateParts(value) {
  const formatted = formatDate(value);
  const [year = "", month = "", day = ""] = formatted.split("/");
  return { year, month, day };
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

async function fetchPhotoImage(photoUrl) {
  if (!photoUrl) return null;
  const response = await fetch(photoUrl, { mode: "cors" });
  if (!response.ok) return null;
  const blob = await response.blob();
  const contentType = blob.type || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const arrayBuffer = await blob.arrayBuffer();
  return { arrayBuffer, contentType, extension };
}

async function fetchPhotoImageFromStorage(filePath) {
  if (!filePath) return null;
  const { data, error } = await supabase.storage.from(MATERIALS_BUCKET).download(filePath);
  if (error || !data) {
    console.warn("download cooperation photo from storage failed:", error);
    return null;
  }
  const contentType = data.type || "image/jpeg";
  const extension = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
  const arrayBuffer = await data.arrayBuffer();
  return { arrayBuffer, contentType, extension };
}

function buildImageDrawingXml(relId, widthEmu = 1440000, heightEmu = 1800000) {
  return `
    <w:drawing xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
      xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
      xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
      xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"
      xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
      <wp:inline distT="0" distB="0" distL="0" distR="0">
        <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
        <wp:docPr id="101" name="Cooperation Photo"/>
        <wp:cNvGraphicFramePr>
          <a:graphicFrameLocks noChangeAspect="1"/>
        </wp:cNvGraphicFramePr>
        <a:graphic>
          <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
            <pic:pic>
              <pic:nvPicPr>
                <pic:cNvPr id="102" name="cooperation-photo"/>
                <pic:cNvPicPr/>
              </pic:nvPicPr>
              <pic:blipFill>
                <a:blip r:embed="${relId}"/>
                <a:stretch><a:fillRect/></a:stretch>
              </pic:blipFill>
              <pic:spPr>
                <a:xfrm>
                  <a:off x="0" y="0"/>
                  <a:ext cx="${widthEmu}" cy="${heightEmu}"/>
                </a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
              </pic:spPr>
            </pic:pic>
          </a:graphicData>
        </a:graphic>
      </wp:inline>
    </w:drawing>`;
}

function buildPhotoAnchorDrawingXml(relId) {
  const widthEmu = 1056005;
  const heightEmu = 1132764;
  return `<w:drawing>
<wp:anchor distT="0" distB="0" distL="114300" distR="114300" behindDoc="0" locked="0" layoutInCell="1" simplePos="0" relativeHeight="251660288" allowOverlap="1" hidden="0">
<wp:simplePos x="0" y="0" />
<wp:positionH relativeFrom="margin"><wp:align>right</wp:align></wp:positionH>
<wp:positionV relativeFrom="paragraph"><wp:posOffset>5800</wp:posOffset></wp:positionV>
<wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
<wp:effectExtent l="0" t="0" r="10795" b="10795"/>
<wp:wrapNone />
<wp:docPr id="2025" name="Cooperation Photo"/>
<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr>
<pic:cNvPr id="2025" name="cooperation-photo"/>
<pic:cNvPicPr><a:picLocks noChangeAspect="1"/></pic:cNvPicPr>
</pic:nvPicPr>
<pic:blipFill>
<a:blip r:embed="${relId}"/>
<a:srcRect/>
<a:stretch><a:fillRect/></a:stretch>
</pic:blipFill>
<pic:spPr>
<a:xfrm><a:off x="0" y="0"/><a:ext cx="${widthEmu}" cy="${heightEmu}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
<a:noFill/>
</pic:spPr>
</pic:pic>
</a:graphicData>
</a:graphic>
</wp:anchor>
</w:drawing>`;
}

function hasDrawing(paragraph) {
  return paragraph?.getElementsByTagName("w:drawing")?.length > 0;
}

function replacePhotoShapeDrawing(xmlText, relId) {
  if (!relId) return xmlText;
  return xmlText.replace(
    /<w:drawing>(?=[\s\S]*?wordprocessingShape)(?=[\s\S]*?photo)[\s\S]*?<\/w:drawing>/,
    buildPhotoAnchorDrawingXml(relId)
  );
}

async function addImageToDocx(zip, image) {
  if (!image) return null;
  const mediaPath = `word/media/cooperation-photo.${image.extension}`;
  const relId = "rIdCooperationPhoto";
  zip.file(mediaPath, image.arrayBuffer);

  const relsPath = "word/_rels/document.xml.rels";
  const relsEntry = zip.file(relsPath);
  if (relsEntry) {
    let relsXml = await relsEntry.async("string");
    if (!relsXml.includes(`Id="${relId}"`)) {
      relsXml = relsXml.replace(
        "</Relationships>",
        `<Relationship Id="${relId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/cooperation-photo.${image.extension}"/></Relationships>`
      );
      zip.file(relsPath, relsXml);
    }
  }

  const contentTypesPath = "[Content_Types].xml";
  const contentTypesEntry = zip.file(contentTypesPath);
  if (contentTypesEntry) {
    let contentTypesXml = await contentTypesEntry.async("string");
    const contentType = image.extension === "png" ? "image/png" : image.extension === "webp" ? "image/webp" : "image/jpeg";
    if (!contentTypesXml.includes(`Extension="${image.extension}"`)) {
      contentTypesXml = contentTypesXml.replace(
        "</Types>",
        `<Default Extension="${image.extension}" ContentType="${contentType}"/></Types>`
      );
      zip.file(contentTypesPath, contentTypesXml);
    }
  }

  return relId;
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
  photoUrl = "",
  photoFilePath = "",
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
  const submittedDate = student.submitted_at || student.updated_at || student.created_at || new Date();
  const submittedParts = splitDateParts(submittedDate);
  const applicantName = student.full_name_passport || student.name || student.english_name || "";
  const photoImage = (await fetchPhotoImageFromStorage(photoFilePath)) || (await fetchPhotoImage(photoUrl));
  const photoRelId = await addImageToDocx(zip, photoImage);

  const cell = (rowIndex, cellIndex) => getCells(rows[rowIndex])[cellIndex];

  setCellText(cell(0, 1), resolvedUniversity);
  setCellText(cell(0, 3), finalMajor);
  setCellText(cell(2, 1), admissionYear ? `${admissionYear}년 9월학기 / ${admissionYear} September Semester` : "");
  setCellText(cell(4, 1), applicantName);
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
    setCellPlainText(cell(rowIndex, 0), [formatDate(item.startDate), formatDate(item.endDate)].filter(Boolean).join(" ~ "));
    setCellPlainText(cell(rowIndex, 1), item.institution || "");
    setCellPlainText(cell(rowIndex, 2), item.location || "");
  });

  const paragraphs = getParagraphs(documentNode);
  paragraphs.forEach((paragraph) => {
    const text = getParagraphText(paragraph);
    if (text.includes("년(Year)") && text.includes("월(Month)") && text.includes("일(Day)")) {
      setParagraphPlainText(paragraph, `${submittedParts.year}년(Year) ${submittedParts.month}월(Month) ${submittedParts.day}일(Day)`);
    } else if (text.includes("신청인(Applicant)")) {
      setParagraphPlainText(paragraph, `신청인(Applicant): ${applicantName} （인）`);
    } else if (text.includes("Do you acknowledge the above") || text.includes("확인했습니다")) {
      replaceTextInParagraph(paragraph, [
        ["□ 확인했습니다", "☑ 확인했습니다"],
        ["□ I acknowledge", "☑ I acknowledge"],
      ]);
    }
  });

  let nextXml = new XMLSerializer().serializeToString(documentNode);
  nextXml = replacePhotoShapeDrawing(nextXml, photoRelId);
  nextXml = replaceWingdingsCheckboxesByOrder(nextXml, normalizeGender(student.gender || student.sex));
  nextXml = replaceTextCheckboxes(nextXml);
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
