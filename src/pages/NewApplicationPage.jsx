import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const messages = {
  zh: {
    steps: ["申请基本信息", "申请人信息", "学历与语言能力", "退款账户信息", "自我介绍与学业计划", "同意书、财政担保与签字", "上传申请材料"],
    common: {
      select: "请选择", currentStep: "当前步骤", prev: "上一步", next: "下一步", saveDraft: "保存草稿", submit: "提交申请",
      loadingAgency: "正在加载机构信息...", newApplication: "新建申请", copyLink: "复制链接", copyLinkSuccess: "链接已复制", copyLinkFailed: "复制失败，请手动复制",
      downloadQr: "下载二维码", qrNotReady: "二维码还未生成", studentFillLink: "学生填写链接", currentStatus: "当前状态",
      enabled: "已开启", disabled: "已关闭", reopenStudentFill: "重新开启填写", closeStudentFill: "关闭学生填写",
      uploadFile: "上传文件", chooseFile: "选择文件", uploadedFiles: "已上传文件", selectedFiles: "本次新选择文件", noSelectedFiles: "尚未选择新文件", delete: "删除",
      generatedNoNeedUpload: "此项由系统生成，不需要机构重复上传。", uploadRule: "上传要求：照片文件不能超过 2MB，PDF 文件不能超过 4MB。请尽量上传清晰但压缩后的文件。",
      signatureMethod: "签字方式", signatureHelper: "请选择签字方式。最终会自动回填到学校申请表所有对应签字位置。", autoSignatureDesc: "自动生成名字将基于当前姓名字段生成：",
      fillNameFirst: "请先填写姓名后自动生成", noSignaturePreview: "暂无签字预览", drawSignatureDesc: "请在下方区域手写签字。", clearSignature: "清空重签", uploadSignatureImage: "上传签字图片",
      generatedSignatureTip: "已生成签字预览。后续管理员下载学校格式申请表时，可自动放入对应签字位置。", passportReminderTitle: "护照信息辅助提醒",
passportChecking: "正在识别护照信息并与申请表进行比对，请稍候...",
passportReminderDesc: "该提醒仅供人工复核参考，不影响保存草稿或提交申请。",
passportCompareFormValue: "申请表",
passportCompareOcrValue: "OCR识别",
passportNameMismatch: "护照姓名与申请表姓名不一致",
passportNoMismatch: "护照号与申请表填写不一致",
passportNoLikelyMatch:
  "护照号疑似一致，但 OCR 可能把 1/I、0/O 等字符识别混淆，请人工确认",
passportBirthMismatch: "出生日期与护照信息不一致",
materialOnlyBanner: "当前为补材料模式：仅允许修改退款账户信息、财务担保信息与上传申请材料，前半部分申请信息已锁定。",

      educationRecord: "学历记录", guarantorSelfHint: "已选择“申请人本人名义”。财政担保书页将自动隐藏，后续生成学校申请表时该页可免填。"
    },
    options: {
      sex: [{ value: "Male", label: "男" }, { value: "Female", label: "女" }],
      yesNo: [{ value: "YES", label: "是" }, { value: "NO", label: "否" }],
      bankHolderTypes: [{ value: "self", label: "申请人本人名义" }, { value: "guarantor", label: "父母 / 财政担保人名义" }],
      signatureMethods: [{ value: "auto", label: "自动生成签名字" }, { value: "draw", label: "手写签字" }, { value: "upload", label: "上传签字图片" }],
      residenceOptions: [{ value: "abroad", label: "海外居住" }, { value: "korea", label: "在韩国居住" }],
      admissionTypes: [{ value: "Freshman", label: "新入" }, { value: "Transfer (2nd Year)", label: "插班2年级" }, { value: "Transfer (3rd Year)", label: "插班3年级" }, { value: "Transfer (4th Year)", label: "插班4年级" }, { value: "Dual Degree (2+2)", label: "双学位 (2+2)" }, { value: "Dual Degree (3+1)", label: "双学位 (3+1)" }],
      programTracks: [{ value: "Korean Track", label: "韩语课程" }, { value: "English Track", label: "英语课程" }, { value: "Bilingual Program (Chinese)", label: "双语课程（中文）" }],
      agreeOptions: [{ value: "agree", label: "同意" }, { value: "disagree", label: "不同意" }],
      acknowledgeOptions: [{ value: "yes", label: "已确认" }, { value: "no", label: "未确认" }],
    },
    sections: {
      mainDesc: "按学校固定格式申请表逐步填写。所有字段和材料将用于后续自动生成学校标准申请表并进入管理员审核。", step1Title: "第1步：申请基本信息", step1Desc: "对应学校申请表第一页中的 지원학과 / 지원구분 / 지원트랙 / 생활관 신청。", step2Title: "第2步：申请人信息", step2Desc: "对应申请表第一页 신청인 区域。", step3Title: "第3步：学历信息", step3Desc: "对应申请表第一页 학력: 고등학교 ~ 현재까지 / Educational Background。", languageTitle: "语言能力 (Language Proficiency)", languageDesc: "对应申请表第一页 언어능력 区域。", step4Title: "第4步：注册金退款账户申请", step4Desc: "对应 Tuition Refund Bank Account Form。", beneficiaryTitle: "2-1. 수취인 정보 (Beneficiary Information)", beneficiaryDesc: "退款账户持有人信息。", bankTitle: "2-2. 은행 정보 (Bank Information)", bankDesc: "退款银行信息。", step5Title: "第5步：自我介绍与学业计划", step5Desc: "对应 자기소개서 및 학업계획서 [1-2] 四个问题。", step6Title: "第6步：个人信息同意书", step6Desc: "对应 개인정보수집·이용 제공 동의서 [1-3]。", financialJudgeTitle: "财政担保判断", financialJudgeDesc: "若银行存款证明为申请人本人名义，则财政担保书免填；若为父母或担保人名义，则必须填写财政担保书。", guaranteeTitle: "입학신청인 재정보증서 [1-4]", guaranteeDesc: "当银行存款证明为父母 / 财政担保人名义时，此页必须填写。", applicantDetails: "■ 신청인개인정보 (Applicant details)", guarantorDetails: "■ 재정보증인정보 (Guarantor details)", applicantSignTitle: "申请人签字", applicantSignDesc: "此签字将用于申请表、退款账户表、个人信息同意书中的申请人签字位置。", guarantorSignTitle: "财政担保人签字", guarantorSignDesc: "此签字仅用于财政担保书中的保证人签字位置。", guarantorSignOnlyTitle: "保证人签字", step7Title: "第7步：上传申请材料", step7Desc: "请按固定材料清单上传文件。系统生成文件无需重复上传，条件材料会根据前面填写内容自动判断。"
    },
    fields: {
      major: "지원학과 (Major)", admissionType: "지원구분 (Admission Type)", programTrack: "지원트랙 (Program Track)", dormitory: "생활관 신청 (Dormitory)", majorPlaceholder: "请输入申请专业", fullNamePassport: "성명 (여권기준) / Full Name as shown on passport", fullNamePassportPlaceholder: "护照英文名", sex: "성별 (Sex)", nationalityApplicant: "국적 (Nationality) - Applicant", nationalityFather: "국적 (Nationality) - Father", nationalityMother: "국적 (Nationality) - Mother", nationalityApplicantPlaceholder: "申请人国籍", nationalityFatherPlaceholder: "父亲国籍", nationalityMotherPlaceholder: "母亲国籍", passportNo: "여권번호 (Passport No.)", passportNoPlaceholder: "护照号码", alienRegistrationNo: "외국인등록번호 (Alien Registration Number)", alienRegistrationNoPlaceholder: "没有可留空", dateOfBirth: "생년월일 (Date of Birth)", tel: "전화번호 (Tel)", telPlaceholder: "联系电话", email: "E-mail", emailPlaceholder: "邮箱地址", address: "주소 (Address)", addressPlaceholder: "完整地址", residenceStatus: "当前居住状态", educationStart: "开始日期", educationEnd: "结束日期", institution: "학교명 (Institutions)", institutionPlaceholder: "学校名称", eduLocation: "학교소재지국가/도시 (Country/City)", eduLocationPlaceholder: "国家 / 城市", refundName: "성명 (Name)", refundNamePlaceholder: "申请人姓名", refundDob: "생년월일 (Date of Birth)", refundEmail: "이메일 (E-mail)", refundEmailPlaceholder: "邮箱", accountHolder: "예금주명 (Account Holder)", accountHolderPlaceholder: "账户持有人", relationshipWithApplicant: "신청자와의 관계 (Relationship)", relationshipWithApplicantPlaceholder: "与申请人关系", country: "국가 (Country)", countryPlaceholder: "国家", city: "도시 (City)", cityPlaceholder: "城市", address2: "주소 (Address)", address2Placeholder: "地址", bankName: "은행명 (Bank Name)", bankNamePlaceholder: "银行名称", bankCountryPlaceholder: "银行所在国家", bankCityPlaceholder: "银行所在城市", bankAddress: "은행 주소 (Bank Address)", bankAddressPlaceholder: "银行地址", accountNumber: "계좌번호 (Account Number)", accountNumberPlaceholder: "账号", swiftCode: "SWIFT Code", q1: "1. 본인에 대해 자유롭게 소개해 주세요.", q1Placeholder: "可填写家庭、成长过程、性格、优缺点等", q2: "2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지", q2Placeholder: "请具体描述为赴韩留学做过哪些准备", q3: "3. 한라대학교와 지원 학과를 선택한 이유", q3Placeholder: "请说明申请韩拉大学和所选专业的原因", q4: "4. 입학 후 학업계획과 졸업 후 진로계획", q4Placeholder: "请说明入学后的学习计划和毕业后的职业规划", agreeInfo: "개인정보 수집·이용에 동의하십니까?", acknowledge: "위 내용 확인하셨습니까?", bankHolderType: "银行存款证明名义", guarMajor: "입학학부 (학과) / Department (Major)", guarApplicantName: "이름 (Full Name)", guarNationality: "국적 (Nationality)", guarId: "신분증번호 (ID number)", guarPassport: "여권번호 (Passport number)", guarName: "이름 (Full name)", guarRelation: "신청인과 관계 (Relationship with applicant)", guarOccupation: "직업 (Occupation)", guarAddress: "주소 (Address)", guarHome: "연락처 (Home)", guarMobile: "연락처 (Mobile / E-MAIL)", guarWork: "연락처 (Work)"
    },
    materialStatus: { generated: "系统生成", required: "必交", conditional: "条件提交", exempt: "免提交" },
    materials: { applicationForm: { label: "入学申请表", desc: "固定格式，由系统根据填写内容自动生成。" }, passport: { label: "护照", desc: "上传护照首页。" }, photo: { label: "证件照", desc: "上传证件照片。" }, finalDiploma: { label: "最终学历证明", desc: "毕业证或预毕业证明，需同时提交海牙认证；中国申请者需提交学信网证明。", note: "建议将学历证明主文件、认证文件、学信网证明一并上传。" }, finalTranscript: { label: "最终学历成绩单", desc: "申请大一提交高中成绩单；插班提交专科或本科成绩单，需同时提交认证文件。" }, familyRelation: { label: "家庭关系证明", desc: "如父母已故、离异、收养等情况，需提交相应官方证明或替代文件。" }, parentsId: { label: "父母身份证", desc: "建议父亲、母亲相关证件一并上传。" }, languageCertificate: { label: "语言能力证明", desc: "双语授课无需提交。" }, personalStatement: { label: "自我介绍及学习计划书", desc: "已包含在系统生成的学校固定格式申请表中。" }, personalInfoConsent: { label: "个人信息收集及使用同意书", desc: "已包含在系统生成的学校固定格式申请表中。" }, arc: { label: "外国人登录证", desc: "仅限在韩国居住者提交。" }, bankStatement: { label: "存款证明", desc: "须提供相当于韩币1,600万以上余额的存款证明原件相关扫描件。", note: "请注意开具日期、冻结期及在韩居住者本人名义等规则。" }, financialGuaranteeForm: { label: "财务担保确认书", desc: "仅当非本人名义存款证明时适用，对应学校表格 [1-4]。" }, guarantorEmploymentIncome: { label: "财务担保人在职证明及收入证明", desc: "仅当非本人名义财务证明时需要提交，须注明单位名称、月薪、公司及联系方式等。" } }
  },
  en: {
    steps: ["Application Basics", "Applicant Information", "Education & Language", "Refund Account", "Statement & Study Plan", "Consent, Guarantee & Signature", "Upload Materials"],
    common: { select: "Please select", currentStep: "Current step", prev: "Previous", next: "Next", saveDraft: "Save Draft", submit: "Submit Application", loadingAgency: "Loading agency information...", newApplication: "New Application", copyLink: "Copy Link", copyLinkSuccess: "Link copied", copyLinkFailed: "Copy failed. Please copy it manually.", downloadQr: "Download QR Code", qrNotReady: "QR code is not ready yet", studentFillLink: "Student Fill Link", currentStatus: "Current Status", enabled: "Enabled", disabled: "Disabled", reopenStudentFill: "Re-enable Student Fill", closeStudentFill: "Disable Student Fill", uploadFile: "Upload File", chooseFile: "Choose File", uploadedFiles: "Uploaded Files", selectedFiles: "Newly Selected Files", noSelectedFiles: "No new files selected", delete: "Delete", generatedNoNeedUpload: "This item is generated by the system and does not need to be uploaded again.", uploadRule: "Upload limits: images up to 2MB, PDF up to 4MB.", signatureMethod: "Signature Method", signatureHelper: "Choose a signature method. It will be inserted into all required signature positions.", autoSignatureDesc: "The generated name will be based on the current name field:",
 fillNameFirst: "Please enter the name first", noSignaturePreview: "No signature preview", drawSignatureDesc: "Please sign in the area below.", clearSignature: "Clear Signature", uploadSignatureImage: "Upload Signature Image", generatedSignatureTip: "A signature preview has been generated and will be inserted into the official form later.", 
 passportReminderTitle: "Passport Information Reminder",
passportChecking: "Reading passport information and comparing it with the form. Please wait...",
passportReminderDesc: "This reminder is for manual review only and does not affect saving or submission.",
passportCompareFormValue: "Form",
passportCompareOcrValue: "OCR",
passportNameMismatch: "Passport name does not match the application form",
passportNoMismatch: "Passport number does not match the application form",
passportNoLikelyMatch:
  "Passport number appears to match, but OCR may have confused characters such as 1/I or 0/O. Please confirm manually",
passportBirthMismatch: "Date of birth does not match the passport",
materialOnlyBanner: "Material-only mode: only refund account information, financial guarantee information, and application materials can be edited. Earlier application fields are locked.",

  openIntake: "Current Open Intake", noOpenIntake: "No open intake", submitIntake: "Submission Intake", noSelectedIntake: "Not selected yet. You can save a draft first.", noIntakeHint: "There is currently no open intake, but you can continue filling out the form and save it as a draft.", educationRecord: "Education Record", guarantorSelfHint: "You selected the applicant's own name. The financial guarantee page will be hidden automatically." },
    options: { sex: [{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }], yesNo: [{ value: "YES", label: "Yes" }, { value: "NO", label: "No" }], bankHolderTypes: [{ value: "self", label: "In applicant's own name" }, { value: "guarantor", label: "In parents' / guarantor's name" }], signatureMethods: [{ value: "auto", label: "Generate Name" }, { value: "draw", label: "Handwritten Signature" }, { value: "upload", label: "Upload Signature Image" }],
 residenceOptions: [{ value: "abroad", label: "Living Abroad" }, { value: "korea", label: "Living in Korea" }], admissionTypes: [{ value: "Freshman", label: "Freshman" }, { value: "Transfer (2nd Year)", label: "Transfer (Year 2)" }, { value: "Transfer (3rd Year)", label: "Transfer (Year 3)" }, { value: "Transfer (4th Year)", label: "Transfer (Year 4)" }, { value: "Dual Degree (2+2)", label: "Dual Degree (2+2)" }, { value: "Dual Degree (3+1)", label: "Dual Degree (3+1)" }], programTracks: [{ value: "Korean Track", label: "Korean Track" }, { value: "English Track", label: "English Track" }, { value: "Bilingual Program (Chinese)", label: "Bilingual Program (Chinese)" }], agreeOptions: [{ value: "agree", label: "I agree" }, { value: "disagree", label: "I disagree" }], acknowledgeOptions: [{ value: "yes", label: "I acknowledge" }, { value: "no", label: "Not confirmed" }] },
    sections: { mainDesc: "Fill out the application step by step in the school format. All fields and materials will be used to generate the standard application form and proceed to admin review.", step1Title: "Step 1: Application Basics", step1Desc: "This corresponds to the first page of the school application form.", step2Title: "Step 2: Applicant Information", step2Desc: "This corresponds to the applicant section on page 1.", step3Title: "Step 3: Education", step3Desc: "This corresponds to Educational Background on page 1.", languageTitle: "Language Proficiency", languageDesc: "This corresponds to the language proficiency section.", step4Title: "Step 4: Tuition Refund Account", step4Desc: "This corresponds to the Tuition Refund Bank Account Form.", beneficiaryTitle: "2-1. Beneficiary Information", beneficiaryDesc: "Beneficiary account holder information.", bankTitle: "2-2. Bank Information", bankDesc: "Refund bank information.", step5Title: "Step 5: Personal Statement and Study Plan", step5Desc: "These are the four questions from the statement and study plan form.", step6Title: "Step 6: Personal Information Consent", step6Desc: "This corresponds to the consent form [1-3].", financialJudgeTitle: "Financial Guarantee Check", financialJudgeDesc: "If the bank statement is in the applicant's name, the guarantee form is not required. If it is in the parents' or guarantor's name, it is required.", guaranteeTitle: "Financial Guarantee Form [1-4]", guaranteeDesc: "This must be filled in when the bank statement is not in the applicant's own name.", applicantDetails: "■ Applicant details", guarantorDetails: "■ Guarantor details", applicantSignTitle: "Applicant Signature", applicantSignDesc: "This signature will be used for the application form, refund form, and personal information consent form.", guarantorSignTitle: "Guarantor Signature", guarantorSignDesc: "This signature will only be used on the financial guarantee form.", guarantorSignOnlyTitle: "Guarantor Signature", step7Title: "Step 7: Upload Application Materials", step7Desc: "Please upload files according to the fixed materials list. Generated files do not need to be uploaded again." },
    fields: { major: "Major", admissionType: "Admission Type", programTrack: "Program Track", dormitory: "Dormitory", majorPlaceholder: "Enter major", fullNamePassport: "Full Name as shown on passport", fullNamePassportPlaceholder: "Passport name in English", sex: "Sex", nationalityApplicant: "Nationality - Applicant", nationalityFather: "Nationality - Father", nationalityMother: "Nationality - Mother", nationalityApplicantPlaceholder: "Applicant nationality", nationalityFatherPlaceholder: "Father nationality", nationalityMotherPlaceholder: "Mother nationality", passportNo: "Passport No.", passportNoPlaceholder: "Passport number", alienRegistrationNo: "Alien Registration Number", alienRegistrationNoPlaceholder: "Leave blank if none", dateOfBirth: "Date of Birth", tel: "Tel", telPlaceholder: "Phone number", email: "E-mail", emailPlaceholder: "Email address", address: "Address", addressPlaceholder: "Full address", residenceStatus: "Current Residence Status", educationStart: "Start Date", educationEnd: "End Date", institution: "Institution", institutionPlaceholder: "School name", eduLocation: "Country/City", eduLocationPlaceholder: "Country / City", refundName: "Name", refundNamePlaceholder: "Applicant name", refundDob: "Date of Birth", refundEmail: "E-mail", refundEmailPlaceholder: "Email", accountHolder: "Account Holder", accountHolderPlaceholder: "Account holder", relationshipWithApplicant: "Relationship with applicant", relationshipWithApplicantPlaceholder: "Relationship", country: "Country", countryPlaceholder: "Country", city: "City", cityPlaceholder: "City", address2: "Address", address2Placeholder: "Address", bankName: "Bank Name", bankNamePlaceholder: "Bank name", bankCountryPlaceholder: "Bank country", bankCityPlaceholder: "Bank city", bankAddress: "Bank Address", bankAddressPlaceholder: "Bank address", accountNumber: "Account Number", accountNumberPlaceholder: "Account number", swiftCode: "SWIFT Code", q1: "1. Please introduce yourself freely.", q1Placeholder: "You may describe family, growth, personality, strengths, and weaknesses.", q2: "2. What efforts have you made to prepare for studying in Korea?", q2Placeholder: "Describe specifically what you have done to prepare.", q3: "3. Why did you choose Halla University and your major?", q3Placeholder: "Explain why you chose Halla University and the selected major.", q4: "4. Your academic plan after admission and career plan after graduation", q4Placeholder: "Explain your study plan and career plan.", agreeInfo: "Do you agree to the collection and use of personal information?", acknowledge: "Have you confirmed the above information?", bankHolderType: "Name on Bank Statement", guarMajor: "Department (Major)", guarApplicantName: "Applicant Full Name", guarNationality: "Nationality", guarId: "ID number", guarPassport: "Passport number", guarName: "Guarantor Name", guarRelation: "Relationship with applicant", guarOccupation: "Occupation", guarAddress: "Address", guarHome: "Contact (Home)", guarMobile: "Contact (Mobile / E-mail)", guarWork: "Contact (Work)" },
    materialStatus: { generated: "Generated", required: "Required", conditional: "Conditional", exempt: "Exempt" },
    materials: { applicationForm: { label: "Application Form", desc: "Generated automatically by the system." }, passport: { label: "Passport", desc: "Upload the passport information page." }, photo: { label: "ID Photo", desc: "Upload an ID photo." }, finalDiploma: { label: "Final Diploma", desc: "Upload diploma or expected graduation certificate with required certification.", note: "Please upload the main diploma file, certification file, and any additional proof together if applicable." }, finalTranscript: { label: "Final Transcript", desc: "Upload final transcript with required certification." }, familyRelation: { label: "Family Relationship Certificate", desc: "Upload official proof for death, divorce, adoption, etc. if applicable." }, parentsId: { label: "Parents' ID", desc: "It is recommended to upload both parents' ID documents together." }, languageCertificate: { label: "Language Certificate", desc: "Not required for the bilingual track." }, personalStatement: { label: "Personal Statement and Study Plan", desc: "Included in the system-generated school application form." }, personalInfoConsent: { label: "Personal Information Consent Form", desc: "Included in the system-generated school application form." }, arc: { label: "Alien Registration Card", desc: "Required only for applicants residing in Korea." }, bankStatement: { label: "Bank Statement", desc: "Please submit a bank statement equivalent to at least KRW 16 million.", note: "Please check issuance date, freeze period, and applicant name rules." }, financialGuaranteeForm: { label: "Financial Guarantee Confirmation", desc: "Applicable only when the bank statement is not in the applicant's own name." }, guarantorEmploymentIncome: { label: "Guarantor Employment and Income Proof", desc: "Required only when the financial statement is not in the applicant's own name." } }
  },
  ko: { steps: ["지원 기본 정보", "지원자 정보", "학력 및 어학 능력", "등록금 환불 계좌", "자기소개 및 학업계획", "동의서·재정보증·서명", "지원 서류 업로드"], common: { select: "선택하세요", currentStep: "현재 단계", prev: "이전", next: "다음", saveDraft: "초안 저장", submit: "지원 제출", loadingAgency: "기관 정보를 불러오는 중...", newApplication: "새 지원서", copyLink: "링크 복사", copyLinkSuccess: "링크가 복사되었습니다", copyLinkFailed: "복사에 실패했습니다. 수동으로 복사하세요.", downloadQr: "QR 코드 다운로드", qrNotReady: "QR 코드가 아직 생성되지 않았습니다", studentFillLink: "학생 작성 링크", currentStatus: "현재 상태", enabled: "활성", disabled: "비활성", reopenStudentFill: "학생 작성 다시 열기", closeStudentFill: "학생 작성 닫기", uploadFile: "파일 업로드", chooseFile: "파일 선택", uploadedFiles: "업로드된 파일", selectedFiles: "이번에 선택한 파일", noSelectedFiles: "새로 선택한 파일이 없습니다", delete: "삭제", generatedNoNeedUpload: "이 항목은 시스템이 생성하므로 다시 업로드할 필요가 없습니다.", uploadRule: "업로드 제한: 이미지 2MB 이하, PDF 4MB 이하.", signatureMethod: "서명 방식", signatureHelper: "서명 방식을 선택하세요. 이후 모든 서명 위치에 자동 반영됩니다.", autoSignatureDesc: "자동 생성 이름은 현재 이름 입력값을 기준으로 생성됩니다:",
 fillNameFirst: "먼저 이름을 입력하세요", noSignaturePreview: "서명 미리보기가 없습니다", drawSignatureDesc: "아래 영역에 직접 서명하세요.", clearSignature: "서명 지우기", uploadSignatureImage: "서명 이미지 업로드", generatedSignatureTip: "서명 미리보기가 생성되었습니다. 이후 공식 신청서에 자동 반영됩니다.", 
 passportReminderTitle: "여권 정보 보조 알림",
passportChecking: "여권 정보를 인식하여 신청서와 비교하는 중입니다. 잠시만 기다려 주세요...",
passportReminderDesc: "이 알림은 수동 검토용이며 초안 저장이나 제출에는 영향을 주지 않습니다.",
passportCompareFormValue: "신청서",
passportCompareOcrValue: "OCR 인식",
passportNameMismatch: "여권 이름이 신청서와 일치하지 않습니다",
passportNoMismatch: "여권번호가 신청서와 일치하지 않습니다",
passportNoLikelyMatch:
  "여권번호가 일치하는 것으로 보이지만 OCR이 1/I, 0/O 같은 문자를 혼동했을 수 있습니다. 수동으로 확인해 주세요",
passportBirthMismatch: "생년월일이 여권 정보와 일치하지 않습니다",
materialOnlyBanner: "보완 서류 모드입니다. 환불 계좌, 재정보증, 서류 업로드만 수정할 수 있으며 앞부분 지원 정보는 잠겨 있습니다.",

  openIntake: "현재 오픈 차수", noOpenIntake: "현재 오픈된 차수 없음", submitIntake: "이번 제출 차수", noSelectedIntake: "아직 선택되지 않음. 먼저 초안 저장 가능", noIntakeHint: "현재 오픈된 차수가 없어도 계속 작성 후 초안으로 저장할 수 있습니다.", educationRecord: "학력 기록", guarantorSelfHint: "지원자 본인 명의를 선택했습니다. 재정보증서 페이지는 자동으로 숨겨집니다." }, options: { sex: [{ value: "Male", label: "남" }, { value: "Female", label: "여" }], yesNo: [{ value: "YES", label: "예" }, { value: "NO", label: "아니오" }], bankHolderTypes: [{ value: "self", label: "지원자 본인 명의" }, { value: "guarantor", label: "부모 / 재정보증인 명의" }], signatureMethods: [{ value: "auto", label: "이름 자동 생성" }, { value: "draw", label: "직접 서명" }, { value: "upload", label: "서명 이미지 업로드" }],
 residenceOptions: [{ value: "abroad", label: "해외 거주" }, { value: "korea", label: "한국 거주" }], admissionTypes: [{ value: "Freshman", label: "신입" }, { value: "Transfer (2nd Year)", label: "편입 2학년" }, { value: "Transfer (3rd Year)", label: "편입 3학년" }, { value: "Transfer (4th Year)", label: "편입 4학년" }, { value: "Dual Degree (2+2)", label: "복수학위 (2+2)" }, { value: "Dual Degree (3+1)", label: "복수학위 (3+1)" }], programTracks: [{ value: "Korean Track", label: "한국어 과정" }, { value: "English Track", label: "영어 과정" }, { value: "Bilingual Program (Chinese)", label: "이중언어 과정(중국어)" }], agreeOptions: [{ value: "agree", label: "동의함" }, { value: "disagree", label: "동의하지 않음" }], acknowledgeOptions: [{ value: "yes", label: "확인했습니다" }, { value: "no", label: "미확인" }] }, sections: { mainDesc: "학교 고정 양식에 맞춰 단계별로 작성합니다. 모든 항목과 서류는 이후 표준 지원서 생성 및 관리자 심사에 사용됩니다.", step1Title: "1단계: 지원 기본 정보", step1Desc: "학교 지원서 1페이지의 지원학과 / 지원구분 / 지원트랙 / 생활관 신청에 해당합니다.", step2Title: "2단계: 지원자 정보", step2Desc: "지원서 1페이지 신청인 영역에 해당합니다.", step3Title: "3단계: 학력 정보", step3Desc: "지원서 1페이지 학력 영역에 해당합니다.", languageTitle: "언어 능력", languageDesc: "지원서 1페이지 언어 능력 영역에 해당합니다.", step4Title: "4단계: 등록금 환불 계좌 신청", step4Desc: "Tuition Refund Bank Account Form에 해당합니다.", beneficiaryTitle: "2-1. 수취인 정보", beneficiaryDesc: "환불 계좌 예금주 정보입니다.", bankTitle: "2-2. 은행 정보", bankDesc: "환불 은행 정보입니다.", step5Title: "5단계: 자기소개 및 학업계획", step5Desc: "자기소개서 및 학업계획서 [1-2]의 네 가지 문항입니다.", step6Title: "6단계: 개인정보 동의서", step6Desc: "개인정보수집·이용 제공 동의서 [1-3]에 해당합니다.", financialJudgeTitle: "재정보증 판단", financialJudgeDesc: "은행 잔고증명이 지원자 본인 명의이면 재정보증서는 면제되며, 부모 또는 보증인 명의이면 반드시 작성해야 합니다.", guaranteeTitle: "입학신청인 재정보증서 [1-4]", guaranteeDesc: "은행 잔고증명이 부모 / 재정보증인 명의일 때 반드시 작성해야 합니다.", applicantDetails: "■ 신청인 개인정보", guarantorDetails: "■ 재정보증인 정보", applicantSignTitle: "지원자 서명", applicantSignDesc: "이 서명은 지원서, 환불 계좌표, 개인정보 동의서의 지원자 서명 위치에 사용됩니다.", guarantorSignTitle: "재정보증인 서명", guarantorSignDesc: "이 서명은 재정보증서의 보증인 서명 위치에만 사용됩니다.", guarantorSignOnlyTitle: "보증인 서명", step7Title: "7단계: 지원 서류 업로드", step7Desc: "고정 서류 목록에 따라 파일을 업로드하세요. 시스템 생성 파일은 다시 업로드할 필요가 없습니다." }, fields: { major: "지원학과", admissionType: "지원구분", programTrack: "지원트랙", dormitory: "생활관 신청", majorPlaceholder: "지원 전공을 입력하세요", fullNamePassport: "여권 기준 영문 이름", fullNamePassportPlaceholder: "여권 영문명", sex: "성별", nationalityApplicant: "국적 - 지원자", nationalityFather: "국적 - 부", nationalityMother: "국적 - 모", nationalityApplicantPlaceholder: "지원자 국적", nationalityFatherPlaceholder: "부 국적", nationalityMotherPlaceholder: "모 국적", passportNo: "여권번호", passportNoPlaceholder: "여권번호", alienRegistrationNo: "외국인등록번호", alienRegistrationNoPlaceholder: "없으면 비워두세요", dateOfBirth: "생년월일", tel: "전화번호", telPlaceholder: "연락처", email: "이메일", emailPlaceholder: "이메일 주소", address: "주소", addressPlaceholder: "전체 주소", residenceStatus: "현재 거주 상태", educationStart: "시작일", educationEnd: "종료일", institution: "학교명", institutionPlaceholder: "학교 이름", eduLocation: "국가/도시", eduLocationPlaceholder: "국가 / 도시", refundName: "성명", refundNamePlaceholder: "지원자 이름", refundDob: "생년월일", refundEmail: "이메일", refundEmailPlaceholder: "이메일", accountHolder: "예금주명", accountHolderPlaceholder: "예금주", relationshipWithApplicant: "지원자와의 관계", relationshipWithApplicantPlaceholder: "지원자와의 관계", country: "국가", countryPlaceholder: "국가", city: "도시", cityPlaceholder: "도시", address2: "주소", address2Placeholder: "주소", bankName: "은행명", bankNamePlaceholder: "은행명", bankCountryPlaceholder: "은행 국가", bankCityPlaceholder: "은행 도시", bankAddress: "은행 주소", bankAddressPlaceholder: "은행 주소", accountNumber: "계좌번호", accountNumberPlaceholder: "계좌번호", swiftCode: "SWIFT Code", q1: "1. 본인에 대해 자유롭게 소개해 주세요.", q1Placeholder: "가족, 성장 과정, 성격, 장단점 등을 작성하세요.", q2: "2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지", q2Placeholder: "한국 유학을 위해 준비한 내용을 구체적으로 작성하세요.", q3: "3. 한라대학교와 지원 학과를 선택한 이유", q3Placeholder: "한라대학교와 지원 학과를 선택한 이유를 설명하세요.", q4: "4. 입학 후 학업계획과 졸업 후 진로계획", q4Placeholder: "입학 후 학업 계획과 졸업 후 진로 계획을 설명하세요.", agreeInfo: "개인정보 수집·이용에 동의하십니까?", acknowledge: "위 내용 확인하셨습니까?", bankHolderType: "은행 잔고증명 명의", guarMajor: "입학학부 (학과)", guarApplicantName: "이름", guarNationality: "국적", guarId: "신분증번호", guarPassport: "여권번호", guarName: "보증인 이름", guarRelation: "지원자와의 관계", guarOccupation: "직업", guarAddress: "주소", guarHome: "연락처 (집)", guarMobile: "연락처 (휴대폰 / 이메일)", guarWork: "연락처 (직장)" }, materialStatus: { generated: "시스템 생성", required: "필수", conditional: "조건부", exempt: "면제" }, materials: { applicationForm: { label: "입학 신청서", desc: "시스템이 자동 생성합니다." }, passport: { label: "여권", desc: "여권 정보 페이지를 업로드하세요." }, photo: { label: "증명사진", desc: "증명사진을 업로드하세요." }, finalDiploma: { label: "최종 학력 증명", desc: "졸업증명서 또는 졸업예정증명서를 인증 서류와 함께 업로드하세요.", note: "주 서류, 인증 서류와 추가 증빙을 함께 업로드하는 것이 좋습니다." }, finalTranscript: { label: "최종 성적증명서", desc: "최종 성적증명서를 인증 서류와 함께 업로드하세요." }, familyRelation: { label: "가족관계증명서", desc: "사망, 이혼, 입양 등의 경우 공식 증빙을 제출하세요." }, parentsId: { label: "부모 신분증", desc: "부모 관련 신분증을 함께 업로드하는 것이 좋습니다." }, languageCertificate: { label: "어학능력증명", desc: "이중언어 과정은 제출 불필요." }, personalStatement: { label: "자기소개 및 학업계획서", desc: "시스템 생성 학교 지원서에 포함됩니다." }, personalInfoConsent: { label: "개인정보 수집 및 이용 동의서", desc: "시스템 생성 학교 지원서에 포함됩니다." }, arc: { label: "외국인등록증", desc: "한국 거주자만 제출합니다." }, bankStatement: { label: "잔고증명", desc: "한화 1,600만 원 상당 이상의 잔고증명을 제출해야 합니다.", note: "발급일, 동결 기간, 명의 규정을 확인하세요." }, financialGuaranteeForm: { label: "재정보증 확인서", desc: "잔고증명이 본인 명의가 아닐 때만 적용됩니다." }, guarantorEmploymentIncome: { label: "재정보증인 재직 및 소득증명", desc: "재정 증명이 본인 명의가 아닐 때만 제출합니다." } } }
};

