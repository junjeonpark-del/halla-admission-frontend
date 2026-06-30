import * as XLSX from "xlsx";
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
    BJ: asText(student.relationship),
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
    const column = XLSX.utils.encode_col(columnIndex);
    return asText(values[column]);
  });
}

function cloneCellStyle(cell) {
  if (!cell) return null;

  return {
    s: cell.s ? JSON.parse(JSON.stringify(cell.s)) : undefined,
    z: cell.z,
  };
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

  const arrayBuffer = await response.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellStyles: true,
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error("学校 Excel 模板中没有可用工作表");
  }

  const rowThreeStyles = Array.from(
    { length: COLUMN_COUNT },
    (_, columnIndex) => {
      const address = XLSX.utils.encode_cell({
        r: 2,
        c: columnIndex,
      });

      return cloneCellStyle(worksheet[address]);
    }
  );

  const rows = applications.map((student, index) => {
    const intake =
      intakeMap[student.intake_id] ||
      student;

    const passportFile =
      passportFileMap[student.public_id] ||
      null;

    return buildSchoolSystemRow({
      student,
      intake,
      passportFile,
      majorCatalog,
      index,
    });
  });

  XLSX.utils.sheet_add_aoa(worksheet, rows, {
    origin: "A3",
  });

  rows.forEach((row, rowIndex) => {
    row.forEach((value, columnIndex) => {
      const address = XLSX.utils.encode_cell({
        r: rowIndex + 2,
        c: columnIndex,
      });

      if (!worksheet[address]) {
        worksheet[address] = {
          t: "s",
          v: asText(value),
        };
      }

      worksheet[address].t = "s";
      worksheet[address].v = asText(value);

      const style = rowThreeStyles[columnIndex];

      if (style?.s) {
        worksheet[address].s = JSON.parse(
          JSON.stringify(style.s)
        );
      }

      if (style?.z) {
        worksheet[address].z = style.z;
      }
    });
  });

  XLSX.writeFile(workbook, fileName, {
    bookType: "xlsx",
    compression: true,
    cellStyles: true,
  });
}