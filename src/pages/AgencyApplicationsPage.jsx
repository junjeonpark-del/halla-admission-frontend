import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";
import { getMajorCatalog, getLocalizedMajorLabel } from "../data/majorCatalog";

const MATERIALS_BUCKET = "application-files";

const messages = {
  zh: {
    tabs: {
      draft: "草稿箱",
      submitted: "已提交申请",
    },
    newApplication: "新建申请",
    dialog: {
      title: "选择申请类型",
      desc: "请选择要新建的申请类型，系统会自动匹配当前开放批次。",
      cancel: "取消",
      confirm: "确定",
      undergraduate: "本科",
      language: "语言班",
      graduate: "大学院",
      undergraduateDesc: "适用于新入、插班、双学位申请",
      languageDesc: "适用于语言课程申请",
      graduateDesc: "适用于硕士、博士申请",
    },
    currentBatchLabel: "本机构当前开放批次",
    noOpenBatch: "当前没有开放批次",
    openTime: "开始时间",
    closeTime: "截止时间",
    noOpenBatchDesc: "当前没有正在开放的申请批次，但仍可查看和编辑草稿箱中的预填申请。",
    filters: {
      keyword: "学生姓名 / 专业",
      keywordPlaceholder: "输入姓名或专业搜索",
      status: "申请状态",
      allStatus: "全部状态",
      currentView: "当前显示",
    },
    statuses: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺少材料",
      approved: "已通过",
      rejected: "已拒绝",
    },
    table: {
      index: "序号",
      studentName: "学生姓名",
      intake: "申请批次",
      applicationType: "申请类型",
      major: "专业",
      status: "状态",
      time: "时间",
      actions: "操作",
      delete: "删除",
      continueEdit: "继续编辑",
      missingPublicId: "缺少 public_id",
      deleteButton: "删除",
    },
    panel: {
      draftTitle: "草稿箱",
      submittedTitle: "已提交申请",
      draftDesc: "显示全部尚未提交的申请草稿，包括未绑定批次的预填草稿",
      submittedDesc: "仅显示当前批次下已提交及后续审核状态中的申请",
    },
    loading: "正在加载申请列表...",
    loadError: "申请列表加载失败，请检查数据。",
    noSubmittedWithoutBatch: "当前没有开放批次，暂无可显示的已提交申请。",
    noData: "当前机构在所选条件下没有申请记录",
    intakeProgress: {
      notStarted: "未开始",
      closed: "已截止",
      ongoing: "进行中",
    },
    deleteConfirm: "确定要删除这条申请吗？",
    deleteStudent: "学生",
    deleteWarning: "删除后将同时删除已上传材料，且无法恢复。",
    deleteSuccess: "申请及相关材料已删除",
    deleteFailed: "删除失败：",
    invalidSession: "当前机构登录状态无效，请重新登录后再删除",
    intakeRoundPrefix: "第",
    intakeRoundSuffix: "批",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  en: {
    tabs: {
      draft: "Drafts",
      submitted: "Submitted Applications",
    },
    newApplication: "New Application",
    dialog: {
      title: "Select Application Type",
      desc: "Choose the type of application to create. The system will automatically match the current open intake.",
      cancel: "Cancel",
      confirm: "Confirm",
      undergraduate: "Undergraduate",
      language: "Language Program",
      graduate: "Graduate School",
      undergraduateDesc: "For freshman, transfer, and dual degree applications",
      languageDesc: "For language program applications",
      graduateDesc: "For master's and doctoral applications",
    },
    currentBatchLabel: "Current Open Intakes for This Agency",
    noOpenBatch: "No Open Intake",
    openTime: "Open Time",
    closeTime: "Close Time",
    noOpenBatchDesc:
      "There is currently no open intake, but you can still view and edit pre-filled drafts in the draft box.",
    filters: {
      keyword: "Student Name / Major",
      keywordPlaceholder: "Search by student name or major",
      status: "Application Status",
      allStatus: "All Statuses",
      currentView: "Current View",
    },
    statuses: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    table: {
      index: "No.",
      studentName: "Student Name",
      intake: "Intake",
      applicationType: "Application Type",
      major: "Major",
      status: "Status",
      time: "Time",
      actions: "Actions",
      delete: "Delete",
      continueEdit: "Continue Editing",
      missingPublicId: "Missing public_id",
      deleteButton: "Delete",
    },
    panel: {
      draftTitle: "Drafts",
      submittedTitle: "Submitted Applications",
      draftDesc:
        "Shows all unsubmitted draft applications, including pre-filled drafts not yet bound to an intake",
      submittedDesc:
        "Shows only submitted applications and later review statuses under the current intake",
    },
    loading: "Loading application list...",
    loadError: "Failed to load applications. Please check the data.",
    noSubmittedWithoutBatch:
      "There is currently no open intake, so there are no submitted applications to display.",
    noData: "No application records match the selected conditions",
    intakeProgress: {
      notStarted: "Not Started",
      closed: "Closed",
      ongoing: "Ongoing",
    },
    deleteConfirm: "Are you sure you want to delete this application?",
    deleteStudent: "Student",
    deleteWarning:
      "Uploaded materials will also be deleted and cannot be recovered.",
    deleteSuccess: "The application and related materials have been deleted.",
    deleteFailed: "Delete failed: ",
    invalidSession:
      "Current agency session is invalid. Please log in again before deleting.",
    intakeRoundPrefix: "Round ",
    intakeRoundSuffix: "",
    yearSuffix: "-",
    monthSuffix: "",
  },
  ko: {
    tabs: {
      draft: "초안함",
      submitted: "제출된 지원서",
    },
    newApplication: "새 지원서",
    dialog: {
      title: "지원 유형 선택",
      desc: "새로 만들 지원 유형을 선택하세요. 시스템이 현재 오픈된 차수를 자동으로 연결합니다.",
      cancel: "취소",
      confirm: "확인",
      undergraduate: "학부",
      language: "어학연수",
      graduate: "대학원",
      undergraduateDesc: "신입, 편입, 복수학위 지원에 사용됩니다",
      languageDesc: "어학 과정 지원에 사용됩니다",
      graduateDesc: "석사 및 박사 지원에 사용됩니다",
    },
    currentBatchLabel: "현재 기관 오픈 차수",
    noOpenBatch: "현재 오픈된 차수 없음",
    openTime: "시작 시간",
    closeTime: "마감 시간",
    noOpenBatchDesc:
      "현재 열려 있는 지원 차수는 없지만, 초안함의 사전 작성 지원서는 계속 조회 및 수정할 수 있습니다.",
    filters: {
      keyword: "학생 이름 / 전공",
      keywordPlaceholder: "이름 또는 전공으로 검색",
      status: "지원 상태",
      allStatus: "전체 상태",
      currentView: "현재 표시",
    },
    statuses: {
      draft: "초안",
      submitted: "제출 완료",
      under_review: "심사 중",
      missing_documents: "서류 부족",
      approved: "승인",
      rejected: "거절",
    },
    table: {
      index: "번호",
      studentName: "학생 이름",
      intake: "지원 차수",
      applicationType: "지원 유형",
      major: "전공",
      status: "상태",
      time: "시간",
      actions: "작업",
      delete: "삭제",
      continueEdit: "계속 수정",
      missingPublicId: "public_id 없음",
      deleteButton: "삭제",
    },
    panel: {
      draftTitle: "초안함",
      submittedTitle: "제출된 지원서",
      draftDesc:
        "아직 제출되지 않은 모든 초안을 표시하며, 차수에 연결되지 않은 사전 작성 초안도 포함됩니다",
      submittedDesc:
        "현재 차수에서 제출 완료되었거나 이후 심사 상태에 있는 지원서만 표시합니다",
    },
    loading: "지원 목록을 불러오는 중...",
    loadError: "지원 목록을 불러오지 못했습니다. 데이터를 확인하세요.",
    noSubmittedWithoutBatch:
      "현재 오픈된 차수가 없어 표시할 제출 완료 지원서가 없습니다.",
    noData: "선택한 조건에 맞는 지원 기록이 없습니다",
    intakeProgress: {
      notStarted: "미시작",
      closed: "마감",
      ongoing: "진행 중",
    },
    deleteConfirm: "이 지원서를 삭제하시겠습니까?",
    deleteStudent: "학생",
    deleteWarning:
      "업로드된 서류도 함께 삭제되며 복구할 수 없습니다.",
    deleteSuccess: "지원서와 관련 서류가 삭제되었습니다.",
    deleteFailed: "삭제 실패: ",
    invalidSession:
      "현재 기관 로그인 상태가 유효하지 않습니다. 다시 로그인 후 삭제하세요.",
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

function TabButton({ active, children, onClick, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center rounded-xl px-4 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-emerald-600 text-white"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "ml-2 rounded-full px-2 py-0.5 text-xs",
          active ? "bg-white/20 text-white" : "bg-white text-slate-600",
        ].join(" ")}
      >
        {count}
      </span>
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

function AgencyApplicationsPage() {
  const navigate = useNavigate();
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;

const [applications, setApplications] = useState([]);
const [currentIntakes, setCurrentIntakes] = useState([]);
const [agencyUnits, setAgencyUnits] = useState([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");
const [filtersReady, setFiltersReady] = useState(false);
const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
const [selectedApplicationType, setSelectedApplicationType] = useState("undergraduate");
const [activeTab, setActiveTab] = useState("draft");
const [searchKeyword, setSearchKeyword] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(20);
const [totalCount, setTotalCount] = useState(0);
const [draftTotalCount, setDraftTotalCount] = useState(0);
const [submittedTotalCount, setSubmittedTotalCount] = useState(0);
const [jumpPage, setJumpPage] = useState("");

const isPrimarySession = agencySession?.is_primary === true;
const agencyUnitColumnLabel =
  language === "en" ? "Branch" : language === "ko" ? "소속 분기관" : "所属分机构";

const agencyUnitMap = useMemo(() => {
  const map = new Map();

  agencyUnits.forEach((unit) => {
    map.set(unit.id, unit.name || "-");
  });

  return map;
}, [agencyUnits]);

const formatAgencyUnitName = (name) => {
  return String(name || "-")
    .replace(/\s*（本部）\s*$/u, "")
    .replace(/\s*\(本部\)\s*$/u, "");
};

const getAgencyUnitName = (item) => {
  const unitName = agencyUnitMap.get(item?.agency_unit_id);
  return formatAgencyUnitName(unitName || agencySession?.agency_name || "-");
};

  const mapStatusType = (status) => {
    if (!status) return "default";

    const s = String(status).toLowerCase();

    if (
      s.includes("缺") ||
      s.includes("补") ||
      s.includes("rejected") ||
      s.includes("missing") ||
      s.includes("거절") ||
      s.includes("부족")
    ) {
      return "danger";
    }

    if (
      s.includes("完成") ||
      s.includes("通过") ||
      s.includes("approved") ||
      s.includes("completed") ||
      s.includes("승인")
    ) {
      return "success";
    }

    if (
      s.includes("审核") ||
      s.includes("pending") ||
      s.includes("review") ||
      s.includes("submitted") ||
      s.includes("심사") ||
      s.includes("제출")
    ) {
      return "warning";
    }

    return "default";
  };

  const getStudentName = (student) => {
    return (
      student.english_name ||
      student.full_name_passport ||
      student.fullNamePassport ||
      student.name ||
      "-"
    );
  };

  const getApplicationTypeLabel = (student) => {
    const type = String(student.application_type || "undergraduate").toLowerCase();

    if (type === "language") {
      return language === "en"
        ? "Language Program"
        : language === "ko"
        ? "어학연수"
        : "语言班";
    }

    if (type === "graduate") {
      return language === "en"
        ? "Graduate School"
        : language === "ko"
        ? "대학원"
        : "大学院";
    }

    return language === "en"
      ? "Undergraduate"
      : language === "ko"
      ? "학부"
      : "本科";
  };

  const getMajor = (student) => {
  const rawMajor = student.major || student.department || "";
  if (!rawMajor) return "-";

  const type = String(student.application_type || "undergraduate").toLowerCase();

  if (type === "language") {
    return rawMajor;
  }

  const catalog = getMajorCatalog(type === "graduate" ? "graduate" : "undergraduate");
  const matched = catalog.find(
    (major) =>
      major.zh === rawMajor ||
      major.en === rawMajor ||
      major.ko === rawMajor
  );

  return matched ? getLocalizedMajorLabel(matched, language) : rawMajor;
};

  const getStatus = (student) => {
    return student.status || "draft";
  };

  const formatStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "draft") return t.statuses.draft;
    if (s === "submitted") return t.statuses.submitted;
    if (s === "under_review") return t.statuses.under_review;
    if (s === "missing_documents") return t.statuses.missing_documents;
    if (s === "approved") return t.statuses.approved;
    if (s === "rejected") return t.statuses.rejected;

    return status || "-";
  };

    const getUnassignedIntakeLabel = () => {
    if (language === "en") return "No intake assigned";
    if (language === "ko") return "차수 미지정";
    return "暂未绑定批次";
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

    return getUnassignedIntakeLabel();
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const locale =
      language === "ko" ? "ko-KR" : language === "en" ? "en-US" : "zh-CN";

    return date.toLocaleString(locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getIntakeProgressType = (intake) => {
    const now = new Date();
    const openAt = intake.open_at ? new Date(intake.open_at) : null;
    const closeAt = intake.close_at ? new Date(intake.close_at) : null;

    if (openAt && now < openAt) return "default";
    if (closeAt && now > closeAt) return "danger";
    return "success";
  };

  const getIntakeProgressLabel = (intake) => {
    const now = new Date();
    const openAt = intake.open_at ? new Date(intake.open_at) : null;
    const closeAt = intake.close_at ? new Date(intake.close_at) : null;

    if (openAt && now < openAt) return t.intakeProgress.notStarted;
    if (closeAt && now > closeAt) return t.intakeProgress.closed;
    return t.intakeProgress.ongoing;
  };

  const applicationTypeOptions = [
    {
      value: "undergraduate",
      title: t.dialog.undergraduate,
      desc: t.dialog.undergraduateDesc,
    },
    {
      value: "language",
      title: t.dialog.language,
      desc: t.dialog.languageDesc,
    },
    {
      value: "graduate",
      title: t.dialog.graduate,
      desc: t.dialog.graduateDesc,
    },
  ];

  const currentIntakeMap = useMemo(() => {
    return new Map(
      currentIntakes
        .filter((item) => item?.id)
        .map((item) => [item.id, item])
    );
  }, [currentIntakes]);

  const currentIntakeByType = useMemo(() => {
    const map = new Map();
    currentIntakes.forEach((item) => {
      const type = String(item?.application_type || "undergraduate").toLowerCase();
      if (!map.has(type)) {
        map.set(type, item);
      }
    });
    return map;
  }, [currentIntakes]);

  const resolveIntakeLabel = (item) => {
    if (item?.intake_id && currentIntakeMap.has(item.intake_id)) {
      return getIntakeLabel(currentIntakeMap.get(item.intake_id));
    }
    return getIntakeLabel(item);
  };

  const buildApplicationPath = (applicationType) => {
    const pathMap = {
      undergraduate: "/agency/new-application",
      language: "/agency/new-language-application",
      graduate: "/agency/new-graduate-application",
    };

    return pathMap[applicationType] || pathMap.undergraduate;
  };

  const buildNewApplicationUrl = (applicationType) => {
    const params = new URLSearchParams();
    params.set("application_type", applicationType);

    const matchedIntake = currentIntakeByType.get(applicationType);
    if (matchedIntake?.id) {
      params.set("intake_id", matchedIntake.id);
    }

    return `${buildApplicationPath(applicationType)}?${params.toString()}`;
  };

  const buildEditApplicationUrl = (item) => {
    const applicationType = String(
      item?.application_type || "undergraduate"
    ).toLowerCase();
    const publicId = item?.public_id || "";
    const params = new URLSearchParams();
    params.set("public_id", publicId);
    params.set("application_type", applicationType);

    if (item?.intake_id) {
      params.set("intake_id", item.intake_id);
    }

    return `${buildApplicationPath(applicationType)}?${params.toString()}`;
  };

  const handleCreateApplication = () => {
    navigate(buildNewApplicationUrl(selectedApplicationType));
    setApplicationDialogOpen(false);
  };


  useEffect(() => {
  async function loadData() {
    if (!agencySession?.agency_id) return;

    try {
      setLoading(true);
      setLoadError("");
      setFiltersReady(false);

      const nowIso = new Date().toISOString();

      const [
        { data: intakeData, error: intakeError },
        { data: agencyUnitsData, error: agencyUnitsError },
      ] = await Promise.all([
        supabase
          .from("intakes")
          .select("*")
          .eq("is_active", true)
          .lte("open_at", nowIso)
          .gte("close_at", nowIso)
          .order("open_at", { ascending: true }),
        agencySession?.is_primary === true
          ? supabase
              .from("agency_units")
              .select("id, name")
              .eq("agency_id", agencySession.agency_id)
              .eq("is_active", true)
              .order("is_default", { ascending: false })
              .order("created_at", { ascending: true })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (intakeError) throw intakeError;
      if (agencyUnitsError) throw agencyUnitsError;

      setCurrentIntakes(intakeData || []);
      setAgencyUnits(agencyUnitsData || []);
      setFiltersReady(true);
    } catch (error) {
      console.error("AgencyApplicationsPage loadData error:", error);
      setLoadError(error.message || t.loadError);
      setLoading(false);
    }
  }

  loadData();
}, [
  agencySession?.agency_id,
  agencySession?.agency_unit_id,
  agencySession?.is_primary,
  t.loadError,
]);

  const handleDeleteApplication = async (applicationId, studentName = "") => {
    try {
      if (!agencySession?.agency_id) {
        alert(t.invalidSession);
        return;
      }

      const confirmed = window.confirm(
        `${t.deleteConfirm}\n\n${
          studentName ? `${t.deleteStudent}：${studentName}` : ""
        }\n${t.deleteWarning}`
      );

      if (!confirmed) return;

      const { data: fileRows, error: fileQueryError } = await supabase
        .from("application_files")
        .select("id, file_path")
        .eq("application_id", applicationId);

      if (fileQueryError) throw fileQueryError;

      const filePaths = (fileRows || [])
        .map((item) => item.file_path)
        .filter(Boolean);

      if (filePaths.length > 0) {
        const { error: storageDeleteError } = await supabase.storage
          .from(MATERIALS_BUCKET)
          .remove(filePaths);

        if (storageDeleteError) throw storageDeleteError;
      }

      const { error: fileDeleteError } = await supabase
        .from("application_files")
        .delete()
        .eq("application_id", applicationId);

      if (fileDeleteError) throw fileDeleteError;

      const deleteQuery = supabase
  .from("applications")
  .delete()
  .eq("id", applicationId)
  .eq("agency_id", agencySession.agency_id);

if (agencySession?.is_primary !== true) {
  deleteQuery.eq("agency_unit_id", agencySession?.agency_unit_id || "");
}

const { error: applicationDeleteError } = await deleteQuery;

      if (applicationDeleteError) throw applicationDeleteError;

      setApplications((prev) => prev.filter((item) => item.id !== applicationId));
setTotalCount((prev) => Math.max(0, prev - 1));

if (activeTab === "draft") {
  setDraftTotalCount((prev) => Math.max(0, prev - 1));
} else {
  setSubmittedTotalCount((prev) => Math.max(0, prev - 1));
}

alert(t.deleteSuccess);

    } catch (error) {
      console.error("handleDeleteApplication error:", error);
      alert(`${t.deleteFailed}${error.message}`);
    }
  };

    const currentIntakeIdList = useMemo(() => {
  return currentIntakes
    .map((item) => (item?.id ? String(item.id) : ""))
    .filter(Boolean);
}, [currentIntakes]);

const buildApplicationsQuery = ({ includeCount = false, mode = activeTab, withSearch = true } = {}) => {
  const keyword = withSearch ? searchKeyword.trim().replaceAll(",", " ") : "";

  let query = supabase
    .from("applications")
    .select("*", includeCount ? { count: "exact" } : undefined)
    .eq("agency_id", agencySession.agency_id)
    .order("updated_at", { ascending: false });

  if (agencySession?.is_primary !== true) {
    query = query.eq("agency_unit_id", agencySession?.agency_unit_id || "");
  }

  if (mode === "draft") {
    query = query.eq("status", "draft");
  } else {
    query = query.neq("status", "draft");

    if (currentIntakeIdList.length > 0) {
      query = query.in("intake_id", currentIntakeIdList);
    } else {
      query = query.eq("intake_id", "__no_open_intake__");
    }

    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
  }

  if (keyword) {
    query = query.or(
      `english_name.ilike.%${keyword}%,full_name_passport.ilike.%${keyword}%,name.ilike.%${keyword}%,major.ilike.%${keyword}%,department.ilike.%${keyword}%`
    );
  }

  return query;
};

async function loadTabCounts() {
  if (!agencySession?.agency_id || !filtersReady) return;

  try {
    const draftQuery = buildApplicationsQuery({
      includeCount: true,
      mode: "draft",
      withSearch: false,
    }).range(0, 0);

    const submittedQuery = buildApplicationsQuery({
      includeCount: true,
      mode: "submitted",
      withSearch: false,
    }).range(0, 0);

    const [draftResult, submittedResult] = await Promise.all([draftQuery, submittedQuery]);

    if (draftResult.error) throw draftResult.error;
    if (submittedResult.error) throw submittedResult.error;

    setDraftTotalCount(draftResult.count || 0);
    setSubmittedTotalCount(submittedResult.count || 0);
  } catch (error) {
    console.error("AgencyApplicationsPage loadTabCounts error:", error);
  }
}

async function loadApplications() {
  if (!agencySession?.agency_id || !filtersReady) return;

  try {
    setLoading(true);
    setLoadError("");

    if (activeTab === "submitted" && currentIntakeIdList.length === 0) {
      setApplications([]);
      setTotalCount(0);
      return;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await buildApplicationsQuery({ includeCount: true }).range(from, to);

    if (error) throw error;

    setApplications(data || []);
    setTotalCount(count || 0);
  } catch (error) {
    console.error("AgencyApplicationsPage loadApplications error:", error);
    setLoadError(error.message || t.loadError);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  setPage(1);
}, [activeTab, searchKeyword, statusFilter, pageSize]);

useEffect(() => {
  setSearchKeyword("");
  setStatusFilter("all");
  setPage(1);
}, [activeTab]);

useEffect(() => {
  loadTabCounts();
}, [
  agencySession?.agency_id,
  agencySession?.agency_unit_id,
  agencySession?.is_primary,
  filtersReady,
  currentIntakeIdList,
]);

useEffect(() => {
  loadApplications();
}, [
  agencySession?.agency_id,
  agencySession?.agency_unit_id,
  agencySession?.is_primary,
  filtersReady,
  activeTab,
  page,
  pageSize,
  searchKeyword,
  statusFilter,
  currentIntakeIdList,
]);

const filteredApplications = applications;
const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

useEffect(() => {
  if (page > totalPages) {
    setPage(totalPages);
  }
}, [page, totalPages]);

const goToPage = (targetPage) => {
  const nextPage = Math.min(totalPages, Math.max(1, Number(targetPage) || 1));
  setPage(nextPage);
  setJumpPage("");
};

const pageNumbers = (() => {
  const pages = [];
  const addPage = (value) => {
    if (value >= 1 && value <= totalPages && !pages.includes(value)) {
      pages.push(value);
    }
  };

  addPage(1);

  for (let nextPage = page - 2; nextPage <= page + 2; nextPage += 1) {
    addPage(nextPage);
  }

  addPage(totalPages);

  return pages.sort((a, b) => a - b);
})();

  useEffect(() => {
    setSearchKeyword("");
    setStatusFilter("all");
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            <TabButton
  active={activeTab === "draft"}
  onClick={() => setActiveTab("draft")}
  count={draftTotalCount}
>
  {t.tabs.draft}
</TabButton>

<TabButton
  active={activeTab === "submitted"}
  onClick={() => setActiveTab("submitted")}
  count={submittedTotalCount}
>
  {t.tabs.submitted}
</TabButton>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedApplicationType("undergraduate");
              setApplicationDialogOpen(true);
            }}
            className="inline-flex rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            {t.newApplication}
          </button>
        </div>
        <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-4">
          <div className="text-sm text-slate-500">{t.currentBatchLabel}</div>
          {currentIntakes.length > 0 ? (
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {currentIntakes.map((intake) => (
                <div
                  key={intake.id || getIntakeLabel(intake)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-bold text-slate-900">
                      {getIntakeLabel(intake)}
                    </div>
                    <StatusBadge type={getIntakeProgressType(intake)}>
                      {getApplicationTypeLabel(intake)}
                    </StatusBadge>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {t.openTime}：{formatDateTime(intake.open_at)}
                  </div>
                  <div className="mt-1 text-sm text-slate-600">
                    {t.closeTime}：{formatDateTime(intake.close_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-slate-500">
              {t.noOpenBatchDesc}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.keyword}
            </label>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder={t.filters.keywordPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={activeTab === "draft"}
              className={[
                "w-full rounded-xl border px-4 py-3 text-sm outline-none transition",
                activeTab === "draft"
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  : "border-slate-300 bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100",
              ].join(" ")}
            >
              <option value="all">{t.filters.allStatus}</option>
              <option value="submitted">{t.statuses.submitted}</option>
              <option value="under_review">{t.statuses.under_review}</option>
              <option value="missing_documents">{t.statuses.missing_documents}</option>
              <option value="approved">{t.statuses.approved}</option>
              <option value="rejected">{t.statuses.rejected}</option>
            </select>
          </div>

          <div className="flex items-end">
            <div className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {t.filters.currentView}：
              <span className="ml-2 font-semibold text-slate-900">
                {activeTab === "draft" ? t.tabs.draft : t.tabs.submitted}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">
            {activeTab === "draft" ? t.panel.draftTitle : t.panel.submittedTitle}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {activeTab === "draft" ? t.panel.draftDesc : t.panel.submittedDesc}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.loading}</div>
        ) : loadError ? (
          <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
        ) : activeTab === "submitted" && currentIntakes.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            {t.noSubmittedWithoutBatch}
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            {t.noData}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
{isPrimarySession ? (
  <th className="px-6 py-4 font-semibold">{agencyUnitColumnLabel}</th>
) : null}
<th className="px-6 py-4 font-semibold">{t.table.applicationType}</th>
<th className="px-6 py-4 font-semibold">{t.table.intake}</th>
<th className="px-6 py-4 font-semibold">{t.table.major}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.status}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.time}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.delete}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((student, index) => {
                  const publicId = student.public_id;
                  const status = getStatus(student);

                  return (
                    <tr
                      key={student.id || publicId || index}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-500">
  {(page - 1) * pageSize + index + 1}
</td>
                      <td className="px-6 py-4 font-medium text-slate-800">
  <EllipsisText text={getStudentName(student)} widthClass="max-w-[140px]" />
</td>
{isPrimarySession ? (
  <td className="px-6 py-4 text-slate-600">
    <EllipsisText text={getAgencyUnitName(student)} widthClass="max-w-[170px]" />
  </td>
) : null}
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={getApplicationTypeLabel(student)} widthClass="max-w-[140px]" />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={resolveIntakeLabel(student)} widthClass="max-w-[170px]" />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={getMajor(student)} widthClass="max-w-[150px]" />
</td>
                      <td className="px-6 py-4">
                        <StatusBadge type={mapStatusType(status)}>
                          {formatStatusLabel(status)}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(student.updated_at || student.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {publicId ? (
                          <Link
                            to={buildEditApplicationUrl(student)}
                            className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            {t.table.continueEdit}
                          </Link>
                        ) : (
                          <span className="text-xs text-red-500">
                            {t.table.missingPublicId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteApplication(student.id, getStudentName(student))}
                          className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          {t.table.deleteButton}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600 xl:flex-row xl:items-center xl:justify-between">
  <div className="font-medium">
    {language === "en"
      ? `Total ${totalCount} records`
      : language === "ko"
      ? `총 ${totalCount}건`
      : `共 ${totalCount} 条`}
  </div>

  <div className="flex flex-wrap items-center gap-2">
    <label className="flex items-center gap-2">
      <span>{language === "en" ? "Per page" : language === "ko" ? "페이지당" : "每页"}</span>
      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(1);
        }}
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      >
        <option value={20}>20</option>
        <option value={40}>40</option>
      </select>
    </label>

    <button type="button" onClick={() => setPage(1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
      {language === "en" ? "First" : language === "ko" ? "처음" : "首页"}
    </button>

    <button type="button" onClick={() => setPage((prev) => Math.max(1, prev - 1))} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
      {language === "en" ? "Previous" : language === "ko" ? "이전" : "上一页"}
    </button>

    <div className="flex items-center gap-1">
      {pageNumbers.map((pageNumber, index) => {
        const showGap = index > 0 && pageNumber - pageNumbers[index - 1] > 1;

        return (
          <span key={pageNumber} className="inline-flex items-center gap-1">
            {showGap ? <span className="px-1 text-slate-400">...</span> : null}
            <button
              type="button"
              onClick={() => setPage(pageNumber)}
              className={`min-w-9 rounded-lg px-3 py-1.5 font-semibold ${
                page === pageNumber
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          </span>
        );
      })}
    </div>

    <button type="button" onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
      {language === "en" ? "Next" : language === "ko" ? "다음" : "下一页"}
    </button>

    <button type="button" onClick={() => setPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
      {language === "en" ? "Last" : language === "ko" ? "마지막" : "末页"}
    </button>

    <div className="ml-1 flex items-center gap-2">
      <span className="font-semibold text-slate-800">
        {page} / {totalPages}
      </span>
      <input
        value={jumpPage}
        onChange={(e) => setJumpPage(e.target.value.replace(/\D/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            goToPage(jumpPage);
          }
        }}
        placeholder={language === "en" ? "Page" : language === "ko" ? "페이지" : "页码"}
        className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
      />
      <button type="button" onClick={() => goToPage(jumpPage)} disabled={!jumpPage} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
        {language === "en" ? "Go" : language === "ko" ? "이동" : "跳转"}
      </button>
    </div>
  </div>
</div>
          </div>
        )}      </div>

      {applicationDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-900">{t.dialog.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">{t.dialog.desc}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {applicationTypeOptions.map((option) => {
                const active = selectedApplicationType === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedApplicationType(option.value)}
                    className={[
                      "rounded-2xl border p-5 text-left transition",
                      active
                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div className="flex flex-col items-start">
                      <div className="text-lg font-bold leading-7 text-slate-900">
                        {option.title}
                      </div>
                      <div className="mt-3 text-sm leading-6 text-slate-500">
                        {option.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setApplicationDialogOpen(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              >
                {t.dialog.cancel}
              </button>
              <button
                type="button"
                onClick={handleCreateApplication}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {t.dialog.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AgencyApplicationsPage;
