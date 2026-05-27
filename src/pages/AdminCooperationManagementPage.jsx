import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useAdminSession } from "../contexts/AdminSessionContext";
import { supabase } from "../lib/supabase";
import {
  downloadApplicationFile,
  downloadApplicationFilesAsZip,
  getApplicationFileSignedUrl,
} from "../data/applicationFilesApi";

export const COOPERATION_FILE_TYPES = [
  "cooperation_photo",
  "cooperation_id_card",
  "cooperation_high_school_diploma",
  "cooperation_high_school_transcript",
];

export const cooperationMessages = {
  zh: {
    page: {
      title: "中外合作办学管理",
      desc: "按年份查看中外合作办学学生信息，并管理学籍状态与上传材料",
    },
    sidebar: {
      title: "中外合作办学",
      desc: "按入学年份查看学生申请",
      all: "全部申请",
      yearSuffix: "年",
      empty: "暂无中外合作办学申请",
      loading: "正在加载...",
    },
    search: {
      title: "全部申请",
      desc: "显示所有中外合作办学申请",
      year: "年份",
      keyword: "学生姓名 / 机构 / 专业",
      placeholder: "输入姓名、机构或专业搜索",
      export: "导出申请信息",
      noExportData: "没有可导出的申请数据",
      exportFailed: "导出失败：",
    },
    table: {
      title: "申请明细",
      desc: "每条记录显示学生信息，最后可查看详情",
      loading: "正在加载申请...",
      empty: "当前条件下没有申请记录",
      index: "序号",
      studentName: "学生姓名",
      agency: "所属机构",
      university: "大学名称",
      major: "专业",
      admissionYear: "入学年份",
      academicStatus: "学籍状态",
      applicationStatus: "申请状态",
      materialStatus: "材料状态",
      updatedAt: "更新时间",
      actions: "操作",
      viewDetail: "查看详情",
    },
    detail: {
      close: "关闭",
      desc: "中外合作办学学生信息与材料详情",
      basicInfo: "学生信息区",
      photo: "照片显示",
      materials: "上传材料",
      operations: "功能区",
      noPhoto: "未上传证件照",
      view: "查看",
      download: "下载",
      downloadAll: "下载全部材料",
      exportOne: "导出申请信息",
      saveStatus: "保存学籍状态",
      saving: "保存中...",
      saved: "学籍状态已保存",
      saveFailed: "保存失败：",
      noFile: "未上传",
      registerTime: "创建时间",
      fields: {
        agency: "所属机构",
        university: "大学名称",
        partnerMajor: "专业",
        hallaMajor: "汉拿大学专业",
        admissionYear: "入学年份",
        semester: "入学学期",
        admissionType: "入学区分",
        program: "项目",
        fullName: "姓名",
        sex: "性别",
        nationality: "国籍",
        birth: "出生日期",
        email: "邮箱",
        tel: "电话",
        idCard: "身份证号",
        address: "地址",
        education: "学历信息",
        consent: "个人信息同意",
        signature: "签字",
        academicStatus: "学籍状态",
      },
    },
    status: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺材料",
      approved: "已通过",
      rejected: "已拒绝",
    },
    academicStatus: {
      active: "在学",
      leave: "休学",
      graduated: "毕业",
      withdrawn: "退学",
    },
    materialLabels: {
      cooperation_photo: "证件照",
      cooperation_id_card: "身份证",
      cooperation_high_school_diploma: "高中毕业证",
      cooperation_high_school_transcript: "高中成绩单",
    },
    common: {
      all: "全部",
      yes: "是",
      no: "否",
      noData: "-",
      total: (count) => `共 ${count} 条`,
      perPage: "每页",
      first: "首页",
      prev: "上一页",
      next: "下一页",
      last: "末页",
      page: "页码",
      jump: "跳转",
      uploaded: "已上传",
      missing: "未上传",
      complete: "齐全",
      incomplete: "不齐",
    },
  },
  en: {
    page: {
      title: "Cooperation Program Management",
      desc: "View cooperation program students by admission year and manage enrollment status and uploaded materials",
    },
    sidebar: {
      title: "Cooperation Program",
      desc: "Browse applications by admission year",
      all: "All Applications",
      yearSuffix: "",
      empty: "No cooperation applications",
      loading: "Loading...",
    },
    search: {
      title: "All Applications",
      desc: "Showing all cooperation program applications",
      year: "Year",
      keyword: "Student / Agency / Major",
      placeholder: "Search by student, agency, or major",
      export: "Export Application Info",
      noExportData: "No application data to export",
      exportFailed: "Export failed: ",
    },
    table: {
      title: "Application Details",
      desc: "Each row shows student info with a detail action",
      loading: "Loading applications...",
      empty: "No records match the current filters",
      index: "No.",
      studentName: "Student Name",
      agency: "Agency",
      university: "University",
      major: "Major",
      admissionYear: "Admission Year",
      academicStatus: "Enrollment Status",
      applicationStatus: "Application Status",
      materialStatus: "Materials",
      updatedAt: "Updated",
      actions: "Actions",
      viewDetail: "View Details",
    },
    detail: {
      close: "Close",
      desc: "Cooperation program student details and materials",
      basicInfo: "Student Information",
      photo: "Photo",
      materials: "Uploaded Materials",
      operations: "Actions",
      noPhoto: "No photo uploaded",
      view: "View",
      download: "Download",
      downloadAll: "Download All Materials",
      exportOne: "Export Application Info",
      saveStatus: "Save Enrollment Status",
      saving: "Saving...",
      saved: "Enrollment status saved",
      saveFailed: "Save failed: ",
      noFile: "Not uploaded",
      registerTime: "Created",
      fields: {
        agency: "Agency",
        university: "University",
        partnerMajor: "Major",
        hallaMajor: "Halla Major",
        admissionYear: "Admission Year",
        semester: "Semester",
        admissionType: "Admission Type",
        program: "Program",
        fullName: "Name",
        sex: "Sex",
        nationality: "Nationality",
        birth: "Date of Birth",
        email: "Email",
        tel: "Phone",
        idCard: "ID Card No.",
        address: "Address",
        education: "Education",
        consent: "Personal Info Consent",
        signature: "Signature",
        academicStatus: "Enrollment Status",
      },
    },
    status: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    academicStatus: {
      active: "Active",
      leave: "Leave",
      graduated: "Graduated",
      withdrawn: "Withdrawn",
    },
    materialLabels: {
      cooperation_photo: "Photo",
      cooperation_id_card: "ID Card",
      cooperation_high_school_diploma: "High School Diploma",
      cooperation_high_school_transcript: "High School Transcript",
    },
    common: {
      all: "All",
      yes: "Yes",
      no: "No",
      noData: "-",
      total: (count) => `Total ${count} records`,
      perPage: "Per page",
      first: "First",
      prev: "Previous",
      next: "Next",
      last: "Last",
      page: "Page",
      jump: "Go",
      uploaded: "Uploaded",
      missing: "Missing",
      complete: "Complete",
      incomplete: "Incomplete",
    },
  },
  ko: {
    page: {
      title: "중외합작프로그램 관리",
      desc: "입학연도별 학생 정보와 학적 상태 및 업로드 서류를 관리합니다",
    },
    sidebar: {
      title: "중외합작프로그램",
      desc: "입학연도별 지원서 조회",
      all: "전체 지원",
      yearSuffix: "년",
      empty: "지원 데이터가 없습니다",
      loading: "불러오는 중...",
    },
    search: {
      title: "전체 지원",
      desc: "중외합작프로그램 지원서를 표시합니다",
      year: "연도",
      keyword: "학생명 / 기관 / 전공",
      placeholder: "학생명, 기관, 전공 검색",
      export: "지원 정보 내보내기",
      noExportData: "내보낼 데이터가 없습니다",
      exportFailed: "내보내기 실패: ",
    },
    table: {
      title: "지원 상세",
      desc: "학생 정보를 표시하고 상세 보기를 제공합니다",
      loading: "지원서를 불러오는 중...",
      empty: "조건에 맞는 데이터가 없습니다",
      index: "번호",
      studentName: "학생명",
      agency: "기관",
      university: "대학명",
      major: "전공",
      admissionYear: "입학연도",
      academicStatus: "학적상태",
      applicationStatus: "지원상태",
      materialStatus: "서류상태",
      updatedAt: "수정일",
      actions: "작업",
      viewDetail: "상세보기",
    },
    detail: {
      close: "닫기",
      desc: "중외합작프로그램 학생 정보 및 서류 상세",
      basicInfo: "학생 정보",
      photo: "사진",
      materials: "업로드 서류",
      operations: "기능",
      noPhoto: "사진 미업로드",
      view: "보기",
      download: "다운로드",
      downloadAll: "전체 서류 다운로드",
      exportOne: "지원 정보 내보내기",
      saveStatus: "학적상태 저장",
      saving: "저장 중...",
      saved: "학적상태가 저장되었습니다",
      saveFailed: "저장 실패: ",
      noFile: "미업로드",
      registerTime: "생성일",
      fields: {
        agency: "기관",
        university: "대학명",
        partnerMajor: "전공",
        hallaMajor: "한라대 전공",
        admissionYear: "입학연도",
        semester: "학기",
        admissionType: "입학구분",
        program: "프로그램",
        fullName: "성명",
        sex: "성별",
        nationality: "국적",
        birth: "생년월일",
        email: "이메일",
        tel: "전화",
        idCard: "신분증 번호",
        address: "주소",
        education: "학력정보",
        consent: "개인정보 동의",
        signature: "서명",
        academicStatus: "학적상태",
      },
    },
    status: {
      draft: "임시저장",
      submitted: "제출완료",
      under_review: "심사중",
      missing_documents: "서류보완",
      approved: "승인",
      rejected: "거절",
    },
    academicStatus: {
      active: "재학",
      leave: "휴학",
      graduated: "졸업",
      withdrawn: "제적",
    },
    materialLabels: {
      cooperation_photo: "증명사진",
      cooperation_id_card: "신분증",
      cooperation_high_school_diploma: "고등학교 졸업증명서",
      cooperation_high_school_transcript: "고등학교 성적증명서",
    },
    common: {
      all: "전체",
      yes: "예",
      no: "아니오",
      noData: "-",
      total: (count) => `총 ${count}건`,
      perPage: "페이지당",
      first: "처음",
      prev: "이전",
      next: "다음",
      last: "마지막",
      page: "페이지",
      jump: "이동",
      uploaded: "업로드됨",
      missing: "미업로드",
      complete: "완료",
      incomplete: "미완료",
    },
  },
};

