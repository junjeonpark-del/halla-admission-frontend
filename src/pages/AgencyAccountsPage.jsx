import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAgencySession } from "../contexts/AgencySessionContext";

const messages = {
  zh: {
    pageTitle: "机构账号管理",
    pageDesc: "管理当前机构的主账号与子账号，支持新增、修改、启停、删除和重置密码。",
    createSubAccount: "新增子账号",
    primaryOnlyTip: "仅主账号可管理机构账号",
    info: {
      agencyName: "机构名称",
      primaryAccount: "主账号",
      contact: "联系方式",
      reviewStatus: "审核状态",
    },
    filters: {
      keyword: "账号搜索",
      keywordPlaceholder: "输入用户名 / 姓名 / 电话 / 邮箱",
      status: "账号筛选",
      all: "全部账号",
      primary: "主账号",
      sub: "子账号",
      active: "已启用",
      inactive: "已停用",
    },
    table: {
      title: "账号列表",
      desc: "当前机构下全部主账号和子账号",
      username: "用户名",
      name: "姓名",
      phone: "电话",
      email: "邮箱",
      type: "账号类型",
      active: "启用状态",
      createdAt: "创建时间",
      actions: "操作",
      noData: "暂无账号数据",
      loading: "正在加载账号数据...",
    },
    badge: {
      primary: "主账号",
      sub: "子账号",
      active: "启用",
      inactive: "停用",
    },
    actions: {
      edit: "修改",
      resetPassword: "重置密码",
      disable: "停用",
      enable: "启用",
      delete: "删除",
      primaryOnly: "仅主账号可操作",
    },
    createModal: {
      title: "新增子账号",
      desc: "为当前机构新增一个可登录的子账号",
      username: "用户名",
      password: "初始密码",
      name: "姓名",
      phone: "电话",
      email: "邮箱",
      cancel: "取消",
      confirm: "确认创建",
      creating: "创建中...",
      close: "关闭",
    },
    editModal: {
      title: "修改账号信息",
      desc: "可修改账号用户名、姓名、电话、邮箱和启用状态",
      username: "用户名",
      name: "姓名",
      phone: "电话",
      email: "邮箱",
      activeStatus: "启用状态",
      active: "启用",
      inactive: "停用",
      primaryCannotDisable: "主账号不能停用",
      cancel: "取消",
      confirm: "保存修改",
      saving: "保存中...",
      close: "关闭",
    },
    passwordModal: {
      title: "重置密码",
      account: "账号",
      newPassword: "新密码",
      placeholder: "请输入新密码",
      cancel: "取消",
      confirm: "确认重置",
      saving: "保存中...",
      close: "关闭",
    },
    alerts: {
      loadError: "账号数据加载失败",
      invalidSession: "当前机构登录状态无效，请重新登录",
      needUsername: "请填写账号用户名",
      needPassword: "请填写初始密码",
      createSuccess: "子账号创建成功",
      createFailed: "新增子账号失败：",
      createFailedDefault: "新增子账号失败",
      missingId: "缺少账号ID",
      primaryCannotDisable: "主账号不能停用",
      saveSuccess: "账号信息已更新",
      saveFailed: "修改失败：",
      saveFailedDefault: "修改账号失败",
      confirmToggle: (action, username) => `确定要${action}账号“${username}”吗？`,
      toggleSuccess: (action) => `账号已${action}`,
      toggleFailed: "操作失败：",
      toggleFailedDefault: (action) => `${action}失败`,
      primaryCannotDelete: "主账号不能删除",
      confirmDelete: (username) => `确定要删除账号“${username}”吗？\n删除后无法恢复。`,
      deleteSuccess: "账号已删除",
      deleteFailed: "删除失败：",
      deleteFailedDefault: "删除账号失败",
      missingPasswordTarget: "缺少账号信息",
      needNewPassword: "请输入新密码",
      resetSuccess: "密码已重置",
      resetFailed: "重置密码失败：",
      resetFailedDefault: "重置密码失败",
    },
  },
  en: {
    pageTitle: "Agency Account Management",
    pageDesc: "Manage the primary account and sub-accounts of the current agency, including create, edit, enable/disable, delete, and password reset.",
    createSubAccount: "Create Sub-account",
    primaryOnlyTip: "Only the primary account can manage agency accounts",
    info: {
      agencyName: "Agency Name",
      primaryAccount: "Primary Account",
      contact: "Contact",
      reviewStatus: "Review Status",
    },
    filters: {
      keyword: "Search Accounts",
      keywordPlaceholder: "Search by username / name / phone / email",
      status: "Filter Accounts",
      all: "All Accounts",
      primary: "Primary Account",
      sub: "Sub-account",
      active: "Active",
      inactive: "Inactive",
    },
    table: {
  title: "Account List",
  desc: "All primary and sub-accounts under the current agency",
  username: "ID",
  name: "Name",
      phone: "Phone",
      email: "Email",
      type: "Account Type",
      active: "Status",
      createdAt: "Created At",
      actions: "Actions",
      noData: "No account data",
      loading: "Loading account data...",
    },
    badge: {
      primary: "Primary",
      sub: "Sub-account",
      active: "Active",
      inactive: "Inactive",
    },
    actions: {
      edit: "Edit",
      resetPassword: "Reset Password",
      disable: "Disable",
      enable: "Enable",
      delete: "Delete",
      primaryOnly: "Only primary account can operate",
    },
    createModal: {
  title: "Create Sub-account",
  desc: "Create a new login-enabled sub-account for the current agency",
  username: "ID",
  password: "Initial Password",
  name: "Name",
  phone: "Phone",
  email: "Email",
  cancel: "Cancel",
  confirm: "Create",
  creating: "Creating...",
  close: "Close",
},
    editModal: {
      title: "Edit Account",
      desc: "Update username, name, phone, email, and active status",
      username: "Username",
      name: "Name",
      phone: "Phone",
      email: "Email",
      activeStatus: "Active Status",
      active: "Enable",
      inactive: "Disable",
      primaryCannotDisable: "Primary account cannot be disabled",
      cancel: "Cancel",
      confirm: "Save Changes",
      saving: "Saving...",
      close: "Close",
    },
    passwordModal: {
      title: "Reset Password",
      account: "Account",
      newPassword: "New Password",
      placeholder: "Enter new password",
      cancel: "Cancel",
      confirm: "Reset Password",
      saving: "Saving...",
      close: "Close",
    },
    alerts: {
      loadError: "Failed to load account data",
      invalidSession: "Current agency session is invalid. Please log in again.",
      needUsername: "Please enter a username",
      needPassword: "Please enter an initial password",
      createSuccess: "Sub-account created successfully",
      createFailed: "Failed to create sub-account: ",
      createFailedDefault: "Failed to create sub-account",
      missingId: "Missing account ID",
      primaryCannotDisable: "Primary account cannot be disabled",
      saveSuccess: "Account information updated",
      saveFailed: "Update failed: ",
      saveFailedDefault: "Failed to update account",
      confirmToggle: (action, username) => `Are you sure you want to ${action} the account "${username}"?`,
      toggleSuccess: (action) => `Account ${action}d successfully`,
      toggleFailed: "Operation failed: ",
      toggleFailedDefault: (action) => `Failed to ${action}`,
      primaryCannotDelete: "Primary account cannot be deleted",
      confirmDelete: (username) => `Are you sure you want to delete the account "${username}"?\nThis action cannot be undone.`,
      deleteSuccess: "Account deleted",
      deleteFailed: "Delete failed: ",
      deleteFailedDefault: "Failed to delete account",
      missingPasswordTarget: "Missing account information",
      needNewPassword: "Please enter a new password",
      resetSuccess: "Password has been reset",
      resetFailed: "Password reset failed: ",
      resetFailedDefault: "Failed to reset password",
    },
  },
  ko: {
    pageTitle: "기관 계정 관리",
    pageDesc: "현재 기관의 주계정과 하위 계정을 관리하며, 생성, 수정, 활성/비활성, 삭제 및 비밀번호 재설정을 지원합니다.",
    createSubAccount: "하위 계정 추가",
    primaryOnlyTip: "주계정만 기관 계정을 관리할 수 있습니다",
    info: {
      agencyName: "기관명",
      primaryAccount: "주계정",
      contact: "연락처",
      reviewStatus: "심사 상태",
    },
    filters: {
      keyword: "계정 검색",
      keywordPlaceholder: "아이디 / 이름 / 전화 / 이메일 검색",
      status: "계정 필터",
      all: "전체 계정",
      primary: "주계정",
      sub: "하위 계정",
      active: "활성",
      inactive: "비활성",
    },
    table: {
      title: "계정 목록",
      desc: "현재 기관에 속한 모든 주계정 및 하위 계정",
      username: "아이디",
      name: "이름",
      phone: "전화",
      email: "이메일",
      type: "계정 유형",
      active: "활성 상태",
      createdAt: "생성일",
      actions: "작업",
      noData: "계정 데이터가 없습니다",
      loading: "계정 데이터를 불러오는 중...",
    },
    badge: {
      primary: "주계정",
      sub: "하위 계정",
      active: "활성",
      inactive: "비활성",
    },
    actions: {
      edit: "수정",
      resetPassword: "비밀번호 재설정",
      disable: "비활성",
      enable: "활성",
      delete: "삭제",
      primaryOnly: "주계정만 작업할 수 있습니다",
    },
    createModal: {
      title: "하위 계정 추가",
      desc: "현재 기관에 로그인 가능한 새 하위 계정을 추가합니다",
      username: "아이디",
      password: "초기 비밀번호",
      name: "이름",
      phone: "전화",
      email: "이메일",
      cancel: "취소",
      confirm: "생성",
      creating: "생성 중...",
      close: "닫기",
    },
    editModal: {
      title: "계정 정보 수정",
      desc: "아이디, 이름, 전화, 이메일, 활성 상태를 수정할 수 있습니다",
      username: "아이디",
      name: "이름",
      phone: "전화",
      email: "이메일",
      activeStatus: "활성 상태",
      active: "활성",
      inactive: "비활성",
      primaryCannotDisable: "주계정은 비활성화할 수 없습니다",
      cancel: "취소",
      confirm: "저장",
      saving: "저장 중...",
      close: "닫기",
    },
    passwordModal: {
      title: "비밀번호 재설정",
      account: "계정",
      newPassword: "새 비밀번호",
      placeholder: "새 비밀번호를 입력하세요",
      cancel: "취소",
      confirm: "재설정",
      saving: "저장 중...",
      close: "닫기",
    },
    alerts: {
      loadError: "계정 데이터 로드 실패",
      invalidSession: "현재 기관 로그인 상태가 유효하지 않습니다. 다시 로그인하세요.",
      needUsername: "아이디를 입력하세요",
      needPassword: "초기 비밀번호를 입력하세요",
      createSuccess: "하위 계정이 생성되었습니다",
      createFailed: "하위 계정 생성 실패: ",
      createFailedDefault: "하위 계정 생성 실패",
      missingId: "계정 ID가 없습니다",
      primaryCannotDisable: "주계정은 비활성화할 수 없습니다",
      saveSuccess: "계정 정보가 업데이트되었습니다",
      saveFailed: "수정 실패: ",
      saveFailedDefault: "계정 수정 실패",
      confirmToggle: (action, username) => `계정 "${username}"을(를) ${action}하시겠습니까?`,
      toggleSuccess: (action) => `계정이 ${action}되었습니다`,
      toggleFailed: "작업 실패: ",
      toggleFailedDefault: (action) => `${action} 실패`,
      primaryCannotDelete: "주계정은 삭제할 수 없습니다",
      confirmDelete: (username) => `계정 "${username}"을(를) 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`,
      deleteSuccess: "계정이 삭제되었습니다",
      deleteFailed: "삭제 실패: ",
      deleteFailedDefault: "계정 삭제 실패",
      missingPasswordTarget: "계정 정보가 없습니다",
      needNewPassword: "새 비밀번호를 입력하세요",
      resetSuccess: "비밀번호가 재설정되었습니다",
      resetFailed: "비밀번호 재설정 실패: ",
      resetFailedDefault: "비밀번호 재설정 실패",
    },
  },
};

