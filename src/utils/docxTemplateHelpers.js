export const AGENCY_DOCUMENT_TEMPLATES = {
  authorization: "/templates/authorization-letter.docx",
  mouKoEn: "/templates/mou-ko-en.docx",
  mouZhKo: "/templates/mou-zh-ko.docx",
};

export function containsKorean(value = "") {
  return /[\uac00-\ud7af]/.test(String(value));
}

export function buildMouPartyBDisplayName(agencyName = "") {
  const normalized = String(agencyName || "").trim();

  if (!normalized) return "__________";
  if (containsKorean(normalized)) return normalized;

  return `__________ (${normalized})`;
}

export function buildMouEnglishPartyBName(agencyName = "") {
  return String(agencyName || "").trim();
}

export function buildMouBlankDate() {
  return "____. __. ____";
}

export function toDate(value = new Date()) {
  if (value instanceof Date) return new Date(value.getTime());

  const next = new Date(value);
  return Number.isNaN(next.getTime()) ? new Date() : next;
}

export function addYears(value, years = 1) {
  const next = toDate(value);
  next.setFullYear(next.getFullYear() + years);
  return next;
}

export function formatDottedDate(value = new Date()) {
  const next = toDate(value);
  const year = String(next.getFullYear());
  const month = String(next.getMonth() + 1).padStart(2, "0");
  const day = String(next.getDate()).padStart(2, "0");

  return `${year}. ${month}. ${day}`;
}

export function sanitizeFileNameSegment(value = "", fallback = "document") {
  const normalized = String(value || "")
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_")
    .replace(/\s+/g, " ");

  return normalized || fallback;
}

export function buildAuthorizationFileName(agencyName, issuedAt = new Date()) {
  const safeAgency = sanitizeFileNameSegment(agencyName, "agency");
  const safeDate = sanitizeFileNameSegment(
    formatDottedDate(issuedAt).replace(/\./g, "-"),
    "date"
  );

  return `Authorization_${safeAgency}_${safeDate}.docx`;
}

export function buildMouFileName(agencyName, variant = "ko-en") {
  const safeAgency = sanitizeFileNameSegment(agencyName, "agency");
  const safeVariant = sanitizeFileNameSegment(variant, "mou");

  return `MOU_${safeVariant}_${safeAgency}.docx`;
}

export function buildAuthorizationDocumentData(agency = {}, issuedAt = new Date()) {
  const startDate = toDate(issuedAt);
  const endDate = addYears(startDate, 1);

  return {
    agencyName: String(agency.agency_name || "").trim(),
    legalRepresentative: String(
      agency.legal_representative || agency.contact_name || ""
    ).trim(),
    businessLicenseNo: String(agency.business_license_no || "").trim(),
    termStartDate: formatDottedDate(startDate),
    termEndDate: formatDottedDate(endDate),
    issueDate: formatDottedDate(startDate),
  };
}

export function buildMouDocumentData(agency = {}) {
  const agencyName = String(agency.agency_name || "").trim();

  return {
    agencyName,
    partyBDisplayName: buildMouPartyBDisplayName(agencyName),
    partyBEnglishName: buildMouEnglishPartyBName(agencyName),
    blankDate: buildMouBlankDate(),
  };
}
