import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAdminSession } from "../contexts/AdminSessionContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const STATUS_COLORS = {
  draft: "#94a3b8",
  submitted: "#f59e0b",
  under_review: "#f97316",
  missing_documents: "#ef4444",
  approved: "#10b981",
  rejected: "#64748b",
};

const ACTIVE_APPLICATION_STATUSES = [
  "submitted",
  "under_review",
  "missing_documents",
  "approved",
];

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
    aliases: [
      "uzbekistan",
      "uzb",
      "uz",
      "乌兹别克斯坦",
      "우즈베키스탄",
      "우즈벡",
      "uzbek",
    ],
  },
  {
    canonical: "Mongolia",
    aliases: ["mongolia", "mn", "蒙古", "몽골"],
  },
  {
    canonical: "Vietnam",
    aliases: ["vietnam", "vietname", "vn", "越南", "베트남"],
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

const messages = {
  zh: {
    pageTitle: "管理员主页",
    pageDesc: "查看申请总体情况、当前开放批次、提醒事项和可视化统计",
        typeFilterLabel: "申请类型",
    allApplicationTypes: "全部类型",
    filterLabel: "主页统计范围",
    allIntakes: "全部批次",

    loading: "正在加载管理员主页数据...",
    loadError: "管理员主页数据加载失败，请检查 Supabase 数据。",
    stats: {
      total: "总申请人数",
      totalDesc: "当前筛选范围内的申请记录",
      draft: "草稿",
      draftDesc: "尚未正式提交的申请",
      submitted: "已提交",
      submittedDesc: "待管理员处理",
      underReview: "审核中",
      underReviewDesc: "当前审核流程中",
      missing: "缺少材料",
      missingDesc: "需要机构补件",
      approved: "已通过",
      approvedDesc: "当前已审核通过",
      rejected: "已拒绝",
      rejectedDesc: "当前已拒绝的申请",
    },
    remindersTitle: "待处理提醒",
    remindersDesc: "当前筛选范围内最需要优先处理的事项",
    reminders: {
      awaiting: "待审核申请",
      reviewing: "审核中申请",
      missing: "缺少材料",
      todayNew: "今日新增",
      deadline: "7天内截止批次",
    },
    quickTitle: "快捷入口",
    quickDesc: "常用管理操作快速跳转",
    quickLinks: {
      applications: "申请列表",
      intakes: "批次管理",
      agencies: "机构管理",
      missing: "去补件处理",
    },
    recentTitle: "最近申请记录",
    recentDesc: "点击学生姓名或审核按钮可进入审核页",
    viewAll: "查看全部",
    noApplications: "暂无申请数据",
    table: {
      index: "序号",
      studentName: "学生姓名",
            agency: "机构",
      applicationType: "申请类型",
      intake: "申请批次",
      status: "状态",

      updatedAt: "最近更新",
      actions: "操作",
      review: "审核材料",
      missingPublicId: "缺少 public_id",
    },
    openIntakesTitle: "可申请批次一览",
openIntakesDesc: "显示当前开放与即将开放的申请批次",
    noOpenIntakes: "当前没有开放批次",
    openTime: "开放时间",
    intakeStatsTitle: "按批次统计",
    intakeStatsDesc: "全部批次整体处理情况",
    noIntakeStats: "暂无批次统计数据",
    intakeStats: {
      submitted: "已提交",
      underReview: "审核中",
      missing: "缺材料",
      approved: "已通过",
      people: "人",
    },
    topCountriesTitle: "国家 TOP 10",
    topCountriesDesc: "当前筛选范围内申请人数最多的国家",
    noCountryStats: "暂无国家统计数据",
    statusPieTitle: "申请状态分布",
    statusPieDesc: "当前筛选范围内各状态占比",
    noStatusStats: "暂无状态统计数据",
    trendTitle: "近 6 个月申请趋势",
    trendDesc: "当前筛选范围内按月份统计的新增申请数",
    mapTitle: "国家分布说明",
    mapDesc: "地图组件暂未接入，这里先用说明区占位",
    mapText1: "当前由于 React 19 与地图包版本兼容问题，世界地图先不接第三方组件。",
    mapText2: "现阶段先保留：",
    mapList1: "国家 TOP 10 柱状图",
    mapList2: "申请状态环形图",
    mapList3: "近 6 个月趋势图",
    mapText3: "后续换兼容 React 19 的地图方案后，这块可以直接替换成世界地图热力分布。",
    statusLabels: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺少材料",
      approved: "已通过",
      rejected: "已拒绝",
    },
    intakeProgress: {
      notStarted: "未开始",
      closed: "已截止",
      ongoing: "进行中",
    },
    monthSuffix: "月",
    countryUnknown: "未填写",
  },
  en: {
    pageTitle: "Admin Dashboard",
    pageDesc: "View overall application status, current open intakes, reminders, and visual statistics",
        typeFilterLabel: "Application Type",
    allApplicationTypes: "All Types",
    filterLabel: "Dashboard Scope",
    allIntakes: "All Intakes",

    loading: "Loading admin dashboard data...",
    loadError: "Failed to load admin dashboard data. Please check Supabase data.",
    stats: {
      total: "Total Applications",
      totalDesc: "Application records within the current filter",
      draft: "Drafts",
      draftDesc: "Applications not formally submitted",
      submitted: "Submitted",
      submittedDesc: "Waiting for admin processing",
      underReview: "Under Review",
      underReviewDesc: "Currently in review workflow",
      missing: "Missing Documents",
      missingDesc: "Agency needs to supplement documents",
      approved: "Approved",
      approvedDesc: "Applications already approved",
      rejected: "Rejected",
      rejectedDesc: "Applications already rejected",
    },
    remindersTitle: "Pending Reminders",
    remindersDesc: "Top-priority items within the current filter",
    reminders: {
      awaiting: "Awaiting Review",
      reviewing: "Under Review",
      missing: "Missing Documents",
      todayNew: "New Today",
      deadline: "Closing Within 7 Days",
    },
    quickTitle: "Quick Access",
    quickDesc: "Shortcuts to common management actions",
    quickLinks: {
      applications: "Applications",
      intakes: "Intakes",
      agencies: "Agencies",
      missing: "Handle Missing Docs",
    },
    recentTitle: "Recent Applications",
    recentDesc: "Click the student name or review button to open the review page",
    viewAll: "View All",
    noApplications: "No application data",
    table: {
      index: "No.",
      studentName: "Student Name",
            agency: "Agency",
      applicationType: "Application Type",
      intake: "Intake",
      status: "Status",

      updatedAt: "Last Updated",
      actions: "Actions",
      review: "Review Materials",
      missingPublicId: "Missing public_id",
    },
    openIntakesTitle: "Available Intakes",
openIntakesDesc: "Shows currently open and upcoming application intakes",
    noOpenIntakes: "No open intakes currently",
    openTime: "Open period",
    intakeStatsTitle: "Statistics by Intake",
    intakeStatsDesc: "Overall processing status across all intakes",
    noIntakeStats: "No intake statistics available",
    intakeStats: {
      submitted: "Submitted",
      underReview: "Under Review",
      missing: "Missing Docs",
      approved: "Approved",
      people: "",
    },
    topCountriesTitle: "Top 10 Countries",
    topCountriesDesc: "Countries with the highest number of applications in the current filter",
    noCountryStats: "No country statistics available",
    statusPieTitle: "Application Status Distribution",
    statusPieDesc: "Status breakdown within the current filter",
    noStatusStats: "No status statistics available",
    trendTitle: "Application Trend in the Last 6 Months",
    trendDesc: "Monthly new applications within the current filter",
    mapTitle: "Country Distribution Notes",
    mapDesc: "Map component is not connected yet, so this area is used as a placeholder",
    mapText1: "Due to compatibility issues between React 19 and the map package, the world map is not connected for now.",
    mapText2: "Currently retained:",
    mapList1: "Top 10 Countries bar chart",
    mapList2: "Application status donut chart",
    mapList3: "6-month trend chart",
    mapText3: "After switching to a map solution compatible with React 19, this section can be replaced directly with a world heat map.",
    statusLabels: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    intakeProgress: {
      notStarted: "Not Started",
      closed: "Closed",
      ongoing: "Ongoing",
    },
    monthSuffix: "",
    countryUnknown: "Not Provided",
  },
  ko: {
    pageTitle: "관리자 홈",
    pageDesc: "전체 지원 현황, 현재 오픈 차수, 알림 사항 및 시각화 통계를 확인합니다",
        typeFilterLabel: "지원 유형",
    allApplicationTypes: "전체 유형",
    filterLabel: "홈 통계 범위",
    allIntakes: "전체 차수",

    loading: "관리자 홈 데이터를 불러오는 중...",
    loadError: "관리자 홈 데이터 로드에 실패했습니다. Supabase 데이터를 확인하세요.",
    stats: {
      total: "총 지원자 수",
      totalDesc: "현재 필터 범위 내 지원 기록",
      draft: "초안",
      draftDesc: "아직 정식 제출되지 않은 지원서",
      submitted: "제출 완료",
      submittedDesc: "관리자 처리 대기",
      underReview: "심사 중",
      underReviewDesc: "현재 심사 절차 진행 중",
      missing: "서류 부족",
      missingDesc: "기관의 보완 제출 필요",
      approved: "승인",
      approvedDesc: "현재 승인 완료된 지원서",
      rejected: "거절",
      rejectedDesc: "현재 거절된 지원서",
    },
    remindersTitle: "처리 대기 알림",
    remindersDesc: "현재 필터 범위에서 우선 처리해야 할 항목",
    reminders: {
      awaiting: "심사 대기",
      reviewing: "심사 중",
      missing: "서류 부족",
      todayNew: "오늘 신규",
      deadline: "7일 이내 마감 차수",
    },
    quickTitle: "빠른 이동",
    quickDesc: "자주 사용하는 관리 기능으로 바로 이동",
    quickLinks: {
      applications: "지원 목록",
      intakes: "차수 관리",
      agencies: "기관 관리",
      missing: "보완 처리",
    },
    recentTitle: "최근 지원 기록",
    recentDesc: "학생 이름 또는 심사 버튼을 누르면 심사 페이지로 이동합니다",
    viewAll: "전체 보기",
    noApplications: "지원 데이터가 없습니다",
    table: {
      index: "번호",
      studentName: "학생 이름",
            agency: "기관",
      applicationType: "지원 유형",
      intake: "지원 차수",
      status: "상태",

      updatedAt: "최근 업데이트",
      actions: "작업",
      review: "서류 심사",
      missingPublicId: "public_id 없음",
    },
    openIntakesTitle: "지원 가능 차수 안내",
openIntakesDesc: "현재 오픈 중이거나 곧 오픈될 신청 차수를 표시합니다",
    noOpenIntakes: "현재 오픈된 차수가 없습니다",
    openTime: "오픈 기간",
    intakeStatsTitle: "차수별 통계",
    intakeStatsDesc: "전체 차수의 처리 현황",
    noIntakeStats: "차수 통계 데이터가 없습니다",
    intakeStats: {
      submitted: "제출 완료",
      underReview: "심사 중",
      missing: "서류 부족",
      approved: "승인",
      people: "명",
    },
    topCountriesTitle: "국가 TOP 10",
    topCountriesDesc: "현재 필터 범위에서 지원자가 가장 많은 국가",
    noCountryStats: "국가 통계 데이터가 없습니다",
    statusPieTitle: "지원 상태 분포",
    statusPieDesc: "현재 필터 범위 내 상태 비율",
    noStatusStats: "상태 통계 데이터가 없습니다",
    trendTitle: "최근 6개월 지원 추세",
    trendDesc: "현재 필터 범위 내 월별 신규 지원 수",
    mapTitle: "국가 분포 안내",
    mapDesc: "지도 컴포넌트가 아직 연결되지 않아 이 영역은 임시 안내 영역입니다",
    mapText1: "현재 React 19와 지도 패키지 버전 호환 문제로 세계 지도는 우선 연결하지 않습니다.",
    mapText2: "현 단계에서는 다음만 유지합니다:",
    mapList1: "국가 TOP 10 막대 그래프",
    mapList2: "지원 상태 도넛 차트",
    mapList3: "최근 6개월 추세 차트",
    mapText3: "향후 React 19와 호환되는 지도 솔루션으로 교체하면 이 영역을 바로 세계 열지도 분포로 바꿀 수 있습니다.",
    statusLabels: {
      draft: "초안",
      submitted: "제출 완료",
      under_review: "심사 중",
      missing_documents: "서류 부족",
      approved: "승인",
      rejected: "거절",
    },
    intakeProgress: {
      notStarted: "미시작",
      closed: "마감",
      ongoing: "진행 중",
    },
    monthSuffix: "월",
    countryUnknown: "미입력",
  },
};