export function CooperationStatusBadge({ type = "default", children }) {
  const map = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    blue: "bg-blue-100 text-blue-700",
    default: "bg-slate-100 text-slate-600",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[type] || map.default}`}>
      {children}
    </span>
  );
}

export function CooperationTreeButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition",
        active ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function CooperationEllipsisText({ text, widthClass = "max-w-[160px]" }) {
  return (
    <span className={`block truncate ${widthClass}`} title={text || "-"}>
      {text || "-"}
    </span>
  );
}

export function formatCooperationDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export function formatCooperationDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function parseCooperationEducationRows(student) {
  const rows = [student.education1, student.education2, student.education3]
    .map((item) => {
      if (!item) return null;
      if (typeof item === "object") return item;
      try {
        return JSON.parse(item);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return rows;
}

export function getLocalizedCooperationSnapshot(snapshot, language, prefix) {
  const locale = language === "en" ? "en" : language === "ko" ? "ko" : "zh";
  return (
    snapshot?.[`${prefix}_${locale}`] ||
    snapshot?.[`${prefix}_zh`] ||
    snapshot?.[`${prefix}_en`] ||
    snapshot?.[`${prefix}_ko`] ||
    "-"
  );
}

export function getCooperationStudentName(student) {
  return student.full_name_passport || student.english_name || student.name || student.fullName || "-";
}

function getMajor(student, language) {
  const snapshot = student.cooperation_major_snapshot || {};
  return getLocalizedCooperationSnapshot(snapshot, language, "partner_major") || student.major || student.department || "-";
}

export function getCooperationHallaMajor(student, language) {
  const snapshot = student.cooperation_major_snapshot || {};
  return getLocalizedCooperationSnapshot(snapshot, language, "halla_major") || "-";
}

export function getCooperationUniversity(student, language) {
  const snapshot = student.cooperation_university_snapshot || {};
  return getLocalizedCooperationSnapshot(snapshot, language, "name") || "-";
}

export function getCooperationFileMap(files) {
  return (files || []).reduce((acc, file) => {
    const publicId = file.public_id || "";
    if (!publicId) return acc;
    acc[publicId] = acc[publicId] || {};
    acc[publicId][file.file_type] = acc[publicId][file.file_type] || [];
    acc[publicId][file.file_type].push(file);
    return acc;
  }, {});
}

export function mapCooperationStatusType(status) {
  const value = String(status || "").toLowerCase();
  if (value === "approved" || value === "active") return "success";
  if (value === "rejected" || value === "missing_documents" || value === "withdrawn") return "danger";
  if (value === "submitted" || value === "under_review" || value === "leave") return "warning";
  if (value === "graduated") return "blue";
  return "default";
}

export function buildCooperationAddress(student) {
  return [student.cooperation_address_street, student.cooperation_address_city, student.cooperation_address_country]
    .filter(Boolean)
    .join(", ");
}

export function getCooperationPageNumbers(page, totalPages) {
  const set = new Set([1, totalPages, page, page - 1, page + 1].filter((item) => item >= 1 && item <= totalPages));
  return Array.from(set).sort((a, b) => a - b);
}

export function exportCooperationRowsToExcel(rows, t, language, filePrefix = "cooperation-applications") {
  const exportRows = rows.map((row, index) => {
    const student = row.student;
    const educationRows = parseCooperationEducationRows(student);
    return {
      [t.table.index]: index + 1,
      [t.table.studentName]: getCooperationStudentName(student),
      [t.table.agency]: row.agencyName,
      [t.table.university]: getCooperationUniversity(student, language),
      [t.table.major]: getMajor(student, language),
      [t.detail.fields.hallaMajor]: getCooperationHallaMajor(student, language),
      [t.table.admissionYear]: student.cooperation_admission_year || "",
      [t.detail.fields.semester]: student.cooperation_admission_year ? `${student.cooperation_admission_year} 9` : "",
      [t.detail.fields.fullName]: student.full_name_passport || "",
      [t.detail.fields.sex]: student.gender || student.sex || "",
      [t.detail.fields.nationality]: student.nationality || "China",
      [t.detail.fields.birth]: student.date_of_birth || "",
      [t.detail.fields.email]: student.email || "",
      [t.detail.fields.tel]: student.tel || student.phone || "",
      [t.detail.fields.idCard]: student.cooperation_id_card_number || "",
      [t.detail.fields.address]: buildCooperationAddress(student),
      [t.table.academicStatus]: t.academicStatus[student.cooperation_academic_status] || student.cooperation_academic_status || "",
      [t.table.applicationStatus]: t.status[student.status] || student.status || "",
      [t.detail.fields.education]: educationRows
        .map((item) => `${item.startDate || ""} ~ ${item.endDate || ""} ${item.institution || ""} ${item.location || ""}`)
        .join(" / "),
      [t.detail.fields.consent]: student.agree_personal_info ? t.common.yes : t.common.no,
      [t.table.updatedAt]: student.updated_at || "",
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cooperation");
  XLSX.writeFile(workbook, `${filePrefix}_${formatCooperationDate(new Date())}.xlsx`);
}

function AdminCooperationManagementPage() {
  const adminContext = useAdminSession();
  const language = adminContext?.language || "zh";
  const t = cooperationMessages[language] || cooperationMessages.zh;

  const [applications, setApplications] = useState([]);
  const [files, setFiles] = useState([]);
  const [agencyMap, setAgencyMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedNode, setSelectedNode] = useState({ type: "all" });
  const [expandedYears, setExpandedYears] = useState({});
  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [yearCounts, setYearCounts] = useState([]);
  const [jumpPage, setJumpPage] = useState("");
  const [detailStudent, setDetailStudent] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [statusDraft, setStatusDraft] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

  const fileMap = useMemo(() => getCooperationFileMap(files), [files]);

  const rows = useMemo(() => {
    return applications
      .map((student) => {
        const rowFiles = fileMap[student.public_id] || {};
        const uploadedCount = COOPERATION_FILE_TYPES.filter((type) => rowFiles[type]?.[0]).length;
        return {
          student,
          publicId: student.public_id || "",
          agencyName: student.agency_name || agencyMap[student.agency_id] || student.agency_id || "-",
          studentName: getCooperationStudentName(student),
          university: getCooperationUniversity(student, language),
          major: getMajor(student, language),
          admissionYear: student.cooperation_admission_year || "-",
          academicStatus: t.academicStatus[student.cooperation_academic_status] || student.cooperation_academic_status || "-",
          applicationStatus: t.status[student.status] || student.status || "-",
          materialStatus: uploadedCount === COOPERATION_FILE_TYPES.length ? t.common.complete : `${uploadedCount}/${COOPERATION_FILE_TYPES.length}`,
          materialComplete: uploadedCount === COOPERATION_FILE_TYPES.length,
          updatedAt: student.updated_at || student.created_at,
        };
      });
  }, [applications, agencyMap, fileMap, language, t]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageRows = rows;
  const pageNumbers = getCooperationPageNumbers(page, totalPages);

  const yearTree = useMemo(() => {
    return yearCounts
      .sort((a, b) => String(b.year).localeCompare(String(a.year)));
  }, [yearCounts]);

  const selectedTitle = selectedNode.type === "year" ? `${selectedNode.year}${language === "en" ? "" : t.sidebar.yearSuffix}` : t.search.title;

  const resolveKeywordAgencyIds = async (keyword) => {
    const value = keyword.trim();
    if (!value) return [];

    const { data, error } = await supabase
      .from("agencies")
      .select("id")
      .ilike("agency_name", `%${value}%`);

    if (error) throw error;
    return (data || []).map((item) => item.id).filter(Boolean);
  };

  const applyFiltersToQuery = (query, keyword, agencyIds = []) => {
    let nextQuery = query.eq("application_type", "cooperation");

    if (selectedNode.type === "year") {
      nextQuery = nextQuery.eq("cooperation_admission_year", Number(selectedNode.year));
    }

    if (keyword) {
      const safeKeyword = keyword.replaceAll(",", " ");
      const conditions = [
        `english_name.ilike.%${safeKeyword}%`,
        `full_name_passport.ilike.%${safeKeyword}%`,
        `name.ilike.%${safeKeyword}%`,
        `major.ilike.%${safeKeyword}%`,
        `department.ilike.%${safeKeyword}%`,
      ];

      if (agencyIds.length > 0) {
        conditions.push(`agency_id.in.(${agencyIds.join(",")})`);
      }

      nextQuery = nextQuery.or(conditions.join(","));
    }

    return nextQuery;
  };

  const fetchAllFilteredApplicationsForExport = async () => {
    const keyword = searchKeyword.trim();
    const agencyIds = await resolveKeywordAgencyIds(keyword);
    const exportRows = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      let query = supabase
        .from("applications")
        .select("*")
        .order("updated_at", { ascending: false });

      query = applyFiltersToQuery(query, keyword, agencyIds);

      const { data, error } = await query.range(from, from + batchSize - 1);
      if (error) throw error;

      const batch = data || [];
      exportRows.push(...batch);
      if (batch.length < batchSize) break;
      from += batchSize;
    }

    return exportRows;
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setLoadError("");

        const keyword = searchKeyword.trim();
        const agencyIdsForSearch = await resolveKeywordAgencyIds(keyword);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let applicationQuery = supabase
          .from("applications")
          .select("*", { count: "exact" })
          .order("updated_at", { ascending: false });

        applicationQuery = applyFiltersToQuery(applicationQuery, keyword, agencyIdsForSearch);

        const { data: applicationRows, error: applicationError, count } = await applicationQuery.range(from, to);
        if (applicationError) throw applicationError;

        const pageAgencyIds = Array.from(new Set((applicationRows || []).map((item) => item.agency_id).filter(Boolean)));

        const [agencyResult, fileResult] = await Promise.all([
          pageAgencyIds.length > 0
            ? supabase.from("agencies").select("id, agency_name").in("id", pageAgencyIds)
            : Promise.resolve({ data: [], error: null }),
          (applicationRows || []).length > 0
            ? supabase
                .from("application_files")
                .select("*")
                .in(
                  "public_id",
                  (applicationRows || []).map((item) => item.public_id).filter(Boolean)
                )
                .order("created_at", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ]);

        if (agencyResult.error) throw agencyResult.error;
        if (fileResult.error) throw fileResult.error;

        setApplications(applicationRows || []);
        setTotalCount(count || 0);
        setAgencyMap(
          (agencyResult.data || []).reduce((acc, agency) => {
            acc[agency.id] = agency.agency_name;
            return acc;
          }, {})
        );
        setFiles(fileResult.data || []);
      } catch (error) {
        console.error("AdminCooperationManagementPage loadData error:", error);
        setLoadError(error.message || "Load failed");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [page, pageSize, searchKeyword, selectedNode]);

  useEffect(() => {
    async function loadYearCounts() {
      try {
        const { data, error } = await supabase
          .from("applications")
          .select("id, cooperation_admission_year")
          .eq("application_type", "cooperation");

        if (error) throw error;

        const map = new Map();
        (data || []).forEach((item) => {
          const year = item.cooperation_admission_year || "未设置";
          map.set(year, (map.get(year) || 0) + 1);
        });
        setYearCounts(Array.from(map.entries()).map(([year, count]) => ({ year, count })));
      } catch (error) {
        console.error("load cooperation year counts error:", error);
      }
    }

    loadYearCounts();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchKeyword, selectedNode, pageSize]);

  useEffect(() => {
    async function loadPhoto() {
      setPhotoUrl("");
      if (!detailStudent?.public_id) return;
      const photo = fileMap[detailStudent.public_id]?.cooperation_photo?.[0];
      if (!photo?.file_path) return;
      try {
        const url = await getApplicationFileSignedUrl(photo.file_path);
        setPhotoUrl(url || "");
      } catch (error) {
        console.error("load cooperation photo error:", error);
      }
    }
    loadPhoto();
  }, [detailStudent, fileMap]);

  const openDetail = (student) => {
    setDetailStudent(student);
    setStatusDraft(student.cooperation_academic_status || "active");
  };

  const handleViewFile = async (file) => {
    if (!file?.file_path) return;
    const url = await getApplicationFileSignedUrl(file.file_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleSaveAcademicStatus = async () => {
    if (!detailStudent?.id) return;
    try {
      setSavingStatus(true);
      const { data, error } = await supabase
        .from("applications")
        .update({ cooperation_academic_status: statusDraft })
        .eq("id", detailStudent.id)
        .select()
        .maybeSingle();
      if (error) throw error;
      setDetailStudent(data || { ...detailStudent, cooperation_academic_status: statusDraft });
      setApplications((prev) =>
        prev.map((item) =>
          item.id === detailStudent.id ? { ...item, cooperation_academic_status: statusDraft } : item
        )
      );
      alert(t.detail.saved);
    } catch (error) {
      console.error("save academic status error:", error);
      alert(`${t.detail.saveFailed}${error.message}`);
    } finally {
      setSavingStatus(false);
    }
  };

  const goToPage = (target) => {
    const number = Math.min(Math.max(Number(target) || 1, 1), totalPages);
    setPage(number);
    setJumpPage("");
  };

  const detailFiles = detailStudent?.public_id ? fileMap[detailStudent.public_id] || {} : {};
  const uploadedDetailFiles = COOPERATION_FILE_TYPES.map((type) => detailFiles[type]?.[0]).filter(Boolean);
  const detailEducationRows = detailStudent ? parseCooperationEducationRows(detailStudent) : [];

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-lg font-bold text-slate-900">{t.sidebar.title}</h3>
          <p className="mt-1 text-sm text-slate-500">{t.sidebar.desc}</p>
        </div>
        <div className="max-h-[720px] overflow-y-auto p-4">
          <CooperationTreeButton active={selectedNode.type === "all"} onClick={() => setSelectedNode({ type: "all" })}>
            <span>{t.sidebar.all}</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{yearCounts.reduce((sum, item) => sum + item.count, 0)}</span>
          </CooperationTreeButton>
          <div className="mt-4 space-y-2">
            {loading ? (
              <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">{t.sidebar.loading}</div>
            ) : yearTree.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">{t.sidebar.empty}</div>
            ) : (
              yearTree.map((yearItem) => (
                <div key={yearItem.year} className="space-y-1">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setExpandedYears((prev) => ({ ...prev, [yearItem.year]: !prev[yearItem.year] }))}
                      className="h-8 w-8 rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      {expandedYears[yearItem.year] ? "▾" : "▸"}
                    </button>
                    <CooperationTreeButton
                      active={selectedNode.type === "year" && selectedNode.year === yearItem.year}
                      onClick={() => setSelectedNode({ type: "year", year: yearItem.year })}
                    >
                      <span>
                        {yearItem.year}
                        {language === "en" ? "" : t.sidebar.yearSuffix}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{yearItem.count}</span>
                    </CooperationTreeButton>
                  </div>
                  {expandedYears[yearItem.year] ? (
                    <div className="ml-4 space-y-1 border-l border-slate-100 pl-3">
                      <CooperationTreeButton
                        active={selectedNode.type === "year" && selectedNode.year === yearItem.year}
                        onClick={() => setSelectedNode({ type: "year", year: yearItem.year })}
                      >
                        <span>9月学期</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{yearItem.count}</span>
                      </CooperationTreeButton>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="min-w-0 space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{selectedTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{t.search.desc}</p>
              <div className="mt-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">{t.search.year}: </span>
                {selectedNode.year || t.common.all}
              </div>
            </div>
            <div className="flex w-full max-w-[520px] flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">{t.search.keyword}</label>
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value)}
                  placeholder={t.search.placeholder}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (totalCount === 0) {
                    alert(t.search.noExportData);
                    return;
                  }
                  fetchAllFilteredApplicationsForExport()
                    .then((exportApplications) => {
                      const exportRows = exportApplications.map((student) => ({
                        student,
                        agencyName: student.agency_name || agencyMap[student.agency_id] || student.agency_id || "-",
                      }));
                      exportCooperationRowsToExcel(exportRows, t, language);
                    })
                    .catch((error) => {
                      console.error("export cooperation applications error:", error);
                      alert(`${t.search.exportFailed}${error.message}`);
                    });
                }}
                className="inline-flex rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {t.search.export}
              </button>
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
          ) : totalCount === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">{t.table.empty}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[1300px] text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.agency}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.university}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.major}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.admissionYear}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.academicStatus}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.applicationStatus}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.materialStatus}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.updatedAt}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((row, index) => (
                      <tr key={row.student.id || row.publicId || index} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-500">{(page - 1) * pageSize + index + 1}</td>
                        <td className="px-6 py-4 font-medium text-slate-800">
                          <CooperationEllipsisText text={row.studentName} widthClass="max-w-[140px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <CooperationEllipsisText text={row.agencyName} widthClass="max-w-[170px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <CooperationEllipsisText text={row.university} widthClass="max-w-[150px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <CooperationEllipsisText text={row.major} widthClass="max-w-[170px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{row.admissionYear}</td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={mapCooperationStatusType(row.student.cooperation_academic_status)}>{row.academicStatus}</CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={mapCooperationStatusType(row.student.status)}>{row.applicationStatus}</CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={row.materialComplete ? "success" : "warning"}>{row.materialStatus}</CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{formatCooperationDateTime(row.updatedAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => openDetail(row.student)}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                          >
                            {t.table.viewDetail}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-600 xl:flex-row xl:items-center xl:justify-between">
                <div className="font-medium">{t.common.total(totalCount)}</div>
                <div className="flex flex-wrap items-center gap-2">
                  <span>{t.common.perPage}</span>
                  <select
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value={20}>20</option>
                    <option value={40}>40</option>
                  </select>
                  <button type="button" onClick={() => goToPage(1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
                    {t.common.first}
                  </button>
                  <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
                    {t.common.prev}
                  </button>
                  {pageNumbers.map((pageNumber, index) => (
                    <span key={pageNumber} className="inline-flex items-center gap-1">
                      {index > 0 && pageNumber - pageNumbers[index - 1] > 1 ? <span className="text-slate-400">...</span> : null}
                      <button
                        type="button"
                        onClick={() => goToPage(pageNumber)}
                        className={pageNumber === page ? "rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white" : "rounded-lg border border-slate-200 px-3 py-1.5"}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  ))}
                  <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
                    {t.common.next}
                  </button>
                  <button type="button" onClick={() => goToPage(totalPages)} disabled={page >= totalPages} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50">
                    {t.common.last}
                  </button>
                  <span className="font-semibold text-slate-700">{page} / {totalPages}</span>
                  <input
                    value={jumpPage}
                    onChange={(event) => setJumpPage(event.target.value.replace(/[^\d]/g, ""))}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") goToPage(jumpPage);
                    }}
                    placeholder={t.common.page}
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-blue-500"
                  />
                  <button type="button" onClick={() => goToPage(jumpPage)} disabled={!jumpPage} className="rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white disabled:opacity-50">
                    {t.common.jump}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {detailStudent ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 px-4 py-8">
          <div className="mx-auto w-full max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{getCooperationStudentName(detailStudent)}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.detail.desc}</p>
              </div>
              <button type="button" onClick={() => setDetailStudent(null)} className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100">
                {t.detail.close}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <CooperationStatusBadge type={mapCooperationStatusType(detailStudent.cooperation_academic_status)}>
                {t.academicStatus[detailStudent.cooperation_academic_status] || detailStudent.cooperation_academic_status || "-"}
              </CooperationStatusBadge>
              <span className="text-sm text-slate-500">
                {t.detail.registerTime}: {formatCooperationDateTime(detailStudent.created_at)}
              </span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-bold text-slate-900">{t.detail.basicInfo}</h4>
                <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
                  <div>{t.detail.fields.agency}: {detailStudent.agency_name || agencyMap[detailStudent.agency_id] || "-"}</div>
                  <div>{t.detail.fields.university}: {getCooperationUniversity(detailStudent, language)}</div>
                  <div>{t.detail.fields.partnerMajor}: {getMajor(detailStudent, language)}</div>
                  <div>{t.detail.fields.hallaMajor}: {getCooperationHallaMajor(detailStudent, language)}</div>
                  <div>{t.detail.fields.admissionYear}: {detailStudent.cooperation_admission_year || "-"}</div>
                  <div>{t.detail.fields.semester}: {detailStudent.cooperation_admission_year ? `${detailStudent.cooperation_admission_year} 9月学期` : "-"}</div>
                  <div>{t.detail.fields.admissionType}: 新入</div>
                  <div>{t.detail.fields.program}: 中外合作办学</div>
                  <div>{t.detail.fields.fullName}: {detailStudent.full_name_passport || detailStudent.name || "-"}</div>
                  <div>{t.detail.fields.sex}: {detailStudent.gender || detailStudent.sex || "-"}</div>
                  <div>{t.detail.fields.nationality}: {detailStudent.nationality || "China"}</div>
                  <div>{t.detail.fields.birth}: {detailStudent.date_of_birth || "-"}</div>
                  <div>{t.detail.fields.email}: {detailStudent.email || "-"}</div>
                  <div>{t.detail.fields.tel}: {detailStudent.tel || detailStudent.phone || "-"}</div>
                  <div>{t.detail.fields.idCard}: {detailStudent.cooperation_id_card_number || "-"}</div>
                  <div>{t.detail.fields.address}: {buildCooperationAddress(detailStudent) || "-"}</div>
                  <div>{t.detail.fields.consent}: {detailStudent.agree_personal_info ? t.common.yes : t.common.no}</div>
                  <div>{t.detail.fields.signature}: {detailStudent.applicant_signature_method || "-"}</div>
                </div>
                <div className="mt-5 rounded-xl border border-white bg-white p-4 shadow-sm">
                  <h5 className="text-sm font-semibold text-slate-900">{t.detail.fields.education}</h5>
                  {detailEducationRows.length === 0 ? (
                    <div className="mt-3 text-sm text-slate-500">-</div>
                  ) : (
                    <div className="mt-3 space-y-2 text-sm text-slate-700">
                      {detailEducationRows.map((item, index) => (
                        <div key={index} className="rounded-lg bg-slate-50 px-3 py-2">
                          {item.startDate || "-"} ~ {item.endDate || "-"} / {item.institution || "-"} / {item.location || "-"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-base font-bold text-slate-900">{t.detail.photo}</h4>
                  <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-xl bg-white p-4 shadow-sm">
                    {photoUrl ? (
                      <img src={photoUrl} alt="cooperation student" className="max-h-56 rounded-lg object-contain" />
                    ) : (
                      <div className="text-sm text-slate-500">{t.detail.noPhoto}</div>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-base font-bold text-slate-900">{t.detail.materials}</h4>
                  <div className="mt-4 space-y-3">
                    {COOPERATION_FILE_TYPES.map((type) => {
                      const file = detailFiles[type]?.[0];
                      return (
                        <div key={type} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{t.materialLabels[type]}</div>
                              <div className="mt-1 text-xs text-slate-500">{file?.file_name || t.detail.noFile}</div>
                            </div>
                            <CooperationStatusBadge type={file ? "success" : "danger"}>{file ? t.common.uploaded : t.common.missing}</CooperationStatusBadge>
                          </div>
                          {file ? (
                            <div className="mt-3 flex gap-2">
                              <button type="button" onClick={() => handleViewFile(file)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                                {t.detail.view}
                              </button>
                              <button type="button" onClick={() => downloadApplicationFile(file.file_path, file.file_name)} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                                {t.detail.download}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-base font-bold text-slate-900">{t.detail.operations}</h4>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => exportCooperationRowsToExcel([{ student: detailStudent, agencyName: detailStudent.agency_name || agencyMap[detailStudent.agency_id] || "-" }], t, language, "cooperation-application")}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    {t.detail.exportOne}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadApplicationFilesAsZip(uploadedDetailFiles, `${getCooperationStudentName(detailStudent)}_materials.zip`)}
                    disabled={uploadedDetailFiles.length === 0}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.detail.downloadAll}
                  </button>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">{t.detail.fields.academicStatus}</label>
                    <select
                      value={statusDraft}
                      onChange={(event) => setStatusDraft(event.target.value)}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      {Object.entries(t.academicStatus).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveAcademicStatus}
                    disabled={savingStatus}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {savingStatus ? t.detail.saving : t.detail.saveStatus}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AdminCooperationManagementPage;
