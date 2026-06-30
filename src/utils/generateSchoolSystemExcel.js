import JSZip from "jszip";
import {
  getCefrCode,
  getSchoolAdmissionTypeCode,
  getSchoolMajorCode,
  getSchoolTrackCode,
  getSponsorRelationCode,
  toIsoNumericCountryCode,
} from "../data/schoolSystemExportMappings";

const TEMPLATE_URL = "/templates/school-system-import-template.xlsx";
const COLUMN_COUNT = 73;

const asText = (value) =>
  value === undefined || value === null ? "" : String(value).trim();

function formatYYYYMMDD(value) {
  const raw = asText(value);
  if (!raw) return "";

  const matched = raw.match(/^(\d{4})\D?(\d{2})\D?(\d{2})/);
  return matched ? `${matched[1]}${matched[2]}${matched[3]}` : "";
}

function normalizeLevel(value, minimum, maximum) {
  const raw = asText(value);
  if (!raw) return "";

  const matched = raw.match(/\b(\d+)\b/);
  if (!matched) return "";

  const level = Number(matched[1]);
  return level >= minimum && level <= maximum ? String(level) : "";
}

function getIntakeYear(intake) {
  return asText(intake?.intake_year || intake?.year);
}

function getIntakeMonthCode(intake) {
  const month = Number(intake?.intake_month);
  if (month === 3) return "03";
  if (month === 9) return "09";
  return "";
}

function getIntakeRoundCode(intake) {
  const round = Number(
    intake?.round_number || intake?.intake_round_number
  );

  return round >= 1 && round <= 4
    ? String(round).padStart(2, "0")
    : "";
}

function parseEducationInstitution(value) {
  const raw = asText(value);
  if (!raw) return "";

  const parts = raw.split("|").map((item) => item.trim());
  return parts.length >= 2 ? parts[1] : parts[0];
}

function getEducationNames(student) {
  const institutions = [
    student.education1,
    student.education2,
    student.education3,
  ]
    .map(parseEducationInstitution)
    .filter(Boolean);

  const highSchoolName = institutions[0] || "";
  const admissionType = asText(student.admission_type);
  const isFreshman = admissionType === "Freshman";

  const universityName =
    !isFreshman && institutions.length > 1
      ? institutions[institutions.length - 1]
      : "";

  return { highSchoolName, universityName };
}

function getSponsorValues(student) {
  const holderType = asText(
    student.bank_certificate_holder_type || "self"
  ).toLowerCase();

  const isSelf = holderType !== "guarantor";
  const studentName =
    asText(student.english_name) ||
    asText(student.full_name_passport);

  const studentPhone =
    asText(student.tel) ||
    asText(student.phone);

  if (isSelf) {
    return {
      sponsorName: studentName,
      sponsorRelation: "06",
      sponsorTel: studentPhone,
    };
  }

  return {
    sponsorName: asText(student.guarantor_name),
    sponsorRelation: getSponsorRelationCode(
      student.guarantor_relationship
    ),
    sponsorTel:
      asText(student.guarantor_mobile) ||
      asText(student.guarantor_mobile_email) ||
      asText(student.guarantor_home_contact) ||
      asText(student.guarantor_work_contact) ||
      asText(student.guarantor_work),
  };
}

function buildSchoolSystemRow({
  student,
  intake,
  passportFile,
  majorCatalog,
  index,
}) {
  const phone =
    asText(student.tel) ||
    asText(student.phone);

  const { highSchoolName, universityName } =
    getEducationNames(student);

  const {
    sponsorName,
    sponsorRelation,
    sponsorTel,
  } = getSponsorValues(student);

  const values = {
    A: String(index + 1),
    B: "01",
    C: getIntakeYear(intake),
    D: getSchoolAdmissionTypeCode(student.admission_type),
    E: getIntakeMonthCode(intake),
    F: getIntakeRoundCode(intake),
    G: getSchoolTrackCode(student.program_track),

    M: normalizeLevel(student.topik, 1, 6),
    O: normalizeLevel(student.kiip, 1, 5),
    Q: asText(student.ielts),
    R: asText(student.toefl),
    T: asText(student.toefl_ibt),
    U: asText(student.teps),
    V: asText(student.new_teps),
    W: getCefrCode(student.cefr),
    X: getSchoolMajorCode(student.major, majorCatalog),

    Y: asText(passportFile?.ocr_last_name),
    Z: asText(passportFile?.ocr_given_names),
    AB:
      ["male", "m", "男", "남", "남자"].includes(
        asText(student.gender).toLowerCase()
      )
        ? "M"
        : ["female", "f", "女", "여", "여자"].includes(
            asText(student.gender).toLowerCase()
          )
        ? "F"
        : "",
    AC: formatYYYYMMDD(student.date_of_birth),
    AE: toIsoNumericCountryCode(
      student.nationality_applicant || student.nationality
    ),
    AH: asText(student.passport_no),
    AK: formatYYYYMMDD(passportFile?.ocr_date_of_issue),
    AL: formatYYYYMMDD(passportFile?.ocr_date_of_expiration),

    AO: phone,
    AP: phone,
    AQ: asText(student.email),

    AV: highSchoolName,
    AW: universityName,

    BB: sponsorName,
    BC: sponsorRelation,
    BE: sponsorTel,

    BI:
      asText(student.account_holder) ||
      asText(student.refund_name),
        BJ: getSponsorRelationCode(
      student.relationship_with_applicant ||
      student.relationshipWithApplicant ||
      student.relationship
    ),
    BK: asText(student.beneficiary_address),
    BL: phone,
    BM: asText(student.beneficiary_city),
    BN: toIsoNumericCountryCode(student.beneficiary_country),
    BO: asText(student.bank_name),
    BP: asText(student.swift_code),
    BQ: asText(student.bank_address),
    BR: asText(student.bank_city),
    BS: toIsoNumericCountryCode(student.bank_country),
    BU: asText(student.account_number),
  };

  return Array.from({ length: COLUMN_COUNT }, (_, columnIndex) => {
        const column = encodeColumn(columnIndex);
    return asText(values[column]);
  });
}

