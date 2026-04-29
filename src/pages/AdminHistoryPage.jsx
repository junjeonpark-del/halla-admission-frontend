import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import { useAdminSession } from "../contexts/AdminSessionContext";

const messages = {
  zh: {
    sidebar: {
      title: "历史申请",
      desc: "按年份、月份、批次查看当前与历史申请",
      all: "全部申请",
      loading: "正在加载批次...",
      empty: "暂无可查询批次",
      yearSuffix: "年",
      monthSuffix: "月",
    },
    header: {
      allTitle: "全部申请",
      allDesc: "显示所有当前进行中与已截止批次的申请",
      yearTitle: (year) => `${year} 年申请`,
      yearDesc: (year) => `仅显示 ${year} 年下所有当前进行中与已截止批次的申请`,
      monthTitle: (year, month) => `${year}年 ${month}月申请`,
      monthDesc: (year, month) =>
        `仅显示 ${year}年 ${month}月下所有当前进行中与已截止批次的申请`,
      intakeDesc: (label) => `仅显示 ${label} 的申请记录`,
    },
        search: {
      label: "学生姓名 / 机构 / 专业",
      placeholder: "输入姓名、机构或专业搜索",
      export: "导出 Excel",
      exportApplication: "导出申请信息",
      exportRefund: "导出退款信息",
      refundSheetName: "退款信息",
      refundFilePrefix: "管理员退款信息",
      noExportData: "当前没有可导出的申请数据。",
      exportFailed: "导出失败：",
      sheetName: "历史申请",
      filePrefix: "管理员历史申请",
      fileAll: "全部申请",
      fileSingle: "单批次",
    },

    table: {
      title: "申请明细",
      desc: "管理员可继续进入审核页查看、审核并修改状态",
      loading: "正在加载申请...",
      empty: "当前条件下没有申请记录",
      index: "序号",
      studentName: "学生姓名",
      agency: "机构",
      year: "年度",
      intake: "批次",
      applicationForm: "申请表",
      passport: "护照",
      transcript: "成绩单",
      diploma: "毕业证",
      languageCertificate: "语言证明",
      arc: "登录证",
      bankStatement: "存款证明",
      guarantorIncome: "担保人收入证明",
      overall: "总体状态",
      applicationStatus: "申请状态",
      applicationReviewNote: "申请审核备注",
      actions: "操作",
      review: "继续审核",
      missingPublicId: "缺少 public_id",
      noNote: "—",
      materialReviewNotePrefix: "审核备注：",
    },
    status: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺少材料",
      approved: "已通过",
      rejected: "已拒绝",
    },
    material: {
      systemGenerated: "系统生成",
      exempt: "免提交",
      optional: "可不提交",
      uploaded: "已上传",
      missing: "缺失",
      needSupplement: "待补件",
      approved: "已通过",
      needMore: "需补件",
      pendingConfirm: "待确认",
      complete: "材料齐全",
    },
    intake: {
      roundPrefix: "第",
      roundSuffix: "批",
      yearSuffix: "年",
      monthSuffix: "月",
    },
    exportHeaders: {
      index: "序号",
      studentName: "学生姓名",
      fatherName: "父亲姓名",
      motherName: "母亲姓名",
      agency: "机构",
      intake: "申请批次",
      major: "专业",
      admissionType: "申请类型",
      admissionGrade: "申请年级",
      programTrack: "课程语言",
      dormitory: "是否申请寝室",
      status: "状态",
      passportNo: "护照号",
      gender: "性别",
      nationality: "国籍",
      birth: "出生日期",
      tel: "电话",
      email: "邮箱",
      address: "地址",
      edu1School: "学历1_毕业院校",
      edu1Location: "学历1_所在地",
      edu1Start: "学历1_入学时间",
      edu1End: "学历1_毕业时间",
      edu2School: "学历2_毕业院校",
      edu2Location: "学历2_所在地",
      edu2Start: "学历2_入学时间",
      edu2End: "学历2_毕业时间",
      edu3School: "学历3_毕业院校",
      edu3Location: "学历3_所在地",
      edu3Start: "学历3_入学时间",
      edu3End: "学历3_毕业时间",
      languageLevel: "语言等级",
      bankSubmitted: "存款证明是否提交",
      studentFormStatus: "学生填写状态",
            createdAt: "创建时间",
      updatedAt: "更新时间",
      publicId: "public_id",
      applicationCategory: "申请项目类型",
      monthSeason: "月份/季节",
      degreeLevel: "学位课程",

    },
    exportValues: {
      freshman: "新入",
      transfer: "插班",
      dual: "双学位",
      year2: "2年级",
      year3: "3年级",
      year4: "4年级",
      korean: "韩语课程",
      english: "英语课程",
            bilingual: "双语课程",
      koreanLanguageProgram: "韩语语言班",
      englishLanguageProgram: "英语语言班",
      undergraduate: "本科",
      languageProgram: "语言班",
      graduateSchool: "大学院",
      spring: "春季",
      summer: "夏季",
      fall: "秋季",
      winter: "冬季",
      master: "硕士",
      doctor: "博士",
      transfer2Semester: "插班第二学期",
      transfer3Semester: "插班第三学期",
      exempt: "免提交",
      yes: "是",
      no: "否",

    },
    loadErrorDefault: "历史申请加载失败，请检查 Supabase 数据。",
  },
  en: {
    sidebar: {
      title: "Application History",
      desc: "View current and historical applications by year, month, and intake",
      all: "All Applications",
      loading: "Loading intakes...",
      empty: "No available intakes",
      yearSuffix: "",
      monthSuffix: "",
    },
    header: {
      allTitle: "All Applications",
      allDesc: "Display applications from all ongoing and closed intakes",
      yearTitle: (year) => `${year} Applications`,
      yearDesc: (year) => `Show all ongoing and closed intake applications in ${year}`,
      monthTitle: (year, month) => `${year}-${month} Applications`,
      monthDesc: (year, month) =>
        `Show all ongoing and closed intake applications in ${year}-${month}`,
      intakeDesc: (label) => `Show only application records for ${label}`,
    },
        search: {
      label: "Student / Agency / Major",
      placeholder: "Search by name, agency, or major",
      export: "Export Excel",
      exportApplication: "Export Application Info",
      exportRefund: "Export Refund Info",
      refundSheetName: "Refund Info",
      refundFilePrefix: "Admin_Refund_Info",
      noExportData: "There is no application data to export.",
      exportFailed: "Export failed: ",
      sheetName: "History",
      filePrefix: "Admin_History",
      fileAll: "All",
      fileSingle: "SingleIntake",
    },

    table: {
      title: "Application Details",
      desc: "Admins can continue to the review page to review and update status",
      loading: "Loading applications...",
      empty: "No application records under current conditions",
      index: "No.",
      studentName: "Student Name",
      agency: "Agency",
      year: "Year",
      intake: "Intake",
      applicationForm: "Application Form",
      passport: "Passport",
      transcript: "Transcript",
      diploma: "Diploma",
      languageCertificate: "Language Certificate",
      arc: "ARC",
      bankStatement: "Bank Statement",
      guarantorIncome: "Guarantor Income Proof",
      overall: "Overall Status",
      applicationStatus: "Application Status",
      applicationReviewNote: "Application Review Note",
      actions: "Actions",
      review: "Continue Review",
      missingPublicId: "Missing public_id",
      noNote: "—",
      materialReviewNotePrefix: "Review Note: ",
    },
    status: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    material: {
      systemGenerated: "Generated",
      exempt: "Exempt",
      optional: "Optional",
      uploaded: "Uploaded",
      missing: "Missing",
      needSupplement: "Need More",
      approved: "Approved",
      needMore: "Need Supplement",
      pendingConfirm: "Pending Confirmation",
      complete: "Complete",
    },
    intake: {
      roundPrefix: "Round ",
      roundSuffix: "",
      yearSuffix: "-",
      monthSuffix: "",
    },
    exportHeaders: {
      index: "No.",
      studentName: "Student Name",
      fatherName: "Father Name",
      motherName: "Mother Name",
      agency: "Agency",
      intake: "Intake",
      major: "Major",
      admissionType: "Admission Type",
      admissionGrade: "Admission Grade",
      programTrack: "Program Language",
      dormitory: "Dormitory",
      status: "Status",
      passportNo: "Passport No.",
      gender: "Gender",
      nationality: "Nationality",
      birth: "Date of Birth",
      tel: "Phone",
      email: "Email",
      address: "Address",
      edu1School: "Education1_School",
      edu1Location: "Education1_Location",
      edu1Start: "Education1_Start",
      edu1End: "Education1_End",
      edu2School: "Education2_School",
      edu2Location: "Education2_Location",
      edu2Start: "Education2_Start",
      edu2End: "Education2_End",
      edu3School: "Education3_School",
      edu3Location: "Education3_Location",
      edu3Start: "Education3_Start",
      edu3End: "Education3_End",
      languageLevel: "Language Level",
      bankSubmitted: "Bank Statement Submitted",
      studentFormStatus: "Student Form Status",
            createdAt: "Created At",
      updatedAt: "Updated At",
      publicId: "public_id",
      applicationCategory: "Application Category",
      monthSeason: "Month/Season",
      degreeLevel: "Degree Level",

    },
    exportValues: {
      freshman: "Freshman",
      transfer: "Transfer",
      dual: "Dual Degree",
      year2: "Year 2",
      year3: "Year 3",
      year4: "Year 4",
      korean: "Korean Track",
      english: "English Track",
            bilingual: "Bilingual Program",
      koreanLanguageProgram: "Korean Language Program",
      englishLanguageProgram: "English Language Program",
      undergraduate: "Undergraduate",
      languageProgram: "Language Program",
      graduateSchool: "Graduate School",
      spring: "Spring",
      summer: "Summer",
      fall: "Fall",
      winter: "Winter",
      master: "Master",
      doctor: "Doctor",
      transfer2Semester: "Transfer (2nd Semester)",
      transfer3Semester: "Transfer (3rd Semester)",
      exempt: "Exempt",
      yes: "Yes",
      no: "No",

    },
    loadErrorDefault: "Failed to load application history. Please check Supabase data.",
  },
  ko: {
    sidebar: {
      title: "지원 이력",
      desc: "연도, 월, 차수별로 현재 및 과거 지원을 조회합니다",
      all: "전체 지원",
      loading: "차수를 불러오는 중...",
      empty: "조회 가능한 차수가 없습니다",
      yearSuffix: "년",
      monthSuffix: "월",
    },
    header: {
      allTitle: "전체 지원",
      allDesc: "현재 진행 중이거나 마감된 모든 차수의 지원을 표시합니다",
      yearTitle: (year) => `${year}년 지원`,
      yearDesc: (year) => `${year}년의 현재 진행 중 및 마감된 모든 차수 지원을 표시합니다`,
      monthTitle: (year, month) => `${year}년 ${month}월 지원`,
      monthDesc: (year, month) =>
        `${year}년 ${month}월의 현재 진행 중 및 마감된 모든 차수 지원을 표시합니다`,
      intakeDesc: (label) => `${label}의 지원 기록만 표시합니다`,
    },
        search: {
      label: "학생 / 기관 / 전공",
      placeholder: "이름, 기관 또는 전공으로 검색",
      export: "Excel 내보내기",
      exportApplication: "지원정보 내보내기",
      exportRefund: "환불정보 내보내기",
      refundSheetName: "환불정보",
      refundFilePrefix: "관리자_환불정보",
      noExportData: "내보낼 지원 데이터가 없습니다.",
      exportFailed: "내보내기 실패: ",
      sheetName: "지원이력",
      filePrefix: "관리자_지원이력",
      fileAll: "전체",
      fileSingle: "단일차수",
    },

    table: {
      title: "지원 상세",
      desc: "관리자는 심사 페이지로 이동해 상태를 검토하고 수정할 수 있습니다",
      loading: "지원을 불러오는 중...",
      empty: "현재 조건에 맞는 지원 기록이 없습니다",
      index: "번호",
      studentName: "학생 이름",
      agency: "기관",
      year: "연도",
      intake: "차수",
      applicationForm: "지원서",
      passport: "여권",
      transcript: "성적증명서",
      diploma: "졸업증명서",
      languageCertificate: "어학증명",
      arc: "외국인등록증",
      bankStatement: "잔고증명",
      guarantorIncome: "보증인 소득증명",
      overall: "종합 상태",
      applicationStatus: "지원 상태",
      applicationReviewNote: "지원 심사 메모",
      actions: "작업",
      review: "계속 심사",
      missingPublicId: "public_id 없음",
      noNote: "—",
      materialReviewNotePrefix: "심사 메모: ",
    },
    status: {
      draft: "초안",
      submitted: "제출 완료",
      under_review: "심사 중",
      missing_documents: "서류 부족",
      approved: "승인",
      rejected: "거절",
    },
    material: {
      systemGenerated: "시스템 생성",
      exempt: "면제",
      optional: "선택 제출",
      uploaded: "업로드됨",
      missing: "누락",
      needSupplement: "보완 필요",
      approved: "승인",
      needMore: "보완 필요",
      pendingConfirm: "확인 대기",
      complete: "서류 완비",
    },
    intake: {
      roundPrefix: "",
      roundSuffix: "차",
      yearSuffix: "년",
      monthSuffix: "월",
    },
    exportHeaders: {
      index: "번호",
      studentName: "학생 이름",
      fatherName: "부친 이름",
      motherName: "모친 이름",
      agency: "기관",
      intake: "차수",
      major: "전공",
      admissionType: "지원 유형",
      admissionGrade: "지원 학년",
      programTrack: "과정 언어",
      dormitory: "기숙사 신청",
      status: "상태",
      passportNo: "여권번호",
      gender: "성별",
      nationality: "국적",
      birth: "생년월일",
      tel: "전화",
      email: "이메일",
      address: "주소",
      edu1School: "학력1_학교",
      edu1Location: "학력1_지역",
      edu1Start: "학력1_입학",
      edu1End: "학력1_졸업",
      edu2School: "학력2_학교",
      edu2Location: "학력2_지역",
      edu2Start: "학력2_입학",
      edu2End: "학력2_졸업",
      edu3School: "학력3_학교",
      edu3Location: "학력3_지역",
      edu3Start: "학력3_입학",
      edu3End: "학력3_졸업",
      languageLevel: "어학 수준",
      bankSubmitted: "잔고증명 제출 여부",
      studentFormStatus: "학생 작성 상태",
            createdAt: "생성일",
      updatedAt: "수정일",
      publicId: "public_id",
      applicationCategory: "지원 과정 유형",
      monthSeason: "월/계절",
      degreeLevel: "학위 과정",

    },
    exportValues: {
      freshman: "신입",
      transfer: "편입",
      dual: "복수학위",
      year2: "2학년",
      year3: "3학년",
      year4: "4학년",
      korean: "한국어 과정",
      english: "영어 과정",
            bilingual: "이중언어 과정",
      koreanLanguageProgram: "한국어 어학연수",
      englishLanguageProgram: "영어 어학연수",
      undergraduate: "학부",
      languageProgram: "어학연수",
      graduateSchool: "대학원",
      spring: "봄학기",
      summer: "여름학기",
      fall: "가을학기",
      winter: "겨울학기",
      master: "석사",
      doctor: "박사",
      transfer2Semester: "2학기 편입",
      transfer3Semester: "3학기 편입",
      exempt: "면제",
      yes: "예",
      no: "아니오",

    },
    loadErrorDefault: "지원 이력을 불러오지 못했습니다. Supabase 데이터를 확인하세요.",
  },
};

function StatusBadge({ children, type = "default" }) {
  const classes = {
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[type]}`}
    >
      {children}
    </span>
  );
}

function TreeButton({ active, children, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full rounded-xl px-3 py-2 text-left text-sm transition",
        active
          ? "bg-blue-50 font-semibold text-blue-700"
          : "text-slate-700 hover:bg-slate-100",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function EllipsisText({
  text,
  widthClass = "max-w-[160px]",
  className = "",
}) {
  const value = text || "-";

  return (
    <div
      title={value}
      className={[widthClass, "truncate whitespace-nowrap", className].join(" ")}
    >
      {value}
    </div>
  );
}

function AdminHistoryPage() {
  const adminContext = useAdminSession();
  const adminSession = adminContext?.session || null;
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [applications, setApplications] = useState([]);
  const [historyIntakes, setHistoryIntakes] = useState([]);
  const [applicationFiles, setApplicationFiles] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedYears, setExpandedYears] = useState({});
const [expandedTypes, setExpandedTypes] = useState({});
const [expandedMonths, setExpandedMonths] = useState({});
const [selectedNode, setSelectedNode] = useState({ type: "all" });


  function getStudentName(student) {
    return (
      student.english_name ||
      student.full_name_passport ||
      student.fullNamePassport ||
      "-"
    );
  }

  function getStatus(student) {
    return student.status || "draft";
  }

  function formatStatusLabel(status) {
    const s = String(status || "").toLowerCase();
    return t.status[s] || status || "-";
  }

  function mapStatusType(status) {
    const s = String(status || "").toLowerCase();

    if (s === "missing_documents" || s === "rejected") return "danger";
    if (s === "approved") return "success";
    if (s === "submitted" || s === "under_review") return "warning";
    return "default";
  }

  function getIntakeLabel(item) {
    if (!item) return "-";

    if (item.intake_name && String(item.intake_name).trim() !== "") {
      return item.intake_name;
    }

    if (item.title && String(item.title).trim() !== "") {
      return item.title;
    }

    if (item.intake_title && String(item.intake_title).trim() !== "") {
      return item.intake_title;
    }

    const year = item.year || item.intake_year || "";
    const month = item.intake_month || "";
    const round = item.round_number || item.intake_round_number || "";

    if (year && month && round) {
      if (language === "en") {
        return `${year}-${month} ${t.intake.roundPrefix}${round}`;
      }

      if (language === "ko") {
        return `${year}${t.intake.yearSuffix}${month}${t.intake.monthSuffix} ${round}${t.intake.roundSuffix}`;
      }

      return `${year}${t.intake.yearSuffix}${month}${t.intake.monthSuffix} ${t.intake.roundPrefix}${round}${t.intake.roundSuffix}`;
    }

    return item.intake_id || "-";
  }

  function normalizeIntakeMonth(value) {
    if (value === undefined || value === null || value === "") return "-";
    const month = Number(value);
    return Number.isNaN(month) ? String(value) : String(month);
  }

  function getIntakeYear(item) {
    if (item.intake_year) return String(item.intake_year);
    if (item.year) return String(item.year);

    const label = getIntakeLabel(item);
    const matched = String(label).match(/(\d{4})\s*(?:-|年|년)/);
    return matched ? matched[1] : "-";
  }

  function getIntakeMonth(item) {
    if (item.intake_month) return normalizeIntakeMonth(item.intake_month);

    const label = getIntakeLabel(item);
    const matched = String(label).match(/\d{4}\s*(?:-|年|년)\s*(\d{1,2})\s*(?:月|월)?/);
    return matched ? normalizeIntakeMonth(matched[1]) : "-";
  }

    function formatDate(value) {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const locale =
      language === "ko" ? "ko-KR" : language === "en" ? "en-US" : "zh-CN";

    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  function sanitizeExportFileSegment(value, fallback = "export") {
    const cleaned = String(value || "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "")
      .replace(/-+/g, "-")
      .replace(/^[-_.]+|[-_.]+$/g, "");

    return cleaned || fallback;
  }

  function getApplicationType(item) {
  return item?.application_type || "undergraduate";
}

function getApplicationTypeLabel(item) {
  const type = getApplicationType(item);

  if (language === "en") {
    if (type === "language") return "Language Program";
    if (type === "graduate") return "Graduate School";
    return "Undergraduate";
  }

  if (language === "ko") {
    if (type === "language") return "어학연수";
    if (type === "graduate") return "대학원";
    return "학부";
  }

  if (type === "language") return "语言班";
  if (type === "graduate") return "大学院";
  return "本科";
}

function getMonthDisplay(itemOrMonth, applicationType) {
  const rawMonth =
    typeof itemOrMonth === "object" && itemOrMonth !== null
      ? getIntakeMonth(itemOrMonth)
      : normalizeIntakeMonth(itemOrMonth);

  const type =
    typeof itemOrMonth === "object" && itemOrMonth !== null
      ? getApplicationType(itemOrMonth)
      : applicationType || "undergraduate";

  if (type === "language") {
    const seasonMapZh = { "3": "春季", "6": "夏季", "9": "秋季", "12": "冬季" };
    const seasonMapEn = { "3": "Spring", "6": "Summer", "9": "Fall", "12": "Winter" };
    const seasonMapKo = { "3": "봄학기", "6": "여름학기", "9": "가을학기", "12": "겨울학기" };

    if (language === "en") return seasonMapEn[rawMonth] || rawMonth;
    if (language === "ko") return seasonMapKo[rawMonth] || rawMonth;
    return seasonMapZh[rawMonth] || rawMonth;
  }

  if (language === "en") return rawMonth;
  return `${rawMonth}${t.sidebar.monthSuffix}`;
}


  function getFileTypeMap(files) {
    return (files || []).reduce((acc, file) => {
      if (!acc[file.public_id]) acc[file.public_id] = {};
      if (!acc[file.public_id][file.file_type]) acc[file.public_id][file.file_type] = [];
      acc[file.public_id][file.file_type].push(file);
      return acc;
    }, {});
  }

  function getMaterialStatus(fileEntry, required, systemGenerated = false, exempt = false) {
    if (systemGenerated) {
      return { label: t.material.systemGenerated, type: "success", note: "" };
    }

    if (exempt) {
      return { label: t.material.exempt, type: "default", note: "" };
    }

    const hasFile = !!fileEntry;

    if (!required) {
      if (!hasFile) {
        return { label: t.material.optional, type: "default", note: "" };
      }

      const reviewStatus = String(fileEntry.review_status || "").toLowerCase();
      if (reviewStatus === "missing_documents") {
        return {
          label: t.material.needSupplement,
          type: "danger",
          note: fileEntry.review_note || "",
        };
      }

      if (reviewStatus === "approved") {
        return {
          label: t.material.approved,
          type: "success",
          note: fileEntry.review_note || "",
        };
      }

      return {
        label: t.material.uploaded,
        type: "success",
        note: fileEntry.review_note || "",
      };
    }

    if (!hasFile) {
      return { label: t.material.missing, type: "danger", note: "" };
    }

    const reviewStatus = String(fileEntry.review_status || "").toLowerCase();

    if (reviewStatus === "missing_documents") {
      return {
        label: t.material.needSupplement,
        type: "danger",
        note: fileEntry.review_note || "",
      };
    }

    if (reviewStatus === "approved") {
      return {
        label: t.material.approved,
        type: "success",
        note: fileEntry.review_note || "",
      };
    }

    return {
      label: t.material.uploaded,
      type: "success",
      note: fileEntry.review_note || "",
    };
  }

  function getOverallStatus(statuses) {
    const requiredStatuses = statuses.filter((item) => !item.exempt && !item.systemGenerated);

    const hasMissingRequired = requiredStatuses.some(
      (item) => item.required && item.label === t.material.missing
    );

    if (hasMissingRequired) {
      return { label: t.material.needMore, type: "danger" };
    }

    const hasPendingOptional = requiredStatuses.some(
      (item) =>
        !item.required &&
        item.label !== t.material.uploaded &&
        item.label !== t.material.optional
    );

    if (hasPendingOptional) {
      return { label: t.material.pendingConfirm, type: "warning" };
    }

    return { label: t.material.complete, type: "success" };
  }

  useEffect(() => {
    async function loadData() {
      if (!adminSession?.admin_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const nowIso = new Date().toISOString();

        const [
          { data: intakesData, error: intakesError },
          { data: applicationsData, error: applicationsError },
          filesResponse,
          agenciesResponse,
        ] = await Promise.all([
                    supabase
            .from("intakes")
            .select("*")
            .lte("open_at", nowIso)
            .order("open_at", { ascending: false }),
          supabase
            .from("applications")
            .select("*")
            .order("updated_at", { ascending: false }),
          supabase
            .from("application_files")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("agencies")
            .select("id, agency_name")
            .order("agency_name", { ascending: true }),
        ]);

        if (intakesError) throw intakesError;
        if (applicationsError) throw applicationsError;
        if (filesResponse.error) throw filesResponse.error;
        if (agenciesResponse.error) throw agenciesResponse.error;

        const availableIntakes = intakesData || [];

        setHistoryIntakes(availableIntakes);
        setApplications(applicationsData || []);
        setApplicationFiles(filesResponse.data || []);
        setAgencies(agenciesResponse.data || []);

        const initialExpandedYears = {};
const initialExpandedTypes = {};
const initialExpandedMonths = {};

availableIntakes.forEach((item) => {
  const year = getIntakeYear(item);
  const applicationType = getApplicationType(item);
  const month = getIntakeMonth(item);
  initialExpandedYears[year] = true;
  initialExpandedTypes[`${year}-${applicationType}`] = true;
  initialExpandedMonths[`${year}-${applicationType}-${month}`] = true;
});

setExpandedYears(initialExpandedYears);
setExpandedTypes(initialExpandedTypes);
setExpandedMonths(initialExpandedMonths);


        setExpandedYears(initialExpandedYears);
        setExpandedMonths(initialExpandedMonths);
      } catch (error) {
        console.error("AdminHistoryPage loadData error:", error);
        setLoadError(error.message || t.loadErrorDefault);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [adminSession?.admin_id, language]);

  const agencyMap = useMemo(() => {
    return (agencies || []).reduce((acc, agency) => {
      acc[agency.id] = agency.agency_name;
      return acc;
    }, {});
  }, [agencies]);

  const historyIntakeIds = useMemo(() => {
    return new Set((historyIntakes || []).map((item) => item.id));
  }, [historyIntakes]);

  const historyIntakeLabels = useMemo(() => {
  return new Set((historyIntakes || []).map((item) => getIntakeLabel(item)));
}, [historyIntakes, language]);

const intakeMap = useMemo(() => {
  return (historyIntakes || []).reduce((acc, intake) => {
    acc[intake.id] = intake;
    return acc;
  }, {});
}, [historyIntakes]);

const historicalApplications = useMemo(() => {
  return applications.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status !== "draft";
  });
}, [applications]);

  const fileMap = useMemo(() => getFileTypeMap(applicationFiles), [applicationFiles]);

  const intakeTree = useMemo(() => {
  const grouped = {};

  historyIntakes.forEach((intake) => {
    const year = getIntakeYear(intake);
    const applicationType = getApplicationType(intake);
    const month = getIntakeMonth(intake);

    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][applicationType]) grouped[year][applicationType] = {};
    if (!grouped[year][applicationType][month]) grouped[year][applicationType][month] = [];

    grouped[year][applicationType][month].push(intake);
  });

  const typeOrder = ["undergraduate", "language", "graduate"];
  const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));

  return years.map((year) => ({
    year,
    types: Object.keys(grouped[year])
      .sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
      .map((applicationType) => ({
        applicationType,
        label: getApplicationTypeLabel({ application_type: applicationType }),
        months: Object.keys(grouped[year][applicationType])
          .sort((a, b) => Number(a) - Number(b))
          .map((month) => ({
            month,
            label: getMonthDisplay(month, applicationType),
            intakes: grouped[year][applicationType][month].sort((a, b) => {
              const aOpen = a.open_at ? new Date(a.open_at).getTime() : 0;
              const bOpen = b.open_at ? new Date(b.open_at).getTime() : 0;
              return bOpen - aOpen;
            }),
          })),
      })),
  }));
}, [historyIntakes, language]);


  const filteredApplications = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return historicalApplications.filter((item) => {
      const studentName = getStudentName(item).toLowerCase();
      const agencyName = String(
        item.agency_name || agencyMap[item.agency_id] || item.agency_id || ""
      ).toLowerCase();
      const major = String(item.major || "").toLowerCase();

      const matchesKeyword =
        !keyword ||
        studentName.includes(keyword) ||
        agencyName.includes(keyword) ||
        major.includes(keyword);

      let matchesTree = true;

if (selectedNode.type === "year") {
  matchesTree = getIntakeYear(item) === selectedNode.year;
} else if (selectedNode.type === "applicationType") {
  matchesTree =
    getIntakeYear(item) === selectedNode.year &&
    getApplicationType(item) === selectedNode.applicationType;
} else if (selectedNode.type === "month") {
  matchesTree =
    getIntakeYear(item) === selectedNode.year &&
    getApplicationType(item) === selectedNode.applicationType &&
    getIntakeMonth(item) === selectedNode.month;
} else if (selectedNode.type === "intake") {
  if (selectedNode.intakeId && item.intake_id) {
    matchesTree = item.intake_id === selectedNode.intakeId;
  } else {
    matchesTree =
      getIntakeYear(item) === selectedNode.year &&
      getApplicationType(item) === selectedNode.applicationType &&
      getIntakeMonth(item) === selectedNode.month &&
      getIntakeLabel(item) === selectedNode.intakeLabel;
  }
}

      return matchesKeyword && matchesTree;
    });
  }, [historicalApplications, searchKeyword, selectedNode, agencyMap, language]);

  const rows = useMemo(() => {
  return filteredApplications.map((student) => {
    const publicId = student.public_id;
    const files = fileMap[publicId] || {};
    const linkedIntake = student.intake_id ? intakeMap[student.intake_id] : null;

      const passportFile = files.passport?.[0] || null;
      const finalTranscriptFile = files.finalTranscript?.[0] || null;
      const finalDiplomaFile = files.finalDiploma?.[0] || null;
      const languageCertificateFile = files.languageCertificate?.[0] || null;
      const arcFile = files.arc?.[0] || null;
      const bankStatementFile = files.bankStatement?.[0] || null;
      const guarantorEmploymentIncomeFile =
        files.guarantorEmploymentIncome?.[0] || null;

      const bilingualTrack = student.program_track === "Bilingual Program (Chinese)";
      const inKorea = student.residence_status === "korea";
      const financialGuaranteeRequired =
        student.bank_certificate_holder_type === "guarantor";

      const applicationForm = getMaterialStatus(null, true, true, false);
      const passport = getMaterialStatus(passportFile, true, false, false);
      const finalTranscript = getMaterialStatus(finalTranscriptFile, true, false, false);
      const finalDiploma = getMaterialStatus(finalDiplomaFile, true, false, false);
      const languageCertificate = getMaterialStatus(
        languageCertificateFile,
        !bilingualTrack,
        false,
        bilingualTrack
      );
      const arc = getMaterialStatus(arcFile, inKorea, false, !inKorea);
      const bankStatement = getMaterialStatus(bankStatementFile, true, false, false);
      const guarantorEmploymentIncome = getMaterialStatus(
        guarantorEmploymentIncomeFile,
        financialGuaranteeRequired,
        false,
        !financialGuaranteeRequired
      );

      const overall = getOverallStatus([
        { ...passport, required: true },
        { ...finalTranscript, required: true },
        { ...finalDiploma, required: true },
        { ...languageCertificate, required: !bilingualTrack, exempt: bilingualTrack },
        { ...arc, required: inKorea, exempt: !inKorea },
        { ...bankStatement, required: true },
        {
          ...guarantorEmploymentIncome,
          required: financialGuaranteeRequired,
          exempt: !financialGuaranteeRequired,
        },
      ]);

      return {
  student,
  publicId,
  studentName: getStudentName(student),
  agencyName: student.agency_name || agencyMap[student.agency_id] || student.agency_id || "-",
  year: getIntakeYear(linkedIntake || student),
  intake: getIntakeLabel(linkedIntake || student),
  applicationReviewNote: student.review_note || "",

        applicationForm,
        passport,
        finalTranscript,
        finalDiploma,
        languageCertificate,
        arc,
        bankStatement,
        guarantorEmploymentIncome,
        overall,
      };
    });
  }, [filteredApplications, fileMap, agencyMap, language]);

  const headerTitle = useMemo(() => {
  if (selectedNode.type === "year") {
    return t.header.yearTitle(selectedNode.year);
  }
  if (selectedNode.type === "applicationType") {
    return `${selectedNode.year} / ${selectedNode.applicationTypeLabel}`;
  }
  if (selectedNode.type === "month") {
    return `${selectedNode.year} / ${selectedNode.applicationTypeLabel} / ${selectedNode.monthLabel}`;
  }
  if (selectedNode.type === "intake") {
    return `${selectedNode.year} / ${selectedNode.applicationTypeLabel} / ${selectedNode.monthLabel} / ${selectedNode.intakeLabel}`;
  }
  return t.header.allTitle;
}, [selectedNode, t]);

  const headerDesc = useMemo(() => {
  const recordText =
    language === "en"
      ? `${filteredApplications.length} applications`
      : language === "ko"
      ? `총 ${filteredApplications.length}건`
      : `共 ${filteredApplications.length} 条申请`;

  if (selectedNode.type === "intake") {
    return `${selectedNode.applicationTypeLabel} / ${selectedNode.monthLabel} / ${recordText}`;
  }
  if (selectedNode.type === "month") {
    return `${selectedNode.applicationTypeLabel} / ${selectedNode.monthLabel} / ${recordText}`;
  }
  if (selectedNode.type === "applicationType") {
    return `${selectedNode.applicationTypeLabel} / ${recordText}`;
  }
  if (selectedNode.type === "year") {
    return t.header.yearDesc(selectedNode.year);
  }
  return t.header.allDesc;
}, [selectedNode, t, language, filteredApplications.length]);

  const toggleYear = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  const toggleType = (year, applicationType) => {
  const key = `${year}-${applicationType}`;
  setExpandedTypes((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};

const toggleMonth = (year, applicationType, month) => {
  const key = `${year}-${applicationType}-${month}`;
  setExpandedMonths((prev) => ({
    ...prev,
    [key]: !prev[key],
  }));
};


  const handleExportExcel = async () => {
    try {
      if (!filteredApplications || filteredApplications.length === 0) {
        alert(t.search.noExportData);
        return;
      }

      const publicIds = filteredApplications
        .map((student) => student.public_id)
        .filter(Boolean);

      let fileRows = [];

      if (publicIds.length > 0) {
        const { data, error } = await supabase
          .from("application_files")
          .select("public_id, file_type, file_name")
          .in("public_id", publicIds);

        if (error) throw error;
        fileRows = data || [];
      }

      const exportFileMap = fileRows.reduce((acc, file) => {
        if (!acc[file.public_id]) {
          acc[file.public_id] = {};
        }
        if (!acc[file.public_id][file.file_type]) {
          acc[file.public_id][file.file_type] = [];
        }
        acc[file.public_id][file.file_type].push(file);
        return acc;
      }, {});

      const parseEducationRow = (rowText) => {
        if (!rowText || String(rowText).trim() === "") {
          return {
            startDate: "",
            endDate: "",
            institution: "",
            location: "",
          };
        }

        const parts = String(rowText).split("|").map((part) => part.trim());
        const datePart = parts[0] || "";
        const datePieces = datePart.split("~").map((part) => part.trim());

        return {
          startDate: datePieces[0] || "",
          endDate: datePieces[1] || "",
          institution: parts[1] || "",
          location: parts[2] || "",
        };
      };

            const exportRows = filteredApplications.map((student, index) => {
        const linkedIntake = student.intake_id ? intakeMap[student.intake_id] : null;
        const nodeSource = linkedIntake || student;
        const applicationType = getApplicationType(nodeSource);
        const admissionType = String(student.admission_type || "").trim();


        let admissionTypeText = "";
        let admissionGradeText = "";

                const applicationCategoryText =
                    applicationType === "language"
            ? t.exportValues.languageProgram
            : applicationType === "graduate"
            ? t.exportValues.graduateSchool
            : t.exportValues.undergraduate;

        const monthSeasonText =
          applicationType === "language"
            ? getIntakeMonth(nodeSource) === "3"
              ? t.exportValues.spring
              : getIntakeMonth(nodeSource) === "6"
              ? t.exportValues.summer
              : getIntakeMonth(nodeSource) === "9"
              ? t.exportValues.fall
              : getIntakeMonth(nodeSource) === "12"
              ? t.exportValues.winter
              : getIntakeMonth(nodeSource)
            : `${getIntakeMonth(nodeSource)}${language === "en" ? "" : t.sidebar.monthSuffix}`;

        const degreeLevelText =
          student.degree_level === "master"
            ? t.exportValues.master
            : student.degree_level === "doctor"
            ? t.exportValues.doctor
            : "";

                if (admissionType === "Freshman") {
          admissionTypeText = t.exportValues.freshman;
        } else if (admissionType === "Transfer (2nd Semester)") {
          admissionTypeText = t.exportValues.transfer2Semester;
        } else if (admissionType === "Transfer (3rd Semester)") {
          admissionTypeText = t.exportValues.transfer3Semester;
        } else if (admissionType.includes("Transfer")) {
          admissionTypeText = t.exportValues.transfer;
          if (admissionType.includes("2nd Year")) admissionGradeText = t.exportValues.year2;
          if (admissionType.includes("3rd Year")) admissionGradeText = t.exportValues.year3;
          if (admissionType.includes("4th Year")) admissionGradeText = t.exportValues.year4;
        } else if (admissionType === "Dual Degree (2+2)") {
          admissionTypeText = t.exportValues.dual;
          admissionGradeText = t.exportValues.year3;
        } else if (admissionType === "Dual Degree (3+1)") {
          admissionTypeText = t.exportValues.dual;
          admissionGradeText = t.exportValues.year4;
        } else {
          admissionTypeText = admissionType;
        }

                const programTrack =
          student.program_track === "Korean Track"
            ? t.exportValues.korean
            : student.program_track === "English Track"
            ? t.exportValues.english
            : student.program_track === "Bilingual Program (Chinese)"
            ? t.exportValues.bilingual
            : student.program_track === "Korean Language Program"
            ? t.exportValues.koreanLanguageProgram
            : student.program_track === "English Language Program"
            ? t.exportValues.englishLanguageProgram
            : student.program_track || "";

        const dormitory =
          String(student.dormitory || "").trim().toUpperCase() === "YES"
            ? t.exportValues.yes
            : String(student.dormitory || "").trim().toUpperCase() === "NO"
            ? t.exportValues.no
            : student.dormitory || "";

                const languageLevel =
          applicationType === "language" ||
          student.program_track === "Bilingual Program (Chinese)"
            ? t.exportValues.exempt
            : [
                student.topik ? `TOPIK ${student.topik}` : "",
                student.ska ? `SKA ${student.ska}` : "",
                student.kiip ? `KIIP ${student.kiip}` : "",
                student.ielts ? `IELTS ${student.ielts}` : "",
                student.toefl ? `TOEFL ${student.toefl}` : "",
                student.toefl_ibt ? `TOEFL iBT ${student.toefl_ibt}` : "",
                student.cefr ? `CEFR ${student.cefr}` : "",
                student.teps ? `TEPS ${student.teps}` : "",
                student.new_teps ? `NEW TEPS ${student.new_teps}` : "",
              ]
                .filter(Boolean)
                .join(" / ");

        const studentFiles = exportFileMap[student.public_id] || {};
        const hasBankStatement =
          Array.isArray(studentFiles.bankStatement) &&
          studentFiles.bankStatement.length > 0;

        const educationRows = [
          parseEducationRow(student.education1),
          parseEducationRow(student.education2),
          parseEducationRow(student.education3),
        ];

        const edu1 = educationRows[0];
        const edu2 = educationRows[1];
        const edu3 = educationRows[2];

                return {
          [t.exportHeaders.index]: index + 1,          
          [t.exportHeaders.agency]:
            student.agency_name ||
            agencyMap[student.agency_id] ||
            student.agency_id ||
            "-",
            [t.exportHeaders.applicationCategory]: applicationCategoryText,
          [t.exportHeaders.intake]: getIntakeLabel(nodeSource),
[t.exportHeaders.studentName]:
            student.english_name ||
            student.full_name_passport ||
            student.fullNamePassport ||
            student.name ||
            "-",          
          [t.exportHeaders.monthSeason]: monthSeasonText,
          [t.exportHeaders.degreeLevel]: degreeLevelText,
          [t.exportHeaders.major]: student.major || student.department || "-",
          [t.exportHeaders.admissionType]: admissionTypeText,
          [t.exportHeaders.admissionGrade]: admissionGradeText,
          [t.exportHeaders.programTrack]: programTrack,
          [t.exportHeaders.dormitory]: dormitory,
          [t.exportHeaders.status]: formatStatusLabel(student.status),
          [t.exportHeaders.passportNo]: student.passport_no || "",
          [t.exportHeaders.gender]: student.gender || "",
          [t.exportHeaders.nationality]:
            student.nationality_applicant || student.nationality || "",
          [t.exportHeaders.birth]: student.date_of_birth || "",
          [t.exportHeaders.tel]: student.tel || student.phone || "",
          [t.exportHeaders.email]: student.email || "",
          [t.exportHeaders.address]: student.address || "",
          [t.exportHeaders.edu1School]: edu1.institution,
          [t.exportHeaders.edu1Location]: edu1.location,
          [t.exportHeaders.edu1Start]: edu1.startDate,
          [t.exportHeaders.edu1End]: edu1.endDate,
          [t.exportHeaders.edu2School]: edu2.institution,
          [t.exportHeaders.edu2Location]: edu2.location,
          [t.exportHeaders.edu2Start]: edu2.startDate,
          [t.exportHeaders.edu2End]: edu2.endDate,
          [t.exportHeaders.edu3School]: edu3.institution,
          [t.exportHeaders.edu3Location]: edu3.location,
          [t.exportHeaders.edu3Start]: edu3.startDate,
          [t.exportHeaders.edu3End]: edu3.endDate,
          [t.exportHeaders.languageLevel]: languageLevel,
          [t.exportHeaders.bankSubmitted]: hasBankStatement ? "O" : "X",
          [t.exportHeaders.fatherName]:
            student.father_name ||
            student.father_full_name ||
            student.parent_father_name ||
            student.parent_father_full_name ||
            "",
          [t.exportHeaders.motherName]:
            student.mother_name ||
            student.mother_full_name ||
            student.parent_mother_name ||
            student.parent_mother_full_name ||
            "",
          [t.exportHeaders.studentFormStatus]: student.student_form_status || "",
          [t.exportHeaders.createdAt]: student.created_at || "",
          [t.exportHeaders.updatedAt]: student.updated_at || "",
          [t.exportHeaders.publicId]: student.public_id || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
        { wch: 22 },
        { wch: 18 },
        { wch: 14 },
        { wch: 12 },
        { wch: 14 },
        { wch: 14 },
        { wch: 12 },
        { wch: 18 },
        { wch: 10 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 28 },
        { wch: 36 },
        { wch: 26 },
        { wch: 20 },
        { wch: 14 },
        { wch: 14 },
        { wch: 26 },
        { wch: 20 },
        { wch: 14 },
        { wch: 14 },
        { wch: 26 },
        { wch: 20 },
        { wch: 14 },
        { wch: 14 },
                { wch: 28 },
        { wch: 14 },
        { wch: 16 },
        { wch: 22 },
        { wch: 16 },
        { wch: 14 },
        { wch: 14 },
      ];

            const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t.search.sheetName);

      const today = new Date();
      const dateText = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      let fileLabel = t.search.fileAll;

      if (selectedNode.type === "year") {
        fileLabel =
          language === "en"
            ? String(selectedNode.year)
            : `${selectedNode.year}${t.sidebar.yearSuffix}`;
      } else if (selectedNode.type === "applicationType") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}`;
      } else if (selectedNode.type === "month") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}_${selectedNode.monthLabel}`;
      } else if (selectedNode.type === "intake") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}_${selectedNode.monthLabel}_${selectedNode.intakeLabel}`;
      }

      const safePrefix = sanitizeExportFileSegment(
        t.search.filePrefix,
        "History"
      );
      const safeLabel = sanitizeExportFileSegment(fileLabel, "All");
      const safeDate = sanitizeExportFileSegment(dateText, "date");

      XLSX.writeFile(
        workbook,
        `${safePrefix}_${safeLabel}_${safeDate}.xlsx`
      );
    } catch (error) {
      console.error("handleExportExcel error:", error);
      alert(`${t.search.exportFailed}${error.message}`);
    }
  };

    const handleExportRefundExcel = async () => {
    try {
      if (!filteredApplications || filteredApplications.length === 0) {
        alert(t.search.noExportData);
        return;
      }

      const exportRows = filteredApplications.map((student, index) => {
        const linkedIntake = student.intake_id ? intakeMap[student.intake_id] : null;
        const nodeSource = linkedIntake || student;
        const applicationType = getApplicationType(nodeSource);

        const applicationCategoryText =
          applicationType === "language"
            ? "语言班"
            : applicationType === "graduate"
            ? "大学院"
            : "本科";

                return {
          序号: index + 1,
          机构:
            student.agency_name ||
            agencyMap[student.agency_id] ||
            student.agency_id ||
            "-",
          申请批次: getIntakeLabel(nodeSource),
                  申请项目类型: applicationCategoryText,
          学生姓名:
            student.english_name ||
            student.full_name_passport ||
            student.fullNamePassport ||
            student.name ||
            "-",          
          申请状态: formatStatusLabel(student.status),

          退款账户姓名: student.refund_name || student.refundName || "",
          退款账户出生日期: student.refund_dob || student.refundDob || "",
          退款账户邮箱: student.refund_email || student.refundEmail || "",
          账户持有人: student.account_holder || student.accountHolder || "",
          与申请人关系: student.relationship || student.relationshipWithApplicant || "",

          收款人国家:
            student.beneficiary_country || student.beneficiaryCountry || "",
          收款人城市:
            student.beneficiary_city || student.beneficiaryCity || "",
          收款人地址:
            student.beneficiary_address || student.beneficiaryAddress || "",

          银行名称: student.bank_name || student.bankName || "",
          银行国家: student.bank_country || student.bankCountry || "",
          银行城市: student.bank_city || student.bankCity || "",
          银行地址: student.bank_address || student.bankAddress || "",
          账号: student.account_number || student.accountNumber || "",
          SWIFT代码: student.swift_code || student.swiftCode || "",

          创建时间: student.created_at || "",
          更新时间: student.updated_at || "",
          public_id: student.public_id || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);

      worksheet["!cols"] = [
        { wch: 8 },
        { wch: 20 },
        { wch: 18 },
        { wch: 22 },
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
        { wch: 18 },
        { wch: 16 },
        { wch: 24 },
        { wch: 18 },
        { wch: 18 },
        { wch: 16 },
        { wch: 28 },
        { wch: 22 },
        { wch: 18 },
        { wch: 18 },
        { wch: 28 },
        { wch: 22 },
        { wch: 18 },
        { wch: 22 },
        { wch: 22 },
      ];

      const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, t.search.refundSheetName);

      const today = new Date();
      const dateText = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      let fileLabel = t.search.fileAll;

      if (selectedNode.type === "year") {
        fileLabel =
          language === "en"
            ? String(selectedNode.year)
            : `${selectedNode.year}${t.sidebar.yearSuffix}`;
      } else if (selectedNode.type === "applicationType") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}`;
      } else if (selectedNode.type === "month") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}_${selectedNode.monthLabel}`;
      } else if (selectedNode.type === "intake") {
        fileLabel = `${selectedNode.year}${
          language === "en" ? "" : t.sidebar.yearSuffix
        }_${selectedNode.applicationTypeLabel}_${selectedNode.monthLabel}_${selectedNode.intakeLabel}`;
      }

            const safePrefix = sanitizeExportFileSegment(
        t.search.refundFilePrefix,
        "Refund"
      );
      const safeLabel = sanitizeExportFileSegment(fileLabel, "All");
      const safeDate = sanitizeExportFileSegment(dateText, "date");

      XLSX.writeFile(
        workbook,
        `${safePrefix}_${safeLabel}_${safeDate}.xlsx`
      );
    } catch (error) {
      console.error("handleExportRefundExcel error:", error);
      alert(`${t.search.exportFailed}${error.message}`);
    }
  };

  return (
        <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.sidebar.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t.sidebar.desc}
            </p>
          </div>
        </div>

        <div className="mt-5">
          <TreeButton
            active={selectedNode.type === "all"}
            onClick={() => setSelectedNode({ type: "all" })}
          >
            {t.sidebar.all}
          </TreeButton>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-sm text-slate-500">{t.sidebar.loading}</div>
          ) : intakeTree.length === 0 ? (
            <div className="text-sm text-slate-500">{t.sidebar.empty}</div>
          ) : (
            intakeTree.map((yearItem) => (
              <div key={yearItem.year} className="rounded-2xl border border-slate-200 p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleYear(yearItem.year)}
                    className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    {expandedYears[yearItem.year] ? "−" : "+"}
                  </button>

                  <TreeButton
                    active={
                      selectedNode.type === "year" &&
                      selectedNode.year === yearItem.year
                    }
                    onClick={() =>
                      setSelectedNode({
                        type: "year",
                        year: yearItem.year,
                      })
                    }
                    className="px-2 py-1.5"
                  >
                    {language === "en"
                      ? yearItem.year
                      : `${yearItem.year}${t.sidebar.yearSuffix}`}
                  </TreeButton>
                </div>

                {expandedYears[yearItem.year] ? (
  <div className="mt-3 space-y-3 pl-4">
    {yearItem.types.map((typeItem) => {
      const typeKey = `${yearItem.year}-${typeItem.applicationType}`;

      return (
        <div key={typeKey}>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleType(yearItem.year, typeItem.applicationType)}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
            >
              {expandedTypes[typeKey] ? "-" : "+"}
            </button>

            <TreeButton
              active={
                selectedNode.type === "applicationType" &&
                selectedNode.year === yearItem.year &&
                selectedNode.applicationType === typeItem.applicationType
              }
              onClick={() =>
                setSelectedNode({
                  type: "applicationType",
                  year: yearItem.year,
                  applicationType: typeItem.applicationType,
                  applicationTypeLabel: typeItem.label,
                })
              }
              className="px-2 py-1.5 text-sm"
            >
              {typeItem.label}
            </TreeButton>
          </div>

          {expandedTypes[typeKey] ? (
            <div className="mt-2 space-y-3 pl-4">
              {typeItem.months.map((monthItem) => {
                const monthKey = `${yearItem.year}-${typeItem.applicationType}-${monthItem.month}`;

                return (
                  <div key={monthKey}>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleMonth(yearItem.year, typeItem.applicationType, monthItem.month)
                        }
                        className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md bg-slate-100 text-xs text-slate-700 hover:bg-slate-200"
                      >
                        {expandedMonths[monthKey] ? "-" : "+"}
                      </button>

                      <TreeButton
                        active={
                          selectedNode.type === "month" &&
                          selectedNode.year === yearItem.year &&
                          selectedNode.applicationType === typeItem.applicationType &&
                          selectedNode.month === monthItem.month
                        }
                        onClick={() =>
                          setSelectedNode({
                            type: "month",
                            year: yearItem.year,
                            applicationType: typeItem.applicationType,
                            applicationTypeLabel: typeItem.label,
                            month: monthItem.month,
                            monthLabel: monthItem.label,
                          })
                        }
                        className="px-2 py-1.5 text-sm"
                      >
                        {monthItem.label}
                      </TreeButton>
                    </div>

                    {expandedMonths[monthKey] ? (
                      <div className="mt-2 space-y-2 pl-4">
                        {monthItem.intakes.map((intake) => (
                          <button
                            key={intake.id}
                            type="button"
                            onClick={() =>
                              setSelectedNode({
                                type: "intake",
                                year: yearItem.year,
                                applicationType: typeItem.applicationType,
                                applicationTypeLabel: typeItem.label,
                                month: monthItem.month,
                                monthLabel: monthItem.label,
                                intakeId: intake.id,
                                intakeLabel: getIntakeLabel(intake),
                              })
                            }
                            className={[
                              "w-full cursor-pointer rounded-xl border px-3 py-3 text-left transition",
                              selectedNode.type === "intake" &&
                              selectedNode.intakeId === intake.id
                                ? "border-blue-300 bg-blue-50"
                                : "border-slate-200 hover:bg-slate-50",
                            ].join(" ")}
                          >
                            <div className="text-sm font-semibold text-slate-800">
                              {getIntakeLabel(intake)}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              {formatDate(intake.open_at)} ~ {formatDate(intake.close_at)}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    })}
  </div>
) : null}

              </div>
            ))
          )}
        </div>
      </div>

            <div className="min-w-0 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
  <h2 className="text-2xl font-bold text-slate-900">{headerTitle}</h2>
  <p className="mt-1 text-sm text-slate-500">{headerDesc}</p>

  <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
  <div>
    <span className="font-semibold text-slate-800">
      {language === "en" ? "Year:" : language === "ko" ? "연도:" : "年份："}
    </span>{" "}
    {selectedNode.year || "-"}
  </div>
  <div>
    <span className="font-semibold text-slate-800">
      {language === "en" ? "Type:" : language === "ko" ? "지원 유형:" : "申请类型："}
    </span>{" "}
    {selectedNode.applicationTypeLabel ||
      (language === "en" ? "All" : language === "ko" ? "전체" : "全部")}
  </div>
  <div>
    <span className="font-semibold text-slate-800">
      {language === "en"
        ? "Month/Season:"
        : language === "ko"
        ? "입학 월/계절:"
        : "月份/季节："}
    </span>{" "}
    {selectedNode.monthLabel ||
      (language === "en" ? "All" : language === "ko" ? "전체" : "全部")}
  </div>
  <div>
    <span className="font-semibold text-slate-800">
      {language === "en" ? "Intake:" : language === "ko" ? "차수:" : "批次："}
    </span>{" "}
    {selectedNode.intakeLabel ||
      (language === "en" ? "All" : language === "ko" ? "전체" : "全部")}
  </div>
</div>

</div>


            <div className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.search.label}
                </label>
                <input
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t.search.placeholder}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

                              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t.search.exportApplication}
                </button>

                <button
                  type="button"
                  onClick={handleExportRefundExcel}
                  className="inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  {t.search.exportRefund}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">{t.table.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t.table.desc}
            </p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.table.loading}
            </div>
          ) : loadError ? (
            <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.table.empty}
            </div>
                    ) : (
            <>
              <div className="px-6 pt-4 text-xs text-slate-400">
                {language === "en"
                  ? "This table is wide. Scroll horizontally to view all columns."
                  : language === "ko"
                  ? "이 표는 가로로 넓습니다. 모든 열을 보려면 좌우로 스크롤하세요."
                  : "表格较宽，可左右滑动查看全部列。"}
              </div>
              <div className="overflow-x-auto pb-2">
                <table className="min-w-[1900px] text-sm">
                  <thead className="bg-slate-50 text-center text-slate-500">

                  <tr>
                    <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.agency}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.year}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.intake}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.applicationForm}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.passport}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.transcript}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.diploma}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.languageCertificate}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.arc}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.bankStatement}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.guarantorIncome}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.overall}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.applicationStatus}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.applicationReviewNote}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const status = getStatus(row.student);

                    return (
                      <tr
                        key={row.student.id || row.publicId || index}
                        className="border-t border-slate-100 align-middle hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          <div className="mx-auto">
                            <EllipsisText text={row.studentName} widthClass="max-w-[110px]" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="mx-auto">
                            <EllipsisText text={row.agencyName} widthClass="max-w-[120px]" />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{row.year}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <div className="mx-auto">
                            <EllipsisText text={row.intake} widthClass="max-w-[130px]" />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.applicationForm.type}>
                            {row.applicationForm.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.passport.type}>
                              {row.passport.label}
                            </StatusBadge>
                            {row.passport.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.passport.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.finalTranscript.type}>
                              {row.finalTranscript.label}
                            </StatusBadge>
                            {row.finalTranscript.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.finalTranscript.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.finalDiploma.type}>
                              {row.finalDiploma.label}
                            </StatusBadge>
                            {row.finalDiploma.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.finalDiploma.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.languageCertificate.type}>
                              {row.languageCertificate.label}
                            </StatusBadge>
                            {row.languageCertificate.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.languageCertificate.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.arc.type}>
                              {row.arc.label}
                            </StatusBadge>
                            {row.arc.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.arc.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.bankStatement.type}>
                              {row.bankStatement.label}
                            </StatusBadge>
                            {row.bankStatement.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.bankStatement.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <StatusBadge type={row.guarantorEmploymentIncome.type}>
                              {row.guarantorEmploymentIncome.label}
                            </StatusBadge>
                            {row.guarantorEmploymentIncome.note ? (
                              <div className="max-w-[180px] text-xs leading-5 text-slate-500">
                                {t.table.materialReviewNotePrefix}{row.guarantorEmploymentIncome.note}
                              </div>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.overall.type}>
                            {row.overall.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={mapStatusType(status)}>
                            {formatStatusLabel(status)}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {row.applicationReviewNote ? (
                            <div className="mx-auto">
                              <EllipsisText
                                text={row.applicationReviewNote}
                                widthClass="max-w-[180px]"
                                className="text-xs"
                              />
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">{t.table.noNote}</span>
                          )}
                        </td>
                        <td className="px-4 py-4 align-middle text-center">
                          {row.publicId ? (
                            <Link
                              to={`/applications/${row.publicId}/review`}
                              className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              {t.table.review}
                            </Link>
                          ) : (
                            <span className="text-xs text-red-500">
                              {t.table.missingPublicId}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                                </tbody>
              </table>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminHistoryPage;