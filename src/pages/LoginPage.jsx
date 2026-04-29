import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    heroEyebrow: "Halla University",
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "国际学生申请与材料管理平台，用于处理批次开放、机构账号、学生申请与材料审核。",
    adminTitle: "管理员登录",
    adminDesc: "学校国际处后台入口",
    adminUsernamePlaceholder: "请输入管理员账号",
    adminPasswordPlaceholder: "请输入密码",
    adminButton: "进入管理员后台",
    adminLoading: "登录中...",
    agencyTitle: "机构登录",
    agencyDesc: "合作机构提交与跟进入口",
    agencyUsernamePlaceholder: "请输入机构账号",
    agencyPasswordPlaceholder: "请输入密码",
    agencyButton: "进入机构后台",
    agencyLoading: "登录中...",
    noAgencyAccount: "没有机构账号？",
    registerNow: "立即注册",
    supportNotice:
      "机构账号通过审核后即可登录使用。如需开通新账号，请先完成注册申请。",
    rightTop: "International Admission Platform",
    rightTitle: "国际学生申请与材料管理平台",
    rightDesc:
      "面向正式申请流程的统一入口，覆盖批次、机构、申请与材料审核的核心操作。",
    feature1Title: "批次管理",
    feature1Desc: "按年份与轮次开放申请",
    feature2Title: "机构协作",
    feature2Desc: "统一管理主账号与子账号",
    feature3Title: "申请审核",
    feature3Desc: "集中查看申请状态与材料进度",
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
    heroEyebrow: "Halla University",
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "A unified platform for international admissions, agency collaboration, student applications, and material review.",
    adminTitle: "Admin Login",
    adminDesc: "Portal for the international office",
    adminUsernamePlaceholder: "Enter admin username",
    adminPasswordPlaceholder: "Enter password",
    adminButton: "Enter Admin Console",
    adminLoading: "Signing in...",
    agencyTitle: "Agency Login",
    agencyDesc: "Portal for partner agencies",
    agencyUsernamePlaceholder: "Enter agency username",
    agencyPasswordPlaceholder: "Enter password",
    agencyButton: "Enter Agency Portal",
    agencyLoading: "Signing in...",
    noAgencyAccount: "No agency account?",
    registerNow: "Register Now",
    supportNotice:
      "Approved agency accounts can sign in here. Please complete registration first if you need a new account.",
    rightTop: "International Admission Platform",
    rightTitle: "International Student Application & Materials Platform",
    rightDesc:
      "A launch-ready entry point covering the core workflow for intakes, agencies, applications, and material review.",
    feature1Title: "Intake Management",
    feature1Desc: "Open applications by year and round",
    feature2Title: "Agency Collaboration",
    feature2Desc: "Manage primary and sub-accounts",
    feature3Title: "Application Review",
    feature3Desc: "Track application status and materials",
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
    heroEyebrow: "Halla University",
    heroTitleTop: "Halla",
    heroTitleBottom: "Admission System",
    heroDesc:
      "국제학생 지원, 협력기관 관리, 서류 접수와 심사를 위한 통합 운영 플랫폼입니다.",
    adminTitle: "관리자 로그인",
    adminDesc: "국제처 관리자 전용 입구",
    adminUsernamePlaceholder: "관리자 계정을 입력하세요",
    adminPasswordPlaceholder: "비밀번호를 입력하세요",
    adminButton: "관리자 페이지로 이동",
    adminLoading: "로그인 중...",
    agencyTitle: "기관 로그인",
    agencyDesc: "협력기관 제출 및 확인 입구",
    agencyUsernamePlaceholder: "기관 계정을 입력하세요",
    agencyPasswordPlaceholder: "비밀번호를 입력하세요",
    agencyButton: "기관 페이지로 이동",
    agencyLoading: "로그인 중...",
    noAgencyAccount: "기관 계정이 없으신가요?",
    registerNow: "지금 등록",
    supportNotice:
      "승인된 기관 계정은 바로 로그인할 수 있습니다. 새 계정이 필요하면 먼저 등록 신청을 진행하세요.",
    rightTop: "International Admission Platform",
    rightTitle: "국제학생 지원 및 서류 관리 플랫폼",
    rightDesc:
      "정식 지원 운영을 위한 통합 입구로, 차수 관리부터 기관 협업과 서류 심사까지 핵심 흐름을 담았습니다.",
    feature1Title: "차수 관리",
    feature1Desc: "연도와 회차 기준으로 지원 오픈",
    feature2Title: "기관 협업",
    feature2Desc: "주계정과 부계정을 함께 관리",
    feature3Title: "지원 심사",
    feature3Desc: "지원 상태와 서류 진행 현황 확인",
    alerts: {
      enterAdminUsername: "관리자 계정을 입력하세요",
      enterPassword: "비밀번호를 입력하세요",
      adminApiFormatError: "관리자 로그인 API 응답 형식이 올바르지 않습니다: ",
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

function LoginCard({
  title,
  desc,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  usernamePlaceholder,
  passwordPlaceholder,
  buttonText,
  loadingText,
  loading,
  onSubmit,
  buttonClassName,
}) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{desc}</p>

      <div className="mt-6 space-y-3">
        <input
          value={username}
          onChange={onUsernameChange}
          placeholder={usernamePlaceholder}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />

        <input
          type="password"
          value={password}
          onChange={onPasswordChange}
          placeholder={passwordPlaceholder}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
        />
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={[
          "mt-6 w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-60",
          buttonClassName,
        ].join(" ")}
      >
        {loading ? loadingText : buttonText}
      </button>
    </div>
  );
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
    <div className="min-h-screen bg-[linear-gradient(135deg,#eef4fb_0%,#f8fbff_42%,#0f172a_42%,#111b36_100%)]">
      <div className="absolute right-6 top-6 z-10">
        <div className="rounded-2xl border border-white/20 bg-white px-3 py-3 shadow-sm">
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

      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex items-center justify-center px-6 py-12 lg:px-14">
          <div className="w-full max-w-3xl">
            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                {t.heroEyebrow}
              </p>
              <div className="mt-4 text-5xl font-bold tracking-tight text-slate-900">
                {t.heroTitleTop}
              </div>
              <div className="mt-1 text-3xl font-semibold text-blue-600">
                {t.heroTitleBottom}
              </div>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                {t.heroDesc}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <LoginCard
                title={t.adminTitle}
                desc={t.adminDesc}
                username={adminUsername}
                onUsernameChange={(e) => setAdminUsername(e.target.value)}
                password={adminPassword}
                onPasswordChange={(e) => setAdminPassword(e.target.value)}
                usernamePlaceholder={t.adminUsernamePlaceholder}
                passwordPlaceholder={t.adminPasswordPlaceholder}
                buttonText={t.adminButton}
                loadingText={t.adminLoading}
                loading={adminLoggingIn}
                onSubmit={handleAdminLogin}
                buttonClassName="bg-blue-600 text-white hover:bg-blue-700"
              />

              <LoginCard
                title={t.agencyTitle}
                desc={t.agencyDesc}
                username={agencyUsername}
                onUsernameChange={(e) => setAgencyUsername(e.target.value)}
                password={agencyPassword}
                onPasswordChange={(e) => setAgencyPassword(e.target.value)}
                usernamePlaceholder={t.agencyUsernamePlaceholder}
                passwordPlaceholder={t.agencyPasswordPlaceholder}
                buttonText={t.agencyButton}
                loadingText={t.agencyLoading}
                loading={agencyLoggingIn}
                onSubmit={handleAgencyLogin}
                buttonClassName="bg-slate-900 text-white hover:bg-slate-800"
              />
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
              <span>{t.noAgencyAccount}</span>
              <button
                type="button"
                onClick={() => navigate("/agency-register")}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                {t.registerNow}
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/75 px-5 py-4 text-sm leading-7 text-slate-600 shadow-sm">
              {t.supportNotice}
            </div>
          </div>
        </div>

        <div className="hidden items-center justify-center px-10 lg:flex">
          <div className="w-full max-w-xl">
            <div className="rounded-[36px] border border-white/10 bg-white/6 p-9 text-white shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                {t.rightTop}
              </p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">
                {t.rightTitle}
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-300">
                {t.rightDesc}
              </p>

              <div className="mt-8 space-y-3">
                {[
                  [t.feature1Title, t.feature1Desc],
                  [t.feature2Title, t.feature2Desc],
                  [t.feature3Title, t.feature3Desc],
                ].map(([title, desc]) => (
                  <div
                    key={title}
                    className="flex items-start gap-4 rounded-2xl border border-white/8 bg-white/8 px-4 py-4"
                  >
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {title}
                      </div>
                      <div className="mt-1 text-sm text-slate-300">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
