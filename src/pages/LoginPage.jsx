import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "国际招生申请管理系统。用于管理申请批次、合作机构、学生申请资料、材料状态、导出数据，以及后续的自动识别与审核流程。",
    adminTitle: "管理员登录",
    adminDesc:
      "学校国际处后台入口，用于管理机构账号、申请批次、学生申请与材料审核。",
    adminUsernamePlaceholder: "请输入管理员账号",
    adminPasswordPlaceholder: "请输入密码",
    adminButton: "进入管理员后台",
    adminLoading: "登录中...",
    agencyTitle: "机构登录",
    agencyDesc:
      "留学机构入口，用于提交学生申请、上传材料、查看审核状态与补件提醒。",
    agencyUsernamePlaceholder: "请输入机构账号",
    agencyPasswordPlaceholder: "请输入密码",
    agencyButton: "进入机构后台",
    agencyLoading: "登录中...",
    noAgencyAccount: "没有机构账号？",
    registerNow: "立即注册",
    demoNotice: "当前阶段为页面骨架演示版本。机构端现已接入自定义后端登录。",
    rightTop: "Halla University",
    rightTitle: "国际学生申请与材料管理平台",
    rightDesc:
      "支持按年份与申请批次管理申请进度，维护合作机构账号，跟踪学生材料提交状态，并为后续 OCR 识别、Excel 导出、Word / PDF 清洁版生成打好基础。",
    feature1Title: "批次管理",
    feature1Desc: "按年份、月份、轮次开放申请",
    feature2Title: "机构管理",
    feature2Desc: "机构审核、主账号与子账号管理",
    feature3Title: "申请管理",
    feature3Desc: "审核学生申请与材料状态",
    alerts: {
      enterAdminUsername: "请输入管理员账号",
      enterPassword: "请输入密码",
      adminApiFormatError: "管理员登录接口返回格式错误：",
      emptyResponse: "空响应",
      adminLoginFailed: "管理员登录失败",
      enterAgencyUsername: "请输入机构账号",
      agencyLoginFailed: "机构登录失败",
    },
  },
  en: {
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "International admission management system for managing intakes, partner agencies, student applications, material status, data export, and future OCR and review workflows.",
    adminTitle: "Admin Login",
    adminDesc:
      "Portal for the university international office to manage agency accounts, intakes, student applications, and material reviews.",
    adminUsernamePlaceholder: "Enter admin username",
    adminPasswordPlaceholder: "Enter password",
    adminButton: "Enter Admin Console",
    adminLoading: "Signing in...",
    agencyTitle: "Agency Login",
    agencyDesc:
      "Portal for agencies to submit student applications, upload materials, check review status, and receive missing document reminders.",
    agencyUsernamePlaceholder: "Enter agency username",
    agencyPasswordPlaceholder: "Enter password",
    agencyButton: "Enter Agency Portal",
    agencyLoading: "Signing in...",
    noAgencyAccount: "No agency account?",
    registerNow: "Register Now",
    demoNotice:
      "This is currently a page-structure demo version. The agency side is already connected to custom backend login.",
    rightTop: "Halla University",
    rightTitle: "International Student Application & Materials Platform",
    rightDesc:
      "Supports intake management by year and round, partner agency management, student material tracking, and provides a foundation for future OCR, Excel export, and clean Word/PDF generation.",
    feature1Title: "Intake Management",
    feature1Desc: "Open applications by year, month, and round",
    feature2Title: "Agency Management",
    feature2Desc: "Agency approval, primary account, and sub-account management",
    feature3Title: "Application Management",
    feature3Desc: "Review student applications and material status",
    alerts: {
      enterAdminUsername: "Please enter the admin username",
      enterPassword: "Please enter the password",
      adminApiFormatError: "Admin login API returned invalid format: ",
      emptyResponse: "empty response",
      adminLoginFailed: "Admin login failed",
      enterAgencyUsername: "Please enter the agency username",
      agencyLoginFailed: "Agency login failed",
    },
  },
  ko: {
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "국제학생 입학 지원 관리 시스템입니다. 지원 차수, 협력 기관, 학생 지원 자료, 서류 상태, 데이터 내보내기 및 향후 OCR·심사 흐름을 관리합니다.",
    adminTitle: "관리자 로그인",
    adminDesc:
      "학교 국제처 관리자용 화면으로 기관 계정, 지원 차수, 학생 지원서 및 서류 심사를 관리합니다.",
    adminUsernamePlaceholder: "관리자 계정을 입력하세요",
    adminPasswordPlaceholder: "비밀번호를 입력하세요",
    adminButton: "관리자 페이지로 이동",
    adminLoading: "로그인 중...",
    agencyTitle: "기관 로그인",
    agencyDesc:
      "유학 기관용 화면으로 학생 지원서 제출, 서류 업로드, 심사 상태 확인 및 보완 요청 확인이 가능합니다.",
    agencyUsernamePlaceholder: "기관 계정을 입력하세요",
    agencyPasswordPlaceholder: "비밀번호를 입력하세요",
    agencyButton: "기관 포털로 이동",
    agencyLoading: "로그인 중...",
    noAgencyAccount: "기관 계정이 없으신가요?",
    registerNow: "지금 등록",
    demoNotice:
      "현재 단계는 페이지 구조 시연 버전입니다. 기관 측 로그인은 이미 커스텀 백엔드와 연동되어 있습니다.",
    rightTop: "Halla University",
    rightTitle: "국제학생 지원 및 서류 관리 플랫폼",
    rightDesc:
      "연도 및 차수별 지원 진행 관리, 협력 기관 계정 관리, 학생 서류 제출 상태 추적을 지원하며 향후 OCR, Excel 내보내기, Word / PDF 정리본 생성의 기반을 제공합니다.",
    feature1Title: "차수 관리",
    feature1Desc: "연도, 월, 차수별로 지원 오픈",
    feature2Title: "기관 관리",
    feature2Desc: "기관 승인, 주계정 및 하위 계정 관리",
    feature3Title: "지원 관리",
    feature3Desc: "학생 지원서 및 서류 상태 심사",
    alerts: {
      enterAdminUsername: "관리자 계정을 입력하세요",
      enterPassword: "비밀번호를 입력하세요",
      adminApiFormatError: "관리자 로그인 응답 형식이 올바르지 않습니다: ",
      emptyResponse: "빈 응답",
      adminLoginFailed: "관리자 로그인 실패",
      enterAgencyUsername: "기관 계정을 입력하세요",
      agencyLoginFailed: "기관 로그인 실패",
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

function LoginPage() {
  const navigate = useNavigate();
  const [language, setLanguage] = useState(() => readLanguage());

  const t = messages[language] || messages.zh;

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  useEffect(() => {
    try {
      const adminRaw = sessionStorage.getItem("admin_session");
      const agencyRaw = sessionStorage.getItem("agency_session");

      if (adminRaw) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (agencyRaw) {
        navigate("/agency/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("LoginPage session redirect error:", error);
    }
  }, [navigate]);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoggingIn, setAdminLoggingIn] = useState(false);

  const [agencyUsername, setAgencyUsername] = useState("");
  const [agencyPassword, setAgencyPassword] = useState("");
  const [agencyLoggingIn, setAgencyLoggingIn] = useState(false);

  const handleAdminLogin = async () => {
    try {
      if (!adminUsername.trim()) {
        alert(t.alerts.enterAdminUsername);
        return;
      }

      if (!adminPassword.trim()) {
        alert(t.alerts.enterPassword);
        return;
      }

      setAdminLoggingIn(true);

      const response = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          `${t.alerts.adminApiFormatError}${text || t.alerts.emptyResponse}`
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.adminLoginFailed);
      }

      if (result.session) {
        sessionStorage.setItem("admin_session", JSON.stringify(result.session));
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("handleAdminLogin error:", error);
      alert(error.message);
    } finally {
      setAdminLoggingIn(false);
    }
  };

  const handleAgencyLogin = async () => {
    try {
      if (!agencyUsername.trim()) {
        alert(t.alerts.enterAgencyUsername);
        return;
      }

      if (!agencyPassword.trim()) {
        alert(t.alerts.enterPassword);
        return;
      }

      setAgencyLoggingIn(true);

      const response = await fetch("/api/agency-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: agencyUsername,
          password: agencyPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.agencyLoginFailed);
      }

      if (result.session) {
        sessionStorage.setItem("agency_session", JSON.stringify(result.session));
      }

      navigate("/agency/dashboard");
    } catch (error) {
      console.error("handleAgencyLogin error:", error);
      alert(error.message);
    } finally {
      setAgencyLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="absolute right-6 top-6 z-10">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
          <div className="grid grid-cols-3 gap-2">
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
        </div>
      </div>

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex items-center justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-8">
              <div className="text-4xl font-bold tracking-tight text-slate-900">
                {t.heroTitleTop}
              </div>
              <div className="mt-1 text-2xl font-semibold text-blue-600">
                {t.heroTitleBottom}
              </div>
              <p className="mt-4 max-w-lg text-sm leading-7 text-slate-500">
                {t.heroDesc}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  {t.adminTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {t.adminDesc}
                </p>

                <div className="mt-6 space-y-3">
                  <input
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder={t.adminUsernamePlaceholder}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={t.adminPasswordPlaceholder}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAdminLogin}
                  disabled={adminLoggingIn}
                  className="mt-6 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {adminLoggingIn ? t.adminLoading : t.adminButton}
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  {t.agencyTitle}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {t.agencyDesc}
                </p>

                <div className="mt-6 space-y-3">
                  <input
                    value={agencyUsername}
                    onChange={(e) => setAgencyUsername(e.target.value)}
                    placeholder={t.agencyUsernamePlaceholder}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <input
                    type="password"
                    value={agencyPassword}
                    onChange={(e) => setAgencyPassword(e.target.value)}
                    placeholder={t.agencyPasswordPlaceholder}
                    className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAgencyLogin}
                  disabled={agencyLoggingIn}
                  className="mt-6 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-200 disabled:opacity-60"
                >
                  {agencyLoggingIn ? t.agencyLoading : t.agencyButton}
                </button>
              </div>
            </div>

            <div className="mt-5 text-sm text-slate-500">
              {t.noAgencyAccount}
              <button
                type="button"
                onClick={() => navigate("/agency-register")}
                className="ml-2 font-semibold text-blue-600 hover:text-blue-700"
              >
                {t.registerNow}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-4 text-sm text-slate-500">
              {t.demoNotice}
            </div>
          </div>
        </div>

        <div className="hidden bg-slate-900 lg:flex lg:items-center lg:justify-center">
          <div className="w-full max-w-lg px-10 text-white">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                {t.rightTop}
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight">
                {t.rightTitle}
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-300">
                {t.rightDesc}
              </p>

              <div className="mt-8 grid gap-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-white">
                    {t.feature1Title}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {t.feature1Desc}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-white">
                    {t.feature2Title}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {t.feature2Desc}
                  </div>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <div className="text-sm font-semibold text-white">
                    {t.feature3Title}
                  </div>
                  <div className="mt-1 text-sm text-slate-300">
                    {t.feature3Desc}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;