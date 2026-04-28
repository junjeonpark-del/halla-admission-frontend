import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const messages = {
  zh: {
    pageTitle: "机构主页",
    pageDesc: "查看当前开放批次、本机构申请统计和最近申请记录",
        typeFilterLabel: "申请类型",
    allApplicationTypes: "全部类型",
    filterLabel: "统计批次筛选",
    allIntakes: "全部批次",
    newApplication: "新建申请",
    loading: "正在加载主页数据...",
    defaultLoadError: "主页数据加载失败，请检查 Supabase 数据。",
    stats: {
      total: "本机构总申请",
      totalDesc: "已提交、审核中、缺少材料、已通过",
      draft: "草稿",
      draftDesc: "尚未正式提交的申请",
      submitted: "已提交",
      submittedDesc: "已提交等待学校处理",
      underReview: "审核中",
      underReviewDesc: "学校正在审核的申请",
      missingDocuments: "缺少材料",
      missingDocumentsDesc: "需要补件的申请",
      approved: "已通过",
      approvedDesc: "当前已通过的申请",
      rejected: "已拒绝",
      rejectedDesc: "当前已被拒绝的申请",
    },
    recentTitle: "最近申请",
    recentDesc: "当前筛选范围内最近创建或更新的学生申请记录",
    viewAll: "查看全部",
    noApplications: "当前机构暂无申请数据",
    table: {
      index: "序号",
            studentName: "学生姓名",
      applicationType: "申请类型",
      intake: "申请批次",
      major: "专业",
      status: "状态",
      actions: "操作",
      continueEdit: "继续编辑",
      notEditable: "不可编辑",
    },
    currentOpenTitle: "当前开放批次",
    currentOpenDesc: "管理员设置后，机构端自动显示可用批次",
    noOpenIntakes: "当前没有开放批次",
    openTime: "开放时间",
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
    intakeRoundPrefix: "第",
    intakeRoundSuffix: "批",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  en: {
    pageTitle: "Agency Dashboard",
    pageDesc: "View current open intakes, your agency's application statistics, and recent applications",
        typeFilterLabel: "Application Type",
    allApplicationTypes: "All Types",
    filterLabel: "Intake Filter",
    allIntakes: "All Intakes",
    newApplication: "New Application",
    loading: "Loading dashboard data...",
    defaultLoadError: "Failed to load dashboard data. Please check Supabase data.",
    stats: {
      total: "Total Applications",
      totalDesc: "Submitted, under review, missing documents, and approved",
      draft: "Drafts",
      draftDesc: "Applications not formally submitted",
      submitted: "Submitted",
      submittedDesc: "Submitted and waiting for school processing",
      underReview: "Under Review",
      underReviewDesc: "Applications currently under school review",
      missingDocuments: "Missing Documents",
      missingDocumentsDesc: "Applications requiring additional documents",
      approved: "Approved",
      approvedDesc: "Applications currently approved",
      rejected: "Rejected",
      rejectedDesc: "Applications currently rejected",
    },
    recentTitle: "Recent Applications",
    recentDesc: "Most recently created or updated student applications in the current filter",
    viewAll: "View All",
    noApplications: "No application data for this agency",
    table: {
      index: "No.",
            studentName: "Student Name",
      applicationType: "Application Type",
      intake: "Intake",
      major: "Major",
      status: "Status",
      actions: "Actions",
      continueEdit: "Continue Editing",
      notEditable: "Not Editable",
    },
    currentOpenTitle: "Current Open Intakes",
    currentOpenDesc: "Available intakes are displayed automatically after admin setup",
    noOpenIntakes: "No open intakes currently",
    openTime: "Open period",
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
    intakeRoundPrefix: "Round ",
    intakeRoundSuffix: "",
    yearSuffix: "-",
    monthSuffix: "",
  },
  ko: {
    pageTitle: "기관 홈",
    pageDesc: "현재 오픈 차수, 기관 지원 통계 및 최근 지원 기록을 확인합니다",
        typeFilterLabel: "지원 유형",
    allApplicationTypes: "전체 유형",
    filterLabel: "차수 통계 필터",
    allIntakes: "전체 차수",
    newApplication: "새 지원서",
    loading: "홈 데이터를 불러오는 중...",
    defaultLoadError: "홈 데이터 로드에 실패했습니다. Supabase 데이터를 확인하세요.",
    stats: {
      total: "기관 총 지원",
      totalDesc: "제출 완료, 심사 중, 서류 부족, 승인",
      draft: "초안",
      draftDesc: "아직 정식 제출되지 않은 지원서",
      submitted: "제출 완료",
      submittedDesc: "학교 처리 대기 중인 지원서",
      underReview: "심사 중",
      underReviewDesc: "학교에서 심사 중인 지원서",
      missingDocuments: "서류 부족",
      missingDocumentsDesc: "보완 제출이 필요한 지원서",
      approved: "승인",
      approvedDesc: "현재 승인된 지원서",
      rejected: "거절",
      rejectedDesc: "현재 거절된 지원서",
    },
    recentTitle: "최근 지원",
    recentDesc: "현재 필터 범위 내 최근 생성 또는 업데이트된 학생 지원 기록",
    viewAll: "전체 보기",
    noApplications: "현재 기관에 지원 데이터가 없습니다",
    table: {
      index: "번호",
            studentName: "학생 이름",
      applicationType: "지원 유형",
      intake: "지원 차수",
      major: "전공",
      status: "상태",
      actions: "작업",
      continueEdit: "계속 수정",
      notEditable: "수정 불가",
    },
    currentOpenTitle: "현재 오픈 차수",
    currentOpenDesc: "관리자 설정 후 기관 화면에 자동 표시됩니다",
    noOpenIntakes: "현재 오픈된 차수가 없습니다",
    openTime: "오픈 기간",
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
    intakeRoundPrefix: "",
    intakeRoundSuffix: "차",
    yearSuffix: "년",
    monthSuffix: "월",
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

function AgencyDashboardPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [applications, setApplications] = useState([]);
  const [intakes, setIntakes] = useState([]);
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

  const getIntakeLabel = (intake) => {
    if (!intake) return "-";

    if (intake.title && String(intake.title).trim() !== "") {
      return intake.title;
    }

    const year = intake.year || "";
    const month = intake.intake_month || "";
    const round = intake.round_number || "";

    if (year && month && round) {
      if (language === "en") {
        return `${year}-${month} ${t.intakeRoundPrefix}${round}`;
      }

      if (language === "ko") {
        return `${year}${t.yearSuffix}${month}${t.monthSuffix} ${round}${t.intakeRoundSuffix}`;
      }

      return `${year}${t.yearSuffix}${month}${t.monthSuffix} ${t.intakeRoundPrefix}${round}${t.intakeRoundSuffix}`;
    }

    return intake.id || "-";
  };

    const getApplicationIntakeLabel = (app) => {
    const matchedIntake = intakes.find((intake) => intake.id === app.intake_id);

    if (matchedIntake) {
      return getIntakeLabel(matchedIntake);
    }

    if (app.intake_name && String(app.intake_name).trim() !== "") {
      return app.intake_name;
    }

    if (app.intake_title && String(app.intake_title).trim() !== "") {
      return app.intake_title;
    }

    if (app.intake_year && app.intake_month && app.intake_round_number) {
      if (language === "en") {
        return `${app.intake_year}-${app.intake_month} ${t.intakeRoundPrefix}${app.intake_round_number}`;
      }

      if (language === "ko") {
        return `${app.intake_year}${t.yearSuffix}${app.intake_month}${t.monthSuffix} ${app.intake_round_number}${t.intakeRoundSuffix}`;
      }

      return `${app.intake_year}${t.yearSuffix}${app.intake_month}${t.monthSuffix} ${t.intakeRoundPrefix}${app.intake_round_number}${t.intakeRoundSuffix}`;
    }

    return app.intake_id || "-";
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

    if (openAt && now < openAt) return "warning";
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

  const getLinkedIntake = (app) => {
    if (!app?.intake_id) return null;
    return intakes.find((intake) => intake.id === app.intake_id) || null;
  };

  const getContinueEditAvailability = (app) => {
    if (!app?.public_id) {
      return { canContinueEdit: false, reason: "missing_public_id" };
    }

    const intakeItem = getLinkedIntake(app);
    if (!intakeItem) {
      return { canContinueEdit: true, reason: "unknown" };
    }

    const now = new Date();
    const openAt = intakeItem.open_at ? new Date(intakeItem.open_at) : null;
    const closeAt = intakeItem.close_at ? new Date(intakeItem.close_at) : null;

    if (intakeItem.is_active === false) {
      return { canContinueEdit: false, reason: "inactive" };
    }

    if (openAt && now < openAt) {
      return { canContinueEdit: false, reason: "not_started" };
    }

    if (closeAt && now > closeAt) {
      return { canContinueEdit: false, reason: "closed" };
    }

    return { canContinueEdit: true, reason: "open" };
  };

  useEffect(() => {
    async function loadData() {
      if (!agencySession?.agency_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const [
          { data: applicationsData, error: applicationsError },
          { data: intakesData, error: intakesError },
        ] = await Promise.all([
          supabase
            .from("applications")
            .select("*")
            .eq("agency_id", agencySession.agency_id)
            .order("created_at", { ascending: false }),
                    supabase
            .from("intakes")
            .select("*")
            .order("open_at", { ascending: true }),
        ]);

        if (applicationsError) throw applicationsError;
        if (intakesError) throw intakesError;

        setApplications(applicationsData || []);
        setIntakes(intakesData || []);
      } catch (error) {
        console.error("AgencyDashboardPage loadData error:", error);
        setLoadError(error.message || t.defaultLoadError);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [agencySession?.agency_id, t.defaultLoadError]);

      const intakeOptions = useMemo(() => {
    const map = new Map();

    applications.forEach((item) => {
      const status = String(item.status || "").toLowerCase();
      if (!status || status === "draft") return;

      const intakeLabel = getApplicationIntakeLabel(item);
      if (!intakeLabel || intakeLabel === "-") return;

      const applicationType = getApplicationType(item);
      const label = `${getApplicationTypeLabel(item)} / ${intakeLabel}`;

      map.set(label, {
        value: label,
        label,
        applicationType,
      });
    });

    return Array.from(map.values());
  }, [applications, language]);

    const filteredApplications = useMemo(() => {
    return applications.filter((item) => {
      const matchesType =
        selectedApplicationType === "all" ||
        getApplicationType(item) === selectedApplicationType;

      if (!matchesType) return false;

            if (selectedIntake === "all") return true;

      return `${getApplicationTypeLabel(item)} / ${getApplicationIntakeLabel(item)}` === selectedIntake;

    });
  }, [applications, selectedApplicationType, selectedIntake, language]);

  const totalApplications = useMemo(() => {
    return filteredApplications.filter((item) => {
      const status = String(item.status || "").toLowerCase();
      return (
        status === "submitted" ||
        status === "under_review" ||
        status === "missing_documents" ||
        status === "approved"
      );
    });
  }, [filteredApplications]);

  const stats = useMemo(() => {
    const total = totalApplications.length;

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
  }, [filteredApplications, totalApplications]);

  const recentApplications = useMemo(() => {
    return [...totalApplications]
      .sort((a, b) => {
        const aTime = new Date(a.updated_at || a.created_at || 0).getTime();
        const bTime = new Date(b.updated_at || b.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [totalApplications]);

    const MAX_BATCH_INFO_ITEMS_PER_TYPE = 2;

  const batchInfoCardText = useMemo(() => {
    if (language === "en") {
      return {
        title: "Application Intake Info",
        desc: "See ongoing and upcoming intakes by application type",
        empty: "No intake information available right now",
        emptyType: "No available intake for this type",
      };
    }

    if (language === "ko") {
      return {
        title: "지원 차수 안내",
        desc: "지원 유형별로 진행 중이거나 예정된 차수를 확인하세요",
        empty: "현재 표시할 차수 정보가 없습니다",
        emptyType: "해당 유형의 차수가 없습니다",
      };
    }

    return {
      title: "申请批次信息",
      desc: "按申请类型查看进行中与即将开放的批次",
      empty: "当前没有可展示的批次信息",
      emptyType: "该类型暂无可用批次",
    };
  }, [language]);

  const intakeInfoGroups = useMemo(() => {
    const now = Date.now();

    const toTime = (value) => {
      if (!value) return 0;
      const time = new Date(value).getTime();
      return Number.isNaN(time) ? 0 : time;
    };

    const getPhase = (item) => {
      const openAt = toTime(item.open_at);
      const closeAt = toTime(item.close_at);

      if (closeAt && closeAt < now) return "closed";
      if (openAt && openAt > now) return "upcoming";
      return "ongoing";
    };

    const visibleIntakes = intakes.filter((item) => {
      if (item.is_active === false) return false;
      return getPhase(item) !== "closed";
    });

    const sortByPriority = (a, b) => {
      const phaseRank = {
        ongoing: 2,
        upcoming: 1,
      };

      const aPhase = getPhase(a);
      const bPhase = getPhase(b);

      const phaseDiff = phaseRank[bPhase] - phaseRank[aPhase];
      if (phaseDiff !== 0) return phaseDiff;

      if (aPhase === "ongoing" && bPhase === "ongoing") {
        const aClose = toTime(a.close_at) || Number.MAX_SAFE_INTEGER;
        const bClose = toTime(b.close_at) || Number.MAX_SAFE_INTEGER;
        if (aClose !== bClose) return aClose - bClose;
      }

      if (aPhase === "upcoming" && bPhase === "upcoming") {
        const aOpen = toTime(a.open_at) || Number.MAX_SAFE_INTEGER;
        const bOpen = toTime(b.open_at) || Number.MAX_SAFE_INTEGER;
        if (aOpen !== bOpen) return aOpen - bOpen;
      }

      return toTime(b.created_at) - toTime(a.created_at);
    };

    return ["undergraduate", "graduate", "language"].map((applicationType) => ({
      type: applicationType,
      label: getApplicationTypeLabel({ application_type: applicationType }),
      items: visibleIntakes
        .filter((item) => getApplicationType(item) === applicationType)
        .sort(sortByPriority)
        .slice(0, MAX_BATCH_INFO_ITEMS_PER_TYPE),
    }));
  }, [intakes, language]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{t.pageTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{t.pageDesc}</p>
        </div>

        <div className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
                      <div className="grid gap-4 md:grid-cols-2">
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
            <StatCard title={t.stats.missingDocuments} value={stats.missingDocuments} desc={t.stats.missingDocumentsDesc} />
            <StatCard title={t.stats.approved} value={stats.approved} desc={t.stats.approvedDesc} />
            <StatCard title={t.stats.rejected} value={stats.rejected} desc={t.stats.rejectedDesc} />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{t.recentTitle}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.recentDesc}</p>
                </div>

                <Link
                  to="/agency/applications"
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
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
<th className="px-6 py-4 font-semibold">{t.table.applicationType}</th>
<th className="px-6 py-4 font-semibold">{t.table.intake}</th>
<th className="px-6 py-4 font-semibold">{t.table.major}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.status}</th>
                        <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                                            {recentApplications.map((student, index) => {
                        const publicId = student.public_id;
                        const status = student.status || "draft";
                        const editAccess = getContinueEditAvailability(student);

                        return (
                          <tr
                            key={student.id || publicId || index}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <td className="px-6 py-4 font-medium text-slate-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">
  <EllipsisText text={getStudentName(student)} widthClass="max-w-[140px]" />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText
    text={getApplicationTypeLabel(student)}
    widthClass="max-w-[120px]"
  />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText
    text={getApplicationIntakeLabel(student)}
    widthClass="max-w-[170px]"
  />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={student.major || "-"} widthClass="max-w-[150px]" />
</td>
                            <td className="px-6 py-4">
                              <StatusBadge type={mapStatusType(status)}>
                                {formatStatusLabel(status)}
                              </StatusBadge>
                            </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                              {publicId && editAccess.canContinueEdit ? (
                                <Link
                                  to={buildEditApplicationUrl(student)}
                                  className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                                >
                                  {t.table.continueEdit}
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  {language === "en"
                                    ? "Not Editable"
                                    : language === "ko"
                                    ? "수정 불가"
                                    : "不可编辑"}
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

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900">
                {batchInfoCardText.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {batchInfoCardText.desc}
              </p>

              <div className="mt-5 space-y-4">
                {intakeInfoGroups.every((group) => group.items.length === 0) ? (
                  <div className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-500">
                    {batchInfoCardText.empty}
                  </div>
                ) : (
                  intakeInfoGroups.map((group) => (
                    <div
                      key={group.type}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {group.label}
                      </div>

                      <div className="mt-3 space-y-3">
                        {group.items.length === 0 ? (
                          <div className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                            {batchInfoCardText.emptyType}
                          </div>
                        ) : (
                          group.items.map((intake) => (
                            <div
                              key={intake.id}
                              className="rounded-xl border border-slate-100 px-3 py-3"
                            >
                              <div className="font-medium text-slate-900">
                                {getIntakeLabel(intake)}
                              </div>
                              <div className="mt-2 text-xs text-slate-500">
                                {t.openTime}：{formatDateTime(intake.open_at)} ~ {formatDateTime(intake.close_at)}
                              </div>
                              <div className="mt-2">
                                <StatusBadge type={getIntakeProgressType(intake)}>
                                  {getIntakeProgressLabel(intake)}
                                </StatusBadge>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AgencyDashboardPage;