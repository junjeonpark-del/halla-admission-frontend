import { useEffect, useMemo, useState } from "react";
import { useAgencySession } from "../contexts/AgencySessionContext";
import { supabase } from "../lib/supabase";
import {
  downloadApplicationFile,
  downloadApplicationFilesAsZip,
  getApplicationFileSignedUrl,
} from "../data/applicationFilesApi";
import {
  buildCooperationApplicationFileName,
  downloadCooperationApplicationDocument,
  generateCooperationApplicationDocumentBlob,
} from "../utils/generateCooperationApplicationDocument";
import {
  COOPERATION_FILE_TYPES,
  CooperationEllipsisText,
  CooperationStatusBadge,
  CooperationTreeButton,
  buildCooperationMaterialDownloadName,
  buildCooperationMaterialsZipName,
  buildCooperationAddress,
  cooperationMessages,
  exportCooperationRowsToExcel,
  formatCooperationDateTime,
  getCooperationFileMap,
  getCooperationHallaMajor,
  getCooperationPageNumbers,
  getCooperationStudentName,
  getCooperationUniversity,
  mapCooperationStatusType,
  parseCooperationEducationRows,
} from "./AdminCooperationManagementPage";

function getMajor(student, language) {
  const snapshot = student.cooperation_major_snapshot || {};
  const locale = language === "en" ? "en" : language === "ko" ? "ko" : "zh";
  return (
    snapshot[`partner_major_${locale}`] ||
    snapshot.partner_major_zh ||
    snapshot.partner_major_en ||
    snapshot.partner_major_ko ||
    student.major ||
    student.department ||
    "-"
  );
}

function AgencyCooperationManagementPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = cooperationMessages[language] || cooperationMessages.zh;

  const [applications, setApplications] = useState([]);
  const [files, setFiles] = useState([]);
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

  const fileMap = useMemo(() => getCooperationFileMap(files), [files]);

  const rows = useMemo(() => {
    return applications
      .map((student) => {
        const rowFiles = fileMap[student.public_id] || {};
        const uploadedCount = COOPERATION_FILE_TYPES.filter((type) => rowFiles[type]?.[0]).length;
        return {
          student,
          publicId: student.public_id || "",
          agencyName: agencySession?.agency_name || student.agency_name || "-",
          studentName: getCooperationStudentName(student),
          university: getCooperationUniversity(student, language),
          major: getMajor(student, language),
          admissionYear: student.cooperation_admission_year || "-",
          academicStatus:
            t.academicStatus[student.cooperation_academic_status] ||
            student.cooperation_academic_status ||
            "-",
          applicationStatus: t.status[student.status] || student.status || "-",
          materialStatus:
            uploadedCount === COOPERATION_FILE_TYPES.length
              ? t.common.complete
              : `${uploadedCount}/${COOPERATION_FILE_TYPES.length}`,
          materialComplete: uploadedCount === COOPERATION_FILE_TYPES.length,
          updatedAt: student.updated_at || student.created_at,
        };
      });
  }, [applications, agencySession?.agency_name, fileMap, language, t]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pageRows = rows;
  const pageNumbers = getCooperationPageNumbers(page, totalPages);

  const yearTree = useMemo(() => {
    return yearCounts
      .sort((a, b) => String(b.year).localeCompare(String(a.year)));
  }, [yearCounts]);

  const septemberSemesterLabel = language === "en" ? "September Semester" : language === "ko" ? "9월 학기" : "9月学期";
  const selectedTitle =
    selectedNode.type === "year"
      ? `${selectedNode.year}${language === "en" ? "" : t.sidebar.yearSuffix}`
      : selectedNode.type === "semester"
        ? `${selectedNode.year}${language === "en" ? "" : t.sidebar.yearSuffix} / ${septemberSemesterLabel}`
      : t.search.title;

  const applyFiltersToQuery = (query, keyword) => {
    let nextQuery = query
      .eq("application_type", "cooperation")
      .eq("agency_id", agencySession?.agency_id || "");

    if (agencySession?.is_primary !== true) {
      nextQuery = nextQuery.eq("agency_unit_id", agencySession?.agency_unit_id || "");
    }

    if (selectedNode.type === "year" || selectedNode.type === "semester") {
      nextQuery = nextQuery.eq("cooperation_admission_year", Number(selectedNode.year));
    }

    if (keyword) {
      const safeKeyword = keyword.replaceAll(",", " ");
      nextQuery = nextQuery.or(
        [
          `english_name.ilike.%${safeKeyword}%`,
          `full_name_passport.ilike.%${safeKeyword}%`,
          `name.ilike.%${safeKeyword}%`,
          `major.ilike.%${safeKeyword}%`,
          `department.ilike.%${safeKeyword}%`,
        ].join(",")
      );
    }

    return nextQuery;
  };

  const fetchAllFilteredApplicationsForExport = async () => {
    const keyword = searchKeyword.trim();
    const exportRows = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      let query = supabase
        .from("applications")
        .select("*")
        .order("updated_at", { ascending: false });

      query = applyFiltersToQuery(query, keyword);

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
      if (!agencySession?.agency_id) return;

      try {
        setLoading(true);
        setLoadError("");

        const keyword = searchKeyword.trim();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
          .from("applications")
          .select("*", { count: "exact" })
          .order("updated_at", { ascending: false });

        query = applyFiltersToQuery(query, keyword);

        const { data: applicationRows, error: applicationError, count } = await query.range(from, to);
        if (applicationError) throw applicationError;

        const publicIds = (applicationRows || []).map((item) => item.public_id).filter(Boolean);
        const fileResult =
          publicIds.length > 0
            ? await supabase
                .from("application_files")
                .select("*")
                .in("public_id", publicIds)
                .order("created_at", { ascending: false })
            : { data: [], error: null };

        if (fileResult.error) throw fileResult.error;

        setApplications(applicationRows || []);
        setTotalCount(count || 0);
        setFiles(fileResult.data || []);
      } catch (error) {
        console.error("AgencyCooperationManagementPage loadData error:", error);
        setLoadError(error.message || "Load failed");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    agencySession?.agency_id,
    agencySession?.agency_unit_id,
    agencySession?.is_primary,
    page,
    pageSize,
    searchKeyword,
    selectedNode,
  ]);

  useEffect(() => {
    async function loadYearCounts() {
      if (!agencySession?.agency_id) return;

      try {
        let query = supabase
          .from("applications")
          .select("id, cooperation_admission_year")
          .eq("application_type", "cooperation")
          .eq("agency_id", agencySession.agency_id);

        if (agencySession?.is_primary !== true) {
          query = query.eq("agency_unit_id", agencySession?.agency_unit_id || "");
        }

        const { data, error } = await query;
        if (error) throw error;

        const map = new Map();
        (data || []).forEach((item) => {
          const year = item.cooperation_admission_year || "未设置";
          map.set(year, (map.get(year) || 0) + 1);
        });
        setYearCounts(Array.from(map.entries()).map(([year, count]) => ({ year, count })));
      } catch (error) {
        console.error("load agency cooperation year counts error:", error);
      }
    }

    loadYearCounts();
  }, [agencySession?.agency_id, agencySession?.agency_unit_id, agencySession?.is_primary]);

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

  const handleViewFile = async (file) => {
    if (!file?.file_path) return;
    const url = await getApplicationFileSignedUrl(file.file_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const goToPage = (target) => {
    const number = Math.min(Math.max(Number(target) || 1, 1), totalPages);
    setPage(number);
    setJumpPage("");
  };

  const detailFiles = detailStudent?.public_id ? fileMap[detailStudent.public_id] || {} : {};
  const uploadedDetailFiles = COOPERATION_FILE_TYPES.map((type) => detailFiles[type]?.[0]).filter(Boolean);
  const detailEducationRows = detailStudent ? parseCooperationEducationRows(detailStudent) : [];
  const detailDocumentOptions = detailStudent
    ? {
        student: detailStudent,
        language,
        agencyName: agencySession?.agency_name || "",
        universityName: getCooperationUniversity(detailStudent, language),
        partnerMajorName: getMajor(detailStudent, language),
        hallaMajorName: getCooperationHallaMajor(detailStudent, language),
      }
    : null;

  const downloadDetailApplicationDocument = async () => {
    if (!detailDocumentOptions) return;
    try {
      await downloadCooperationApplicationDocument(detailDocumentOptions);
    } catch (error) {
      console.error("download cooperation application document error:", error);
      alert(error?.message || "下载学生申请表失败");
    }
  };

  const downloadDetailFile = (file, fileType) => {
    if (!detailStudent || !file) return;
    downloadApplicationFile(file.file_path, buildCooperationMaterialDownloadName(detailStudent, file, fileType, t, language));
  };

  const downloadAllDetailFiles = async () => {
    if (!detailStudent) return;
    try {
      const documentBlob = detailDocumentOptions
        ? await generateCooperationApplicationDocumentBlob(detailDocumentOptions)
        : null;
      const zipFiles = uploadedDetailFiles.map((file) => ({
        ...file,
        downloadName: buildCooperationMaterialDownloadName(detailStudent, file, file.file_type, t, language),
      }));
      if (documentBlob) {
        zipFiles.unshift({
          blob: documentBlob,
          downloadName: buildCooperationApplicationFileName(detailStudent, language),
        });
      }
      downloadApplicationFilesAsZip(zipFiles, buildCooperationMaterialsZipName(detailStudent, language, "all"));
    } catch (error) {
      console.error("download cooperation all materials error:", error);
      alert(error?.message || "下载全部材料失败");
    }
  };

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
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              {yearCounts.reduce((sum, item) => sum + item.count, 0)}
            </span>
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
                      onClick={() =>
                        setExpandedYears((prev) => ({
                          ...prev,
                          [yearItem.year]: !prev[yearItem.year],
                        }))
                      }
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
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {yearItem.count}
                      </span>
                    </CooperationTreeButton>
                  </div>
                  {expandedYears[yearItem.year] ? (
                    <div className="ml-4 space-y-1 border-l border-slate-100 pl-3">
                      <CooperationTreeButton
                        active={selectedNode.type === "semester" && selectedNode.year === yearItem.year}
                        onClick={() => setSelectedNode({ type: "semester", year: yearItem.year })}
                      >
                        <span>{septemberSemesterLabel}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          {yearItem.count}
                        </span>
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
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
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
                        agencyName: agencySession?.agency_name || "-",
                      }));
                      exportCooperationRowsToExcel(exportRows, t, language, "agency-cooperation-applications");
                    })
                    .catch((error) => {
                      console.error("export agency cooperation applications error:", error);
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
                <table className="w-full table-fixed text-sm">
                  <thead className="bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">{t.table.index}</th>
                      <th className="px-6 py-4 font-semibold">{t.table.studentName}</th>
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
                          <CooperationEllipsisText text={row.university} widthClass="max-w-[160px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          <CooperationEllipsisText text={row.major} widthClass="max-w-[170px]" />
                        </td>
                        <td className="px-6 py-4 text-slate-600">{row.admissionYear}</td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={mapCooperationStatusType(row.student.cooperation_academic_status)}>
                            {row.academicStatus}
                          </CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={mapCooperationStatusType(row.student.status)}>
                            {row.applicationStatus}
                          </CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4">
                          <CooperationStatusBadge type={row.materialComplete ? "success" : "warning"}>
                            {row.materialStatus}
                          </CooperationStatusBadge>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{formatCooperationDateTime(row.updatedAt)}</td>
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() => setDetailStudent(row.student)}
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
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
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
                        className={pageNumber === page ? "rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white" : "rounded-lg border border-slate-200 px-3 py-1.5"}
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
                    className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
                  />
                  <button type="button" onClick={() => goToPage(jumpPage)} disabled={!jumpPage} className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold text-white disabled:opacity-50">
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

            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h4 className="text-base font-bold text-slate-900">{t.detail.basicInfo}</h4>
                <div className="mt-4 grid gap-x-6 gap-y-2 text-sm text-slate-700 md:grid-cols-2">
                  <div>{t.detail.fields.agency}: {agencySession?.agency_name || "-"}</div>
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
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="h-[220px] overflow-hidden rounded-xl bg-white shadow-sm">
                    {photoUrl ? (
                      <img src={photoUrl} alt="cooperation student" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-white" />
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h4 className="text-base font-bold text-slate-900">{t.detail.materials}</h4>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {COOPERATION_FILE_TYPES.map((type) => {
                      const file = detailFiles[type]?.[0];
                      return (
                        <div key={type} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">{t.materialLabels[type]}</div>
                              <div className="mt-1 text-xs text-slate-500">{file ? t.common.uploaded : t.detail.noFile}</div>
                            </div>
                            <CooperationStatusBadge type={file ? "success" : "danger"}>
                              {file ? t.common.uploaded : t.common.missing}
                            </CooperationStatusBadge>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => file && handleViewFile(file)}
                              disabled={!file}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              {t.detail.view}
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadDetailFile(file, type)}
                              disabled={!file}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
                            >
                              {t.detail.download}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h4 className="text-base font-bold text-slate-900">{t.detail.operations}</h4>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                      onClick={downloadDetailApplicationDocument}
                      className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                    {t.detail.exportOne}
                  </button>
                  <button
                    type="button"
                    onClick={downloadAllDetailFiles}
                    disabled={!detailStudent}
                    className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.detail.downloadAll}
                  </button>
                </div>
                <div className="text-sm text-slate-600">
                  {t.detail.fields.academicStatus}:{" "}
                  <span className="font-semibold text-slate-900">
                    {t.academicStatus[detailStudent.cooperation_academic_status] || detailStudent.cooperation_academic_status || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AgencyCooperationManagementPage;
