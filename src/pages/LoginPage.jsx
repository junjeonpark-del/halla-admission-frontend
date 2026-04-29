import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    brandKo: "한라대학교",
    brandEn: "HALLA UNIVERSITY",
    heroEyebrow: "HALLA UNIVERSITY",
    heroTitlePrimary: "Halla",
    heroTitleAccent: "Admission System",
    heroDesc:
      "国际学生申请与材料管理平台，用于处理批次开放、机构账号、学生申请与材料审核。",
    adminTitle: "管理员登录",
    adminDesc: "学校国际处后台入口",
    agencyTitle: "机构登录",
    agencyDesc: "合作机构提交与跟进入口",
    usernamePlaceholderAdmin: "请输入管理员账号",
    usernamePlaceholderAgency: "请输入机构账号",
    passwordPlaceholder: "请输入密码",
    adminButton: "进入管理员后台",
    agencyButton: "进入机构后台",
    adminLoading: "登录中...",
    agencyLoading: "登录中...",
    registerTitle: "没有机构账号？",
    registerAction: "立即注册",
    registerDesc:
      "机构账号通过审核后即可登录使用。如需开通新账号，请先完成注册申请。",
    featureBadge: "INTERNATIONAL ADMISSION PLATFORM",
    featureTitle: "国际学生申请与材料管理平台",
    featureDesc:
      "面向正式申请流程的统一入口，覆盖批次、机构、申请与材料审核的核心操作。",
    feature1Title: "批次管理",
    feature1Desc: "按年份与批次开放申请",
    feature2Title: "机构协作",
    feature2Desc: "统一管理账号与子账号",
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
    brandKo: "한라대학교",
    brandEn: "HALLA UNIVERSITY",
    heroEyebrow: "HALLA UNIVERSITY",
    heroTitlePrimary: "Halla",
    heroTitleAccent: "Admission System",
    heroDesc:
      "A unified platform for international admissions, agency collaboration, student applications, and material review.",
    adminTitle: "Admin Login",
    adminDesc: "Portal for the international office",
    agencyTitle: "Agency Login",
    agencyDesc: "Portal for partner agencies",
    usernamePlaceholderAdmin: "Enter admin username",
    usernamePlaceholderAgency: "Enter agency username",
    passwordPlaceholder: "Enter password",
    adminButton: "Enter Admin Console",
    agencyButton: "Enter Agency Portal",
    adminLoading: "Signing in...",
    agencyLoading: "Signing in...",
    registerTitle: "No agency account?",
    registerAction: "Register now",
    registerDesc:
      "Agency accounts can sign in after approval. Please complete registration first if you need a new account.",
    featureBadge: "INTERNATIONAL ADMISSION PLATFORM",
    featureTitle: "International Student Application & Materials Platform",
    featureDesc:
      "A unified entry point covering intake management, agency collaboration, student applications, and material review.",
    feature1Title: "Application Intake",
    feature1Desc: "Open and manage rounds by year and intake",
    feature2Title: "Agency Collaboration",
    feature2Desc: "Manage primary and sub-accounts together",
    feature3Title: "Review & Results",
    feature3Desc: "Track application status and material progress",
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
    brandKo: "한라대학교",
    brandEn: "HALLA UNIVERSITY",
    heroEyebrow: "HALLA UNIVERSITY",
    heroTitlePrimary: "Halla",
    heroTitleAccent: "Admission System",
    heroDesc:
      "국제학생 입학 신청부터 서류 관리까지, 한라대학교의 지원 운영을 위한 통합 플랫폼입니다.",
    adminTitle: "관리자 로그인",
    adminDesc: "한라대학교 관리자 전용",
    agencyTitle: "기관 로그인",
    agencyDesc: "협력 기관 담당자 전용",
    usernamePlaceholderAdmin: "관리자 계정을 입력하세요",
    usernamePlaceholderAgency: "기관 계정을 입력하세요",
    passwordPlaceholder: "비밀번호를 입력하세요",
    adminButton: "관리자 로그인",
    agencyButton: "기관 로그인",
    adminLoading: "로그인 중...",
    agencyLoading: "로그인 중...",
    registerTitle: "계정이 없으신가요?",
    registerAction: "지금 등록하기",
    registerDesc:
      "기관 계정은 관리자 승인 후 이용 가능하며, 승인 시 이메일로 안내드립니다.",
    featureBadge: "INTERNATIONAL ADMISSION PLATFORM",
    featureTitle: "국제학생 신청과 서류 관리를 한 곳에서",
    featureDesc:
      "정식 지원 운영을 위한 통합 입구로, 차수 관리부터 기관 협업과 서류 심사까지 핵심 흐름을 담았습니다.",
    feature1Title: "신청 접수",
    feature1Desc: "온라인 입학 신청서 및 필수 서류를 제출합니다.",
    feature2Title: "기관 협업",
    feature2Desc: "협력 기관과의 안전한 데이터 연동 및 신청자 현황을 관리합니다.",
    feature3Title: "심사 및 결과",
    feature3Desc: "신청서 심사 진행 상황을 확인하고 합격 결과를 확인합니다.",
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

