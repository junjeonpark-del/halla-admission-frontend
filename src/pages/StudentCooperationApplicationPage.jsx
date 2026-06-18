import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const MATERIALS_BUCKET = "application-files";

const messages = {
  zh: {
    pageTitle: "中外合作办学信息填写",
    pageDesc: "请核对项目信息，并补充个人信息、学历信息、签字和材料。",
    loading: "正在加载填写信息...",
    invalidLink: "填写链接无效或已关闭。",
    saveDraft: "保存草稿",
    submit: "提交信息",
    saving: "正在保存...",
    saved: "已保存",
    submitted: "已提交",
    saveFailed: "保存失败：",
    fillRequired: "请先填写必填项。",
    readonly: "系统固定",
    select: "请选择",
    chooseFile: "选择文件",
    uploadedFiles: "已上传文件",
    selectedFiles: "本次新选择文件",
    noSelectedFiles: "尚未选择新文件",
    delete: "删除",
    uploadRule: "上传要求：照片文件不能超过 2MB，PDF 文件不能超过 4MB。",
    invalidFile: '文件 "{fileName}" 仅支持图片或 PDF。',
    imageTooLarge: '图片文件 "{fileName}" 超过 2MB，请压缩后重新上传。',
    pdfTooLarge: 'PDF 文件 "{fileName}" 超过 4MB，请压缩后重新上传。',
    photoImageOnly: '证件照只能上传 JPG、JPEG、PNG 或 WEBP 图片文件：“{fileName}”。',
    fixedNationality: "中国",
    fixedAdmissionType: "新入",
    fixedProgram: "中外合作办学",
    fixedSemester: "9月学期",
    agreementText:
      "本人确认上述信息真实准确，并同意汉拿大学收集和使用个人信息用于中外合作办学学籍管理及相关业务。",
    sections: {
      program: "项目信息",
      student: "学生个人信息",
      education: "学历信息",
      consent: "个人信息同意书与签字",
      materials: "上传材料",
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
    sexOptions: [
      { value: "Male", label: "男" },
      { value: "Female", label: "女" },
    ],
    academicStatusOptions: [
      { value: "active", label: "在学" },
      { value: "suspended", label: "休学" },
      { value: "completed", label: "结业" },
      { value: "graduated", label: "毕业" },
    ],
    agreeOptions: [
      { value: "agree", label: "同意" },
      { value: "disagree", label: "不同意" },
    ],
    materials: {
      cooperation_photo: { label: "证件照", desc: "上传学生证件照。" },
      cooperation_id_card: { label: "身份证", desc: "上传身份证扫描件或清晰照片。" },
      cooperation_high_school_diploma: { label: "高中毕业证", desc: "上传高中毕业证。" },
      cooperation_high_school_transcript: { label: "高中成绩单", desc: "上传高中成绩单。" },
    },
  },
  en: {
    pageTitle: "Cooperation Program Information",
    pageDesc: "Please confirm program information and complete student details, education, signature, and materials.",
    loading: "Loading form...",
    invalidLink: "This link is invalid or closed.",
    saveDraft: "Save Draft",
    submit: "Submit",
    saving: "Saving...",
    saved: "Saved",
    submitted: "Submitted",
    saveFailed: "Save failed: ",
    fillRequired: "Please complete the required fields first.",
    readonly: "Fixed by system",
    select: "Please select",
    chooseFile: "Choose File",
    uploadedFiles: "Uploaded Files",
    selectedFiles: "Newly Selected Files",
    noSelectedFiles: "No new files selected",
    delete: "Delete",
    uploadRule: "Upload limits: images up to 2MB, PDF up to 4MB.",
    invalidFile: 'File "{fileName}" only supports image or PDF.',
    imageTooLarge: 'Image file "{fileName}" exceeds 2MB. Please compress it and upload again.',
    pdfTooLarge: 'PDF file "{fileName}" exceeds 4MB. Please compress it and upload again.',
    photoImageOnly: 'ID photo only supports JPG, JPEG, PNG, or WEBP image files: "{fileName}".',
    fixedNationality: "China",
    fixedAdmissionType: "Freshman",
    fixedProgram: "Sino-Foreign Cooperative Education Program",
    fixedSemester: "September Semester",
    agreementText:
      "I certify that the information above is true and accurate, and agree that Halla University may collect and use my personal information for cooperative education student record management and related work.",
    sections: {
      program: "Program Information",
      student: "Student Information",
      education: "Education",
      consent: "Consent and Signature",
      materials: "Upload Materials",
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
    sexOptions: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
    ],
    academicStatusOptions: [
      { value: "active", label: "Active" },
      { value: "suspended", label: "Suspended" },
      { value: "completed", label: "Completed" },
      { value: "graduated", label: "Graduated" },
    ],
    agreeOptions: [
      { value: "agree", label: "I agree" },
      { value: "disagree", label: "I disagree" },
    ],
    materials: {
      cooperation_photo: { label: "ID Photo", desc: "Upload the student's ID photo." },
      cooperation_id_card: { label: "ID Card", desc: "Upload a clear scan or photo of the ID card." },
      cooperation_high_school_diploma: { label: "High School Diploma", desc: "Upload the high school diploma." },
      cooperation_high_school_transcript: { label: "High School Transcript", desc: "Upload the high school transcript." },
    },
  },
  ko: {
    pageTitle: "중외합작프로그램 정보 작성",
    pageDesc: "프로그램 정보를 확인하고 학생 정보, 학력, 서명 및 서류를 작성하세요.",
    loading: "정보를 불러오는 중...",
    invalidLink: "작성 링크가 유효하지 않거나 닫혔습니다.",
    saveDraft: "초안 저장",
    submit: "제출",
    saving: "저장 중...",
    saved: "저장되었습니다",
    submitted: "제출되었습니다",
    saveFailed: "저장 실패: ",
    fillRequired: "필수 항목을 먼저 입력하세요.",
    readonly: "시스템 고정",
    select: "선택하세요",
    chooseFile: "파일 선택",
    uploadedFiles: "업로드된 파일",
    selectedFiles: "이번에 선택한 파일",
    noSelectedFiles: "새로 선택한 파일이 없습니다",
    delete: "삭제",
    uploadRule: "업로드 제한: 이미지 2MB 이하, PDF 4MB 이하.",
    invalidFile: '파일 "{fileName}"은 이미지 또는 PDF만 지원합니다.',
    imageTooLarge: '이미지 파일 "{fileName}"이 2MB를 초과했습니다. 압축 후 다시 업로드하세요.',
    pdfTooLarge: 'PDF 파일 "{fileName}"이 4MB를 초과했습니다. 압축 후 다시 업로드하세요.',
    photoImageOnly: '증명사진은 JPG, JPEG, PNG 또는 WEBP 이미지 파일만 업로드할 수 있습니다: "{fileName}".',
    fixedNationality: "중국",
    fixedAdmissionType: "신입학",
    fixedProgram: "중외합작프로그램",
    fixedSemester: "9월 학기",
    agreementText:
      "본인은 위 정보가 사실과 틀림없음을 확인하며, 한라대학교가 중외합작프로그램 학적 관리 및 관련 업무를 위해 개인정보를 수집 및 이용하는 데 동의합니다.",
    sections: {
      program: "프로그램 정보",
      student: "학생 정보",
      education: "학력 정보",
      consent: "동의서 및 서명",
      materials: "서류 업로드",
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
    sexOptions: [
      { value: "Male", label: "남" },
      { value: "Female", label: "여" },
    ],
    academicStatusOptions: [
      { value: "active", label: "재학" },
      { value: "suspended", label: "휴학" },
      { value: "completed", label: "수료" },
      { value: "graduated", label: "졸업" },
    ],
    agreeOptions: [
      { value: "agree", label: "동의함" },
      { value: "disagree", label: "동의하지 않음" },
    ],
    materials: {
      cooperation_photo: { label: "증명사진", desc: "학생 증명사진을 업로드하세요." },
      cooperation_id_card: { label: "신분증", desc: "신분증 스캔본 또는 선명한 사진을 업로드하세요." },
      cooperation_high_school_diploma: { label: "고등학교 졸업증명서", desc: "고등학교 졸업증명서를 업로드하세요." },
      cooperation_high_school_transcript: { label: "고등학교 성적표", desc: "고등학교 성적표를 업로드하세요." },
    },
  },
};

const initialEducationRows = [
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
];

const initialForm = {
  fullName: "",
  sex: "",
  dateOfBirth: "",
  email: "",
  tel: "",
  cooperation_academic_status: "active",
  cooperation_id_card_number: "",
  cooperation_address_street: "",
  cooperation_address_city: "",
  cooperation_address_country: "China",
  educationRows: initialEducationRows,
  agree_personal_info: true,
};

function readLanguage() {
  try {
    return localStorage.getItem("app_language") || "zh";
  } catch {
    return "zh";
  }
}

function Label({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function Input({ label, required, className = "", disabled, ...props }) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      <input
        {...props}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </div>
  );
}

function Select({ label, required, children, className = "", disabled, ...props }) {
  return (
    <div className={className}>
      <Label required={required}>{label}</Label>
      <select
        {...props}
        disabled={disabled}
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

function RadioGroup({ label, value, options, onChange, required, disabled }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={[
              "rounded-xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
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

function SectionCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-bold text-slate-900">{title}</h2>
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

function isUploadImageFile(file) {
  const fileName = String(file?.name || "").toLowerCase();
  const mimeType = String(file?.type || "").toLowerCase();

  return (
    mimeType.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp"].some((ext) => fileName.endsWith(ext))
  );
}

function validateUploadFile(file, t, options = {}) {
  if (!file) return "";

  const isImage = isUploadImageFile(file);
  const isPdf = file.type === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf");
  const fileName = file.name || "file";

  if (options.imageOnly && !isImage) {
    return t.common.photoImageOnly
      ? t.common.photoImageOnly.replace("{fileName}", fileName)
      : `证件照只能上传 JPG、JPEG、PNG 或 WEBP 图片文件：${fileName}`;
  }

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

function MaterialUploadCard({
  item,
  files,
  existingFiles,
  onFilesChange,
  onRemoveSelectedFile,
  onRemoveExistingFile,
  disabled = false,
  t,
}) {
    const [isDragging, setIsDragging] = useState(false);
  const [isInvalidDragging, setIsInvalidDragging] = useState(false);

  const imageOnly = item.key === "cooperation_photo";

    const getDraggedFiles = (dataTransfer) => {
    const items = Array.from(dataTransfer?.items || []).filter(
      (dragItem) => dragItem.kind === "file"
    );

    if (items.length > 0) return items;

    return Array.from(dataTransfer?.files || []);
  };

  const updateDragState = (dataTransfer) => {
    if (disabled) return false;

    const incomingFiles = getDraggedFiles(dataTransfer);
    const invalid =
      imageOnly && incomingFiles.some((file) => !isUploadImageFile(file));

    setIsDragging(true);
    setIsInvalidDragging(invalid);

    return invalid;
  };

  const resetDragState = () => {
    setIsDragging(false);
    setIsInvalidDragging(false);
  };

  const handleSelectedFiles = (selectedFiles) => {
    if (disabled || !selectedFiles || selectedFiles.length === 0) return;

    const validFiles = [];
    const invalidMessages = [];

    Array.from(selectedFiles).forEach((file) => {
      const errorMessage = validateUploadFile(file, t, { imageOnly });
      if (errorMessage) {
        invalidMessages.push(errorMessage);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidMessages.length > 0) {
      alert(invalidMessages.join("\n"));
    }

    if (validFiles.length > 0) {
      onFilesChange(item.key, validFiles);
    } else {
      onFilesChange(item.key, []);
    }
  };

  return (
        <div
      className={`rounded-2xl border p-5 transition ${
        isInvalidDragging
          ? "cursor-not-allowed border-red-400 bg-red-50 ring-4 ring-red-100"
          : isDragging && !disabled
          ? "border-emerald-400 bg-emerald-50 ring-4 ring-emerald-100"
          : "border-slate-200 bg-white"
      }`}
            onDragEnter={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();

        const invalid = updateDragState(event.dataTransfer);
        event.dataTransfer.dropEffect = invalid ? "none" : "copy";
      }}
      onDragOver={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();

        const invalid = updateDragState(event.dataTransfer);
        event.dataTransfer.dropEffect = invalid ? "none" : "copy";
      }}
      onDragLeave={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();

        if (!event.currentTarget.contains(event.relatedTarget)) {
          resetDragState();
        }
      }}
      onDrop={(event) => {
        if (disabled) return;
        event.preventDefault();
        event.stopPropagation();
        resetDragState();
        handleSelectedFiles(event.dataTransfer.files);
      }}
    >
      <div className="text-base font-bold text-slate-900">
        {item.label}
        <span className="ml-1 text-red-500">*</span>
      </div>
      <div className="mt-1 text-sm text-slate-500">{item.desc}</div>

      <div className="mt-4">
        <Label required>{t.chooseFile}</Label>
        <label className="flex cursor-pointer flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50">
    <input
    type="file"
    multiple
    disabled={disabled}
        accept={imageOnly ? ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp" : "image/*,.pdf,application/pdf"}
    onChange={(event) => {
      handleSelectedFiles(event.target.files);
      event.target.value = "";
    }}
    className="sr-only"
  />
  <span className="inline-flex w-fit rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
    {t.chooseFile}
  </span>
  <span className="text-xs text-slate-500">{t.uploadRule}</span>
</label>
              </div>

      {existingFiles.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold text-slate-700">
            {t.uploadedFiles}
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
                  disabled={disabled}
                  onClick={() => onRemoveExistingFile(item.key, file)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-slate-700">
          {t.selectedFiles}
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
                  disabled={disabled}
                  onClick={() => onRemoveSelectedFile(item.key, index)}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.delete}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-400">
            {t.noSelectedFiles}
          </div>
        )}
      </div>
    </div>
  );
}

function getSnapshotName(snapshot, language, key) {
  return snapshot?.[`${key}_${language}`] || snapshot?.[`${key}_zh`] || "";
}

function parseEducation(value) {
  const [datePart = "", institution = "", location = ""] = String(value || "")
    .split("|")
    .map((item) => item.trim());
  const [startDate = "", endDate = ""] = datePart.split("~").map((item) => item.trim());
  return { startDate, endDate, institution, location };
}

function buildEducationValue(row) {
  if (!row) return "";
  return `${row.startDate || ""} ~ ${row.endDate || ""} | ${row.institution || ""} | ${row.location || ""}`;
}

function StudentCooperationApplicationPage() {
  const { token } = useParams();
  const [language] = useState(() => readLanguage());
  const t = messages[language] || messages.zh;
  const [application, setApplication] = useState(null);
  const [applicationId, setApplicationId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [uploadedMaterials, setUploadedMaterials] = useState({});
  const [existingUploadedFiles, setExistingUploadedFiles] = useState({});

  const isReadOnly = saving || application?.student_fill_enabled === false;

  const materialItems = useMemo(
    () => Object.entries(t.materials).map(([key, value]) => ({ key, ...value })),
    [t]
  );

  const universitySnapshot = application?.cooperation_university_snapshot || {};
  const majorSnapshot = application?.cooperation_major_snapshot || {};

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

  useEffect(() => {
    async function loadApplication() {
      try {
        setLoading(true);
        setLoadError("");

        const { data, error } = await supabase
          .from("applications")
          .select("*")
          .eq("student_fill_token", token)
          .eq("student_fill_enabled", true)
          .eq("application_type", "cooperation")
          .single();

        if (error) throw error;
        if (!data) throw new Error(t.invalidLink);

        setApplication(data);
        setApplicationId(data.id || "");
        setForm({
          fullName: data.full_name_passport || data.english_name || "",
          sex: data.gender || "",
          dateOfBirth: data.date_of_birth || "",
          email: data.email || "",
          tel: data.tel || data.phone || "",
          cooperation_academic_status: data.cooperation_academic_status || "active",
          cooperation_id_card_number: data.cooperation_id_card_number || "",
          cooperation_address_street: data.cooperation_address_street || "",
          cooperation_address_city: data.cooperation_address_city || "",
          cooperation_address_country: data.cooperation_address_country || "China",
          educationRows: [
            parseEducation(data.education1),
            parseEducation(data.education2),
            parseEducation(data.education3),
          ],
          agree_personal_info: data.agree_personal_info !== "disagree",
        });

        await loadExistingUploadedFiles(data.public_id);
      } catch (error) {
        console.error("StudentCooperationApplicationPage load error:", error);
        setLoadError(error.message || t.invalidLink);
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [token, language]);

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

  const validateRequiredFields = () => {
    return (
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

  const buildPayload = (submitMode) => ({
    full_name_passport: form.fullName,
    english_name: form.fullName,
    gender: form.sex,
    nationality: "China",
    nationality_applicant: "China",
    date_of_birth: form.dateOfBirth || null,
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
    cooperation_academic_status: form.cooperation_academic_status,
    cooperation_id_card_number: form.cooperation_id_card_number,
    cooperation_address_street: form.cooperation_address_street,
    cooperation_address_city: form.cooperation_address_city,
    cooperation_address_country: form.cooperation_address_country || "China",
    education1: buildEducationValue(form.educationRows[0]),
    education2: buildEducationValue(form.educationRows[1]),
    education3: buildEducationValue(form.educationRows[2]),
    agree_personal_info: form.agree_personal_info ? "agree" : "disagree",
    acknowledge_notice: "yes",
    applicant_signature_method: "auto",
    applicant_uploaded_signature: "",
    applicant_drawn_signature: "",
    student_fill_updated_at: new Date().toISOString(),
    application_form_updated_at: new Date().toISOString(),
    student_form_status: submitMode === "submitted" ? "submitted" : "draft",
    ...(submitMode === "submitted"
      ? { student_fill_submitted_at: new Date().toISOString() }
      : {}),
  });

  const uploadApplicationFiles = async () => {
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
        .eq("application_id", applicationId)
        .eq("file_type", fileType);

      for (const file of files) {
        const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
        const filePath = `${application.public_id}/${fileType}/${safeName}`;

        const { error: uploadError } = await supabase.storage
          .from(MATERIALS_BUCKET)
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { error: insertFileError } = await supabase
          .from("application_files")
          .insert([
            {
              application_id: applicationId,
              public_id: application.public_id,
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

  const handleSave = async (submitMode = "draft") => {
    if (!applicationId || !application?.public_id) {
      alert(t.invalidLink);
      return;
    }

    if (application?.student_fill_enabled === false) {
      alert(t.invalidLink);
      return;
    }

    if (submitMode === "submitted" && !validateRequiredFields()) {
      alert(t.fillRequired);
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload(submitMode);

      const { error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", applicationId)
        .eq("student_fill_token", token)
        .eq("student_fill_enabled", true)
        .eq("application_type", "cooperation");

      if (error) throw error;

      await uploadApplicationFiles();
      await loadExistingUploadedFiles(application.public_id);
      setUploadedMaterials({});
      setApplication((prev) => (prev ? { ...prev, ...payload } : prev));
      alert(submitMode === "submitted" ? t.submitted : t.saved);
    } catch (error) {
      console.error("StudentCooperationApplicationPage save error:", error);
      alert(`${t.saveFailed}${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          {t.loading}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-700 shadow-sm">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{t.pageTitle}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t.pageDesc}</p>
        </div>

        <SectionCard title={t.sections.program}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ReadonlyField
              label={t.fields.university}
              value={getSnapshotName(universitySnapshot, language, "name")}
              helper={t.readonly}
            />
            <ReadonlyField
              label={t.fields.partnerMajor}
              value={getSnapshotName(majorSnapshot, language, "partner_major")}
              helper={t.readonly}
            />
            
            <ReadonlyField
              label={t.fields.admissionYear}
              value={application?.cooperation_admission_year}
              helper={t.readonly}
            />
            <ReadonlyField
              label={t.fields.semester}
              value={`${application?.cooperation_admission_year || ""} ${t.fixedSemester}`}
              helper={t.readonly}
            />
            <ReadonlyField
              label={t.fields.admissionType}
              value={t.fixedAdmissionType}
              helper={t.readonly}
            />
            <ReadonlyField
              label={t.fields.program}
              value={t.fixedProgram}
              helper={t.readonly}
            />
          </div>
        </SectionCard>

        <SectionCard title={t.sections.student}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input
              label={t.fields.fullName}
              required
              disabled={isReadOnly}
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
            />
            <RadioGroup
              label={t.fields.sex}
              required
              disabled={isReadOnly}
              value={form.sex}
              options={t.sexOptions}
              onChange={(value) => updateField("sex", value)}
            />
            <ReadonlyField label={t.fields.nationality} value={t.fixedNationality} helper={t.readonly} />
            <Input
              label={t.fields.dateOfBirth}
              required
              disabled={isReadOnly}
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => updateField("dateOfBirth", event.target.value)}
            />
            <Input
              label={t.fields.email}
              required
              disabled={isReadOnly}
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
            <Input
              label={t.fields.tel}
              required
              disabled={isReadOnly}
              value={form.tel}
              onChange={(event) => updateField("tel", event.target.value)}
            />
            
            <Input
              label={t.fields.idCardNumber}
              required
              disabled={isReadOnly}
              value={form.cooperation_id_card_number}
              onChange={(event) => updateField("cooperation_id_card_number", event.target.value)}
            />
            <Input
              label={t.fields.street}
              required
              disabled={isReadOnly}
              className="md:col-span-2 xl:col-span-3"
              value={form.cooperation_address_street}
              onChange={(event) => updateField("cooperation_address_street", event.target.value)}
            />
            <Input
              label={t.fields.city}
              required
              disabled={isReadOnly}
              value={form.cooperation_address_city}
              onChange={(event) => updateField("cooperation_address_city", event.target.value)}
            />
            <ReadonlyField label={t.fields.country} value={t.fixedNationality} helper={t.readonly} />
          </div>
        </SectionCard>

        <SectionCard title={t.sections.education}>
          <div className="space-y-5">
            {form.educationRows.map((row, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 text-sm font-semibold text-slate-700">
                  {t.sections.educationRecord} {index + 1}
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Input
                    label={t.fields.educationStart}
                    disabled={isReadOnly}
                    type="date"
                    value={row.startDate}
                    onChange={(event) => updateEducationRow(index, "startDate", event.target.value)}
                  />
                  <Input
                    label={t.fields.educationEnd}
                    disabled={isReadOnly}
                    type="date"
                    value={row.endDate}
                    onChange={(event) => updateEducationRow(index, "endDate", event.target.value)}
                  />
                  <Input
                    label={t.fields.institution}
                    disabled={isReadOnly}
                    value={row.institution}
                    onChange={(event) => updateEducationRow(index, "institution", event.target.value)}
                  />
                  <Input
                    label={t.fields.educationLocation}
                    disabled={isReadOnly}
                    value={row.location}
                    onChange={(event) => updateEducationRow(index, "location", event.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title={t.sections.consent}>
          <div className="space-y-6">
            <div className="rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {t.agreementText}
            </div>
            <RadioGroup
              label={t.fields.agreeInfo}
              required
              disabled={isReadOnly}
              value={form.agree_personal_info ? "agree" : "disagree"}
              options={t.agreeOptions}
              onChange={(value) => updateField("agree_personal_info", value === "agree")}
            />
            <SignaturePreview name={form.fullName} t={t} />
          </div>
        </SectionCard>

        <SectionCard title={t.sections.materials}>
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
                disabled={isReadOnly}
                t={t}
              />
            ))}
          </div>
        </SectionCard>

        <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => handleSave("draft")}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t.saving : t.saveDraft}
          </button>
          <button
            type="button"
            disabled={isReadOnly}
            onClick={() => handleSave("submitted")}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? t.saving : t.submit}
          </button>
        </div>
      </div>
    </div>
  );
}

export default StudentCooperationApplicationPage;
