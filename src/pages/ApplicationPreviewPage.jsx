import { Link, useParams } from "react-router-dom";
import { getApplicationById } from "../data/mockApplications";
import { useAdminSession } from "../contexts/AdminSessionContext";
import ApplicationFormPreview from "../components/previews/ApplicationFormPreview";
import LanguageApplicationFormPreview from "../components/previews/LanguageApplicationFormPreview";
import GraduateApplicationFormPreview from "../components/previews/GraduateApplicationFormPreview";

const messages = {
  zh: {
    pageTitle: "学校固定格式预览",
    pageDesc: "按学校申请表固定结构预览当前学生申请内容",
    backReview: "返回材料审核页",
    download: "下载学校格式申请表",
    empty: "-",
    sections: {
      application: "入学申请书主表预览",
      education: "학력: 고등학교 ~ 현재까지",
      language: "언어능력",
      korean: "[한국어능력] [Korean]",
      english: "[영어능력] [English]",
      refund: "退款账户申请书预览",
      applicantInfo: "1. 신청자 정보",
      beneficiary: "2-1. 수취인 정보",
      bank: "2-2. 은행 정보",
      personalStatement: "自我介绍与学业计划预览",
      consent: "个人信息收集与使用同意书预览",
      guarantee: "财政担保书预览",
      guaranteeApplicant: "신청인개인정보",
      guarantor: "재정보증인정보",
    },
    ps: {
      q1: "1. 본인에 대해 자유롭게 소개해 주세요.",
      q2: "2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지",
      q3: "3. 한라대학교를 선택한 이유와 지원 학과(전공)를 선택한 사유",
      q4: "4. 입학 후 학업계획과 졸업 후 진로계획",
    },
    labels: {
      major: "지원학과 (Major)",
      admissionType: "지원구분 (Admission Type)",
      programTrack: "지원트랙 (Program Track)",
      fullName: "성명 (여권기준)",
      sex: "성별 (Sex)",
      nationalityApplicant: "국적 (Applicant)",
      nationalityFather: "국적 (Father)",
      nationalityMother: "국적 (Mother)",
      passportNo: "여권번호",
      alienNo: "외국인등록번호",
      birth: "생년월일",
      phone: "전화번호",
      email: "E-mail",
      address: "주소",
      dormitory: "생활관 신청",
      education1: "학력 1",
      education2: "학력 2",
      education3: "학력 3",
      refundName: "성명 (Name)",
      refundDob: "생년월일",
      refundEmail: "이메일",
      accountHolder: "예금주명",
      relationship: "신청자와의 관계",
      beneficiaryAddress: "주소",
      city: "도시",
      country: "국가",
      bankName: "은행명",
      bankAddress: "은행 주소",
      accountNumber: "계좌번호",
      consentPersonal: "개인정보 수집·이용 동의",
      consentNotice: "위 내용 확인",
      department: "입학학부 (학과)",
      name: "이름",
      idNo: "신분증번호",
      guarantorPassport: "여권번호",
      guarantorRelation: "관계",
      occupation: "직업",
      home: "연락처 (Home)",
      mobileEmail: "연락처 (Mobile / E-MAIL)",
      work: "연락처 (Work)",
    },
  },
  en: {
    pageTitle: "School Form Preview",
    pageDesc: "Preview the current student application in the fixed school form structure",
    backReview: "Back to Material Review",
    download: "Download School Form",
    empty: "-",
    sections: {
      application: "Application Form Main Preview",
      education: "Education: High School to Present",
      language: "Language Proficiency",
      korean: "Korean Proficiency",
      english: "English Proficiency",
      refund: "Refund Account Form Preview",
      applicantInfo: "1. Applicant Information",
      beneficiary: "2-1. Beneficiary Information",
      bank: "2-2. Bank Information",
      personalStatement: "Personal Statement and Study Plan Preview",
      consent: "Personal Information Consent Preview",
      guarantee: "Financial Guarantee Preview",
      guaranteeApplicant: "Applicant Details",
      guarantor: "Guarantor Details",
    },
    ps: {
      q1: "1. Please introduce yourself freely.",
      q2: "2. What efforts have you made to prepare for studying in Korea?",
      q3: "3. Why did you choose Halla University and your intended major?",
      q4: "4. Study plan after admission and career plan after graduation",
    },
    labels: {
      major: "Major",
      admissionType: "Admission Type",
      programTrack: "Program Track",
      fullName: "Full Name as Shown on Passport",
      sex: "Sex",
      nationalityApplicant: "Nationality (Applicant)",
      nationalityFather: "Nationality (Father)",
      nationalityMother: "Nationality (Mother)",
      passportNo: "Passport No.",
      alienNo: "Alien Registration No.",
      birth: "Date of Birth",
      phone: "Phone",
      email: "E-mail",
      address: "Address",
      dormitory: "Dormitory Request",
      education1: "Education 1",
      education2: "Education 2",
      education3: "Education 3",
      refundName: "Name",
      refundDob: "Date of Birth",
      refundEmail: "E-mail",
      accountHolder: "Account Holder",
      relationship: "Relationship with Applicant",
      beneficiaryAddress: "Address",
      city: "City",
      country: "Country",
      bankName: "Bank Name",
      bankAddress: "Bank Address",
      accountNumber: "Account Number",
      consentPersonal: "Personal Information Collection and Use Consent",
      consentNotice: "Acknowledgement",
      department: "Department (Major)",
      name: "Name",
      idNo: "ID Number",
      guarantorPassport: "Passport Number",
      guarantorRelation: "Relationship",
      occupation: "Occupation",
      home: "Contact (Home)",
      mobileEmail: "Contact (Mobile / E-mail)",
      work: "Contact (Work)",
    },
  },
  ko: {
    pageTitle: "학교 지정 양식 미리보기",
    pageDesc: "현재 학생 지원 내용을 학교 지원서 고정 구조로 미리봅니다",
    backReview: "서류 심사 페이지로 돌아가기",
    download: "학교 양식 지원서 다운로드",
    empty: "-",
    sections: {
      application: "입학지원서 본문 미리보기",
      education: "학력: 고등학교 ~ 현재까지",
      language: "언어능력",
      korean: "한국어능력",
      english: "영어능력",
      refund: "등록금 환불계좌 신청서 미리보기",
      applicantInfo: "1. 신청자 정보",
      beneficiary: "2-1. 수취인 정보",
      bank: "2-2. 은행 정보",
      personalStatement: "자기소개서 및 학업계획서 미리보기",
      consent: "개인정보 수집 및 이용 동의서 미리보기",
      guarantee: "재정보증서 미리보기",
      guaranteeApplicant: "신청인개인정보",
      guarantor: "재정보증인정보",
    },
    ps: {
      q1: "1. 본인에 대해 자유롭게 소개해 주세요.",
      q2: "2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지",
      q3: "3. 한라대학교를 선택한 이유와 지원 학과(전공)를 선택한 사유",
      q4: "4. 입학 후 학업계획과 졸업 후 진로계획",
    },
    labels: {
      major: "지원학과",
      admissionType: "지원구분",
      programTrack: "지원트랙",
      fullName: "성명 (여권기준)",
      sex: "성별",
      nationalityApplicant: "국적 (신청인)",
      nationalityFather: "국적 (부)",
      nationalityMother: "국적 (모)",
      passportNo: "여권번호",
      alienNo: "외국인등록번호",
      birth: "생년월일",
      phone: "전화번호",
      email: "E-mail",
      address: "주소",
      dormitory: "생활관 신청",
      education1: "학력 1",
      education2: "학력 2",
      education3: "학력 3",
      refundName: "성명",
      refundDob: "생년월일",
      refundEmail: "이메일",
      accountHolder: "예금주명",
      relationship: "신청자와의 관계",
      beneficiaryAddress: "주소",
      city: "도시",
      country: "국가",
      bankName: "은행명",
      bankAddress: "은행 주소",
      accountNumber: "계좌번호",
      consentPersonal: "개인정보 수집·이용 동의",
      consentNotice: "위 내용 확인",
      department: "입학학부 (학과)",
      name: "이름",
      idNo: "신분증번호",
      guarantorPassport: "여권번호",
      guarantorRelation: "관계",
      occupation: "직업",
      home: "연락처 (Home)",
      mobileEmail: "연락처 (Mobile / E-MAIL)",
      work: "연락처 (Work)",
    },
  },
};

