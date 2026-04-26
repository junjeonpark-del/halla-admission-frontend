import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    title: "机构注册",
    desc: "请填写机构基本信息和主账号信息。提交后需等待管理员审核通过，账号才可启用。",
    backLogin: "返回登录页",
    agencyInfo: "机构基本信息",
    accountInfo: "主账号信息",
    accountDesc: "该账号为机构的初始主账号，审核通过后可用于登录系统。",
    cancel: "取消",
    submitting: "提交中...",
    submit: "提交注册",
    fields: {
      agencyName: "机构名称",
      foundedYear: "公司成立年份",
      licenseNo: "营业执照号",
      legalRep: "法人姓名",
      contactName: "联系人",
      phone: "联系电话",
      email: "机构邮箱",
      licenseFile: "营业执照文件路径",
      username: "登录账号",
      password: "登录密码",
      accountName: "账号姓名",
      accountPhone: "账号电话",
      accountEmail: "账号邮箱",
    },
    placeholders: {
      agencyName: "请输入机构名称",
      foundedYear: "例如 2018",
      licenseNo: "请输入营业执照号",
      legalRep: "请输入法人姓名",
      contactName: "请输入联系人",
      phone: "请输入联系电话",
      email: "请输入机构邮箱",
      licenseFile: "后续接上传功能，这里先留路径",
      username: "请输入登录账号",
      password: "请输入登录密码",
      accountName: "请输入账号姓名",
      accountPhone: "请输入账号电话",
      accountEmail: "请输入账号邮箱",
    },
    alerts: {
      agencyName: "请填写机构名称",
      username: "请填写登录账号",
      password: "请填写登录密码",
      failed: "注册失败",
      success: "注册成功，等待管理员审核通过后启用账号",
      failedWithMessage: (message) => `注册失败：${message}`,
    },
  },
  en: {
    title: "Agency Registration",
    desc: "Please enter the agency information and primary account details. The account will be enabled after administrator approval.",
    backLogin: "Back to Login",
    agencyInfo: "Agency Information",
    accountInfo: "Primary Account",
    accountDesc: "This account will be the initial primary account for the agency and can be used after approval.",
    cancel: "Cancel",
    submitting: "Submitting...",
    submit: "Submit Registration",
    fields: {
      agencyName: "Agency Name",
      foundedYear: "Company Founded Year",
      licenseNo: "Business License No.",
      legalRep: "Legal Representative",
      contactName: "Contact Person",
      phone: "Phone",
      email: "Agency Email",
      licenseFile: "Business License File Path",
      username: "Login Username",
      password: "Login Password",
      accountName: "Account Name",
      accountPhone: "Account Phone",
      accountEmail: "Account Email",
    },
    placeholders: {
      agencyName: "Enter agency name",
      foundedYear: "e.g. 2018",
      licenseNo: "Enter business license number",
      legalRep: "Enter legal representative name",
      contactName: "Enter contact person",
      phone: "Enter phone number",
      email: "Enter agency email",
      licenseFile: "Upload will be added later; enter a file path for now",
      username: "Enter login username",
      password: "Enter login password",
      accountName: "Enter account name",
      accountPhone: "Enter account phone",
      accountEmail: "Enter account email",
    },
    alerts: {
      agencyName: "Please enter the agency name",
      username: "Please enter the login username",
      password: "Please enter the login password",
      failed: "Registration failed",
      success: "Registration submitted. The account will be enabled after administrator approval.",
      failedWithMessage: (message) => `Registration failed: ${message}`,
    },
  },
  ko: {
    title: "기관 등록",
    desc: "기관 기본 정보와 주 계정 정보를 입력해 주세요. 제출 후 관리자 승인이 완료되어야 계정을 사용할 수 있습니다.",
    backLogin: "로그인으로 돌아가기",
    agencyInfo: "기관 기본 정보",
    accountInfo: "주 계정 정보",
    accountDesc: "이 계정은 기관의 초기 주 계정이며, 승인 후 시스템 로그인에 사용할 수 있습니다.",
    cancel: "취소",
    submitting: "제출 중...",
    submit: "등록 제출",
    fields: {
      agencyName: "기관명",
      foundedYear: "회사 설립 연도",
      licenseNo: "사업자등록번호",
      legalRep: "법인 대표자",
      contactName: "담당자",
      phone: "연락처",
      email: "기관 이메일",
      licenseFile: "사업자등록증 파일 경로",
      username: "로그인 계정",
      password: "로그인 비밀번호",
      accountName: "계정 이름",
      accountPhone: "계정 연락처",
      accountEmail: "계정 이메일",
    },
    placeholders: {
      agencyName: "기관명을 입력하세요",
      foundedYear: "예: 2018",
      licenseNo: "사업자등록번호를 입력하세요",
      legalRep: "법인 대표자 이름을 입력하세요",
      contactName: "담당자를 입력하세요",
      phone: "연락처를 입력하세요",
      email: "기관 이메일을 입력하세요",
      licenseFile: "업로드 기능은 추후 연결 예정이며, 우선 경로를 입력하세요",
      username: "로그인 계정을 입력하세요",
      password: "로그인 비밀번호를 입력하세요",
      accountName: "계정 이름을 입력하세요",
      accountPhone: "계정 연락처를 입력하세요",
      accountEmail: "계정 이메일을 입력하세요",
    },
    alerts: {
      agencyName: "기관명을 입력해 주세요",
      username: "로그인 계정을 입력해 주세요",
      password: "로그인 비밀번호를 입력해 주세요",
      failed: "등록 실패",
      success: "등록이 제출되었습니다. 관리자 승인 후 계정이 활성화됩니다.",
      failedWithMessage: (message) => `등록 실패: ${message}`,
    },
  },
};

function readLanguage() {
  try {
    return localStorage.getItem("app_language") || "zh";
  } catch {
    return "zh";
  }
}

function saveLanguage(value) {
  try {
    localStorage.setItem("app_language", value);
  } catch {
    // ignore
  }
}

function getInitialForm() {
  return {
    agency_name: "",
    country: "",
    company_founded_year: "",
    business_license_no: "",
    legal_representative: "",
    contact_name: "",
    phone: "",
    email: "",

    username: "",
    password: "",
    account_name: "",
    account_phone: "",
    account_email: "",
  };
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        placeholder={placeholder}
      />
    </div>
  );
}

function AgencyRegisterPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => readLanguage());
  const [form, setForm] = useState(getInitialForm());
  const [submitting, setSubmitting] = useState(false);

  const t = messages[language] || messages.zh;

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.agency_name.trim()) {
        alert(t.alerts.agencyName);
        return;
      }

      if (!form.username.trim()) {
        alert(t.alerts.username);
        return;
      }

      if (!form.password.trim()) {
        alert(t.alerts.password);
        return;
      }

      setSubmitting(true);

      const response = await fetch("/api/agency-register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.failed);
      }

      alert(result.message || t.alerts.success);
      navigate("/login");
    } catch (error) {
      console.error("AgencyRegisterPage handleSubmit error:", error);
      alert(t.alerts.failedWithMessage(error.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.title}</h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t.desc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                {LANGUAGE_OPTIONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setLanguage(item.value)}
                    className={[
                      "rounded-lg px-3 py-2 text-xs font-semibold transition",
                      language === item.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.backLogin}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="mb-5 text-lg font-bold text-slate-900">
              {t.agencyInfo}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
                            <FormField
                label={t.fields.agencyName}
                value={form.agency_name}
                onChange={(e) => handleChange("agency_name", e.target.value)}
                placeholder={t.placeholders.agencyName}
              />
              <FormField
                label={language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
                value={form.country}
                onChange={(e) => handleChange("country", e.target.value)}
                placeholder={language === "en" ? "Enter country" : language === "ko" ? "국가 입력" : "请输入国家"}
              />
              <FormField
                label={t.fields.foundedYear}
                value={form.company_founded_year}
                onChange={(e) =>
                  handleChange("company_founded_year", e.target.value)
                }
                placeholder={t.placeholders.foundedYear}
              />

              <FormField
                label={t.fields.licenseNo}
                value={form.business_license_no}
                onChange={(e) =>
                  handleChange("business_license_no", e.target.value)
                }
                placeholder={t.placeholders.licenseNo}
              />
              <FormField
                label={t.fields.legalRep}
                value={form.legal_representative}
                onChange={(e) =>
                  handleChange("legal_representative", e.target.value)
                }
                placeholder={t.placeholders.legalRep}
              />
              <FormField
                label={t.fields.contactName}
                value={form.contact_name}
                onChange={(e) => handleChange("contact_name", e.target.value)}
                placeholder={t.placeholders.contactName}
              />
              <FormField
                label={t.fields.phone}
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder={t.placeholders.phone}
              />
              <FormField
                label={t.fields.email}
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder={t.placeholders.email}
              />
              
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-8">
            <h2 className="text-lg font-bold text-slate-900">
              {t.accountInfo}
            </h2>
            <p className="mt-2 text-sm text-slate-500">{t.accountDesc}</p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <FormField
                label={t.fields.username}
                value={form.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder={t.placeholders.username}
              />
              <FormField
                label={t.fields.password}
                type="password"
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={t.placeholders.password}
              />
              <FormField
                label={t.fields.accountName}
                value={form.account_name}
                onChange={(e) => handleChange("account_name", e.target.value)}
                placeholder={t.placeholders.accountName}
              />
              <FormField
                label={t.fields.accountPhone}
                value={form.account_phone}
                onChange={(e) => handleChange("account_phone", e.target.value)}
                placeholder={t.placeholders.accountPhone}
              />
              <FormField
                className="md:col-span-2"
                label={t.fields.accountEmail}
                value={form.account_email}
                onChange={(e) => handleChange("account_email", e.target.value)}
                placeholder={t.placeholders.accountEmail}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
            >
              {t.cancel}
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? t.submitting : t.submit}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgencyRegisterPage;