const MATERIAL_ONLY_ALLOWED_STEPS = [3, 5, 6];

const initialEducationRows = [
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
  { startDate: "", endDate: "", institution: "", location: "" },
];

const initialForm = {
  major: "",
  admissionType: "",
  programTrack: "",
  dormitory: "",

  fullNamePassport: "",
  sex: "",
  nationalityApplicant: "",
  nationalityFather: "",
  nationalityMother: "",
  passportNo: "",
  alienRegistrationNo: "",
  dateOfBirth: "",
  tel: "",
  email: "",
  address: "",
  residenceStatus: "abroad",

  educationRows: initialEducationRows,

  topikLevel: "",
  skaLevel: "",
  kiipLevel: "",
  ieltsLevel: "",
  toefl: "",
  toeflIbt: "",
  cefr: "",
  teps: "",
  newTeps: "",

  refundName: "",
  refundDateOfBirth: "",
  refundEmail: "",
  accountHolder: "",
  relationshipWithApplicant: "",
  beneficiaryAddress: "",
  beneficiaryCity: "",
  beneficiaryCountry: "",
  bankName: "",
  bankAddress: "",
  bankCity: "",
  bankCountry: "",
  accountNumber: "",
  swiftCode: "",

bank_certificate_holder_type: "self",

personal_statement_1: "",
personal_statement_2: "",
personal_statement_3: "",
personal_statement_4: "",

agree_personal_info: true,
acknowledge_notice: true,

guarantor_department_major: "",
guarantor_applicant_name: "",
guarantor_applicant_nationality: "",
guarantor_applicant_id_number: "",
guarantor_applicant_passport_number: "",
guarantor_name: "",
guarantor_relationship: "",
guarantor_id_number: "",
guarantor_occupation: "",
guarantor_address: "",
guarantor_home_contact: "",
guarantor_mobile_email: "",
guarantor_work_contact: "",

applicant_signature_method: "auto",
guarantor_signature_method: "auto",
};

