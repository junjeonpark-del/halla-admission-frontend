import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const messages = {
  zh: {
    sidebarTitle: "历届申请",
    sidebarDesc: "按年份、月份、批次查看当前与历史申请",
    back: "返回",
    allApplications: "全部申请",
    loadingIntakes: "正在加载历史批次...",
    noIntakes: "暂无可查询批次",
    page: {
      allTitle: "全部历史申请",
      allDesc: "显示所有当前进行中与已截止批次的申请",
      yearTitle: (year) => `${year} 年历史申请`,
      yearDesc: (year) => `仅显示 ${year} 年下所有当前进行中与已截止批次的申请`,
      monthTitle: (year, month) => `${year}年 ${month}月历史申请`,
      monthDesc: (year, month) =>
        `仅显示 ${year}年 ${month}月下所有当前进行中与已截止批次的申请`,
      intakeDesc: (label) => `仅显示 ${label} 的申请记录`,
    },
    searchLabel: "学生姓名搜索",
    searchPlaceholder: "输入姓名搜索",
    detailTitle: "历史申请明细",
    detailDesc: "历史申请保留继续编辑入口，不提供删除功能",
    loadingRows: "正在加载历史申请...",
    noRows: "当前条件下没有历史申请记录",
    loadError: "历史申请加载失败，请检查 Supabase 数据。",
    table: {
      index: "序号",
      studentName: "学生姓名",
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
      reviewNote: "申请审核备注",
      actions: "操作",
      noPublicId: "缺少 public_id",
      continueEdit: "继续编辑",
      supplementMaterials: "补充材料",
      cannotSupplement: "已截止不可补",
      noNote: "—",
    },
    statusLabels: {
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
      uploaded: "已上传",
      optional: "可不提交",
      missing: "缺失",
      needSupplement: "需补件",
      pendingConfirm: "待确认",
      complete: "材料齐全",
    },
    intakeRoundPrefix: "第",
    intakeRoundSuffix: "批",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  en: {
    sidebarTitle: "Application History",
    sidebarDesc: "Browse current and historical applications by year, month, and intake",
    back: "Back",
    allApplications: "All Applications",
    loadingIntakes: "Loading historical intakes...",
    noIntakes: "No available intakes",
    page: {
      allTitle: "All Historical Applications",
      allDesc: "Display applications from all ongoing and closed intakes",
      yearTitle: (year) => `${year} Historical Applications`,
      yearDesc: (year) =>
        `Display applications from all ongoing and closed intakes in ${year}`,
      monthTitle: (year, month) => `${year}-${month} Historical Applications`,
      monthDesc: (year, month) =>
        `Display applications from all ongoing and closed intakes in ${year}-${month}`,
      intakeDesc: (label) => `Display only applications from ${label}`,
    },
    searchLabel: "Search Student Name",
    searchPlaceholder: "Search by student name",
    detailTitle: "Historical Application Details",
    detailDesc: "Historical applications keep the edit entry, but deletion is not supported",
    loadingRows: "Loading historical applications...",
    noRows: "No historical application records under the current conditions",
    loadError: "Failed to load historical applications. Please check Supabase data.",
    table: {
      index: "No.",
      studentName: "Student Name",
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
      reviewNote: "Review Note",
      actions: "Actions",
      noPublicId: "Missing public_id",
      continueEdit: "Continue Editing",
      supplementMaterials: "Supplement Materials",
      cannotSupplement: "Closed, Cannot Supplement",
      noNote: "—",
    },
    statusLabels: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    material: {
      systemGenerated: "System Generated",
      exempt: "Exempt",
      uploaded: "Uploaded",
      optional: "Optional",
      missing: "Missing",
      needSupplement: "Need Supplement",
      pendingConfirm: "Pending Confirmation",
      complete: "Complete",
    },
    intakeRoundPrefix: "Round ",
    intakeRoundSuffix: "",
    yearSuffix: "-",
    monthSuffix: "",
  },
  ko: {
    sidebarTitle: "이력 지원서",
    sidebarDesc: "연도, 월, 차수별로 현재 및 과거 지원서를 조회합니다",
    back: "뒤로",
    allApplications: "전체 지원서",
    loadingIntakes: "이력 차수를 불러오는 중...",
    noIntakes: "조회 가능한 차수가 없습니다",
    page: {
      allTitle: "전체 이력 지원서",
      allDesc: "현재 진행 중이거나 마감된 모든 차수의 지원서를 표시합니다",
      yearTitle: (year) => `${year}년 이력 지원서`,
      yearDesc: (year) =>
        `${year}년의 현재 진행 중 및 마감된 모든 차수 지원서를 표시합니다`,
      monthTitle: (year, month) => `${year}년 ${month}월 이력 지원서`,
      monthDesc: (year, month) =>
        `${year}년 ${month}월의 현재 진행 중 및 마감된 모든 차수 지원서를 표시합니다`,
      intakeDesc: (label) => `${label} 차수의 지원서만 표시합니다`,
    },
    searchLabel: "학생 이름 검색",
    searchPlaceholder: "이름으로 검색",
    detailTitle: "이력 지원서 상세",
    detailDesc: "이력 지원서는 계속 수정 진입만 제공하며 삭제 기능은 없습니다",
    loadingRows: "이력 지원서를 불러오는 중...",
    noRows: "현재 조건에 맞는 이력 지원서가 없습니다",
    loadError: "이력 지원서 로드에 실패했습니다. Supabase 데이터를 확인하세요.",
    table: {
      index: "번호",
      studentName: "학생 이름",
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
      reviewNote: "심사 메모",
      actions: "작업",
      noPublicId: "public_id 없음",
      continueEdit: "계속 수정",
      supplementMaterials: "서류 보완",
      cannotSupplement: "마감 후 보완 불가",
      noNote: "—",
    },
    statusLabels: {
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
      uploaded: "업로드됨",
      optional: "선택 제출",
      missing: "누락",
      needSupplement: "보완 필요",
      pendingConfirm: "확인 대기",
      complete: "서류 완비",
    },
    intakeRoundPrefix: "",
    intakeRoundSuffix: "차",
    yearSuffix: "년",
    monthSuffix: "월",
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
          ? "bg-emerald-50 font-semibold text-emerald-700"
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

function AgencyHistoryPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [applications, setApplications] = useState([]);
  const [historyIntakes, setHistoryIntakes] = useState([]);
  const [applicationFiles, setApplicationFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [expandedYears, setExpandedYears] = useState({});
const [expandedTypes, setExpandedTypes] = useState({});
const [expandedMonths, setExpandedMonths] = useState({});
const [selectedNode, setSelectedNode] = useState({ type: "all" });

  const getStudentName = (student) => {
    return (
      student.english_name ||
      student.full_name_passport ||
      student.fullNamePassport ||
      "-"
    );
  };

  const getStatus = (student) => {
    return student.status || "draft";
  };

  const formatStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "draft") return t.statusLabels.draft;
    if (s === "submitted") return t.statusLabels.submitted;
    if (s === "under_review") return t.statusLabels.under_review;
    if (s === "missing_documents") return t.statusLabels.missing_documents;
    if (s === "approved") return t.statusLabels.approved;
    if (s === "rejected") return t.statusLabels.rejected;

    return status || "-";
  };

  const mapStatusType = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "missing_documents" || s === "rejected") return "danger";
    if (s === "approved") return "success";
    if (s === "submitted" || s === "under_review") return "warning";
    return "default";
  };

  const getIntakeLabel = (item) => {
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
        return `${year}-${month} ${t.intakeRoundPrefix}${round}`;
      }

      if (language === "ko") {
        return `${year}${t.yearSuffix}${month}${t.monthSuffix} ${round}${t.intakeRoundSuffix}`;
      }

      return `${year}${t.yearSuffix}${month}${t.monthSuffix} ${t.intakeRoundPrefix}${round}${t.intakeRoundSuffix}`;
    }

    return item.intake_id || "-";
  };

  const normalizeIntakeMonth = (value) => {
    if (value === undefined || value === null || value === "") return "-";
    const month = Number(value);
    return Number.isNaN(month) ? String(value) : String(month);
  };

  const getIntakeYear = (item) => {
    if (item.intake_year) return String(item.intake_year);
    if (item.year) return String(item.year);

    const label = getIntakeLabel(item);
    const matched = String(label).match(/(\d{4})\s*(?:-|年|년)/);
    return matched ? matched[1] : "-";
  };

  const getIntakeMonth = (item) => {
    if (item.intake_month) return normalizeIntakeMonth(item.intake_month);

    const label = getIntakeLabel(item);
    const matched = String(label).match(/\d{4}\s*(?:-|年|년)\s*(\d{1,2})\s*(?:月|월)?/);
    return matched ? normalizeIntakeMonth(matched[1]) : "-";
  };

  const formatDate = (value) => {
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
  };

  const getApplicationType = (item) => {
  return item?.application_type || "undergraduate";
};