function IconShell({ children }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.95),rgba(201,220,255,0.75)_52%,rgba(44,96,255,0.15))] shadow-[0_10px_30px_rgba(24,81,255,0.28)]">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-inner">
        {children}
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AgencyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 11h.01M15 11h.01" />
    </svg>
  );
}

function InputUserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function InputLockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function FeatureCalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </svg>
  );
}

function FeatureUsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.5" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M14 4.13a3.5 3.5 0 0 1 0 5.74" />
    </svg>
  );
}

function FeatureCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M13 5l7 7-7 7" />
    </svg>
  );
}

function BrandBlock({ t }) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-400/20 bg-[radial-gradient(circle_at_35%_35%,rgba(116,214,255,0.35),rgba(28,80,255,0.15)_58%,rgba(8,17,43,0.88))] shadow-[0_0_50px_rgba(36,98,255,0.2)]">
        <div className="text-4xl font-black tracking-tight text-transparent bg-[linear-gradient(180deg,#9ae8ff_0%,#4b83ff_45%,#d6f7ff_100%)] bg-clip-text">
          H
        </div>
      </div>
      <div>
        <div className="text-[2rem] font-black tracking-tight text-white">{t.brandKo}</div>
        <div className="text-sm font-semibold uppercase tracking-[0.28em] text-white/80">
          {t.brandEn}
        </div>
      </div>
    </div>
  );
}

