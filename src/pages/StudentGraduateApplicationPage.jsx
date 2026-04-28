import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getMajorOptions,
  isMajorAllowedForTrack,
} from "../data/majorCatalog";
import { supabase } from "../lib/supabase";

const admissionTypes = [
  "Freshman",
  "Transfer (2nd Semester)",
  "Transfer (3rd Semester)",
];

const programTracks = [
  "Korean Track",
  "English Track",
  "Bilingual Program (Chinese)",
];

const degreeLevels = [
  { value: "master", label: { zh: "硕士", en: "Master", ko: "석사" } },
  { value: "doctor", label: { zh: "博士", en: "Doctor", ko: "박사" } },
];

const sexOptions = ["Male", "Female"];
const yesNoOptions = ["YES", "NO"];

const signatureMethods = [
  { value: "auto", label: "自动生成名字" },
  { value: "draw", label: "手写签字" },
  { value: "upload", label: "上传签字图片" },
];

const initialEducationRows = [
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
];

const initialForm = {
  major: "",
  admissionType: "",
  programTrack: "",
  dormitory: "",

  fullNamePassport: "",
  sex: "",
  nationalityApplicant: "",
  nationalityFather: "",
  nationalityMother: "",
  passportNo: "",
  alienRegistrationNo: "",
  dateOfBirth: "",
  tel: "",
  email: "",
  address: "",
  residenceStatus: "abroad",

  educationRows: initialEducationRows,

  topikLevel: "",
  skaLevel: "",
  kiipLevel: "",
  ieltsLevel: "",
  toefl: "",
  toeflIbt: "",
  cefr: "",
  teps: "",
  newTeps: "",

  refundName: "",
  refundDateOfBirth: "",
  refundEmail: "",
  accountHolder: "",
  relationshipWithApplicant: "",
  beneficiaryAddress: "",
  beneficiaryCity: "",
  beneficiaryCountry: "",
  bankName: "",
  bankAddress: "",
  bankCity: "",
  bankCountry: "",
  accountNumber: "",
  swiftCode: "",

  bank_certificate_holder_type: "self",

  personal_statement_1: "",
  personal_statement_2: "",
  personal_statement_3: "",
  personal_statement_4: "",

  agree_personal_info: true,
  acknowledge_notice: true,

  guarantor_department_major: "",
  guarantor_applicant_name: "",
  guarantor_applicant_nationality: "",
  guarantor_applicant_id_number: "",
  guarantor_applicant_passport_number: "",
  guarantor_name: "",
  guarantor_relationship: "",
  guarantor_id_number: "",
  guarantor_occupation: "",
  guarantor_address: "",
  guarantor_home_contact: "",
  guarantor_mobile_email: "",
  guarantor_work_contact: "",

  applicant_signature_method: "auto",
  guarantor_signature_method: "auto",
};

const COUNTRY_GROUPS = [
  {
    canonical: "China",
    aliases: [
      "china",
      "prc",
      "peoplesrepublicofchina",
      "peoplesrepublicchina",
      "chinaprc",
      "cn",
      "中国",
      "中国大陆",
      "中国内地",
      "中华人民共和国",
      "중국",
      "중화인민공화국",
    ],
  },
  {
    canonical: "South Korea",
    aliases: [
      "southkorea",
      "republicofkorea",
      "rok",
      "korea",
      "kr",
      "韩国",
      "南韩",
      "大韩民国",
      "한국",
      "대한민국",
      "남한",
    ],
  },
  {
    canonical: "Japan",
    aliases: ["japan", "jp", "日本", "일본", "nippon"],
  },
  {
    canonical: "Nepal",
    aliases: ["nepal", "np", "尼泊尔", "네팔"],
  },
  {
    canonical: "Uzbekistan",
    aliases: ["uzbekistan", "uzb", "uz", "uzbek", "乌兹别克斯坦", "우즈베키스탄", "우즈벡"],
  },
  {
    canonical: "Mongolia",
    aliases: ["mongolia", "mn", "蒙古", "몽골"],
  },
  {
    canonical: "Vietnam",
    aliases: ["vietnam", "vn", "越南", "베트남"],
  },
  {
    canonical: "India",
    aliases: ["india", "in", "印度", "인도"],
  },
  {
    canonical: "Pakistan",
    aliases: ["pakistan", "pk", "巴基斯坦", "파키스탄"],
  },
  {
    canonical: "Bangladesh",
    aliases: ["bangladesh", "bd", "孟加拉国", "방글라데시"],
  },
  {
    canonical: "Indonesia",
    aliases: ["indonesia", "id", "印尼", "印度尼西亚", "인도네시아"],
  },
  {
    canonical: "Thailand",
    aliases: ["thailand", "th", "泰国", "태국"],
  },
  {
    canonical: "Malaysia",
    aliases: ["malaysia", "my", "马来西亚", "말레이시아"],
  },
  {
    canonical: "Philippines",
    aliases: ["philippines", "ph", "菲律宾", "필리핀"],
  },
  {
    canonical: "Myanmar",
    aliases: ["myanmar", "burma", "mm", "缅甸", "미얀마", "버마"],
  },
  {
    canonical: "Russia",
    aliases: ["russia", "ru", "俄罗斯", "러시아"],
  },
  {
    canonical: "Kazakhstan",
    aliases: ["kazakhstan", "kz", "哈萨克斯坦", "카자흐스탄"],
  },
  {
    canonical: "Kyrgyzstan",
    aliases: ["kyrgyzstan", "kg", "吉尔吉斯斯坦", "키르기스스탄", "키르기즈"],
  },
  {
    canonical: "Tajikistan",
    aliases: ["tajikistan", "tj", "塔吉克斯坦", "타지키스탄"],
  },
  {
    canonical: "United States",
    aliases: ["unitedstates", "usa", "us", "america", "美国", "미국"],
  },
  {
    canonical: "Canada",
    aliases: ["canada", "ca", "加拿大", "캐나다"],
  },
  {
    canonical: "United Kingdom",
    aliases: ["unitedkingdom", "uk", "greatbritain", "britain", "england", "英国", "영국"],
  },
  {
    canonical: "Germany",
    aliases: ["germany", "de", "德国", "독일"],
  },
  {
    canonical: "France",
    aliases: ["france", "fr", "法国", "프랑스"],
  },
  {
    canonical: "Australia",
    aliases: ["australia", "au", "澳大利亚", "호주"],
  },
];

function normalizeCountryInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[()（）【】\[\]{}]/g, "")
    .replace(/[／/、,，.;；:_-]/g, "");

  for (const group of COUNTRY_GROUPS) {
    if (group.aliases.includes(normalized)) {
      return group.canonical;
    }
  }

  return raw;
}

function normalizeDate(value) {
  return value && String(value).trim() !== "" ? value : null;
}

function StepButton({ index, currentStep, label, onClick }) {
  const active = currentStep === index;
  const done = currentStep > index;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap",
        active
          ? "bg-emerald-600 text-white"
          : done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-200 text-slate-600 hover:bg-slate-300",
      ].join(" ")}
    >
      {index + 1}. {label}
    </button>
  );
}

function SectionCard({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {desc ? <p className="mt-1 text-sm text-slate-500">{desc}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Label({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
  disabled = false,
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  rows = 5,
  disabled = false,
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea
        value={value || ""}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
      />
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  disabled = false,
  placeholder = "请选择",
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select
        value={value || ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function RadioGroup({
  label,
  value,
  options,
  onChange,
  required = false,
  disabled = false,
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const checked = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={checked}
              disabled={disabled}
              onClick={() => {
                if (!disabled) onChange(optionValue);
              }}
              className={[
                "inline-flex items-center rounded-xl border px-4 py-3 text-sm font-medium transition",
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : checked
                  ? "cursor-pointer border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400",
              ].join(" ")}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SignaturePad({
  title,
  signerName,
  method,
  onMethodChange,
  uploadedImage,
  onUploadedImageChange,
  drawnImage,
  onDrawnImageChange,
  disabled = false,
  signatureMethodOptions = signatureMethods,
  text = {
    confirm: "请选择签字方式。提交后会同步到机构端。",
    methodLabel: "签字方式",
        autoDesc: "自动生成名字将基于当前姓名字段生成：",
    autoEmpty: "请先填写姓名后自动生成",
    noPreview: "暂无签字预览",
    drawDesc: "请在下方区域手写签字。",
    clear: "清空重签",
    uploadLabel: "上传签字图片",
    previewReady: "已生成签字预览。",
  },
}) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const generatedSignature = useMemo(() => {
    if (!signerName) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f172a";
    ctx.font = "48px cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(signerName, 24, 70);
    return canvas.toDataURL("image/png");
  }, [signerName]);

    const exportTrimmedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1 || maxY === -1) return "";

    const padding = 8;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = trimmedWidth;
    outCanvas.height = trimmedHeight;

    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return "";

    outCtx.clearRect(0, 0, trimmedWidth, trimmedHeight);
    outCtx.drawImage(
      canvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );

    return outCanvas.toDataURL("image/png");
  };

    const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

    const startDraw = (e) => {
    e.preventDefault();
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setDrawing(true);
  };

    const moveDraw = (e) => {
    e.preventDefault();
    if (disabled || !drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

    const endDraw = () => {
    if (disabled || !drawing) return;
    setDrawing(false);
    onDrawnImageChange(exportTrimmedSignature());
  };

  const clearCanvas = () => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDrawnImageChange("");
  };

  const previewImage =
    method === "auto"
      ? generatedSignature
      : method === "upload"
      ? uploadedImage
      : drawnImage;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-500">
        {text.confirm}
      </p>

      <div className="mt-4">
        <RadioGroup
          label={text.methodLabel}
          value={method}
          options={signatureMethodOptions}
          onChange={onMethodChange}
          disabled={disabled}
        />
      </div>

      {method === "auto" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
            <p className="text-sm text-slate-500">{text.autoDesc}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {signerName || text.autoEmpty}
            </p>
            <div className="mt-4 min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 p-4">
              {generatedSignature ? (
                <img src={generatedSignature} alt="auto-signature" className="h-20 object-contain" />
              ) : (
                <p className="text-sm text-slate-400">{text.noPreview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {method === "draw" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm text-slate-500">{text.drawDesc}</p>
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              className="touch-none w-full rounded-xl border border-slate-300 bg-white"
              onMouseDown={startDraw}
              onMouseMove={moveDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={moveDraw}
              onTouchEnd={endDraw}
            />
            <button
              type="button"
              onClick={clearCanvas}
              disabled={disabled}
              className="mt-3 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {text.clear}
            </button>
          </div>
        </div>
      )}

      {method === "upload" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Label>{text.uploadLabel}</Label>
            <input
              type="file"
              accept="image/*"
              disabled={disabled}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onUploadedImageChange(reader.result);
                reader.readAsDataURL(file);
              }}
              className="block w-full text-sm text-slate-600 disabled:text-slate-400"
            />
            <div className="mt-4 min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 p-4">
              {uploadedImage ? (
                <img src={uploadedImage} alt="uploaded-signature" className="h-20 object-contain" />
              ) : (
                <p className="text-sm text-slate-400">{text.noPreview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage ? (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {text.previewReady}
        </div>
      ) : null}
    </div>
  );
}


const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

function readLanguage() {
  try {
    return localStorage.getItem("app_language") || "zh";
  } catch {
    return "zh";
  }
}

function saveLanguage(value) {
  try {
    localStorage.setItem("app_language", value);
  } catch {
    // ignore
  }
}

async function fetchStudentIntakeStatus(intakeId) {
  if (!intakeId) return { exists: false, closed: false, row: null };

  const { data, error } = await supabase
    .from("intakes")
    .select("id, close_at")
    .eq("id", intakeId)
    .single();

  if (error) throw error;

  return {
    exists: !!data,
    closed: data?.close_at ? new Date() > new Date(data.close_at) : false,
    row: data || null,
  };
}

function StudentGraduateApplicationPage() {
  const { token } = useParams();
  const [language, setLanguage] = useState(() => readLanguage());
  const txt = useMemo(
    () => (zh, en, ko) => {
      if (language === "en") return en;
      if (language === "ko") return ko;
      return zh;
    },
    [language]
  );

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  const steps = useMemo(
    () => [
      txt("申请基本信息", "Basic Application Info", "지원 기본 정보"),
      txt("申请人信息", "Applicant Info", "지원자 정보"),
      txt("学历与语言能力", "Education & Language", "학력 및 언어능력"),
      txt("退款账户信息", "Refund Account", "환불 계좌 정보"),
      txt("自我介绍与学业计划", "Personal Statement & Study Plan", "자기소개 및 학업계획"),
      txt("同意书、财政担保与签字", "Consent, Guarantee & Signature", "동의서, 재정보증 및 서명"),
    ],
    [txt]
  );

  const bankHolderTypeOptions = useMemo(
    () => [
      { value: "self", label: txt("申请人本人名义", "Applicant's own name", "지원자 본인 명의") },
      { value: "guarantor", label: txt("父母 / 财政担保人名义", "Parent / financial guarantor name", "부모 / 재정보증인 명의") },
    ],
    [txt]
  );

    const signatureMethodOptions = useMemo(
    () => [
      { value: "auto", label: txt("自动生成名字", "Generate Name", "이름 자동 생성") },
      { value: "draw", label: txt("手写签字", "Draw signature", "직접 서명") },
      { value: "upload", label: txt("上传签字图片", "Upload signature image", "서명 이미지 업로드") },
    ],
    [txt]
  );

    const residenceOptionsTranslated = useMemo(
    () => [
      { value: "abroad", label: txt("海外居住", "Living overseas", "해외 거주") },
      { value: "korea", label: txt("在韩国居住", "Living in Korea", "한국 거주") },
    ],
    [txt]
  );

  const programTrackOptions = useMemo(
    () => [
      {
        value: "Korean Track",
        label: txt("韩语授课", "Korean Track", "한국어 트랙"),
      },
      {
        value: "English Track",
        label: txt("英语授课", "English Track", "영어 트랙"),
      },
      {
        value: "Bilingual Program (Chinese)",
        label: txt("双语授课（中文）", "Bilingual Program (Chinese)", "이중언어 트랙(중국어)"),
      },
    ],
    [txt]
  );

  const admissionTypeOptions = useMemo(
    () => [
      {
        value: "Freshman",
        label: txt("新入", "Freshman", "신입"),
      },
      {
        value: "Transfer (2nd Semester)",
        label: txt("插班第2学期", "Transfer (2nd Semester)", "편입 2학기"),
      },
      {
        value: "Transfer (3rd Semester)",
        label: txt("插班第3学期", "Transfer (3rd Semester)", "편입 3학기"),
      },
    ],
    [txt]
  );

  const degreeLevelOptions = useMemo(
    () =>
      degreeLevels.map((item) => ({
        value: item.value,
        label: txt(item.label.zh, item.label.en, item.label.ko),
      })),
    [txt]
  );

  const pageText = useMemo(
    () => ({
      common: {
        select: txt("请选择", "Please select", "선택하세요"),
      },
      alerts: {
        invalidLink: txt("未找到可填写的申请链接，或该链接已失效。", "The application link was not found or has expired.", "작성 가능한 지원 링크를 찾을 수 없거나 링크가 만료되었습니다."),
        loadFailed: txt("学生申请加载失败。", "Failed to load the student application.", "학생 지원서를 불러오지 못했습니다."),
        missingApplicationId: txt("缺少申请编号，无法保存。", "Missing application ID. Cannot save.", "지원서 번호가 없어 저장할 수 없습니다."),
        fillClosed: txt("该申请已关闭学生填写，无法继续修改。", "Student editing is closed for this application.", "이 지원서는 학생 작성이 닫혀 있어 더 이상 수정할 수 없습니다."),
        saved: txt("学生信息已保存。", "Student information saved.", "학생 정보가 저장되었습니다."),
        submitted: txt("学生信息已提交。", "Student information submitted.", "학생 정보가 제출되었습니다."),
        saveFailed: (message) => txt(`保存失败：${message}`, `Save failed: ${message}`, `저장 실패: ${message}`),
      },
      signaturePad: {
        confirm: txt("请选择签字方式。提交后会同步到机构端。", "Choose a signature method. It will sync to the agency portal after submission.", "서명 방식을 선택하세요. 제출 후 기관 포털에 동기화됩니다."),
        methodLabel: txt("签字方式", "Signature Method", "서명 방식"),
                autoDesc: txt("自动生成名字将基于当前姓名字段生成：", "The generated name will be based on the current name field:", "자동 생성 이름은 현재 이름 입력값을 기준으로 생성됩니다."),
        autoEmpty: txt("请先填写姓名后自动生成", "Enter a name first to generate a signature", "먼저 이름을 입력하면 서명이 생성됩니다"),
        noPreview: txt("暂无签字预览", "No signature preview yet", "서명 미리보기가 없습니다"),
        drawDesc: txt("请在下方区域手写签字。", "Draw your signature in the area below.", "아래 영역에 직접 서명해 주세요."),
        clear: txt("清空重签", "Clear and redraw", "지우고 다시 서명"),
        uploadLabel: txt("上传签字图片", "Upload signature image", "서명 이미지 업로드"),
        previewReady: txt("已生成签字预览。", "Signature preview is ready.", "서명 미리보기가 생성되었습니다."),
      },
      sections: {
        loading: txt("正在加载申请信息...", "Loading application information...", "지원 정보를 불러오는 중입니다..."),
        pageTitle: txt("学生申请信息填写", "Student Application Form", "학생 지원 정보 작성"),
        pageDesc: txt("请按步骤填写申请信息。保存后，机构端会自动同步更新。", "Please complete the application step by step. After saving, updates will sync to the agency portal automatically.", "단계별로 지원 정보를 작성해 주세요. 저장 후 기관 포털에 자동으로 동기화됩니다."),
        closedNotice: txt("该申请已被机构关闭填写，当前仅可查看，不能继续保存或提交。", "The agency has closed student editing. You can view this form, but cannot save or submit.", "기관에서 학생 작성을 닫았습니다. 현재는 조회만 가능하며 저장 또는 제출할 수 없습니다."),
        previous: txt("上一步", "Previous", "이전"),
        next: txt("下一步", "Next", "다음"),
        saveDraft: txt("保存草稿", "Save Draft", "초안 저장"),
        submit: txt("提交", "Submit", "제출"),
      },
    }),
    [txt]
  );


  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [application, setApplication] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  const [applicantUploadedSignature, setApplicantUploadedSignature] = useState("");
  const [applicantDrawnSignature, setApplicantDrawnSignature] = useState("");
  const [guarantorUploadedSignature, setGuarantorUploadedSignature] = useState("");
  const [guarantorDrawnSignature, setGuarantorDrawnSignature] = useState("");

    const [form, setForm] = useState(initialForm);

  const majorOptions = useMemo(() => {
    return getMajorOptions({
      applicationType: "graduate",
      programTrack: form.programTrack,
      language,
    });
  }, [form.programTrack, language]);

  const isReadOnly = saving || application?.student_fill_enabled === false;
  const financialGuaranteeRequired = form.bank_certificate_holder_type === "guarantor";

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
          .single();

        if (error) throw error;
        if (!data) {
          throw new Error(pageText.alerts.invalidLink);
        }

                if (data.intake_id) {
          const intakeStatus = await fetchStudentIntakeStatus(data.intake_id);

          if (intakeStatus.closed) {
            throw new Error(
              txt(
                "该申请所属批次已截止，学生端不能继续填写。",
                "This intake is already closed. Student editing is no longer available.",
                "해당 차수는 이미 마감되어 학생이 더 이상 작성할 수 없습니다."
              )
            );
          }
        }

        setApplicationId(data.id || "");
        setApplication(data);

        const educationRows = [
          data.education1 || "",
          data.education2 || "",
          data.education3 || "",
        ].map((row) => {
          if (!row) {
            return { startDate: "", endDate: "", institution: "", location: "" };
          }

          const parts = String(row).split("|").map((part) => part.trim());
          const datePart = parts[0] || "";
          const datePieces = datePart.split("~").map((part) => part.trim());

          return {
            startDate: datePieces[0] || "",
            endDate: datePieces[1] || "",
            institution: parts[1] || "",
            location: parts[2] || "",
          };
        });

        setForm({
          major: data.major || "", 
          degreeLevel: data.degree_level || "",
          admissionType: data.admission_type || "",
          programTrack: data.program_track || "",
          dormitory: data.dormitory || "",

          fullNamePassport: data.full_name_passport || data.english_name || "",
          sex: data.gender || "",
          nationalityApplicant: data.nationality_applicant || data.nationality || "",
          nationalityFather: data.nationality_father || "",
          nationalityMother: data.nationality_mother || "",
          passportNo: data.passport_no || "",
          alienRegistrationNo: data.alien_registration_no || "",
          dateOfBirth: data.date_of_birth || "",
          tel: data.tel || data.phone || "",
          email: data.email || "",
          address: data.address || "",
          residenceStatus: data.residence_status || "abroad",

          educationRows,

          topikLevel: data.topik || "",
          skaLevel: data.ska || "",
          kiipLevel: data.kiip || "",
          ieltsLevel: data.ielts || "",
          toefl: data.toefl || "",
          toeflIbt: data.toefl_ibt || "",
          cefr: data.cefr || "",
          teps: data.teps || "",
          newTeps: data.new_teps || "",

          refundName: data.refund_name || "",
          refundDateOfBirth: data.refund_dob || "",
          refundEmail: data.refund_email || "",
          accountHolder: data.account_holder || "",
          relationshipWithApplicant: data.relationship || "",
          beneficiaryAddress: data.beneficiary_address || "",
          beneficiaryCity: data.beneficiary_city || "",
          beneficiaryCountry: data.beneficiary_country || "",
          bankName: data.bank_name || "",
          bankAddress: data.bank_address || "",
          bankCity: data.bank_city || "",
          bankCountry: data.bank_country || "",
          accountNumber: data.account_number || "",
          swiftCode: data.swift_code || "",

          bank_certificate_holder_type: data.bank_certificate_holder_type || "self",

          personal_statement_1: data.personal_statement_1 || "",
          personal_statement_2: data.personal_statement_2 || "",
          personal_statement_3: data.personal_statement_3 || "",
          personal_statement_4: data.personal_statement_4 || "",

          agree_personal_info: (data.agree_personal_info || "").toLowerCase() !== "disagree",
          acknowledge_notice: (data.acknowledge_notice || "").toLowerCase() !== "no",

          guarantor_department_major: data.guarantor_department_major || "",
          guarantor_applicant_name: data.guarantor_applicant_name || "",
          guarantor_applicant_nationality: data.guarantor_applicant_nationality || "",
          guarantor_applicant_id_number: data.guarantor_applicant_id_number || "",
          guarantor_applicant_passport_number: data.guarantor_applicant_passport_number || "",
          guarantor_name: data.guarantor_name || "",
          guarantor_relationship: data.guarantor_relationship || "",
          guarantor_id_number: data.guarantor_id_number || "",
          guarantor_occupation: data.guarantor_occupation || "",
          guarantor_address: data.guarantor_address || "",
          guarantor_home_contact: data.guarantor_home_contact || "",
          guarantor_mobile_email: data.guarantor_mobile_email || data.guarantor_email || "",
          guarantor_work_contact: data.guarantor_work_contact || data.guarantor_work || "",

          applicant_signature_method: data.applicant_signature_method || "auto",
          guarantor_signature_method: data.guarantor_signature_method || "auto",
        });

        setApplicantUploadedSignature(data.applicant_uploaded_signature || "");
        setApplicantDrawnSignature(data.applicant_drawn_signature || "");
        setGuarantorUploadedSignature(data.guarantor_uploaded_signature || "");
        setGuarantorDrawnSignature(data.guarantor_drawn_signature || "");
      } catch (error) {
        console.error("StudentApplicationPage loadApplication error:", error);
        setLoadError(error.message || pageText.alerts.loadFailed);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadApplication();
    }
  }, [token, pageText]);

    const updateField = (field, value) => {
    setForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "programTrack") {
        if (
          prev.major &&
          !isMajorAllowedForTrack({
            applicationType: "graduate",
            programTrack: value,
            major: prev.major,
          })
        ) {
          next.major = "";
        }
      }

      return next;
    });
  };

  useEffect(() => {
    if (!form.programTrack) return;

    setForm((prev) => {
      if (
        prev.major &&
        !isMajorAllowedForTrack({
          applicationType: "graduate",
          programTrack: prev.programTrack,
          major: prev.major,
        })
      ) {
        return {
          ...prev,
          major: "",
        };
      }

      return prev;
    });
  }, [form.programTrack]);

  const updateCountryField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const normalizeCountryField = (field) => {
    setForm((prev) => ({
      ...prev,
      [field]: normalizeCountryInput(prev[field]),
    }));
  };

  const updateEducationRow = (index, field, value) => {
    setForm((prev) => {
      const nextRows = [...prev.educationRows];
      nextRows[index] = {
        ...nextRows[index],
        [field]: value,
      };
      return {
        ...prev,
        educationRows: nextRows,
      };
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const buildPayload = (submitMode = "draft") => {
    const education1 = form.educationRows[0]
      ? `${form.educationRows[0].startDate || ""} ~ ${form.educationRows[0].endDate || ""} | ${form.educationRows[0].institution || ""} | ${form.educationRows[0].location || ""}`
      : "";
    const education2 = form.educationRows[1]
      ? `${form.educationRows[1].startDate || ""} ~ ${form.educationRows[1].endDate || ""} | ${form.educationRows[1].institution || ""} | ${form.educationRows[1].location || ""}`
      : "";
    const education3 = form.educationRows[2]
      ? `${form.educationRows[2].startDate || ""} ~ ${form.educationRows[2].endDate || ""} | ${form.educationRows[2].institution || ""} | ${form.educationRows[2].location || ""}`
      : "";

    const payload = {
      application_type: "graduate",
      major: form.major,
      degree_level: form.degreeLevel || null,
      admission_type: form.admissionType,
      program_track: form.programTrack,
      dormitory: form.dormitory,

      full_name_passport: form.fullNamePassport,
      english_name: form.fullNamePassport,
      gender: form.sex,
      nationality: normalizeCountryInput(form.nationalityApplicant),
      nationality_applicant: normalizeCountryInput(form.nationalityApplicant),
      nationality_father: normalizeCountryInput(form.nationalityFather),
      nationality_mother: normalizeCountryInput(form.nationalityMother),
      passport_no: form.passportNo,
      alien_registration_no: form.alienRegistrationNo,
      date_of_birth: normalizeDate(form.dateOfBirth),
      tel: form.tel,
      phone: form.tel,
      email: form.email,
      address: form.address,
      residence_status: form.residenceStatus,

      education1,
      education2,
      education3,

      topik: form.topikLevel,
      ska: form.skaLevel,
      kiip: form.kiipLevel,
      ielts: form.ieltsLevel,
      toefl: form.toefl,
      toefl_ibt: form.toeflIbt,
      cefr: form.cefr,
      teps: form.teps,
      new_teps: form.newTeps,

      refund_name: form.refundName,
      refund_dob: normalizeDate(form.refundDateOfBirth),
      refund_email: form.refundEmail,
      account_holder: form.accountHolder,
      relationship: form.relationshipWithApplicant,
      beneficiary_address: form.beneficiaryAddress,
      beneficiary_city: form.beneficiaryCity,
      beneficiary_country: form.beneficiaryCountry,
      bank_name: form.bankName,
      bank_address: form.bankAddress,
      bank_city: form.bankCity,
      bank_country: form.bankCountry,
      account_number: form.accountNumber,
      swift_code: form.swiftCode,

      personal_statement_1: form.personal_statement_1,
      personal_statement_2: form.personal_statement_2,
      personal_statement_3: form.personal_statement_3,
      personal_statement_4: form.personal_statement_4,

      agree_personal_info: form.agree_personal_info ? "agree" : "disagree",
      acknowledge_notice: form.acknowledge_notice ? "yes" : "no",

      bank_certificate_holder_type: form.bank_certificate_holder_type,

      guarantor_department_major: form.guarantor_department_major,
      guarantor_applicant_name: form.guarantor_applicant_name,
      guarantor_applicant_nationality: normalizeCountryInput(form.guarantor_applicant_nationality),
      guarantor_applicant_id_number: form.guarantor_applicant_id_number,
      guarantor_applicant_passport_number: form.guarantor_applicant_passport_number,

      guarantor_name: form.guarantor_name,
      guarantor_relationship: form.guarantor_relationship,
      guarantor_id_number: form.guarantor_id_number,
      guarantor_occupation: form.guarantor_occupation,
      guarantor_address: form.guarantor_address,
      guarantor_home_contact: form.guarantor_home_contact,
      guarantor_mobile: form.guarantor_mobile_email,
      guarantor_email: form.guarantor_mobile_email,
      guarantor_mobile_email: form.guarantor_mobile_email,
      guarantor_work: form.guarantor_work_contact,
      guarantor_work_contact: form.guarantor_work_contact,

      applicant_signature_method: form.applicant_signature_method,
      guarantor_signature_method: form.guarantor_signature_method,
      applicant_uploaded_signature: applicantUploadedSignature,
      applicant_drawn_signature: applicantDrawnSignature,
      guarantor_uploaded_signature: guarantorUploadedSignature,
      guarantor_drawn_signature: guarantorDrawnSignature,

      student_fill_updated_at: new Date().toISOString(),
application_form_updated_at: new Date().toISOString(),
student_form_status: submitMode === "submitted" ? "submitted" : "draft",
    };

    if (submitMode === "submitted") {
      payload.student_fill_submitted_at = new Date().toISOString();
    }

    return payload;
  };

  const handleSave = async (submitMode = "draft") => {
    try {
            if (application?.intake_id) {
        const intakeStatus = await fetchStudentIntakeStatus(application.intake_id);

        if (intakeStatus.closed) {
          alert(
            txt(
              "该申请所属批次已截止，不能继续保存或提交。",
              "This intake is already closed. You can no longer save or submit.",
              "해당 차수는 이미 마감되어 더 이상 저장하거나 제출할 수 없습니다."
            )
          );
          return;
        }
      }

      if (!applicationId) {
        alert(pageText.alerts.missingApplicationId);
        return;
      }

      if (application?.student_fill_enabled === false) {
        alert(pageText.alerts.fillClosed);
        return;
      }

      setSaving(true);

      const payload = buildPayload(submitMode);

      const { error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", applicationId)
        .eq("student_fill_enabled", true);

      if (error) throw error;

      setApplication((prev) =>
        prev
          ? {
              ...prev,
              ...payload,
              student_fill_enabled: true,
            }
          : prev
      );

      alert(submitMode === "submitted" ? pageText.alerts.submitted : pageText.alerts.saved);
    } catch (error) {
      console.error("StudentApplicationPage handleSave error:", error);
      alert(pageText.alerts.saveFailed(error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {pageText.sections.loading}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-100 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-2xl border border-red-200 bg-white p-8 text-red-600 shadow-sm">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex justify-end">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
            <div className="grid grid-cols-3 gap-2">
              {LANGUAGE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setLanguage(item.value)}
                  className={[
                    "rounded-lg px-3 py-2 text-xs font-semibold transition",
                    language === item.value
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SectionCard
          title={pageText.sections.pageTitle}
          desc={pageText.sections.pageDesc}
        >
          <div className="flex flex-wrap gap-3">
            {steps.map((label, index) => (
              <StepButton
                key={label}
                index={index}
                currentStep={currentStep}
                label={label}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>

          {application?.student_fill_enabled === false ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {pageText.sections.closedNotice}
            </div>
          ) : null}
        </SectionCard>

        {currentStep === 0 && (
          <SectionCard
            title={txt("第1步：申请基本信息", "Step 1: Basic Application Info", "1단계: 지원 기본 정보")}
            desc={txt("请填写申请专业、学位课程、申请类型、项目轨道及宿舍申请。", "Enter intended major, degree level, admission type, program track, and dormitory request.", "지원 전공, 학위 과정, 지원 구분, 지원 트랙 및 생활관 신청 여부를 입력하세요.")}
          >
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <Select
                label="申请轨道(Program Track)"
                required
                disabled={isReadOnly}
                value={form.programTrack}
                onChange={(e) => updateField("programTrack", e.target.value)}
                options={programTrackOptions}
                placeholder={pageText.common.select}
              />
              <Select
                label="申请专业(Major)"
                required
                disabled={isReadOnly}
                value={form.major}
                onChange={(e) => updateField("major", e.target.value)}
                options={majorOptions}
                placeholder={pageText.common.select}
              />
              <Select
                label={txt("学位课程 (Degree Level)", "Degree Level", "학위 과정")}
                required
                disabled={isReadOnly}
                value={form.degreeLevel}
                onChange={(e) => updateField("degreeLevel", e.target.value)}
                options={degreeLevelOptions}
                placeholder={pageText.common.select}
              />
              <Select
                label="申请区分(Admission Type)"
                required
                disabled={isReadOnly}
                value={form.admissionType}
                onChange={(e) => updateField("admissionType", e.target.value)}
                options={admissionTypeOptions}
                placeholder={pageText.common.select}
              />
              <RadioGroup
                label="宿舍申请 (Dormitory)"
                required
                disabled={isReadOnly}
                value={form.dormitory}
                onChange={(value) => updateField("dormitory", value)}
                options={yesNoOptions}
              />
            </div>
          </SectionCard>
        )}

        {currentStep === 1 && (
          <SectionCard
            title={txt("第2步：申请人信息", "Step 2: Applicant Info", "2단계: 지원자 정보")}
            desc={txt("请填写申请人基本信息。", "Enter the applicant basic information.", "지원자 기본 정보를 입력하세요.")}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label="성명 (여권기준) / Full Name as shown on passport"
                required
                disabled={isReadOnly}
                value={form.fullNamePassport}
                onChange={(e) => updateField("fullNamePassport", e.target.value)}
                placeholder={txt("护照英文名", "Name in passport", "여권상 영문명")}
              />
              <RadioGroup
                label="성별 (Sex)"
                required
                disabled={isReadOnly}
                value={form.sex}
                onChange={(value) => updateField("sex", value)}
                options={sexOptions}
              />
              <div>
                <Label required>국적 (Nationality) - Applicant</Label>
                <input
                  value={form.nationalityApplicant || ""}
                  disabled={isReadOnly}
                  onChange={(e) => updateCountryField("nationalityApplicant", e.target.value)}
                  onBlur={() => normalizeCountryField("nationalityApplicant")}
                  placeholder={txt("申请人国籍", "Applicant nationality", "지원자 국적")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <div>
                <Label>국적 (Nationality) - Father</Label>
                <input
                  value={form.nationalityFather || ""}
                  disabled={isReadOnly}
                  onChange={(e) => updateCountryField("nationalityFather", e.target.value)}
                  onBlur={() => normalizeCountryField("nationalityFather")}
                  placeholder={txt("父亲国籍", "Father nationality", "부 국적")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <div>
                <Label>국적 (Nationality) - Mother</Label>
                <input
                  value={form.nationalityMother || ""}
                  disabled={isReadOnly}
                  onChange={(e) => updateCountryField("nationalityMother", e.target.value)}
                  onBlur={() => normalizeCountryField("nationalityMother")}
                  placeholder={txt("母亲国籍", "Mother nationality", "모 국적")}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>
              <Input
                label="여권번호 (Passport No.)"
                required
                disabled={isReadOnly}
                value={form.passportNo}
                onChange={(e) => updateField("passportNo", e.target.value)}
                placeholder={txt("护照号码", "Passport number", "여권번호")}
              />
              <Input
                label="외국인등록번호 (Alien Registration Number)"
                disabled={isReadOnly}
                value={form.alienRegistrationNo}
                onChange={(e) => updateField("alienRegistrationNo", e.target.value)}
                placeholder={txt("没有可留空", "Leave blank if not available", "없으면 비워두세요")}
              />
              <Input
                label="생년월일 (Date of Birth)"
                required
                type="date"
                disabled={isReadOnly}
                value={form.dateOfBirth}
                onChange={(e) => updateField("dateOfBirth", e.target.value)}
              />
              <Input
                label="전화번호 (Tel)"
                required
                disabled={isReadOnly}
                value={form.tel}
                onChange={(e) => updateField("tel", e.target.value)}
                placeholder={txt("联系电话", "Phone number", "연락처")}
              />
              <Input
                label="E-mail"
                required
                type="email"
                disabled={isReadOnly}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder={txt("邮箱地址", "Email address", "이메일 주소")}
              />
              <div className="md:col-span-2 xl:col-span-2">
                <Input
                  label="주소 (Address)"
                  required
                  disabled={isReadOnly}
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder={txt("完整地址", "Full address", "전체 주소")}
                />
              </div>
              <div className="xl:col-span-3">
                <RadioGroup
                  label={txt("当前居住状态", "Current residence status", "현재 거주 상태")}
                  required
                  disabled={isReadOnly}
                  value={form.residenceStatus}
                  onChange={(value) => updateField("residenceStatus", value)}
                  options={residenceOptionsTranslated}
                />
              </div>
            </div>
          </SectionCard>
        )}

        {currentStep === 2 && (
          <div className="space-y-6">
            <SectionCard
              title={txt("第3步：学历信息", "Step 3: Education Info", "3단계: 학력 정보")}
              desc={txt("请填写从高中到目前为止的学历信息。", "Enter your education history from high school to the present.", "고등학교부터 현재까지의 학력 정보를 입력하세요.")}
            >
              <div className="space-y-5">
                {form.educationRows.map((row, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 text-sm font-semibold text-slate-700">
                      {txt("学历记录", "Education record", "학력 기록")} {index + 1}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <Input
                        label={txt("开始日期", "Start Date", "시작일")}
                        type="date"
                        disabled={isReadOnly}
                        value={row.startDate}
                        onChange={(e) =>
                          updateEducationRow(index, "startDate", e.target.value)
                        }
                      />
                      <Input
                        label={txt("结束日期", "End Date", "종료일")}
                        type="date"
                        disabled={isReadOnly}
                        value={row.endDate}
                        onChange={(e) =>
                          updateEducationRow(index, "endDate", e.target.value)
                        }
                      />
                      <Input
                        label="학교명 (Institutions)"
                        disabled={isReadOnly}
                        value={row.institution}
                        onChange={(e) =>
                          updateEducationRow(index, "institution", e.target.value)
                        }
                        placeholder={txt("学校名称", "School name", "학교명")}
                      />
                      <Input
                        label="학교소재지국가/도시 (Country/City)"
                        disabled={isReadOnly}
                        value={row.location}
                        onChange={(e) =>
                          updateEducationRow(index, "location", e.target.value)
                        }
                        placeholder={txt("国家 / 城市", "Country / City", "국가 / 도시")}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={txt("语言能力 (Language Proficiency)", "Language Proficiency", "언어능력")}
              desc={txt("请填写已有的语言成绩。", "Enter any language test scores you have.", "보유한 언어 성적을 입력하세요.")}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input label="TOPIK Level" disabled={isReadOnly} value={form.topikLevel} onChange={(e) => updateField("topikLevel", e.target.value)} />
                <Input label="세종학당 (SKA) Level" disabled={isReadOnly} value={form.skaLevel} onChange={(e) => updateField("skaLevel", e.target.value)} />
                <Input label="사회통합프로그램 (KIIP) Level" disabled={isReadOnly} value={form.kiipLevel} onChange={(e) => updateField("kiipLevel", e.target.value)} />
                <Input label="IELTS" disabled={isReadOnly} value={form.ieltsLevel} onChange={(e) => updateField("ieltsLevel", e.target.value)} />
                <Input label="TOEFL" disabled={isReadOnly} value={form.toefl} onChange={(e) => updateField("toefl", e.target.value)} />
                <Input label="TOEFL iBT" disabled={isReadOnly} value={form.toeflIbt} onChange={(e) => updateField("toeflIbt", e.target.value)} />
                <Input label="CEFR" disabled={isReadOnly} value={form.cefr} onChange={(e) => updateField("cefr", e.target.value)} />
                <Input label="TEPS" disabled={isReadOnly} value={form.teps} onChange={(e) => updateField("teps", e.target.value)} />
                <Input label="NEW TEPS" disabled={isReadOnly} value={form.newTeps} onChange={(e) => updateField("newTeps", e.target.value)} />
              </div>
            </SectionCard>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-6">
            <SectionCard
              title={txt("第4步：注册金退款账户申请", "Step 4: Tuition Refund Account", "4단계: 등록금 환불 계좌 신청")}
              desc={txt("请填写退款账户相关信息。", "Enter refund account information.", "환불 계좌 관련 정보를 입력하세요.")}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="성명 (Name)"
                  required
                  disabled={isReadOnly}
                  value={form.refundName}
                  onChange={(e) => updateField("refundName", e.target.value)}
                  placeholder={txt("申请人姓名", "Applicant name", "지원자 이름")}
                />
                <Input
                  label="생년월일 (Date of Birth)"
                  required
                  type="date"
                  disabled={isReadOnly}
                  value={form.refundDateOfBirth}
                  onChange={(e) => updateField("refundDateOfBirth", e.target.value)}
                />
                <Input
                  label="이메일 (E-mail)"
                  required
                  type="email"
                  disabled={isReadOnly}
                  value={form.refundEmail}
                  onChange={(e) => updateField("refundEmail", e.target.value)}
                  placeholder={txt("邮箱", "Email", "이메일")}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="2-1. 수취인 정보 (Beneficiary Information)"
              desc={txt("退款账户持有人信息。", "Beneficiary account holder information.", "환불 계좌 수취인 정보입니다.")}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="예금주명 (Account Holder)"
                  required
                  disabled={isReadOnly}
                  value={form.accountHolder}
                  onChange={(e) => updateField("accountHolder", e.target.value)}
                  placeholder={txt("账户持有人", "Account holder", "예금주")}
                />
                <Input
                  label="신청자와의 관계 (Relationship)"
                  required
                  disabled={isReadOnly}
                  value={form.relationshipWithApplicant}
                  onChange={(e) => updateField("relationshipWithApplicant", e.target.value)}
                  placeholder={txt("与申请人关系", "Relationship with applicant", "지원자와의 관계")}
                />
                <Input
                  label="국가 (Country)"
                  required
                  disabled={isReadOnly}
                  value={form.beneficiaryCountry}
                  onChange={(e) => updateField("beneficiaryCountry", e.target.value)}
                  placeholder={txt("国家", "Country", "국가")}
                />
                <Input
                  label="도시 (City)"
                  required
                  disabled={isReadOnly}
                  value={form.beneficiaryCity}
                  onChange={(e) => updateField("beneficiaryCity", e.target.value)}
                  placeholder={txt("城市", "City", "도시")}
                />
                <div className="md:col-span-2 xl:col-span-2">
                  <Input
                    label="주소 (Address)"
                    required
                    disabled={isReadOnly}
                    value={form.beneficiaryAddress}
                    onChange={(e) => updateField("beneficiaryAddress", e.target.value)}
                    placeholder={txt("地址", "Address", "주소")}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="2-2. 은행 정보 (Bank Information)"
              desc={txt("退款银行信息。", "Refund bank information.", "환불 은행 정보입니다.")}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <Input
                  label="은행명 (Bank Name)"
                  required
                  disabled={isReadOnly}
                  value={form.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                  placeholder={txt("银行名称", "Bank name", "은행명")}
                />
                <Input
                  label="국가 (Country)"
                  required
                  disabled={isReadOnly}
                  value={form.bankCountry}
                  onChange={(e) => updateField("bankCountry", e.target.value)}
                  placeholder={txt("银行所在国家", "Bank country", "은행 소재 국가")}
                />
                <Input
                  label="도시 (City)"
                  required
                  disabled={isReadOnly}
                  value={form.bankCity}
                  onChange={(e) => updateField("bankCity", e.target.value)}
                  placeholder={txt("银行所在城市", "Bank city", "은행 소재 도시")}
                />
                <div className="md:col-span-2 xl:col-span-2">
                  <Input
                    label="은행 주소 (Bank Address)"
                    required
                    disabled={isReadOnly}
                    value={form.bankAddress}
                    onChange={(e) => updateField("bankAddress", e.target.value)}
                    placeholder={txt("银行地址", "Bank address", "은행 주소")}
                  />
                </div>
                <Input
                  label="계좌번호 (Account Number)"
                  required
                  disabled={isReadOnly}
                  value={form.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                  placeholder={txt("账号", "Account number", "계좌번호")}
                />
                <Input
                  label="SWIFT Code"
                  required
                  disabled={isReadOnly}
                  value={form.swiftCode}
                  onChange={(e) => updateField("swiftCode", e.target.value)}
                  placeholder="SWIFT"
                />
              </div>
            </SectionCard>
          </div>
        )}

        {currentStep === 4 && (
          <SectionCard
            title={txt("第5步：自我介绍与学业计划", "Step 5: Personal Statement & Study Plan", "5단계: 자기소개 및 학업계획")}
            desc={txt("请完成以下四个问题。", "Please complete the following four questions.", "아래 네 가지 질문을 작성해 주세요.")}
          >
            <div className="space-y-6">
              <TextArea
                label="1. 본인에 대해 자유롭게 소개해 주세요."
                required
                disabled={isReadOnly}
                value={form.personal_statement_1}
                onChange={(e) => updateField("personal_statement_1", e.target.value)}
                rows={6}
                placeholder={txt("可填写家庭、成长过程、性格、优缺点等", "Describe family background, growth, personality, strengths, and weaknesses.", "가정환경, 성장 과정, 성격, 장단점 등을 작성하세요.")}
              />
              <TextArea
                label="2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지"
                required
                disabled={isReadOnly}
                value={form.personal_statement_2}
                onChange={(e) => updateField("personal_statement_2", e.target.value)}
                rows={6}
                placeholder={txt("请具体描述为赴韩留学做过哪些准备", "Describe the preparations you made for studying in Korea.", "한국 유학을 위해 어떤 준비를 했는지 구체적으로 작성하세요.")}
              />
              <TextArea
                label="3. 한라대학교와 지원 학과를 선택한 이유"
                required
                disabled={isReadOnly}
                value={form.personal_statement_3}
                onChange={(e) => updateField("personal_statement_3", e.target.value)}
                rows={6}
                placeholder={txt("请说明申请韩拉大学和所选专业的原因", "Explain why you chose Halla University and this major.", "한라대학교와 해당 학과를 선택한 이유를 작성하세요.")}
              />
              <TextArea
                label="4. 입학 후 학업계획과 졸업 후 진로계획"
                required
                disabled={isReadOnly}
                value={form.personal_statement_4}
                onChange={(e) => updateField("personal_statement_4", e.target.value)}
                rows={6}
                placeholder={txt("请说明入学后的学习计划和毕业后的职业规划", "Describe your study plan after admission and career plan after graduation.", "입학 후 학업계획과 졸업 후 진로계획을 작성하세요.")}
              />
            </div>
          </SectionCard>
        )}

        {currentStep === 5 && (
          <div className="space-y-6">
            <SectionCard
              title={txt("第6步：个人信息同意书", "Step 6: Personal Information Consent", "6단계: 개인정보 동의서")}
              desc={txt("请确认相关同意事项。", "Please confirm the consent items.", "관련 동의 사항을 확인해 주세요.")}
            >
              <div className="space-y-5">
                <RadioGroup
                  label="개인정보 수집·이용에 동의하십니까?"
                  required
                  disabled={isReadOnly}
                  value={form.agree_personal_info ? "agree" : "disagree"}
                  onChange={(value) => updateField("agree_personal_info", value === "agree")}
                  options={[
                    { value: "agree", label: "동의함 / I agree" },
                    { value: "disagree", label: "동의하지 않음 / I disagree" },
                  ]}
                />
                <RadioGroup
                  label="위 내용 확인하셨습니까?"
                  required
                  disabled={isReadOnly}
                  value={form.acknowledge_notice ? "yes" : "no"}
                  onChange={(value) => updateField("acknowledge_notice", value === "yes")}
                  options={[
                    { value: "yes", label: "확인했습니다 / I acknowledge" },
                    { value: "no", label: "미확인" },
                  ]}
                />
              </div>
            </SectionCard>

            <SectionCard
              title={txt("财政担保判断", "Financial Guarantee Check", "재정보증 판단")}
              desc={txt("若银行存款证明为申请人本人名义，则财政担保书免填；若为父母或担保人名义，则必须填写财政担保书。", "If the bank balance certificate is under the applicant name, the financial guarantee form is exempt. If it is under a parent or guarantor name, the form is required.", "은행 잔고증명서가 지원자 본인 명의이면 재정보증서가 면제됩니다. 부모 또는 보증인 명의이면 재정보증서를 반드시 작성해야 합니다.")}
            >
              <RadioGroup
                label={txt("银行存款证明名义", "Bank certificate holder", "은행 잔고증명서 명의")}
                required
                disabled={isReadOnly}
                value={form.bank_certificate_holder_type}
                onChange={(value) => updateField("bank_certificate_holder_type", value)}
                options={bankHolderTypeOptions}
              />

              {!financialGuaranteeRequired && (
                <div className="mt-5 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                  {txt("已选择“申请人本人名义”。财政担保书页将自动隐藏。", "Applicant own name is selected. The financial guarantee page will be hidden.", "지원자 본인 명의가 선택되었습니다. 재정보증서 페이지는 자동으로 숨겨집니다.")}
                </div>
              )}
            </SectionCard>

            {financialGuaranteeRequired && (
              <SectionCard
                title="입학신청인 재정보증서 [1-4]"
                desc={txt("当银行存款证明为父母 / 财政担保人名义时，此页必须填写。", "This page is required when the bank certificate is under a parent or financial guarantor name.", "은행 잔고증명서가 부모 / 재정보증인 명의인 경우 이 페이지를 반드시 작성해야 합니다.")}
              >
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-4 text-base font-bold text-slate-900">
                      ■ 신청인개인정보 (Applicant details)
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Input
                        label="입학학부 (학과) / Department (Major)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_department_major}
                        onChange={(e) => updateField("guarantor_department_major", e.target.value)}
                      />
                      <Input
                        label="이름 (Full Name)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_applicant_name}
                        onChange={(e) => updateField("guarantor_applicant_name", e.target.value)}
                      />
                      <div>
                        <Label required>국적 (Nationality)</Label>
                        <input
                          value={form.guarantor_applicant_nationality || ""}
                          disabled={isReadOnly}
                          onChange={(e) => updateCountryField("guarantor_applicant_nationality", e.target.value)}
                          onBlur={() => normalizeCountryField("guarantor_applicant_nationality")}
                          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>
                      <Input
                        label="신분증번호 (ID number)"
                        disabled={isReadOnly}
                        value={form.guarantor_applicant_id_number}
                        onChange={(e) => updateField("guarantor_applicant_id_number", e.target.value)}
                      />
                      <Input
                        label="여권번호 (Passport number)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_applicant_passport_number}
                        onChange={(e) => updateField("guarantor_applicant_passport_number", e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 text-base font-bold text-slate-900">
                      ■ 재정보증인정보 (Guarantor details)
                    </h4>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      <Input
                        label="이름 (Full name)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_name}
                        onChange={(e) => updateField("guarantor_name", e.target.value)}
                      />
                      <Input
                        label="신청인과 관계 (Relationship with applicant)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_relationship}
                        onChange={(e) => updateField("guarantor_relationship", e.target.value)}
                      />
                      <Input
                        label="신분증번호 (ID number)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_id_number}
                        onChange={(e) => updateField("guarantor_id_number", e.target.value)}
                      />
                      <Input
                        label="직업 (Occupation)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_occupation}
                        onChange={(e) => updateField("guarantor_occupation", e.target.value)}
                      />
                      <div className="md:col-span-2 xl:col-span-2">
                        <Input
                          label="주소 (Address)"
                          required
                          disabled={isReadOnly}
                          value={form.guarantor_address}
                          onChange={(e) => updateField("guarantor_address", e.target.value)}
                        />
                      </div>
                      <Input
                        label="연락처 (Home)"
                        disabled={isReadOnly}
                        value={form.guarantor_home_contact}
                        onChange={(e) => updateField("guarantor_home_contact", e.target.value)}
                      />
                      <Input
                        label="연락처 (Mobile / E-MAIL)"
                        required
                        disabled={isReadOnly}
                        value={form.guarantor_mobile_email}
                        onChange={(e) => updateField("guarantor_mobile_email", e.target.value)}
                      />
                      <Input
                        label="연락처 (Work)"
                        disabled={isReadOnly}
                        value={form.guarantor_work_contact}
                        onChange={(e) => updateField("guarantor_work_contact", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            <SectionCard
              title={txt("签字", "Signature", "서명")}
              desc={txt("请完成申请人及担保人签字。", "Please complete applicant and guarantor signatures.", "지원자 및 보증인 서명을 완료해 주세요.")}
            >
              <div className="space-y-6">
                <SignaturePad
                  title={txt("申请人签字", "Applicant Signature", "지원자 서명")}
                  signerName={form.fullNamePassport}
                  method={form.applicant_signature_method}
                  onMethodChange={(value) => updateField("applicant_signature_method", value)}
                  uploadedImage={applicantUploadedSignature}
                  onUploadedImageChange={setApplicantUploadedSignature}
                  drawnImage={applicantDrawnSignature}
                  onDrawnImageChange={setApplicantDrawnSignature}
                  disabled={isReadOnly}
                  signatureMethodOptions={signatureMethodOptions}
                  text={pageText.signaturePad}
                />

                {financialGuaranteeRequired ? (
                  <SignaturePad
                    title={txt("担保人签字", "Guarantor Signature", "보증인 서명")}
                    signerName={form.guarantor_name}
                    method={form.guarantor_signature_method}
                    onMethodChange={(value) => updateField("guarantor_signature_method", value)}
                    uploadedImage={guarantorUploadedSignature}
                    onUploadedImageChange={setGuarantorUploadedSignature}
                    drawnImage={guarantorDrawnSignature}
                    onDrawnImageChange={setGuarantorDrawnSignature}
                    disabled={isReadOnly}
                    signatureMethodOptions={signatureMethodOptions}
                    text={pageText.signaturePad}
                  />
                ) : null}
              </div>
            </SectionCard>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {pageText.sections.previous}
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              >
                {pageText.sections.next}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isReadOnly}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isReadOnly
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {pageText.sections.saveDraft}
              </button>

              <button
                type="button"
                onClick={() => handleSave("submitted")}
                disabled={isReadOnly}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold ${
                  isReadOnly
                    ? "cursor-not-allowed bg-emerald-200 text-white"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {pageText.sections.submit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentGraduateApplicationPage;
