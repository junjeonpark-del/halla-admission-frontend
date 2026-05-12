import { Link, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { fetchApplicationById } from "../data/applicationsApi";
import {
  filterAdmissionTypeOptions,
  getMajorOptions,
  isAdmissionTypeAllowedForTrack,
  isMajorAllowedForTrack,
} from "../data/majorCatalog";
import PersonalStatementPreview from "../components/previews/PersonalStatementPreview";
import PersonalInfoConsentPreview from "../components/previews/PersonalInfoConsentPreview";
import FinancialGuaranteeFormPreview from "../components/previews/FinancialGuaranteePreview";
import { supabase } from "../lib/supabase";
import {
  fetchApplicationFiles,
  getApplicationFileSignedUrl,
  downloadApplicationFile,
  updateApplicationFileReview,
  downloadApplicationFilesAsZip,
} from "../data/applicationFilesApi";
import ApplicationFormPreview from "../components/previews/ApplicationFormPreview";
import LanguageApplicationFormPreview from "../components/previews/LanguageApplicationFormPreview";
import GraduateApplicationFormPreview from "../components/previews/GraduateApplicationFormPreview";
import { useAdminSession } from "../contexts/AdminSessionContext";

const messages = {
  zh: {
    common: {
      noFile: "暂无文件",
      noData: "-",
      loading: "加载中...",
      close: "关闭",
      yes: "是",
      no: "否",
      select: "请选择",
      save: "保存",
      cancel: "取消",
      downloading: "下载中...",
    },
    page: {
      loading: "正在加载申请详情...",
      notFound: "未找到该申请记录。",
      title: "学生材料审核",
      desc: "可分别维护“申请审核备注”和“材料审核备注”，并支持单独下载、所选下载和全部打包下载",
      studentName: "学生姓名",
      intake: "申请批次",
      applicationType: "申请类型",
      major: "申请专业",
      currentStatus: "当前状态",
      agency: "机构",
      agencyEditing: "当前机构编辑中",
      adminEditing: "当前管理员审核中",
      schoolPreview: "学校格式预览",
      downloadFullPackage: "下载完整学校申请表",
      downloadAllZip: "下载全部材料 ZIP",
      downloadSelectedZip: "下载所选材料 ZIP",
      checkedCount: "当前已勾选材料",
      checkedDownloadable: "其中可打包下载",
    },
    applicationReview: {
      title: "申请审核结果",
      desc: "这里是这一个学生这份申请的整体审核状态与整体说明，不是单个材料状态。",
      currentStatus: "当前状态",
      changeStatus: "修改申请状态",
      reviewNote: "申请审核备注",
      reviewPlaceholder: "例如：该学生综合审核未通过；或该申请整体情况说明写在这里。",
      saveButton: "保存申请状态与申请备注",
      saving: "保存中...",
      saved: "申请状态已更新",
    },
    applicationForm: {
      title: "申请信息",
      desc: "管理员可直接修改申请表中的关键信息",
      edit: "编辑申请信息",
      cancelEdit: "取消编辑",
      save: "保存申请信息",
      saving: "保存中...",
      saved: "申请信息已更新",
ocrPrefix: "OCR识别",
noOcrResult: "暂无识别信息",
ocrStatusMatch: "一致",
ocrStatusCheck: "需确认",
ocrStatusMismatch: "不一致",
fields: {
        englishName: "英文姓名",
        gender: "性别",
        nationality: "国籍",
        birth: "出生日期",
        tel: "电话",
        email: "邮箱",
        address: "地址",
        passportNo: "护照号",
        major: "专业",
        admissionType: "申请类型",
        programTrack: "课程轨道",
        dormitory: "宿舍申请",
      },
      genderMale: "男",
      genderFemale: "女",
      admissionTypes: {
        freshman: "新入",
        transfer2: "插班2年级",
        transfer3: "插班3年级",
        transfer4: "插班4年级",
        dual22: "双学位(2+2)",
        dual31: "双学位(3+1)",
      },
      tracks: {
        korean: "韩语课程",
        english: "英语课程",
        bilingual: "双语课程",
      },
    },
    materials: {
      title: "固定材料清单",
      desc: "点选材料可在右侧查看状态，勾选可批量打包下载",
      required: "必需材料",
      conditional: "条件材料",
      generatedDesc: "该材料由系统生成，后续可在此预览学校固定格式文件",
      notUploaded: "该材料未上传",
      exempt: "该材料当前为免提交",
      previewLoading: "正在加载预览...",
      unsupportedPreview: "当前文件类型暂不支持页面内预览，请使用下载按钮查看。",
      placeholder: "这里后续显示真实文件预览区域",
      selectLeft: "请选择左侧材料进行查看",
      currentMaterialDownload: "下载当前材料",
      currentMaterialTitle: "已接入真实材料状态、文件名、下载、预览与审核备注。",
      fileName: "文件名",
      path: "路径",
      noteLabel: "材料审核备注",
      notePlaceholder: "例如：该材料哪里有问题、需要补什么，就写在这里。",
      approve: "标记通过",
      requestMore: "标记待补件",
      saveNote: "保存材料备注",
      saveSuccess: "保存成功",
      saveFailed: "保存失败，请检查数据库权限或字段。",
      cannotReview: "当前材料不是上传文件，无法保存审核结果。",
      currentNotGenerated: "当前材料不是系统生成页。",
      unsupportedGenerated: "当前材料暂不支持生成下载。",
      noApplicationData: "当前没有申请数据，无法生成完整申请材料。",
      noFullPackage: "当前没有可生成的完整申请材料。",
      popupBlocked: "浏览器拦截了新窗口，请允许弹窗后重试。",
      generateCurrentFailed: "生成当前材料失败：",
      generateFullFailed: "生成完整申请材料失败：",
      selectedNone: "请先勾选至少一个已上传材料。",
      noUploadedZip: "当前没有可下载的已上传材料。",
      currentDownloadFailed: "下载失败，请检查 Storage 文件是否存在。",
      selectedZipFailed: "下载所选材料 ZIP 失败，请检查 Storage 文件是否存在。",
      allZipFailed: "下载全部材料 ZIP 失败，请检查 Storage 文件是否存在。",
      missingApplication: "缺少申请记录",
    },
    statusLabels: {
      draft: "草稿",
      submitted: "已提交",
      under_review: "审核中",
      missing_documents: "缺少材料",
      approved: "已通过",
      rejected: "已拒绝",
    },
    materialStatus: {
      uploaded: "已上传",
      missing: "未上传",
      pending: "待处理",
      generated: "系统生成",
      exempt: "免提交",
      approved: "已通过",
      needMore: "待补件",
    },
    materialLabels: {
      applicationForm: "入学申请表",
      passport: "护照",
      photo: "证件照",
      finalDiploma: "最终学历证明",
      finalTranscript: "最终学历成绩单",
      familyRelation: "家庭关系证明",
      parentsId: "父母身份证",
      languageCertificate: "语言能力证明",
      personalStatement: "自我介绍及学习计划书",
      personalInfoConsent: "个人信息收集及使用同意书",
      arc: "外国人登录证",
      bankStatement: "存款证明",
      financialGuaranteeForm: "财务担保确认书",
      guarantorEmploymentIncome: "财务担保人在职证明及收入证明",
    },
    notes: {
      applicationForm: "由系统根据填写内容自动生成学校固定格式申请表。",
      languageExempt: "双语授课免提交。",
      arcExempt: "当前按“无外国人登录证”处理为免提交。",
    },
    alerts: {
      invalidAdminSession: "管理员登录状态无效，请重新登录",
      lockedByOtherAdmin: (name) => `该申请当前正在由管理员 ${name || "其他管理员"} 审核，请稍后再试。`,
      agencyEditingConfirm:
        "该申请当前正在由机构账号 {name} 编辑。\n\n继续进入审核可能与机构修改发生冲突。\n\n是否仍然继续进入审核？",
      cancelReview: "已取消进入审核页",
      notFound:
        "未找到该申请记录，请检查路由参数是否和数据库中的 public_id 一致。",
      loadFailed: "申请详情加载失败，请检查数据。",
      saveFormMissing: "缺少申请记录，无法保存申请信息。",
      saveFormConflict: "该申请已被机构端或其他管理员更新，请刷新后再继续修改申请信息。",
      saveFormFailed: "保存申请信息失败：",
      saveStatusMissing: "缺少申请记录，无法保存状态。",
      saveStatusConflict: "该申请已被机构端或其他管理员更新，请刷新后再继续审核。",
      saveStatusFailed: "保存失败：",
    },
  },
  en: {
    common: {
      noFile: "No file",
      noData: "-",
      loading: "Loading...",
      close: "Close",
      yes: "Yes",
      no: "No",
      select: "Please select",
      save: "Save",
      cancel: "Cancel",
      downloading: "Downloading...",
    },
    page: {
      loading: "Loading application details...",
      notFound: "Application record not found.",
      title: "Student Material Review",
      desc: "You can separately manage application review notes and material review notes, and support single download, selected ZIP, and full ZIP download.",
      studentName: "Student Name",
      intake: "Intake",
      applicationType: "Application Type",
      major: "Major",
      currentStatus: "Current Status",
      agency: "Agency",
      agencyEditing: "Agency currently editing",
      adminEditing: "Admin currently reviewing",
      schoolPreview: "School Format Preview",
      downloadFullPackage: "Download Full School Package",
      downloadAllZip: "Download All Materials ZIP",
      downloadSelectedZip: "Download Selected Materials ZIP",
      checkedCount: "Currently checked",
      checkedDownloadable: "Downloadable among checked",
    },
    applicationReview: {
      title: "Application Review Result",
      desc: "This area is for the overall review result and overall comment of this application, not for a single material.",
      currentStatus: "Current Status",
      changeStatus: "Change Application Status",
      reviewNote: "Application Review Note",
      reviewPlaceholder: "For example: explain why the student was not approved, or write the overall review summary here.",
      saveButton: "Save Application Status and Review Note",
      saving: "Saving...",
      saved: "Application status updated",
    },
    applicationForm: {
      title: "Application Information",
      desc: "Admins can directly edit key information in the application form",
      edit: "Edit Application Info",
      cancelEdit: "Cancel Edit",
      save: "Save Application Info",
      saving: "Saving...",
      saved: "Application information updated",
ocrPrefix: "OCR",
noOcrResult: "No OCR result",
ocrStatusMatch: "Match",
ocrStatusCheck: "Check",
ocrStatusMismatch: "Mismatch",
fields: {
        englishName: "English Name",
        gender: "Gender",
        nationality: "Nationality",
        birth: "Date of Birth",
        tel: "Phone",
        email: "Email",
        address: "Address",
        passportNo: "Passport No.",
        major: "Major",
        admissionType: "Admission Type",
        programTrack: "Program Track",
        dormitory: "Dormitory",
        degreeLevel: "Degree Level",
      },
      genderMale: "Male",
      genderFemale: "Female",
      admissionTypes: {
        freshman: "Freshman",
        transfer2: "Transfer Year 2",
        transfer3: "Transfer Year 3",
        transfer4: "Transfer Year 4",
        dual22: "Dual Degree (2+2)",
        dual31: "Dual Degree (3+1)",
      },
      tracks: {
        korean: "Korean Track",
        english: "English Track",
        bilingual: "Bilingual Program",
      },
    },
    materials: {
      title: "Fixed Material List",
      desc: "Select a material to view it on the right, and check items for batch ZIP download",
      required: "Required",
      conditional: "Conditional",
      generatedDesc: "This material is generated by the system and can later preview the official school format here.",
      notUploaded: "This material has not been uploaded",
      exempt: "This material is currently exempt",
      previewLoading: "Loading preview...",
      unsupportedPreview: "This file type is not supported for in-page preview. Please use the download button.",
      placeholder: "The real file preview area will appear here later",
      selectLeft: "Please select a material from the left",
      currentMaterialDownload: "Download Current Material",
      currentMaterialTitle: "Real material status, file name, download, preview, and review notes are connected.",
      fileName: "File Name",
      path: "Path",
      noteLabel: "Material Review Note",
      notePlaceholder: "For example: describe what is wrong with this material and what needs to be supplemented.",
      approve: "Mark Approved",
      requestMore: "Mark Need More",
      saveNote: "Save Material Note",
      saveSuccess: "Saved successfully",
      saveFailed: "Save failed. Please check database permissions or fields.",
      cannotReview: "The current material is not an uploaded file and cannot be reviewed.",
      currentNotGenerated: "The current material is not a generated page.",
      unsupportedGenerated: "This material does not support generated download yet.",
      noApplicationData: "There is no application data to generate the full package.",
      noFullPackage: "There is no full generated package available.",
      popupBlocked: "The browser blocked the new window. Please allow pop-ups and try again.",
      generateCurrentFailed: "Failed to generate current material: ",
      generateFullFailed: "Failed to generate full application package: ",
      selectedNone: "Please check at least one uploaded material first.",
      noUploadedZip: "There are no uploaded materials to download.",
      currentDownloadFailed: "Download failed. Please check whether the Storage file exists.",
      selectedZipFailed: "Failed to download selected ZIP. Please check whether the Storage file exists.",
      allZipFailed: "Failed to download all ZIP. Please check whether the Storage file exists.",
      missingApplication: "Missing application record",
    },
    statusLabels: {
      draft: "Draft",
      submitted: "Submitted",
      under_review: "Under Review",
      missing_documents: "Missing Documents",
      approved: "Approved",
      rejected: "Rejected",
    },
    materialStatus: {
      uploaded: "Uploaded",
      missing: "Missing",
      pending: "Pending",
      generated: "Generated",
      exempt: "Exempt",
      approved: "Approved",
      needMore: "Need More",
    },
    materialLabels: {
      applicationForm: "Application Form",
      passport: "Passport",
      photo: "ID Photo",
      finalDiploma: "Final Diploma",
      finalTranscript: "Final Transcript",
      familyRelation: "Family Relation Certificate",
      parentsId: "Parents' ID",
      languageCertificate: "Language Certificate",
      personalStatement: "Personal Statement & Study Plan",
      personalInfoConsent: "Personal Information Consent Form",
      arc: "Alien Registration Card",
      bankStatement: "Bank Statement",
      financialGuaranteeForm: "Financial Guarantee Form",
      guarantorEmploymentIncome: "Guarantor Employment & Income Certificate",
    },
    notes: {
      applicationForm: "The system generates the fixed school application form based on the entered content.",
      languageExempt: "Exempt for bilingual program.",
      arcExempt: "Currently treated as exempt because there is no alien registration card.",
    },
    alerts: {
      invalidAdminSession: "Admin session is invalid. Please log in again.",
      lockedByOtherAdmin: (name) => `This application is currently being reviewed by admin ${name || "another admin"}. Please try again later.`,
      agencyEditingConfirm:
        "This application is currently being edited by agency account {name}.\n\nContinuing may conflict with agency changes.\n\nDo you still want to continue?",
      cancelReview: "Review entry cancelled",
      notFound:
        "Application not found. Please check whether the route parameter matches the public_id in the database.",
      loadFailed: "Failed to load application details. Please check the data.",
      saveFormMissing: "Missing application record. Unable to save application information.",
      saveFormConflict: "This application has been updated by the agency or another admin. Please refresh before editing again.",
      saveFormFailed: "Failed to save application information: ",
      saveStatusMissing: "Missing application record. Unable to save status.",
      saveStatusConflict: "This application has been updated by the agency or another admin. Please refresh before reviewing again.",
      saveStatusFailed: "Save failed: ",
    },
  },
  ko: {
    common: {
      noFile: "파일 없음",
      noData: "-",
      loading: "불러오는 중...",
      close: "닫기",
      yes: "예",
      no: "아니오",
      select: "선택하세요",
      save: "저장",
      cancel: "취소",
      downloading: "다운로드 중...",
    },
    page: {
      loading: "지원 상세 정보를 불러오는 중...",
      notFound: "지원 기록을 찾을 수 없습니다.",
      title: "학생 서류 심사",
      desc: "지원 심사 메모와 서류 심사 메모를 각각 관리할 수 있으며, 단건 다운로드, 선택 ZIP, 전체 ZIP 다운로드를 지원합니다.",
      studentName: "학생 이름",
      intake: "지원 차수",
      applicationType: "지원 유형",
      major: "지원 전공",
      currentStatus: "현재 상태",
      agency: "기관",
      agencyEditing: "현재 기관이 수정 중",
      adminEditing: "현재 관리자가 심사 중",
      schoolPreview: "학교 형식 미리보기",
      downloadFullPackage: "전체 학교 서류 다운로드",
      downloadAllZip: "전체 서류 ZIP 다운로드",
      downloadSelectedZip: "선택 서류 ZIP 다운로드",
      checkedCount: "현재 체크된 항목",
      checkedDownloadable: "체크 항목 중 다운로드 가능",
    },
    applicationReview: {
      title: "지원 심사 결과",
      desc: "이 영역은 이 학생의 이 지원서 전체 심사 상태와 전체 설명을 위한 영역이며, 개별 서류 상태가 아닙니다.",
      currentStatus: "현재 상태",
      changeStatus: "지원 상태 변경",
      reviewNote: "지원 심사 메모",
      reviewPlaceholder: "예: 학생이 불합격한 이유, 또는 전체 지원에 대한 설명을 여기에 작성하세요.",
      saveButton: "지원 상태 및 심사 메모 저장",
      saving: "저장 중...",
      saved: "지원 상태가 업데이트되었습니다",
    },
    applicationForm: {
      title: "지원 정보",
      desc: "관리자는 지원서의 핵심 정보를 직접 수정할 수 있습니다",
      edit: "지원 정보 수정",
      cancelEdit: "수정 취소",
      save: "지원 정보 저장",
      saving: "저장 중...",
      saved: "지원 정보가 업데이트되었습니다",
ocrPrefix: "OCR 인식",
noOcrResult: "인식 정보 없음",
ocrStatusMatch: "일치",
ocrStatusCheck: "확인 필요",
ocrStatusMismatch: "불일치",
fields: {
        englishName: "영문 이름",
        gender: "성별",
        nationality: "국적",
        birth: "생년월일",
        tel: "전화",
        email: "이메일",
        address: "주소",
        passportNo: "여권번호",
        major: "전공",
        admissionType: "지원 유형",
        programTrack: "과정 트랙",
        dormitory: "기숙사 신청",
      },
      genderMale: "남",
      genderFemale: "여",
      admissionTypes: {
        freshman: "신입",
        transfer2: "편입 2학년",
        transfer3: "편입 3학년",
        transfer4: "편입 4학년",
        dual22: "복수학위(2+2)",
        dual31: "복수학위(3+1)",
      },
      tracks: {
        korean: "한국어 과정",
        english: "영어 과정",
        bilingual: "이중언어 과정",
      },
    },
    materials: {
      title: "고정 서류 목록",
      desc: "서류를 선택하면 오른쪽에서 확인할 수 있고, 체크하면 일괄 ZIP 다운로드가 가능합니다",
      required: "필수 서류",
      conditional: "조건 서류",
      generatedDesc: "이 서류는 시스템이 생성하며, 추후 학교 고정 양식을 여기서 미리볼 수 있습니다.",
      notUploaded: "이 서류는 업로드되지 않았습니다",
      exempt: "이 서류는 현재 면제입니다",
      previewLoading: "미리보기 불러오는 중...",
      unsupportedPreview: "현재 파일 형식은 페이지 내 미리보기를 지원하지 않습니다. 다운로드 버튼을 사용하세요.",
      placeholder: "추후 실제 파일 미리보기 영역이 여기에 표시됩니다",
      selectLeft: "왼쪽에서 서류를 선택하세요",
      currentMaterialDownload: "현재 서류 다운로드",
      currentMaterialTitle: "실제 서류 상태, 파일명, 다운로드, 미리보기 및 심사 메모가 연결되어 있습니다.",
      fileName: "파일명",
      path: "경로",
      noteLabel: "서류 심사 메모",
      notePlaceholder: "예: 이 서류의 문제점과 보완이 필요한 내용을 여기에 작성하세요.",
      approve: "통과 표시",
      requestMore: "보완 필요 표시",
      saveNote: "서류 메모 저장",
      saveSuccess: "저장되었습니다",
      saveFailed: "저장 실패. 데이터베이스 권한 또는 필드를 확인하세요.",
      cannotReview: "현재 서류는 업로드 파일이 아니므로 심사 결과를 저장할 수 없습니다.",
      currentNotGenerated: "현재 서류는 시스템 생성 페이지가 아닙니다.",
      unsupportedGenerated: "이 서류는 아직 생성 다운로드를 지원하지 않습니다.",
      noApplicationData: "전체 서류를 생성할 지원 데이터가 없습니다.",
      noFullPackage: "생성 가능한 전체 지원 패키지가 없습니다.",
      popupBlocked: "브라우저가 새 창을 차단했습니다. 팝업을 허용한 후 다시 시도하세요.",
      generateCurrentFailed: "현재 서류 생성 실패: ",
      generateFullFailed: "전체 지원 패키지 생성 실패: ",
      selectedNone: "업로드된 서류를 하나 이상 먼저 체크하세요.",
      noUploadedZip: "다운로드할 업로드 서류가 없습니다.",
      currentDownloadFailed: "다운로드 실패. Storage 파일 존재 여부를 확인하세요.",
      selectedZipFailed: "선택 ZIP 다운로드 실패. Storage 파일 존재 여부를 확인하세요.",
      allZipFailed: "전체 ZIP 다운로드 실패. Storage 파일 존재 여부를 확인하세요.",
      missingApplication: "지원 기록이 없습니다",
    },
    statusLabels: {
      draft: "초안",
      submitted: "제출 완료",
      under_review: "심사 중",
      missing_documents: "서류 부족",
      approved: "승인",
      rejected: "거절",
    },
    materialStatus: {
      uploaded: "업로드됨",
      missing: "미업로드",
      pending: "대기",
      generated: "시스템 생성",
      exempt: "면제",
      approved: "승인",
      needMore: "보완 필요",
    },
    materialLabels: {
      applicationForm: "입학 지원서",
      passport: "여권",
      photo: "증명사진",
      finalDiploma: "최종 학력 증명",
      finalTranscript: "최종 성적증명서",
      familyRelation: "가족관계증명",
      parentsId: "부모 신분증",
      languageCertificate: "어학능력증명",
      personalStatement: "자기소개 및 학업계획서",
      personalInfoConsent: "개인정보 수집 및 이용 동의서",
      arc: "외국인등록증",
      bankStatement: "잔고증명",
      financialGuaranteeForm: "재정보증 확인서",
      guarantorEmploymentIncome: "재정보증인 재직 및 소득증명",
    },
    notes: {
      applicationForm: "입력된 내용을 기준으로 시스템이 학교 고정 양식 지원서를 생성합니다.",
      languageExempt: "이중언어 과정은 면제입니다.",
      arcExempt: "현재 외국인등록증이 없는 것으로 처리되어 면제입니다.",
    },
    alerts: {
      invalidAdminSession: "관리자 로그인 상태가 유효하지 않습니다. 다시 로그인하세요.",
      lockedByOtherAdmin: (name) => `이 지원서는 현재 관리자 ${name || "다른 관리자"}가 심사 중입니다. 잠시 후 다시 시도하세요.`,
      agencyEditingConfirm:
        "이 지원서는 현재 기관 계정 {name}이 수정 중입니다.\n\n계속하면 기관 수정과 충돌할 수 있습니다.\n\n그래도 계속하시겠습니까?",
      cancelReview: "심사 진입이 취소되었습니다",
      notFound:
        "지원서를 찾을 수 없습니다. 라우트 파라미터가 데이터베이스의 public_id와 일치하는지 확인하세요.",
      loadFailed: "지원 상세 로드에 실패했습니다. 데이터를 확인하세요.",
      saveFormMissing: "지원 기록이 없어 지원 정보를 저장할 수 없습니다.",
      saveFormConflict: "이 지원서는 기관 또는 다른 관리자에 의해 업데이트되었습니다. 다시 수정하려면 새로고침하세요.",
      saveFormFailed: "지원 정보 저장 실패: ",
      saveStatusMissing: "지원 기록이 없어 상태를 저장할 수 없습니다.",
      saveStatusConflict: "이 지원서는 기관 또는 다른 관리자에 의해 업데이트되었습니다. 다시 심사하려면 새로고침하세요.",
      saveStatusFailed: "저장 실패: ",
    },
  },
};

function StatusBadge({ type = "default", children }) {
  const classes = {
    uploaded: "bg-emerald-100 text-emerald-700",
    missing: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    generated: "bg-blue-100 text-blue-700",
    exempt: "bg-slate-200 text-slate-600",
    default: "bg-slate-100 text-slate-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    success: "bg-emerald-100 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[type] || classes.default}`}
    >
      {children}
    </span>
  );
}

function ReviewMenuItem({ item, active, checked, onClick, onCheck }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        active
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(item.key, e.target.checked)}
          className="mt-[3px] h-4 w-4 shrink-0 rounded border-slate-300"
        />

        <button
          type="button"
          onClick={onClick}
          className="review-material-menu-button min-w-0 flex-1 text-left"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 break-words text-sm font-semibold leading-6 text-slate-900">
              {item.label}
            </div>
            <div className="shrink-0">
              <StatusBadge type={item.statusType}>{item.statusLabel}</StatusBadge>
            </div>
          </div>

          {item.fileName ? (
            <div className="mt-2 break-all text-xs leading-5 text-slate-500">
              {item.fileName}
            </div>
          ) : null}
        </button>
      </div>
    </div>
  );
}

function getFileKind(fileName = "", filePath = "") {
  const value = `${fileName} ${filePath}`.toLowerCase();

  if (
    value.endsWith(".jpg") ||
    value.endsWith(".jpeg") ||
    value.endsWith(".png") ||
    value.endsWith(".webp") ||
    value.endsWith(".gif")
  ) {
    return "image";
  }

  if (value.endsWith(".pdf")) {
    return "pdf";
  }

  return "other";
}

function renderApplicationFormByType(student, photoUrl = "") {
  const type = student?.application_type || "undergraduate";

  if (type === "language") {
    return <LanguageApplicationFormPreview student={student} photoUrl={photoUrl} />;
  }

  if (type === "graduate") {
    return <GraduateApplicationFormPreview student={student} photoUrl={photoUrl} />;
  }

  return <ApplicationFormPreview student={student} photoUrl={photoUrl} />;
}


function renderGeneratedPreview(item, photoUrl = "") {
  if (!item) return null;

  if (item.key === "applicationForm") {
    return renderApplicationFormByType(item.student, photoUrl);
  }

  if (item.key === "personalStatement") {
    return <PersonalStatementPreview student={item.student} />;
  }

  if (item.key === "personalInfoConsent") {
    return <PersonalInfoConsentPreview student={item.student} />;
  }

  if (item.key === "financialGuaranteeForm") {
    return <FinancialGuaranteeFormPreview student={item.student} />;
  }

  return null;
}

function PreviewPlaceholder({
  item,
  previewUrl,
  previewLoading,
  onDownload,
  reviewNote,
  setReviewNote,
  onApprove,
  onRequestMore,
  onSaveNote,
  savingReview,
  applicationPhotoUrl,
  t,
}) {
  if (!item) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-400">
        {t.materials.selectLeft}
      </div>
    );
  }

  const fileKind = getFileKind(item.fileName, item.filePath);
  const canPreview = item.statusType === "uploaded" && !!previewUrl;
  const canDownload =
    (item.statusType === "uploaded" && !!item.filePath) ||
    item.statusType === "generated";
  const canReview = !!item.fileId;

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="shrink-0 flex items-center justify-between border-b border-slate-100 px-6 py-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{item.label}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {t.materials.currentMaterialTitle}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onDownload}
            disabled={!canDownload}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              canDownload
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            {t.materials.currentMaterialDownload}
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <StatusBadge type={item.statusType}>{item.statusLabel}</StatusBadge>
          {item.required ? (
            <StatusBadge type="default">{t.materials.required}</StatusBadge>
          ) : (
            <StatusBadge type="exempt">{t.materials.conditional}</StatusBadge>
          )}
        </div>

        {item.note ? (
          <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {item.note}
          </div>
        ) : null}

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          {item.statusType === "missing" ? (
            <p className="text-sm text-red-600">{t.materials.notUploaded}</p>
          ) : item.statusType === "exempt" ? (
            <p className="text-sm text-slate-500">{t.materials.exempt}</p>
                    ) : item.statusType === "generated" ? (
            item.key === "applicationForm" ? (
              renderApplicationFormByType(item.student, applicationPhotoUrl)
            ) : item.key === "personalStatement" ? (

              <PersonalStatementPreview student={item.student} />
            ) : item.key === "personalInfoConsent" ? (
              <PersonalInfoConsentPreview student={item.student} />
            ) : item.key === "financialGuaranteeForm" ? (
              <FinancialGuaranteeFormPreview student={item.student} />
            ) : (
              <p className="text-sm text-blue-600">{t.materials.generatedDesc}</p>
            )
          ) : previewLoading ? (
            <p className="text-sm text-slate-500">{t.materials.previewLoading}</p>
          ) : canPreview && fileKind === "image" ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 break-all">
                {t.materials.fileName}：{item.fileName}
              </div>
              <img
                src={previewUrl}
                alt={item.fileName || item.label}
                className="mx-auto max-h-[calc(100vh-340px)] min-h-[620px] w-auto max-w-full rounded-xl border border-slate-200 bg-white object-contain"
              />
            </div>
          ) : canPreview && fileKind === "pdf" ? (
            <div className="space-y-4">
              <div className="text-xs text-slate-500 break-all">
                {t.materials.fileName}：{item.fileName}
              </div>
              <iframe
                src={previewUrl}
                title={item.fileName || item.label}
                className="h-[calc(100vh-220px)] min-h-[920px] w-full rounded-xl border border-slate-200 bg-white"
              />
            </div>
          ) : item.statusType === "uploaded" ? (
            <div className="space-y-2">
              <p className="text-sm text-emerald-700">{item.statusLabel}</p>
              <p className="text-xs text-slate-500 break-all">
                {t.materials.fileName}：{item.fileName || "-"}
              </p>
              <p className="text-xs text-slate-500 break-all">
                {t.materials.path}：{item.filePath || "-"}
              </p>
              <p className="text-xs text-slate-500">
                {t.materials.unsupportedPreview}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{t.materials.placeholder}</p>
          )}
        </div>

        {canReview ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
            <h4 className="text-base font-bold text-slate-900">{t.materials.noteLabel}</h4>
            <textarea
              rows={4}
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={t.materials.notePlaceholder}
              disabled={!canReview}
              className="mt-4 w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={onApprove}
                disabled={!canReview || savingReview}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {t.materials.approve}
              </button>
              <button
                onClick={onRequestMore}
                disabled={!canReview || savingReview}
                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                {t.materials.requestMore}
              </button>
              <button
                onClick={onSaveNote}
                disabled={!canReview || savingReview}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
              >
                {t.materials.saveNote}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ApplicationReviewPage() {
  const { id } = useParams();
  const adminContext = useAdminSession();
  const language = adminContext?.language || "zh";
  const t = messages[language] || messages.zh;
  const formTexts = t.applicationForm || messages.zh.applicationForm;
  const formFieldTexts = formTexts.fields || messages.zh.applicationForm.fields;
  const formAdmissionTexts =
    formTexts.admissionTypes || messages.zh.applicationForm.admissionTypes;
  const formTrackTexts = formTexts.tracks || messages.zh.applicationForm.tracks;
  const materialLabels = t.materialLabels || messages.zh.materialLabels;
  const materialStatusTexts = t.materialStatus || messages.zh.materialStatus;
  const noteTexts = t.notes || messages.zh.notes;

  const [student, setStudent] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [applicationPhotoUrl, setApplicationPhotoUrl] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState("submitted");
  const [adminSession, setAdminSession] = useState(null);
  const [agencyName, setAgencyName] = useState("");
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState("");
  const [, setLockChecked] = useState(false);
  const ADMIN_LOCK_TIMEOUT_MINUTES = 20;
  const [savingApplicationStatus, setSavingApplicationStatus] = useState(false);
  const [applicationReviewNote, setApplicationReviewNote] = useState("");
  const [selectedKey, setSelectedKey] = useState("applicationForm");
  const [checkedMap, setCheckedMap] = useState({});

  const [isEditingApplication, setIsEditingApplication] = useState(false);
  const [savingApplicationForm, setSavingApplicationForm] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    english_name: "",
    gender: "",
    nationality_applicant: "",
    date_of_birth: "",
    tel: "",
    email: "",
    address: "",
    passport_no: "",
    major: "",
    degree_level: "",
    admission_type: "",
    program_track: "",
    dormitory: "",
  });


  const applicationType = student?.application_type || "undergraduate";
  const isLanguageApplication = applicationType === "language";
  const applicationTypeLabel =
    applicationType === "language"
      ? language === "en"
        ? "Language Program"
        : language === "ko"
          ? "\uc5b4\ud559\uc5f0\uc218"
          : "\u8bed\u8a00\u73ed"
      : applicationType === "graduate"
        ? language === "en"
          ? "Graduate School"
          : language === "ko"
            ? "\ub300\ud559\uc6d0"
            : "\u5927\u5b66\u9662"
        : language === "en"
          ? "Undergraduate"
          : language === "ko"
            ? "\ud559\ubd80"
            : "\u672c\u79d1";
  const degreeLevelLabel =
    language === "en"
      ? "Degree Level"
      : language === "ko"
        ? "\ud559\uc704 \uacfc\uc815"
        : "\u5b66\u4f4d\u8bfe\u7a0b";
  const degreeLevelOptions = [
    { value: "master", label: language === "en" ? "Master" : language === "ko" ? "\uc11d\uc0ac" : "\u7855\u58eb" },
    { value: "doctor", label: language === "en" ? "Doctor" : language === "ko" ? "\ubc15\uc0ac" : "\u535a\u58eb" },
  ];
    const rawAdmissionTypeOptions =
    applicationType === "graduate"
      ? [
          { value: "Freshman", label: formAdmissionTexts.freshman },
          {
            value: "Transfer (2nd Semester)",
            label:
              language === "en"
                ? "Transfer (2nd Semester)"
                : language === "ko"
                  ? "편입 2학기"
                  : "插班第二学期",
          },
          {
            value: "Transfer (3rd Semester)",
            label:
              language === "en"
                ? "Transfer (3rd Semester)"
                : language === "ko"
                  ? "편입 3학기"
                  : "插班第三学期",
          },
        ]
      : [
          { value: "Freshman", label: formAdmissionTexts.freshman },
          { value: "Transfer (2nd Year)", label: formAdmissionTexts.transfer2 },
          { value: "Transfer (3rd Year)", label: formAdmissionTexts.transfer3 },
          { value: "Transfer (4th Year)", label: formAdmissionTexts.transfer4 },
          { value: "Dual Degree (2+2)", label: formAdmissionTexts.dual22 },
          { value: "Dual Degree (3+1)", label: formAdmissionTexts.dual31 },
        ];
  const programTrackOptions =
    isLanguageApplication
      ? [
          {
            value: "Korean Language Program",
            label: language === "en" ? "Korean Language Program" : language === "ko" ? "한국어 언어반" : "韩语语言班",
          },
          {
            value: "English Language Program",
            label: language === "en" ? "English Language Program" : language === "ko" ? "영어 언어반" : "英语语言班",
          },
        ]
      : [
          { value: "Korean Track", label: formTrackTexts.korean },
          { value: "English Track", label: formTrackTexts.english },
          { value: "Bilingual Program (Chinese)", label: formTrackTexts.bilingual },
        ];

  const majorOptions = useMemo(() => {
    if (isLanguageApplication) return [];

    return getMajorOptions({
      applicationType,
      programTrack: applicationForm.program_track,
      language,
    });
  }, [applicationType, applicationForm.program_track, isLanguageApplication, language]);

  const admissionTypeOptions = useMemo(() => {
    if (isLanguageApplication) return rawAdmissionTypeOptions;

    return filterAdmissionTypeOptions(rawAdmissionTypeOptions, {
      applicationType,
      programTrack: applicationForm.program_track,
    });
  }, [
    applicationType,
    applicationForm.program_track,
    isLanguageApplication,
    rawAdmissionTypeOptions,
  ]);

  const intakeDisplayLabel =
    student?.intake_title ||
    student?.intake_name ||
    (student?.intake_year && student?.intake_month && student?.intake_round_number
      ? String(student.intake_year) + "-" + String(student.intake_month) + " " + String(student.intake_round_number)
      : student?.intake_id || "-");

      const latestPassportFile = useMemo(() => {
    const passportFiles = uploadedFiles.filter(
      (file) => file.file_type === "passport"
    );

    return (
      passportFiles.sort(
        (a, b) =>
          new Date(b.created_at || 0).getTime() -
          new Date(a.created_at || 0).getTime()
      )[0] || null
    );
  }, [uploadedFiles]);

  const toHalfWidth = (value) => {
    return String(value || "").replace(/[！-～]/g, (char) =>
      String.fromCharCode(char.charCodeAt(0) - 0xfee0)
    );
  };

  const normalizeOcrName = (value) => {
    return toHalfWidth(value)
      .toUpperCase()
      .replace(/<+/g, " ")
      .replace(/[.,，。·'’`-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const normalizeOcrPassportNo = (value) => {
    return toHalfWidth(value)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .trim();
  };

  const normalizeOcrPassportNoLoose = (value) => {
    return normalizeOcrPassportNo(value)
      .replace(/[I|L]/g, "1")
      .replace(/O/g, "0")
      .replace(/S/g, "5")
      .replace(/B/g, "8");
  };

  const normalizeOcrDate = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "";

    const monthMap = {
      JAN: "01",
      FEB: "02",
      MAR: "03",
      APR: "04",
      MAY: "05",
      JUN: "06",
      JUL: "07",
      AUG: "08",
      SEP: "09",
      SEPT: "09",
      OCT: "10",
      NOV: "11",
      DEC: "12",
    };

    const normalized = raw
      .toUpperCase()
      .replace(/[年月.]/g, "/")
      .replace(/日/g, "")
      .replace(/-/g, "/")
      .replace(/\s+/g, " ")
      .trim();

    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(normalized)) {
      const [year, month, day] = normalized.split("/");
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    if (/^\d{8}$/.test(normalized)) {
      return `${normalized.slice(0, 4)}-${normalized.slice(4, 6)}-${normalized.slice(6, 8)}`;
    }

    const dayMonthYearMatch = normalized.match(
      /^(\d{1,2})\s+([A-Z]{3,4})\s+(\d{4})$/
    );

    if (dayMonthYearMatch) {
      const [, day, monthText, year] = dayMonthYearMatch;
      const month = monthMap[monthText];

      if (month) {
        return `${year}-${month}-${String(day).padStart(2, "0")}`;
      }
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return raw;

    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const getOcrCompareStatus = (field, formValue, ocrValue) => {
    const rawFormValue = String(formValue || "").trim();
    const rawOcrValue = String(ocrValue || "").trim();

    if (!rawOcrValue) return "empty";
    if (!rawFormValue) return "check";

    if (field === "name") {
      return normalizeOcrName(rawFormValue) === normalizeOcrName(rawOcrValue)
        ? "match"
        : "mismatch";
    }

    if (field === "birth") {
      return normalizeOcrDate(rawFormValue) === normalizeOcrDate(rawOcrValue)
        ? "match"
        : "mismatch";
    }

    if (field === "passportNo") {
      const formNo = normalizeOcrPassportNo(rawFormValue);
      const ocrNo = normalizeOcrPassportNo(rawOcrValue);

      if (formNo && ocrNo && formNo === ocrNo) return "match";

      const formNoLoose = normalizeOcrPassportNoLoose(rawFormValue);
      const ocrNoLoose = normalizeOcrPassportNoLoose(rawOcrValue);

      if (formNoLoose && ocrNoLoose && formNoLoose === ocrNoLoose) {
        return "check";
      }

      return "mismatch";
    }

    return "check";
  };

  const ocrPassportInfo = {
    name: {
      value: latestPassportFile?.ocr_passport_name || "",
      status: getOcrCompareStatus(
        "name",
        applicationForm.english_name,
        latestPassportFile?.ocr_passport_name
      ),
    },
    birth: {
      value: latestPassportFile?.ocr_date_of_birth || "",
      status: getOcrCompareStatus(
        "birth",
        applicationForm.date_of_birth,
        latestPassportFile?.ocr_date_of_birth
      ),
    },
    passportNo: {
      value: latestPassportFile?.ocr_passport_no || "",
      status: getOcrCompareStatus(
        "passportNo",
        applicationForm.passport_no,
        latestPassportFile?.ocr_passport_no
      ),
    },
  };

  const renderOcrInlineValue = (info) => {
    if (!latestPassportFile) return null;

    const statusMap = {
      match: {
        label: formTexts.ocrStatusMatch,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
        dotClassName: "bg-emerald-500",
      },
      check: {
        label: formTexts.ocrStatusCheck,
        className: "border-amber-200 bg-amber-50 text-amber-700",
        dotClassName: "bg-amber-500",
      },
      mismatch: {
        label: formTexts.ocrStatusMismatch,
        className: "border-red-200 bg-red-50 text-red-700",
        dotClassName: "bg-red-500",
      },
      empty: {
        label: formTexts.noOcrResult,
        className: "border-slate-200 bg-slate-50 text-slate-500",
        dotClassName: "bg-slate-400",
      },
    };

    const value = info?.value || "";
    const status = info?.status || "empty";
    const meta = statusMap[status] || statusMap.empty;

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium ${meta.className}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotClassName}`} />
        <span>
          {formTexts.ocrPrefix}：{value || formTexts.noOcrResult}
        </span>
        <span className="opacity-80">· {meta.label}</span>
      </span>
    );
  };

  const withLinkedIntakeTitle = async (row) => {
    if (!row?.intake_id) return row;

    const { data: intakeRow, error: intakeError } = await supabase
      .from("intakes")
      .select("title")
      .eq("id", row.intake_id)
      .maybeSingle();

    if (intakeError || !intakeRow?.title) {
      return row;
    }

    return {
      ...row,
      intake_title: intakeRow.title,
    };
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setLoadError("");
        setStudent(null);
        setUploadedFiles([]);
        setPreviewUrl("");
        setCheckedMap({});
        setSelectedKey("applicationForm");
        setReviewNote("");
        setAgencyName("");
        setLockChecked(false);

        const sessionResponse = await fetch("/api/admin-session", {
          method: "GET",
          credentials: "include",
        });

        const sessionText = await sessionResponse.text();
        let sessionResult = {};

        try {
          sessionResult = sessionText ? JSON.parse(sessionText) : {};
        } catch {
          sessionResult = {};
        }

        if (
          !sessionResponse.ok ||
          !sessionResult.success ||
          !sessionResult.session?.admin_id
        ) {
          throw new Error(t.alerts.invalidAdminSession);
        }

        const currentAdminSession = sessionResult.session;
        setAdminSession(currentAdminSession);

        const data = await fetchApplicationById(id);

        if (!data) {
          throw new Error("not_found");
        }

        const lockedByOtherAdmin =
          data.admin_editing_by_account_id &&
          data.admin_editing_by_account_id !== currentAdminSession.admin_id &&
          !isLockExpired(data.admin_editing_started_at, ADMIN_LOCK_TIMEOUT_MINUTES);

        if (lockedByOtherAdmin) {
          throw new Error(
            t.alerts.lockedByOtherAdmin(data.admin_editing_by_account_name)
          );
        }

        const lockedByAgency =
          data.editing_by_account_id &&
          !isLockExpired(data.editing_started_at, 20);

        if (lockedByAgency) {
          const confirmed = window.confirm(
            t.alerts.agencyEditingConfirm.replace(
              "{name}",
              data.editing_by_account_name || "agency user"
            )
          );

          if (!confirmed) {
            throw new Error(t.alerts.cancelReview);
          }
        }

        const { data: lockedRow, error: adminLockError } = await supabase
          .from("applications")
          .update({
            admin_editing_by_account_id: currentAdminSession.admin_id,
            admin_editing_by_account_name:
              currentAdminSession.name || currentAdminSession.username || "Admin",
            admin_editing_started_at: new Date().toISOString(),
            editing_by_account_id: null,
            editing_by_account_name: null,
            editing_started_at: null,
          })
          .eq("id", data.id)
          .select("*")
          .single();

        if (adminLockError) throw adminLockError;

        const currentRow = lockedRow || data;
        const normalizedData = await withLinkedIntakeTitle(currentRow);
        setStudent(normalizedData);
        setLoadedUpdatedAt(currentRow.updated_at || "");
        setApplicationStatus(currentRow.status || "submitted");
        setApplicationReviewNote(currentRow.review_note || "");
        setApplicationForm({
          english_name: currentRow.english_name || currentRow.full_name_passport || "",
          gender: currentRow.gender || "",
          nationality_applicant: currentRow.nationality_applicant || currentRow.nationality || "",
          date_of_birth: currentRow.date_of_birth || "",
          tel: currentRow.tel || currentRow.phone || "",
          email: currentRow.email || "",
          address: currentRow.address || "",
          passport_no: currentRow.passport_no || "",
          major: currentRow.major || "",
          degree_level: currentRow.degree_level || "",
          admission_type: currentRow.admission_type || "",
          program_track: currentRow.program_track || "",
          dormitory: currentRow.dormitory || "",
        });

        if (data.agency_name && String(data.agency_name).trim() !== "") {
          setAgencyName(data.agency_name);
        } else if (data.agency_id) {
          const { data: agencyRow, error: agencyError } = await supabase
            .from("agencies")
            .select("agency_name")
            .eq("id", data.agency_id)
            .single();

          if (agencyError) {
            console.error("load agency name error:", agencyError);
            setAgencyName("");
          } else {
            setAgencyName(agencyRow?.agency_name || "");
          }
        } else {
          setAgencyName("");
        }

        const files = await fetchApplicationFiles(id);
        setUploadedFiles(files || []);
      } catch (error) {
        console.error("ApplicationReviewPage loadData error:", error);

        if (error?.message === "not_found") {
          setLoadError(t.alerts.notFound);
        } else {
          setLoadError(error.message || t.alerts.loadFailed);
        }
      } finally {
        setLoading(false);
        setLockChecked(true);
      }
    }

    loadData();
  }, [id, language]);

  const fileTypeMap = {
    passport: "passport",
    photo: "photo",
    finalDiploma: "finalDiploma",
    finalTranscript: "finalTranscript",
    familyRelation: "familyRelation",
    parentsId: "parentsId",
    languageCertificate: "languageCertificate",
    arc: "arc",
    bankStatement: "bankStatement",
    guarantorEmploymentIncome: "guarantorEmploymentIncome",
  };

  function getUploadedFile(fileTypeKey) {
    const dbType = fileTypeMap[fileTypeKey];
    if (!dbType) return null;
    return uploadedFiles.find((file) => file.file_type === dbType) || null;
  }

  function getReviewStatusLabel(statusType, reviewStatus) {
    if (statusType === "uploaded") {
      if (reviewStatus === "approved") return materialStatusTexts.approved;
      if (reviewStatus === "missing_documents") return materialStatusTexts.needMore;
      return materialStatusTexts.uploaded;
    }

    if (statusType === "missing") return materialStatusTexts.missing;
    if (statusType === "exempt") return materialStatusTexts.exempt;
    if (statusType === "generated") return materialStatusTexts.generated;
    return materialStatusTexts.pending;
  }

  function isLockExpired(value, timeoutMinutes = 20) {
    if (!value) return true;
    const time = new Date(value).getTime();
    if (Number.isNaN(time)) return true;
    return Date.now() - time > timeoutMinutes * 60 * 1000;
  }

    function sanitizeDownloadSegment(value, fallback = "file") {
    const cleaned = String(value || "")
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "")
      .replace(/-+/g, "-")
      .replace(/^[-_.]+|[-_.]+$/g, "");

    return cleaned || fallback;
  }

  function getDownloadStudentName() {
    return sanitizeDownloadSegment(
      student?.english_name || student?.full_name_passport || "student",
      "student"
    );
  }

  function getDownloadApplicationTypeLabel() {
    const type = student?.application_type || "undergraduate";

    if (language === "en") {
      if (type === "language") return "LanguageProgram";
      if (type === "graduate") return "GraduateSchool";
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
  }

  function getDownloadIntakeLabel() {
    const intakeName =
      student?.intake_name ||
      student?.intake_title ||
      "";

    if (String(intakeName).trim() !== "") {
      return sanitizeDownloadSegment(intakeName, "batch");
    }

    const year = student?.intake_year || "";
    const month = student?.intake_month || "";
    const round = student?.intake_round_number || "";

    if (year && month && round) {
      return sanitizeDownloadSegment(`${year}-${month}-Round${round}`, "batch");
    }

    return sanitizeDownloadSegment(student?.intake_id || "batch", "batch");
  }

  function getZipScopeLabel(mode = "all") {
    if (language === "en") {
      return mode === "selected" ? "Selected" : "All";
    }

    if (language === "ko") {
      return mode === "selected" ? "선택" : "전체";
    }

    return mode === "selected" ? "已选" : "全部";
  }

  function getFullPackageLabel() {
    if (language === "en") return "FullApplicationPackage";
    if (language === "ko") return "전체지원서패키지";
    return "完整申请包";
  }

  function buildSingleDownloadBaseName(item) {
    const studentName = getDownloadStudentName();
    const materialName = sanitizeDownloadSegment(item?.label || item?.key || "file", "file");
    const applicationType = sanitizeDownloadSegment(getDownloadApplicationTypeLabel(), "type");
    const intakeLabel = getDownloadIntakeLabel();

    return `${studentName}_${materialName}_${applicationType}_${intakeLabel}`;
  }

  function buildZipDownloadFileName(mode = "all") {
    const studentName = getDownloadStudentName();
    const scopeLabel = sanitizeDownloadSegment(getZipScopeLabel(mode), "All");
    const applicationType = sanitizeDownloadSegment(getDownloadApplicationTypeLabel(), "type");
    const intakeLabel = getDownloadIntakeLabel();

    return `${studentName}_${scopeLabel}_${applicationType}_${intakeLabel}.zip`;
  }

  function buildFullPackageDownloadTitle() {
    const studentName = getDownloadStudentName();
    const packageLabel = sanitizeDownloadSegment(getFullPackageLabel(), "package");
    const applicationType = sanitizeDownloadSegment(getDownloadApplicationTypeLabel(), "type");
    const intakeLabel = getDownloadIntakeLabel();

    return `${studentName}_${packageLabel}_${applicationType}_${intakeLabel}`;
  }

  function getDownloadFileName(item) {
    if (!item) return "file";

    const extMatch = item.fileName?.match(/(\.[^.]+)$/);
    const ext = extMatch ? extMatch[1] : "";

    return `${buildSingleDownloadBaseName(item)}${ext}`;
  }

  const formatApplicationStatusLabel = (status) => {
    const s = String(status || "").toLowerCase();
    return t.statusLabels[s] || status || "-";
  };

  const getApplicationStatusBadgeType = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "missing_documents" || s === "rejected") return "danger";
    if (s === "approved") return "success";
    if (s === "submitted" || s === "under_review") return "warning";
    return "default";
  };

  const materials = useMemo(() => {
    if (!student) return [];

    const isGuarantor = student.bank_certificate_holder_type === "guarantor";
    const isBilingual =
      student.program_track === "Bilingual Program (Chinese)";
    const inKorea = !!student.alien_registration_no;

    return [
      {
        key: "applicationForm",
        label: materialLabels.applicationForm,
        statusType: "generated",
        statusLabel: materialStatusTexts.generated,
        required: true,
        fileId: "",
        fileName: "",
        filePath: "",
        reviewStatus: "",
        reviewNote: "",
        student,
        note: noteTexts.applicationForm,
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "passport",
        label: materialLabels.passport,
        statusType: getUploadedFile("passport") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("passport") ? "uploaded" : "missing",
          getUploadedFile("passport")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("passport")?.id || "",
        fileName: getUploadedFile("passport")?.file_name || "",
        filePath: getUploadedFile("passport")?.file_path || "",
        reviewStatus: getUploadedFile("passport")?.review_status || "",
        reviewNote: getUploadedFile("passport")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "photo",
        label: materialLabels.photo,
        statusType: getUploadedFile("photo") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("photo") ? "uploaded" : "missing",
          getUploadedFile("photo")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("photo")?.id || "",
        fileName: getUploadedFile("photo")?.file_name || "",
        filePath: getUploadedFile("photo")?.file_path || "",
        reviewStatus: getUploadedFile("photo")?.review_status || "",
        reviewNote: getUploadedFile("photo")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "finalDiploma",
        label: materialLabels.finalDiploma,
        statusType: getUploadedFile("finalDiploma") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("finalDiploma") ? "uploaded" : "missing",
          getUploadedFile("finalDiploma")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("finalDiploma")?.id || "",
        fileName: getUploadedFile("finalDiploma")?.file_name || "",
        filePath: getUploadedFile("finalDiploma")?.file_path || "",
        reviewStatus: getUploadedFile("finalDiploma")?.review_status || "",
        reviewNote: getUploadedFile("finalDiploma")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "finalTranscript",
        label: materialLabels.finalTranscript,
        statusType: getUploadedFile("finalTranscript") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("finalTranscript") ? "uploaded" : "missing",
          getUploadedFile("finalTranscript")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("finalTranscript")?.id || "",
        fileName: getUploadedFile("finalTranscript")?.file_name || "",
        filePath: getUploadedFile("finalTranscript")?.file_path || "",
        reviewStatus: getUploadedFile("finalTranscript")?.review_status || "",
        reviewNote: getUploadedFile("finalTranscript")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "familyRelation",
        label: materialLabels.familyRelation,
        statusType: getUploadedFile("familyRelation") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("familyRelation") ? "uploaded" : "missing",
          getUploadedFile("familyRelation")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("familyRelation")?.id || "",
        fileName: getUploadedFile("familyRelation")?.file_name || "",
        filePath: getUploadedFile("familyRelation")?.file_path || "",
        reviewStatus: getUploadedFile("familyRelation")?.review_status || "",
        reviewNote: getUploadedFile("familyRelation")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "parentsId",
        label: materialLabels.parentsId,
        statusType: getUploadedFile("parentsId") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("parentsId") ? "uploaded" : "missing",
          getUploadedFile("parentsId")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("parentsId")?.id || "",
        fileName: getUploadedFile("parentsId")?.file_name || "",
        filePath: getUploadedFile("parentsId")?.file_path || "",
        reviewStatus: getUploadedFile("parentsId")?.review_status || "",
        reviewNote: getUploadedFile("parentsId")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "languageCertificate",
        label: materialLabels.languageCertificate,
        statusType: isBilingual
          ? "exempt"
          : getUploadedFile("languageCertificate")
          ? "uploaded"
          : "missing",
        statusLabel: isBilingual
          ? materialStatusTexts.exempt
          : getReviewStatusLabel(
              getUploadedFile("languageCertificate") ? "uploaded" : "missing",
              getUploadedFile("languageCertificate")?.review_status
            ),
        required: !isBilingual,
        fileId: getUploadedFile("languageCertificate")?.id || "",
        fileName: getUploadedFile("languageCertificate")?.file_name || "",
        filePath: getUploadedFile("languageCertificate")?.file_path || "",
        reviewStatus: getUploadedFile("languageCertificate")?.review_status || "",
        reviewNote: getUploadedFile("languageCertificate")?.review_note || "",
        note: isBilingual ? noteTexts.languageExempt : "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "personalStatement",
        label: materialLabels.personalStatement,
        statusType: "generated",
        statusLabel: materialStatusTexts.generated,
        required: true,
        fileId: "",
        fileName: "",
        filePath: "",
        reviewStatus: "",
        reviewNote: "",
        student,
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "personalInfoConsent",
        label: materialLabels.personalInfoConsent,
        statusType: "generated",
        statusLabel: materialStatusTexts.generated,
        required: true,
        fileId: "",
        fileName: "",
        filePath: "",
        reviewStatus: "",
        reviewNote: "",
        student,
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "arc",
        label: materialLabels.arc,
        statusType: inKorea
          ? getUploadedFile("arc")
            ? "uploaded"
            : "missing"
          : "exempt",
        statusLabel: inKorea
          ? getReviewStatusLabel(
              getUploadedFile("arc") ? "uploaded" : "missing",
              getUploadedFile("arc")?.review_status
            )
          : materialStatusTexts.exempt,
        required: inKorea,
        fileId: getUploadedFile("arc")?.id || "",
        fileName: getUploadedFile("arc")?.file_name || "",
        filePath: getUploadedFile("arc")?.file_path || "",
        reviewStatus: getUploadedFile("arc")?.review_status || "",
        reviewNote: getUploadedFile("arc")?.review_note || "",
        note: inKorea ? "" : noteTexts.arcExempt,
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "bankStatement",
        label: materialLabels.bankStatement,
        statusType: getUploadedFile("bankStatement") ? "uploaded" : "missing",
        statusLabel: getReviewStatusLabel(
          getUploadedFile("bankStatement") ? "uploaded" : "missing",
          getUploadedFile("bankStatement")?.review_status
        ),
        required: true,
        fileId: getUploadedFile("bankStatement")?.id || "",
        fileName: getUploadedFile("bankStatement")?.file_name || "",
        filePath: getUploadedFile("bankStatement")?.file_path || "",
        reviewStatus: getUploadedFile("bankStatement")?.review_status || "",
        reviewNote: getUploadedFile("bankStatement")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "financialGuaranteeForm",
        label: materialLabels.financialGuaranteeForm,
        statusType: isGuarantor ? "generated" : "exempt",
        statusLabel: isGuarantor ? materialStatusTexts.generated : materialStatusTexts.exempt,
        required: isGuarantor,
        fileId: "",
        fileName: isGuarantor
          ? ""
          : "",
        filePath: "",
        reviewStatus: "",
        reviewNote: "",
        student,
        emptyFileLabel: t.common.noFile,
      },
      {
        key: "guarantorEmploymentIncome",
        label: materialLabels.guarantorEmploymentIncome,
        statusType: isGuarantor
          ? getUploadedFile("guarantorEmploymentIncome")
            ? "uploaded"
            : "missing"
          : "exempt",
        statusLabel: isGuarantor
          ? getReviewStatusLabel(
              getUploadedFile("guarantorEmploymentIncome")
                ? "uploaded"
                : "missing",
              getUploadedFile("guarantorEmploymentIncome")?.review_status
            )
          : materialStatusTexts.exempt,
        required: isGuarantor,
        fileId: getUploadedFile("guarantorEmploymentIncome")?.id || "",
        fileName: getUploadedFile("guarantorEmploymentIncome")?.file_name || "",
        filePath: getUploadedFile("guarantorEmploymentIncome")?.file_path || "",
        reviewStatus:
          getUploadedFile("guarantorEmploymentIncome")?.review_status || "",
        reviewNote:
          getUploadedFile("guarantorEmploymentIncome")?.review_note || "",
        emptyFileLabel: t.common.noFile,
      },
    ];
  }, [student, uploadedFiles, language]);

  const selectedItem =
    materials.find((item) => item.key === selectedKey) || null;

  const checkedItems = materials.filter((item) => checkedMap[item.key]);
  const checkedUploadedItems = checkedItems.filter(
    (item) => item.statusType === "uploaded" && item.filePath
  );
  const allUploadedItems = materials.filter(
    (item) => item.statusType === "uploaded" && item.filePath
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setReviewNote(selectedItem?.reviewNote || "");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedItem]);

  useEffect(() => {
    async function loadPreview() {
      try {
        if (
          !selectedItem ||
          selectedItem.statusType !== "uploaded" ||
          !selectedItem.filePath
        ) {
          setPreviewUrl("");
          return;
        }

        setPreviewLoading(true);
        const url = await getApplicationFileSignedUrl(selectedItem.filePath);
        setPreviewUrl(url || "");
      } catch (error) {
        console.error("load preview error:", error);
        setPreviewUrl("");
      } finally {
        setPreviewLoading(false);
      }
    }

    loadPreview();
  }, [selectedItem]);

    useEffect(() => {
    async function loadApplicationPhoto() {
      try {
        const photoPath = getUploadedFile("photo")?.file_path;

        if (!photoPath) {
          setApplicationPhotoUrl("");
          return;
        }

        const url = await getApplicationFileSignedUrl(photoPath);
        setApplicationPhotoUrl(url || "");
      } catch (error) {
        console.error("load application photo error:", error);
        setApplicationPhotoUrl("");
      }
    }

    loadApplicationPhoto();
  }, [uploadedFiles]);

  const handleCheck = (key, checked) => {
    setCheckedMap((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

    const handleApplicationFormChange = (field, value) => {
    setApplicationForm((prev) => {
      const next = {
        ...prev,
        [field]: value,
      };

      if (field === "program_track" && !isLanguageApplication) {
        if (
          prev.major &&
          !isMajorAllowedForTrack({
            applicationType,
            programTrack: value,
            major: prev.major,
          })
        ) {
          next.major = "";
        }

        if (
          prev.admission_type &&
          !isAdmissionTypeAllowedForTrack({
            applicationType,
            programTrack: value,
            admissionType: prev.admission_type,
          })
        ) {
          next.admission_type = "";
        }
      }

      return next;
    });
  };

  useEffect(() => {
    if (isLanguageApplication || !applicationForm.program_track) return;

    setApplicationForm((prev) => {
      let changed = false;
      const next = { ...prev };

      if (
        prev.major &&
        !isMajorAllowedForTrack({
          applicationType,
          programTrack: prev.program_track,
          major: prev.major,
        })
      ) {
        next.major = "";
        changed = true;
      }

      if (
        prev.admission_type &&
        !isAdmissionTypeAllowedForTrack({
          applicationType,
          programTrack: prev.program_track,
          admissionType: prev.admission_type,
        })
      ) {
        next.admission_type = "";
        changed = true;
      }

      return changed ? next : prev;
    });
  }, [applicationForm.program_track, applicationType, isLanguageApplication]);

  const handleSaveApplicationForm = async () => {
    try {
      if (!student?.id) {
        alert(t.alerts.saveFormMissing);
        return;
      }

      setSavingApplicationForm(true);

      const payload = {
        english_name: applicationForm.english_name || null,
        full_name_passport: applicationForm.english_name || null,
        gender: applicationForm.gender || null,
        nationality_applicant: applicationForm.nationality_applicant || null,
        date_of_birth: applicationForm.date_of_birth || null,
        tel: applicationForm.tel || null,
        email: applicationForm.email || null,
        address: applicationForm.address || null,
        passport_no: applicationForm.passport_no || null,
        major: applicationForm.major || null,
        degree_level: applicationForm.degree_level || null,
        admission_type: applicationForm.admission_type || null,
        program_track: applicationForm.program_track || null,
        dormitory: applicationForm.dormitory || null,
        admin_editing_by_account_id: adminSession?.admin_id || null,
        admin_editing_by_account_name:
          adminSession?.name || adminSession?.username || "Admin",
        admin_editing_started_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("applications")
        .update(payload)
        .eq("id", student.id)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert(t.alerts.saveFormConflict);
        return;
      }

      const normalizedData = await withLinkedIntakeTitle(data);
      setStudent(normalizedData);
      setLoadedUpdatedAt(data.updated_at || "");
      setIsEditingApplication(false);

      setApplicationForm({
        english_name: data.english_name || data.full_name_passport || "",
        gender: data.gender || "",
        nationality_applicant: data.nationality_applicant || data.nationality || "",
        date_of_birth: data.date_of_birth || "",
        tel: data.tel || data.phone || "",
        email: data.email || "",
        address: data.address || "",
        passport_no: data.passport_no || "",
        major: data.major || "",
        degree_level: data.degree_level || "",
        admission_type: data.admission_type || "",
        program_track: data.program_track || "",
        dormitory: data.dormitory || "",
      });

      alert(formTexts.saved);
    } catch (error) {
      console.error("handleSaveApplicationForm error:", error);
      alert(`${t.alerts.saveFormFailed}${error.message}`);
    } finally {
      setSavingApplicationForm(false);
    }
  };

  const handleSaveApplicationStatus = async () => {
    try {
      if (!student?.id) {
        alert(t.alerts.saveStatusMissing);
        return;
      }

      setSavingApplicationStatus(true);

      const payload = {
        status: applicationStatus,
      };

      if (applicationReviewNote !== undefined) {
        payload.review_note = applicationReviewNote || null;
      }

      const updatePayload = {
        ...payload,
        admin_editing_by_account_id: adminSession?.admin_id || null,
        admin_editing_by_account_name:
          adminSession?.name || adminSession?.username || "Admin",
        admin_editing_started_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("applications")
        .update(updatePayload)
        .eq("id", student.id)
        .eq("updated_at", loadedUpdatedAt)
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        alert(t.alerts.saveStatusConflict);
        return;
      }

      setLoadedUpdatedAt(data.updated_at || "");
      const normalizedData = await withLinkedIntakeTitle(data);
      setStudent(normalizedData);

      alert(t.applicationReview.saved);
    } catch (error) {
      console.error("handleSaveApplicationStatus error:", error);
      alert(`${t.alerts.saveStatusFailed}${error.message}`);
    } finally {
      setSavingApplicationStatus(false);
    }
  };

  const releaseAdminLock = async () => {
    try {
      if (!student?.id || !adminSession?.admin_id) return;

      await supabase
        .from("applications")
        .update({
          admin_editing_by_account_id: null,
          admin_editing_by_account_name: null,
          admin_editing_started_at: null,
        })
        .eq("id", student.id)
        .eq("admin_editing_by_account_id", adminSession.admin_id);
    } catch (error) {
      console.error("releaseAdminLock error:", error);
    }
  };

  const handleDownloadCurrent = async () => {
    try {
      if (!selectedItem) return;

      if (selectedItem.statusType === "generated") {
        handleDownloadGeneratedMaterial(selectedItem);
        return;
      }

      if (!selectedItem.filePath) return;

      const downloadName = getDownloadFileName(selectedItem);
      await downloadApplicationFile(selectedItem.filePath, downloadName);
    } catch (error) {
      console.error("download current material error:", error);
      alert(t.materials.currentDownloadFailed);
    }
  };

  const reloadFiles = async () => {
    const files = await fetchApplicationFiles(id);
    setUploadedFiles(files || []);
  };

  const handleSaveReview = async (nextStatus) => {
  try {
    if (!student?.id) {
      alert(t.materials.missingApplication);
      return;
    }

    if (!selectedItem?.fileId) {
      alert(t.materials.cannotReview);
      return;
    }

    setSavingReview(true);

    const lockPayload = {
      admin_editing_by_account_id: adminSession?.admin_id || null,
      admin_editing_by_account_name:
        adminSession?.name || adminSession?.username || "Admin",
      admin_editing_started_at: new Date().toISOString(),
    };

    const { data: lockedApplication, error: lockError } = await supabase
      .from("applications")
      .update(lockPayload)
      .eq("id", student.id)
      .eq("updated_at", loadedUpdatedAt)
      .select(
        "id, updated_at, admin_editing_by_account_id, admin_editing_by_account_name, admin_editing_started_at"
      )
      .maybeSingle();

    if (lockError) throw lockError;

    if (!lockedApplication) {
      alert(t.alerts.saveStatusConflict);
      return;
    }

    setLoadedUpdatedAt(lockedApplication.updated_at || "");
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            ...lockedApplication,
          }
        : prev
    );

    const payload = {
      review_note: reviewNote || null,
    };

        if (nextStatus) {
      payload.review_status = nextStatus;
    }

    await updateApplicationFileReview(selectedItem.fileId, payload);

    const shouldSyncApplicationStatus =
      nextStatus === "missing_documents" || nextStatus === "rejected";

    if (shouldSyncApplicationStatus) {
      const { error: applicationStatusError } = await supabase
        .from("applications")
        .update({
          status: nextStatus,
          admin_editing_by_account_id: adminSession?.admin_id || null,
          admin_editing_by_account_name:
            adminSession?.name || adminSession?.username || "Admin",
          admin_editing_started_at: new Date().toISOString(),
        })
        .eq("id", student.id);

      if (applicationStatusError) throw applicationStatusError;
    }

    const { data: refreshedApplication, error: refreshedApplicationError } = await supabase
      .from("applications")
      .select(
        "id, status, updated_at, admin_editing_by_account_id, admin_editing_by_account_name, admin_editing_started_at"
      )
      .eq("id", student.id)
      .single();

    if (refreshedApplicationError) throw refreshedApplicationError;

    setLoadedUpdatedAt(refreshedApplication.updated_at || "");
    setStudent((prev) =>
      prev
        ? {
            ...prev,
            ...refreshedApplication,
          }
        : prev
    );

    await reloadFiles();

    alert(t.materials.saveSuccess);
  } catch (error) {
    console.error("save review error:", error);
    alert(t.materials.saveFailed);
  } finally {
    setSavingReview(false);
  }
};

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!student?.id || !adminSession?.admin_id) return;

      const payload = JSON.stringify({
        id: student.id,
        admin_account_id: adminSession.admin_id,
      });

      navigator.sendBeacon?.("/api/admin-application-release-lock", payload);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      releaseAdminLock();
    };
  }, [student, adminSession]);

  const handleDownloadSelectedZip = async () => {
    try {
      if (checkedUploadedItems.length === 0) {
        alert(t.materials.selectedNone);
        return;
      }

      setDownloadingZip(true);

      const zipFiles = checkedUploadedItems.map((item) => ({
        file_path: item.filePath,
        file_name: item.fileName,
        downloadName: getDownloadFileName(item),
      }));

            await downloadApplicationFilesAsZip(
        zipFiles,
        buildZipDownloadFileName("selected")
      );

    } catch (error) {
      console.error("download selected zip error:", error);
      alert(t.materials.selectedZipFailed);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadAllZip = async () => {
    try {
      if (allUploadedItems.length === 0) {
        alert(t.materials.noUploadedZip);
        return;
      }

      setDownloadingZip(true);

      const zipFiles = allUploadedItems.map((item) => ({
        file_path: item.filePath,
        file_name: item.fileName,
        downloadName: getDownloadFileName(item),
      }));

            await downloadApplicationFilesAsZip(
        zipFiles,
        buildZipDownloadFileName("all")
      );

    } catch (error) {
      console.error("download all zip error:", error);
      alert(t.materials.allZipFailed);
    } finally {
      setDownloadingZip(false);
    }
  };

  const buildPrintDocument = (title, contentBlocks = []) => {
    const styleTags = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style')
    )
      .map((node) => node.outerHTML)
      .join("\n");

    return `
    <!DOCTYPE html>
    <html lang="zh-CN">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        ${styleTags}
        <style>
  @page {
    size: A4;
    margin: 4mm 4mm 4mm 4mm;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  body {
    font-family: Arial, "Microsoft YaHei", "Noto Sans KR", sans-serif;
    color: #111827;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-page {
    width: 100%;
    margin: 0;
    padding: 0;
    background: #ffffff;
  }

  .print-block {
    width: 100%;
    margin: 0;
    padding: 0;
    page-break-after: always;
    break-after: page;
  }

  .print-block:last-child {
    page-break-after: auto;
    break-after: auto;
  }

  .school-application-form {
    width: 100%;
    margin: 0 auto;
  }

  .school-application-form .application-page {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .school-application-form .application-page:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }

  .school-application-form .page-2 {
    page-break-before: always !important;
    break-before: page !important;
  }
    
  @media print {
    html, body {
      background: #ffffff;
    }

    .school-application-form .page-1 {
      zoom: 1.16;
    }

    .print-page {
      width: 100%;
      margin: 0;
      padding: 0;
    }

    .print-block {
      width: 100%;
      margin: 0;
      padding: 0;
      page-break-after: always;
      break-after: page;
    }

    .print-block:last-child {
      page-break-after: auto;
      break-after: auto;
    }

    .school-application-form {
      width: 100%;
      margin: 0 auto;
      zoom: 0.96;
    }

    .school-application-form * {
      box-sizing: border-box;
    }

    .school-application-form table {
      border-collapse: collapse !important;
    }

    .school-application-form tr,
    .school-application-form td,
    .school-application-form th {
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .school-application-form .text-\\[11px\\] {
      font-size: 10px !important;
      line-height: 1.2 !important;
    }

    .school-application-form .text-\\[12px\\] {
      font-size: 11px !important;
      line-height: 1.2 !important;
    }
          .financial-guarantee-form {
      zoom: 0.96;
      background: #ffffff !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .financial-guarantee-form .bg-\\[\\#f3f3f3\\] {
      background: #ffffff !important;
    }

        .personal-info-consent-form {
      zoom: 1.42;
      background: #ffffff !important;
    }

    .personal-info-consent-form > div:first-child {
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .personal-info-consent-form > div:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }

    .personal-info-consent-form .space-y-8 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 0 !important;
    }

    .personal-info-consent-form .bg-\\[\\#f3f3f3\\] {
      background: #ffffff !important;
    }

    .personal-info-consent-form .p-4 {
      padding: 10px !important;
    }

    .personal-info-consent-form .py-5 {
      padding-top: 10px !important;
      padding-bottom: 10px !important;
    }

    .personal-info-consent-form .py-4 {
      padding-top: 8px !important;
      padding-bottom: 8px !important;
    }

    .personal-info-consent-form .py-3 {
      padding-top: 6px !important;
      padding-bottom: 6px !important;
    }

    .personal-info-consent-form .py-2 {
      padding-top: 4px !important;
      padding-bottom: 4px !important;
    }

    .personal-info-consent-form .px-4,
    .personal-info-consent-form .px-3 {
      padding-left: 8px !important;
      padding-right: 8px !important;
    }

    .personal-info-consent-form .mt-8 {
      margin-top: 10px !important;
    }

    .personal-info-consent-form .mt-5 {
      margin-top: 8px !important;
    }

    .personal-info-consent-form .mt-4 {
      margin-top: 6px !important;
    }

    .personal-info-consent-form .mt-2 {
      margin-top: 4px !important;
    }

    .personal-info-consent-form .text-\\[20px\\] {
      font-size: 17px !important;
      line-height: 1.2 !important;
    }

    .personal-info-consent-form .text-\\[13px\\] {
      font-size: 11px !important;
      line-height: 1.2 !important;
    }

    .personal-info-consent-form .text-\\[12px\\] {
      font-size: 11px !important;
      line-height: 1.25 !important;
    }

    .personal-info-consent-form .text-\\[11px\\] {
      font-size: 10px !important;
      line-height: 1.25 !important;
    }

    .personal-info-consent-form table,
    .personal-info-consent-form tr,
    .personal-info-consent-form td {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

  }
</style>
      </head>
      <body>
        <div class="print-page">
          ${contentBlocks
            .map((block) => `<div class="print-block">${block}</div>`)
            .join("\n")}
        </div>
        <script>
          window.onload = function () {
            setTimeout(function () {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;
  };

  const handleDownloadGeneratedMaterial = (item) => {
    try {
      if (!item || item.statusType !== "generated") {
        alert(t.materials.currentNotGenerated);
        return;
      }

      const node = renderGeneratedPreview(item, applicationPhotoUrl);
      if (!node) {
        alert(t.materials.unsupportedGenerated);
        return;
      }

            const html = renderToStaticMarkup(node);
      const printWindow = window.open("", "_blank", "width=1200,height=900");

      if (!printWindow) {
        alert(t.materials.popupBlocked);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(
        buildPrintDocument(buildSingleDownloadBaseName(item), [html])
      );

      printWindow.document.close();
    } catch (error) {
      console.error("handleDownloadGeneratedMaterial error:", error);
      alert(`${t.materials.generateCurrentFailed}${error.message}`);
    }
  };

  const handleDownloadFullApplicationPackage = () => {
    try {
      if (!student) {
        alert(t.materials.noApplicationData);
        return;
      }

      const packageItems = materials.filter((item) => {
        if (item.statusType !== "generated") return false;
        if (item.key === "financialGuaranteeForm" && !item.required) return false;
        return true;
      });

      if (packageItems.length === 0) {
        alert(t.materials.noFullPackage);
        return;
      }

            const contentBlocks = packageItems
        .map((item) => renderGeneratedPreview(item, applicationPhotoUrl))
        .filter(Boolean)
        .map((node) => renderToStaticMarkup(node));

      const printWindow = window.open("", "_blank", "width=1200,height=900");

      if (!printWindow) {
        alert(t.materials.popupBlocked);
        return;
      }

      printWindow.document.open();
      printWindow.document.write(
        buildPrintDocument(buildFullPackageDownloadTitle(), contentBlocks)
      );

      printWindow.document.close();
    } catch (error) {
      console.error("handleDownloadFullApplicationPackage error:", error);
      alert(`${t.materials.generateFullFailed}${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-sm text-slate-500">{t.page.loading}</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-sm text-red-600">{loadError}</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-sm text-slate-500">{t.page.notFound}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t.page.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t.page.desc}
            </p>
          </div>

          <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
            <div>
              <span className="font-semibold text-slate-800">{t.page.studentName}：</span>
              {student.english_name || student.full_name_passport || "-"}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t.page.intake}：</span>
              {intakeDisplayLabel}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t.page.applicationType}：</span>
              {applicationTypeLabel}
            </div>
            {!isLanguageApplication ? (
              <div>
                <span className="font-semibold text-slate-800">{t.page.major}：</span>
                {student.major || "-"}
              </div>
            ) : null}
            <div>
              <span className="font-semibold text-slate-800">{t.page.currentStatus}：</span>
              {formatApplicationStatusLabel(student.status)}
            </div>
            <div>
              <span className="font-semibold text-slate-800">{t.page.agency}：</span>
              {agencyName || student.agency_name || student.agency_id || "-"}
            </div>
          </div>
        </div>

        {student?.editing_by_account_id &&
        !isLockExpired(student?.editing_started_at, 20) ? (
          <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {t.page.agencyEditing}：{student.editing_by_account_name || "Agency"}
          </div>
        ) : null}

        {student?.admin_editing_by_account_id &&
        !isLockExpired(student?.admin_editing_started_at, ADMIN_LOCK_TIMEOUT_MINUTES) ? (
          <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            {t.page.adminEditing}：{student.admin_editing_by_account_name || "Admin"}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
  type="button"
  disabled
  className="rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-500 cursor-not-allowed"
>
  {t.page.schoolPreview}
</button>

          <button
            type="button"
            onClick={handleDownloadFullApplicationPackage}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            {t.page.downloadFullPackage}
          </button>
          <button
            onClick={handleDownloadAllZip}
            disabled={downloadingZip || allUploadedItems.length === 0}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            {t.page.downloadAllZip}
          </button>
          <button
            onClick={handleDownloadSelectedZip}
            disabled={downloadingZip || checkedUploadedItems.length === 0}
            className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-60"
          >
            {t.page.downloadSelectedZip}
          </button>
        </div>

        <div className="mt-4 text-sm text-slate-500">
          {t.page.checkedCount}：
          <span className="ml-1 font-semibold text-slate-800">
            {checkedItems.length}
          </span>
          <span className="ml-3 text-slate-400">
            {t.page.checkedDownloadable}：
            <span className="ml-1 font-semibold text-slate-700">
              {checkedUploadedItems.length}
            </span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.applicationReview.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {t.applicationReview.desc}
            </p>

            <div className="mt-4">
              <StatusBadge type={getApplicationStatusBadgeType(student?.status)}>
                {t.applicationReview.currentStatus}：{formatApplicationStatusLabel(student?.status)}
              </StatusBadge>
            </div>
          </div>

          <div className="grid w-full gap-4 lg:max-w-2xl lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.applicationReview.changeStatus}
              </label>
              <select
                value={applicationStatus}
                onChange={(e) => setApplicationStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="submitted">{t.statusLabels.submitted}</option>
                <option value="under_review">{t.statusLabels.under_review}</option>
                <option value="missing_documents">{t.statusLabels.missing_documents}</option>
                <option value="approved">{t.statusLabels.approved}</option>
                <option value="rejected">{t.statusLabels.rejected}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.applicationReview.reviewNote}
              </label>
              <textarea
                rows={3}
                value={applicationReviewNote}
                onChange={(e) => setApplicationReviewNote(e.target.value)}
                placeholder={t.applicationReview.reviewPlaceholder}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            onClick={handleSaveApplicationStatus}
            disabled={savingApplicationStatus}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {savingApplicationStatus ? t.applicationReview.saving : t.applicationReview.saveButton}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{formTexts.title}</h3>
            <p className="mt-1 text-sm text-slate-500">
              {formTexts.desc}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {!isEditingApplication ? (
              <button
                type="button"
                onClick={() => setIsEditingApplication(true)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {formTexts.edit}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingApplication(false);
                    setApplicationForm({
                      english_name: student?.english_name || student?.full_name_passport || "",
                      gender: student?.gender || "",
                      nationality_applicant:
                        student?.nationality_applicant || student?.nationality || "",
                      date_of_birth: student?.date_of_birth || "",
                      tel: student?.tel || student?.phone || "",
                      email: student?.email || "",
                      address: student?.address || "",
                      passport_no: student?.passport_no || "",
                      major: student?.major || "",
                      degree_level: student?.degree_level || "",
                      admission_type: student?.admission_type || "",
                      program_track: student?.program_track || "",
                      dormitory: student?.dormitory || "",
                    });
                  }}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                >
                  {formTexts.cancelEdit}
                </button>

                <button
                  type="button"
                  onClick={handleSaveApplicationForm}
                  disabled={savingApplicationForm}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingApplicationForm ? formTexts.saving : formTexts.save}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
  <span>{formFieldTexts.englishName}</span>
  {renderOcrInlineValue(ocrPassportInfo.name)}
</label>
            <input
              value={applicationForm.english_name}
              onChange={(e) => handleApplicationFormChange("english_name", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.gender}</label>
            <select
              value={applicationForm.gender}
              onChange={(e) => handleApplicationFormChange("gender", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            >
              <option value="">{t.common.select}</option>
              <option value="Male">{formTexts.genderMale}</option>
              <option value="Female">{formTexts.genderFemale}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.nationality}</label>
            <input
              value={applicationForm.nationality_applicant}
              onChange={(e) => handleApplicationFormChange("nationality_applicant", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
  <span>{formFieldTexts.birth}</span>
  {renderOcrInlineValue(ocrPassportInfo.birth)}
</label>
            <input
              type="date"
              value={applicationForm.date_of_birth}
              onChange={(e) => handleApplicationFormChange("date_of_birth", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.tel}</label>
            <input
              value={applicationForm.tel}
              onChange={(e) => handleApplicationFormChange("tel", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.email}</label>
            <input
              value={applicationForm.email}
              onChange={(e) => handleApplicationFormChange("email", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.address}</label>
            <input
              value={applicationForm.address}
              onChange={(e) => handleApplicationFormChange("address", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

          <div>
            <label className="mb-2 flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
  <span>{formFieldTexts.passportNo}</span>
  {renderOcrInlineValue(ocrPassportInfo.passportNo)}
</label>
            <input
              value={applicationForm.passport_no}
              onChange={(e) => handleApplicationFormChange("passport_no", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            />
          </div>

                    {!isLanguageApplication ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.major}</label>
              <select
                value={applicationForm.major}
                onChange={(e) => handleApplicationFormChange("major", e.target.value)}
                disabled={!isEditingApplication}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
              >
                <option value="">{t.common.select}</option>
                {majorOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {applicationType === "graduate" ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{degreeLevelLabel}</label>
              <select
                value={applicationForm.degree_level}
                onChange={(e) => handleApplicationFormChange("degree_level", e.target.value)}
                disabled={!isEditingApplication}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
              >
                <option value="">{t.common.select}</option>
                {degreeLevelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

                    {!isLanguageApplication ? (
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.admissionType}</label>
              <select
                value={applicationForm.admission_type}
                onChange={(e) => handleApplicationFormChange("admission_type", e.target.value)}
                disabled={!isEditingApplication}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
              >
                <option value="">{t.common.select}</option>
                {admissionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.programTrack}</label>
            <select
              value={applicationForm.program_track}
              onChange={(e) => handleApplicationFormChange("program_track", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            >
              <option value="">{t.common.select}</option>
              {programTrackOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{formFieldTexts.dormitory}</label>
            <select
              value={applicationForm.dormitory}
              onChange={(e) => handleApplicationFormChange("dormitory", e.target.value)}
              disabled={!isEditingApplication}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition disabled:bg-slate-50"
            >
              <option value="">{t.common.select}</option>
              <option value="YES">{t.common.yes}</option>
              <option value="NO">{t.common.no}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="min-h-[1400px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-slate-900">{t.materials.title}</h4>
            <p className="mt-1 text-sm text-slate-500">
              {t.materials.desc}
            </p>
          </div>

          <div className="h-[calc(100%-56px)] space-y-3 overflow-y-auto pr-2">
            {materials.map((item) => (
              <ReviewMenuItem
                key={item.key}
                item={item}
                active={selectedKey === item.key}
                checked={!!checkedMap[item.key]}
                onClick={() => setSelectedKey(item.key)}
                onCheck={handleCheck}
              />
            ))}
          </div>
        </div>

          <div className="min-w-0 self-start">
  <PreviewPlaceholder
  item={selectedItem}
  previewUrl={previewUrl}
  previewLoading={previewLoading}
  onDownload={handleDownloadCurrent}
  reviewNote={reviewNote}
  setReviewNote={setReviewNote}
  onApprove={() => handleSaveReview("approved")}
  onRequestMore={() => handleSaveReview("missing_documents")}
  onSaveNote={() => handleSaveReview("")}
  savingReview={savingReview}
  applicationPhotoUrl={applicationPhotoUrl}
  t={t}
/>
</div>
      </div>
    </div>
  );
}

export default ApplicationReviewPage;
