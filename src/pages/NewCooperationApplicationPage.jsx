import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const MATERIALS_BUCKET = "application-files";

const messages = {
  zh: {
    steps: ["项目信息", "学生信息", "学历信息", "同意书与签字", "上传材料"],
    common: {
      loading: "正在加载中外合作办学信息...",
      noPermission: "当前机构尚未开通中外合作办学填写权限。",
      select: "请选择",
      readonly: "系统固定",
      currentStep: "当前步骤",
      prev: "上一步",
      next: "下一步",
      saveDraft: "保存草稿",
      submit: "提交信息",
      copyLink: "复制链接",
      copySuccess: "链接已复制",
      copyFailed: "复制失败，请手动复制",
      studentFillLink: "学生填写链接",
      uploadedFiles: "已上传文件",
      selectedFiles: "本次新选择文件",
      noSelectedFiles: "尚未选择新文件",
      chooseFile: "选择文件",
      delete: "删除",
      uploadRule: "上传要求：照片文件不能超过 2MB，PDF 文件不能超过 4MB。",
      imageTooLarge: '图片文件 "{fileName}" 超过 2MB，请压缩后重新上传。',
      pdfTooLarge: 'PDF 文件 "{fileName}" 超过 4MB，请压缩后重新上传。',
      invalidFile: '文件 "{fileName}" 仅支持图片或 PDF。',
      saveSuccess: "草稿已保存",
      updateSuccess: "草稿已更新",
      submitSuccess: "中外合作办学信息已提交",
      saveFailed: "保存失败：",
      submitFailed: "提交失败：",
      invalidSession: "当前机构登录状态无效，请重新登录后再操作。",
      fillRequired: "请先填写必填项。",
      fixedNationality: "中国",
      fixedAdmissionType: "新入",
      fixedProgram: "中外合作办学",
      fixedSemester: "9月学期",
      agreementText:
        "本人确认上述信息真实准确，并同意汉拿大学收集和使用个人信息用于中外合作办学学籍管理及相关业务。",
    },
    options: {
      sex: [
        { value: "Male", label: "男" },
        { value: "Female", label: "女" },
      ],
      academicStatus: [
        { value: "active", label: "在学" },
        { value: "suspended", label: "休学" },
        { value: "completed", label: "结业" },
        { value: "graduated", label: "毕业" },
      ],
      agree: [
        { value: "agree", label: "同意" },
        { value: "disagree", label: "不同意" },
      ],
    },
    sections: {
      pageTitle: "中外合作办学信息填写",
      pageDesc:
        "按中外合作办学个人信息卡填写。国籍、入学区分、项目和9月学期由系统固定。",
      step1Title: "第1步：项目信息",
      step2Title: "第2步：学生个人信息",
      step3Title: "第3步：学历信息",
      step4Title: "第4步：个人信息同意书与签字",
      step5Title: "第5步：上传材料",
      educationRecord: "学历记录",
    },
    fields: {
      university: "大学名称",
      partnerMajor: "专业",
      hallaMajor: "汉拿大学对应专业",
      admissionYear: "入学年份",
      semester: "入学学期",
      admissionType: "入学区分",
      program: "项目",
      fullName: "姓名",
      sex: "性别",
      nationality: "国籍",
      dateOfBirth: "出生日期",
      email: "E-mail",
      tel: "电话",
      academicStatus: "学籍状态",
      idCardNumber: "身份证号码",
      street: "街道地址",
      city: "城市",
      country: "国家",
      educationStart: "开始日期",
      educationEnd: "结束日期",
      institution: "学校名",
      educationLocation: "学校所在地国家/城市",
      agreeInfo: "个人信息收集与使用",
      signature: "申请人签字",
      autoSignature: "自动生成名字",
    },
    materials: {
      cooperation_photo: {
        label: "证件照",
        desc: "上传学生证件照。",
      },
      cooperation_id_card: {
        label: "身份证",
        desc: "上传身份证扫描件或清晰照片。",
      },
      cooperation_high_school_diploma: {
        label: "高中毕业证",
        desc: "上传高中毕业证。",
      },
      cooperation_high_school_transcript: {
        label: "高中成绩单",
        desc: "上传高中成绩单。",
      },
    },
  },
  en: {
    steps: ["Program", "Student Info", "Education", "Consent & Signature", "Materials"],
    common: {
      loading: "Loading cooperation program information...",
      noPermission:
        "This agency is not enabled for Sino-Foreign Cooperative Education.",
      select: "Please select",
      readonly: "Fixed by system",
      currentStep: "Current step",
      prev: "Previous",
      next: "Next",
      saveDraft: "Save Draft",
      submit: "Submit",
      copyLink: "Copy Link",
      copySuccess: "Link copied",
      copyFailed: "Copy failed. Please copy manually.",
      studentFillLink: "Student Fill Link",
      uploadedFiles: "Uploaded Files",
      selectedFiles: "Newly Selected Files",
      noSelectedFiles: "No new files selected",
      chooseFile: "Choose File",
      delete: "Delete",
      uploadRule: "Upload limits: images up to 2MB, PDF up to 4MB.",
      imageTooLarge:
        'Image file "{fileName}" exceeds 2MB. Please compress it and upload again.',
      pdfTooLarge:
        'PDF file "{fileName}" exceeds 4MB. Please compress it and upload again.',
      invalidFile: 'File "{fileName}" only supports image or PDF.',
      saveSuccess: "Draft saved",
      updateSuccess: "Draft updated",
      submitSuccess: "Cooperation program information submitted",
      saveFailed: "Save failed: ",
      submitFailed: "Submit failed: ",
      invalidSession: "Current agency session is invalid. Please log in again.",
      fillRequired: "Please complete the required fields first.",
      fixedNationality: "China",
      fixedAdmissionType: "Freshman",
      fixedProgram: "Sino-Foreign Cooperative Education Program",
      fixedSemester: "September Semester",
      agreementText:
        "I certify that the information above is true and accurate, and agree that Halla University may collect and use my personal information for cooperative education student record management and related work.",
    },
    options: {
      sex: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
      academicStatus: [
        { value: "active", label: "Active" },
        { value: "suspended", label: "Suspended" },
        { value: "completed", label: "Completed" },
        { value: "graduated", label: "Graduated" },
      ],
      agree: [
        { value: "agree", label: "I agree" },
        { value: "disagree", label: "I disagree" },
      ],
    },
    sections: {
      pageTitle: "Cooperation Program Information",
      pageDesc:
        "Fill out the personal information card for the cooperation program. Nationality, admission type, program, and September semester are fixed by the system.",
      step1Title: "Step 1: Program Information",
      step2Title: "Step 2: Student Information",
      step3Title: "Step 3: Education",
      step4Title: "Step 4: Consent and Signature",
      step5Title: "Step 5: Upload Materials",
      educationRecord: "Education Record",
    },
    fields: {
      university: "University Name",
      partnerMajor: "Major",
      hallaMajor: "Halla Major",
      admissionYear: "Admission Year",
      semester: "Semester of Admission",
      admissionType: "Admission Type",
      program: "Program",
      fullName: "Full Name",
      sex: "Sex",
      nationality: "Nationality",
      dateOfBirth: "Date of Birth",
      email: "E-mail",
      tel: "Contact Number",
      academicStatus: "Academic Status",
      idCardNumber: "ID Card Number",
      street: "Street Address",
      city: "City",
      country: "Country",
      educationStart: "Start Date",
      educationEnd: "End Date",
      institution: "Institution",
      educationLocation: "School Location (Country/City)",
      agreeInfo: "Personal Information Collection and Use",
      signature: "Applicant Signature",
      autoSignature: "Generate Name",
    },
    materials: {
      cooperation_photo: {
        label: "ID Photo",
        desc: "Upload the student's ID photo.",
      },
      cooperation_id_card: {
        label: "ID Card",
        desc: "Upload a clear scan or photo of the ID card.",
      },
      cooperation_high_school_diploma: {
        label: "High School Diploma",
        desc: "Upload the high school diploma.",
      },
      cooperation_high_school_transcript: {
        label: "High School Transcript",
        desc: "Upload the high school transcript.",
      },
    },
  },
  ko: {
    steps: ["프로그램 정보", "학생 정보", "학력 정보", "동의 및 서명", "서류 업로드"],
    common: {
      loading: "중외합작프로그램 정보를 불러오는 중...",
      noPermission: "현재 기관은 중외합작프로그램 작성 권한이 없습니다.",
      select: "선택하세요",
      readonly: "시스템 고정",
      currentStep: "현재 단계",
      prev: "이전",
      next: "다음",
      saveDraft: "초안 저장",
      submit: "제출",
      copyLink: "링크 복사",
      copySuccess: "링크가 복사되었습니다",
      copyFailed: "복사에 실패했습니다. 수동으로 복사하세요.",
      studentFillLink: "학생 작성 링크",
      uploadedFiles: "업로드된 파일",
      selectedFiles: "이번에 선택한 파일",
      noSelectedFiles: "새로 선택한 파일이 없습니다",
      chooseFile: "파일 선택",
      delete: "삭제",
      uploadRule: "업로드 제한: 이미지 2MB 이하, PDF 4MB 이하.",
      imageTooLarge:
        '이미지 파일 "{fileName}"이 2MB를 초과했습니다. 압축 후 다시 업로드하세요.',
      pdfTooLarge:
        'PDF 파일 "{fileName}"이 4MB를 초과했습니다. 압축 후 다시 업로드하세요.',
      invalidFile: '파일 "{fileName}"은 이미지 또는 PDF만 지원합니다.',
      saveSuccess: "초안이 저장되었습니다",
      updateSuccess: "초안이 업데이트되었습니다",
      submitSuccess: "중외합작프로그램 정보가 제출되었습니다",
      saveFailed: "저장 실패: ",
      submitFailed: "제출 실패: ",
      invalidSession: "현재 기관 로그인 상태가 유효하지 않습니다. 다시 로그인하세요.",
      fillRequired: "필수 항목을 먼저 입력하세요.",
      fixedNationality: "중국",
      fixedAdmissionType: "신입학",
      fixedProgram: "중외합작프로그램",
      fixedSemester: "9월 학기",
      agreementText:
        "본인은 위 정보가 사실과 틀림없음을 확인하며, 한라대학교가 중외합작프로그램 학적 관리 및 관련 업무를 위해 개인정보를 수집 및 이용하는 데 동의합니다.",
    },
    options: {
      sex: [
        { value: "Male", label: "남" },
        { value: "Female", label: "여" },
      ],
      academicStatus: [
        { value: "active", label: "재학" },
        { value: "suspended", label: "휴학" },
        { value: "completed", label: "수료" },
        { value: "graduated", label: "졸업" },
      ],
      agree: [
        { value: "agree", label: "동의함" },
        { value: "disagree", label: "동의하지 않음" },
      ],
    },
    sections: {
      pageTitle: "중외합작프로그램 정보 작성",
      pageDesc:
        "중외합작프로그램 신상정보카드에 맞춰 작성합니다. 국적, 지원구분, 프로그램, 9월 학기는 시스템에서 고정됩니다.",
      step1Title: "1단계: 프로그램 정보",
      step2Title: "2단계: 학생 정보",
      step3Title: "3단계: 학력 정보",
      step4Title: "4단계: 동의서 및 서명",
      step5Title: "5단계: 서류 업로드",
      educationRecord: "학력 기록",
    },
    fields: {
      university: "대학 명칭",
      partnerMajor: "학과",
      hallaMajor: "한라대학교 대응 학과",
      admissionYear: "입학 연도",
      semester: "입학학기",
      admissionType: "지원구분",
      program: "프로그램",
      fullName: "성명",
      sex: "성별",
      nationality: "국적",
      dateOfBirth: "생년월일",
      email: "E-mail",
      tel: "전화번호",
      academicStatus: "학적상태",
      idCardNumber: "신분증번호",
      street: "상세 주소",
      city: "도시",
      country: "국가",
      educationStart: "시작일",
      educationEnd: "종료일",
      institution: "학교명",
      educationLocation: "학교소재지 국가/도시",
      agreeInfo: "개인정보 수집 및 이용",
      signature: "신청인 서명",
      autoSignature: "이름 자동 생성",
    },
    materials: {
      cooperation_photo: {
        label: "증명사진",
        desc: "학생 증명사진을 업로드하세요.",
      },
      cooperation_id_card: {
        label: "신분증",
        desc: "신분증 스캔본 또는 선명한 사진을 업로드하세요.",
      },
      cooperation_high_school_diploma: {
        label: "고등학교 졸업증명서",
        desc: "고등학교 졸업증명서를 업로드하세요.",
      },
      cooperation_high_school_transcript: {
        label: "고등학교 성적표",
        desc: "고등학교 성적표를 업로드하세요.",
      },
    },
  },
};

