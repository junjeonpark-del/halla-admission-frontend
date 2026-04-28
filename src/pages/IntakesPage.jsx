import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminSession } from "../contexts/AdminSessionContext";

const messages = {
  zh: {
    filtersTitle: "批次筛选",
    filtersDesc: "按年份、入学月份和状态查看申请批次",
    createIntake: "新建批次",
    year: "年份",
    allYears: "全部年份",
    type: "开放类型",
    allTypes: "全部类型",
    typeUndergraduate: "本科",
    typeGraduate: "大学院",
    typeLanguage: "语言班",
    month: "入学月份",
    allMonths: "全部月份",
    month3: "3月",
    month9: "9月",
    seasonSpring: "春季",
    seasonSummer: "夏季",
    seasonFall: "秋季",
    seasonWinter: "冬季",
    status: "批次状态",
    allStatus: "全部状态",
    statusLabels: {
      ongoing: "进行中",
      upcoming: "未开始",
      ended: "已截止",
      disabled: "已停用",
    },
    tableTitle: "申请批次列表",
    tableDesc: "管理年份、入学月份、开放时间和截止时间",
    loading: "正在加载批次...",
    noData: "暂无批次数据",
    loadErrorPrefix: "批次加载失败：",
    columns: {
      index: "序号",
      title: "批次名称",
      type: "类型",
      openAt: "开放时间",
      closeAt: "截止时间",
      status: "状态",
      postDeadline: "截止后补材料",
      description: "说明",
      actions: "操作",
    },
    postDeadline: {
      enabled: "已开启",
      disabled: "已关闭",
      enableAction: "开启补材料",
      disableAction: "关闭补材料",
      enableWord: "开启",
      disableWord: "关闭",
      successPrefix: "已",
      successSuffix: "截止后补材料权限",
      confirm: (action, title) => `确定要${action}“${title}”的截止后补材料权限吗？`,
    },
    description: {
      custom: "自定义批次名称",
      auto: "系统按年份/月/批次自动生成名称",
    },
    actions: {
      edit: "编辑",
      enable: "启用",
      disable: "停用",
      delete: "删除",
    },
    modal: {
      createTitle: "新建批次",
      editTitle: "编辑批次",
      desc: "设置年份、入学月份、开放时间和截止时间",
      close: "关闭",
      year: "年份",
      yearPlaceholder: "例如 2026",
      type: "申请类型",
      month: "入学月份",
      round: "第几批",
      roundPlaceholder: "例如 1",
      title: "批次名称",
      titlePlaceholder: "可留空自动生成",
      openAt: "开放时间",
      closeAt: "截止时间",
      active: "是否启用",
      activeYes: "启用",
      activeNo: "停用",
      postDeadline: "截止后是否允许机构补充材料",
      postDeadlineYes: "开启",
      postDeadlineNo: "关闭",
      cancel: "取消",
      createConfirm: "确认新建",
            agencyNote: "机构端备注",
      agencyNotePlaceholder: "例如：材料审核时间、面试时间、录取通知时间、缴费时间等",
      editConfirm: "保存修改",
      creating: "创建中...",
      saving: "保存中...",
    },
    alerts: {
      needYear: "请填写年份",
      needMonth: "请选择入学月份",
      needRound: "请填写批次序号",
      needTime: "请填写开放时间和截止时间",
      invalidNumber: "年份、月份、批次序号格式不正确",
      invalidTime: "时间格式不正确",
      invalidRange: "截止时间必须晚于开放时间",
      duplicate: (title) => `该批次已存在：${title}`,
      duplicateCreate: "该批次已存在，请不要重复创建",
      duplicateEdit: "修改失败：目标批次已存在",
      createSuccess: "新建批次成功",
      editSuccess: "批次修改成功",
      saveFailed: (mode, msg) => `${mode === "create" ? "新建" : "修改"}批次失败：${msg}`,
      confirmToggle: (action, title) => `确定要${action}批次“${title}”吗？`,
      toggleSuccess: (action) => `批次已${action}`,
      actionFailed: (msg) => `操作失败：${msg}`,
      confirmDelete: (title) => `确定要删除批次“${title}”吗？\n删除后无法恢复。`,
      hasApplications: "该批次下已有申请，无法删除。请先处理关联申请后再删除。",
      deleteSuccess: "批次已删除",
      deleteFailed: (msg) => `删除失败：${msg}`,
    },
    intakeRoundPrefix: "第",
    intakeRoundSuffix: "批",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  en: {
    filtersTitle: "Intake Filters",
    filtersDesc: "View intakes by year, intake month, and status",
    createIntake: "Create Intake",
    year: "Year",
    allYears: "All Years",
    type: "Type",
    allTypes: "All Types",
    typeUndergraduate: "Undergraduate",
    typeGraduate: "Graduate School",
    typeLanguage: "Language Program",
    month: "Intake Month",
    allMonths: "All Months",
    month3: "March",
    month9: "September",
    seasonSpring: "Spring",
    seasonSummer: "Summer",
    seasonFall: "Fall",
    seasonWinter: "Winter",
    status: "Intake Status",
    allStatus: "All Statuses",
    statusLabels: {
      ongoing: "Ongoing",
      upcoming: "Not Started",
      ended: "Closed",
      disabled: "Disabled",
    },
    tableTitle: "Intake List",
    tableDesc: "Manage year, intake month, opening time, and closing time",
    loading: "Loading intakes...",
    noData: "No intake data",
    loadErrorPrefix: "Failed to load intakes: ",
    columns: {
      index: "No.",
      title: "Intake Name",
      type: "Type",
      openAt: "Open Time",
      closeAt: "Close Time",
      status: "Status",
      postDeadline: "Post-deadline Material Upload",
      description: "Description",
      actions: "Actions",
    },
    postDeadline: {
      enabled: "Enabled",
      disabled: "Disabled",
      enableAction: "Enable Upload",
      disableAction: "Disable Upload",
      enableWord: "enable",
      disableWord: "disable",
      successPrefix: "",
      successSuffix: " post-deadline upload permission",
      confirm: (action, title) => `Are you sure you want to ${action} post-deadline material upload for "${title}"?`,
    },
    description: {
      custom: "Custom intake name",
      auto: "System-generated by year / month / round",
    },
    actions: {
      edit: "Edit",
      enable: "Enable",
      disable: "Disable",
      delete: "Delete",
    },
    modal: {
      createTitle: "Create Intake",
      editTitle: "Edit Intake",
      desc: "Set year, intake month, opening time, and closing time",
      close: "Close",
      year: "Year",
      yearPlaceholder: "e.g. 2026",
      type: "Application Type",
      month: "Intake Month",
      round: "Round Number",
      roundPlaceholder: "e.g. 1",
      title: "Intake Name",
      titlePlaceholder: "Leave blank to auto-generate",
      openAt: "Open Time",
      closeAt: "Close Time",
      active: "Enable Status",
      activeYes: "Enable",
      activeNo: "Disable",
      postDeadline: "Allow agencies to upload materials after deadline",
      postDeadlineYes: "Enable",
      postDeadlineNo: "Disable",
            agencyNote: "Agency Note",
      agencyNotePlaceholder: "For example: document review time, interview date, admission notice date, payment deadline, etc.",
      cancel: "Cancel",
      createConfirm: "Create",
      editConfirm: "Save Changes",
      creating: "Creating...",
      saving: "Saving...",
    },
    alerts: {
      needYear: "Please enter a year",
      needMonth: "Please select an intake month",
      needRound: "Please enter a round number",
      needTime: "Please fill in both open time and close time",
      invalidNumber: "Year, month, or round number format is invalid",
      invalidTime: "Invalid time format",
      invalidRange: "Close time must be later than open time",
      duplicate: (title) => `This intake already exists: ${title}`,
      duplicateCreate: "This intake already exists. Please do not create it again.",
      duplicateEdit: "Update failed: target intake already exists",
      createSuccess: "Intake created successfully",
      editSuccess: "Intake updated successfully",
      saveFailed: (mode, msg) => `${mode === "create" ? "Create" : "Edit"} intake failed: ${msg}`,
      confirmToggle: (action, title) => `Are you sure you want to ${action} intake "${title}"?`,
      toggleSuccess: (action) => `Intake ${action}d successfully`,
      actionFailed: (msg) => `Operation failed: ${msg}`,
      confirmDelete: (title) => `Are you sure you want to delete intake "${title}"?\nThis action cannot be undone.`,
      hasApplications: "There are already applications under this intake, so it cannot be deleted.",
      deleteSuccess: "Intake deleted successfully",
      deleteFailed: (msg) => `Delete failed: ${msg}`,
    },
    intakeRoundPrefix: "Round ",
    intakeRoundSuffix: "",
    yearSuffix: "-",
    monthSuffix: "",
  },
  ko: {
    filtersTitle: "차수 필터",
    filtersDesc: "연도, 입학 월, 상태별로 지원 차수를 조회합니다",
    createIntake: "차수 추가",
    year: "연도",
    allYears: "전체 연도",
    type: "유형",
    allTypes: "전체 유형",
    typeUndergraduate: "학부",
    typeGraduate: "대학원",
    typeLanguage: "어학연수",
    month: "입학 월",
    allMonths: "전체 월",
    month3: "3월",
    month9: "9월",
    seasonSpring: "봄학기",
    seasonSummer: "여름학기",
    seasonFall: "가을학기",
    seasonWinter: "겨울학기",
    status: "차수 상태",
    allStatus: "전체 상태",
    statusLabels: {
      ongoing: "진행 중",
      upcoming: "미시작",
      ended: "마감",
      disabled: "비활성",
    },
    tableTitle: "지원 차수 목록",
    tableDesc: "연도, 입학 월, 오픈 시간 및 마감 시간을 관리합니다",
    loading: "차수를 불러오는 중...",
    noData: "차수 데이터가 없습니다",
    loadErrorPrefix: "차수 로드 실패: ",
    columns: {
      index: "번호",
      title: "차수명",
      type: "유형",
      openAt: "오픈 시간",
      closeAt: "마감 시간",
      status: "상태",
      postDeadline: "마감 후 서류 보완",
      description: "설명",
      actions: "작업",
    },
    postDeadline: {
      enabled: "활성",
      disabled: "비활성",
      enableAction: "보완 허용",
      disableAction: "보완 차단",
      enableWord: "활성",
      disableWord: "비활성",
      successPrefix: "",
      successSuffix: " 마감 후 서류 보완 권한",
      confirm: (action, title) => `"${title}"의 마감 후 서류 보완 권한을 ${action}하시겠습니까?`,
    },
    description: {
      custom: "사용자 지정 차수명",
      auto: "연도 / 월 / 차수 기준 자동 생성",
    },
    actions: {
      edit: "수정",
      enable: "활성",
      disable: "비활성",
      delete: "삭제",
    },
    modal: {
      createTitle: "차수 추가",
      editTitle: "차수 수정",
      desc: "연도, 입학 월, 오픈 시간 및 마감 시간을 설정합니다",
      close: "닫기",
      year: "연도",
      yearPlaceholder: "예: 2026",
      type: "지원 유형",
      month: "입학 월",
      round: "몇 차수",
      roundPlaceholder: "예: 1",
      title: "차수명",
      titlePlaceholder: "비워두면 자동 생성",
      openAt: "오픈 시간",
      closeAt: "마감 시간",
      active: "활성 여부",
      activeYes: "활성",
      activeNo: "비활성",
      postDeadline: "마감 후 기관의 서류 보완 허용 여부",
      postDeadlineYes: "허용",
      postDeadlineNo: "차단",
            agencyNote: "기관 안내 메모",
      agencyNotePlaceholder: "예: 서류 심사 일정, 면접 일정, 합격 발표일, 등록금 납부 일정 등",
      cancel: "취소",
      createConfirm: "추가",
      editConfirm: "저장",
      creating: "생성 중...",
      saving: "저장 중...",
    },
    alerts: {
      needYear: "연도를 입력하세요",
      needMonth: "입학 월을 선택하세요",
      needRound: "차수 번호를 입력하세요",
      needTime: "오픈 시간과 마감 시간을 입력하세요",
      invalidNumber: "연도, 월 또는 차수 번호 형식이 올바르지 않습니다",
      invalidTime: "시간 형식이 올바르지 않습니다",
      invalidRange: "마감 시간은 오픈 시간보다 늦어야 합니다",
      duplicate: (title) => `이미 존재하는 차수입니다: ${title}`,
      duplicateCreate: "이미 존재하는 차수입니다. 중복 생성할 수 없습니다.",
      duplicateEdit: "수정 실패: 대상 차수가 이미 존재합니다",
      createSuccess: "차수가 추가되었습니다",
      editSuccess: "차수가 수정되었습니다",
      saveFailed: (mode, msg) => `${mode === "create" ? "추가" : "수정"} 실패: ${msg}`,
      confirmToggle: (action, title) => `차수 "${title}"을(를) ${action}하시겠습니까?`,
      toggleSuccess: (action) => `차수가 ${action}되었습니다`,
      actionFailed: (msg) => `작업 실패: ${msg}`,
      confirmDelete: (title) => `차수 "${title}"을(를) 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`,
      hasApplications: "해당 차수에 이미 지원서가 있어 삭제할 수 없습니다.",
      deleteSuccess: "차수가 삭제되었습니다",
      deleteFailed: (msg) => `삭제 실패: ${msg}`,
    },
    intakeRoundPrefix: "",
    intakeRoundSuffix: "차",
    yearSuffix: "년",
    monthSuffix: "월",
  },
};

function StatusBadge({ children, type = "default" }) {
  const classes = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
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

function IntakesPage() {
  const adminContext = useAdminSession();
  const adminSession = adminContext?.session || null;
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

    const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedNode, setSelectedNode] = useState({ type: "all" });
  const [expandedYears, setExpandedYears] = useState({});
  const [expandedTypes, setExpandedTypes] = useState({});
  const [expandedMonths, setExpandedMonths] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState("");

    const getInitialForm = () => ({
    id: "",
    year: String(new Date().getFullYear()),
    application_type: "undergraduate",
    intake_month: "9",
    round_number: "1",
    title: "",
    agency_note: "",
    open_at: "",
    close_at: "",
    is_active: true,
    post_deadline_material_edit_enabled: false,
  });

  const KST_OFFSET_MINUTES = 9 * 60;

function parseKstLocalToUtcIso(value) {
  if (!value) return "";

  const [datePart, timePart = "00:00"] = String(value).split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  if (
    !year || !month || !day ||
    Number.isNaN(hour) || Number.isNaN(minute)
  ) {
    return "";
  }

  const utcMs =
    Date.UTC(year, month - 1, day, hour, minute) -
    KST_OFFSET_MINUTES * 60 * 1000;

  return new Date(utcMs).toISOString();
}

function formatUtcToKstDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const kstMs = date.getTime() + KST_OFFSET_MINUTES * 60 * 1000;
  const kstDate = new Date(kstMs);

  const y = kstDate.getUTCFullYear();
  const m = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kstDate.getUTCDate()).padStart(2, "0");
  const hh = String(kstDate.getUTCHours()).padStart(2, "0");
  const mm = String(kstDate.getUTCMinutes()).padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function formatUtcToKstDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const kstMs = date.getTime() + KST_OFFSET_MINUTES * 60 * 1000;
  const kstDate = new Date(kstMs);

  const y = kstDate.getUTCFullYear();
  const m = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const d = String(kstDate.getUTCDate()).padStart(2, "0");
  const hh = String(kstDate.getUTCHours()).padStart(2, "0");
  const mm = String(kstDate.getUTCMinutes()).padStart(2, "0");

  return `${y}-${m}-${d}T${hh}:${mm}`;
}

  const [form, setForm] = useState(getInitialForm());

  const formatDateTime = (value) => formatUtcToKstDateTime(value);

  const toDateTimeLocalValue = (value) => formatUtcToKstDateTimeLocal(value);

  const getApplicationTypeLabel = (applicationType) => {
    if (applicationType === "language") return t.typeLanguage;
    if (applicationType === "graduate") return t.typeGraduate;
    return t.typeUndergraduate;
  };

  const getMonthChoices = (applicationType) => {
    if (applicationType === "language") {
      return [
        { value: "3", label: t.seasonSpring },
        { value: "6", label: t.seasonSummer },
        { value: "9", label: t.seasonFall },
        { value: "12", label: t.seasonWinter },
      ];
    }

    return [
      { value: "3", label: t.month3 },
      { value: "9", label: t.month9 },
    ];
  };

  const getMonthLabel = (month, applicationType) => {
    const choices = getMonthChoices(applicationType);
    const match = choices.find((option) => String(option.value) === String(month));
    if (match) return match.label;

    if (language === "en") return String(month || "");
    return `${month || ""}${t.monthSuffix}`;
  };

  const getAutoMonthText = (month, applicationType) => {
    if (applicationType === "language") {
      return getMonthLabel(month, applicationType);
    }

    return String(month || "");
  };

    const getIntakeTitle = (item) => {
    if (item?.title && String(item.title).trim() !== "") {
      return item.title;
    }

    const year = item?.year || "";
    const applicationType = item?.application_type || "undergraduate";
    const month = getAutoMonthText(item?.intake_month || "", applicationType);
    const round = item?.round_number || "";

    if (year && month && round) {
      if (language === "en") {
        return `${year}-${month} ${t.intakeRoundPrefix}${round}`;
      }

      if (language === "ko") {
        return `${year}${t.yearSuffix}${month} ${round}${t.intakeRoundSuffix}`;
      }

      return `${year}${t.yearSuffix}${month} ${t.intakeRoundPrefix}${round}${t.intakeRoundSuffix}`;
    }

    return item?.id || "-";
  };

  const getTreeText = (key) => {
    const text = {
      zh: {
        title: "批次分类",
        desc: "按年份、申请类型、月份和批次快速筛选",
        all: "全部批次",
        empty: "暂无批次",
      },
      en: {
        title: "Intake Tree",
        desc: "Filter by year, application type, month, and intake",
        all: "All Intakes",
        empty: "No intakes",
      },
      ko: {
        title: "차수 분류",
        desc: "연도, 지원 유형, 월, 차수별로 빠르게 필터링",
        all: "전체 차수",
        empty: "차수 없음",
      },
    };

    return text[language]?.[key] || text.zh[key];
  };

  const getTreeYearLabel = (year) => {
    if (language === "en") return String(year);
    return `${year}${t.yearSuffix}`;
  };

  const isTreeNodeActive = (node) => {
    if (!selectedNode || selectedNode.type !== node.type) return false;

    if (node.type === "all") return true;
    if (node.type === "year") return selectedNode.year === node.year;
    if (node.type === "applicationType") {
      return (
        selectedNode.year === node.year &&
        selectedNode.applicationType === node.applicationType
      );
    }
    if (node.type === "month") {
      return (
        selectedNode.year === node.year &&
        selectedNode.applicationType === node.applicationType &&
        selectedNode.month === node.month
      );
    }
    if (node.type === "intake") return selectedNode.intakeId === node.intakeId;

    return false;
  };

    const getTreeButtonClass = (active) =>
    [
      "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition",
      active
        ? "bg-blue-600 font-semibold text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
    ].join(" ");

  const getTypeExpandKey = (year, applicationType) =>
    `${year}-${applicationType}`;

  const getMonthExpandKey = (year, applicationType, month) =>
    `${year}-${applicationType}-${month}`;

  const isYearExpanded = (year) => expandedYears[year] !== false;

  const isTypeExpanded = (year, applicationType) =>
    expandedTypes[getTypeExpandKey(year, applicationType)] !== false;

  const isMonthExpanded = (year, applicationType, month) =>
    expandedMonths[getMonthExpandKey(year, applicationType, month)] !== false;

  const toggleYearExpanded = (year) => {
    setExpandedYears((prev) => ({
      ...prev,
      [year]: prev[year] === false,
    }));
  };

  const toggleTypeExpanded = (year, applicationType) => {
    const key = getTypeExpandKey(year, applicationType);

    setExpandedTypes((prev) => ({
      ...prev,
      [key]: prev[key] === false,
    }));
  };

  const toggleMonthExpanded = (year, applicationType, month) => {
    const key = getMonthExpandKey(year, applicationType, month);

    setExpandedMonths((prev) => ({
      ...prev,
      [key]: prev[key] === false,
    }));
  };

  const getIntakeStatus = (item) => {
    const now = new Date();
    const openAt = item?.open_at ? new Date(item.open_at) : null;
    const closeAt = item?.close_at ? new Date(item.close_at) : null;
    const isActive = item?.is_active === true;

    if (!isActive) {
      return {
        label: t.statusLabels.disabled,
        type: "default",
      };
    }

    if (openAt && now < openAt) {
      return {
        label: t.statusLabels.upcoming,
        type: "warning",
      };
    }

    if (closeAt && now > closeAt) {
      return {
        label: t.statusLabels.ended,
        type: "danger",
      };
    }

    return {
      label: t.statusLabels.ongoing,
      type: "success",
    };
  };

  const buildDefaultTitle = (currentForm) => {
    if (!currentForm.year || !currentForm.intake_month || !currentForm.round_number) return "";

    const monthText = getAutoMonthText(
      currentForm.intake_month,
      currentForm.application_type || "undergraduate"
    );

    if (language === "en") {
      return `${currentForm.year}-${monthText} ${t.intakeRoundPrefix}${currentForm.round_number}`;
    }

    if (language === "ko") {
      return `${currentForm.year}${t.yearSuffix}${monthText} ${currentForm.round_number}${t.intakeRoundSuffix}`;
    }

    return `${currentForm.year}${t.yearSuffix}${monthText} ${t.intakeRoundPrefix}${currentForm.round_number}${t.intakeRoundSuffix}`;
  };

  useEffect(() => {
    if (!adminSession?.admin_id) return;
    loadIntakes();
  }, [adminSession?.admin_id]);

  async function loadIntakes() {
    if (!adminSession?.admin_id) return;

    try {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("intakes")
        .select("*")
        .order("year", { ascending: false })
        .order("intake_month", { ascending: false })
        .order("round_number", { ascending: true })
        .order("open_at", { ascending: true });

      if (error) throw error;

      setIntakes(data || []);
    } catch (error) {
      console.error("IntakesPage loadIntakes error:", error);
      setLoadError(`${t.loadErrorPrefix}${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        intakes
          .map((item) => String(item.year || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => Number(b) - Number(a));
  }, [intakes]);

  const monthOptions = useMemo(() => {
    const source =
      typeFilter === "all"
        ? intakes
        : intakes.filter(
            (item) => (item.application_type || "undergraduate") === typeFilter
          );

    return Array.from(
      new Set(
        source
          .map((item) => String(item.intake_month || "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => Number(a) - Number(b));
  }, [intakes, typeFilter]);

    const intakeTree = useMemo(() => {
    const grouped = {};

    intakes.forEach((item) => {
      const year = String(item.year || "").trim() || "-";
      const applicationType = item.application_type || "undergraduate";
      const month = String(item.intake_month || "").trim() || "-";

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][applicationType]) grouped[year][applicationType] = {};
      if (!grouped[year][applicationType][month]) {
        grouped[year][applicationType][month] = [];
      }

      grouped[year][applicationType][month].push(item);
    });

    const typeOrder = ["undergraduate", "language", "graduate"];

    return Object.keys(grouped)
      .sort((a, b) => Number(b) - Number(a))
      .map((year) => ({
        year,
        count: Object.values(grouped[year]).reduce(
          (sum, months) =>
            sum +
            Object.values(months).reduce(
              (monthSum, rows) => monthSum + rows.length,
              0
            ),
          0
        ),
        types: Object.keys(grouped[year])
          .sort((a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b))
          .map((applicationType) => ({
            applicationType,
            label: getApplicationTypeLabel(applicationType),
            count: Object.values(grouped[year][applicationType]).reduce(
              (sum, rows) => sum + rows.length,
              0
            ),
            months: Object.keys(grouped[year][applicationType])
              .sort((a, b) => Number(a) - Number(b))
              .map((month) => ({
                month,
                label: getMonthLabel(month, applicationType),
                intakes: grouped[year][applicationType][month].sort((a, b) => {
                  const aOpen = a.open_at ? new Date(a.open_at).getTime() : 0;
                  const bOpen = b.open_at ? new Date(b.open_at).getTime() : 0;
                  return bOpen - aOpen;
                }),
              })),
          })),
      }));
  }, [intakes, language]);

  const matchesSelectedTreeNode = (item) => {
    if (!selectedNode || selectedNode.type === "all") return true;

    const year = String(item.year || "").trim();
    const applicationType = item.application_type || "undergraduate";
    const month = String(item.intake_month || "").trim();

    if (selectedNode.type === "year") {
      return year === selectedNode.year;
    }

    if (selectedNode.type === "applicationType") {
      return (
        year === selectedNode.year &&
        applicationType === selectedNode.applicationType
      );
    }

    if (selectedNode.type === "month") {
      return (
        year === selectedNode.year &&
        applicationType === selectedNode.applicationType &&
        month === selectedNode.month
      );
    }

    if (selectedNode.type === "intake") {
      return item.id === selectedNode.intakeId;
    }

    return true;
  };

  const filteredIntakes = useMemo(() => {
    return intakes.filter((item) => {
      const status = getIntakeStatus(item);
      const applicationType = item.application_type || "undergraduate";

      const matchTree = matchesSelectedTreeNode(item);

      const matchYear =
        yearFilter === "all" || String(item.year || "") === yearFilter;

      const matchType = typeFilter === "all" || applicationType === typeFilter;

      const matchMonth =
        monthFilter === "all" ||
        String(item.intake_month || "") === monthFilter;

      const matchStatus =
        statusFilter === "all" || status.label === statusFilter;

      return matchTree && matchYear && matchType && matchMonth && matchStatus;
    });
  }, [
    intakes,
    selectedNode,
    yearFilter,
    typeFilter,
    monthFilter,
    statusFilter,
    language,
  ]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      if (field === "application_type") {
        const monthChoices = getMonthChoices(value);
        const currentMonth = String(prev.intake_month || "");
        const hasCurrentMonth = monthChoices.some(
          (option) => String(option.value) === currentMonth
        );

        return {
          ...prev,
          application_type: value,
          intake_month: hasCurrentMonth ? currentMonth : monthChoices[0].value,
        };
      }

      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setForm(getInitialForm());
    setShowModal(true);
  };

    const handleOpenEdit = (item) => {
    setModalMode("edit");
    setForm({
      id: item.id || "",
      year: String(item.year || ""),
      application_type: item.application_type || "undergraduate",
      intake_month: String(item.intake_month || ""),
      round_number: String(item.round_number || ""),
      title: item.title || "",
      agency_note: item.agency_note || "",
      open_at: toDateTimeLocalValue(item.open_at),
      close_at: toDateTimeLocalValue(item.close_at),
      is_active: item.is_active === true,
      post_deadline_material_edit_enabled:
        item.post_deadline_material_edit_enabled === true,
    });
    setShowModal(true);
  };

  const checkDuplicateIntake = async ({
    year,
    applicationType,
    intakeMonth,
    roundNumber,
    excludeId = "",
  }) => {
    const { data, error } = await supabase
      .from("intakes")
      .select("id, title, year, intake_month, round_number, application_type")
      .eq("year", year)
      .eq("application_type", applicationType)
      .eq("intake_month", intakeMonth)
      .eq("round_number", roundNumber);

    if (error) throw error;

    const rows = (data || []).filter((item) => item.id !== excludeId);
    return rows;
  };

  const handleSave = async () => {
    try {
      if (!form.year) {
        alert(t.alerts.needYear);
        return;
      }

      if (!form.intake_month) {
        alert(t.alerts.needMonth);
        return;
      }

      if (!form.round_number) {
        alert(t.alerts.needRound);
        return;
      }

      if (!form.open_at || !form.close_at) {
        alert(t.alerts.needTime);
        return;
      }

      const year = Number(form.year);
      const intakeMonth = Number(form.intake_month);
      const roundNumber = Number(form.round_number);
      const applicationType = form.application_type || "undergraduate";

      if (
        Number.isNaN(year) ||
        Number.isNaN(intakeMonth) ||
        Number.isNaN(roundNumber)
      ) {
        alert(t.alerts.invalidNumber);
        return;
      }

            const openAtIso = parseKstLocalToUtcIso(form.open_at);
      const closeAtIso = parseKstLocalToUtcIso(form.close_at);

      const openAt = openAtIso ? new Date(openAtIso) : null;
      const closeAt = closeAtIso ? new Date(closeAtIso) : null;

      if (!openAt || !closeAt || Number.isNaN(openAt.getTime()) || Number.isNaN(closeAt.getTime())) {
        alert(t.alerts.invalidTime);
        return;
      }

      if (openAt >= closeAt) {
        alert(t.alerts.invalidRange);
        return;
      }

      setSaving(true);

      const duplicateRows = await checkDuplicateIntake({
        year,
        applicationType,
        intakeMonth,
        roundNumber,
        excludeId: modalMode === "edit" ? form.id : "",
      });

      if (duplicateRows.length > 0) {
        const existing = duplicateRows[0];
        alert(
          t.alerts.duplicate(
            existing.title ||
              getIntakeTitle({
                year: existing.year,
                intake_month: existing.intake_month,
                round_number: existing.round_number,
              })
          )
        );
        return;
      }

            const payload = {
        year,
        application_type: applicationType,
        intake_month: intakeMonth,
        round_number: roundNumber,
        title:
          form.title && String(form.title).trim() !== ""
            ? String(form.title).trim()
            : buildDefaultTitle(form),
        agency_note:
          form.agency_note && String(form.agency_note).trim() !== ""
            ? String(form.agency_note).trim()
            : null,
        open_at: openAtIso,
        close_at: closeAtIso,
        is_active: form.is_active,
        post_deadline_material_edit_enabled:
          form.post_deadline_material_edit_enabled === true,
      };

      if (modalMode === "create") {
        const { error } = await supabase.from("intakes").insert(payload);

        if (error) {
          if (
            String(error.message || "").includes(
              "intakes_year_month_round_unique"
            )
          ) {
            alert(t.alerts.duplicateCreate);
            return;
          }
          throw error;
        }

        alert(t.alerts.createSuccess);
      } else {
        const { error } = await supabase
          .from("intakes")
          .update(payload)
          .eq("id", form.id);

        if (error) {
          if (
            String(error.message || "").includes(
              "intakes_year_month_round_unique"
            )
          ) {
            alert(t.alerts.duplicateEdit);
            return;
          }
          throw error;
        }

        alert(t.alerts.editSuccess);
      }

      setShowModal(false);
      await loadIntakes();
    } catch (error) {
      console.error("handleSave intake error:", error);
      alert(t.alerts.saveFailed(modalMode, error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const nextValue = !(item.is_active === true);
      const actionText = nextValue ? t.actions.enable : t.actions.disable;

      const confirmed = window.confirm(
        t.alerts.confirmToggle(actionText, getIntakeTitle(item))
      );
      if (!confirmed) return;

      setActionLoadingId(item.id);

      const { error } = await supabase
        .from("intakes")
        .update({ is_active: nextValue })
        .eq("id", item.id);

      if (error) throw error;

      await loadIntakes();
      alert(t.alerts.toggleSuccess(actionText));
    } catch (error) {
      console.error("handleToggleActive error:", error);
      alert(t.alerts.actionFailed(error.message));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (item) => {
    try {
      const confirmed = window.confirm(
        t.alerts.confirmDelete(getIntakeTitle(item))
      );
      if (!confirmed) return;

      setActionLoadingId(item.id);

      const { count, error: countError } = await supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("intake_id", item.id);

      if (countError) throw countError;

      if ((count || 0) > 0) {
        alert(t.alerts.hasApplications);
        return;
      }

      const { error } = await supabase.from("intakes").delete().eq("id", item.id);

      if (error) throw error;

      await loadIntakes();
      alert(t.alerts.deleteSuccess);
    } catch (error) {
      console.error("handleDelete intake error:", error);
      alert(t.alerts.deleteFailed(error.message));
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.filtersTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{t.filtersDesc}</p>
          </div>


          <button
            type="button"
            onClick={handleOpenCreate}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t.createIntake}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.year}
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allYears}</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.type}
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allTypes}</option>
              <option value="undergraduate">{t.typeUndergraduate}</option>
              <option value="graduate">{t.typeGraduate}</option>
              <option value="language">{t.typeLanguage}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.month}
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allMonths}</option>
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {typeFilter === "all"
                    ? language === "en"
                      ? month
                      : `${month}${t.monthSuffix}`
                    : getMonthLabel(month, typeFilter)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allStatus}</option>
              <option value={t.statusLabels.ongoing}>{t.statusLabels.ongoing}</option>
              <option value={t.statusLabels.upcoming}>{t.statusLabels.upcoming}</option>
              <option value={t.statusLabels.ended}>{t.statusLabels.ended}</option>
              <option value={t.statusLabels.disabled}>{t.statusLabels.disabled}</option>
            </select>
          </div>
        </div>
      </div>

            <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-lg font-bold text-slate-900">
              {getTreeText("title")}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {getTreeText("desc")}
            </p>
          </div>

          <div className="max-h-[720px] overflow-y-auto p-4">
            <button
              type="button"
              onClick={() => setSelectedNode({ type: "all" })}
              className={getTreeButtonClass(isTreeNodeActive({ type: "all" }))}
            >
              <span>{getTreeText("all")}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                {intakes.length}
              </span>
            </button>

            {intakeTree.length === 0 ? (
              <div className="mt-4 rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
                {getTreeText("empty")}
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                                {intakeTree.map((yearNode) => {
                  const yearActive = isTreeNodeActive({
                    type: "year",
                    year: yearNode.year,
                  });
                  const yearExpanded = isYearExpanded(yearNode.year);

                  return (
                    <div key={yearNode.year} className="space-y-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleYearExpanded(yearNode.year)}
                          className="h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          {yearExpanded ? "▾" : "▸"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNode({
                              type: "year",
                              year: yearNode.year,
                            })
                          }
                          className={getTreeButtonClass(yearActive)}
                        >
                          <span>{getTreeYearLabel(yearNode.year)}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {yearNode.count}
                          </span>
                        </button>
                      </div>

                      {yearExpanded ? (
                        <div className="ml-4 space-y-1 border-l border-slate-200 pl-3">
                          {yearNode.types.map((typeNode) => {
                            const typeActive = isTreeNodeActive({
                              type: "applicationType",
                              year: yearNode.year,
                              applicationType: typeNode.applicationType,
                            });
                            const typeExpanded = isTypeExpanded(
                              yearNode.year,
                              typeNode.applicationType
                            );

                            return (
                              <div
                                key={`${yearNode.year}-${typeNode.applicationType}`}
                                className="space-y-1"
                              >
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleTypeExpanded(
                                        yearNode.year,
                                        typeNode.applicationType
                                      )
                                    }
                                    className="h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                  >
                                    {typeExpanded ? "▾" : "▸"}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedNode({
                                        type: "applicationType",
                                        year: yearNode.year,
                                        applicationType: typeNode.applicationType,
                                      })
                                    }
                                    className={getTreeButtonClass(typeActive)}
                                  >
                                    <span>{typeNode.label}</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                      {typeNode.count}
                                    </span>
                                  </button>
                                </div>

                                {typeExpanded ? (
                                  <div className="ml-4 space-y-1 border-l border-slate-100 pl-3">
                                    {typeNode.months.map((monthNode) => {
                                      const monthActive = isTreeNodeActive({
                                        type: "month",
                                        year: yearNode.year,
                                        applicationType: typeNode.applicationType,
                                        month: monthNode.month,
                                      });
                                      const monthExpanded = isMonthExpanded(
                                        yearNode.year,
                                        typeNode.applicationType,
                                        monthNode.month
                                      );

                                      return (
                                        <div
                                          key={`${yearNode.year}-${typeNode.applicationType}-${monthNode.month}`}
                                          className="space-y-1"
                                        >
                                          <div className="flex items-center gap-1">
                                            <button
                                              type="button"
                                              onClick={() =>
                                                toggleMonthExpanded(
                                                  yearNode.year,
                                                  typeNode.applicationType,
                                                  monthNode.month
                                                )
                                              }
                                              className="h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            >
                                              {monthExpanded ? "▾" : "▸"}
                                            </button>

                                            <button
                                              type="button"
                                              onClick={() =>
                                                setSelectedNode({
                                                  type: "month",
                                                  year: yearNode.year,
                                                  applicationType:
                                                    typeNode.applicationType,
                                                  month: monthNode.month,
                                                })
                                              }
                                              className={getTreeButtonClass(monthActive)}
                                            >
                                              <span>{monthNode.label}</span>
                                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                                {monthNode.intakes.length}
                                              </span>
                                            </button>
                                          </div>

                                          {monthExpanded ? (
                                            <div className="ml-4 space-y-1 border-l border-slate-100 pl-3">
                                              {monthNode.intakes.map((intake) => {
                                                const intakeActive = isTreeNodeActive({
                                                  type: "intake",
                                                  intakeId: intake.id,
                                                });

                                                return (
                                                  <button
                                                    key={intake.id}
                                                    type="button"
                                                    onClick={() =>
                                                      setSelectedNode({
                                                        type: "intake",
                                                        intakeId: intake.id,
                                                      })
                                                    }
                                                    className={getTreeButtonClass(
                                                      intakeActive
                                                    )}
                                                  >
                                                    <span className="truncate">
                                                      {getIntakeTitle(intake)}
                                                    </span>
                                                  </button>
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
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{t.tableTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.tableDesc}</p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.loading}</div>
        ) : loadError ? (
          <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
        ) : filteredIntakes.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t.columns.index}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.title}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.type}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.openAt}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.closeAt}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.status}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.postDeadline}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.description}</th>
                  <th className="px-6 py-4 font-semibold">{t.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredIntakes.map((item, index) => {
                  const status = getIntakeStatus(item);
                  const isActionLoading = actionLoadingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {getIntakeTitle(item)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {getApplicationTypeLabel(item.application_type || "undergraduate")}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(item.open_at)}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(item.close_at)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge type={status.type}>{status.label}</StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge
                          type={item.post_deadline_material_edit_enabled ? "success" : "default"}
                        >
                          {item.post_deadline_material_edit_enabled
                            ? t.postDeadline.enabled
                            : t.postDeadline.disabled}
                        </StatusBadge>
                      </td>
                                            <td className="px-6 py-4 text-slate-600">
                        {item.agency_note && String(item.agency_note).trim() !== ""
                          ? item.agency_note
                          : item.title && String(item.title).trim() !== ""
                          ? t.description.custom
                          : t.description.auto}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            disabled={isActionLoading}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
                          >
                            {t.actions.edit}
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const nextValue = !(item.post_deadline_material_edit_enabled === true);
                                const actionText = nextValue
                                  ? t.postDeadline.enableWord
                                  : t.postDeadline.disableWord;

                                const confirmed = window.confirm(
                                  t.postDeadline.confirm(actionText, getIntakeTitle(item))
                                );
                                if (!confirmed) return;

                                setActionLoadingId(item.id);

                                const { error } = await supabase
                                  .from("intakes")
                                  .update({
                                    post_deadline_material_edit_enabled: nextValue,
                                  })
                                  .eq("id", item.id);

                                if (error) throw error;

                                await loadIntakes();
                                alert(
                                  `${t.postDeadline.successPrefix}${actionText}${t.postDeadline.successSuffix}`
                                );
                              } catch (error) {
                                console.error("toggle post_deadline_material_edit_enabled error:", error);
                                alert(t.alerts.actionFailed(error.message));
                              } finally {
                                setActionLoadingId("");
                              }
                            }}
                            disabled={isActionLoading}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                              item.post_deadline_material_edit_enabled
                                ? "bg-slate-600 hover:bg-slate-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                          >
                            {item.post_deadline_material_edit_enabled
                              ? t.postDeadline.disableAction
                              : t.postDeadline.enableAction}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActive(item)}
                            disabled={isActionLoading}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60 ${
                              item.is_active
                                ? "bg-amber-600 hover:bg-amber-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            }`}
                          >
                            {item.is_active ? t.actions.disable : t.actions.enable}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(item)}
                            disabled={isActionLoading}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                          >
                            {t.actions.delete}
                          </button>
                        </div>
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

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === "create" ? t.modal.createTitle : t.modal.editTitle}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{t.modal.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.modal.close}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.year}
                </label>
                <input
                  value={form.year}
                  onChange={(e) => handleChange("year", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder={t.modal.yearPlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.type}
                </label>
                <select
                  value={form.application_type}
                  onChange={(e) => handleChange("application_type", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="undergraduate">{t.typeUndergraduate}</option>
                  <option value="graduate">{t.typeGraduate}</option>
                  <option value="language">{t.typeLanguage}</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.month}
                </label>
                <select
                  value={form.intake_month}
                  onChange={(e) => handleChange("intake_month", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  {getMonthChoices(form.application_type).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.round}
                </label>
                <input
                  value={form.round_number}
                  onChange={(e) => handleChange("round_number", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder={t.modal.roundPlaceholder}
                />
              </div>

                            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.title}
                </label>
                <input
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder={buildDefaultTitle(form) || t.modal.titlePlaceholder}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.agencyNote}
                </label>
                <textarea
                  value={form.agency_note}
                  onChange={(e) => handleChange("agency_note", e.target.value)}
                  rows={5}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder={t.modal.agencyNotePlaceholder}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.openAt}
                </label>
                <input
                  type="datetime-local"
                  value={form.open_at}
                  onChange={(e) => handleChange("open_at", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.modal.closeAt}
                </label>
                <input
                  type="datetime-local"
                  value={form.close_at}
                  onChange={(e) => handleChange("close_at", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t.modal.active}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange("is_active", true)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        form.is_active
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.modal.activeYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("is_active", false)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        !form.is_active
                          ? "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.modal.activeNo}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    {t.modal.postDeadline}
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => handleChange("post_deadline_material_edit_enabled", true)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        form.post_deadline_material_edit_enabled
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.modal.postDeadlineYes}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("post_deadline_material_edit_enabled", false)}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        !form.post_deadline_material_edit_enabled
                          ? "bg-slate-700 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {t.modal.postDeadlineNo}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.modal.cancel}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {saving
                  ? modalMode === "create"
                    ? t.modal.creating
                    : t.modal.saving
                  : modalMode === "create"
                  ? t.modal.createConfirm
                  : t.modal.editConfirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default IntakesPage;
