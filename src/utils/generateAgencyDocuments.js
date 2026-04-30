import JSZip from "jszip";
import {
  AGENCY_DOCUMENT_TEMPLATES,
  buildAuthorizationDocumentData,
  buildAuthorizationFileName,
  buildMouDocumentData,
  buildMouFileName,
} from "./docxTemplateHelpers";

const WORD_DOCUMENT_XML_PATH = "word/document.xml";
const TEMPLATE_KOREAN_NAME = "\uCF04\uAE00\uB85C\uBC8C\uCEE8\uC124\uD305";
const TEMPLATE_ENGLISH_NAME = "Ken Global Consulting";
const TEMPLATE_MOU_DATE = "2026. 04. ____";
function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function ensureAgency(agency) {
  if (!agency || !agency.agency_name) {
    throw new Error("Agency information is required to generate this document.");
  }
}

async function fetchTemplate(templateUrl) {
  const response = await fetch(templateUrl);

  if (!response.ok) {
    throw new Error(`Failed to load template: ${templateUrl}`);
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

function getTextNodes(paragraph) {
  return Array.from(paragraph.getElementsByTagName("w:t"));
}

function normalizeText(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function setParagraphText(paragraph, nextText) {
  const textNodes = getTextNodes(paragraph);
  if (textNodes.length === 0) return;

  textNodes[0].textContent = nextText;
  for (let index = 1; index < textNodes.length; index += 1) {
    textNodes[index].textContent = "";
  }
}

function replaceParagraphs(documentNode, transformer) {
  const paragraphs = Array.from(documentNode.getElementsByTagName("w:p"));

  paragraphs.forEach((paragraph) => {
    const textNodes = getTextNodes(paragraph);
    if (textNodes.length === 0) return;

    const currentText = textNodes.map((node) => node.textContent || "").join("");
    const nextText = transformer(currentText, normalizeText(currentText));

    if (typeof nextText === "string" && nextText !== currentText) {
      setParagraphText(paragraph, nextText);
    }
  });
}

function serializeXml(documentNode) {
  return new XMLSerializer().serializeToString(documentNode);
}

async function buildDocxBlob(templateUrl, transformXml) {
  const buffer = await fetchTemplate(templateUrl);
  const zip = await JSZip.loadAsync(buffer);
  const xmlEntry = zip.file(WORD_DOCUMENT_XML_PATH);

  if (!xmlEntry) {
    throw new Error("The template does not contain word/document.xml.");
  }

  const xmlText = await xmlEntry.async("string");
  const documentNode = parseXml(xmlText);
  const nextXml = transformXml(documentNode);

  zip.file(WORD_DOCUMENT_XML_PATH, nextXml);

  return zip.generateAsync({
    type: "blob",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
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

function buildMouXmlTransformer(agency) {
  const { partyBDisplayName, partyBEnglishName, blankDate } =
    buildMouDocumentData(agency);

  const fullPartyBPattern = new RegExp(
    `${escapeRegExp(TEMPLATE_KOREAN_NAME)}\\s*\\(${escapeRegExp(
      TEMPLATE_ENGLISH_NAME
    )}\\)`,
    "g"
  );

  return (documentNode) => {
    replaceParagraphs(documentNode, (currentText, normalizedText) => {
      let nextText = currentText;

      if (normalizedText.includes("(Party B):")) {
        nextText = nextText
          .replace(fullPartyBPattern, partyBDisplayName)
          .replace(new RegExp(escapeRegExp(TEMPLATE_KOREAN_NAME), "g"), partyBDisplayName);
      } else if (normalizedText.includes('("Party B")')) {
        nextText = nextText
          .replace(fullPartyBPattern, partyBEnglishName)
          .replace(new RegExp(escapeRegExp(TEMPLATE_ENGLISH_NAME), "g"), partyBEnglishName);
      } else {
        nextText = nextText
          .replace(fullPartyBPattern, partyBDisplayName)
          .replace(new RegExp(escapeRegExp(TEMPLATE_KOREAN_NAME), "g"), partyBDisplayName);
      }

      nextText = nextText.replaceAll(TEMPLATE_MOU_DATE, blankDate);

      return nextText;
    });

    return serializeXml(documentNode);
  };
}

function buildAuthorizationXmlTransformer(agency, issuedAt = new Date()) {
  const {
    agencyName,
    legalRepresentative,
    businessLicenseNo,
    termStartDate,
    termEndDate,
    issueDate,
  } = buildAuthorizationDocumentData(agency, issuedAt);

  let issueDateReplaced = false;

  return (documentNode) => {
    replaceParagraphs(documentNode, (currentText, normalizedText) => {
      if (
        normalizedText.includes("(Name") &&
        normalizedText.includes(":") &&
        !normalizedText.includes("Representative") &&
        !normalizedText.includes("Registration Number")
      ) {
        return `${currentText.replace(/\s+$/, "")}${agencyName ? ` ${agencyName}` : ""}`;
      }

      if (
        normalizedText.includes("(Representative") &&
        normalizedText.includes(":")
      ) {
        return `${currentText.replace(/\s+$/, "")}${
          legalRepresentative ? ` ${legalRepresentative}` : ""
        }`;
      }

      if (
        normalizedText.includes("(Registration Number") &&
        normalizedText.includes(":")
      ) {
        return `${currentText.replace(/\s+$/, "")}${
          businessLicenseNo ? ` ${businessLicenseNo}` : ""
        }`;
      }

      if (normalizedText.includes("(Term") && normalizedText.includes(":")) {
        return currentText.replace(
          /202\s*X\s*\.\s*XX\s*\.\s*XX\s*~\s*202\s*X\s*\.\s*XX\s*\.\s*XX/,
          `${termStartDate} ~ ${termEndDate}`
        );
      }

            if (
        !issueDateReplaced &&
        /202\s*X\s*\.\s*XX\s*\.\s*XX/.test(currentText) &&
        !normalizedText.includes("(Term")
      ) {
        issueDateReplaced = true;
        return currentText.replace(/202\s*X\s*\.\s*XX\s*\.\s*XX/, issueDate);
      }

      if (currentText.includes(TEMPLATE_KOREAN_NAME)) {
        return currentText.replace(
          new RegExp(escapeRegExp(TEMPLATE_KOREAN_NAME), "g"),
          agencyName
        );
      }

      return currentText;
    });

    return serializeXml(documentNode);
  };
}

export async function generateAuthorizationLetterDocx(agency, options = {}) {
  ensureAgency(agency);

  const issuedAt = options.issuedAt || new Date();
  const blob = await buildDocxBlob(
    AGENCY_DOCUMENT_TEMPLATES.authorization,
    buildAuthorizationXmlTransformer(agency, issuedAt)
  );

  const fileName =
    options.fileName ||
    buildAuthorizationFileName(agency.agency_name, issuedAt);

  triggerDownload(blob, fileName);
}

export async function generateMouKoEnDocx(agency, options = {}) {
  ensureAgency(agency);

  const blob = await buildDocxBlob(
    AGENCY_DOCUMENT_TEMPLATES.mouKoEn,
    buildMouXmlTransformer(agency)
  );

  const fileName =
    options.fileName || buildMouFileName(agency.agency_name, "ko-en");

  triggerDownload(blob, fileName);
}

export async function generateMouZhKoDocx() {
  throw new Error("The Chinese-Korean MOU template is not ready yet.");
}

export const agencyDocumentHandlers = {
  authorization: generateAuthorizationLetterDocx,
  mouKoEn: generateMouKoEnDocx,
  mouZhKo: generateMouZhKoDocx,
};