const initialEducationRows = [
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
];

const initialForm = {
  cooperation_university_id: "",
  cooperation_major_id: "",
  cooperation_admission_year: new Date().getFullYear(),
  cooperation_academic_status: "active",
  fullName: "",
  sex: "",
  dateOfBirth: "",
  email: "",
  tel: "",
  cooperation_id_card_number: "",
  cooperation_address_street: "",
  cooperation_address_city: "",
  cooperation_address_country: "China",
  educationRows: initialEducationRows,
  agree_personal_info: true,
  applicant_signature_method: "auto",
};

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function Input({ label, required, className = "", ...props }) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function Select({ label, required, children, className = "", ...props }) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      <select
        {...props}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      >
        {children}
      </select>
    </div>
  );
}

function ReadonlyField({ label, value, helper }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
        {value || "-"}
      </div>
      {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
    </div>
  );
}

function RadioGroup({ label, value, options, onChange, required }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={[
              "rounded-xl border px-4 py-3 text-sm font-semibold transition",
              value === option.value
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, desc, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {desc ? <p className="mt-1 text-sm text-slate-500">{desc}</p> : null}
      </div>
      {children}
    </section>
  );
}

function SignaturePreview({ name, t }) {
  return (
    <div>
      <Label required>{t.fields.signature}</Label>
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm font-semibold text-slate-600">
          {t.fields.autoSignature}
        </div>
        <div className="mt-4 flex min-h-24 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-3xl font-semibold italic text-slate-800">
          {name || "-"}
        </div>
      </div>
    </div>
  );
}

function MaterialUploadCard({
  item,
  files,
  existingFiles,
  onFilesChange,
  onRemoveSelectedFile,
  onRemoveExistingFile,
  t,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-base font-bold text-slate-900">
            {item.label}
            <span className="ml-1 text-red-500">*</span>
          </div>
          <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
        </div>
      </div>

      <div className="mt-4">
        <Label required>{t.common.chooseFile}</Label>
        <input
          type="file"
          multiple
          accept="image/*,.pdf,application/pdf"
          onChange={(event) => onFilesChange(item.key, event.target.files)}
          className="block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
        <div className="mt-2 text-xs text-slate-400">{t.common.uploadRule}</div>
      </div>

      {existingFiles.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            {t.common.uploadedFiles}
          </div>
          <div className="space-y-2">
            {existingFiles.map((file) => (
              <div
                key={file.id || file.file_path}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span className="text-slate-700">{file.file_name || "-"}</span>
                <button
                  type="button"
                  onClick={() => onRemoveExistingFile(item.key, file)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                >
                  {t.common.delete}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-700">
          {t.common.selectedFiles}
        </div>
        {files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm"
              >
                <span className="text-emerald-700">{file.name}</span>
                <button
                  type="button"
                  onClick={() => onRemoveSelectedFile(item.key, index)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  {t.common.delete}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
            {t.common.noSelectedFiles}
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeDate(value) {
  if (!value) return null;
  return value;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function buildStudentFillToken() {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `stu-${Date.now()}-${randomPart}`;
}

function sanitizeFileName(name) {
  const original = String(name || "file");
  const dotIndex = original.lastIndexOf(".");
  const ext = dotIndex >= 0 ? original.slice(dotIndex).toLowerCase() : "";
  const base = dotIndex >= 0 ? original.slice(0, dotIndex) : original;
  const safeBase =
    Array.from(base.normalize("NFKD"))
      .filter((char) => char.charCodeAt(0) <= 0x7f)
      .join("")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file";

  return `${safeBase}${ext}`;
}

function validateUploadFile(file, t) {
  if (!file) return "";

  const isImage = file.type?.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
  const fileName = file.name || "file";

  if (!isImage && !isPdf) {
    return t.common.invalidFile.replace("{fileName}", fileName);
  }

  if (isImage && file.size > 2 * 1024 * 1024) {
    return t.common.imageTooLarge.replace("{fileName}", fileName);
  }

  if (isPdf && file.size > 4 * 1024 * 1024) {
    return t.common.pdfTooLarge.replace("{fileName}", fileName);
  }

  return "";
}

function getLocalizedName(row, language, prefix = "name") {
  return row?.[`${prefix}_${language}`] || row?.[`${prefix}_zh`] || "";
}

function getMajorLabel(major, language, prefix) {
  return major?.[`${prefix}_${language}`] || major?.[`${prefix}_zh`] || "";
}

function buildUniversitySnapshot(university) {
  if (!university) return null;
  return {
    id: university.id,
    code: university.code,
    name_zh: university.name_zh,
    name_en: university.name_en,
    name_ko: university.name_ko,
  };
}

function buildMajorSnapshot(major) {
  if (!major) return null;
  return {
    id: major.id,
    code: major.code,
    partner_major_zh: major.partner_major_zh,
    partner_major_en: major.partner_major_en,
    partner_major_ko: major.partner_major_ko,
    halla_major_zh: major.halla_major_zh,
    halla_major_en: major.halla_major_en,
    halla_major_ko: major.halla_major_ko,
  };
}

function NewCooperationApplicationPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;
  const [searchParams] = useSearchParams();
  const editingPublicId = searchParams.get("public_id");

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState("");
  const [agencyConfig, setAgencyConfig] = useState(null);
  const [universities, setUniversities] = useState([]);
  const [majors, setMajors] = useState([]);
  const [applicationId, setApplicationId] = useState("");
  const [applicationPublicId, setApplicationPublicId] = useState("");
  const [studentFillToken, setStudentFillToken] = useState("");
  const [loadedApplicationStatus, setLoadedApplicationStatus] = useState("draft");
  const [uploadedMaterials, setUploadedMaterials] = useState({});
  const [existingUploadedFiles, setExistingUploadedFiles] = useState({});

  const steps = t.steps;

  const selectedUniversity = useMemo(
    () => universities.find((item) => item.id === form.cooperation_university_id) || null,
    [universities, form.cooperation_university_id]
  );

  const selectedMajor = useMemo(
    () => majors.find((item) => item.id === form.cooperation_major_id) || null,
    [majors, form.cooperation_major_id]
  );

  const admissionYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => currentYear - 1 + index);
  }, []);

  const materialItems = useMemo(
    () =>
      Object.entries(t.materials).map(([key, value]) => ({
        key,
        ...value,
      })),
    [t]
  );

  const studentFillLink = studentFillToken
    ? `${window.location.origin}/student/cooperation-application/${studentFillToken}`
    : "";

  const buildPublicId = () => {
    const base = slugify(form.fullName) || `coop-${Date.now()}`;
    return `${base}-${Date.now().toString().slice(-6)}`;
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateEducationRow = (index, key, value) => {
    setForm((prev) => {
      const nextRows = [...prev.educationRows];
      nextRows[index] = { ...nextRows[index], [key]: value };
      return { ...prev, educationRows: nextRows };
    });
  };

  const setMaterialFiles = (key, fileList) => {
    setUploadedMaterials((prev) => ({
      ...prev,
      [key]: Array.from(fileList || []),
    }));
  };

  const removeSelectedMaterialFile = (key, indexToRemove) => {
    setUploadedMaterials((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, index) => index !== indexToRemove),
    }));
  };

  const clearUploadedMaterialSelections = () => {
    setUploadedMaterials({});
  };

  const loadExistingUploadedFiles = async (publicId) => {
    if (!publicId) return;

    const { data, error } = await supabase
      .from("application_files")
      .select("*")
      .eq("public_id", publicId)
      .in(
        "file_type",
        materialItems.map((item) => item.key)
      )
      .order("created_at", { ascending: true });

    if (error) throw error;

    const grouped = {};
    (data || []).forEach((file) => {
      grouped[file.file_type] = grouped[file.file_type] || [];
      grouped[file.file_type].push(file);
    });
    setExistingUploadedFiles(grouped);
  };

  const removeExistingUploadedFile = async (fileType, fileRow) => {
    try {
      if (fileRow.file_path) {
        const { error: storageError } = await supabase.storage
          .from(MATERIALS_BUCKET)
          .remove([fileRow.file_path]);

        if (storageError) throw storageError;
      }

      const { error } = await supabase
        .from("application_files")
        .delete()
        .eq("id", fileRow.id);

      if (error) throw error;

      setExistingUploadedFiles((prev) => ({
        ...prev,
        [fileType]: (prev[fileType] || []).filter((item) => item.id !== fileRow.id),
      }));
    } catch (error) {
      console.error("removeExistingUploadedFile error:", error);
      alert(error.message);
    }
  };

  const loadAgencyConfig = async () => {
    if (!agencySession?.agency_id) return;

    const { data, error } = await supabase
      .from("agencies")
      .select("id, agency_name, cooperation_enabled, cooperation_university_id")
      .eq("id", agencySession.agency_id)
      .single();

    if (error) throw error;
    setAgencyConfig(data);

    if (data?.cooperation_enabled !== true) {
      setPermissionError(t.common.noPermission);
      return;
    }

    let universityQuery = supabase
      .from("cooperation_universities")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (data.cooperation_university_id) {
      universityQuery = universityQuery.eq("id", data.cooperation_university_id);
    }

    const { data: universityRows, error: universityError } = await universityQuery;
    if (universityError) throw universityError;

    setUniversities(universityRows || []);

    const defaultUniversityId =
      data.cooperation_university_id || universityRows?.[0]?.id || "";

    setForm((prev) => ({
      ...prev,
      cooperation_university_id:
        prev.cooperation_university_id || defaultUniversityId,
    }));
  };

  const loadMajors = async (universityId) => {
    if (!universityId) {
      setMajors([]);
      return;
    }

    const { data, error } = await supabase
      .from("cooperation_majors")
      .select("*")
      .eq("university_id", universityId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    setMajors(data || []);
    setForm((prev) => ({
      ...prev,
      cooperation_major_id:
        prev.cooperation_major_id && data?.some((item) => item.id === prev.cooperation_major_id)
          ? prev.cooperation_major_id
          : data?.[0]?.id || "",
    }));
  };

  const loadApplication = async () => {
    if (!editingPublicId) return;

    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("public_id", editingPublicId)
      .eq("application_type", "cooperation")
      .single();

    if (error) throw error;

    if (
      data.agency_id &&
      agencySession?.agency_id &&
      String(data.agency_id) !== String(agencySession.agency_id)
    ) {
      throw new Error("No permission to edit this record.");
    }

    const parseEducation = (value) => {
      const [datePart = "", institution = "", location = ""] = String(value || "").split("|").map((item) => item.trim());
      const [startDate = "", endDate = ""] = datePart.split("~").map((item) => item.trim());
      return { startDate, endDate, institution, location };
    };

    setApplicationId(data.id || "");
    setApplicationPublicId(data.public_id || "");
    setStudentFillToken(data.student_fill_token || "");
    setLoadedApplicationStatus(data.status || "draft");
    setForm((prev) => ({
      ...prev,
      cooperation_university_id: data.cooperation_university_id || prev.cooperation_university_id,
      cooperation_major_id: data.cooperation_major_id || prev.cooperation_major_id,
      cooperation_admission_year:
        data.cooperation_admission_year || prev.cooperation_admission_year,
      cooperation_academic_status:
        data.cooperation_academic_status || prev.cooperation_academic_status,
      fullName: data.full_name_passport || data.english_name || "",
      sex: data.gender || "",
      dateOfBirth: data.date_of_birth || "",
      email: data.email || "",
      tel: data.tel || data.phone || "",
      cooperation_id_card_number: data.cooperation_id_card_number || "",
      cooperation_address_street: data.cooperation_address_street || "",
      cooperation_address_city: data.cooperation_address_city || "",
      cooperation_address_country: data.cooperation_address_country || "China",
      agree_personal_info: data.agree_personal_info !== "disagree",
      applicant_signature_method: data.applicant_signature_method || "auto",
      educationRows: [
        parseEducation(data.education1),
        parseEducation(data.education2),
        parseEducation(data.education3),
      ],
    }));

    await loadExistingUploadedFiles(data.public_id);
  };

  useEffect(() => {
    const run = async () => {
      if (!agencySession?.agency_id) return;

      try {
        setLoading(true);
        setPermissionError("");
        await loadAgencyConfig();
      } catch (error) {
        console.error("loadAgencyConfig error:", error);
        setPermissionError(error.message);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [agencySession?.agency_id, language]);

  useEffect(() => {
    loadMajors(form.cooperation_university_id).catch((error) => {
      console.error("loadMajors error:", error);
      alert(error.message);
    });
  }, [form.cooperation_university_id]);

  useEffect(() => {
    if (!agencySession?.agency_id || !agencyConfig || permissionError) return;
    loadApplication().catch((error) => {
      console.error("loadApplication error:", error);
      alert(error.message);
    });
  }, [agencySession?.agency_id, agencyConfig?.id, editingPublicId, permissionError]);

  const validateRequiredFields = () => {
    return (
      form.cooperation_university_id &&
      form.cooperation_major_id &&
      form.cooperation_admission_year &&
      form.fullName.trim() &&
      form.sex &&
      form.dateOfBirth &&
      form.email.trim() &&
      form.tel.trim() &&
      form.cooperation_id_card_number.trim() &&
      form.cooperation_address_street.trim() &&
      form.cooperation_address_city.trim()
    );
  };

  const buildEducationValue = (row) => {
    if (!row) return "";
    return `${row.startDate || ""} ~ ${row.endDate || ""} | ${row.institution || ""} | ${row.location || ""}`;
  };

  const buildApplicationPayload = (statusValue = "draft", publicIdValue) => {
    const finalStatusValue =
      applicationId && statusValue === "draft" && loadedApplicationStatus !== "draft"
        ? loadedApplicationStatus
        : statusValue;

    const universitySnapshot = buildUniversitySnapshot(selectedUniversity);
    const majorSnapshot = buildMajorSnapshot(selectedMajor);

    return {
      ...(publicIdValue ? { public_id: publicIdValue } : {}),
      status: finalStatusValue,
      application_type: "cooperation",
      agency_id: agencySession?.agency_id || null,
      agency_account_id: applicationId
        ? undefined
        : agencySession?.agency_account_id || null,
      agency_unit_id: applicationId ? undefined : agencySession?.agency_unit_id || null,
      student_fill_enabled: true,
      intake_id: null,
      intake_name: null,

      cooperation_university_id: form.cooperation_university_id || null,
      cooperation_major_id: form.cooperation_major_id || null,
      cooperation_university_snapshot: universitySnapshot,
      cooperation_major_snapshot: majorSnapshot,
      cooperation_admission_year: Number(form.cooperation_admission_year) || null,
      cooperation_academic_status: form.cooperation_academic_status || "active",
      cooperation_id_card_number: form.cooperation_id_card_number,
      cooperation_address_street: form.cooperation_address_street,
      cooperation_address_city: form.cooperation_address_city,
      cooperation_address_country: form.cooperation_address_country || "China",

      major: majorSnapshot?.halla_major_zh || "",
      admission_type: "Freshman",
      program_track: "Sino-Foreign Cooperative Education Program",
      dormitory: "NO",
      english_name: form.fullName,
      full_name_passport: form.fullName,
      gender: form.sex,
      nationality: "China",
      nationality_applicant: "China",
      passport_no: null,
      alien_registration_no: null,
      date_of_birth: normalizeDate(form.dateOfBirth),
      tel: form.tel,
      phone: form.tel,
      email: form.email,
      address: [
        form.cooperation_address_street,
        form.cooperation_address_city,
        form.cooperation_address_country,
      ]
        .filter(Boolean)
        .join(", "),

      education1: buildEducationValue(form.educationRows[0]),
      education2: buildEducationValue(form.educationRows[1]),
      education3: buildEducationValue(form.educationRows[2]),

      agree_personal_info: form.agree_personal_info ? "agree" : "disagree",
      acknowledge_notice: "yes",
      applicant_signature_method: "auto",
      applicant_uploaded_signature: "",
      applicant_drawn_signature: "",
      application_form_updated_at: new Date().toISOString(),
    };
  };

  const uploadApplicationFiles = async (targetApplicationId, publicId) => {
    const entries = Object.entries(uploadedMaterials);

    for (const [fileType, files] of entries) {
      if (!files || files.length === 0) continue;

      const invalidMessages = files
        .map((file) => validateUploadFile(file, t))
        .filter(Boolean);

      if (invalidMessages.length > 0) {
        throw new Error(invalidMessages.join("\n"));
      }

      await supabase
        .from("application_files")
        .delete()
        .eq("application_id", targetApplicationId)
        .eq("file_type", fileType);

      for (const file of files) {
        const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
        const filePath = `${publicId}/${fileType}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(MATERIALS_BUCKET)
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: insertFileError } = await supabase
          .from("application_files")
          .insert([
            {
              application_id: targetApplicationId,
              public_id: publicId,
              file_type: fileType,
              file_name: file.name,
              file_path: filePath,
              review_status: "uploaded",
              review_note: "",
            },
          ]);

        if (insertFileError) throw insertFileError;
      }
    }
  };

  const saveApplication = async (statusValue) => {
    if (!agencySession?.agency_id || !agencySession?.agency_account_id) {
      alert(t.common.invalidSession);
      return;
    }

    if (statusValue === "submitted" && !validateRequiredFields()) {
      alert(t.common.fillRequired);
      return;
    }

    try {
      if (!applicationId) {
        const publicId = buildPublicId();
        const studentFillTokenValue = buildStudentFillToken();
        const payload = {
          ...buildApplicationPayload(statusValue, publicId),
          student_fill_token: studentFillTokenValue,
          student_form_status: "not_started",
          institution_locked: false,
          last_saved_by_account_id: agencySession.agency_account_id,
          last_saved_by_account_name:
            agencySession.account_name || agencySession.username || "",
        };

        const { data, error } = await supabase
          .from("applications")
          .insert([payload])
          .select("id, public_id, updated_at")
          .single();

        if (error) throw error;

        setApplicationId(data.id);
        setApplicationPublicId(data.public_id);
        setStudentFillToken(studentFillTokenValue);
        setLoadedApplicationStatus(statusValue);

        await uploadApplicationFiles(data.id, data.public_id);
        await loadExistingUploadedFiles(data.public_id);
        clearUploadedMaterialSelections();

        alert(statusValue === "submitted" ? t.common.submitSuccess : t.common.saveSuccess);
        if (statusValue === "submitted") {
          window.location.href = "/agency/applications";
        }
        return;
      }

      const payload = buildApplicationPayload(statusValue);
      delete payload.agency_account_id;
      delete payload.agency_unit_id;

      const { data, error } = await supabase
        .from("applications")
        .update({
          ...payload,
          last_saved_by_account_id: agencySession.agency_account_id,
          last_saved_by_account_name:
            agencySession.account_name || agencySession.username || "",
        })
        .eq("id", applicationId)
        .eq("agency_id", agencySession.agency_id)
        .select("id, public_id, updated_at")
        .single();

      if (error) throw error;

      setLoadedApplicationStatus(statusValue);
      await uploadApplicationFiles(applicationId, data.public_id || applicationPublicId || editingPublicId);
      await loadExistingUploadedFiles(data.public_id || applicationPublicId || editingPublicId);
      clearUploadedMaterialSelections();

      alert(statusValue === "submitted" ? t.common.submitSuccess : t.common.updateSuccess);
      if (statusValue === "submitted") {
        window.location.href = "/agency/applications";
      }
    } catch (error) {
      console.error("saveApplication error:", error);
      alert(
        `${statusValue === "submitted" ? t.common.submitFailed : t.common.saveFailed}${
          error.message
        }`
      );
    }
  };

  const copyStudentLink = async () => {
    try {
      await navigator.clipboard.writeText(studentFillLink);
      alert(t.common.copySuccess);
    } catch {
      alert(t.common.copyFailed);
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(0, prev - 1));
  const nextStep = () => setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1));

  if (loading || !agencySession) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        {t.common.loading}
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700 shadow-sm">
        {permissionError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">{t.sections.pageTitle}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{t.sections.pageDesc}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <button
              key={step}
              type="button"
              onClick={() => setCurrentStep(index)}
              className={[
                "rounded-full px-4 py-2 text-sm font-semibold transition",
                currentStep === index
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].join(" ")}
            >
              {index + 1}. {step}
            </button>
          ))}
        </div>

        {studentFillLink ? (
          <div className="mt-6 rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-700">
              {t.common.studentFillLink}
            </div>
            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center">
              <input
                readOnly
                value={studentFillLink}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"
              />
              <button
                type="button"
                onClick={copyStudentLink}
                className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {t.common.copyLink}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {currentStep === 0 ? (
        <SectionCard title={t.sections.step1Title}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Select
              label={t.fields.university}
              required
              value={form.cooperation_university_id}
              onChange={(event) => updateField("cooperation_university_id", event.target.value)}
              disabled={Boolean(agencyConfig?.cooperation_university_id)}
            >
              <option value="">{t.common.select}</option>
              {universities.map((university) => (
                <option key={university.id} value={university.id}>
                  {getLocalizedName(university, language)}
                </option>
              ))}
            </Select>

            <Select
              label={t.fields.partnerMajor}
              required
              value={form.cooperation_major_id}
              onChange={(event) => updateField("cooperation_major_id", event.target.value)}
            >
              <option value="">{t.common.select}</option>
              {majors.map((major) => (
                <option key={major.id} value={major.id}>
                  {getMajorLabel(major, language, "partner_major")}
                </option>
              ))}
            </Select>

            <ReadonlyField
              label={t.fields.hallaMajor}
              value={getMajorLabel(selectedMajor, language, "halla_major")}
              helper={t.common.readonly}
            />

            <Select
              label={t.fields.admissionYear}
              required
              value={form.cooperation_admission_year}
              onChange={(event) =>
                updateField("cooperation_admission_year", Number(event.target.value))
              }
            >
              {admissionYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </Select>

            <ReadonlyField
              label={t.fields.semester}
              value={`${form.cooperation_admission_year} ${t.common.fixedSemester}`}
              helper={t.common.readonly}
            />
            <ReadonlyField
              label={t.fields.admissionType}
              value={t.common.fixedAdmissionType}
              helper={t.common.readonly}
            />
            <ReadonlyField
              label={t.fields.program}
              value={t.common.fixedProgram}
              helper={t.common.readonly}
            />
          </div>
        </SectionCard>
      ) : null}

      {currentStep === 1 ? (
        <SectionCard title={t.sections.step2Title}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input
              label={t.fields.fullName}
              required
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
            <RadioGroup
              label={t.fields.sex}
              required
              value={form.sex}
              options={t.options.sex}
              onChange={(value) => updateField("sex", value)}
            />
            <ReadonlyField
              label={t.fields.nationality}
              value={t.common.fixedNationality}
              helper={t.common.readonly}
            />
            <Input
              label={t.fields.dateOfBirth}
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => updateField("dateOfBirth", event.target.value)}
            />
            <Input
              label={t.fields.email}
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <Input
              label={t.fields.tel}
              required
              value={form.tel}
              onChange={(event) => updateField("tel", event.target.value)}
            />
            <Select
              label={t.fields.academicStatus}
              required
              value={form.cooperation_academic_status}
              onChange={(event) =>
                updateField("cooperation_academic_status", event.target.value)
              }
            >
              {t.options.academicStatus.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Input
              label={t.fields.idCardNumber}
              required
              value={form.cooperation_id_card_number}
              onChange={(event) =>
                updateField("cooperation_id_card_number", event.target.value)
              }
            />
            <Input
              label={t.fields.street}
              required
              className="md:col-span-2 xl:col-span-3"
              value={form.cooperation_address_street}
              onChange={(event) =>
                updateField("cooperation_address_street", event.target.value)
              }
            />
            <Input
              label={t.fields.city}
              required
              value={form.cooperation_address_city}
              onChange={(event) =>
                updateField("cooperation_address_city", event.target.value)
              }
            />
            <ReadonlyField
              label={t.fields.country}
              value={t.common.fixedNationality}
              helper={t.common.readonly}
            />
          </div>
        </SectionCard>
      ) : null}

      {currentStep === 2 ? (
        <SectionCard title={t.sections.step3Title}>
          <div className="space-y-5">
            {form.educationRows.map((row, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 text-sm font-semibold text-slate-700">
                  {t.sections.educationRecord} {index + 1}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Input
                    label={t.fields.educationStart}
                    type="date"
                    value={row.startDate}
                    onChange={(event) =>
                      updateEducationRow(index, "startDate", event.target.value)
                    }
                  />
                  <Input
                    label={t.fields.educationEnd}
                    type="date"
                    value={row.endDate}
                    onChange={(event) =>
                      updateEducationRow(index, "endDate", event.target.value)
                    }
                  />
                  <Input
                    label={t.fields.institution}
                    value={row.institution}
                    onChange={(event) =>
                      updateEducationRow(index, "institution", event.target.value)
                    }
                  />
                  <Input
                    label={t.fields.educationLocation}
                    value={row.location}
                    onChange={(event) =>
                      updateEducationRow(index, "location", event.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {currentStep === 3 ? (
        <SectionCard title={t.sections.step4Title}>
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {t.common.agreementText}
            </div>
            <RadioGroup
              label={t.fields.agreeInfo}
              required
              value={form.agree_personal_info ? "agree" : "disagree"}
              options={t.options.agree}
              onChange={(value) => updateField("agree_personal_info", value === "agree")}
            />
            <SignaturePreview name={form.fullName} t={t} />
          </div>
        </SectionCard>
      ) : null}

      {currentStep === 4 ? (
        <SectionCard title={t.sections.step5Title}>
          <div className="space-y-4">
            {materialItems.map((item) => (
              <MaterialUploadCard
                key={item.key}
                item={item}
                files={uploadedMaterials[item.key] || []}
                existingFiles={existingUploadedFiles[item.key] || []}
                onFilesChange={setMaterialFiles}
                onRemoveSelectedFile={removeSelectedMaterialFile}
                onRemoveExistingFile={removeExistingUploadedFile}
                t={t}
              />
            ))}
          </div>
        </SectionCard>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="text-sm text-slate-500">
          {t.common.currentStep}:{" "}
          <span className="font-semibold text-slate-800">{steps[currentStep]}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {currentStep > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              {t.common.prev}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => saveApplication("draft")}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
          >
            {t.common.saveDraft}
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t.common.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => saveApplication("submitted")}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t.common.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewCooperationApplicationPage;