const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2MB
const PDF_MAX_SIZE = 4 * 1024 * 1024; // 4MB
const OCR_PDF_MAX_SIZE = 3 * 1024 * 1024; // Keep base64 JSON safely under Vercel's 4.5MB function limit

function validateUploadFile(file) {
  const fileName = String(file?.name || "");
  const lowerName = fileName.toLowerCase();
  const mimeType = String(file?.type || "").toLowerCase();

  const isPdf =
    mimeType === "application/pdf" || lowerName.endsWith(".pdf");

  const isImage =
    mimeType.startsWith("image/") ||
    [".jpg", ".jpeg", ".png", ".webp"].some((ext) => lowerName.endsWith(ext));

  if (isImage && file.size > IMAGE_MAX_SIZE) {
    return `图片文件「${fileName}」超过 2MB，请压缩后重新上传。`;
  }

  if (isPdf && file.size > PDF_MAX_SIZE) {
    return `PDF 文件「${fileName}」超过 4MB，请压缩后重新上传。`;
  }

  return "";
}

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
      "uzbek",
      "乌兹别克斯坦",
      "우즈베키스탄",
      "우즈벡",
    ],
  },
  {
    canonical: "Mongolia",
    aliases: ["mongolia", "mn", "蒙古", "몽골"],
  },
  {
    canonical: "Vietnam",
    aliases: ["vietnam", "vn", "越南", "베트남"],
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

function normalizeCountryInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const normalized = raw
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .replace(/[()（）【】[\]{}]/g, "")
    .replace(/[／/、,，.;；:_-]/g, "");

  for (const group of COUNTRY_GROUPS) {
    if (group.aliases.includes(normalized)) {
      return group.canonical;
    }
  }

  return raw;
}

function StepButton({ index, currentStep, label, onClick }) {
  const active = currentStep === index;
  const done = currentStep > index;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap",
        active
          ? "bg-emerald-600 text-white"
          : done
          ? "bg-emerald-100 text-emerald-700"
          : "bg-slate-200 text-slate-600 hover:bg-slate-300",
      ].join(" ")}
    >
      {index + 1}. {label}
    </button>
  );
}

function SectionCard({ title, desc, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      {desc ? <p className="mt-1 text-sm text-slate-500">{desc}</p> : null}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Label({ children, required = false }) {
  return (
    <label className="mb-2 block text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="ml-1 text-red-500">*</span> : null}
    </label>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  type = "text",
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder = "",
  required = false,
  rows = 5,
}) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      />
    </div>
  );
}

function Select({ label, value, onChange, options, required = false, t }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <select
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
      >
        <option value="">{t.common.select}</option>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          return (
            <option key={optionValue} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}

function RadioGroup({ label, value, options, onChange, required = false }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const optionValue = typeof option === "string" ? option : option.value;
          const optionLabel = typeof option === "string" ? option : option.label;
          const checked = value === optionValue;

          return (
            <button
              key={optionValue}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onChange(optionValue)}
              className={[
                "inline-flex items-center rounded-xl border px-4 py-3 text-sm font-medium transition",
                checked
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
              ].join(" ")}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ type = "default", children }) {
  const map = {
    required: "bg-red-100 text-red-700",
    conditional: "bg-amber-100 text-amber-700",
    generated: "bg-emerald-100 text-emerald-700",
    optional: "bg-slate-100 text-slate-700",
    exempt: "bg-slate-200 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${map[type]}`}
    >
      {children}
    </span>
  );
}

function SignaturePad({
  title,
  signerName,
  method,
  onMethodChange,
  uploadedImage,
  onUploadedImageChange,
  drawnImage,
  onDrawnImageChange,
  showConfirmText = true,
  t,
}) {
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);

  const generatedSignature = useMemo(() => {
    if (!signerName) return "";
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 140;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#0f172a";
    ctx.font = "48px cursive";
    ctx.textBaseline = "middle";
    ctx.fillText(signerName, 24, 70);
    return canvas.toDataURL("image/png");
  }, [signerName]);

    const exportTrimmedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const { width, height } = canvas;
    const imageData = ctx.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = imageData[(y * width + x) * 4 + 3];
        if (alpha > 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1 || maxY === -1) return "";

    const padding = 8;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = trimmedWidth;
    outCanvas.height = trimmedHeight;

    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return "";

    outCtx.clearRect(0, 0, trimmedWidth, trimmedHeight);
    outCtx.drawImage(
      canvas,
      minX,
      minY,
      trimmedWidth,
      trimmedHeight,
      0,
      0,
      trimmedWidth,
      trimmedHeight
    );

    return outCanvas.toDataURL("image/png");
  };

    const getPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

    const startDraw = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    const point = getPoint(e);
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    setDrawing(true);
  };

    const moveDraw = (e) => {
    e.preventDefault();
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const point = getPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  };

    const endDraw = () => {
    if (!drawing) return;
    setDrawing(false);
    onDrawnImageChange(exportTrimmedSignature());
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onDrawnImageChange("");
  };

  const previewImage =
    method === "auto"
      ? generatedSignature
      : method === "upload"
      ? uploadedImage
      : drawnImage;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      {showConfirmText ? (
        <p className="mt-1 text-sm text-slate-500">
          {t.common.signatureHelper}
        </p>
      ) : null}

      <div className="mt-4">
        <RadioGroup
          label={t.common.signatureMethod}
          value={method}
          options={t.options.signatureMethods}
          onChange={onMethodChange}
        />
      </div>

      {method === "auto" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4">
            <p className="text-sm text-slate-500">
              {t.common.autoSignatureDesc}
            </p>
            <p className="mt-2 text-sm font-medium text-slate-700">
              {signerName || t.common.fillNameFirst}
            </p>
            <div className="mt-4 min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 p-4">
              {generatedSignature ? (
                <img
                  src={generatedSignature}
                  alt="auto-signature"
                  className="h-20 object-contain"
                />
              ) : (
                <p className="text-sm text-slate-400">{t.common.noSignaturePreview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {method === "draw" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-sm text-slate-500">{t.common.drawSignatureDesc}</p>
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              className="touch-none w-full rounded-xl border border-slate-300 bg-white"
              onMouseDown={startDraw}
              onMouseMove={moveDraw}
              onMouseUp={endDraw}
              onMouseLeave={endDraw}
              onTouchStart={startDraw}
              onTouchMove={moveDraw}
              onTouchEnd={endDraw}
            />
            <button
              type="button"
              onClick={clearCanvas}
              className="mt-3 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
              {t.common.clearSignature}
            </button>
          </div>
        </div>
      )}

      {method === "upload" && (
        <div className="mt-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <Label>{t.common.uploadSignatureImage}</Label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => onUploadedImageChange(reader.result);
                reader.readAsDataURL(file);
              }}
              className="block w-full text-sm text-slate-600"
            />
            <div className="mt-4 min-h-[90px] rounded-xl border border-slate-200 bg-slate-50 p-4">
              {uploadedImage ? (
                <img
                  src={uploadedImage}
                  alt="uploaded-signature"
                  className="h-20 object-contain"
                />
              ) : (
                <p className="text-sm text-slate-400">{t.common.noSignaturePreview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage ? (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t.common.generatedSignatureTip}
        </div>
      ) : null}
    </div>
  );
}

function MaterialUploadCard({
  item,
  files,
  existingFiles,
  onFilesChange,
  onRemoveSelectedFile,
  onRemoveExistingFile,
  passportCheckLoading = false,
  passportWarnings = [],
  t,
}) {

  const hasExistingFiles = existingFiles && existingFiles.length > 0;
  const hasNewFiles = files && files.length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">{item.label}</h4>
          <p className="mt-1 text-sm leading-6 text-slate-500">{item.desc}</p>
        </div>

        <div className="shrink-0">
          <StatusPill type={item.statusType}>{item.statusLabel}</StatusPill>
        </div>
      </div>

      {item.note ? (
        <div className="mt-3 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {item.note}
        </div>
      ) : null}

      {item.uploadable ? (
  <div className="mt-4">
    <Label required={item.required}>{t.common.uploadFile}</Label>

    <div className="mb-3 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-700">
      {t.common.uploadRule}
    </div>

    {passportCheckLoading ? (
  <div className="mb-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700">
    {t.common.passportChecking}
  </div>
) : null}

{!passportCheckLoading && passportWarnings.length > 0 ? (
  <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
    <div className="font-semibold">{t.common.passportReminderTitle}</div>
    <ul className="mt-2 list-disc pl-5 space-y-1">
      {passportWarnings.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
    <div className="mt-2 text-xs text-amber-700">
      {t.common.passportReminderDesc}
    </div>
  </div>
) : null}

    <label className="inline-flex cursor-pointer items-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
      {t.common.chooseFile}
      <input
        type="file"
        multiple={item.multiple}
        accept={item.accept}
        onChange={(e) => {
          const selectedFiles = Array.from(e.target.files || []);

          if (selectedFiles.length === 0) return;

          const invalidMessages = [];
          const validFiles = [];

          selectedFiles.forEach((file) => {
            const errorMessage = validateUploadFile(file);
            if (errorMessage) {
              invalidMessages.push(errorMessage);
            } else {
              validFiles.push(file);
            }
          });

          if (invalidMessages.length > 0) {
            alert(invalidMessages.join("\n"));
          }

          if (validFiles.length > 0) {
            onFilesChange(item.key, validFiles);
          } else {
            onFilesChange(item.key, []);
          }

          e.target.value = "";
        }}
        className="hidden"
      />
    </label>

          {hasExistingFiles ? (
  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
    <div className="mb-2 text-sm font-semibold text-slate-700">{t.common.uploadedFiles}</div>
    <ul className="space-y-2 text-sm text-slate-700">
      {existingFiles.map((file, index) => (
        <li
          key={`${file.id || file.file_name || file.name}-${index}`}
          className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
        >
          <span className="truncate">{file.file_name || file.name}</span>

          <button
            type="button"
            onClick={() => onRemoveExistingFile(item.key, file)}
            className="shrink-0 rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
          >
            {t.common.delete}
          </button>
        </li>
      ))}
    </ul>
  </div>
) : null}

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
  {hasNewFiles ? (
    <>
      <div className="mb-2 text-sm font-semibold text-slate-700">本次新选择文件</div>
      <ul className="space-y-2 text-sm text-slate-700">
        {files.map((file, index) => (
          <li
            key={`${file.name}-${index}`}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2"
          >
            <span className="truncate">{file.name}</span>

            <button
              type="button"
              onClick={() => onRemoveSelectedFile(item.key, index)}
              className="shrink-0 rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </>
  ) : (
    <p className="text-sm text-slate-400">{t.common.noSelectedFiles}</p>
  )}
</div>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t.common.generatedNoNeedUpload}
        </div>
      )}
    </div>
  );
}

function NewApplicationPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;
  const steps = t.steps;
  const sexOptions = t.options.sex;
  const yesNoOptions = t.options.yesNo;
  const bankHolderTypes = t.options.bankHolderTypes;
  const residenceOptions = t.options.residenceOptions;
  const admissionTypeOptions = t.options.admissionTypes;
  const programTrackOptions = t.options.programTracks;
  const [searchParams] = useSearchParams();
const editingPublicId = searchParams.get("public_id");
const pageMode = searchParams.get("mode");
const isMaterialOnlyMode = pageMode === "material_only";

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState(initialForm);

  const [applicantUploadedSignature, setApplicantUploadedSignature] =
    useState("");
  const [applicantDrawnSignature, setApplicantDrawnSignature] = useState("");

  const [guarantorUploadedSignature, setGuarantorUploadedSignature] =
    useState("");
  const [guarantorDrawnSignature, setGuarantorDrawnSignature] = useState("");

  const [uploadedMaterials, setUploadedMaterials] = useState({});
  const [applicationId, setApplicationId] = useState("");
  const [applicationPublicId, setApplicationPublicId] = useState("");
  const [studentFillToken, setStudentFillToken] = useState("");
  const [studentFillEnabled, setStudentFillEnabled] = useState(true);
  const [currentIntakeId, setCurrentIntakeId] = useState("");
  const [currentIntakeLabel, setCurrentIntakeLabel] = useState("");
  const [selectedIntakeId, setSelectedIntakeId] = useState("");
  const [selectedIntakeLabel, setSelectedIntakeLabel] = useState("");
  const [existingUploadedFiles, setExistingUploadedFiles] = useState({});

const [passportCheckLoading, setPassportCheckLoading] = useState(false);
const [passportOcrResult, setPassportOcrResult] = useState(null);
const [passportCheckWarnings, setPassportCheckWarnings] = useState([]);

const sessionLoading = !agencySession;
const [loadedUpdatedAt, setLoadedUpdatedAt] = useState("");
const [, setLockChecked] = useState(false);
const LOCK_TIMEOUT_MINUTES = 20;
const studentFillLink = studentFillToken
  ? `${window.location.origin}/student/application/${studentFillToken}`
  : "";
useEffect(() => {
  if (!isMaterialOnlyMode) return;

  if (!MATERIAL_ONLY_ALLOWED_STEPS.includes(currentStep)) {
    const timer = window.setTimeout(() => setCurrentStep(3), 0);
    return () => window.clearTimeout(timer);
  }
}, [isMaterialOnlyMode, currentStep]);

  const isLockExpired = (value) => {
  if (!value) return true;
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) return true;
  return Date.now() - time > LOCK_TIMEOUT_MINUTES * 60 * 1000;
};

const getCurrentEditorName = () => {
  return (
    agencySession?.account_name ||
    agencySession?.username ||
    "当前账号"
  );
};

const canUseMaterialOnlyMode = (intakeRow) => {
  if (!intakeRow) return false;

  const closeAt = intakeRow.close_at ? new Date(intakeRow.close_at) : null;
  const isClosed = closeAt ? new Date() > closeAt : false;

  return (
    isClosed &&
    intakeRow.post_deadline_material_edit_enabled === true
  );
};

const isClosedIntake = (intakeRow) => {
  if (!intakeRow?.close_at) return false;
  return new Date() > new Date(intakeRow.close_at);
};

const fetchIntakeStatus = async (intakeId) => {
  if (!intakeId) return { exists: false, closed: false, row: null };

  const { data, error } = await supabase
    .from("intakes")
    .select("id, close_at, post_deadline_material_edit_enabled")
    .eq("id", intakeId)
    .single();

  if (error) throw error;

  const closed = data?.close_at ? new Date() > new Date(data.close_at) : false;

  return {
    exists: !!data,
    closed,
    row: data || null,
  };
};

const getCurrentOpenIntakeLabel = (intake) => {
  if (!intake) return "";

  if (intake.title && String(intake.title).trim() !== "") {
    return intake.title;
  }

  const year = intake.year || "";
  const month = intake.intake_month || "";
  const round = intake.round_number || "";

  if (year && month && round) {
    if (language === "en") return `${year}-${month} Round ${round} Undergraduate`;
    if (language === "ko") return `${year}년 ${month}월 ${round}차 학부`;
    return `${year}年${month}月 第${round}批本科申请`;
  }

  return "";
};

const fetchCurrentOpenIntake = async () => {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("intakes")
    .select("*")
    .eq("is_active", true)
    .or("application_type.eq.undergraduate,application_type.is.null")
    .lte("open_at", nowIso)
    .gte("close_at", nowIso)
    .order("open_at", { ascending: true })
    .limit(1);

  if (error) throw error;

  return data && data.length > 0 ? data[0] : null;
};

const applyCurrentIntake = (intake) => {
  if (!intake) {
    setCurrentIntakeId("");
    setCurrentIntakeLabel("");
    setSelectedIntakeId("");
    setSelectedIntakeLabel("");
    return;
  }

  const label = getCurrentOpenIntakeLabel(intake);

  setCurrentIntakeId(intake.id || "");
  setCurrentIntakeLabel(label);
  setSelectedIntakeId(intake.id || "");
  setSelectedIntakeLabel(label);
};

  useEffect(() => {
  async function loadExistingApplication() {
    if (!editingPublicId) {
      setLockChecked(true);
      return;
    }

    if (sessionLoading) return;

    if (!agencySession?.agency_id || !agencySession?.agency_account_id) {
      alert(language === "en" ? "Agency session is invalid. Please log in again." : language === "ko" ? "기관 로그인 상태가 유효하지 않습니다. 다시 로그인하세요." : "机构登录状态无效，请重新登录");
      window.location.href = "/login";
      return;
    }

    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("public_id", editingPublicId)
        .single();

      if (error) throw error;
      if (!data) {
        setLockChecked(true);
        return;
      }

      if (data.agency_id && data.agency_id !== agencySession.agency_id) {
  alert(language === "en" ? "You do not have permission to edit another agency application." : language === "ko" ? "다른 기관의 지원서를 수정할 권한이 없습니다." : "你无权编辑其他机构的申请");
  window.location.href = "/agency/applications";
  return;
}

const isDraftApplication = String(data.status || "draft").toLowerCase() === "draft";
const shouldUseSavedIntake =
  Boolean(data.intake_id) && (!isDraftApplication || isMaterialOnlyMode);

let intakeRow = null;

if (shouldUseSavedIntake) {
  const { data: intakeData, error: intakeError } = await supabase
    .from("intakes")
    .select("*")
    .eq("id", data.intake_id)
    .single();

  if (intakeError) throw intakeError;
  intakeRow = intakeData || null;
}

if (isMaterialOnlyMode) {
  if (!canUseMaterialOnlyMode(intakeRow)) {
    alert(language === "en" ? "Post-deadline material editing is not enabled for this application." : language === "ko" ? "이 지원서는 마감 후 서류 보완 권한이 활성화되어 있지 않습니다." : "该申请当前未开启截止后补材料权限，无法进入补材料模式。");
    window.location.href = "/agency/history";
    return;
  }
} else {
  if (shouldUseSavedIntake && isClosedIntake(intakeRow)) {
    alert(language === "en" ? "This intake is closed. Please use material-only mode from history if enabled by admin." : language === "ko" ? "해당 차수는 마감되었습니다. 관리자가 허용한 경우 이력에서 보완 모드로 들어가세요." : "该批次已截止，不能继续编辑前半部分申请信息。若管理员已开启权限，请从历史申请进入“补充材料”模式。");
    window.location.href = "/agency/history";
    return;
  }
}

const lockedByOther =
  data.editing_by_account_id &&
  data.editing_by_account_id !== agencySession.agency_account_id &&
  !isLockExpired(data.editing_started_at);

      if (lockedByOther) {
        alert(
          `该申请当前正在由 ${data.editing_by_account_name || "其他账号"} 编辑，请稍后再试。`
        );
        window.location.href = "/agency/applications";
        return;
      }

      const { data: lockedRow, error: lockError } = await supabase
  .from("applications")
  .update({
    editing_by_account_id: agencySession.agency_account_id,
    editing_by_account_name: getCurrentEditorName(),
    editing_started_at: new Date().toISOString(),
  })
  .eq("id", data.id)
  .select("updated_at")
  .single();

if (lockError) throw lockError;

      setApplicationId(data.id || "");
      setApplicationPublicId(data.public_id || "");
            setStudentFillToken(data.student_fill_token || "");
      setStudentFillEnabled(data.student_fill_enabled !== false);
      setLoadedUpdatedAt(lockedRow?.updated_at || data.updated_at || "");

      const loadedIntakeLabel =
        intakeRow?.title && String(intakeRow.title).trim() !== ""
          ? intakeRow.title
          : data.intake_name ||
            data.intake_title ||
            (data.intake_year && data.intake_month && data.intake_round_number
              ? `${data.intake_year}年${data.intake_month}月 第${data.intake_round_number}批`
              : "");

      if (isDraftApplication && !isMaterialOnlyMode) {
        const current = await fetchCurrentOpenIntake();
        applyCurrentIntake(current);
      } else {
        setCurrentIntakeId(data.intake_id || "");
        setCurrentIntakeLabel(loadedIntakeLabel);
        setSelectedIntakeId(data.intake_id || "");
        setSelectedIntakeLabel(loadedIntakeLabel);
      }

      const { data: fileRows, error: fileError } = await supabase
        .from("application_files")
        .select("*")
        .eq("public_id", editingPublicId)
        .order("created_at", { ascending: false });

      if (fileError) throw fileError;

      const groupedFiles = (fileRows || []).reduce((acc, file) => {
        if (!acc[file.file_type]) {
          acc[file.file_type] = [];
        }
        acc[file.file_type].push(file);
        return acc;
      }, {});

      setExistingUploadedFiles(groupedFiles);

      setForm((prev) => ({
        ...prev,

        major: data.major || "",
        admissionType: data.admission_type || "",
        programTrack: data.program_track || "",
        dormitory: data.dormitory || "",

        fullNamePassport: data.full_name_passport || data.english_name || "",
        sex: data.gender || "",
        nationalityApplicant:
          data.nationality_applicant || data.nationality || "",
        nationalityFather: data.nationality_father || "",
        nationalityMother: data.nationality_mother || "",
        passportNo: data.passport_no || "",
        alienRegistrationNo: data.alien_registration_no || "",
        dateOfBirth: data.date_of_birth || "",
        tel: data.tel || data.phone || "",
        email: data.email || "",
        address: data.address || "",
        residenceStatus: data.residence_status || "abroad",

        topikLevel: data.topik || "",
        skaLevel: data.ska || "",
        kiipLevel: data.kiip || "",
        ieltsLevel: data.ielts || "",
        toefl: data.toefl || "",
        toeflIbt: data.toefl_ibt || "",
        cefr: data.cefr || "",
        teps: data.teps || "",
        newTeps: data.new_teps || "",

        refundName: data.refund_name || "",
        refundDateOfBirth: data.refund_dob || "",
        refundEmail: data.refund_email || "",
        accountHolder: data.account_holder || "",
        relationshipWithApplicant: data.relationship || "",
        beneficiaryAddress: data.beneficiary_address || "",
        beneficiaryCity: data.beneficiary_city || "",
        beneficiaryCountry: data.beneficiary_country || "",
        bankName: data.bank_name || "",
        bankAddress: data.bank_address || "",
        bankCity: data.bank_city || "",
        bankCountry: data.bank_country || "",
        accountNumber: data.account_number || "",
        swiftCode: data.swift_code || "",

        personal_statement_1: data.personal_statement_1 || "",
        personal_statement_2: data.personal_statement_2 || "",
        personal_statement_3: data.personal_statement_3 || "",
        personal_statement_4: data.personal_statement_4 || "",

        agree_personal_info:
          (data.agree_personal_info || "").toLowerCase() !== "disagree",
        acknowledge_notice:
          (data.acknowledge_notice || "").toLowerCase() !== "no",

        bank_certificate_holder_type:
          data.bank_certificate_holder_type || "self",

        guarantor_department_major: data.guarantor_department_major || "",
        guarantor_applicant_name: data.guarantor_applicant_name || "",
        guarantor_applicant_nationality:
          data.guarantor_applicant_nationality || "",
        guarantor_applicant_id_number:
          data.guarantor_applicant_id_number || "",
        guarantor_applicant_passport_number:
          data.guarantor_applicant_passport_number || "",

        guarantor_name: data.guarantor_name || "",
        guarantor_relationship: data.guarantor_relationship || "",
        guarantor_id_number: data.guarantor_id_number || "",
        guarantor_occupation: data.guarantor_occupation || "",
        guarantor_address: data.guarantor_address || "",
        guarantor_home_contact: data.guarantor_home_contact || "",
        guarantor_mobile_email:
          data.guarantor_mobile_email || data.guarantor_email || "",
        guarantor_work_contact:
          data.guarantor_work_contact || data.guarantor_work || "",
      }));
    } catch (error) {
      console.error("loadExistingApplication error:", error);
      alert((language === "en" ? "Failed to load draft: " : language === "ko" ? "초안 불러오기 실패: " : "草稿加载失败：") + error.message);
    } finally {
      setLockChecked(true);
    }
  }

  loadExistingApplication();
}, [editingPublicId, agencySession, sessionLoading]);


   useEffect(() => {
    async function loadCurrentIntake() {
      if (editingPublicId || isMaterialOnlyMode) return;

      try {
        const current = await fetchCurrentOpenIntake();
        applyCurrentIntake(current);
      } catch (error) {
        console.error("loadCurrentIntake error:", error);
      }
    }

    loadCurrentIntake();
  }, [editingPublicId, isMaterialOnlyMode, language]);

  const financialGuaranteeRequired =
    form.bank_certificate_holder_type === "guarantor";
  const bilingualTrack = form.programTrack === "Bilingual Program (Chinese)";
  const inKorea = form.residenceStatus === "korea";

  const materialItems = useMemo(() => {
    return [
      {
        key: "applicationForm",
        label: t.materials.applicationForm.label,
        desc: t.materials.applicationForm.desc,
        required: true,
        uploadable: false,
        multiple: false,
        accept: ".pdf,.doc,.docx",
        statusType: "generated",
        statusLabel: t.materialStatus.generated,
      },
      {
        key: "passport",
        label: t.materials.passport.label,
        desc: t.materials.passport.desc,
        required: true,
        uploadable: true,
        multiple: false,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
      },
      {
        key: "photo",
        label: t.materials.photo.label,
        desc: t.materials.photo.desc,
        required: true,
        uploadable: true,
        multiple: false,
        accept: ".jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
      },
      {
        key: "finalDiploma",
        label: t.materials.finalDiploma.label,
        desc: t.materials.finalDiploma.desc,
        required: true,
        uploadable: true,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
        note: t.materials.finalDiploma.note,
      },
      {
        key: "finalTranscript",
        label: t.materials.finalTranscript.label,
        desc: t.materials.finalTranscript.desc,
        required: true,
        uploadable: true,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
      },
      {
        key: "familyRelation",
        label: t.materials.familyRelation.label,
        desc: t.materials.familyRelation.desc,
        required: true,
        uploadable: true,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
      },
      {
        key: "parentsId",
        label: t.materials.parentsId.label,
        desc: t.materials.parentsId.desc,
        required: true,
        uploadable: true,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
      },
      {
        key: "languageCertificate",
        label: t.materials.languageCertificate.label,
        desc: t.materials.languageCertificate.desc,
        required: !bilingualTrack,
        uploadable: !bilingualTrack,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: bilingualTrack ? "exempt" : "conditional",
        statusLabel: bilingualTrack ? t.materialStatus.exempt : t.materialStatus.conditional,
      },
      {
        key: "personalStatement",
        label: t.materials.personalStatement.label,
        desc: t.materials.personalInfoConsent.desc,
        required: true,
        uploadable: false,
        multiple: false,
        accept: ".pdf,.doc,.docx",
        statusType: "generated",
        statusLabel: t.materialStatus.generated,
      },
      {
        key: "personalInfoConsent",
        label: t.materials.personalInfoConsent.label,
        desc: t.materials.personalInfoConsent.desc,
        required: true,
        uploadable: false,
        multiple: false,
        accept: ".pdf,.doc,.docx",
        statusType: "generated",
        statusLabel: t.materialStatus.generated,
      },
      {
        key: "arc",
        label: t.materials.arc.label,
        desc: t.materials.arc.desc,
        required: inKorea,
        uploadable: inKorea,
        multiple: false,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: inKorea ? "conditional" : "exempt",
        statusLabel: inKorea ? t.materialStatus.conditional : t.materialStatus.exempt,
      },
      {
        key: "bankStatement",
        label: t.materials.bankStatement.label,
        desc: t.materials.bankStatement.desc,
        required: true,
        uploadable: true,
        multiple: false,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: "required",
        statusLabel: t.materialStatus.required,
        note: t.materials.bankStatement.note,
      },
      {
        key: "financialGuaranteeForm",
        label: t.materials.financialGuaranteeForm.label,
        desc: t.materials.financialGuaranteeForm.desc,
        required: financialGuaranteeRequired,
        uploadable: false,
        multiple: false,
        accept: ".pdf,.doc,.docx",
        statusType: financialGuaranteeRequired ? "generated" : "exempt",
        statusLabel: financialGuaranteeRequired ? t.materialStatus.generated : t.materialStatus.exempt,
      },
      {
        key: "guarantorEmploymentIncome",
        label: t.materials.guarantorEmploymentIncome.label,
        desc: t.materials.guarantorEmploymentIncome.desc,
        required: financialGuaranteeRequired,
        uploadable: financialGuaranteeRequired,
        multiple: true,
        accept: ".pdf,.jpg,.jpeg,.png",
        statusType: financialGuaranteeRequired ? "conditional" : "exempt",
        statusLabel: financialGuaranteeRequired ? t.materialStatus.conditional : t.materialStatus.exempt,
      },
    ];
  }, [bilingualTrack, inKorea, financialGuaranteeRequired]);

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateCountryField = (field, value) => {
  setForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const normalizeCountryField = (field) => {
  setForm((prev) => ({
    ...prev,
    [field]: normalizeCountryInput(prev[field]),
  }));
};

  const updateEducationRow = (index, field, value) => {
    setForm((prev) => {
      const nextRows = [...prev.educationRows];
      nextRows[index] = {
        ...nextRows[index],
        [field]: value,
      };
      return {
        ...prev,
        educationRows: nextRows,
      };
    });
  };

  const setMaterialFiles = (key, files) => {
  setUploadedMaterials((prev) => ({
    ...prev,
    [key]: files,
  }));

  if (key === "passport") {
    const firstFile = files?.[0];

    if (!firstFile) {
      setPassportOcrResult(null);
      setPassportCheckWarnings([]);
      return;
    }

    runPassportOcrCheck(firstFile);
  }
};

const removeSelectedMaterialFile = (key, indexToRemove) => {
  setUploadedMaterials((prev) => {
    const currentFiles = prev[key] || [];
    const nextFiles = currentFiles.filter((_, index) => index !== indexToRemove);

    if (key === "passport") {
      const firstFile = nextFiles?.[0];
      if (!firstFile) {
        setPassportOcrResult(null);
        setPassportCheckWarnings([]);
      } else {
        runPassportOcrCheck(firstFile);
      }
    }

    return {
      ...prev,
      [key]: nextFiles,
    };
  });
};

  const nextStep = () => {
  if (isMaterialOnlyMode) {
    const currentIndex = MATERIAL_ONLY_ALLOWED_STEPS.indexOf(currentStep);
    const nextAllowedStep = MATERIAL_ONLY_ALLOWED_STEPS[currentIndex + 1];
    if (typeof nextAllowedStep === "number") {
      setCurrentStep(nextAllowedStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  if (currentStep < steps.length - 1) {
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

const prevStep = () => {
  if (isMaterialOnlyMode) {
    const currentIndex = MATERIAL_ONLY_ALLOWED_STEPS.indexOf(currentStep);
    const prevAllowedStep = MATERIAL_ONLY_ALLOWED_STEPS[currentIndex - 1];
    if (typeof prevAllowedStep === "number") {
      setCurrentStep(prevAllowedStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return;
  }

  if (currentStep > 0) {
    setCurrentStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

  const slugify = (value) => {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
};

const buildPublicId = () => {
  const base =
    slugify(form.fullNamePassport) ||
    `app-${Date.now()}`;
  return `${base}-${Date.now().toString().slice(-6)}`;
};

const buildStudentFillToken = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `stu-${Date.now()}-${randomPart}`;
};

const sanitizeFileName = (name) => {
  const original = String(name || "file");
  const dotIndex = original.lastIndexOf(".");
  const ext = dotIndex >= 0 ? original.slice(dotIndex).toLowerCase() : "";
  const base = dotIndex >= 0 ? original.slice(0, dotIndex) : original;

  const safeBase = Array.from(base.normalize("NFKD"))
    .filter((char) => char.charCodeAt(0) <= 0x7f)
    .join("")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${safeBase || "file"}${ext}`;
};

const normalizeDate = (value) => {
  return value && String(value).trim() !== "" ? value : null;
};

const readFileAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };

    reader.onerror = () => reject(new Error("读取护照文件失败"));
    reader.readAsDataURL(file);
  });

const toHalfWidth = (value) => {
  return String(value || "").replace(/[！-～]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xfee0)
  );
};

const normalizePassportName = (value) => {
  return toHalfWidth(value)
    .toUpperCase()
    .replace(/<+/g, " ")
    .replace(/[.,，。·'’`-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const normalizePassportNo = (value) => {
  return toHalfWidth(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim();
};

const normalizePassportNoLoose = (value) => {
  return normalizePassportNo(value)
    .replace(/[I|L]/g, "1")
    .replace(/O/g, "0")
    .replace(/S/g, "5")
    .replace(/B/g, "8");
};

const normalizeDateForCompare = (value) => {
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

const buildMismatchMessage = (message, formValue, ocrValue) => {
  return `${message}：${t.common.passportCompareFormValue} ${
    formValue || "-"
  }，${t.common.passportCompareOcrValue} ${ocrValue || "-"}`;
};

const buildPassportWarnings = (ocrResult, currentForm) => {
  if (!ocrResult) return [];

 const warnings = [];

  const rawFormName = currentForm.fullNamePassport;
  const rawOcrName = ocrResult.passport_name;
  const formName = normalizePassportName(rawFormName);
  const ocrName = normalizePassportName(rawOcrName);

  const rawFormPassportNo = currentForm.passportNo;
  const rawOcrPassportNo = ocrResult.passport_no;
  const formPassportNo = normalizePassportNo(rawFormPassportNo);
  const ocrPassportNo = normalizePassportNo(rawOcrPassportNo);
  const formPassportNoLoose = normalizePassportNoLoose(rawFormPassportNo);
  const ocrPassportNoLoose = normalizePassportNoLoose(rawOcrPassportNo);

  const rawFormDob = currentForm.dateOfBirth;
  const rawOcrDob = ocrResult.date_of_birth;
  const formDob = normalizeDateForCompare(rawFormDob);
  const ocrDob = normalizeDateForCompare(rawOcrDob);

  if (ocrName && formName && ocrName !== formName) {
    warnings.push(
      buildMismatchMessage(t.common.passportNameMismatch
, rawFormName, rawOcrName)
    );
  }

  if (ocrPassportNo && formPassportNo && ocrPassportNo !== formPassportNo) {
    if (
      formPassportNoLoose &&
      ocrPassportNoLoose &&
      formPassportNoLoose === ocrPassportNoLoose
    ) {
      warnings.push(
        buildMismatchMessage(
          t.common.passportNoLikelyMatch,
          rawFormPassportNo,
          rawOcrPassportNo
        )
      );
    } else {
      warnings.push(
        buildMismatchMessage(
          t.common.passportNoMismatch
,
          rawFormPassportNo,
          rawOcrPassportNo
        )
      );
    }
  }

  if (ocrDob && formDob && ocrDob !== formDob) {
    warnings.push(
      buildMismatchMessage(t.common.passportBirthMismatch
, rawFormDob, rawOcrDob)
    );
  }

  return warnings;
};

const displayedPassportWarnings = useMemo(() => {
  if (passportOcrResult?.success) {
    return buildPassportWarnings(passportOcrResult, form);
  }

  return passportCheckWarnings;
}, [
  passportOcrResult,
  passportCheckWarnings,
  form.fullNamePassport,
  form.passportNo,
  form.dateOfBirth,
]);

const runPassportOcrCheck = async (file) => {
  if (!file) {
    setPassportOcrResult(null);
    setPassportCheckWarnings([]);
    return;
  }

  const lowerName = String(file.name || "").toLowerCase();
  const isPdfForOcr = String(file.type || "").toLowerCase() === "application/pdf" || lowerName.endsWith(".pdf");

  if (isPdfForOcr && file.size > OCR_PDF_MAX_SIZE) {
    setPassportOcrResult({
      success: false,
      message: "Passport OCR skipped because the PDF is larger than 3MB.",
    });
    setPassportCheckWarnings([
      "Passport OCR was skipped because the PDF is larger than 3MB. Please manually check the passport name, number, and date of birth.",
    ]);
    return;
  }

  try {
    setPassportCheckLoading(true);

    const fileBase64 = await readFileAsBase64(file);

    const response = await fetch("/api/passport-ocr-check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileBase64,
        mimeType: file.type || "",
        fileName: file.name || "",
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "护照识别失败");
    }

    setPassportOcrResult(result);
    setPassportCheckWarnings(buildPassportWarnings(result, form));
  } catch (error) {
    console.error("runPassportOcrCheck error:", error);
    setPassportOcrResult({
      success: false,
      message: error.message || "护照识别失败",
    });
    setPassportCheckWarnings([
      "护照信息识别失败，请人工检查姓名、护照号和出生日期是否填写正确。",
    ]);
  } finally {
    setPassportCheckLoading(false);
  }
};

const buildApplicationPayload = (statusValue = "draft", publicIdValue) => {
  const shouldBindIntake = statusValue === "submitted" || isMaterialOnlyMode;
  const payloadIntakeId = shouldBindIntake ? selectedIntakeId || null : null;
  const payloadIntakeName = shouldBindIntake ? selectedIntakeLabel || null : null;

  if (isMaterialOnlyMode && applicationId) {
    return {
      ...(publicIdValue ? { public_id: publicIdValue } : {}),
      status: statusValue,
      agency_id: agencySession?.agency_id || null,
      agency_account_id: agencySession?.agency_account_id || null,
            intake_id: payloadIntakeId,
      intake_name: payloadIntakeName,

      refund_name: form.refundName,
      refund_dob: normalizeDate(form.refundDateOfBirth),
      refund_email: form.refundEmail,
      account_holder: form.accountHolder,
      relationship: form.relationshipWithApplicant,
      beneficiary_address: form.beneficiaryAddress,
      beneficiary_city: form.beneficiaryCity,
      beneficiary_country: form.beneficiaryCountry,
      bank_name: form.bankName,
      bank_address: form.bankAddress,
      bank_city: form.bankCity,
      bank_country: form.bankCountry,
      account_number: form.accountNumber,
      swift_code: form.swiftCode,

      bank_certificate_holder_type: form.bank_certificate_holder_type,

      agree_personal_info: form.agree_personal_info ? "agree" : "disagree",
      acknowledge_notice: form.acknowledge_notice ? "yes" : "no",

      guarantor_department_major: form.guarantor_department_major,
      guarantor_applicant_name: form.guarantor_applicant_name,
      guarantor_applicant_nationality: normalizeCountryInput(
        form.guarantor_applicant_nationality
      ),
      guarantor_applicant_id_number: form.guarantor_applicant_id_number,
      guarantor_applicant_passport_number: form.guarantor_applicant_passport_number,

      guarantor_name: form.guarantor_name,
      guarantor_relationship: form.guarantor_relationship,
      guarantor_id_number: form.guarantor_id_number,
      guarantor_occupation: form.guarantor_occupation,
      guarantor_address: form.guarantor_address,
      guarantor_home_contact: form.guarantor_home_contact,
      guarantor_mobile: form.guarantor_mobile_email,
      guarantor_email: form.guarantor_mobile_email,
      guarantor_mobile_email: form.guarantor_mobile_email,
      guarantor_work: form.guarantor_work_contact,
      guarantor_work_contact: form.guarantor_work_contact,

      applicant_signature_method: form.applicant_signature_method,
      guarantor_signature_method: form.guarantor_signature_method,
      applicant_uploaded_signature: applicantUploadedSignature,
      applicant_drawn_signature: applicantDrawnSignature,
      guarantor_uploaded_signature: guarantorUploadedSignature,
      guarantor_drawn_signature: guarantorDrawnSignature,
    };
  }
  const education1 = form.educationRows[0]
    ? `${form.educationRows[0].startDate || ""} ~ ${form.educationRows[0].endDate || ""} | ${form.educationRows[0].institution || ""} | ${form.educationRows[0].location || ""}`
    : "";
  const education2 = form.educationRows[1]
    ? `${form.educationRows[1].startDate || ""} ~ ${form.educationRows[1].endDate || ""} | ${form.educationRows[1].institution || ""} | ${form.educationRows[1].location || ""}`
    : "";
  const education3 = form.educationRows[2]
    ? `${form.educationRows[2].startDate || ""} ~ ${form.educationRows[2].endDate || ""} | ${form.educationRows[2].institution || ""} | ${form.educationRows[2].location || ""}`
    : "";

  return {
    ...(publicIdValue ? { public_id: publicIdValue } : {}),
    status: statusValue,
    agency_id: agencySession?.agency_id || null,
agency_account_id: agencySession?.agency_account_id || null,
    student_fill_enabled: true,
        intake_id: payloadIntakeId,
    intake_name: payloadIntakeName,

    major: form.major,
    admission_type: form.admissionType,
    program_track: form.programTrack,
    dormitory: form.dormitory,

    english_name: form.fullNamePassport,
    full_name_passport: form.fullNamePassport,
    gender: form.sex,
    nationality: normalizeCountryInput(form.nationalityApplicant),
nationality_applicant: normalizeCountryInput(form.nationalityApplicant),
nationality_father: normalizeCountryInput(form.nationalityFather),
nationality_mother: normalizeCountryInput(form.nationalityMother),
    passport_no: form.passportNo,
    alien_registration_no: form.alienRegistrationNo,
    date_of_birth: normalizeDate(form.dateOfBirth),
    tel: form.tel,
    phone: form.tel,
    email: form.email,
    address: form.address,
    residence_status: form.residenceStatus,

    education1,
    education2,
    education3,

    topik: form.topikLevel,
    ska: form.skaLevel,
    kiip: form.kiipLevel,
    ielts: form.ieltsLevel,
    toefl: form.toefl,
    toefl_ibt: form.toeflIbt,
    cefr: form.cefr,
    teps: form.teps,
    new_teps: form.newTeps,

    refund_name: form.refundName,
    refund_dob: normalizeDate(form.refundDateOfBirth),
    refund_email: form.refundEmail,
    account_holder: form.accountHolder,
    relationship: form.relationshipWithApplicant,
    beneficiary_address: form.beneficiaryAddress,
    beneficiary_city: form.beneficiaryCity,
    beneficiary_country: form.beneficiaryCountry,
    bank_name: form.bankName,
    bank_address: form.bankAddress,
    bank_city: form.bankCity,
    bank_country: form.bankCountry,
    account_number: form.accountNumber,
    swift_code: form.swiftCode,

    personal_statement_1: form.personal_statement_1,
    personal_statement_2: form.personal_statement_2,
    personal_statement_3: form.personal_statement_3,
    personal_statement_4: form.personal_statement_4,

    agree_personal_info: form.agree_personal_info ? "agree" : "disagree",
    acknowledge_notice: form.acknowledge_notice ? "yes" : "no",

    bank_certificate_holder_type: form.bank_certificate_holder_type,

    guarantor_department_major: form.guarantor_department_major,
    guarantor_applicant_name: form.guarantor_applicant_name,
    guarantor_applicant_nationality: normalizeCountryInput(
  form.guarantor_applicant_nationality
),
    guarantor_applicant_id_number: form.guarantor_applicant_id_number,
    guarantor_applicant_passport_number: form.guarantor_applicant_passport_number,

    guarantor_name: form.guarantor_name,
    guarantor_relationship: form.guarantor_relationship,
    guarantor_id_number: form.guarantor_id_number,
    guarantor_occupation: form.guarantor_occupation,
    guarantor_address: form.guarantor_address,
    guarantor_home_contact: form.guarantor_home_contact,
    guarantor_mobile: form.guarantor_mobile_email,
    guarantor_email: form.guarantor_mobile_email,
    guarantor_mobile_email: form.guarantor_mobile_email,
    guarantor_work: form.guarantor_work_contact,
    guarantor_work_contact: form.guarantor_work_contact,

    applicant_signature_method: form.applicant_signature_method,
    guarantor_signature_method: form.guarantor_signature_method,
    applicant_uploaded_signature: applicantUploadedSignature,
    applicant_drawn_signature: applicantDrawnSignature,
    guarantor_uploaded_signature: guarantorUploadedSignature,
    guarantor_drawn_signature: guarantorDrawnSignature,
    application_form_updated_at: new Date().toISOString(),
  };
};

const uploadApplicationFiles = async (applicationId, publicId) => {
  const entries = Object.entries(uploadedMaterials);

  for (const [fileType, files] of entries) {
    if (!files || files.length === 0) continue;

    const invalidMessages = [];
    for (const file of files) {
      const errorMessage = validateUploadFile(file);
      if (errorMessage) {
        invalidMessages.push(errorMessage);
      }
    }

    if (invalidMessages.length > 0) {
      throw new Error(invalidMessages.join("\n"));
    }

    await supabase
      .from("application_files")
      .delete()
      .eq("application_id", applicationId)
      .eq("file_type", fileType);

    for (const file of files) {
      const safeName = `${Date.now()}-${sanitizeFileName(file.name)}`;
      const filePath = `${publicId}/${fileType}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("application-files")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        throw new Error(
          `文件「${file.name}」上传失败，请检查网络后重试。原始错误：${uploadError.message}`
        );
      }

      const passportOcrFields =
        fileType === "passport" && passportOcrResult?.success
          ? {
              ocr_passport_name: passportOcrResult.passport_name || null,
              ocr_passport_no: passportOcrResult.passport_no || null,
              ocr_date_of_birth: passportOcrResult.date_of_birth || null,
              ocr_checked_at: new Date().toISOString(),
              ocr_raw_fields: Array.isArray(passportOcrResult.raw_fields)
                ? passportOcrResult.raw_fields
                : [],
            }
          : {};

      const { error: insertFileError } = await supabase
        .from("application_files")
        .insert([
          {
            application_id: applicationId,
            public_id: publicId,
            file_type: fileType,
            file_name: file.name,
            file_path: filePath,
            review_status: "uploaded",
            review_note: "",
            ...passportOcrFields,
          },
        ]);

      if (insertFileError) {
        throw new Error(
          `文件「${file.name}」上传成功，但写入材料记录失败：${insertFileError.message}`
        );
      }
    }
  }
};

const releaseEditLock = async () => {
  try {
    if (!applicationId || !agencySession?.agency_account_id) return;

    await supabase
      .from("applications")
      .update({
        editing_by_account_id: null,
        editing_by_account_name: null,
        editing_started_at: null,
      })
      .eq("id", applicationId)
      .eq("editing_by_account_id", agencySession.agency_account_id);
  } catch (error) {
    console.error("releaseEditLock error:", error);
  }
};

const loadExistingUploadedFiles = async (publicId) => {
  if (!publicId) return;

  const { data: fileRows, error } = await supabase
    .from("application_files")
    .select("*")
    .eq("public_id", publicId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  const groupedFiles = (fileRows || []).reduce((acc, file) => {
    if (!acc[file.file_type]) acc[file.file_type] = [];
    acc[file.file_type].push(file);
    return acc;
  }, {});

  setExistingUploadedFiles(groupedFiles);
};

const removeExistingUploadedFile = async (fileType, fileRow) => {
  try {
    const targetPublicId = applicationPublicId || editingPublicId;

    if (!targetPublicId) {
      alert("缺少申请标识，无法删除已上传文件。");
      return;
    }

    const confirmed = window.confirm(
      `确定要删除已上传文件“${fileRow.file_name || "未命名文件"}”吗？`
    );
    if (!confirmed) return;

    if (fileRow.file_path) {
      const { error: storageError } = await supabase.storage
        .from("application-files")
        .remove([fileRow.file_path]);

      if (storageError) throw storageError;
    }

    const { error: deleteError } = await supabase
      .from("application_files")
      .delete()
      .eq("id", fileRow.id);

    if (deleteError) throw deleteError;

    await loadExistingUploadedFiles(targetPublicId);

    if (fileType === "passport") {
      const currentNewPassport = uploadedMaterials.passport?.[0];

      if (currentNewPassport) {
        runPassportOcrCheck(currentNewPassport);
      } else {
        const remainingPassportFiles =
          (existingUploadedFiles.passport || []).filter(
            (item) => item.id !== fileRow.id
          );

        if (remainingPassportFiles.length === 0) {
          setPassportOcrResult(null);
          setPassportCheckWarnings([]);
        }
      }
    }

    alert(language === "en" ? "Uploaded file deleted." : language === "ko" ? "업로드된 파일이 삭제되었습니다." : "已上传文件已删除");
  } catch (error) {
    console.error("removeExistingUploadedFile error:", error);
    alert(`删除已上传文件失败：${error.message}`);
  }
};

const clearUploadedMaterialSelections = () => {
  setUploadedMaterials({});
};

useEffect(() => {
  const handleBeforeUnload = () => {
    if (!applicationId || !agencySession?.agency_account_id) return;

    const payload = JSON.stringify({
      id: applicationId,
      agency_account_id: agencySession.agency_account_id,
    });

    navigator.sendBeacon?.("/api/application-release-lock", payload);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    releaseEditLock();
  };
}, [applicationId, agencySession]);

const handleSaveDraft = async () => {
  try {
    if (isMaterialOnlyMode && applicationId && selectedIntakeId) {
      const intakeStatus = await fetchIntakeStatus(selectedIntakeId);

      if (
        intakeStatus.closed &&
        intakeStatus.row?.post_deadline_material_edit_enabled !== true
      ) {
        alert(
          language === "en"
            ? "Post-deadline material editing is not enabled for this application."
            : language === "ko"
            ? "이 지원서는 마감 후 서류 보완 권한이 활성화되어 있지 않습니다."
            : "该申请当前未开启截止后补材料权限，无法继续保存。"
        );
        return;
      }
    }

    if (!agencySession?.agency_id || !agencySession?.agency_account_id) {
  alert("当前机构登录状态无效，请重新登录后再保存草稿");
  return;
}
    if (!applicationId) {
  const publicId = buildPublicId();
  const payload = {
  ...buildApplicationPayload("draft", publicId),
  student_fill_token: buildStudentFillToken(),
  student_form_status: "not_started",
  institution_locked: false,
  editing_by_account_id: agencySession.agency_account_id,
  editing_by_account_name: getCurrentEditorName(),
  editing_started_at: new Date().toISOString(),
  last_saved_by_account_id: agencySession.agency_account_id,
  last_saved_by_account_name: getCurrentEditorName(),
};

      const { data, error } = await supabase
        .from("applications")
        .insert([payload])
        .select("id, public_id, updated_at")
        .single();

      if (error) throw error;

      setApplicationId(data.id);
      setLoadedUpdatedAt(data.updated_at || "");
      setApplicationPublicId(data.public_id);
      setStudentFillToken(payload.student_fill_token || "");
      setStudentFillEnabled(true);

      await uploadApplicationFiles(data.id, data.public_id);
await loadExistingUploadedFiles(data.public_id);
clearUploadedMaterialSelections();

      alert(language === "en" ? "Draft saved." : language === "ko" ? "초안이 저장되었습니다." : "草稿已保存");
      return;
    }

    const payload = buildApplicationPayload("draft");

const updatePayload = {
  ...payload,
  editing_by_account_id: agencySession.agency_account_id,
  editing_by_account_name: getCurrentEditorName(),
  editing_started_at: new Date().toISOString(),
  last_saved_by_account_id: agencySession.agency_account_id,
  last_saved_by_account_name: getCurrentEditorName(),
};

const { data, error } = await supabase
  .from("applications")
  .update(updatePayload)
  .eq("id", applicationId)
  .eq("updated_at", loadedUpdatedAt)
  .select("updated_at")
  .maybeSingle();

if (error) throw error;

if (!data) {
  alert(language === "en" ? "This application was updated by another account. Please refresh and continue editing." : language === "ko" ? "다른 계정이 이 지원서를 업데이트했습니다. 새로고침 후 다시 수정하세요." : "该申请已被其他账号更新，请刷新后再继续编辑。");
  return;
}

setLoadedUpdatedAt(data.updated_at || "");

await uploadApplicationFiles(
  applicationId,
  applicationPublicId || editingPublicId
);
await loadExistingUploadedFiles(applicationPublicId || editingPublicId);
clearUploadedMaterialSelections();

    alert(language === "en" ? "Draft updated." : language === "ko" ? "초안이 업데이트되었습니다." : "草稿已更新");
  } catch (error) {
    console.error(error);
    alert(`保存草稿失败：${error.message}`);
  }
};

const handleSubmit = async () => {
  try {
        if (selectedIntakeId) {
      const intakeStatus = await fetchIntakeStatus(selectedIntakeId);

      if (intakeStatus.closed && !isMaterialOnlyMode) {
        alert(
          language === "en"
            ? "This intake is already closed. Submission is no longer allowed."
            : language === "ko"
            ? "해당 차수는 이미 마감되어 더 이상 제출할 수 없습니다."
            : "该批次已截止，不能继续提交申请。"
        );
        return;
      }

      if (
        intakeStatus.closed &&
        isMaterialOnlyMode &&
        intakeStatus.row?.post_deadline_material_edit_enabled !== true
      ) {
        alert(
          language === "en"
            ? "Post-deadline material editing is not enabled for this application."
            : language === "ko"
            ? "이 지원서는 마감 후 서류 보완 권한이 활성화되어 있지 않습니다."
            : "该申请当前未开启截止后补材料权限，无法继续提交。"
        );
        return;
      }
    }

    if (!agencySession?.agency_id || !agencySession?.agency_account_id) {
  alert("当前机构登录状态无效，请重新登录后再提交申请");
  return;
}
    if (!selectedIntakeId) {
  alert(language === "en" ? "There is no available intake for submission right now. Please save a draft first." : language === "ko" ? "현재 제출 가능한 차수가 없습니다. 먼저 초안으로 저장하세요." : "当前没有可提交的批次，请先保存草稿，待开放后再提交，或选择提交批次。");
  return;
}
    if (!applicationId) {
      const publicId = buildPublicId();
      const payload = {
  ...buildApplicationPayload("submitted", publicId),
  student_fill_token: buildStudentFillToken(),
  student_form_status: "not_started",
  institution_locked: false,
  last_saved_by_account_id: agencySession.agency_account_id,
  last_saved_by_account_name: getCurrentEditorName(),
};

      const { data, error } = await supabase
        .from("applications")
        .insert([payload])
        .select("id, public_id, updated_at")
        .single();

      if (error) throw error;

      setApplicationId(data.id);
      setLoadedUpdatedAt(data.updated_at || "");
      setApplicationPublicId(data.public_id);
      setStudentFillToken(payload.student_fill_token || "");
      setStudentFillEnabled(true);

      await uploadApplicationFiles(data.id, data.public_id);
await loadExistingUploadedFiles(data.public_id);
clearUploadedMaterialSelections();

      alert(language === "en" ? "Application submitted." : language === "ko" ? "지원서가 제출되었습니다." : "申请已提交");
      return;
    }

    const payload = buildApplicationPayload("submitted");

const updatePayload = {
  ...payload,
  editing_by_account_id: null,
  editing_by_account_name: null,
  editing_started_at: null,
  last_saved_by_account_id: agencySession.agency_account_id,
  last_saved_by_account_name: getCurrentEditorName(),
};

const { data, error } = await supabase
  .from("applications")
  .update(updatePayload)
  .eq("id", applicationId)
  .eq("updated_at", loadedUpdatedAt)
  .select("updated_at")
  .maybeSingle();

if (error) throw error;

if (!data) {
  alert(language === "en" ? "This application was updated by another account. Please refresh before submission." : language === "ko" ? "다른 계정이 이 지원서를 업데이트했습니다. 새로고침 후 다시 제출하세요." : "该申请已被其他账号更新，请刷新后再提交。");
  return;
}

setLoadedUpdatedAt(data.updated_at || "");

    await uploadApplicationFiles(
  applicationId,
  applicationPublicId || editingPublicId
);
await loadExistingUploadedFiles(applicationPublicId || editingPublicId);
clearUploadedMaterialSelections();

    alert(language === "en" ? "Application submitted." : language === "ko" ? "지원서가 제출되었습니다." : "申请已提交");
  } catch (error) {
    console.error(error);
    alert((language === "en" ? "Submission failed: " : language === "ko" ? "제출 실패: " : "提交失败：") + error.message);
  }
};

const handleToggleStudentFill = async (enabled) => {
  try {
    let targetId = applicationId;

    if (!targetId && (applicationPublicId || editingPublicId)) {
      const { data, error } = await supabase
        .from("applications")
        .select("id")
        .eq("public_id", applicationPublicId || editingPublicId)
        .single();

      if (error) throw error;
      targetId = data?.id || "";
    }

    if (!targetId) {
      alert(language === "en" ? "Please save the draft first before changing the student fill setting." : language === "ko" ? "학생 작성 기능을 변경하기 전에 먼저 초안을 저장하세요." : "请先保存草稿后，再操作学生填写开关。");
      return;
    }

    const { error } = await supabase
      .from("applications")
      .update({
        student_fill_enabled: enabled,
      })
      .eq("id", targetId);

    if (error) throw error;

    setApplicationId(targetId);
    setStudentFillEnabled(enabled);

    alert(enabled ? (language === "en" ? "Student fill enabled." : language === "ko" ? "학생 작성이 활성화되었습니다." : "已开启学生填写") : (language === "en" ? "Student fill disabled." : language === "ko" ? "학생 작성이 비활성화되었습니다." : "已关闭学生填写"));
  } catch (error) {
    console.error("handleToggleStudentFill error:", error);
    alert((language === "en" ? "Action failed: " : language === "ko" ? "작업 실패: " : "操作失败：") + error.message);
  }
};

if (sessionLoading) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="rounded-2xl bg-white px-6 py-5 text-sm text-slate-600 shadow-sm">
        {t.common.loadingAgency}
      </div>
    </div>
  );
}

  return (
    <div className="space-y-6">
  {isMaterialOnlyMode ? (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      {t.common.materialOnlyBanner}
    </div>
  ) : null}
      {studentFillToken ? (
  <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-emerald-800">
          {t.common.studentFillLink}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {t.common.currentStatus}：
          <span
            className={`ml-2 font-semibold ${
              studentFillEnabled ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {studentFillEnabled ? t.common.enabled : t.common.disabled}
          </span>
        </div>
      </div>
    </div>

    <div className="mt-2 break-all rounded-xl bg-white px-4 py-3 text-sm text-slate-700">
      {studentFillLink}
    </div>

    <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <QRCodeCanvas
          value={studentFillLink}
          size={180}
          includeMargin={true}
        />
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(studentFillLink);
              alert(t.common.copyLinkSuccess);
            } catch (error) {
              console.error(error);
              alert(t.common.copyLinkFailed);
            }
          }}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {t.common.copyLink}
        </button>

        <button
          type="button"
          onClick={() => {
            const canvas = document.querySelector("canvas");
            if (!canvas) {
              alert(t.common.qrNotReady);
              return;
            }

            const url = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = url;
            a.download = "student-application-qrcode.png";
            a.click();
          }}
          className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100"
        >
          {t.common.downloadQr}
        </button>

        {studentFillEnabled ? (
          <button
            type="button"
            onClick={() => handleToggleStudentFill(false)}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {t.common.closeStudentFill}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleToggleStudentFill(true)}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {t.common.reopenStudentFill}
          </button>
        )}
      </div>
    </div>
  </div>
) : null}
      <SectionCard
        title={t.common.newApplication}
        desc={t.sections.mainDesc}
      >
        <div className="flex flex-wrap gap-3">
          {steps.map((label, index) => {
  const disabled = isMaterialOnlyMode && !MATERIAL_ONLY_ALLOWED_STEPS.includes(index);

  return (
    <button
      key={label}
      type="button"
      onClick={() => {
        if (disabled) return;
        setCurrentStep(index);
      }}
      disabled={disabled}
      className={[
        "rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap",
        currentStep === index
          ? "bg-emerald-600 text-white"
          : currentStep > index
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-200 text-slate-600 hover:bg-slate-300",
        disabled ? "cursor-not-allowed opacity-40 hover:bg-slate-200" : "",
      ].join(" ")}
    >
      {index + 1}. {label}
    </button>
  );
})}
        </div>
      </SectionCard>

      {currentStep === 0 && !isMaterialOnlyMode && (
        <SectionCard
          title={t.sections.step1Title}
          desc={t.sections.step1Desc}
        >
          <div className="mb-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
  <div>
    {t.common.openIntake}：
    <span className="ml-2 font-semibold text-slate-900">
      {currentIntakeLabel || t.common.noOpenIntake}
    </span>
  </div>

  <div className="mt-2">
    {t.common.submitIntake}：
    <span className="ml-2 font-semibold text-slate-900">
      {selectedIntakeLabel || t.common.noSelectedIntake}
    </span>
  </div>

  {!currentIntakeId ? (
    <div className="mt-2 text-amber-600">
      {t.common.noIntakeHint}
    </div>
  ) : null}
</div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Input
              label={t.fields.major}
              required
              value={form.major}
              onChange={(e) => updateField("major", e.target.value)}
              placeholder={t.fields.majorPlaceholder}
            />
            <Select
              label={t.fields.admissionType}
              required
              value={form.admissionType}
              onChange={(e) => updateField("admissionType", e.target.value)}
              options={admissionTypeOptions}
            t={t}
            />
            <Select
              label={t.fields.programTrack}
              required
              value={form.programTrack}
              onChange={(e) => updateField("programTrack", e.target.value)}
              options={programTrackOptions}
            t={t}
            />
            <RadioGroup
              label={t.fields.dormitory}
              required
              value={form.dormitory}
              onChange={(value) => updateField("dormitory", value)}
              options={yesNoOptions}
            />
          </div>
        </SectionCard>
      )}

      {currentStep === 1 && !isMaterialOnlyMode && (
        <SectionCard
          title={t.sections.step2Title}
          desc={t.sections.step2Desc}
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Input
              label={t.fields.fullNamePassport}
              required
              value={form.fullNamePassport}
              onChange={(e) => updateField("fullNamePassport", e.target.value)}
              placeholder={t.fields.fullNamePassportPlaceholder}
            />
            <RadioGroup
              label={t.fields.sex}
              required
              value={form.sex}
              onChange={(value) => updateField("sex", value)}
              options={sexOptions}
            />
            <div>
  <Label required>{t.fields.nationalityApplicant}</Label>
  <input
    value={form.nationalityApplicant}
    onChange={(e) =>
      updateCountryField("nationalityApplicant", e.target.value)
    }
    onBlur={() => normalizeCountryField("nationalityApplicant")}
    placeholder={t.fields.nationalityApplicantPlaceholder}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
  />
</div>
            <div>
  <Label>{t.fields.nationalityFather}</Label>
  <input
    value={form.nationalityFather}
    onChange={(e) => updateCountryField("nationalityFather", e.target.value)}
    onBlur={() => normalizeCountryField("nationalityFather")}
    placeholder={t.fields.nationalityFatherPlaceholder}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
  />
</div>
            <div>
  <Label>{t.fields.nationalityMother}</Label>
  <input
    value={form.nationalityMother}
    onChange={(e) => updateCountryField("nationalityMother", e.target.value)}
    onBlur={() => normalizeCountryField("nationalityMother")}
    placeholder={t.fields.nationalityMotherPlaceholder}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
  />
</div>
            <Input
              label={t.fields.passportNo}
              required
              value={form.passportNo}
              onChange={(e) => updateField("passportNo", e.target.value)}
              placeholder={t.fields.passportNoPlaceholder}
            />
            <Input
              label={t.fields.alienRegistrationNo}
              value={form.alienRegistrationNo}
              onChange={(e) =>
                updateField("alienRegistrationNo", e.target.value)
              }
              placeholder={t.fields.alienRegistrationNoPlaceholder}
            />
            <Input
              label={t.fields.refundDob}
              required
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
            />
            <Input
              label={t.fields.tel}
              required
              value={form.tel}
              onChange={(e) => updateField("tel", e.target.value)}
              placeholder={t.fields.telPlaceholder}
            />
            <Input
              label="E-mail"
              required
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder={t.fields.emailPlaceholder}
            />
            <div className="md:col-span-2 xl:col-span-2">
              <Input
                label={t.fields.address}
                required
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder={t.fields.addressPlaceholder}
              />
            </div>
            <div className="xl:col-span-3">
              <RadioGroup
                label={t.fields.residenceStatus}
                value={form.residenceStatus}
                onChange={(value) => updateField("residenceStatus", value)}
                options={residenceOptions}
                required
              />
            </div>
          </div>
        </SectionCard>
      )}

      {currentStep === 2 && !isMaterialOnlyMode && (
        <div className="space-y-6">
          <SectionCard
            title={t.sections.step3Title}
            desc={t.sections.step3Desc}
          >
            <div className="space-y-5">
              {form.educationRows.map((row, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="mb-4 text-sm font-semibold text-slate-700">
                    {t.common.educationRecord} {index + 1}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Input
                      label={t.fields.educationStart}
                      type="date"
                      value={row.startDate}
                      onChange={(e) =>
                        updateEducationRow(index, "startDate", e.target.value)
                      }
                    />
                    <Input
                      label={t.fields.educationEnd}
                      type="date"
                      value={row.endDate}
                      onChange={(e) =>
                        updateEducationRow(index, "endDate", e.target.value)
                      }
                    />
                    <Input
                      label={t.fields.institution}
                      value={row.institution}
                      onChange={(e) =>
                        updateEducationRow(index, "institution", e.target.value)
                      }
                      placeholder={t.fields.institutionPlaceholder}
                    />
                    <Input
                      label={t.fields.eduLocation}
                      value={row.location}
                      onChange={(e) =>
                        updateEducationRow(index, "location", e.target.value)
                      }
                      placeholder={t.fields.eduLocationPlaceholder}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={t.sections.languageTitle}
            desc={t.sections.languageDesc}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label="TOPIK Level"
                value={form.topikLevel}
                onChange={(e) => updateField("topikLevel", e.target.value)}
              />
              <Input
                label="세종학당 (SKA) Level"
                value={form.skaLevel}
                onChange={(e) => updateField("skaLevel", e.target.value)}
              />
              <Input
                label="사회통합프로그램 (KIIP) Level"
                value={form.kiipLevel}
                onChange={(e) => updateField("kiipLevel", e.target.value)}
              />
              <Input
                label="IELTS"
                value={form.ieltsLevel}
                onChange={(e) => updateField("ieltsLevel", e.target.value)}
              />
              <Input
                label="TOEFL"
                value={form.toefl}
                onChange={(e) => updateField("toefl", e.target.value)}
              />
              <Input
                label="TOEFL iBT"
                value={form.toeflIbt}
                onChange={(e) => updateField("toeflIbt", e.target.value)}
              />
              <Input
                label="CEFR"
                value={form.cefr}
                onChange={(e) => updateField("cefr", e.target.value)}
              />
              <Input
                label="TEPS"
                value={form.teps}
                onChange={(e) => updateField("teps", e.target.value)}
              />
              <Input
                label="NEW TEPS"
                value={form.newTeps}
                onChange={(e) => updateField("newTeps", e.target.value)}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <SectionCard
            title={t.sections.step4Title}
            desc={t.sections.step4Desc}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label={t.fields.refundName}
                required
                value={form.refundName}
                onChange={(e) => updateField("refundName", e.target.value)}
                placeholder={t.fields.refundNamePlaceholder}
              />
              <Input
                label={t.fields.refundDob}
                required
                type="date"
                value={form.refundDateOfBirth}
                onChange={(e) =>
                  updateField("refundDateOfBirth", e.target.value)
                }
              />
              <Input
                label={t.fields.refundEmail}
                required
                type="email"
                value={form.refundEmail}
                onChange={(e) => updateField("refundEmail", e.target.value)}
                placeholder={t.fields.refundEmailPlaceholder}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t.sections.beneficiaryTitle}
            desc={t.sections.beneficiaryDesc}
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label={t.fields.accountHolder}
                required
                value={form.accountHolder}
                onChange={(e) => updateField("accountHolder", e.target.value)}
                placeholder={t.fields.accountHolderPlaceholder}
              />
              <Input
                label={t.fields.relationshipWithApplicant}
                required
                value={form.relationshipWithApplicant}
                onChange={(e) =>
                  updateField("relationshipWithApplicant", e.target.value)
                }
                placeholder={t.fields.relationshipWithApplicantPlaceholder}
              />
              <Input
                label={t.fields.country}
                required
                value={form.beneficiaryCountry}
                onChange={(e) =>
                  updateField("beneficiaryCountry", e.target.value)
                }
                placeholder={t.fields.countryPlaceholder}
              />
              <Input
                label={t.fields.city}
                required
                value={form.beneficiaryCity}
                onChange={(e) => updateField("beneficiaryCity", e.target.value)}
                placeholder={t.fields.cityPlaceholder}
              />
              <div className="md:col-span-2 xl:col-span-2">
                <Input
                  label={t.fields.address}
                  required
                  value={form.beneficiaryAddress}
                  onChange={(e) =>
                    updateField("beneficiaryAddress", e.target.value)
                  }
                  placeholder="地址"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="2-2. 은행 정보 (Bank Information)"
            desc="退款银行信息。"
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input
                label={t.fields.bankName}
                required
                value={form.bankName}
                onChange={(e) => updateField("bankName", e.target.value)}
                placeholder={t.fields.bankNamePlaceholder}
              />
              <Input
                label={t.fields.country}
                required
                value={form.bankCountry}
                onChange={(e) => updateField("bankCountry", e.target.value)}
                placeholder={t.fields.bankCountryPlaceholder}
              />
              <Input
                label={t.fields.city}
                required
                value={form.bankCity}
                onChange={(e) => updateField("bankCity", e.target.value)}
                placeholder={t.fields.bankCityPlaceholder}
              />
              <div className="md:col-span-2 xl:col-span-2">
                <Input
                  label={t.fields.bankAddress}
                  required
                  value={form.bankAddress}
                  onChange={(e) => updateField("bankAddress", e.target.value)}
                  placeholder={t.fields.bankAddressPlaceholder}
                />
              </div>
              <Input
                label={t.fields.accountNumber}
                required
                value={form.accountNumber}
                onChange={(e) => updateField("accountNumber", e.target.value)}
                placeholder={t.fields.accountNumberPlaceholder}
              />
              <Input
                label="SWIFT Code"
                required
                value={form.swiftCode}
                onChange={(e) => updateField("swiftCode", e.target.value)}
                placeholder="SWIFT"
              />
            </div>
          </SectionCard>
        </div>
      )}

      {currentStep === 4 && !isMaterialOnlyMode && (
        <SectionCard
          title={t.sections.step5Title}
          desc={t.sections.step5Desc}
        >
          <div className="space-y-6">
            <TextArea
              label={t.fields.q1}
              required
              value={form.personal_statement_1}
onChange={(e) => updateField("personal_statement_1", e.target.value)}
              rows={6}
              placeholder={t.fields.q1Placeholder}
            />
            <TextArea
              label={t.fields.q2}
              required
              value={form.personal_statement_2}
onChange={(e) => updateField("personal_statement_2", e.target.value)}
              rows={6}
              placeholder={t.fields.q2Placeholder}
            />
            <TextArea
              label={t.fields.q3}
              required
              value={form.personal_statement_3}
onChange={(e) => updateField("personal_statement_3", e.target.value)}
              rows={6}
              placeholder={t.fields.q3Placeholder}
            />
            <TextArea
              label={t.fields.q4}
              required
              value={form.personal_statement_4}
onChange={(e) => updateField("personal_statement_4", e.target.value)}
              rows={6}
              placeholder={t.fields.q4Placeholder}
            />
          </div>
        </SectionCard>
      )}

      {currentStep === 5 && (
        <div className="space-y-6">
          <SectionCard
            title={t.sections.step6Title}
            desc={t.sections.step6Desc}
          >
            <div className="space-y-5">
              <RadioGroup
                label={t.fields.agreeInfo}
                value={form.agree_personal_info ? "agree" : "disagree"}
onChange={(value) => updateField("agree_personal_info", value === "agree")}
                options={t.options.agreeOptions}
                required
              />
              <RadioGroup
                label={t.fields.acknowledge}
                value={form.acknowledge_notice ? "yes" : "no"}
onChange={(value) => updateField("acknowledge_notice", value === "yes")}
                options={t.options.acknowledgeOptions}
                required
              />
            </div>
          </SectionCard>

          <SectionCard
            title={t.sections.financialJudgeTitle}
            desc={t.sections.financialJudgeDesc}
          >
            <RadioGroup
              label={t.fields.bankHolderType}
              value={form.bank_certificate_holder_type}
onChange={(value) => updateField("bank_certificate_holder_type", value)}
              options={bankHolderTypes}
              required
            />

            {!financialGuaranteeRequired && (
              <div className="mt-5 rounded-2xl bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {t.common.guarantorSelfHint}
              </div>
            )}
          </SectionCard>

          {financialGuaranteeRequired && (
  <SectionCard
    title={t.sections.guaranteeTitle}
    desc={t.sections.guaranteeDesc}
  >
    <div className="space-y-6">
      <div>
        <h4 className="mb-4 text-base font-bold text-slate-900">
          {t.sections.applicantDetails}
        </h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label={t.fields.guarMajor}
            required
            value={form.guarantor_department_major}
            onChange={(e) =>
              updateField("guarantor_department_major", e.target.value)
            }
          />
          <Input
            label={t.fields.guarApplicantName}
            required
            value={form.guarantor_applicant_name}
            onChange={(e) =>
              updateField("guarantor_applicant_name", e.target.value)
            }
          />
          <div>
  <Label required>{t.fields.guarNationality}</Label>
  <input
    value={form.guarantor_applicant_nationality}
    onChange={(e) =>
      updateCountryField("guarantor_applicant_nationality", e.target.value)
    }
    onBlur={() => normalizeCountryField("guarantor_applicant_nationality")}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
  />
</div>
          <Input
            label={t.fields.guarId}
            value={form.guarantor_applicant_id_number}
            onChange={(e) =>
              updateField("guarantor_applicant_id_number", e.target.value)
            }
          />
          <Input
            label={t.fields.guarPassport}
            required
            value={form.guarantor_applicant_passport_number}
            onChange={(e) =>
              updateField("guarantor_applicant_passport_number", e.target.value)
            }
          />
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-base font-bold text-slate-900">
          {t.sections.guarantorDetails}
        </h4>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label={t.fields.guarName}
            required
            value={form.guarantor_name}
            onChange={(e) => updateField("guarantor_name", e.target.value)}
          />
          <Input
            label={t.fields.guarRelation}
            required
            value={form.guarantor_relationship}
            onChange={(e) =>
              updateField("guarantor_relationship", e.target.value)
            }
          />
          <Input
            label={t.fields.guarId}
            required
            value={form.guarantor_id_number}
            onChange={(e) => updateField("guarantor_id_number", e.target.value)}
          />
          <Input
            label={t.fields.guarOccupation}
            required
            value={form.guarantor_occupation}
            onChange={(e) =>
              updateField("guarantor_occupation", e.target.value)
            }
          />
          <div className="md:col-span-2 xl:col-span-2">
            <Input
              label={t.fields.address}
              required
              value={form.guarantor_address}
              onChange={(e) => updateField("guarantor_address", e.target.value)}
            />
          </div>
          <Input
            label={t.fields.guarHome}
            value={form.guarantor_home_contact}
            onChange={(e) =>
              updateField("guarantor_home_contact", e.target.value)
            }
          />
          <Input
            label={t.fields.guarMobile}
            required
            value={form.guarantor_mobile_email}
            onChange={(e) =>
              updateField("guarantor_mobile_email", e.target.value)
            }
          />
          <Input
            label={t.fields.guarWork}
            value={form.guarantor_work_contact}
            onChange={(e) =>
              updateField("guarantor_work_contact", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  </SectionCard>
)}

          <SectionCard
            title={t.sections.applicantSignTitle}
            desc={t.sections.applicantSignDesc}
          >
            <SignaturePad
              title={t.sections.applicantSignTitle}
              signerName={form.fullNamePassport}
              method={form.applicant_signature_method}
onMethodChange={(value) =>
  updateField("applicant_signature_method", value)
}
              uploadedImage={applicantUploadedSignature}
              onUploadedImageChange={setApplicantUploadedSignature}
              drawnImage={applicantDrawnSignature}
              onDrawnImageChange={setApplicantDrawnSignature}
              t={t}
            />
          </SectionCard>

          {financialGuaranteeRequired && (
            <SectionCard
              title={t.sections.guarantorSignTitle}
              desc={t.sections.guarantorSignDesc}
            >
              <SignaturePad
                title={t.sections.guarantorSignOnlyTitle}
              signerName={form.guarantor_name}
method={form.guarantor_signature_method}
onMethodChange={(value) =>
  updateField("guarantor_signature_method", value)
}
                uploadedImage={guarantorUploadedSignature}
                onUploadedImageChange={setGuarantorUploadedSignature}
                drawnImage={guarantorDrawnSignature}
                onDrawnImageChange={setGuarantorDrawnSignature}
                t={t}
              />
            </SectionCard>
          )}
        </div>
      )}

      {currentStep === 6 && (
        <SectionCard
          title={t.sections.step7Title}
          desc={t.sections.step7Desc}
        >
          <div className="space-y-4">

   {materialItems.map((item) => (
    <MaterialUploadCard
  key={item.key}
  item={item}
  files={uploadedMaterials[item.key] || []}
  existingFiles={existingUploadedFiles[item.key] || []}
  onFilesChange={setMaterialFiles}
  onRemoveSelectedFile={removeSelectedMaterialFile}
  onRemoveExistingFile={removeExistingUploadedFile}
  passportCheckLoading={item.key === "passport" ? passportCheckLoading : false}
  passportWarnings={item.key === "passport" ? displayedPassportWarnings : []}
  t={t}
/>
  ))}

</div>
        </SectionCard>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="text-sm text-slate-500">
          {t.common.currentStep}：<span className="font-semibold text-slate-800">{steps[currentStep]}</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              {t.common.prev}
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200"
          >
            {t.common.saveDraft}
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t.common.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              {t.common.submit}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewApplicationPage;