const getApplicationTypeLabel = (item) => {
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
};

const buildApplicationPath = (applicationType) => {
  const pathMap = {
    undergraduate: "/agency/new-application",
    language: "/agency/new-language-application",
    graduate: "/agency/new-graduate-application",
  };

  return pathMap[applicationType] || pathMap.undergraduate;
};

const buildEditApplicationUrl = (item, mode = "") => {
  const applicationType = String(
    item?.application_type || "undergraduate"
  ).toLowerCase();
  const publicId = item?.public_id || item?.publicId || "";
  const params = new URLSearchParams();

  params.set("public_id", publicId);
  params.set("application_type", applicationType);

  if (item?.intake_id) {
    params.set("intake_id", item.intake_id);
  }

  if (mode) {
    params.set("mode", mode);
  }

  return `${buildApplicationPath(applicationType)}?${params.toString()}`;
};

const getMonthDisplay = (itemOrMonth, applicationType) => {
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
  return `${rawMonth}${t.monthSuffix}`;
};

  const getFileTypeMap = (files) => {
    return (files || []).reduce((acc, file) => {
      if (!acc[file.public_id]) acc[file.public_id] = {};
      if (!acc[file.public_id][file.file_type]) acc[file.public_id][file.file_type] = [];
      acc[file.public_id][file.file_type].push(file);
      return acc;
    }, {});
  };

  const getMaterialStatus = (
    hasFile,
    required,
    systemGenerated = false,
    exempt = false
  ) => {
    if (systemGenerated) {
      return { label: t.material.systemGenerated, type: "success" };
    }

    if (exempt) {
      return { label: t.material.exempt, type: "default" };
    }

    if (!required) {
      return {
        label: hasFile ? t.material.uploaded : t.material.optional,
        type: hasFile ? "success" : "default",
      };
    }

    return hasFile
      ? { label: t.material.uploaded, type: "success" }
      : { label: t.material.missing, type: "danger" };
  };

  const getOverallStatus = (statuses) => {
    const requiredStatuses = statuses.filter(
      (item) => !item.exempt && !item.systemGenerated
    );

    const hasMissingRequired = requiredStatuses.some(
      (item) => item.required && item.label === t.material.missing
    );

    if (hasMissingRequired) {
      return { label: t.material.needSupplement, type: "danger" };
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
  };

  useEffect(() => {
    async function loadData() {
      if (!agencySession?.agency_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const nowIso = new Date().toISOString();

        const [
          { data: intakesData, error: intakesError },
          { data: applicationsData, error: applicationsError },
          filesResponse,
        ] = await Promise.all([
                    supabase
            .from("intakes")
            .select("*")
            .lte("open_at", nowIso)
            .order("open_at", { ascending: false }),
          supabase
            .from("applications")
            .select("*")
            .eq("agency_id", agencySession.agency_id)
            .order("updated_at", { ascending: false }),
          supabase
            .from("application_files")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (intakesError) throw intakesError;
        if (applicationsError) throw applicationsError;
        if (filesResponse.error) throw filesResponse.error;

        const availableIntakes = intakesData || [];

        setHistoryIntakes(availableIntakes);
        setApplications(applicationsData || []);
        setApplicationFiles(filesResponse.data || []);

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

      } catch (error) {
        console.error("AgencyHistoryPage loadData error:", error);
        setLoadError(error.message || t.loadError);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agencySession?.agency_id, t.loadError, language]);

  const historyIntakeIds = useMemo(() => {
    return new Set((historyIntakes || []).map((item) => item.id));
  }, [historyIntakes]);

  const historyIntakeMap = useMemo(() => {
    const byId = {};
    const byLabel = {};

    (historyIntakes || []).forEach((item) => {
      if (item.id) byId[item.id] = item;
      byLabel[getIntakeLabel(item)] = item;
    });

    return { byId, byLabel };
  }, [historyIntakes, language]);

  const historyIntakeLabels = useMemo(() => {
    return new Set((historyIntakes || []).map((item) => getIntakeLabel(item)));
  }, [historyIntakes, language]);

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

      const matchesKeyword = !keyword || studentName.includes(keyword);

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
  }, [historicalApplications, searchKeyword, selectedNode, language]);

  const rows = useMemo(() => {
  return filteredApplications.map((student) => {
    const publicId = student.public_id;
    const files = fileMap[publicId] || {};
    const linkedIntake =
      (student.intake_id && historyIntakeMap.byId?.[student.intake_id]) ||
      historyIntakeMap.byLabel?.[getIntakeLabel(student)] ||
      null;

      const intakeItem =
        (student.intake_id && historyIntakeMap.byId[student.intake_id]) ||
        historyIntakeMap.byLabel[getIntakeLabel(student)] ||
        null;

      const now = new Date();
      const closeAt = intakeItem?.close_at ? new Date(intakeItem.close_at) : null;
      const isClosed = closeAt ? now > closeAt : false;
      const canPostDeadlineMaterialEdit =
        isClosed && intakeItem?.post_deadline_material_edit_enabled === true;

      const bilingualTrack = student.program_track === "Bilingual Program (Chinese)";
      const inKorea = student.residence_status === "korea";
      const financialGuaranteeRequired =
        student.bank_certificate_holder_type === "guarantor";

      const applicationForm = getMaterialStatus(false, true, true, false);
      const passport = getMaterialStatus(!!files.passport?.length, true, false, false);
      const finalTranscript = getMaterialStatus(
        !!files.finalTranscript?.length,
        true,
        false,
        false
      );
      const finalDiploma = getMaterialStatus(
        !!files.finalDiploma?.length,
        true,
        false,
        false
      );
      const languageCertificate = getMaterialStatus(
        !!files.languageCertificate?.length,
        !bilingualTrack,
        false,
        bilingualTrack
      );
      const arc = getMaterialStatus(!!files.arc?.length, inKorea, false, !inKorea);
      const bankStatement = getMaterialStatus(
        !!files.bankStatement?.length,
        true,
        false,
        false
      );
      const guarantorEmploymentIncome = getMaterialStatus(
        !!files.guarantorEmploymentIncome?.length,
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
  application_type: student.application_type || "undergraduate",
intake_id: student.intake_id || "",
  studentName: getStudentName(student),
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
        isClosed,
        canPostDeadlineMaterialEdit,
      };
    });
  }, [filteredApplications, fileMap, historyIntakeMap, language]);

  const headerTitle = useMemo(() => {
  if (selectedNode.type === "year") {
    return t.page.yearTitle(selectedNode.year);
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
  return t.page.allTitle;
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
    return t.page.yearDesc(selectedNode.year);
  }
  return t.page.allDesc;
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

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.sidebarTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{t.sidebarDesc}</p>
          </div>

          <Link
            to="/agency/applications"
            className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            {t.back}
          </Link>
        </div>

        <div className="mt-5">
          <TreeButton
            active={selectedNode.type === "all"}
            onClick={() => setSelectedNode({ type: "all" })}
          >
            {t.allApplications}
          </TreeButton>
        </div>

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="text-sm text-slate-500">{t.loadingIntakes}</div>
          ) : intakeTree.length === 0 ? (
            <div className="text-sm text-slate-500">{t.noIntakes}</div>
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
                    {yearItem.year}{language === "en" ? "" : t.yearSuffix}
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
                                ? "border-emerald-300 bg-emerald-50"
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

      <div className="space-y-6">
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


            <div className="w-full max-w-[280px]">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.searchLabel}
              </label>
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="text-lg font-bold text-slate-900">{t.detailTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{t.detailDesc}</p>
          </div>

          {loading ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.loadingRows}
            </div>
          ) : loadError ? (
            <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
          ) : rows.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              {t.noRows}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1700px] text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
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
                    <th className="px-6 py-4 font-semibold">{t.table.reviewNote}</th>
                    <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const status = getStatus(row.student);

                    return (
                      <tr
                        key={row.student.id || row.publicId || index}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          <EllipsisText text={row.studentName} widthClass="max-w-[140px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{row.year}</td>
                        <td className="px-6 py-4 text-slate-600">
                          <EllipsisText text={row.intake} widthClass="max-w-[180px]" />
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.applicationForm.type}>
                            {row.applicationForm.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.passport.type}>
                            {row.passport.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.finalTranscript.type}>
                            {row.finalTranscript.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.finalDiploma.type}>
                            {row.finalDiploma.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.languageCertificate.type}>
                            {row.languageCertificate.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.arc.type}>
                            {row.arc.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.bankStatement.type}>
                            {row.bankStatement.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge type={row.guarantorEmploymentIncome.type}>
                            {row.guarantorEmploymentIncome.label}
                          </StatusBadge>
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
                            <EllipsisText
                              text={row.applicationReviewNote}
                              widthClass="max-w-[220px]"
                              className="text-xs"
                            />
                          ) : (
                            <span className="text-xs text-slate-400">{t.table.noNote}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!row.publicId ? (
                            <span className="text-xs text-red-500">{t.table.noPublicId}</span>
                          ) : row.isClosed ? (
                            row.canPostDeadlineMaterialEdit ? (
                                                              <Link
                                  to={buildEditApplicationUrl(row, "material_only")}
                                  className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                >

                                {t.table.supplementMaterials}
                              </Link>
                            ) : (
                              <span className="inline-flex rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500">
                                {t.table.cannotSupplement}
                              </span>
                            )
                          ) : (
                                                          <Link
                                to={buildEditApplicationUrl(row)}
                                className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                              >

                              {t.table.continueEdit}
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgencyHistoryPage;