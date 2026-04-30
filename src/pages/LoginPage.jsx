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
    registerPrefix: "没有机构账号？",
    registerAction: "立即注册",
    feature1Title: "批次管理",
    feature1Desc: "按年份与批次开放申请",
    feature2Title: "机构协作",
    feature2Desc: "统一管理账号与子账号",
    feature3Title: "申请审核",
    feature3Desc: "集中管理申请状态与材料进度",
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
      "International student application and materials platform for intake opening, agency accounts, student applications, and review.",
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
    registerPrefix: "No agency account?",
    registerAction: "Register now",
    feature1Title: "Intake Management",
    feature1Desc: "Open applications by year and round",
    feature2Title: "Agency Collaboration",
    feature2Desc: "Manage main and sub accounts together",
    feature3Title: "Application Review",
    feature3Desc: "Track status and material progress centrally",
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
      "국제학생 지원 및 서류 관리 플랫폼으로 모집 차수 개방, 기관 계정, 학생 지원 및 서류 심사를 처리합니다.",
    adminTitle: "관리자 로그인",
    adminDesc: "국제처 관리자 페이지 입구",
    agencyTitle: "기관 로그인",
    agencyDesc: "협력 기관 제출 및 관리 입구",
    usernamePlaceholderAdmin: "관리자 계정을 입력하세요",
    usernamePlaceholderAgency: "기관 계정을 입력하세요",
    passwordPlaceholder: "비밀번호를 입력하세요",
    adminButton: "관리자 페이지로 이동",
    agencyButton: "기관 페이지로 이동",
    adminLoading: "로그인 중...",
    agencyLoading: "로그인 중...",
    registerPrefix: "기관 계정이 없으신가요?",
    registerAction: "지금 등록",
    feature1Title: "차수 관리",
    feature1Desc: "연도와 차수별로 지원 접수 개방",
    feature2Title: "기관 협업",
    feature2Desc: "메인 계정과 하위 계정을 함께 관리",
    feature3Title: "지원 심사",
    feature3Desc: "지원 상태와 서류 진행을 한곳에서 확인",
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

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-[#2d6cff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <circle cx="12" cy="8" r="3.8" />
      <path d="M5.5 19.3a7.2 7.2 0 0 1 13 0" />
    </svg>
  );
}

function AgencyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-8 w-8 text-[#2d6cff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M4 20h16" />
      <path d="M6.5 20V7.8L12 5l5.5 2.8V20" />
      <path d="M10 20v-4h4v4" />
      <path d="M9 11h.01M15 11h.01" />
    </svg>
  );
}

function InputUserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.7" />
      <path d="M5.5 19a7.2 7.2 0 0 1 13 0" />
    </svg>
  );
}

function InputLockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 text-slate-400"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5.5" y="11" width="13" height="8.5" rx="2" />
      <path d="M8.2 11V8.5a3.8 3.8 0 1 1 7.6 0V11" />
    </svg>
  );
}

function FeatureDocIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 text-[#2d6cff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M7 3.8h7l4 4V20H7z" />
      <path d="M14 3.8v4h4M9.5 12h5M9.5 16h5" />
    </svg>
  );
}

function FeatureBuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 text-[#2d6cff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M3 20h18" />
      <path d="M5 20V9l7-4 7 4v11" />
      <path d="M9 20v-4h6v4M8 12h.01M12 12h.01M16 12h.01" />
    </svg>
  );
}

function FeatureShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7 text-[#2d6cff]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path d="M12 3.8 19 6v5.8c0 4.3-2.8 7.7-7 8.9-4.2-1.2-7-4.6-7-8.9V6z" />
      <path d="m9.4 12.1 1.8 1.8 3.7-4.1" />
    </svg>
  );
}

function LanguageSwitcher({ language, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white shadow-[0_8px_18px_rgba(46,94,188,0.06)]">
      {LANGUAGE_OPTIONS.map((item, index) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={[
            "relative h-[46px] w-[92px] shrink-0 cursor-pointer px-0 py-0 text-sm font-semibold transition",
            index !== 0 ? "border-l border-slate-200" : "",
            language === item.value
              ? "bg-[linear-gradient(180deg,#3776ff_0%,#1e5dff_100%)] text-white"
              : "text-slate-600 hover:bg-slate-50",
          ].join(" ")}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function BrandBlock({ t }) {
  return (
    <div className="flex items-center gap-4">
      <img
        src="/halla-logo.png"
        alt="Halla University Logo"
        className="h-16 w-auto object-contain"
      />
      <div className="h-7 w-px bg-slate-200" />
      <div className="text-sm font-semibold uppercase tracking-[0.28em] text-[#47557b]">
        {t.brandEn}
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
    <div className="rounded-[26px] border border-white/80 bg-white/86 p-7 shadow-[0_18px_48px_rgba(56,90,165,0.12)] backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[linear-gradient(180deg,#f3f8ff_0%,#eaf2ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
          {icon}
        </div>
        <div>
          <h3 className="text-[1.75rem] font-black tracking-tight text-[#0d1a3f]">
            {title}
          </h3>
          <p className="mt-1 text-[0.95rem] text-[#6f7f9f]">{desc}</p>
        </div>
      </div>

      <div className="mt-6 space-y-3.5">
        <div className="flex items-center gap-3 rounded-2xl border border-[#dbe5f2] bg-white px-4 py-[15px] shadow-[0_2px_10px_rgba(18,46,100,0.03)]">
          <InputUserIcon />
          <input
            value={username}
            onChange={onUsernameChange}
            placeholder={usernamePlaceholder}
            className="w-full border-0 bg-transparent text-[0.98rem] text-slate-700 outline-none placeholder:text-[#9ba9c4]"
          />
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-[#dbe5f2] bg-white px-4 py-[15px] shadow-[0_2px_10px_rgba(18,46,100,0.03)]">
          <InputLockIcon />
          <input
            type="password"
            value={password}
            onChange={onPasswordChange}
            placeholder={passwordPlaceholder}
            className="w-full border-0 bg-transparent text-[0.98rem] text-slate-700 outline-none placeholder:text-[#9ba9c4]"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className={[
          "mt-5 w-full cursor-pointer rounded-2xl px-5 py-3.5 text-[1.02rem] font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-75",
          buttonClassName,
        ].join(" ")}
      >
        {loading ? loadingText : buttonText}
      </button>
    </div>
  );
}

function FeatureItem({ icon, title, desc, bordered = false }) {
  return (
    <div
      className={[
        "flex items-center gap-5 px-8 py-8",
        bordered ? "border-l border-[#e7eef8]" : "",
      ].join(" ")}
    >
      <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f4f8ff_0%,#edf3ff_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
        {icon}
      </div>
      <div>
        <h4 className="text-[1.28rem] font-black tracking-tight text-[#132046]">
          {title}
        </h4>
        <p className="mt-1 text-[0.95rem] leading-7 text-[#70819f]">{desc}</p>
      </div>
    </div>
  );
}

function WatermarkMark() {
  return (
    <div className="pointer-events-none absolute right-[8%] top-[38%] hidden opacity-[0.16] lg:block">
      <div className="relative h-[230px] w-[165px]">
        <div className="absolute left-0 top-0 h-[230px] w-[56px] skew-x-[-14deg] rounded-sm border border-[#bfe4ff] bg-[linear-gradient(180deg,rgba(207,239,255,0.9)_0%,rgba(147,215,255,0.42)_42%,rgba(101,175,255,0.12)_100%)]" />
        <div className="absolute right-0 top-0 h-[230px] w-[56px] skew-x-[14deg] rounded-sm border border-[#bfe4ff] bg-[linear-gradient(180deg,rgba(207,239,255,0.9)_0%,rgba(147,215,255,0.42)_42%,rgba(101,175,255,0.12)_100%)]" />
        <div className="absolute left-[44px] top-[72px] h-[38px] w-[77px] rounded-sm bg-[linear-gradient(180deg,rgba(197,234,255,0.6)_0%,rgba(103,167,255,0.2)_100%)]" />
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
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#edf4ff_52%,#f8fbff_100%)] text-slate-900">
      <div className="h-[14px] w-full bg-[#0e1735]" />

      <div className="relative border-b border-[#e8eef7] bg-white/90 shadow-[0_8px_30px_rgba(61,100,177,0.06)] backdrop-blur-sm">
        <div className="absolute right-[17%] top-0 hidden h-full w-24 skew-x-[38deg] bg-white lg:block" />
        <div className="relative mx-auto flex max-w-[1480px] items-center justify-between px-8 py-7 lg:px-12">
          <BrandBlock t={t} />
          <LanguageSwitcher language={language} onChange={setLanguage} />
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-6%] top-[16%] h-[420px] w-[720px] rotate-[-12deg] rounded-[40px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(223,235,255,0.18)_100%)] shadow-[0_25px_80px_rgba(86,129,207,0.07)]" />
          <div className="absolute left-[-18%] top-[26%] h-[600px] w-[1100px] rounded-full border border-[#d9e8fb] opacity-85" />
          <div className="absolute right-[-12%] top-[18%] h-[580px] w-[1100px] rounded-full border border-[#dce8fb] opacity-70" />
          <div className="absolute left-[8%] top-[40%] h-[260px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(167,199,255,0.26)_0%,rgba(167,199,255,0.08)_44%,transparent_76%)]" />
          <div className="absolute right-[4%] top-[32%] h-[320px] w-[720px] rounded-full bg-[radial-gradient(circle,rgba(190,218,255,0.28)_0%,rgba(190,218,255,0.09)_45%,transparent_76%)]" />
        </div>

        <WatermarkMark />

        <div className="relative mx-auto max-w-[1480px] px-6 pb-14 pt-12 lg:px-10 lg:pt-14">
          <div className="mx-auto max-w-[1160px] text-center">
            <div className="text-[14px] font-semibold uppercase tracking-[0.28em] text-[#576989]">
              {t.heroEyebrow}
            </div>

            <h1 className="mt-5 text-[3.05rem] font-black tracking-tight text-[#121e45] md:text-[3.75rem] lg:text-[4.15rem]">
              <span>{t.heroTitlePrimary} </span>
              <span className="bg-[linear-gradient(180deg,#3b79ff_0%,#1a5cff_100%)] bg-clip-text text-transparent">
                {t.heroTitleAccent}
              </span>
            </h1>

            <div className="mx-auto mt-5 h-1.5 w-[70px] rounded-full bg-[linear-gradient(90deg,#2c70ff_0%,#3b85ff_100%)]" />

            <p className="mx-auto mt-7 max-w-[940px] text-[1.12rem] leading-9 text-[#586b8d]">
              {t.heroDesc}
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-[980px] gap-4 lg:grid-cols-2">
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
              buttonClassName="bg-[linear-gradient(90deg,#3776ff_0%,#1a59fb_100%)] shadow-[0_10px_24px_rgba(45,108,255,0.24)]"
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
              buttonClassName="bg-[linear-gradient(90deg,#16203d_0%,#0e1630_100%)] shadow-[0_10px_24px_rgba(13,23,50,0.18)]"
            />
          </div>

          <div className="mt-7 text-center text-[1.05rem] font-medium text-[#7b89a5]">
            <span>{t.registerPrefix} </span>
            <button
              type="button"
              onClick={() => navigate("/agency-register")}
              className="cursor-pointer font-bold text-[#2568ff] transition hover:text-[#0f52f2]"
            >
              {t.registerAction}
            </button>
          </div>

          <div className="mx-auto mt-10 max-w-[1220px] rounded-[28px] border border-white/80 bg-white/82 shadow-[0_16px_42px_rgba(56,90,165,0.1)] backdrop-blur-sm">
            <div className="grid lg:grid-cols-3">
              <FeatureItem
                icon={<FeatureDocIcon />}
                title={t.feature1Title}
                desc={t.feature1Desc}
              />
              <FeatureItem
                icon={<FeatureBuildingIcon />}
                title={t.feature2Title}
                desc={t.feature2Desc}
                bordered
              />
              <FeatureItem
                icon={<FeatureShieldIcon />}
                title={t.feature3Title}
                desc={t.feature3Desc}
                bordered
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
