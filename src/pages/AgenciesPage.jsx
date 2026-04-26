import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminSession } from "../contexts/AdminSessionContext";

const messages = {
  zh: {
    filtersTitle: "机构筛选",
    filtersDesc: "按机构名称、联系人、营业执照号和审核状态查看机构账号",
    createAgency: "新建机构",
    filters: {
      keyword: "机构名称 / 账号",
      keywordPlaceholder: "输入机构名称或账号搜索",
      contact: "联系人",
      contactPlaceholder: "输入联系人搜索",
      license: "营业执照号",
      licensePlaceholder: "输入营业执照号搜索",
      status: "审核状态",
      all: "全部状态",
      pending: "待审核",
      approved: "已通过",
      rejected: "已拒绝",
      disabled: "已停用",
    },
    table: {
      title: "机构账号列表",
      desc: "管理机构注册信息、主账号和审核状态",
      loading: "正在加载机构...",
      noData: "暂无机构数据",
      columns: {
        index: "序号",
        agencyName: "机构名称",
        contact: "联系人",
        email: "邮箱",
        phone: "电话",
        primaryAccount: "主账号",
        status: "状态",
        createdAt: "注册时间",
        actions: "操作",
      },
      viewDetail: "查看详情",
    },
    status: {
      approved: "已通过",
      rejected: "已拒绝",
      disabled: "已停用",
      pending: "待审核",
    },
    createModal: {
      title: "新建机构",
      desc: "管理员直接创建机构，并同步创建主账号",
      close: "关闭",
      agencyName: "机构名称",
      foundedYear: "公司成立年份",
      foundedYearPlaceholder: "例如 2018",
      licenseNo: "营业执照号",
      legalRep: "法人姓名",
      contactName: "联系人",
      phone: "联系电话",
      email: "机构邮箱",
      licensePath: "营业执照文件路径",
      licensePathPlaceholder: "后续接上传功能，这里先存路径",
      username: "主账号用户名",
      password: "主账号密码",
      accountName: "主账号姓名",
      accountPhone: "主账号电话",
      accountEmail: "主账号邮箱",
      initialStatus: "初始状态",
      cancel: "取消",
      confirm: "确认新建",
      creating: "创建中...",
      statusApproved: "已通过",
      statusPending: "待审核",
      statusRejected: "已拒绝",
      statusDisabled: "已停用",
    },
    detail: {
      loading: "正在加载机构详情...",
      titleDesc: "机构注册信息与账号详情",
      close: "关闭",
      registerTime: "注册时间",
      basicInfo: "机构基本信息",
      stats: "申请统计",
      statsDev: "当前状态：开发中",
      statsDesc1: "说明：后续在 applications 表正式绑定 agency_id 后接入",
      statsDesc2: "届时可查看：历年申请人数、通过人数、拒绝人数、草稿人数",
      fields: {
        agencyName: "机构名称",
        foundedYear: "成立年份",
        licenseNo: "营业执照号",
        legalRep: "法人姓名",
        contactName: "联系人",
        phone: "联系电话",
        email: "邮箱",
        licensePath: "营业执照路径",
        reviewNote: "审核备注",
      },
      accountsTitle: "机构账号列表",
      noAccounts: "暂无账号",
      accountColumns: {
        index: "序号",
        username: "用户名",
        accountName: "账号姓名",
        phone: "电话",
        email: "邮箱",
        primary: "主账号",
        active: "启用状态",
      },
      primary: "主账号",
      sub: "子账号",
      active: "启用",
      inactive: "停用",
      approve: "通过审核",
      reject: "拒绝",
      disable: "停用机构",
    },
    alerts: {
      loadFailed: (msg) => `机构加载失败：${msg}`,
      needAgencyName: "请填写机构名称",
      needUsername: "请填写登录账号",
      needPassword: "请填写登录密码",
      usernameExists: "该登录账号已存在，请更换",
      licenseExists: (agencyName) => `营业执照号已存在：${agencyName}`,
      createSuccess: "机构创建成功",
      createFailed: (msg) => `新建机构失败：${msg}`,
      loadDetailFailed: (msg) => `加载机构详情失败：${msg}`,
      confirmAction: "确定执行这个操作吗？",
      updateSuccess: "状态更新成功",
      updateFailed: (msg) => `状态更新失败：${msg}`,
    },
  },
  en: {
    filtersTitle: "Agency Filters",
    filtersDesc: "View agency accounts by agency name, contact, business license number, and review status",
    createAgency: "Create Agency",
    filters: {
      keyword: "Agency Name / Account",
      keywordPlaceholder: "Search by agency name or account",
      contact: "Contact",
      contactPlaceholder: "Search by contact",
      license: "Business License No.",
      licensePlaceholder: "Search by business license number",
      status: "Review Status",
      all: "All Statuses",
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      disabled: "Disabled",
    },
    table: {
      title: "Agency Account List",
      desc: "Manage agency registration info, primary accounts, and review status",
      loading: "Loading agencies...",
      noData: "No agency data",
      columns: {
        index: "No.",
        agencyName: "Agency Name",
        contact: "Contact",
        email: "Email",
        phone: "Phone",
        primaryAccount: "Primary Account",
        status: "Status",
        createdAt: "Registered At",
        actions: "Actions",
      },
      viewDetail: "View Details",
    },
    status: {
      approved: "Approved",
      rejected: "Rejected",
      disabled: "Disabled",
      pending: "Pending",
    },
    createModal: {
      title: "Create Agency",
      desc: "Admin directly creates an agency and its primary account",
      close: "Close",
      agencyName: "Agency Name",
      foundedYear: "Company Founded Year",
      foundedYearPlaceholder: "e.g. 2018",
      licenseNo: "Business License No.",
      legalRep: "Legal Representative",
      contactName: "Contact",
      phone: "Phone",
      email: "Agency Email",
      licensePath: "License File Path",
      licensePathPlaceholder: "Upload will be connected later; store path for now",
      username: "Primary Account Username",
      password: "Primary Account Password",
      accountName: "Primary Account Name",
      accountPhone: "Primary Account Phone",
      accountEmail: "Primary Account Email",
      initialStatus: "Initial Status",
      cancel: "Cancel",
      confirm: "Create",
      creating: "Creating...",
      statusApproved: "Approved",
      statusPending: "Pending",
      statusRejected: "Rejected",
      statusDisabled: "Disabled",
    },
    detail: {
      loading: "Loading agency details...",
      titleDesc: "Agency registration info and account details",
      close: "Close",
      registerTime: "Registered At",
      basicInfo: "Agency Information",
      stats: "Application Statistics",
      statsDesc1: "Review this agency's application activity, outcomes, and top majors",
      totalCount: "Total Applications",
      currentIntakeCount: "Current Intake Submitted",
      draftCount: "Drafts",
      submittedCount: "Submitted",
      underReviewCount: "Under Review",
      missingDocumentsCount: "Missing Documents",
      approvedCount: "Approved",
      rejectedCount: "Rejected",
      recentActivity: "Recent Activity",
      lastSubmittedAt: "Last Submitted",
      lastApprovedAt: "Last Approved",
      lastRejectedAt: "Last Rejected",
      topMajors: "Top 5 Majors",
      noStatsData: "No application data",
      fields: {
        agencyName: "Agency Name",
        foundedYear: "Founded Year",
        licenseNo: "Business License No.",
        legalRep: "Legal Representative",
        contactName: "Contact",
        phone: "Phone",
        email: "Email",
        licensePath: "License Path",
        reviewNote: "Review Note",
      },
      accountsTitle: "Agency Account List",
      noAccounts: "No accounts",
      accountColumns: {
        index: "No.",
        username: "Username",
        accountName: "Account Name",
        phone: "Phone",
        email: "Email",
        primary: "Primary",
        active: "Status",
      },
      primary: "Primary",
      sub: "Sub-account",
      active: "Active",
      inactive: "Inactive",
      approve: "Approve",
      reject: "Reject",
      disable: "Disable Agency",
    },
    alerts: {
      loadFailed: (msg) => `Failed to load agencies: ${msg}`,
      needAgencyName: "Please enter the agency name",
      needUsername: "Please enter a login username",
      needPassword: "Please enter a login password",
      usernameExists: "This login username already exists. Please choose another one.",
      licenseExists: (agencyName) => `Business license number already exists: ${agencyName}`,
      createSuccess: "Agency created successfully",
      createFailed: (msg) => `Failed to create agency: ${msg}`,
      loadDetailFailed: (msg) => `Failed to load agency details: ${msg}`,
      confirmAction: "Are you sure you want to perform this action?",
      updateSuccess: "Status updated successfully",
      updateFailed: (msg) => `Failed to update status: ${msg}`,
    },
  },
  ko: {
    filtersTitle: "기관 필터",
    filtersDesc: "기관명, 담당자, 사업자등록번호, 심사 상태로 기관 계정을 조회합니다",
    createAgency: "기관 추가",
    filters: {
      keyword: "기관명 / 계정",
      keywordPlaceholder: "기관명 또는 계정으로 검색",
      contact: "담당자",
      contactPlaceholder: "담당자로 검색",
      license: "사업자등록번호",
      licensePlaceholder: "사업자등록번호로 검색",
      status: "심사 상태",
      all: "전체 상태",
      pending: "대기",
      approved: "승인",
      rejected: "거절",
      disabled: "비활성",
    },
    table: {
      title: "기관 계정 목록",
      desc: "기관 등록 정보, 주계정 및 심사 상태를 관리합니다",
      loading: "기관을 불러오는 중...",
      noData: "기관 데이터가 없습니다",
      columns: {
        index: "번호",
        agencyName: "기관명",
        contact: "담당자",
        email: "이메일",
        phone: "전화",
        primaryAccount: "주계정",
        status: "상태",
        createdAt: "등록일",
        actions: "작업",
      },
      viewDetail: "상세 보기",
    },
    status: {
      approved: "승인",
      rejected: "거절",
      disabled: "비활성",
      pending: "대기",
    },
    createModal: {
      title: "기관 추가",
      desc: "관리자가 기관과 주계정을 직접 생성합니다",
      close: "닫기",
      agencyName: "기관명",
      foundedYear: "설립 연도",
      foundedYearPlaceholder: "예: 2018",
      licenseNo: "사업자등록번호",
      legalRep: "대표자명",
      contactName: "담당자",
      phone: "연락처",
      email: "기관 이메일",
      licensePath: "사업자등록 파일 경로",
      licensePathPlaceholder: "업로드 기능은 추후 연결, 현재는 경로만 저장",
      username: "주계정 아이디",
      password: "주계정 비밀번호",
      accountName: "주계정 이름",
      accountPhone: "주계정 전화",
      accountEmail: "주계정 이메일",
      initialStatus: "초기 상태",
      cancel: "취소",
      confirm: "생성",
      creating: "생성 중...",
      statusApproved: "승인",
      statusPending: "대기",
      statusRejected: "거절",
      statusDisabled: "비활성",
    },
    detail: {
      loading: "기관 상세 정보를 불러오는 중...",
      titleDesc: "기관 등록 정보 및 계정 상세",
      close: "닫기",
      registerTime: "등록일",
      basicInfo: "기관 기본 정보",
      stats: "지원 통계",
      statsDev: "현재 상태: 개발 중",
      statsDesc1: "applications 테이블에 agency_id가 정식 연결되면 이후 연동됩니다",
      statsDesc2: "향후 확인 가능: 연도별 지원 수, 승인 수, 거절 수, 초안 수",
      fields: {
        agencyName: "기관명",
        foundedYear: "설립 연도",
        licenseNo: "사업자등록번호",
        legalRep: "대표자명",
        contactName: "담당자",
        phone: "연락처",
        email: "이메일",
        licensePath: "사업자등록 파일 경로",
        reviewNote: "심사 메모",
      },
      accountsTitle: "기관 계정 목록",
      noAccounts: "계정 없음",
      accountColumns: {
        index: "번호",
        username: "아이디",
        accountName: "계정 이름",
        phone: "전화",
        email: "이메일",
        primary: "주계정",
        active: "활성 상태",
      },
      primary: "주계정",
      sub: "하위 계정",
      active: "활성",
      inactive: "비활성",
      approve: "승인",
      reject: "거절",
      disable: "기관 비활성",
    },
    alerts: {
      loadFailed: (msg) => `기관 로드 실패: ${msg}`,
      needAgencyName: "기관명을 입력하세요",
      needUsername: "로그인 아이디를 입력하세요",
      needPassword: "로그인 비밀번호를 입력하세요",
      usernameExists: "이미 존재하는 로그인 아이디입니다. 다른 아이디를 사용하세요.",
      licenseExists: (agencyName) => `이미 존재하는 사업자등록번호입니다: ${agencyName}`,
      createSuccess: "기관이 생성되었습니다",
      createFailed: (msg) => `기관 생성 실패: ${msg}`,
      loadDetailFailed: (msg) => `기관 상세 로드 실패: ${msg}`,
      confirmAction: "이 작업을 실행하시겠습니까?",
      updateSuccess: "상태가 업데이트되었습니다",
      updateFailed: (msg) => `상태 업데이트 실패: ${msg}`,
    },
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

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}`;
}

function getPrimaryAccount(accounts = []) {
  if (!Array.isArray(accounts) || accounts.length === 0) return null;
  return accounts.find((item) => item.is_primary === true) || accounts[0] || null;
}

function getLatestDate(values = []) {
  const sorted = values
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime());

  return sorted[0] ? sorted[0].toISOString() : "";
}

function buildAgencyApplicationStats(applications = [], openIntakeIds = new Set()) {
  const stats = {
    totalCount: 0,
    draftCount: 0,
    submittedCount: 0,
    underReviewCount: 0,
    missingDocumentsCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    currentIntakeCount: 0,
    lastSubmittedAt: "",
    lastApprovedAt: "",
    lastRejectedAt: "",
    majorItems: [],
  };

  if (!Array.isArray(applications) || applications.length === 0) {
    return stats;
  }

  const majorMap = new Map();
  const submittedDates = [];
  const approvedDates = [];
  const rejectedDates = [];

    applications.forEach((application) => {
    const status = String(application.status || "draft").toLowerCase();

    if (status !== "draft") {
      stats.totalCount += 1;
    }

    const major = String(application.major || "").trim();
    const dateValue = application.updated_at || application.created_at || "";

    if (status === "draft") stats.draftCount += 1;
    if (status === "submitted") stats.submittedCount += 1;
    if (status === "under_review") stats.underReviewCount += 1;
    if (status === "missing_documents") stats.missingDocumentsCount += 1;
    if (status === "approved") stats.approvedCount += 1;
    if (status === "rejected") stats.rejectedCount += 1;

    if (status !== "draft" && application.created_at) {
      submittedDates.push(application.created_at);
    }

    if (status === "approved" && dateValue) {
      approvedDates.push(dateValue);
    }

    if (status === "rejected" && dateValue) {
      rejectedDates.push(dateValue);
    }

    if (
      application.intake_id &&
      openIntakeIds.has(application.intake_id) &&
      status !== "draft"
    ) {
      stats.currentIntakeCount += 1;
    }

    if (major) {
      majorMap.set(major, (majorMap.get(major) || 0) + 1);
    }
  });

  stats.lastSubmittedAt = getLatestDate(submittedDates);
  stats.lastApprovedAt = getLatestDate(approvedDates);
  stats.lastRejectedAt = getLatestDate(rejectedDates);
  stats.majorItems = Array.from(majorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  return stats;
}

function getInitialAgencyForm() {
  return {
    agency_name: "",
    country: "",
    company_founded_year: "",
    business_license_no: "",
    legal_representative: "",
    contact_name: "",
    phone: "",
    email: "",
    status: "approved",
    username: "",
    password: "",
    account_name: "",
    account_phone: "",
    account_email: "",
    is_primary: true,
    is_active: true,
  };
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

function AgenciesPage() {
  const adminContext = useAdminSession();
  const adminSession = adminContext?.session || null;
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;
  const agencyStatsText = language === "en"
    ? {
        title: "Application Statistics",
        totalCount: "Total Applications",
        currentIntakeCount: "Current Intake Submitted",
        draftCount: "Drafts",
        submittedCount: "Submitted",
        underReviewCount: "Under Review",
        missingDocumentsCount: "Missing Documents",
        approvedCount: "Approved",
        rejectedCount: "Rejected",
        recentActivity: "Recent Activity",
        lastSubmittedAt: "Last Submitted",
        lastApprovedAt: "Last Approved",
        lastRejectedAt: "Last Rejected",
        topMajors: "Top 5 Majors",
        noStatsData: "No application data",
      }
    : language === "ko"
    ? {
        title: "\uC9C0\uC6D0 \uD1B5\uACC4",
        totalCount: "\uCD1D \uC9C0\uC6D0 \uC218",
        currentIntakeCount: "\uD604\uC7AC \uCC28\uC218 \uC81C\uCD9C",
        draftCount: "\uCD08\uC548 \uC218",
        submittedCount: "\uC81C\uCD9C \uC644\uB8CC",
        underReviewCount: "\uC2EC\uC0AC \uC911",
        missingDocumentsCount: "\uC11C\uB958 \uBD80\uC871",
        approvedCount: "\uC2B9\uC778",
        rejectedCount: "\uAC70\uC808",
        recentActivity: "\uCD5C\uADFC \uD65C\uB3D9",
        lastSubmittedAt: "\uCD5C\uADFC \uC81C\uCD9C",
        lastApprovedAt: "\uCD5C\uADFC \uC2B9\uC778",
        lastRejectedAt: "\uCD5C\uADFC \uAC70\uC808",
        topMajors: "\uC804\uACF5 Top 5",
        noStatsData: "\uC9C0\uC6D0 \uB370\uC774\uD130 \uC5C6\uC74C",
      }
    : {
        title: "\u7533\u8BF7\u7EDF\u8BA1",
        totalCount: "\u603B\u7533\u8BF7\u6570",
        currentIntakeCount: "\u5F53\u524D\u6279\u6B21\u63D0\u4EA4",
        draftCount: "\u8349\u7A3F\u6570",
        submittedCount: "\u5DF2\u63D0\u4EA4",
        underReviewCount: "\u5BA1\u6838\u4E2D",
        missingDocumentsCount: "\u7F3A\u6750\u6599",
        approvedCount: "\u5DF2\u901A\u8FC7",
        rejectedCount: "\u5DF2\u62D2\u7EDD",
        recentActivity: "\u6700\u8FD1\u52A8\u6001",
        lastSubmittedAt: "\u6700\u8FD1\u63D0\u4EA4",
        lastApprovedAt: "\u6700\u8FD1\u901A\u8FC7",
        lastRejectedAt: "\u6700\u8FD1\u62D2\u7EDD",
        topMajors: "\u4E13\u4E1A Top 5",
        noStatsData: "\u6682\u65E0\u7533\u8BF7\u6570\u636E",
      };


  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

    const [keyword, setKeyword] = useState("");
  const [contactKeyword, setContactKeyword] = useState("");
  const [licenseKeyword, setLicenseKeyword] = useState("");
  const [countryKeyword, setCountryKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(getInitialAgencyForm());

  const [detailAgency, setDetailAgency] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailStats, setDetailStats] = useState(null);

  const getAgencyStatusMeta = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "approved") {
      return { label: t.status.approved, type: "success" };
    }

    if (s === "rejected") {
      return { label: t.status.rejected, type: "danger" };
    }

    if (s === "disabled") {
      return { label: t.status.disabled, type: "default" };
    }

    return { label: t.status.pending, type: "warning" };
  };

  useEffect(() => {
    if (!adminSession?.admin_id) return;
    loadAgencies();
  }, [adminSession?.admin_id]);

  async function loadAgencies() {
    if (!adminSession?.admin_id) return;

    try {
      setLoading(true);
      setLoadError("");

      const { data, error } = await supabase
        .from("agencies")
        .select(`
          *,
          agency_accounts (
            id,
            username,
            account_name,
            phone,
            email,
            is_primary,
            is_active,
            created_at
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setAgencies(data || []);
    } catch (error) {
      console.error("AgenciesPage loadAgencies error:", error);
      setLoadError(t.alerts.loadFailed(error.message));
    } finally {
      setLoading(false);
    }
  }

    const filteredAgencies = useMemo(() => {
    const keywordText = keyword.trim().toLowerCase();
    const contactText = contactKeyword.trim().toLowerCase();
    const licenseText = licenseKeyword.trim().toLowerCase();
    const countryText = countryKeyword.trim().toLowerCase();

    return agencies.filter((agency) => {
      const statusMeta = getAgencyStatusMeta(agency.status);
      const primaryAccount = getPrimaryAccount(agency.agency_accounts || []);

      const matchKeyword =
        !keywordText ||
        String(agency.agency_name || "").toLowerCase().includes(keywordText) ||
        String(primaryAccount?.username || "").toLowerCase().includes(keywordText);

      const matchContact =
        !contactText ||
        String(agency.contact_name || "").toLowerCase().includes(contactText) ||
        String(primaryAccount?.account_name || "").toLowerCase().includes(contactText);

      const matchLicense =
        !licenseText ||
        String(agency.business_license_no || "").toLowerCase().includes(licenseText);

      const matchCountry =
        !countryText ||
        String(agency.country || "").toLowerCase().includes(countryText);

      const matchStatus =
        statusFilter === "all" || statusMeta.label === statusFilter;

      return matchKeyword && matchContact && matchLicense && matchCountry && matchStatus;
    });
  }, [agencies, keyword, contactKeyword, licenseKeyword, countryKeyword, statusFilter]);

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenCreate = () => {
    setCreateForm(getInitialAgencyForm());
    setShowCreateModal(true);
  };

  const handleCreateAgency = async () => {
    let createdAgencyId = "";

    try {
      if (!createForm.agency_name.trim()) {
        alert(t.alerts.needAgencyName);
        return;
      }

      if (!createForm.username.trim()) {
        alert(t.alerts.needUsername);
        return;
      }

      if (!createForm.password.trim()) {
        alert(t.alerts.needPassword);
        return;
      }

      setCreating(true);

      const { data: existingUsernameRows, error: usernameCheckError } = await supabase
        .from("agency_accounts")
        .select("id, username")
        .eq("username", createForm.username.trim())
        .limit(1);

      if (usernameCheckError) throw usernameCheckError;

      if (existingUsernameRows && existingUsernameRows.length > 0) {
        alert(t.alerts.usernameExists);
        return;
      }

      if (createForm.business_license_no.trim()) {
        const { data: existingLicenseRows, error: licenseCheckError } = await supabase
          .from("agencies")
          .select("id, agency_name, business_license_no")
          .eq("business_license_no", createForm.business_license_no.trim())
          .limit(1);

        if (licenseCheckError) throw licenseCheckError;

        if (existingLicenseRows && existingLicenseRows.length > 0) {
          alert(t.alerts.licenseExists(existingLicenseRows[0].agency_name));
          return;
        }
      }

              const agencyPayload = {
        agency_name: createForm.agency_name.trim(),
        country: createForm.country.trim() || null,
        company_founded_year:
          createForm.company_founded_year &&
          /^\d+$/.test(String(createForm.company_founded_year).trim())
            ? Number(String(createForm.company_founded_year).trim())
            : null,
        business_license_no: createForm.business_license_no.trim() || null,
        legal_representative: createForm.legal_representative.trim() || null,
        contact_name: createForm.contact_name.trim() || null,
        phone: createForm.phone.trim() || null,
        email: createForm.email.trim() || null,
        status: createForm.status,
      };

      const { data: agencyRow, error: agencyError } = await supabase
        .from("agencies")
        .insert(agencyPayload)
        .select("*")
        .single();

      if (agencyError) throw agencyError;

      createdAgencyId = agencyRow.id;

      const accountPayload = {
        agency_id: createdAgencyId,
        username: createForm.username.trim(),
        password: createForm.password.trim(),
        account_name: createForm.account_name.trim() || null,
        phone: createForm.account_phone.trim() || null,
        email: createForm.account_email.trim() || null,
        is_primary: createForm.is_primary,
        is_active: createForm.is_active,
      };

      const { error: accountError } = await supabase
        .from("agency_accounts")
        .insert(accountPayload);

      if (accountError) throw accountError;

      alert(t.alerts.createSuccess);
      setShowCreateModal(false);
      await loadAgencies();
    } catch (error) {
      console.error("handleCreateAgency error:", error);

      if (createdAgencyId) {
        await supabase.from("agencies").delete().eq("id", createdAgencyId);
      }

      alert(t.alerts.createFailed(error.message));
    } finally {
      setCreating(false);
    }
  };

  const handleOpenDetail = async (agency) => {
    try {
      setDetailLoading(true);
      setDetailAgency(null);
      setDetailStats(null);

      const nowIso = new Date().toISOString();

      const [agencyResponse, applicationsResponse, openIntakesResponse] = await Promise.all([
        supabase
          .from("agencies")
          .select(`
            *,
            agency_accounts (
              id,
              username,
              account_name,
              phone,
              email,
              is_primary,
              is_active,
              created_at
            )
          `)
          .eq("id", agency.id)
          .single(),
        supabase
          .from("applications")
          .select("id, status, created_at, updated_at, intake_id, major")
          .eq("agency_id", agency.id),
        supabase
          .from("intakes")
          .select("id")
          .eq("is_active", true)
          .lte("open_at", nowIso)
          .gte("close_at", nowIso),
      ]);

      if (agencyResponse.error) throw agencyResponse.error;
      if (applicationsResponse.error) throw applicationsResponse.error;
      if (openIntakesResponse.error) throw openIntakesResponse.error;

      const openIntakeIds = new Set((openIntakesResponse.data || []).map((item) => item.id));
      const nextStats = buildAgencyApplicationStats(applicationsResponse.data || [], openIntakeIds);

      setDetailAgency(agencyResponse.data);
      setDetailStats(nextStats);
    } catch (error) {
      console.error("handleOpenDetail error:", error);
      alert(t.alerts.loadDetailFailed(error.message));
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateAgencyStatus = async (agencyId, nextStatus) => {
    try {
      const confirmed = window.confirm(t.alerts.confirmAction);
      if (!confirmed) return;

      setActionLoading(true);

      const { error } = await supabase
        .from("agencies")
        .update({ status: nextStatus })
        .eq("id", agencyId);

      if (error) throw error;

      if (nextStatus === "approved") {
        await supabase
          .from("agency_accounts")
          .update({ is_active: true })
          .eq("agency_id", agencyId)
          .eq("is_primary", true);
      }

      if (nextStatus === "disabled") {
        await supabase
          .from("agency_accounts")
          .update({ is_active: false })
          .eq("agency_id", agencyId);
      }

      await loadAgencies();

      if (detailAgency?.id === agencyId) {
        await handleOpenDetail({ id: agencyId });
      }

      alert(t.alerts.updateSuccess);
    } catch (error) {
      console.error("handleUpdateAgencyStatus error:", error);
      alert(t.alerts.updateFailed(error.message));
    } finally {
      setActionLoading(false);
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
            {t.createAgency}
          </button>
        </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.keyword}
            </label>
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={t.filters.keywordPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.contact}
            </label>
            <input
              value={contactKeyword}
              onChange={(e) => setContactKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={t.filters.contactPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.license}
            </label>
            <input
              value={licenseKeyword}
              onChange={(e) => setLicenseKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={t.filters.licensePlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
            </label>
            <input
              value={countryKeyword}
              onChange={(e) => setCountryKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={language === "en" ? "Search by country" : language === "ko" ? "국가 검색" : "输入国家搜索"}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.filters.all}</option>
              <option value={t.filters.pending}>{t.filters.pending}</option>
              <option value={t.filters.approved}>{t.filters.approved}</option>
              <option value={t.filters.rejected}>{t.filters.rejected}</option>
              <option value={t.filters.disabled}>{t.filters.disabled}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{t.table.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.table.desc}</p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.table.loading}</div>
        ) : loadError ? (
          <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
        ) : filteredAgencies.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.table.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                                <tr>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.index}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.agencyName}</th>
                  <th className="px-6 py-4 font-semibold">
                    {language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
                  </th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.contact}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.email}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.phone}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.primaryAccount}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.status}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.createdAt}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.columns.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgencies.map((agency, index) => {
                  const primaryAccount = getPrimaryAccount(agency.agency_accounts || []);
                  const statusMeta = getAgencyStatusMeta(agency.status);

                  return (
                    <tr
                      key={agency.id}
                      className="border-t border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-medium text-slate-500">
                        {index + 1}
                      </td>
                                            <td className="px-6 py-4 font-medium text-slate-800">
                        <EllipsisText text={agency.agency_name || "-"} widthClass="max-w-[180px]" />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText
                          text={agency.country || "-"}
                          widthClass="max-w-[120px]"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText
                          text={agency.contact_name || primaryAccount?.account_name || "-"}
                          widthClass="max-w-[140px]"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText
                          text={agency.email || primaryAccount?.email || "-"}
                          widthClass="max-w-[180px]"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText
                          text={agency.phone || primaryAccount?.phone || "-"}
                          widthClass="max-w-[140px]"
                        />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText text={primaryAccount?.username || "-"} widthClass="max-w-[140px]" />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge type={statusMeta.type}>
                          {statusMeta.label}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(agency.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(agency)}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                        >
                          {t.table.viewDetail}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.createModal.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.createModal.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.createModal.close}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.agencyName}
                </label>
                <input
                  value={createForm.agency_name}
                  onChange={(e) => handleCreateChange("agency_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
                </label>
                <input
                  value={createForm.country}
                  onChange={(e) => handleCreateChange("country", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.foundedYear}
                </label>
                <input
                  value={createForm.company_founded_year}
                  onChange={(e) =>
                    handleCreateChange("company_founded_year", e.target.value)
                  }
                  placeholder={t.createModal.foundedYearPlaceholder}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.licenseNo}
                </label>
                <input
                  value={createForm.business_license_no}
                  onChange={(e) =>
                    handleCreateChange("business_license_no", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.legalRep}
                </label>
                <input
                  value={createForm.legal_representative}
                  onChange={(e) =>
                    handleCreateChange("legal_representative", e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.contactName}
                </label>
                <input
                  value={createForm.contact_name}
                  onChange={(e) => handleCreateChange("contact_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.phone}
                </label>
                <input
                  value={createForm.phone}
                  onChange={(e) => handleCreateChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.email}
                </label>
                <input
                  value={createForm.email}
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.username}
                </label>
                <input
                  value={createForm.username}
                  onChange={(e) => handleCreateChange("username", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.password}
                </label>
                <input
                  value={createForm.password}
                  onChange={(e) => handleCreateChange("password", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.accountName}
                </label>
                <input
                  value={createForm.account_name}
                  onChange={(e) => handleCreateChange("account_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.accountPhone}
                </label>
                <input
                  value={createForm.account_phone}
                  onChange={(e) => handleCreateChange("account_phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.accountEmail}
                </label>
                <input
                  value={createForm.account_email}
                  onChange={(e) => handleCreateChange("account_email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.initialStatus}
                </label>
                <select
                  value={createForm.status}
                  onChange={(e) => handleCreateChange("status", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="approved">{t.createModal.statusApproved}</option>
                  <option value="pending">{t.createModal.statusPending}</option>
                  <option value="rejected">{t.createModal.statusRejected}</option>
                  <option value="disabled">{t.createModal.statusDisabled}</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.createModal.cancel}
              </button>

              <button
                type="button"
                onClick={handleCreateAgency}
                disabled={creating}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {creating ? t.createModal.creating : t.createModal.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {detailLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-xl">
            <div className="text-sm text-slate-600">{t.detail.loading}</div>
          </div>
        </div>
      ) : null}

      {detailAgency ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 px-4 py-8">
          <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {detailAgency.agency_name || "-"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t.detail.titleDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDetailAgency(null)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.detail.close}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <StatusBadge type={getAgencyStatusMeta(detailAgency.status).type}>
                {getAgencyStatusMeta(detailAgency.status).label}
              </StatusBadge>

              <span className="text-sm text-slate-500">
                {t.detail.registerTime}: {formatDateTime(detailAgency.created_at)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-bold text-slate-900">{t.detail.basicInfo}</h4>
                                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <div>{t.detail.fields.agencyName}: {detailAgency.agency_name || "-"}</div>
                  <div>{language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}: {detailAgency.country || "-"}</div>
                  <div>{t.detail.fields.foundedYear}: {detailAgency.company_founded_year || "-"}</div>
                  <div>{t.detail.fields.licenseNo}: {detailAgency.business_license_no || "-"}</div>
                  <div>{t.detail.fields.legalRep}: {detailAgency.legal_representative || "-"}</div>
                  <div>{t.detail.fields.contactName}: {detailAgency.contact_name || "-"}</div>
                  <div>{t.detail.fields.phone}: {detailAgency.phone || "-"}</div>
                  <div>{t.detail.fields.email}: {detailAgency.email || "-"}</div>
                  <div>{t.detail.fields.reviewNote}: {detailAgency.review_note || "-"}</div>

                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-bold text-slate-900">{agencyStatsText.title}</h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: agencyStatsText.totalCount, value: detailStats?.totalCount ?? 0, tone: "text-slate-900" },
                    { label: agencyStatsText.currentIntakeCount, value: detailStats?.currentIntakeCount ?? 0, tone: "text-blue-700" },
                    { label: agencyStatsText.draftCount, value: detailStats?.draftCount ?? 0, tone: "text-slate-700" },
                    { label: agencyStatsText.submittedCount, value: detailStats?.submittedCount ?? 0, tone: "text-amber-700" },
                    { label: agencyStatsText.underReviewCount, value: detailStats?.underReviewCount ?? 0, tone: "text-blue-700" },
                    { label: agencyStatsText.missingDocumentsCount, value: detailStats?.missingDocumentsCount ?? 0, tone: "text-red-700" },
                    { label: agencyStatsText.approvedCount, value: detailStats?.approvedCount ?? 0, tone: "text-emerald-700" },
                    { label: agencyStatsText.rejectedCount, value: detailStats?.rejectedCount ?? 0, tone: "text-rose-700" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white bg-white px-4 py-3 shadow-sm"
                    >
                      <div className="text-xs font-medium text-slate-500">{item.label}</div>
                      <div className={`mt-1 text-2xl font-bold ${item.tone}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 rounded-xl border border-white bg-white p-4 shadow-sm">
                  <h5 className="text-sm font-semibold text-slate-900">
                    {agencyStatsText.recentActivity}
                  </h5>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div>{agencyStatsText.lastSubmittedAt}: {formatDateTime(detailStats?.lastSubmittedAt)}</div>
                    <div>{agencyStatsText.lastApprovedAt}: {formatDateTime(detailStats?.lastApprovedAt)}</div>
                    <div>{agencyStatsText.lastRejectedAt}: {formatDateTime(detailStats?.lastRejectedAt)}</div>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-white bg-white p-4 shadow-sm">
                  <h5 className="text-sm font-semibold text-slate-900">
                    {agencyStatsText.topMajors}
                  </h5>
                  {(detailStats?.majorItems || []).length === 0 ? (
                    <div className="mt-3 text-sm text-slate-500">
                      {agencyStatsText.noStatsData}
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      {(detailStats?.majorItems || []).map((item, index) => (
                        <div
                          key={`${item.name}-${index}`}
                          className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                        >
                          <div className="min-w-0 truncate text-slate-700">{item.name}</div>
                          <div className="shrink-0 font-semibold text-slate-900">{item.count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h4 className="text-base font-bold text-slate-900">{t.detail.accountsTitle}</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                                            <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.index}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.username}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.accountName}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.phone}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.email}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.primary}</th>
                      <th className="px-5 py-3 font-semibold">{t.detail.accountColumns.active}</th>
                      <th className="px-5 py-3 font-semibold">
                        {language === "en" ? "Actions" : language === "ko" ? "작업" : "操作"}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailAgency.agency_accounts || []).length === 0 ? (
                      <tr className="border-t border-slate-100">
                                                <td colSpan={8} className="px-5 py-6 text-center text-slate-500">
                          {t.detail.noAccounts}
                        </td>
                      </tr>
                    ) : (
                                            detailAgency.agency_accounts.map((account, index) => (
                        <tr key={account.id} className="border-t border-slate-100">
                          <td className="px-5 py-3 text-slate-700">{index + 1}</td>
                          <td className="px-5 py-3 text-slate-700">{account.username || "-"}</td>
                          <td className="px-5 py-3 text-slate-700">{account.account_name || "-"}</td>
                          <td className="px-5 py-3 text-slate-700">{account.phone || "-"}</td>
                          <td className="px-5 py-3 text-slate-700">{account.email || "-"}</td>
                          <td className="px-5 py-3">
                            {account.is_primary ? (
                              <StatusBadge type="success">{t.detail.primary}</StatusBadge>
                            ) : (
                              <StatusBadge>{t.detail.sub}</StatusBadge>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            {account.is_active ? (
                              <StatusBadge type="success">{t.detail.active}</StatusBadge>
                            ) : (
                              <StatusBadge type="danger">{t.detail.inactive}</StatusBadge>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <button
                              type="button"
                              onClick={async () => {
                                const newPassword = window.prompt(
                                  language === "en"
                                    ? `Enter a new password for ${account.username || "-"}`
                                    : language === "ko"
                                    ? `${account.username || "-"} 계정의 새 비밀번호를 입력하세요`
                                    : `请输入账号 ${account.username || "-"} 的新密码`
                                );

                                                                if (!newPassword || !newPassword.trim()) return;

                                if (newPassword.trim().length < 6) {
                                  alert(
                                    language === "en"
                                      ? "Password must be at least 6 characters"
                                      : language === "ko"
                                      ? "비밀번호는 최소 6자 이상이어야 합니다"
                                      : "密码至少需要 6 位"
                                  );
                                  return;
                                }

                                try {
                                  const response = await fetch("/api/admin-agency-account-reset-password", {

                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      agency_id: detailAgency.id,
                                      account_id: account.id,
                                      new_password: newPassword.trim(),
                                    }),
                                  });

                                  const text = await response.text();
                                  let result = {};

                                  try {
                                    result = text ? JSON.parse(text) : {};
                                  } catch {
                                    result = {};
                                  }

                                  if (!response.ok || !result.success) {
                                    throw new Error(
                                      result.message ||
                                        (language === "en"
                                          ? "Password reset failed"
                                          : language === "ko"
                                          ? "비밀번호 재설정 실패"
                                          : "重置密码失败")
                                    );
                                  }

                                  alert(
                                    result.message ||
                                      (language === "en"
                                        ? "Password has been reset"
                                        : language === "ko"
                                        ? "비밀번호가 재설정되었습니다"
                                        : "密码已重置")
                                  );
                                } catch (error) {
                                  console.error("admin reset password error:", error);
                                  alert(
                                    (language === "en"
                                      ? "Password reset failed: "
                                      : language === "ko"
                                      ? "비밀번호 재설정 실패: "
                                      : "重置密码失败：") + error.message
                                  );
                                }
                              }}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              {language === "en" ? "Reset Password" : language === "ko" ? "비밀번호 재설정" : "重置密码"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateAgencyStatus(detailAgency.id, "approved")}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {t.detail.approve}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateAgencyStatus(detailAgency.id, "rejected")}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {t.detail.reject}
              </button>

              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleUpdateAgencyStatus(detailAgency.id, "disabled")}
                className="rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {t.detail.disable}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AgenciesPage;