function Field({ label, value, emptyText }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b border-slate-200 py-3 text-sm">
      <div className="font-semibold text-slate-700">{label}</div>
      <div className="text-slate-900">{value || emptyText}</div>
    </div>
  );
}

function LongBlock({ title, value, emptyText }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="text-sm font-semibold text-slate-700">{title}</div>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-900">
        {value || emptyText}
      </div>
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        ) : null}
      </div>

      <div className="mt-6">{children}</div>
    </section>
  );
}

function ApplicationPreviewPage() {
  const { id } = useParams();
  const adminContext = useAdminSession();
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;
  const data = getApplicationById(id);
  const showGuarantee = data.bankCertificateHolderType === "guarantor";

  const applicationType =
    data.application_type || data.applicationType || "undergraduate";

  const renderApplicationPreview = () => {
    if (applicationType === "language") {
      return <LanguageApplicationFormPreview student={data} />;
    }

    if (applicationType === "graduate") {
      return <GraduateApplicationFormPreview student={data} />;
    }

    return <ApplicationFormPreview student={data} />;
  };

  const field = (label, value) => (
    <Field label={label} value={value} emptyText={t.empty} />
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{t.pageDesc}</p>
          </div>

          <div className="flex gap-3">
            <Link
              to={`/applications/${data.id}/review`}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              {t.backReview}
            </Link>
            <button className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              {t.download}
            </button>
          </div>
        </div>
      </div>

      <Section
        title={t.sections.application}
        subtitle={
          applicationType === "language"
            ? "Language Program"
            : applicationType === "graduate"
            ? "Graduate School"
            : "Undergraduate"
        }
      >
        {renderApplicationPreview()}
      </Section>
      <Section
        title="한라대학교 등록금 환불계좌 신청서"
        subtitle={t.sections.refund}
      >
        <div className="grid gap-8 xl:grid-cols-2">
          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {t.sections.applicantInfo}
            </h3>
            <div className="rounded-2xl border border-slate-200 p-5">
              {field(t.labels.refundName, data.refundName)}
              {field(t.labels.refundDob, data.refundDob)}
              {field(t.labels.refundEmail, data.refundEmail)}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold text-slate-900">
              {t.sections.beneficiary}
            </h3>
            <div className="rounded-2xl border border-slate-200 p-5">
              {field(t.labels.accountHolder, data.accountHolder)}
              {field(t.labels.relationship, data.relationship)}
              {field(t.labels.beneficiaryAddress, data.beneficiaryAddress)}
              {field(t.labels.city, data.beneficiaryCity)}
              {field(t.labels.country, data.beneficiaryCountry)}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-bold text-slate-900">
            {t.sections.bank}
          </h3>
          <div className="rounded-2xl border border-slate-200 p-5">
            {field(t.labels.bankName, data.bankName)}
            {field(t.labels.bankAddress, data.bankAddress)}
            {field(t.labels.city, data.bankCity)}
            {field(t.labels.country, data.bankCountry)}
            {field(t.labels.accountNumber, data.accountNumber)}
            {field("SWIFT Code", data.swiftCode)}
          </div>
        </div>
      </Section>

      <Section
        title="자기소개서 및 학업계획서 [1-2]"
        subtitle={t.sections.personalStatement}
      >
        <div className="space-y-5">
          <LongBlock title={t.ps.q1} value={data.ps1} emptyText={t.empty} />
          <LongBlock title={t.ps.q2} value={data.ps2} emptyText={t.empty} />
          <LongBlock title={t.ps.q3} value={data.ps3} emptyText={t.empty} />
          <LongBlock title={t.ps.q4} value={data.ps4} emptyText={t.empty} />
        </div>
      </Section>

      <Section
        title="개인정보수집·이용 제공 동의서 [1-3]"
        subtitle={t.sections.consent}
      >
        <div className="rounded-2xl border border-slate-200 p-5">
          {field(t.labels.consentPersonal, data.agreePersonalInfo)}
          {field(t.labels.consentNotice, data.acknowledgeNotice)}
        </div>
      </Section>

      {showGuarantee && (
        <Section
          title="입학신청인 재정보증서 [1-4]"
          subtitle={t.sections.guarantee}
        >
          <div className="grid gap-8 xl:grid-cols-2">
            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                {t.sections.guaranteeApplicant}
              </h3>
              <div className="rounded-2xl border border-slate-200 p-5">
                {field(t.labels.department, data.guarantorDepartmentMajor)}
                {field(t.labels.name, data.guarantorApplicantName)}
                {field(t.labels.country, data.guarantorApplicantNationality)}
                {field(t.labels.idNo, data.guarantorApplicantIdNumber)}
                {field(
                  t.labels.guarantorPassport,
                  data.guarantorApplicantPassportNumber
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-lg font-bold text-slate-900">
                {t.sections.guarantor}
              </h3>
              <div className="rounded-2xl border border-slate-200 p-5">
                {field(t.labels.name, data.guarantorName)}
                {field(t.labels.guarantorRelation, data.guarantorRelationship)}
                {field(t.labels.idNo, data.guarantorIdNumber)}
                {field(t.labels.occupation, data.guarantorOccupation)}
                {field(t.labels.address, data.guarantorAddress)}
                {field(t.labels.home, data.guarantorHomeContact)}
                {field(t.labels.mobileEmail, data.guarantorMobileEmail)}
                {field(t.labels.work, data.guarantorWorkContact)}
              </div>
            </div>
          </div>
        </Section>
      )}
    </div>
  );
}

export default ApplicationPreviewPage;