function StatCard({ title, value, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className="mt-3 text-3xl font-bold text-slate-900">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
    </div>
  );
}

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

function DashboardPage() {
  const adminContext = useAdminSession();
  const adminSession = adminContext?.session || null;
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [applications, setApplications] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
    const [selectedApplicationType, setSelectedApplicationType] = useState("all");
  const [selectedIntake, setSelectedIntake] = useState("all");


  const formatStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    return t.statusLabels[s] || status || "-";
  };

  const mapStatusType = (status) => {
    const s = String(status || "").toLowerCase();

    if (s === "missing_documents" || s === "rejected") return "danger";
    if (s === "approved") return "success";
    if (s === "submitted" || s === "under_review") return "warning";
    return "default";
  };

  const getStudentName = (student) => {
    return (
      student.english_name ||
      student.full_name_passport ||
      student.fullNamePassport ||
      "-"
    );
  };

  const getAgency = (student, agencyMap) => {
    if (student.agency_name) return student.agency_name;
    if (student.agency && String(student.agency).trim() !== "") return student.agency;
    if (student.agency_id && agencyMap[student.agency_id]) return agencyMap[student.agency_id];
    return student.agency_id || "-";
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
      return `${year}${language === "en" ? "-" : "年"}${month}${t.monthSuffix} ${
        language === "en" ? `Round ${round}` : `第${round}批`
      }`;
    }

    return item.intake_id || "-";
  };

    const intakeMap = useMemo(() => {
    return intakes.reduce((acc, intake) => {
      acc[intake.id] = intake;
      return acc;
    }, {});
  }, [intakes]);

  const getLinkedIntake = (item) => {
    if (!item) return null;
    return item.intake_id ? intakeMap[item.intake_id] || null : null;
  };

  const getScopedIntakeLabel = (item) => {
    const linkedIntake = getLinkedIntake(item);
    return getIntakeLabel(linkedIntake || item);
  };

  const getScopedIntakeOptionLabel = (item) => {
    return `${getApplicationTypeLabel(item)} / ${getScopedIntakeLabel(item)}`;
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

  const normalizeCountry = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return t.countryUnknown;

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

    return raw.trim();
  };

  useEffect(() => {
    async function loadData() {
      if (!adminSession?.admin_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const [
          { data: applicationsData, error: applicationsError },
          { data: intakesData, error: intakesError },
          { data: agenciesData, error: agenciesError },
        ] = await Promise.all([
          supabase
            .from("applications")
            .select("*")
            .order("updated_at", { ascending: false }),
          supabase
            .from("intakes")
            .select("*")
            .order("open_at", { ascending: true }),
          supabase
            .from("agencies")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

        if (applicationsError) throw applicationsError;
        if (intakesError) throw intakesError;
        if (agenciesError) throw agenciesError;

        setApplications(applicationsData || []);
        setIntakes(intakesData || []);
        setAgencies(agenciesData || []);
      } catch (error) {
        console.error("DashboardPage loadData error:", error);
        setLoadError(t.loadError);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [adminSession?.admin_id, t.loadError]);

  const agencyMap = useMemo(() => {
    return (agencies || []).reduce((acc, agency) => {
      acc[agency.id] = agency.agency_name;
      return acc;
    }, {});
  }, [agencies]);

      const intakeOptions = useMemo(() => {
    const map = new Map();

    applications.forEach((item) => {
      const status = String(item.status || "").toLowerCase();
      if (!status || status === "draft") return;

      const linkedIntake = getLinkedIntake(item);
      const source = linkedIntake || item;
      const intakeLabel = getScopedIntakeLabel(source);

      if (!intakeLabel || intakeLabel === "-") return;

      const value = linkedIntake?.id || item.intake_id || intakeLabel;
      const applicationType = getApplicationType(source);
      const label = `${getApplicationTypeLabel(source)} / ${intakeLabel}`;

      if (value && label) {
        map.set(String(value), {
          value: String(value),
          label,
          applicationType,
        });
      }
    });

    return Array.from(map.values());
  }, [applications, intakes, language]);

    const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const matchesType =
        selectedApplicationType === "all" ||
        getApplicationType(item) === selectedApplicationType;

      if (!matchesType) return false;

      if (selectedIntake === "all") return true;

      const linkedIntake = getLinkedIntake(item);
      const value = String(linkedIntake?.id || item.intake_id || getScopedIntakeOptionLabel(item));

      return value === selectedIntake;
    });
  }, [applications, selectedApplicationType, selectedIntake, intakes, language]);


  const activeApplications = useMemo(() => {
    return filteredApplications.filter((item) => {
      const s = String(item.status || "").toLowerCase();
      return ACTIVE_APPLICATION_STATUSES.includes(s);
    });
  }, [filteredApplications]);

  const stats = useMemo(() => {
    const total = activeApplications.length;

    const draft = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "draft"
    ).length;

    const submitted = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "submitted"
    ).length;

    const underReview = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "under_review"
    ).length;

    const missingDocuments = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "missing_documents"
    ).length;

    const approved = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "approved"
    ).length;

    const rejected = filteredApplications.filter(
      (item) => String(item.status || "").toLowerCase() === "rejected"
    ).length;

    return {
      total,
      draft,
      submitted,
      underReview,
      missingDocuments,
      approved,
      rejected,
    };
  }, [filteredApplications, activeApplications]);

  const reminders = useMemo(() => {
    const today = new Date();
    const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const todayNew = activeApplications.filter((item) => {
      const created = item.created_at ? new Date(item.created_at) : null;
      return created && created >= dayStart;
    }).length;

    const awaitingReview = filteredApplications.filter(
      (item) => item.status === "submitted"
    ).length;

    const underReview = filteredApplications.filter(
      (item) => item.status === "under_review"
    ).length;

    const missingDocuments = filteredApplications.filter(
      (item) => item.status === "missing_documents"
    ).length;

    const upcomingDeadline = intakes.filter((intake) => {
      if (!intake.is_active || !intake.close_at) return false;
      const closeAt = new Date(intake.close_at);
      const diff = closeAt.getTime() - today.getTime();
      const days = diff / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    }).length;

    return {
      todayNew,
      awaitingReview,
      underReview,
      missingDocuments,
      upcomingDeadline,
    };
  }, [filteredApplications, activeApplications, intakes]);

  const recentApplications = useMemo(() => {
    return [...activeApplications]
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [activeApplications]);

  const currentOpenIntakes = useMemo(() => {
    return intakes.filter((item) => {
      const now = new Date();
      const openAt = item.open_at ? new Date(item.open_at) : null;
      const closeAt = item.close_at ? new Date(item.close_at) : null;

      if (!item.is_active) return false;
      if (openAt && now < openAt) return true;
      if (closeAt && now > closeAt) return false;
      return true;
    });
  }, [intakes]);

      const intakeStats = useMemo(() => {
    const now = Date.now();
    const typeOrder = ["undergraduate", "graduate", "language"];

    const toTime = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const isCurrentOpenIntake = (intake) => {
      if (!intake || intake.is_active !== true) return false;

      const openAt = toTime(intake.open_at);
      const closeAt = toTime(intake.close_at);

      if (openAt && now < openAt) return false;
      if (closeAt && now > closeAt) return false;

      return true;
    };

    const isClosedIntake = (intake) => {
      if (!intake?.close_at) return false;
      return toTime(intake.close_at) < now;
    };

    const getIntakeSortRank = (intake) => {
      if (isCurrentOpenIntake(intake)) return 3;
      if (isClosedIntake(intake)) return 2;
      return 1;
    };

    const compareIntakesByRecency = (a, b) => {
      const rankDiff = getIntakeSortRank(b) - getIntakeSortRank(a);
      if (rankDiff !== 0) return rankDiff;

      const aPrimary = isClosedIntake(a)
        ? toTime(a.close_at)
        : Math.max(toTime(a.open_at), toTime(a.close_at));
      const bPrimary = isClosedIntake(b)
        ? toTime(b.close_at)
        : Math.max(toTime(b.open_at), toTime(b.close_at));

      if (bPrimary !== aPrimary) return bPrimary - aPrimary;

      return toTime(b.created_at) - toTime(a.created_at);
    };

    const availableIntakes =
      selectedApplicationType === "all"
        ? [...intakes]
        : intakes.filter(
            (item) => getApplicationType(item) === selectedApplicationType
          );

        const sortedIntakes = [...availableIntakes].sort(compareIntakesByRecency);

    const displayableIntakes = sortedIntakes.filter(
      (item) => isCurrentOpenIntake(item) || isClosedIntake(item)
    );

    let targetIntakes = [];

    if (selectedIntake !== "all") {
      const selectedRow = sortedIntakes.find((item) => {
        const id = item.id != null ? String(item.id) : "";
        const optionLabel = getScopedIntakeOptionLabel(item);
        const scopedLabel = getScopedIntakeLabel(item);
        const rawLabel = getIntakeLabel(item);

        return (
          id === selectedIntake ||
          optionLabel === selectedIntake ||
          scopedLabel === selectedIntake ||
          rawLabel === selectedIntake
        );
      });

      targetIntakes = selectedRow ? [selectedRow] : [];
    } else if (selectedApplicationType !== "all") {
      targetIntakes = displayableIntakes.slice(0, 3);
    } else {
      targetIntakes = typeOrder
        .map((type) =>
          displayableIntakes.find((item) => getApplicationType(item) === type)
        )
        .filter(Boolean);
    }

    return targetIntakes.map((intake) => {
      const intakeId = intake.id != null ? String(intake.id) : "";
      const intakeLabel = getIntakeLabel(intake);
      const intakeType = getApplicationType(intake);

      const stat = {
        key: intakeId || `${intakeType}::${intakeLabel}`,
        label: `${getApplicationTypeLabel(intake)} / ${intakeLabel}`,
        total: 0,
        submitted: 0,
        under_review: 0,
        missing_documents: 0,
        approved: 0,
      };

      activeApplications.forEach((item) => {
        const linkedIntake = getLinkedIntake(item);
        const linkedIntakeId =
          linkedIntake?.id != null ? String(linkedIntake.id) : "";
        const itemIntakeId = item.intake_id != null ? String(item.intake_id) : "";
        const itemLabel = getScopedIntakeLabel(item);

        const sameById =
          intakeId &&
          (linkedIntakeId === intakeId || itemIntakeId === intakeId);

        const sameByFallback =
          !sameById &&
          !itemIntakeId &&
          getApplicationType(item) === intakeType &&
          itemLabel === intakeLabel;

        if (!sameById && !sameByFallback) return;

        stat.total += 1;

        const status = String(item.status || "").toLowerCase();
        if (status === "submitted") stat.submitted += 1;
        if (status === "under_review") stat.under_review += 1;
        if (status === "missing_documents") stat.missing_documents += 1;
        if (status === "approved") stat.approved += 1;
      });

      return stat;
    });
  }, [
    activeApplications,
    intakes,
    selectedApplicationType,
    selectedIntake,
    language,
  ]);

  const statusPieData = useMemo(() => {
    return [
      { name: t.statusLabels.draft, value: stats.draft, color: STATUS_COLORS.draft },
      { name: t.statusLabels.submitted, value: stats.submitted, color: STATUS_COLORS.submitted },
      { name: t.statusLabels.under_review, value: stats.underReview, color: STATUS_COLORS.under_review },
      { name: t.statusLabels.missing_documents, value: stats.missingDocuments, color: STATUS_COLORS.missing_documents },
      { name: t.statusLabels.approved, value: stats.approved, color: STATUS_COLORS.approved },
      { name: t.statusLabels.rejected, value: stats.rejected, color: STATUS_COLORS.rejected },
    ].filter((item) => item.value > 0);
  }, [stats, t]);

  const countryStats = useMemo(() => {
    const map = new Map();

    activeApplications.forEach((item) => {
      const rawCountry = item.nationality_applicant || item.nationality || "";
      const countryName = normalizeCountry(rawCountry);

      if (!map.has(countryName)) {
        map.set(countryName, {
          name: countryName,
          count: 0,
        });
      }

      map.get(countryName).count += 1;
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [activeApplications, language]);

  const topCountries = useMemo(() => countryStats.slice(0, 10), [countryStats]);

  const monthlyTrendData = useMemo(() => {
    const now = new Date();
    const buckets = [];

    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      buckets.push({
        key,
        label:
          language === "en"
            ? d.toLocaleString("en-US", { month: "short" })
            : `${d.getMonth() + 1}${t.monthSuffix}`,
        count: 0,
      });
    }

    activeApplications.forEach((item) => {
      const created = item.created_at ? new Date(item.created_at) : null;
      if (!created || Number.isNaN(created.getTime())) return;

      const key = `${created.getFullYear()}-${String(created.getMonth() + 1).padStart(2, "0")}`;
      const bucket = buckets.find((b) => b.key === key);
      if (bucket) bucket.count += 1;
    });

    return buckets;
  }, [activeApplications, language, t.monthSuffix]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.pageTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.pageDesc}</p>
        </div>

                <div className="grid w-full max-w-[720px] gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.typeFilterLabel}
            </label>
            <select
              value={selectedApplicationType}
              onChange={(e) => {
                setSelectedApplicationType(e.target.value);
                setSelectedIntake("all");
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allApplicationTypes}</option>
              <option value="undergraduate">{getApplicationTypeLabel({ application_type: "undergraduate" })}</option>
              <option value="language">{getApplicationTypeLabel({ application_type: "language" })}</option>
              <option value="graduate">{getApplicationTypeLabel({ application_type: "graduate" })}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filterLabel}
            </label>
            <select
              value={selectedIntake}
              onChange={(e) => setSelectedIntake(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allIntakes}</option>
                            {intakeOptions
                .filter((option) => {
                  if (selectedApplicationType === "all") return true;
                  return option.applicationType === selectedApplicationType;
                })
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
        </div>

      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-sm text-slate-500 shadow-sm">
          {t.loading}
        </div>
      ) : loadError ? (
        <div className="rounded-2xl border border-red-200 bg-white px-6 py-8 text-sm text-red-600 shadow-sm">
          {loadError}
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            <StatCard title={t.stats.total} value={stats.total} desc={t.stats.totalDesc} />
            <StatCard title={t.stats.draft} value={stats.draft} desc={t.stats.draftDesc} />
            <StatCard title={t.stats.submitted} value={stats.submitted} desc={t.stats.submittedDesc} />
            <StatCard title={t.stats.underReview} value={stats.underReview} desc={t.stats.underReviewDesc} />
            <StatCard title={t.stats.missing} value={stats.missingDocuments} desc={t.stats.missingDesc} />
            <StatCard title={t.stats.approved} value={stats.approved} desc={t.stats.approvedDesc} />
            <StatCard title={t.stats.rejected} value={stats.rejected} desc={t.stats.rejectedDesc} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.remindersTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.remindersDesc}</p>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="rounded-2xl bg-amber-50 p-4">
                  <div className="text-sm text-amber-700">{t.reminders.awaiting}</div>
                  <div className="mt-2 text-2xl font-bold text-amber-800">
                    {reminders.awaitingReview}
                  </div>
                </div>

                <div className="rounded-2xl bg-orange-50 p-4">
                  <div className="text-sm text-orange-700">{t.reminders.reviewing}</div>
                  <div className="mt-2 text-2xl font-bold text-orange-800">
                    {reminders.underReview}
                  </div>
                </div>

                <div className="rounded-2xl bg-red-50 p-4">
                  <div className="text-sm text-red-700">{t.reminders.missing}</div>
                  <div className="mt-2 text-2xl font-bold text-red-800">
                    {reminders.missingDocuments}
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 p-4">
                  <div className="text-sm text-emerald-700">{t.reminders.todayNew}</div>
                  <div className="mt-2 text-2xl font-bold text-emerald-800">
                    {reminders.todayNew}
                  </div>
                </div>

                <div className="rounded-2xl bg-blue-50 p-4">
                  <div className="text-sm text-blue-700">{t.reminders.deadline}</div>
                  <div className="mt-2 text-2xl font-bold text-blue-800">
                    {reminders.upcomingDeadline}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.quickTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.quickDesc}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  to="/applications"
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700"
                >
                  {t.quickLinks.applications}
                </Link>
                <Link
                  to="/intakes"
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {t.quickLinks.intakes}
                </Link>
                <Link
                  to="/agencies"
                  className="rounded-xl bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-slate-900"
                >
                  {t.quickLinks.agencies}
                </Link>
                <Link
                  to="/applications"
                  className="rounded-xl bg-amber-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-amber-600"
                >
                  {t.quickLinks.missing}
                </Link>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.recentTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.recentDesc}</p>
                </div>

                <Link
                  to="/applications"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  {t.viewAll}
                </Link>
              </div>

              {recentApplications.length === 0 ? (
                <div className="px-6 py-8 text-sm text-slate-500">{t.noApplications}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.agency}</th>
<th className="px-6 py-4 font-semibold">{t.table.applicationType}</th>
<th className="px-6 py-4 font-semibold">{t.table.intake}</th>
<th className="px-6 py-4 font-semibold">{t.table.status}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.updatedAt}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((student, index) => {
                        const publicId = student.public_id;
                        const status = student.status || "draft";

                        return (
                          <tr
                            key={student.id || publicId}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-6 py-4 font-medium text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">
                              {publicId ? (
                                <Link
                                  to={`/applications/${publicId}/review`}
                                  className="block text-blue-600 hover:text-blue-700 hover:underline"
                                  title={getStudentName(student)}
                                >
                                  <EllipsisText
                                    text={getStudentName(student)}
                                    widthClass="max-w-[140px]"
                                  />
                                </Link>
                              ) : (
                                <div title={getStudentName(student)}>
                                  <EllipsisText
                                    text={getStudentName(student)}
                                    widthClass="max-w-[140px]"
                                  />
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
  <EllipsisText
    text={getAgency(student, agencyMap)}
    widthClass="max-w-[150px]"
  />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText
    text={getApplicationTypeLabel(student)}
    widthClass="max-w-[120px]"
  />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText
    text={getScopedIntakeLabel(student)}
    widthClass="max-w-[170px]"
  />
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
                                  to={`/applications/${publicId}/review`}
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
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.openIntakesTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.openIntakesDesc}</p>
                </div>

                <div className="mt-5 space-y-4">
                  {currentOpenIntakes.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                      {t.noOpenIntakes}
                    </div>
                  ) : (
                    currentOpenIntakes.map((intake) => (
                      <div
                        key={intake.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <div className="font-semibold text-slate-900">
  {getScopedIntakeOptionLabel(intake)}
</div>
                        <div className="mt-2 text-sm text-slate-500">
                          {t.openTime}：{formatDateTime(intake.open_at)} ~ {formatDateTime(intake.close_at)}
                        </div>
                        <div className="mt-3">
                          <StatusBadge type={getIntakeProgressType(intake)}>
                            {getIntakeProgressLabel(intake)}
                          </StatusBadge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.intakeStatsTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.intakeStatsDesc}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {intakeStats.length === 0 ? (
                    <div className="text-sm text-slate-500">{t.noIntakeStats}</div>
                  ) : (
                    intakeStats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-slate-200 px-4 py-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-slate-800">
                            {item.label}
                          </div>
                          <div className="text-sm font-bold text-slate-900">
                            {item.total}
                            {t.intakeStats.people ? ` ${t.intakeStats.people}` : ""}
                          </div>
                        </div>
                        <div className="mt-2 grid grid-cols-4 gap-2 text-xs text-slate-500">
                          <div>{t.intakeStats.submitted} {item.submitted}</div>
                          <div>{t.intakeStats.underReview} {item.under_review}</div>
                          <div>{t.intakeStats.missing} {item.missing_documents}</div>
                          <div>{t.intakeStats.approved} {item.approved}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t.topCountriesTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.topCountriesDesc}</p>
              </div>

              <div className="h-[380px]">
                {topCountries.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    {t.noCountryStats}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCountries}
                      layout="vertical"
                      margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={110} />
                      <Tooltip />
                      <Bar dataKey="count" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t.statusPieTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.statusPieDesc}</p>
              </div>

              <div className="h-[360px]">
                {statusPieData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    {t.noStatusStats}
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={2}
                      >
                        {statusPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t.trendTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.trendDesc}</p>
              </div>

              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTrendData}
                    margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t.mapTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.mapDesc}</p>
              </div>

              <div className="space-y-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                <div className="text-sm text-slate-700">{t.mapText1}</div>
                <div className="text-sm text-slate-700">{t.mapText2}</div>
                <ul className="list-disc pl-5 text-sm leading-7 text-slate-600">
                  <li>{t.mapList1}</li>
                  <li>{t.mapList2}</li>
                  <li>{t.mapList3}</li>
                </ul>
                <div className="text-sm text-slate-700">{t.mapText3}</div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default DashboardPage;