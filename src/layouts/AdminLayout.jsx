import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AdminSessionContext } from "../contexts/AdminSessionContext";

const LANGUAGE_OPTIONS = [
  { value: "zh", label: "中文" },
  { value: "en", label: "English" },
  { value: "ko", label: "한국어" },
];

const messages = {
  zh: {
    brandDesc: "国际招生申请管理系统",
    menuTitle: "管理菜单",
    systemTitle: "系统",
    systemSettings: "系统设置",
    logout: "退出登录",
    currentAccount: "当前账号",
    adminBackend: "管理员后台",
    enteringAdmin: "正在进入管理员后台...",
    nav: {
      dashboard: "仪表盘",
      intakes: "申请批次管理",
      agencies: "机构账号管理",
      applications: "学生申请列表",
      history: "历史申请",
    },
    pages: {
      dashboard: {
        title: "管理员仪表盘",
        desc: "查看系统整体申请进度、批次和材料情况",
      },
      intakes: {
        title: "申请批次管理",
        desc: "管理年份、入学月份、批次开放与截止时间",
      },
      agencies: {
        title: "机构账号管理",
        desc: "维护留学机构账号、联系人与使用状态",
      },
      history: {
        title: "历史申请",
        desc: "按年份、月份、批次查看当前与历史申请，并支持导出 Excel",
      },
      applicationReview: {
        title: "材料审核页",
        desc: "查看单个学生申请的材料、状态与审核备注",
      },
      applications: {
        title: "学生申请列表",
        desc: "查看学生申请、材料状态与导出数据",
      },
    },
  },
  en: {
    brandDesc: "International Admission Management System",
    menuTitle: "Menu",
    systemTitle: "System",
    systemSettings: "System Settings",
    logout: "Log Out",
    currentAccount: "Current Account",
    adminBackend: "Admin Console",
    enteringAdmin: "Entering admin console...",
    nav: {
      dashboard: "Dashboard",
      intakes: "Intake Management",
      agencies: "Agency Accounts",
      applications: "Student Applications",
      history: "Application History",
    },
    pages: {
      dashboard: {
        title: "Admin Dashboard",
        desc: "View overall application progress, intake status, and materials",
      },
      intakes: {
        title: "Intake Management",
        desc: "Manage year, intake month, and application opening/closing dates",
      },
      agencies: {
        title: "Agency Accounts",
        desc: "Manage agency accounts, contacts, and account status",
      },
      history: {
        title: "Application History",
        desc: "Browse current and historical applications by year, month, and intake, and export Excel files",
      },
      applicationReview: {
        title: "Application Review",
        desc: "Review a single student's materials, status, and review notes",
      },
      applications: {
        title: "Student Applications",
        desc: "View student applications, material status, and export data",
      },
    },
  },
  ko: {
    brandDesc: "국제학생 입학 지원 관리 시스템",
    menuTitle: "관리 메뉴",
    systemTitle: "시스템",
    systemSettings: "시스템 설정",
    logout: "로그아웃",
    currentAccount: "현재 계정",
    adminBackend: "관리자 백엔드",
    enteringAdmin: "관리자 페이지로 이동 중...",
    nav: {
      dashboard: "대시보드",
      intakes: "지원 차수 관리",
      agencies: "기관 계정 관리",
      applications: "학생 지원 목록",
      history: "이력 지원서",
    },
    pages: {
      dashboard: {
        title: "관리자 대시보드",
        desc: "전체 지원 진행 현황, 차수, 서류 상태를 확인합니다",
      },
      intakes: {
        title: "지원 차수 관리",
        desc: "연도, 입학 월, 차수 오픈 및 마감 일정을 관리합니다",
      },
      agencies: {
        title: "기관 계정 관리",
        desc: "유학 기관 계정, 담당자 및 사용 상태를 관리합니다",
      },
      history: {
        title: "이력 지원서",
        desc: "연도, 월, 차수별로 현재 및 과거 지원서를 조회하고 Excel로 내보냅니다",
      },
      applicationReview: {
        title: "서류 심사 페이지",
        desc: "학생 1명의 서류, 상태, 심사 메모를 확인합니다",
      },
      applications: {
        title: "학생 지원 목록",
        desc: "학생 지원서, 서류 상태 및 내보내기 데이터를 확인합니다",
      },
    },
  },
};

function readLocalAdminSession() {
  try {
    const raw = sessionStorage.getItem("admin_session");
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
    { to: "/dashboard", label: t.nav.dashboard },
    { to: "/intakes", label: t.nav.intakes },
    { to: "/agencies", label: t.nav.agencies },
    { to: "/applications", label: t.nav.applications },
    { to: "/history", label: t.nav.history },
  ];
}

function getPageMeta(pathname, t) {
  if (pathname.startsWith("/intakes")) return t.pages.intakes;
  if (pathname.startsWith("/agencies")) return t.pages.agencies;
  if (pathname.startsWith("/history")) return t.pages.history;
  if (/^\/applications\/[^/]+\/review$/.test(pathname)) {
    return t.pages.applicationReview;
  }
  if (pathname.startsWith("/applications")) return t.pages.applications;
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

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [session, setSession] = useState(() => readLocalAdminSession());
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

  useEffect(() => {
    let cancelled = false;

    const verifySession = async () => {
      try {
        const response = await fetch("/api/admin-session", {
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
          sessionStorage.removeItem("admin_session");
          if (!cancelled) {
            setSession(null);
            navigate("/login", { replace: true });
          }
          return;
        }

        sessionStorage.setItem("admin_session", JSON.stringify(result.session));

        if (!cancelled) {
          setSession(result.session);
        }
      } catch (error) {
        console.error("AdminLayout verifySession error:", error);

        sessionStorage.removeItem("admin_session");

        if (!cancelled) {
          setSession(null);
          navigate("/login", { replace: true });
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    };

    verifySession();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin-logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("AdminLayout handleLogout error:", error);
    } finally {
      sessionStorage.removeItem("admin_session");
      navigate("/login", { replace: true });
    }
  };

  if (!session && checking) return null;

  if (!session) return null;

  return (
    <AdminSessionContext.Provider
      value={{
        session,
        setSession,
        language,
        setLanguage,
        t,
        refreshSession: async () => {
          const response = await fetch("/api/admin-session", {
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
            sessionStorage.removeItem("admin_session");
            setSession(null);
            navigate("/login", { replace: true });
            return null;
          }

          sessionStorage.setItem("admin_session", JSON.stringify(result.session));
          setSession(result.session);
          return result.session;
        },
      }}
    >
      <div className="min-h-screen bg-slate-100 text-slate-900">
        <div className="flex h-full min-h-0">
          <aside className="flex h-full w-64 shrink-0 flex-col bg-slate-900 px-5 py-6 text-white">
            <div className="mb-10">
              <div className="text-3xl font-bold tracking-tight text-white">
                Halla
              </div>
              <div className="mt-1 text-lg font-semibold text-blue-300">
                Admission
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

              <button className="w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">
                {t.systemSettings}
              </button>

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
                    {session.name || session.username}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t.adminBackend}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminSessionContext.Provider>
  );
}

export default AdminLayout;