function LanguageSwitcher({ language, onChange }) {
  return (
    <div className="rounded-full border border-white/20 bg-white/95 p-1.5 shadow-[0_16px_40px_rgba(2,8,23,0.25)] backdrop-blur">
      <div className="flex items-center gap-1">
        {LANGUAGE_OPTIONS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={[
              "min-w-[92px] rounded-full px-5 py-3 text-sm font-semibold transition",
              language === item.value
                ? "bg-[linear-gradient(135deg,#2563ff,#0c1733)] text-white shadow-[0_12px_24px_rgba(37,99,255,0.35)]"
                : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginCard({
  icon,
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
    <div className="rounded-[28px] border border-white/14 bg-white/96 p-6 shadow-[0_28px_80px_rgba(9,17,37,0.24)] backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <IconShell>{icon}</IconShell>
        <div className="pt-1">
          <h3 className="text-[1.9rem] font-black tracking-tight text-slate-900">{title}</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">{desc}</p>
        </div>
      </div>

      <div className="mt-7 space-y-3.5">
        <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
          <InputUserIcon />
          <input
            value={username}
            onChange={onUsernameChange}
            placeholder={usernamePlaceholder}
            className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm transition focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-100">
          <InputLockIcon />
          <input
            type="password"
            value={password}
            onChange={onPasswordChange}
            placeholder={passwordPlaceholder}
            className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={[
          "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-base font-bold transition disabled:cursor-not-allowed disabled:opacity-70",
          buttonClassName,
        ].join(" ")}
      >
        <span>{loading ? loadingText : buttonText}</span>
        {!loading ? <ArrowIcon /> : null}
      </button>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="rounded-[26px] border border-white/10 bg-white/6 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,rgba(49,116,255,0.95),rgba(18,64,180,0.95))] shadow-[0_12px_30px_rgba(31,101,255,0.32)]">
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-[1.35rem] font-black tracking-tight text-white">{title}</div>
          <div className="mt-1.5 text-sm leading-7 text-slate-300">{desc}</div>
        </div>
      </div>
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
    <div className="relative min-h-screen overflow-hidden bg-[#061229] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_22%,rgba(30,83,255,0.14),transparent_28%),radial-gradient(circle_at_70%_38%,rgba(66,145,255,0.18),transparent_22%),linear-gradient(180deg,#07122b_0%,#07162e_38%,#08152c_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[46%] bg-[linear-gradient(180deg,rgba(10,25,61,0.96),rgba(6,18,41,0.92))]" />
      <div className="absolute inset-y-0 left-[39%] w-[32%] rotate-[10deg] bg-[linear-gradient(180deg,rgba(41,114,255,0.22),rgba(25,78,195,0.06))] blur-3xl" />
      <div className="absolute left-[34%] top-[14%] h-[580px] w-[580px] rounded-full bg-[radial-gradient(circle,rgba(49,119,255,0.18)_0%,rgba(49,119,255,0.08)_30%,transparent_66%)] blur-3xl" />
      <div className="absolute left-[38%] top-[8.5rem] hidden text-[26rem] font-black leading-none text-white/[0.035] xl:block">
        H
      </div>

      <div className="absolute inset-y-0 right-0 w-[56%] bg-[linear-gradient(180deg,rgba(8,19,46,0.2),rgba(8,19,46,0.72))]" />
      <div className="absolute right-0 top-0 h-full w-[55%] bg-[radial-gradient(circle_at_68%_20%,rgba(62,133,255,0.36),transparent_20%),radial-gradient(circle_at_62%_58%,rgba(49,109,255,0.18),transparent_24%),linear-gradient(180deg,rgba(14,29,63,0.18),rgba(7,17,41,0.7))]" />

      <div className="absolute left-[43%] top-[12%] hidden h-[55vh] w-[24vw] min-w-[280px] rounded-full border border-blue-300/12 bg-[radial-gradient(circle_at_50%_48%,rgba(72,167,255,0.62),rgba(54,123,255,0.16)_36%,transparent_66%)] shadow-[0_0_120px_rgba(43,122,255,0.25)] blur-[2px] xl:block" />
      <div className="absolute left-[48%] top-[18%] hidden h-[42vh] w-[17vw] min-w-[220px] rounded-[42%] border border-blue-200/20 bg-[linear-gradient(180deg,rgba(148,235,255,0.48),rgba(58,137,255,0.12)_28%,rgba(13,32,77,0.06)_60%,rgba(116,225,255,0.36)_100%)] shadow-[0_0_90px_rgba(47,124,255,0.25)] xl:block" />
      <div className="absolute left-[51.5%] top-[18%] hidden h-[42vh] w-[17vw] min-w-[220px] rounded-[42%] border border-blue-200/20 bg-[linear-gradient(180deg,rgba(148,235,255,0.48),rgba(58,137,255,0.12)_28%,rgba(13,32,77,0.06)_60%,rgba(116,225,255,0.36)_100%)] shadow-[0_0_90px_rgba(47,124,255,0.25)] xl:block" />

      <div className="absolute inset-x-0 bottom-0 h-[36%] bg-[linear-gradient(180deg,transparent,rgba(3,9,24,0.4)_35%,rgba(2,7,18,0.8))]" />
      <div className="absolute bottom-0 left-0 h-[34%] w-full bg-[linear-gradient(180deg,transparent,rgba(3,8,21,0.82))]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1720px] flex-col px-8 pb-10 pt-8 lg:px-10 xl:px-14">
        <div className="flex items-start justify-between gap-6">
          <BrandBlock t={t} />
          <LanguageSwitcher language={language} onChange={setLanguage} />
        </div>

        <div className="mt-10 grid flex-1 gap-10 xl:grid-cols-[1.12fr_0.88fr] xl:items-center">
          <div className="max-w-[860px]">
            <div className="max-w-[760px]">
              <div className="text-sm font-semibold uppercase tracking-[0.34em] text-blue-200/80">
                {t.heroEyebrow}
              </div>
              <h1 className="mt-4 text-6xl font-black tracking-tight text-white md:text-7xl">
                <span>{t.heroTitlePrimary}</span>
                <span className="block bg-[linear-gradient(180deg,#53a6ff_0%,#2b76ff_65%,#6fdcff_100%)] bg-clip-text text-transparent">
                  {t.heroTitleAccent}
                </span>
              </h1>
              <p className="mt-7 max-w-[620px] text-xl leading-10 text-slate-200">
                {t.heroDesc}
              </p>
            </div>

            <div className="mt-12 grid gap-5 xl:grid-cols-2">
              <LoginCard
                icon={<UserIcon />}
                title={t.adminTitle}
                desc={t.adminDesc}
                username={adminUsername}
                onUsernameChange={(e) => setAdminUsername(e.target.value)}
                password={adminPassword}
                onPasswordChange={(e) => setAdminPassword(e.target.value)}
                usernamePlaceholder={t.usernamePlaceholderAdmin}
                passwordPlaceholder={t.passwordPlaceholder}
                buttonText={t.adminButton}
                loadingText={t.adminLoading}
                loading={adminLoggingIn}
                onSubmit={handleAdminLogin}
                buttonClassName="bg-[linear-gradient(135deg,#2b76ff,#12357f)] text-white shadow-[0_20px_36px_rgba(37,99,255,0.28)] hover:brightness-110"
              />

              <LoginCard
                icon={<AgencyIcon />}
                title={t.agencyTitle}
                desc={t.agencyDesc}
                username={agencyUsername}
                onUsernameChange={(e) => setAgencyUsername(e.target.value)}
                password={agencyPassword}
                onPasswordChange={(e) => setAgencyPassword(e.target.value)}
                usernamePlaceholder={t.usernamePlaceholderAgency}
                passwordPlaceholder={t.passwordPlaceholder}
                buttonText={t.agencyButton}
                loadingText={t.agencyLoading}
                loading={agencyLoggingIn}
                onSubmit={handleAgencyLogin}
                buttonClassName="bg-[linear-gradient(135deg,#08162f,#0d1d3f)] text-white shadow-[0_20px_36px_rgba(5,12,31,0.25)] hover:brightness-110"
              />
            </div>

            <button
              type="button"
              onClick={() => navigate("/agency-register")}
              className="mt-6 flex w-full max-w-[760px] items-start gap-4 rounded-[26px] border border-white/12 bg-white/6 px-6 py-5 text-left shadow-[0_20px_60px_rgba(2,8,23,0.22)] backdrop-blur-sm transition hover:bg-white/[0.085]"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#1b4de2,#0a255f)] shadow-[0_10px_28px_rgba(31,84,255,0.24)]">
                <FeatureCheckIcon />
              </div>
              <div className="flex-1">
                <div className="text-[1.45rem] font-black tracking-tight text-white">
                  {t.registerTitle}
                  <span className="ml-3 bg-[linear-gradient(180deg,#78c9ff,#2d7cff)] bg-clip-text text-transparent">
                    {t.registerAction}
                  </span>
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-300">{t.registerDesc}</div>
              </div>
              <div className="pt-2">
                <ArrowIcon />
              </div>
            </button>
          </div>

          <div className="flex justify-end xl:justify-center">
            <div className="w-full max-w-[520px] rounded-[34px] border border-white/12 bg-[linear-gradient(180deg,rgba(20,34,71,0.82),rgba(9,20,43,0.84))] px-7 py-8 shadow-[0_30px_90px_rgba(2,8,23,0.34)] backdrop-blur-md">
              <div className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-300">
                {t.featureBadge}
              </div>
              <h2 className="mt-4 text-5xl font-black leading-tight text-white">
                {t.featureTitle}
              </h2>
              <p className="mt-5 text-base leading-8 text-slate-300">{t.featureDesc}</p>

              <div className="mt-8 space-y-4">
                <FeatureCard
                  icon={<FeatureCalendarIcon />}
                  title={t.feature1Title}
                  desc={t.feature1Desc}
                />
                <FeatureCard
                  icon={<FeatureUsersIcon />}
                  title={t.feature2Title}
                  desc={t.feature2Desc}
                />
                <FeatureCard
                  icon={<FeatureCheckIcon />}
                  title={t.feature3Title}
                  desc={t.feature3Desc}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
