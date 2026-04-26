import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "../lib/supabase";
import { fetchApplications } from "../data/applicationsApi";
import { useAdminSession } from "../contexts/AdminSessionContext";

const messages = {
  zh: {
    filtersTitle: "筛选条件",
    filtersDesc: "按学生、机构、批次和状态快速筛选申请记录",
    exportExcel: "导出 Excel",
    studentName: "学生姓名",
    studentNamePlaceholder: "输入姓名或专业搜索",
    agency: "所属机构",
    allAgencies: "全部机构",
    intake: "申请批次",
    allIntakes: "全部批次",
    applicationType: "申请类型",
    allApplicationTypes: "全部类型",
    status: "申请状态",
    allStatus: "全部状态",
    listTitle: "学生申请列表",
    listDesc: "点击学生姓名或“审核材料”按钮进入对应学生材料审核页",
    loading: "正在加载申请列表...",
    loadError: "申请列表加载失败，请检查 Supabase 数据。",
    noData: "暂无申请数据",
    noExportData: "当前没有可导出的申请数据。",
    exportFailed: "导出失败：",
    table: {
      index: "序号",
      studentName: "学生姓名",
      agency: "机构",
      intake: "申请批次",
      applicationType: "申请类型",
      status: "状态",
      major: "专业",
      actions: "操作",
      review: "审核材料",
      missingPublicId: "缺少 public_id",
    },
    statusLabels: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺少材料",
      approved: "已通过",
      rejected: "已拒绝",
      pending: "待审核",
    },
    programTrack: {
      bilingualChinese: "免提交",
    },
    applicationTypeLabels: {
      undergraduate: "本科",
      language: "语言班",
      graduate: "大学院",
    },
    admissionType: {
      freshman: "新入",
      transfer: "插班",
      dualDegree: "双学位",
      grade2: "2年级",
      grade3: "3年级",
      grade4: "4年级",
    },
    programTrackLabels: {
      korean: "韩语课程",
      english: "英语课程",
      bilingual: "双语课程",
    },
    dormitory: {
      yes: "是",
      no: "否",
    },
    excelSheetName: "申请列表",
    excelFilePrefix: "管理员申请列表",
  },
  en: {
    filtersTitle: "Filters",
    filtersDesc: "Quickly filter application records by student, agency, intake, and status",
    exportExcel: "Export Excel",
    studentName: "Student Name",
    studentNamePlaceholder: "Search by name or major",
    agency: "Agency",
    allAgencies: "All Agencies",
    intake: "Intake",
    allIntakes: "All Intakes",
    applicationType: "Application Type",
    allApplicationTypes: "All Types",
    status: "Application Status",
    allStatus: "All Statuses",
    listTitle: "Student Applications",
    listDesc: "Click the student name or “Review Materials” to open the review page",
    loading: "Loading application list...",
    loadError: "Failed to load application list. Please check Supabase data.",
    noData: "No application data",
    noExportData: "There is no application data to export.",
    exportFailed: "Export failed: ",
    table: {
      index: "No.",
      studentName: "Student Name",
      agency: "Agency",
      intake: "Intake",
      applicationType: "Application Type",
      status: "Status",
      major: "Major",
      actions: "Actions",
      review: "Review Materials",
      missingPublicId: "Missing public_id",
    },
    statusLabels: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
      pending: "Pending",
    },
    programTrack: {
      bilingualChinese: "Exempt",
    },
    applicationTypeLabels: {
      undergraduate: "Undergraduate",
      language: "Language Program",
      graduate: "Graduate School",
    },
    admissionType: {
      freshman: "Freshman",
      transfer: "Transfer",
      dualDegree: "Dual Degree",
      grade2: "Year 2",
      grade3: "Year 3",
      grade4: "Year 4",
    },
    programTrackLabels: {
      korean: "Korean Track",
      english: "English Track",
      bilingual: "Bilingual Program",
    },
    dormitory: {
      yes: "Yes",
      no: "No",
    },
    excelSheetName: "Applications",
    excelFilePrefix: "Admin_Applications",
  },
  ko: {
    filtersTitle: "필터 조건",
    filtersDesc: "학생, 기관, 차수 및 상태별로 지원 기록을 빠르게 필터링합니다",
    exportExcel: "Excel 내보내기",
    studentName: "학생 이름",
    studentNamePlaceholder: "이름 또는 전공으로 검색",
    agency: "소속 기관",
    allAgencies: "전체 기관",
    intake: "지원 차수",
    allIntakes: "전체 차수",
    applicationType: "지원 유형",
    allApplicationTypes: "전체 유형",
    status: "지원 상태",
    allStatus: "전체 상태",
    listTitle: "학생 지원 목록",
    listDesc: "학생 이름 또는 “서류 심사” 버튼을 클릭하면 해당 심사 페이지로 이동합니다",
    loading: "지원 목록을 불러오는 중...",
    loadError: "지원 목록 로드에 실패했습니다. Supabase 데이터를 확인하세요.",
    noData: "지원 데이터가 없습니다",
    noExportData: "내보낼 지원 데이터가 없습니다.",
    exportFailed: "내보내기 실패: ",
    table: {
      index: "번호",
      studentName: "학생 이름",
      agency: "기관",
      intake: "지원 차수",
      applicationType: "지원 유형",
      status: "상태",
      major: "전공",
      actions: "작업",
      review: "서류 심사",
      missingPublicId: "public_id 없음",
    },
    statusLabels: {
      draft: "초안",
      submitted: "제출 완료",
      under_review: "심사 중",
      missing_documents: "서류 부족",
      approved: "승인",
      rejected: "거절",
      pending: "대기",
    },
    programTrack: {
      bilingualChinese: "면제",
    },
    applicationTypeLabels: {
      undergraduate: "학부",
      language: "어학연수",
      graduate: "대학원",
    },
    admissionType: {
      freshman: "신입",
      transfer: "편입",
      dualDegree: "복수학위",
      grade2: "2학년",
      grade3: "3학년",
      grade4: "4학년",
    },
    programTrackLabels: {
      korean: "한국어 과정",
      english: "영어 과정",
      bilingual: "이중언어 과정",
    },
    dormitory: {
      yes: "예",
      no: "아니오",
    },
    excelSheetName: "지원목록",
    excelFilePrefix: "관리자_지원목록",
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

function mapStatusType(status) {
  if (!status) return "default";

  const s = String(status).toLowerCase();

  if (
    s.includes("缺") ||
    s.includes("补") ||
    s.includes("rejected") ||
    s.includes("missing") ||
    s.includes("已拒绝") ||
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
    s.includes("已通过") ||
    s.includes("승인")
  ) {
    return "success";
  }

  if (
    s.includes("审核") ||
    s.includes("pending") ||
    s.includes("review") ||
    s.includes("submitted") ||
    s.includes("已提交") ||
    s.includes("심사") ||
    s.includes("제출")
  ) {
    return "warning";
  }

  return "default";
}

function parseEducationRow(rowText) {
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

function ApplicationsPage() {
  const adminContext = useAdminSession();
  const adminSession = adminContext?.session || null;
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [applications, setApplications] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const getStudentName = (student) => {
    return (
      student.english_name ||
      student.full_name_passport ||
      student.fullNamePassport ||
      student.name ||
      "-"
    );
  };

  const getAgency = (student, agencyMap = {}) => {
    if (student.agency_name) return student.agency_name;
    if (student.agency && String(student.agency).trim() !== "") return student.agency;
    if (student.agency_id && agencyMap[student.agency_id]) return agencyMap[student.agency_id];
    return student.agency_id || "-";
  };

  const getApplicationType = (student) =>
    String(student.application_type || "undergraduate").toLowerCase();

  const getApplicationTypeLabel = (student) => {
    const type = getApplicationType(student);
    return t.applicationTypeLabels[type] || t.applicationTypeLabels.undergraduate;
  };

  const intakeMap = useMemo(() => {
    return (intakes || []).reduce((acc, intake) => {
      acc[String(intake.id)] = intake;
      return acc;
    }, {});
  }, [intakes]);

  const getIntake = (student) => {
    const intakeId = student.intake_id != null ? String(student.intake_id) : "";
    const intakeRow = intakeId ? intakeMap[intakeId] : null;
    return intakeRow?.title || student.intake_name || student.intake || student.intake_id || "-";
  };

  const getIntakeFilterValue = (student) => {
    const intakeId = student.intake_id != null ? String(student.intake_id) : "";
    return intakeId || getIntake(student);
  };

  const getIntakeFilterLabel = (student) => `${getApplicationTypeLabel(student)} / ${getIntake(student)}`;

  const getMajor = (student) => {
    return student.major || student.department || "-";
  };

  const getStatus = (student) => {
    const s = String(student.status || "").toLowerCase();

    if (s === "draft") return t.statusLabels.draft;
    if (s === "submitted") return t.statusLabels.submitted;
    if (s === "under_review") return t.statusLabels.under_review;
    if (s === "missing_documents") return t.statusLabels.missing_documents;
    if (s === "approved") return t.statusLabels.approved;
    if (s === "rejected") return t.statusLabels.rejected;

    return student.status || t.statusLabels.pending;
  };

  const getEducationRows = (student) => {
    const rows = [student.education1, student.education2, student.education3].map(
      parseEducationRow
    );

    return [0, 1, 2].map((index) => {
      const row = rows[index] || {
        startDate: "",
        endDate: "",
        institution: "",
        location: "",
      };

      return {
        startDate: row.startDate || "",
        endDate: row.endDate || "",
        institution: row.institution || "",
        location: row.location || "",
      };
    });
  };

  const getLanguageLevel = (student) => {
    const track = String(student.program_track || "").trim();

    if (track === "Bilingual Program (Chinese)") {
      return t.programTrack.bilingualChinese;
    }

    const languageItems = [
      student.topik ? `TOPIK ${student.topik}` : "",
      student.ska ? `SKA ${student.ska}` : "",
      student.kiip ? `KIIP ${student.kiip}` : "",
      student.ielts ? `IELTS ${student.ielts}` : "",
      student.toefl ? `TOEFL ${student.toefl}` : "",
      student.toefl_ibt ? `TOEFL iBT ${student.toefl_ibt}` : "",
      student.cefr ? `CEFR ${student.cefr}` : "",
      student.teps ? `TEPS ${student.teps}` : "",
      student.new_teps ? `NEW TEPS ${student.new_teps}` : "",
    ].filter(Boolean);

    return languageItems.join(" / ");
  };

  const getParentName = (student, type) => {
    if (type === "father") {
      return (
        student.father_name ||
        student.father_full_name ||
        student.parent_father_name ||
        student.parent_father_full_name ||
        ""
      );
    }

    return (
      student.mother_name ||
      student.mother_full_name ||
      student.parent_mother_name ||
      student.parent_mother_full_name ||
      ""
    );
  };

  const getAdmissionTypeInfo = (student) => {
    const value = String(student.admission_type || "").trim();

    if (!value) {
      return {
        type: "",
        grade: "",
      };
    }

    if (value === "Freshman") {
      return {
        type: t.admissionType.freshman,
        grade: "",
      };
    }

    if (value.includes("Transfer")) {
      if (value.includes("2nd Year")) {
        return {
          type: t.admissionType.transfer,
          grade: t.admissionType.grade2,
        };
      }

      if (value.includes("3rd Year")) {
        return {
          type: t.admissionType.transfer,
          grade: t.admissionType.grade3,
        };
      }

      if (value.includes("4th Year")) {
        return {
          type: t.admissionType.transfer,
          grade: t.admissionType.grade4,
        };
      }

      return {
        type: t.admissionType.transfer,
        grade: "",
      };
    }

    if (value === "Dual Degree (2+2)") {
      return {
        type: t.admissionType.dualDegree,
        grade: t.admissionType.grade3,
      };
    }

    if (value === "Dual Degree (3+1)") {
      return {
        type: t.admissionType.dualDegree,
        grade: t.admissionType.grade4,
      };
    }

    return {
      type: value,
      grade: "",
    };
  };

  const formatProgramTrack = (student) => {
    const value = String(student.program_track || "").trim();

    if (value === "Korean Track") return t.programTrackLabels.korean;
    if (value === "English Track") return t.programTrackLabels.english;
    if (value === "Bilingual Program (Chinese)") return t.programTrackLabels.bilingual;

    return value;
  };

  const formatDormitory = (student) => {
    const value = String(student.dormitory || "").trim().toUpperCase();

    if (value === "YES") return t.dormitory.yes;
    if (value === "NO") return t.dormitory.no;

    return student.dormitory || "";
  };

  const agencyMap = useMemo(() => {
    return (agencies || []).reduce((acc, agency) => {
      acc[agency.id] = agency.agency_name;
      return acc;
    }, {});
  }, [agencies]);

  useEffect(() => {
    async function loadData() {
      if (!adminSession?.admin_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const [applicationsData, agenciesResult, intakesResult] = await Promise.all([
          fetchApplications(),
          supabase.from("agencies").select("id, agency_name"),
          supabase.from("intakes").select("id, title, application_type"),
        ]);

        if (agenciesResult.error) throw agenciesResult.error;
        if (intakesResult.error) throw intakesResult.error;

        setApplications(applicationsData || []);
        setAgencies(agenciesResult.data || []);
        setIntakes(intakesResult.data || []);
      } catch (error) {
        console.error("ApplicationsPage loadData error:", error);
        setLoadError(t.loadError);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [adminSession?.admin_id, t.loadError]);

  const visibleApplications = applications.filter(
    (item) => item.status && String(item.status).toLowerCase() !== "draft"
  );

  const agencyOptions = Array.from(
    new Set(
      visibleApplications
        .map((item) => getAgency(item, agencyMap))
        .filter((value) => value && value !== "-")
    )
  ).sort((a, b) => String(a).localeCompare(String(b), language === "ko" ? "ko-KR" : language === "en" ? "en-US" : "zh-CN"));

  const intakeOptions = Array.from(
    new Map(
      visibleApplications
        .map((item) => ({
          value: getIntakeFilterValue(item),
          label: getIntakeFilterLabel(item),
        }))
        .filter((item) => item.value && item.label && item.label !== "-")
        .map((item) => [item.value, item])
    ).values()
  ).sort((a, b) => String(a.label).localeCompare(String(b.label), language === "ko" ? "ko-KR" : language === "en" ? "en-US" : "zh-CN"));

  const applicationTypeOptions = ["undergraduate", "language", "graduate"].map((value) => ({
    value,
    label: t.applicationTypeLabels[value],
  }));

  const statusOptions = Array.from(
    new Set(
      visibleApplications
        .map((item) => getStatus(item))
        .filter((value) => value && value !== "-")
    )
  );

  const filteredApplications = visibleApplications.filter((student) => {
    const keyword = searchKeyword.trim().toLowerCase();
    const studentName = String(getStudentName(student)).toLowerCase();
    const agency = String(getAgency(student, agencyMap));
    const intake = String(getIntakeFilterValue(student));
    const status = String(getStatus(student));
    const applicationType = getApplicationType(student);

    const matchesKeyword =
      !keyword ||
      studentName.includes(keyword) ||
      String(getMajor(student)).toLowerCase().includes(keyword);

    const matchesAgency = agencyFilter === "all" || agency === agencyFilter;
    const matchesIntake = intakeFilter === "all" || intake === intakeFilter;
    const matchesApplicationType = applicationTypeFilter === "all" || applicationType === applicationTypeFilter;
    const matchesStatus = statusFilter === "all" || status === statusFilter;

    return matchesKeyword && matchesAgency && matchesIntake && matchesApplicationType && matchesStatus;
  });

  const handleExportExcel = async () => {
    try {
      if (!filteredApplications || filteredApplications.length === 0) {
        alert(t.noExportData);
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

      const fileMap = fileRows.reduce((acc, file) => {
        if (!acc[file.public_id]) {
          acc[file.public_id] = {};
        }
        if (!acc[file.public_id][file.file_type]) {
          acc[file.public_id][file.file_type] = [];
        }
        acc[file.public_id][file.file_type].push(file);
        return acc;
      }, {});

      const rows = filteredApplications.map((student, index) => {
        const admissionInfo = getAdmissionTypeInfo(student);
        const educationRows = getEducationRows(student);
        const edu1 = educationRows[0];
        const edu2 = educationRows[1];
        const edu3 = educationRows[2];

        const studentFiles = fileMap[student.public_id] || {};
        const hasBankStatement =
          Array.isArray(studentFiles.bankStatement) &&
          studentFiles.bankStatement.length > 0;

        return {
          序号: index + 1,
          学生姓名: getStudentName(student),
          父亲姓名: getParentName(student, "father"),
          母亲姓名: getParentName(student, "mother"),
          机构: getAgency(student, agencyMap),
          申请批次: getIntake(student),
          申请项目类型: getApplicationTypeLabel(student),
          专业: getMajor(student),
          申请类型: admissionInfo.type,
          申请年级: admissionInfo.grade,
          课程语言: formatProgramTrack(student),
          是否申请寝室: formatDormitory(student),
          状态: getStatus(student),
          护照号: student.passport_no || "",
          性别: student.gender || "",
          国籍: student.nationality_applicant || student.nationality || "",
          出生日期: student.date_of_birth || "",
          电话: student.tel || student.phone || "",
          邮箱: student.email || "",
          地址: student.address || "",
          学历1_毕业院校: edu1.institution,
          学历1_所在地: edu1.location,
          学历1_入学时间: edu1.startDate,
          学历1_毕业时间: edu1.endDate,
          学历2_毕业院校: edu2.institution,
          学历2_所在地: edu2.location,
          学历2_入学时间: edu2.startDate,
          学历2_毕业时间: edu2.endDate,
          学历3_毕业院校: edu3.institution,
          学历3_所在地: edu3.location,
          学历3_入学时间: edu3.startDate,
          学历3_毕业时间: edu3.endDate,
          语言等级: getLanguageLevel(student),
          存款证明是否提交: hasBankStatement ? "O" : "X",
          学生填写状态: student.student_form_status || "",
          创建时间: student.created_at || "",
          更新时间: student.updated_at || "",
          public_id: student.public_id || "",
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(rows);

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
        { wch: 22 },
        { wch: 24 },
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, t.excelSheetName);

      const today = new Date();
      const dateText = `${today.getFullYear()}-${String(
        today.getMonth() + 1
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      XLSX.writeFile(workbook, `${t.excelFilePrefix}_${dateText}.xlsx`);
    } catch (error) {
      console.error("handleExportExcel error:", error);
      alert(`${t.exportFailed}${error.message}`);
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
            onClick={handleExportExcel}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t.exportExcel}
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.studentName}
            </label>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={t.studentNamePlaceholder}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.agency}
            </label>
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allAgencies}</option>
              {agencyOptions.map((agency) => (
                <option key={agency} value={agency}>
                  {agency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.intake}
            </label>
            <select
              value={intakeFilter}
              onChange={(e) => setIntakeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allIntakes}</option>
              {intakeOptions.map((intake) => (
                <option key={intake.value} value={intake.value}>
                  {intake.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.applicationType}
            </label>
            <select
              value={applicationTypeFilter}
              onChange={(e) => setApplicationTypeFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t.allApplicationTypes}</option>
              {applicationTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
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
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{t.listTitle}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.listDesc}</p>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.loading}</div>
        ) : loadError ? (
          <div className="px-6 py-8 text-sm text-red-600">{loadError}</div>
        ) : filteredApplications.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.noData}</div>
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
<th className="px-6 py-4 font-semibold">{t.table.major}</th>
<th className="px-6 py-4 font-semibold">{t.table.status}</th>

                  <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((student, index) => {
                  const publicId = student.public_id;

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
                            <EllipsisText text={getStudentName(student)} widthClass="max-w-[140px]" />
                          </Link>
                        ) : (
                          <span className="block text-slate-400" title={getStudentName(student)}>
                            <EllipsisText text={getStudentName(student)} widthClass="max-w-[140px]" />
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        <EllipsisText text={getAgency(student, agencyMap)} widthClass="max-w-[160px]" />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
  <EllipsisText text={getApplicationTypeLabel(student)} widthClass="max-w-[120px]" />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={getIntake(student)} widthClass="max-w-[180px]" />
</td>
<td className="px-6 py-4 text-slate-600">
  <EllipsisText text={getMajor(student)} widthClass="max-w-[160px]" />
</td>
<td className="px-6 py-4">
  <StatusBadge type={mapStatusType(getStatus(student))}>
    {getStatus(student)}
  </StatusBadge>
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
                          <span className="text-xs text-red-500">{t.table.missingPublicId}</span>
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
  );
}

export default ApplicationsPage;