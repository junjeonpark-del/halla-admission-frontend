import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AgencySessionContext } from "../contexts/AgencySessionContext";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    brandDesc: "机构申请提交与材料管理",
    menuTitle: "机构菜单",
    systemTitle: "系统",
    logout: "退出登录",
    currentAccount: "当前账号",
    nav: {
      dashboard: "机构仪表盘",
      applications: "我的申请",
      newApplication: "新建申请",
      materials: "材料状态",
      history: "历史申请",
      accounts: "账号管理",
    },
    pages: {
      dashboard: {
        title: "机构主页",
        desc: "查看当前开放批次、申请进度与最近申请情况",
      },
      applications: {
        title: "我的申请",
        desc: "查看当前开放批次下的草稿和已提交申请",
      },
      newApplication: {
        title: "新建申请",
        desc: "按开放批次提交新的学生申请",
      },
      materials: {
        title: "材料状态",
        desc: "查看当前开放批次学生的材料状态和缺件提醒",
      },
      history: {
        title: "历史申请",
        desc: "查看已截止批次的历史申请记录，并按年份、批次进行查询",
      },
      accounts: {
        title: "账号管理",
        desc: "管理当前机构的主账号与子账号",
      },
    },
        enteringAgency: "正在进入机构后台...",
    sessionConflictTitle: "登录状态变更",
    sessionConflictMessage: "该账号已在其他地方登录，当前页面将返回登录页。",
    sessionConflictConfirm: "确定",
  },
  en: {
    brandDesc: "Agency Application Submission and Materials Management",
    menuTitle: "Agency Menu",
    systemTitle: "System",
    logout: "Log Out",
    currentAccount: "Current Account",
    nav: {
      dashboard: "Agency Dashboard",
      applications: "My Applications",
      newApplication: "New Application",
      materials: "Materials Status",
      history: "Application History",
      accounts: "Account Management",
    },
    pages: {
      dashboard: {
        title: "Agency Home",
        desc: "View current open intake, application progress, and recent applications",
      },
      applications: {
        title: "My Applications",
        desc: "View drafts and submitted applications under the current open intake",
      },
      newApplication: {
        title: "New Application",
        desc: "Submit a new student application under the open intake",
      },
      materials: {
        title: "Materials Status",
        desc: "View material status and missing document reminders for students in the current intake",
      },
      history: {
        title: "Application History",
        desc: "View historical applications for closed intakes and search by year and intake",
      },
      accounts: {
        title: "Account Management",
        desc: "Manage the primary account and sub-accounts for the current agency",
      },
    },
        enteringAgency: "Entering agency portal...",
    sessionConflictTitle: "Session Changed",
    sessionConflictMessage: "This account has been signed in elsewhere. This page will return to the login screen.",
    sessionConflictConfirm: "OK",
  },
  ko: {
    brandDesc: "기관 지원서 제출 및 서류 관리",
    menuTitle: "기관 메뉴",
    systemTitle: "시스템",
    logout: "로그아웃",
    currentAccount: "현재 계정",
    nav: {
      dashboard: "기관 대시보드",
      applications: "나의 지원서",
      newApplication: "새 지원서",
      materials: "서류 상태",
      history: "이력 지원서",
      accounts: "계정 관리",
    },
    pages: {
      dashboard: {
        title: "기관 홈",
        desc: "현재 오픈 차수, 지원 진행 현황 및 최근 지원서를 확인합니다",
      },
      applications: {
        title: "나의 지원서",
        desc: "현재 오픈 차수의 초안 및 제출 완료 지원서를 확인합니다",
      },
      newApplication: {
        title: "새 지원서",
        desc: "오픈된 차수에 따라 새로운 학생 지원서를 제출합니다",
      },
      materials: {
        title: "서류 상태",
        desc: "현재 차수 학생들의 서류 상태와 보완 필요 사항을 확인합니다",
      },
      history: {
        title: "이력 지원서",
        desc: "마감된 차수의 지원 이력을 연도 및 차수별로 조회합니다",
      },
      accounts: {
        title: "계정 관리",
        desc: "현재 기관의 주계정과 하위 계정을 관리합니다",
      },
    },
        sessionConflictTitle: "로그인 상태 변경",
    sessionConflictMessage: "이 계정이 다른 곳에서 로그인되었습니다. 현재 페이지는 로그인 화면으로 이동합니다.",
    sessionConflictConfirm: "확인",
  },
};

function readLocalAgencySession() {
  try {
    const raw = sessionStorage.getItem("agency_session");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

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

function buildMenuItems(t) {
  return [
    { to: "/agency/dashboard", label: t.nav.dashboard },
    { to: "/agency/applications", label: t.nav.applications },
    { to: "/agency/materials", label: t.nav.materials },
    { to: "/agency/history", label: t.nav.history },
    { to: "/agency/accounts", label: t.nav.accounts },
  ];
}

function getPageMeta(pathname, t) {
  if (pathname.startsWith("/agency/applications")) return t.pages.applications;
  if (pathname.startsWith("/agency/new-application")) return t.pages.newApplication;
  if (pathname.startsWith("/agency/materials")) return t.pages.materials;
  if (pathname.startsWith("/agency/history")) return t.pages.history;
  if (pathname.startsWith("/agency/accounts")) return t.pages.accounts;
  return t.pages.dashboard;
}

function MenuLink({ to, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 whitespace-nowrap",
          isActive
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-300 hover:bg-slate-800 hover:text-white",
        ].join(" ")
      }
    >
      <span className="mr-3 inline-block h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </NavLink>
  );
}

function AgencyLayout() {
  const location = useLocation();
  const navigate = useNavigate();

   const [session, setSession] = useState(() => readLocalAgencySession());
  const [checking, setChecking] = useState(true);
  const [language, setLanguage] = useState(() => readLanguage());

  const t = messages[language] || messages.zh;
  const menuItems = useMemo(() => buildMenuItems(t), [t]);
  const pageMeta = useMemo(
    () => getPageMeta(location.pathname, t),
    [location.pathname, t]
  );

  useEffect(() => {
    saveLanguage(language);
  }, [language]);

  const clearLocalAgencySession = useCallback(() => {
    sessionStorage.removeItem("agency_session");
  }, []);

  const verifySession = useCallback(async () => {
    try {
      const response = await fetch("/api/agency-session", {
        method: "GET",
        credentials: "include",
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success || !result.session) {
        clearLocalAgencySession();
        setSession(null);
        navigate("/login", { replace: true });
        return null;
      }

      sessionStorage.setItem("agency_session", JSON.stringify(result.session));
      setSession(result.session);
      return result.session;
    } catch (error) {
      console.error("AgencyLayout verifySession error:", error);
      clearLocalAgencySession();
      setSession(null);
      navigate("/login", { replace: true });
      return null;
    } finally {
      setChecking(false);
    }
  }, [clearLocalAgencySession, navigate]);

  useEffect(() => {
    verifySession();
  }, [location.pathname, verifySession]);

  const handleLogout = async () => {
    try {
      await fetch("/api/agency-logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("AgencyLayout handleLogout error:", error);
    } finally {
      clearLocalAgencySession();
      navigate("/login", { replace: true });
    }
  };

  if (!session && checking) return null;

  if (!session) return null;

  return (
    <AgencySessionContext.Provider
      value={{
        session,
        setSession,
        language,
        setLanguage,
        t,
                 refreshSession: async () => {
          return verifySession();
        },
      }}
    >
      <div className="h-screen overflow-hidden bg-slate-100 text-slate-900">
        <div className="flex h-full min-h-0">
          <aside className="flex h-full w-64 shrink-0 flex-col bg-slate-900 px-5 py-6 text-white">
            <div className="mb-10">
              <div className="text-3xl font-bold tracking-tight text-white">
                Halla
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-300">
                Agency Portal
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                {t.brandDesc}
              </p>
            </div>

            <div className="space-y-3">
              <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t.menuTitle}
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => (
                  <MenuLink key={item.to} to={item.to} label={item.label} />
                ))}
              </div>
            </div>

            <div className="mt-10 space-y-3">
              <div className="px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {t.systemTitle}
              </div>

              <div className="rounded-xl bg-slate-800 px-4 py-3">
                <div className="mb-2 text-xs font-semibold text-slate-400">
                  Language
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {LANGUAGE_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setLanguage(item.value)}
                      className={[
                        "rounded-lg px-2 py-2 text-xs font-semibold transition",
                        language === item.value
                          ? "bg-white text-slate-900"
                          : "bg-slate-700 text-slate-200 hover:bg-slate-600",
                      ].join(" ")}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {t.logout}
              </button>
            </div>
          </aside>

          <main className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between px-8 py-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {pageMeta.title}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {pageMeta.desc}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {t.currentAccount}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {session.account_name || session.username}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {session.agency_name}
                  </p>
                </div>
              </div>
            </div>

                        <div className="min-h-0 flex-1 overflow-y-auto p-8">
              <Outlet />
            </div>
          </main>
        </div>      
      </div>
    </AgencySessionContext.Provider>
  );
}

export default AgencyLayout;