function encodeColumn(columnIndex) {
  let result = "";
  let value = columnIndex + 1;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result =
      String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}

function parseXml(xmlText, description) {
  const document = new DOMParser().parseFromString(
    xmlText,
    "application/xml"
  );

  if (
    document.getElementsByTagName("parsererror").length > 0
  ) {
    throw new Error(`${description}格式无法解析`);
  }

  return document;
}

function getDirectChildren(parent, localName) {
  return Array.from(parent.childNodes).filter(
    (node) =>
      node.nodeType === 1 &&
      node.localName === localName
  );
}

function getColumnFromCellReference(reference) {
  const matched = String(reference || "").match(
    /^([A-Z]+)\d+$/
  );

  return matched ? matched[1] : "";
}

function createExportRow({
  worksheetDocument,
  templateRow,
  values,
  excelRowNumber,
}) {
  const spreadsheetNamespace =
    "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

  const templateCells = new Map();

  getDirectChildren(templateRow, "c").forEach((cell) => {
    const column = getColumnFromCellReference(
      cell.getAttribute("r")
    );

    if (column) {
      templateCells.set(column, cell);
    }
  });

  const outputRow = templateRow.cloneNode(false);

  outputRow.setAttribute("r", String(excelRowNumber));
  outputRow.setAttribute("spans", `1:${COLUMN_COUNT}`);

  values.forEach((value, columnIndex) => {
    const column = encodeColumn(columnIndex);
    const templateCell = templateCells.get(column);

    const outputCell = templateCell
      ? templateCell.cloneNode(false)
      : worksheetDocument.createElementNS(
          spreadsheetNamespace,
          "c"
        );

    outputCell.setAttribute(
      "r",
      `${column}${excelRowNumber}`
    );

    outputCell.removeAttribute("t");

    while (outputCell.firstChild) {
      outputCell.removeChild(outputCell.firstChild);
    }

    const textValue = asText(value);

    if (textValue) {
      outputCell.setAttribute("t", "inlineStr");

      const inlineString =
        worksheetDocument.createElementNS(
          spreadsheetNamespace,
          "is"
        );

      const textNode =
        worksheetDocument.createElementNS(
          spreadsheetNamespace,
          "t"
        );

      if (
        /^\s/.test(textValue) ||
        /\s$/.test(textValue)
      ) {
        textNode.setAttributeNS(
          "http://www.w3.org/XML/1998/namespace",
          "xml:space",
          "preserve"
        );
      }

      textNode.textContent = textValue;
      inlineString.appendChild(textNode);
      outputCell.appendChild(inlineString);
    }

    outputRow.appendChild(outputCell);
  });

  return outputRow;
}

function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 1000);
}

export async function downloadSchoolSystemExcel({
  applications,
  intakeMap,
  passportFileMap,
  majorCatalog,
  fileName,
}) {
  const response = await fetch(TEMPLATE_URL, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `无法读取学校 Excel 模板（HTTP ${response.status}）`
    );
  }

  const templateBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(templateBuffer);

  const worksheetPath =
    "xl/worksheets/sheet1.xml";

  const worksheetFile = zip.file(worksheetPath);

  if (!worksheetFile) {
    throw new Error(
      "学校 Excel 模板中没有找到第一个工作表"
    );
  }

  const worksheetXml = await worksheetFile.async(
    "string"
  );

  const worksheetDocument = parseXml(
    worksheetXml,
    "学校 Excel 工作表"
  );

  const sheetData =
    worksheetDocument.getElementsByTagNameNS(
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "sheetData"
    )[0];

  if (!sheetData) {
    throw new Error(
      "学校 Excel 模板中没有找到数据区域"
    );
  }

  const templateRow = getDirectChildren(
    sheetData,
    "row"
  ).find((row) => row.getAttribute("r") === "3");

  if (!templateRow) {
    throw new Error(
      "学校 Excel 模板中没有找到第3行样式模板"
    );
  }

  const rows = applications.map((student, index) => {
    const intake =
      intakeMap[student.intake_id] || student;

    const passportFile =
      passportFileMap[student.public_id] || null;

    return buildSchoolSystemRow({
      student,
      intake,
      passportFile,
      majorCatalog,
      index,
    });
  });

  getDirectChildren(sheetData, "row")
    .filter(
      (row) =>
        Number(row.getAttribute("r")) >= 3
    )
    .forEach((row) => {
      sheetData.removeChild(row);
    });

  rows.forEach((values, rowIndex) => {
    const excelRowNumber = rowIndex + 3;

    const outputRow = createExportRow({
      worksheetDocument,
      templateRow,
      values,
      excelRowNumber,
    });

    sheetData.appendChild(outputRow);
  });

  const dimension =
    worksheetDocument.getElementsByTagNameNS(
      "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "dimension"
    )[0];

  if (dimension) {
    const finalRowNumber = Math.max(
      3,
      rows.length + 2
    );

    dimension.setAttribute(
      "ref",
      `A1:BU${finalRowNumber}`
    );
  }

  const updatedWorksheetXml =
    new XMLSerializer().serializeToString(
      worksheetDocument
    );

  zip.file(
    worksheetPath,
    updatedWorksheetXml
  );

  const outputBlob = await zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    compression: "DEFLATE",
    compressionOptions: {
      level: 6,
    },
  });

  downloadBlob(outputBlob, fileName);
}