function StatusBadge({ children, type = "default" }) {
  const classes = {
    success: "bg-emerald-100 text-emerald-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-amber-100 text-amber-700",
    default: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${classes[type]}`}
    >
      {children}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function getInitialCreateForm() {
  return {
    username: "",
    password: "",
    account_name: "",
    phone: "",
    email: "",
    agency_unit_id: "",
    is_active: true,
  };
}

function getInitialEditForm() {
  return {
    id: "",
    username: "",
    account_name: "",
    phone: "",
    email: "",
    is_active: true,
    is_primary: false,
  };
}

function getInitialAgencyInfoForm() {
  return {
    agency_name: "",
    country: "",
    company_founded_year: "",
    business_license_no: "",
    legal_representative: "",
    contact_name: "",
    phone: "",
    email: "",
  };
}

function EllipsisText({
  text,
  widthClass = "max-w-[160px]",
  className = "",
}) {
  const value = text || "-";

  return (
    <div
      title={value}
      className={[widthClass, "truncate whitespace-nowrap", className].join(" ")}
    >
      {value}
    </div>
  );
}

function AgencyAccountsPage() {
  const agencyContext = useAgencySession();
  const agencySession = agencyContext?.session || null;
  const language = agencyContext?.language || "zh";
  const t = messages[language] || messages.zh;

  const [agencyInfo, setAgencyInfo] = useState(null);
const [accounts, setAccounts] = useState([]);
const [agencyUnits, setAgencyUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState(getInitialCreateForm());

  const [showUnitModal, setShowUnitModal] = useState(false);
const [creatingUnit, setCreatingUnit] = useState(false);
const [unitForm, setUnitForm] = useState({
  name: "",
  note: "",
});

    const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(getInitialEditForm());

  const [showAgencyInfoModal, setShowAgencyInfoModal] = useState(false);
  const [savingAgencyInfo, setSavingAgencyInfo] = useState(false);
  const [agencyInfoForm, setAgencyInfoForm] = useState(getInitialAgencyInfoForm());

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState("");

  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadData() {
    try {
      if (!agencySession?.agency_id) return;
      setLoading(true);
      setLoadError("");

      const [
  { data: agencyRow, error: agencyError },
  { data: accountRows, error: accountsError },
  { data: unitRows, error: unitsError },
] = await Promise.all([
  supabase
    .from("agencies")
    .select("*")
    .eq("id", agencySession.agency_id)
    .single(),
  supabase
    .from("agency_accounts")
    .select("*")
    .eq("agency_id", agencySession.agency_id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true }),
  supabase
    .from("agency_units")
    .select("*")
    .eq("agency_id", agencySession.agency_id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true }),
]);

if (agencyError) throw agencyError;
if (accountsError) throw accountsError;
if (unitsError) throw unitsError;

setAgencyInfo(agencyRow || null);
setAccounts(accountRows || []);
setAgencyUnits(unitRows || []);

    } catch (error) {
      console.error("AgencyAccountsPage loadData error:", error);
      setLoadError(error.message || t.alerts.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!agencySession?.agency_id) return;
    loadData();
  }, [agencySession?.agency_id]);

  const agencyUnitMap = useMemo(() => {
  return agencyUnits.reduce((map, item) => {
    if (item?.id) {
      map[item.id] = item;
    }
    return map;
  }, {});
}, [agencyUnits]);

const agencyUnitOptions = useMemo(() => {
  return agencyUnits
    .filter((item) => item.is_active !== false)
    .map((item) => ({
      value: item.id,
      label: item.name || "-",
      isDefault: item.is_default === true,
    }));
}, [agencyUnits]);

const filteredAccounts = useMemo(() => {
  const keyword = searchKeyword.trim().toLowerCase();

  return accounts.filter((item) => {
    const matchesKeyword =
      !keyword ||
      String(item.username || "").toLowerCase().includes(keyword) ||
      String(item.account_name || "").toLowerCase().includes(keyword) ||
      String(item.email || "").toLowerCase().includes(keyword) ||
      String(item.phone || "").toLowerCase().includes(keyword);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && item.is_active === true) ||
      (statusFilter === "inactive" && item.is_active !== true) ||
      (statusFilter === "primary" && item.is_primary === true) ||
      (statusFilter === "sub" && item.is_primary !== true);

    return matchesKeyword && matchesStatus;
  });
}, [accounts, searchKeyword, statusFilter]);

  const primaryAccount = useMemo(() => {
    return accounts.find((item) => item.is_primary === true) || null;
  }, [accounts]);

  const isPrimarySession = useMemo(() => {
    if (!agencySession?.agency_account_id) return false;
    return accounts.some(
      (item) =>
        item.id === agencySession.agency_account_id && item.is_primary === true
    );
  }, [accounts, agencySession]);

  const handleCreateChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenUnitCreate = () => {
  setUnitForm({
    name: "",
    note: "",
  });
  setShowUnitModal(true);
};

const handleUnitChange = (field, value) => {
  setUnitForm((prev) => ({
    ...prev,
    [field]: value,
  }));
};

const handleCreateUnit = async () => {
  try {
    if (!unitForm.name.trim()) {
      alert(
        language === "en"
          ? "Please enter the branch name"
          : language === "ko"
          ? "분기관 이름을 입력해 주세요"
          : "请填写分机构名称"
      );
      return;
    }

    setCreatingUnit(true);

    const response = await fetch("/api/agency-unit-create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: unitForm.name,
        note: unitForm.note,
      }),
    });

    const text = await response.text();
    let result = {};

    try {
      result = text ? JSON.parse(text) : {};
    } catch {
      result = {};
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Failed to create branch");
    }

    alert(
      language === "en"
        ? "Branch created"
        : language === "ko"
        ? "분기관이 생성되었습니다"
        : "分机构创建成功"
    );

    setShowUnitModal(false);
    await loadData();
  } catch (error) {
    console.error("handleCreateUnit error:", error);
    alert(
      (language === "en"
        ? "Failed to create branch: "
        : language === "ko"
        ? "분기관 생성 실패: "
        : "分机构创建失败：") + error.message
    );
  } finally {
    setCreatingUnit(false);
  }
};

   const handleOpenCreate = () => {
  setCreateForm({
    ...getInitialCreateForm(),
    agency_unit_id: agencyUnitOptions[0]?.value || "",
  });
  setShowCreateModal(true);
};

  const handleOpenAgencyInfoEdit = () => {
    setAgencyInfoForm({
      agency_name: agencyInfo?.agency_name || "",
      country: agencyInfo?.country || "",
      company_founded_year: agencyInfo?.company_founded_year || "",
      business_license_no: agencyInfo?.business_license_no || "",
      legal_representative: agencyInfo?.legal_representative || "",
      contact_name: agencyInfo?.contact_name || "",
      phone: agencyInfo?.phone || "",
      email: agencyInfo?.email || "",
    });
    setShowAgencyInfoModal(true);
  };

  const handleAgencyInfoChange = (field, value) => {
    setAgencyInfoForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenEdit = (account) => {

    setEditForm({
      id: account.id || "",
      username: account.username || "",
      account_name: account.account_name || "",
      phone: account.phone || "",
      email: account.email || "",
      is_active: account.is_active === true,
      is_primary: account.is_primary === true,
    });
    setShowEditModal(true);
  };

    const handleSaveAgencyInfo = async () => {
    try {
      if (!agencySession?.agency_id) {
        alert(t.alerts.invalidSession);
        return;
      }

      if (!agencyInfoForm.agency_name.trim()) {
        alert(language === "en" ? "Please enter the agency name" : language === "ko" ? "기관명을 입력해 주세요" : "请填写机构名称");
        return;
      }

      setSavingAgencyInfo(true);

      const { error } = await supabase
        .from("agencies")
                .update({
          agency_name: agencyInfoForm.agency_name.trim(),
          country: agencyInfoForm.country.trim() || null,
          company_founded_year:
            agencyInfoForm.company_founded_year &&
            /^\d+$/.test(String(agencyInfoForm.company_founded_year).trim())
              ? Number(String(agencyInfoForm.company_founded_year).trim())
              : null,
          business_license_no: agencyInfoForm.business_license_no.trim() || null,
          legal_representative: agencyInfoForm.legal_representative.trim() || null,
          contact_name: agencyInfoForm.contact_name.trim() || null,
          phone: agencyInfoForm.phone.trim() || null,
          email: agencyInfoForm.email.trim() || null,
        })

        .eq("id", agencySession.agency_id);

      if (error) throw error;

      alert(language === "en" ? "Agency information updated" : language === "ko" ? "기관 정보가 수정되었습니다" : "机构信息已更新");
      setShowAgencyInfoModal(false);
      await loadData();
    } catch (error) {
      console.error("handleSaveAgencyInfo error:", error);
      alert(
        (language === "en"
          ? "Failed to update agency information: "
          : language === "ko"
          ? "기관 정보 수정 실패: "
          : "机构信息修改失败：") + error.message
      );
    } finally {
      setSavingAgencyInfo(false);
    }
  };

  const handleCreateAccount = async () => {
    try {
      if (!agencySession?.agency_id) {
        alert(t.alerts.invalidSession);
        return;
      }

      if (!createForm.username.trim()) {
        alert(t.alerts.needUsername);
        return;
      }

      if (!createForm.password.trim()) {
        alert(t.alerts.needPassword);
        return;
      }

      if (!createForm.agency_unit_id) {
  alert(
    language === "en"
      ? "Please select a branch"
      : language === "ko"
      ? "소속 분기관을 선택해 주세요"
      : "请选择所属分机构"
  );
  return;
}

      setCreating(true);

      const response = await fetch("/api/agency-subaccount-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
  username: createForm.username,
  password: createForm.password,
  account_name: createForm.account_name,
  phone: createForm.phone,
  email: createForm.email,
  agency_unit_id: createForm.agency_unit_id,
  is_active: createForm.is_active,
}),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.createFailedDefault);
      }

      alert(t.alerts.createSuccess);
      setShowCreateModal(false);
      await loadData();
    } catch (error) {
      console.error("handleCreateAccount error:", error);
      alert(`${t.alerts.createFailed}${error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      if (!editForm.id) {
        alert(t.alerts.missingId);
        return;
      }

      if (!editForm.username.trim()) {
        alert(t.alerts.needUsername);
        return;
      }

      if (editForm.is_primary && !editForm.is_active) {
        alert(t.alerts.primaryCannotDisable);
        return;
      }

      setEditing(true);

      const response = await fetch("/api/agency-subaccount-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: editForm.id,
          username: editForm.username,
          account_name: editForm.account_name,
          phone: editForm.phone,
          email: editForm.email,
          is_active: editForm.is_active,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.saveFailedDefault);
      }

      alert(t.alerts.saveSuccess);
      setShowEditModal(false);
      await loadData();
    } catch (error) {
      console.error("handleSaveEdit error:", error);
      alert(`${t.alerts.saveFailed}${error.message}`);
    } finally {
      setEditing(false);
    }
  };

  const handleToggleActive = async (account) => {
    try {
      if (account.is_primary) {
        alert(t.alerts.primaryCannotDisable);
        return;
      }

      const nextValue = !(account.is_active === true);
      const actionText =
        language === "en"
          ? nextValue
            ? "enable"
            : "disable"
          : language === "ko"
          ? nextValue
            ? "활성"
            : "비활성"
          : nextValue
          ? "启用"
          : "停用";

      const confirmed = window.confirm(
        t.alerts.confirmToggle(actionText, account.username)
      );
      if (!confirmed) return;

      const response = await fetch("/api/agency-subaccount-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: account.id,
          username: account.username,
          account_name: account.account_name,
          phone: account.phone,
          email: account.email,
          is_active: nextValue,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.toggleFailedDefault(actionText));
      }

      alert(t.alerts.toggleSuccess(actionText));
      await loadData();
    } catch (error) {
      console.error("handleToggleActive error:", error);
      alert(`${t.alerts.toggleFailed}${error.message}`);
    }
  };

  const handleDeleteAccount = async (account) => {
    try {
      if (account.is_primary) {
        alert(t.alerts.primaryCannotDelete);
        return;
      }

      const confirmed = window.confirm(
        t.alerts.confirmDelete(account.username)
      );
      if (!confirmed) return;

      const response = await fetch("/api/agency-subaccount-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: account.id,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.deleteFailedDefault);
      }

      alert(t.alerts.deleteSuccess);
      await loadData();
    } catch (error) {
      console.error("handleDeleteAccount error:", error);
      alert(`${t.alerts.deleteFailed}${error.message}`);
    }
  };

  const handleOpenResetPassword = (account) => {
    setPasswordTarget(account);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  const handleResetPassword = async () => {
    try {
      if (!passwordTarget?.id) {
        alert(t.alerts.missingPasswordTarget);
        return;
      }

      if (!newPassword.trim()) {
        alert(t.alerts.needNewPassword);
        return;
      }

      setPasswordSaving(true);

      const response = await fetch("/api/agency-subaccount-reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: passwordTarget.id,
          new_password: newPassword,
        }),
      });

      const text = await response.text();
      let result = {};

      try {
        result = text ? JSON.parse(text) : {};
      } catch {
        result = {};
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || t.alerts.resetFailedDefault);
      }

      alert(t.alerts.resetSuccess);
      setShowPasswordModal(false);
    } catch (error) {
      console.error("handleResetPassword error:", error);
      alert(`${t.alerts.resetFailed}${error.message}`);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{t.pageTitle}</h3>
            <p className="mt-1 text-sm text-slate-500">{t.pageDesc}</p>
          </div>

                    {isPrimarySession ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOpenAgencyInfoEdit}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                {language === "en" ? "Edit Agency Info" : language === "ko" ? "기관 정보 수정" : "编辑机构信息"}
              </button>

<button
  type="button"
  onClick={handleOpenUnitCreate}
  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
>
  {language === "en"
    ? "Add Branch"
    : language === "ko"
    ? "분기관 추가"
    : "新增分机构"}
</button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                {t.createSubAccount}
              </button>
            </div>
          ) : (
            <div className="text-sm text-slate-500">
              {t.primaryOnlyTip}
            </div>
          )}
        </div>

                   <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              {t.info.agencyName}
            </div>
            <div className="mt-2 min-h-[24px] text-sm font-semibold text-slate-800 break-all">
              {agencyInfo?.agency_name || "-"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              {language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
            </div>
            <div className="mt-2 min-h-[24px] text-sm font-semibold text-slate-800 break-all">
              {agencyInfo?.country || "-"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              {t.info.primaryAccount}
            </div>
            <div className="mt-2 min-h-[24px] text-sm font-semibold text-slate-800 break-all">
              {primaryAccount?.username || agencySession?.username || "-"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              {t.info.contact}
            </div>
            <div className="mt-2 min-h-[24px] text-sm font-semibold text-slate-800 break-all">
              {agencyInfo?.phone || primaryAccount?.phone || "-"}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-xs font-medium text-slate-500">
              {t.info.reviewStatus}
            </div>
            <div className="mt-2 min-h-[24px]">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  agencyInfo?.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : agencyInfo?.status === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : agencyInfo?.status === "rejected"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {agencyInfo?.status || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.keyword}
            </label>
            <input
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder={t.filters.keywordPlaceholder}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {t.filters.status}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
            >
              <option value="all">{t.filters.all}</option>
              <option value="primary">{t.filters.primary}</option>
              <option value="sub">{t.filters.sub}</option>
              <option value="active">{t.filters.active}</option>
              <option value="inactive">{t.filters.inactive}</option>
            </select>
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
        ) : filteredAccounts.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">{t.table.noData}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">{t.table.username}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.name}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.phone}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.email}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.type}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.active}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.createdAt}</th>
                  <th className="px-6 py-4 font-semibold">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <tr
                    key={account.id}
                    className="border-t border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium text-slate-800">
                      <EllipsisText text={account.username || "-"} widthClass="max-w-[140px]" />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <EllipsisText text={account.account_name || "-"} widthClass="max-w-[120px]" />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <EllipsisText text={account.phone || "-"} widthClass="max-w-[140px]" />
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <EllipsisText text={account.email || "-"} widthClass="max-w-[180px]" />
                    </td>
                    <td className="px-6 py-4">
                      {account.is_primary ? (
                        <StatusBadge type="success">{t.badge.primary}</StatusBadge>
                      ) : (
                        <StatusBadge>{t.badge.sub}</StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {account.is_active ? (
                        <StatusBadge type="success">{t.badge.active}</StatusBadge>
                      ) : (
                        <StatusBadge type="danger">{t.badge.inactive}</StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {formatDateTime(account.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {isPrimarySession ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(account)}
                              className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                            >
                              {t.actions.edit}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenResetPassword(account)}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                            >
                              {t.actions.resetPassword}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleActive(account)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                                account.is_primary
                                  ? "bg-slate-300 cursor-not-allowed"
                                  : account.is_active
                                  ? "bg-amber-600 hover:bg-amber-700"
                                  : "bg-emerald-600 hover:bg-emerald-700"
                              }`}
                            >
                              {account.is_active ? t.actions.disable : t.actions.enable}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAccount(account)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white ${
                                account.is_primary
                                  ? "bg-slate-300 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700"
                              }`}
                            >
                              {t.actions.delete}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">
                            {t.actions.primaryOnly}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

{showUnitModal ? (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {language === "en"
              ? "Add Branch"
              : language === "ko"
              ? "분기관 추가"
              : "新增分机构"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {language === "en"
              ? "Create a branch or internal unit under the current agency."
              : language === "ko"
              ? "현재 기관 아래에 분기관 또는 내부 소속을 생성합니다."
              : "在当前主机构下新增分机构或内部归属。"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUnitModal(false)}
          className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
        >
          {language === "en" ? "Close" : language === "ko" ? "닫기" : "关闭"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {language === "en"
              ? "Branch Name"
              : language === "ko"
              ? "분기관 이름"
              : "分机构名称"}
          </label>
          <input
            value={unitForm.name}
            onChange={(e) => handleUnitChange("name", e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            {language === "en"
              ? "Note"
              : language === "ko"
              ? "비고"
              : "备注"}
          </label>
          <textarea
            value={unitForm.note}
            onChange={(e) => handleUnitChange("note", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowUnitModal(false)}
          className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          {language === "en" ? "Cancel" : language === "ko" ? "취소" : "取消"}
        </button>

        <button
          type="button"
          onClick={handleCreateUnit}
          disabled={creatingUnit}
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {creatingUnit
            ? language === "en"
              ? "Creating..."
              : language === "ko"
              ? "생성 중..."
              : "创建中..."
            : language === "en"
            ? "Create"
            : language === "ko"
            ? "생성"
            : "确认创建"}
        </button>
      </div>
    </div>
  </div>
) : null}

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.createModal.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.createModal.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.createModal.close}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.username}
                </label>
                <input
                  value={createForm.username}
                  onChange={(e) => handleCreateChange("username", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.password}
                </label>
                <input
                  value={createForm.password}
                  onChange={(e) => handleCreateChange("password", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.name}
                </label>
                <input
                  value={createForm.account_name}
                  onChange={(e) => handleCreateChange("account_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.phone}
                </label>
                <input
                  value={createForm.phone}
                  onChange={(e) => handleCreateChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.createModal.email}
                </label>
                <input
                  value={createForm.email}
                  onChange={(e) => handleCreateChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div className="md:col-span-2">
  <label className="mb-2 block text-sm font-medium text-slate-700">
    {language === "en"
      ? "Branch"
      : language === "ko"
      ? "소속 분기관"
      : "所属分机构"}
  </label>
  <select
    value={createForm.agency_unit_id}
    onChange={(e) => handleCreateChange("agency_unit_id", e.target.value)}
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
  >
    <option value="">
      {language === "en"
        ? "Please select"
        : language === "ko"
        ? "선택해 주세요"
        : "请选择"}
    </option>
    {agencyUnitOptions.map((unit) => (
      <option key={unit.value} value={unit.value}>
        {unit.label}
      </option>
    ))}
  </select>
</div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.createModal.cancel}
              </button>

              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={creating}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {creating ? t.createModal.creating : t.createModal.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showEditModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.editModal.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.editModal.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.editModal.close}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.editModal.username}
                </label>
                <input
                  value={editForm.username}
                  onChange={(e) => handleEditChange("username", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.editModal.name}
                </label>
                <input
                  value={editForm.account_name}
                  onChange={(e) => handleEditChange("account_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.editModal.phone}
                </label>
                <input
                  value={editForm.phone}
                  onChange={(e) => handleEditChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.editModal.email}
                </label>
                <input
                  value={editForm.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {t.editModal.activeStatus}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditChange("is_active", true)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      editForm.is_active
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {t.editModal.active}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleEditChange("is_active", false)}
                    disabled={editForm.is_primary}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      !editForm.is_active
                        ? "bg-red-600 text-white"
                        : "bg-slate-100 text-slate-700"
                    } ${editForm.is_primary ? "cursor-not-allowed opacity-50" : ""}`}
                  >
                    {t.editModal.inactive}
                  </button>
                </div>
                {editForm.is_primary ? (
                  <div className="mt-2 text-xs text-slate-500">
                    {t.editModal.primaryCannotDisable}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.editModal.cancel}
              </button>

              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={editing}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {editing ? t.editModal.saving : t.editModal.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showAgencyInfoModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {language === "en" ? "Edit Agency Information" : language === "ko" ? "기관 정보 수정" : "编辑机构信息"}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {language === "en"
                    ? "Update agency basic information directly."
                    : language === "ko"
                    ? "기관 기본 정보를 직접 수정합니다."
                    : "直接修改机构基本信息。"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAgencyInfoModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {language === "en" ? "Close" : language === "ko" ? "닫기" : "关闭"}
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Agency Name" : language === "ko" ? "기관명" : "机构名称"}
                </label>
                <input
                  value={agencyInfoForm.agency_name}
                  onChange={(e) => handleAgencyInfoChange("agency_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Country" : language === "ko" ? "국가" : "国家"}
                </label>
                <input
                  value={agencyInfoForm.country}
                  onChange={(e) => handleAgencyInfoChange("country", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Founded Year" : language === "ko" ? "회사 설립 연도" : "公司成立年份"}
                </label>
                <input
                  value={agencyInfoForm.company_founded_year}
                  onChange={(e) => handleAgencyInfoChange("company_founded_year", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Business License No." : language === "ko" ? "사업자등록번호" : "营业执照号"}
                </label>
                <input
                  value={agencyInfoForm.business_license_no}
                  onChange={(e) => handleAgencyInfoChange("business_license_no", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Legal Representative" : language === "ko" ? "법인 대표자" : "法人姓名"}
                </label>
                <input
                  value={agencyInfoForm.legal_representative}
                  onChange={(e) => handleAgencyInfoChange("legal_representative", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Contact Person" : language === "ko" ? "담당자" : "联系人"}
                </label>
                <input
                  value={agencyInfoForm.contact_name}
                  onChange={(e) => handleAgencyInfoChange("contact_name", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Phone" : language === "ko" ? "연락처" : "联系电话"}
                </label>
                <input
                  value={agencyInfoForm.phone}
                  onChange={(e) => handleAgencyInfoChange("phone", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  {language === "en" ? "Agency Email" : language === "ko" ? "기관 이메일" : "机构邮箱"}
                </label>
                <input
                  value={agencyInfoForm.email}
                  onChange={(e) => handleAgencyInfoChange("email", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAgencyInfoModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {language === "en" ? "Cancel" : language === "ko" ? "취소" : "取消"}
              </button>

              <button
                type="button"
                onClick={handleSaveAgencyInfo}
                disabled={savingAgencyInfo}
                className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingAgencyInfo
                  ? language === "en"
                    ? "Saving..."
                    : language === "ko"
                    ? "저장 중..."
                    : "保存中..."
                  : language === "en"
                  ? "Save Changes"
                  : language === "ko"
                  ? "저장"
                  : "保存修改"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPasswordModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t.passwordModal.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {t.passwordModal.account}：{passwordTarget?.username || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100"
              >
                {t.passwordModal.close}
              </button>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t.passwordModal.newPassword}
              </label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                placeholder={t.passwordModal.placeholder}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                {t.passwordModal.cancel}
              </button>

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={passwordSaving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {passwordSaving ? t.passwordModal.saving : t.passwordModal.confirm}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default AgencyAccountsPage;