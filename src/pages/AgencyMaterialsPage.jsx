import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const messages = {
  zh: {
    currentIntake: "当前批次",
    noOpenIntake: "当前没有开放批次",
    startTime: "开始时间",
    endTime: "截止时间",
    noOpenIntakeDesc: "当前没有正在开放的申请批次，因此此页不显示申请记录。",
    searchLabel: "学生姓名 / 专业",
    searchPlaceholder: "输入姓名或专业搜索",
    overallLabel: "总体状态",
    allStatus: "全部状态",
    overallComplete: "材料齐全",
    overallNeedSupplement: "需补件",
    overallPending: "待确认",
    backToApplications: "返回我的申请",
    title: "材料状态",
    desc: "仅显示当前批次申请的材料状态",
    loading: "正在加载材料状态...",
    loadError: "材料状态加载失败，请检查 Supabase 数据。",
    noRowsNoIntake: "当前没有开放批次，暂无可显示的材料状态。",
    noRows: "当前批次下没有符合条件的材料记录",
    table: {
      index: "序号",
      studentName: "学生姓名",
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
      reviewNote: "申请审核备注",
      actions: "操作",
      continueEdit: "继续编辑",
      deleteApplication: "删除申请",
      missingPublicId: "缺少 public_id",
      noNote: "—",
      reviewNotePrefix: "审核备注：",
    },
    material: {
      systemGenerated: "系统生成",
      exempt: "免提交",
      optional: "可不提交",
      uploaded: "已上传",
      missing: "缺失",
      needSupplement: "待补件",
      approved: "已通过",
    },
    overall: {
      complete: "材料齐全",
      needSupplement: "需补件",
      pending: "待确认",
    },
    delete: {
      invalidSession: "当前机构登录状态无效，请重新登录后再删除",
      missingId: "缺少申请标识，无法删除。",
      confirm: "确定要删除",
      confirmSuffix: "的申请吗？\n\n此操作会同时删除申请记录和已上传材料，删除后无法恢复。",
      success: "申请已删除。",
      failed: "删除失败：",
    },
    intakeRoundPrefix: "第",
    intakeRoundSuffix: "批",
    yearSuffix: "年",
    monthSuffix: "月",
  },
  en: {
    currentIntake: "Current Intake",
    noOpenIntake: "No Open Intake",
    startTime: "Start Time",
    endTime: "Deadline",
    noOpenIntakeDesc: "There is currently no open intake, so no application records are shown on this page.",
    searchLabel: "Student Name / Major",
    searchPlaceholder: "Search by name or major",
    overallLabel: "Overall Status",
    allStatus: "All Statuses",
    overallComplete: "Complete",
    overallNeedSupplement: "Need Supplement",
    overallPending: "Pending Confirmation",
    backToApplications: "Back to My Applications",
    title: "Material Status",
    desc: "Only material statuses for applications in the current intake are shown",
    loading: "Loading material status...",
    loadError: "Failed to load material status. Please check Supabase data.",
    noRowsNoIntake: "There is currently no open intake, so there is no material status to display.",
    noRows: "No material records match the current intake and filter",
    table: {
      index: "No.",
      studentName: "Student Name",
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
      reviewNote: "Application Review Note",
      actions: "Actions",
      continueEdit: "Continue Editing",
      deleteApplication: "Delete Application",
      missingPublicId: "Missing public_id",
      noNote: "—",
      reviewNotePrefix: "Review Note: ",
    },
    material: {
      systemGenerated: "System Generated",
      exempt: "Exempt",
      optional: "Optional",
      uploaded: "Uploaded",
      missing: "Missing",
      needSupplement: "Need Supplement",
      approved: "Approved",
    },
    overall: {
      complete: "Complete",
      needSupplement: "Need Supplement",
      pending: "Pending Confirmation",
    },
    delete: {
      invalidSession: "Current agency session is invalid. Please log in again before deleting.",
      missingId: "Missing application identifier. Unable to delete.",
      confirm: "Are you sure you want to delete the application for ",
      confirmSuffix: "?\n\nThis will delete both the application record and uploaded materials. This action cannot be undone.",
      success: "The application has been deleted.",
      failed: "Delete failed: ",
    },
    intakeRoundPrefix: "Round ",
    intakeRoundSuffix: "",
    yearSuffix: "-",
    monthSuffix: "",
  },
  ko: {
    currentIntake: "현재 차수",
    noOpenIntake: "현재 오픈된 차수 없음",
    startTime: "시작 시간",
    endTime: "마감 시간",
    noOpenIntakeDesc: "현재 열려 있는 지원 차수가 없어 이 페이지에는 신청 기록이 표시되지 않습니다.",
    searchLabel: "학생 이름 / 전공",
    searchPlaceholder: "이름 또는 전공으로 검색",
    overallLabel: "종합 상태",
    allStatus: "전체 상태",
    overallComplete: "서류 완비",
    overallNeedSupplement: "보완 필요",
    overallPending: "확인 대기",
    backToApplications: "나의 지원으로 돌아가기",
    title: "서류 상태",
    desc: "현재 차수 지원서의 서류 상태만 표시합니다",
    loading: "서류 상태를 불러오는 중...",
    loadError: "서류 상태 로드에 실패했습니다. Supabase 데이터를 확인하세요.",
    noRowsNoIntake: "현재 오픈된 차수가 없어 표시할 서류 상태가 없습니다.",
    noRows: "현재 차수에 조건에 맞는 서류 기록이 없습니다",
    table: {
      index: "번호",
      studentName: "학생 이름",
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
      reviewNote: "지원 심사 메모",
      actions: "작업",
      continueEdit: "계속 수정",
      deleteApplication: "지원 삭제",
      missingPublicId: "public_id 없음",
      noNote: "—",
      reviewNotePrefix: "심사 메모: ",
    },
    material: {
      systemGenerated: "시스템 생성",
      exempt: "면제",
      optional: "선택 제출",
      uploaded: "업로드됨",
      missing: "누락",
      needSupplement: "보완 필요",
      approved: "승인",
    },
    overall: {
      complete: "서류 완비",
      needSupplement: "보완 필요",
      pending: "확인 대기",
    },
    delete: {
      invalidSession: "현재 기관 로그인 상태가 유효하지 않습니다. 다시 로그인 후 삭제하세요.",
      missingId: "신청 식별자가 없어 삭제할 수 없습니다.",
      confirm: "",
      confirmSuffix: "의 지원서를 삭제하시겠습니까?\n\n이 작업은 지원 기록과 업로드된 서류를 함께 삭제하며 복구할 수 없습니다.",
      success: "지원서가 삭제되었습니다.",
      failed: "삭제 실패: ",
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

function AgencyMaterialsPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
const [applicationFiles, setApplicationFiles] = useState([]);
const [currentIntakes, setCurrentIntakes] = useState([]);
const [agencyUnits, setAgencyUnits] = useState([]);
const [loading, setLoading] = useState(true);
const [loadError, setLoadError] = useState("");

const [searchKeyword, setSearchKeyword] = useState("");
const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
const [overallFilter, setOverallFilter] = useState("all");

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

  const renderCurrentIntakeCard = (intake, fallbackType) => {
    const label = getApplicationTypeLabel(
      intake || { application_type: fallbackType }
    );

    if (!intake) {
      return (
        <div className="rounded-2xl bg-slate-50 px-5 py-4">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="mt-2 text-lg font-bold text-slate-900">
            {t.noOpenIntake}
          </div>
          <div className="mt-2 text-sm text-slate-500">{t.noOpenIntakeDesc}</div>
        </div>
      );
    }

    return (
      <div className="rounded-2xl bg-slate-50 px-5 py-4">
        <div className="text-sm text-slate-500">{label}</div>
        <div className="mt-2 text-lg font-bold text-slate-900">
          {getIntakeLabel(intake)}
        </div>
        <div className="mt-2 text-sm text-slate-600">
          {t.startTime}：{formatDateTime(intake.open_at)}
          <span className="mx-2">~</span>
          {t.endTime}：{formatDateTime(intake.close_at)}
        </div>
      </div>
    );
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

  const getFileTypeMap = (files) => {
    return (files || []).reduce((acc, file) => {
      if (!acc[file.public_id]) acc[file.public_id] = {};
      if (!acc[file.public_id][file.file_type]) acc[file.public_id][file.file_type] = [];
      acc[file.public_id][file.file_type].push(file);
      return acc;
    }, {});
  };

  const getMaterialStatus = (
    fileEntry,
    required,
    systemGenerated = false,
    exempt = false
  ) => {
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
  };

  const getOverallStatus = (statuses) => {
    const requiredStatuses = statuses.filter((item) => !item.exempt && !item.systemGenerated);

    const hasMissingRequired = requiredStatuses.some(
      (item) => item.required && item.label === t.material.missing
    );

    if (hasMissingRequired) {
      return { label: t.overall.needSupplement, type: "danger" };
    }

    const hasPendingOptional = requiredStatuses.some(
      (item) =>
        !item.required &&
        item.label !== t.material.uploaded &&
        item.label !== t.material.optional
    );

    if (hasPendingOptional) {
      return { label: t.overall.pending, type: "warning" };
    }

    return { label: t.overall.complete, type: "success" };
  };

  useEffect(() => {
  async function loadData() {
    if (!agencySession?.agency_id) return;

    try {
      setLoading(true);
      setLoadError("");

      const nowIso = new Date().toISOString();

      const applicationsQuery = supabase
        .from("applications")
        .select("*")
        .eq("agency_id", agencySession.agency_id)
        .order("updated_at", { ascending: false });

      if (agencySession?.is_primary !== true) {
        applicationsQuery.eq("agency_unit_id", agencySession?.agency_unit_id || "");
      }

      const [
  { data: intakeData, error: intakeError },
  { data: applicationsData, error: applicationsError },
  { data: agencyUnitsData, error: agencyUnitsError },
] = await Promise.all([
  supabase
    .from("intakes")
    .select("*")
    .eq("is_active", true)
    .lte("open_at", nowIso)
    .gte("close_at", nowIso)
    .order("open_at", { ascending: true }),
  applicationsQuery,
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
if (applicationsError) throw applicationsError;
if (agencyUnitsError) throw agencyUnitsError;

const visibleApplications = applicationsData || [];

      const visiblePublicIds = visibleApplications
        .map((item) => item.public_id)
        .filter(Boolean);

      let filesData = [];

      if (visiblePublicIds.length > 0) {
        const { data, error } = await supabase
          .from("application_files")
          .select("*")
          .in("public_id", visiblePublicIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        filesData = data || [];
      }

      setCurrentIntakes(intakeData || []);
setApplications(visibleApplications);
setApplicationFiles(filesData);
setAgencyUnits(agencyUnitsData || []);

    } catch (error) {
      console.error("AgencyMaterialsPage loadData error:", error);
      setLoadError(error.message || t.loadError);
    } finally {
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

  const handleDeleteApplication = async (row) => {
    const studentName = row.studentName || "Student";
    const publicId = row.publicId;
    const applicationId = row.student?.id;

    if (!applicationId || !publicId) {
      alert(t.delete.missingId);
      return;
    }

    if (!agencySession?.agency_id) {
      alert(t.delete.invalidSession);
      return;
    }

    const confirmText =
      language === "ko"
        ? `${studentName}${t.delete.confirmSuffix}`
        : `${t.delete.confirm}${studentName}${t.delete.confirmSuffix}`;

    const confirmed = window.confirm(confirmText);

    if (!confirmed) return;

    try {
      const filesToDelete = applicationFiles.filter(
        (file) => file.public_id === publicId
      );

      if (filesToDelete.length > 0) {
        const storagePaths = filesToDelete
          .map((file) => file.file_path)
          .filter(Boolean);

        if (storagePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from("application-files")
            .remove(storagePaths);

          if (storageError) throw storageError;
        }

        const { error: fileDeleteError } = await supabase
          .from("application_files")
          .delete()
          .eq("public_id", publicId);

        if (fileDeleteError) throw fileDeleteError;
      }

      const applicationDeleteQuery = supabase
  .from("applications")
  .delete()
  .eq("id", applicationId)
  .eq("agency_id", agencySession.agency_id);

if (agencySession?.is_primary !== true) {
  applicationDeleteQuery.eq("agency_unit_id", agencySession?.agency_unit_id || "");
}

const { error: applicationDeleteError } = await applicationDeleteQuery;

      if (applicationDeleteError) throw applicationDeleteError;

      alert(t.delete.success);
      window.location.reload();
    } catch (error) {
      console.error("handleDeleteApplication error:", error);
      alert(`${t.delete.failed}${error.message}`);
    }
  };

      const getCurrentIntakeByType = (applicationType) => {
    return (
      currentIntakes.find(
        (item) => (item.application_type || "undergraduate") === applicationType
      ) || null
    );
  };


    const undergraduateCurrentIntake = useMemo(() => {
    return getCurrentIntakeByType("undergraduate");
  }, [currentIntakes]);

  const languageCurrentIntake = useMemo(() => {
    return getCurrentIntakeByType("language");
  }, [currentIntakes]);

  const graduateCurrentIntake = useMemo(() => {
    return getCurrentIntakeByType("graduate");
  }, [currentIntakes]);

      const currentBatchApplications = useMemo(() => {
    const activeIntakeIds = [
      undergraduateCurrentIntake?.id,
      languageCurrentIntake?.id,
      graduateCurrentIntake?.id,
    ]
      .map((id) => (id ? String(id) : ""))
      .filter(Boolean);

    if (activeIntakeIds.length === 0) return [];

    return applications.filter((item) => {
      const status = String(item.status || "").toLowerCase();

      if (
        status !== "submitted" &&
        status !== "under_review" &&
        status !== "missing_documents" &&
        status !== "approved"
      ) {
        return false;
      }

      const intakeId = item?.intake_id ? String(item.intake_id) : "";
      return !!intakeId && activeIntakeIds.includes(intakeId);
    });
  }, [
    applications,
    undergraduateCurrentIntake,
    languageCurrentIntake,
    graduateCurrentIntake,
  ]);

  const fileMap = useMemo(() => getFileTypeMap(applicationFiles), [applicationFiles]);

  const rows = useMemo(() => {
    return currentBatchApplications.map((student) => {
      const publicId = student.public_id;
      const files = fileMap[publicId] || {};

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
        application_type: student.application_type || "undergraduate",
intake_id: student.intake_id || "",
        studentName: getStudentName(student),
agencyUnitName: getAgencyUnitName(student),
applicationType: getApplicationTypeLabel(student),
        intake: getIntakeLabel(student),
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
  }, [currentBatchApplications, fileMap, language]);

    const filteredRows = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesKeyword =
        !keyword ||
        row.studentName.toLowerCase().includes(keyword) ||
        (row.student.major || "").toLowerCase().includes(keyword);

      const matchesApplicationType =
        applicationTypeFilter === "all" ||
        getApplicationType(row.student) === applicationTypeFilter;

      const matchesOverall =
        overallFilter === "all" || row.overall.label === overallFilter;

      return matchesKeyword && matchesApplicationType && matchesOverall;
    });
  }, [rows, searchKeyword, applicationTypeFilter, overallFilter, language]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-4 md:grid-cols-3">
          {renderCurrentIntakeCard(undergraduateCurrentIntake, "undergraduate")}
          {renderCurrentIntakeCard(languageCurrentIntake, "language")}
          {renderCurrentIntakeCard(graduateCurrentIntake, "graduate")}
        </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.searchLabel}
            </label>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              placeholder={t.searchPlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {language === "en" ? "Application Type" : language === "ko" ? "지원 유형" : "申请类型"}
            </label>
            <select
              value={applicationTypeFilter}
              onChange={(e) => setApplicationTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">{language === "en" ? "All Types" : language === "ko" ? "전체 유형" : "全部类型"}</option>
              <option value="undergraduate">{getApplicationTypeLabel({ application_type: "undergraduate" })}</option>
              <option value="language">{getApplicationTypeLabel({ application_type: "language" })}</option>
              <option value="graduate">{getApplicationTypeLabel({ application_type: "graduate" })}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.overallLabel}
            </label>
            <select
              value={overallFilter}
              onChange={(e) => setOverallFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">{t.allStatus}</option>
              <option value={t.overall.complete}>{t.overall.complete}</option>
              <option value={t.overall.needSupplement}>{t.overall.needSupplement}</option>
              <option value={t.overall.pending}>{t.overall.pending}</option>
            </select>
          </div>

          <div className="flex items-end">
            <Link
              to="/agency/applications"
              className="inline-flex rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              {t.backToApplications}
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{t.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.desc}</p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.loading}</div>
        ) : loadError ? (
          <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
                ) : currentIntakes.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            {t.noRowsNoIntake}
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            {t.noRows}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1500px] text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t.table.index}</th>
<th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
{isPrimarySession ? (
  <th className="px-6 py-4 font-semibold">{agencyUnitColumnLabel}</th>
) : null}
<th className="px-6 py-4 font-semibold">
  {language === "en" ? "Application Type" : language === "ko" ? "지원 유형" : "申请类型"}
</th>
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
                  <th className="px-6 py-4 font-semibold">{t.table.reviewNote}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
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
{isPrimarySession ? (
  <td className="px-6 py-4 text-slate-600">
    <EllipsisText text={row.agencyUnitName} widthClass="max-w-[170px]" />
  </td>
) : null}
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={row.applicationType} widthClass="max-w-[120px]" />
</td>
<td className="px-6 py-4 text-slate-600">
                      <EllipsisText text={row.intake} widthClass="max-w-[170px]" />
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
                            {t.table.reviewNotePrefix}{row.passport.note}
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
                            {t.table.reviewNotePrefix}{row.finalTranscript.note}
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
                            {t.table.reviewNotePrefix}{row.finalDiploma.note}
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
                            {t.table.reviewNotePrefix}{row.languageCertificate.note}
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
                            {t.table.reviewNotePrefix}{row.arc.note}
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
                            {t.table.reviewNotePrefix}{row.bankStatement.note}
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
                            {t.table.reviewNotePrefix}{row.guarantorEmploymentIncome.note}
                          </div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge type={row.overall.type}>
                        {row.overall.label}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.publicId ? (
                        <div className="flex flex-wrap gap-2">
                                                      <Link
                              to={buildEditApplicationUrl(row)}
                              className="inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                            >

                            {t.table.continueEdit}
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteApplication(row)}
                            className="inline-flex rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            {t.table.deleteApplication}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-red-500">{t.table.missingPublicId}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AgencyMaterialsPage;