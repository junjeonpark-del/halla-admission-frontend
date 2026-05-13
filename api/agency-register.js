import {
  clearSessionCookie,
  hashPassword,
  json,
  supabaseAdmin,
} from "./_agencyAuth.js";

const messages = {
  zh: {
    agencyNameRequired: "请填写机构名称",
    countryRequired: "请填写国家",
    contactNameRequired: "请填写联系人",
    phoneRequired: "请填写联系电话",
    emailRequired: "请填写机构邮箱",
    usernameRequired: "请填写登录账号",
    passwordRequired: "请填写登录密码",
    accountNameRequired: "请填写账号姓名",
    accountPhoneRequired: "请填写账号电话",
    accountEmailRequired: "请填写账号邮箱",
    usernameLength: "登录账号长度必须为 4~20 位",
    usernameNoChinese: "登录账号不能包含中文",
    usernameExists: "该登录账号已存在，请更换",
    agencyNameExists: (name) => `机构名称已存在：${name}`,
    licenseExists: (name) => `营业执照号已存在：${name}`,
    registerSuccess: "注册成功，等待管理员审核通过后启用账号",
    registerFailed: "注册失败",
  },
  en: {
    agencyNameRequired: "Please enter the agency name",
    countryRequired: "Please enter the country",
    contactNameRequired: "Please enter the contact person",
    phoneRequired: "Please enter the phone number",
    emailRequired: "Please enter the agency email",
    usernameRequired: "Please enter the login username",
    passwordRequired: "Please enter the login password",
    accountNameRequired: "Please enter the account name",
    accountPhoneRequired: "Please enter the account phone",
    accountEmailRequired: "Please enter the account email",
    usernameLength: "Login username must be 4-20 characters",
    usernameNoChinese: "Login username cannot contain Chinese characters",
    usernameExists: "This login username already exists. Please choose another one.",
    agencyNameExists: (name) => `Agency name already exists: ${name}`,
    licenseExists: (name) => `Business license number already exists: ${name}`,
    registerSuccess: "Registration submitted. Your account will be enabled after admin approval.",
    registerFailed: "Registration failed",
  },
  ko: {
    agencyNameRequired: "기관명을 입력하세요",
    countryRequired: "국가를 입력하세요",
    contactNameRequired: "담당자를 입력하세요",
    phoneRequired: "연락처를 입력하세요",
    emailRequired: "기관 이메일을 입력하세요",
    usernameRequired: "로그인 아이디를 입력하세요",
    passwordRequired: "로그인 비밀번호를 입력하세요",
    accountNameRequired: "계정 이름을 입력하세요",
    accountPhoneRequired: "계정 연락처를 입력하세요",
    accountEmailRequired: "계정 이메일을 입력하세요",
    usernameLength: "로그인 아이디는 4~20자여야 합니다",
    usernameNoChinese: "로그인 아이디에는 중국어를 사용할 수 없습니다",
    usernameExists: "이미 존재하는 로그인 아이디입니다. 다른 아이디를 사용하세요.",
    agencyNameExists: (name) => `이미 존재하는 기관명입니다: ${name}`,
    licenseExists: (name) => `이미 존재하는 사업자등록번호입니다: ${name}`,
    registerSuccess: "등록이 완료되었습니다. 관리자 승인 후 계정이 활성화됩니다.",
    registerFailed: "등록 실패",
  },
};

const hasChinese = (value) => /[\u4e00-\u9fff]/.test(String(value || ""));

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

  clearSessionCookie(res);

  let createdAgencyId = "";
  let text = messages.zh;

  try {
    const {
      language = "zh",
      agency_name = "",
      country = "",
      company_founded_year = "",
      business_license_no = "",
      legal_representative = "",
      contact_name = "",
      phone = "",
      email = "",
      username = "",
      password = "",
      account_name = "",
      account_phone = "",
      account_email = "",
    } = req.body || {};

    const lang = ["zh", "en", "ko"].includes(language) ? language : "zh";
    text = messages[lang];

    const cleanUsername = String(username).trim();

    const requiredFields = [
      [agency_name, text.agencyNameRequired],
      [country, text.countryRequired],
      [contact_name, text.contactNameRequired],
      [phone, text.phoneRequired],
      [email, text.emailRequired],
      [username, text.usernameRequired],
      [password, text.passwordRequired],
      [account_name, text.accountNameRequired],
      [account_phone, text.accountPhoneRequired],
      [account_email, text.accountEmailRequired],
    ];

    for (const [value, message] of requiredFields) {
      if (!String(value || "").trim()) {
        return json(res, 400, { success: false, message });
      }
    }

    if (cleanUsername.length < 4 || cleanUsername.length > 20) {
      return json(res, 400, { success: false, message: text.usernameLength });
    }

    if (hasChinese(cleanUsername)) {
      return json(res, 400, { success: false, message: text.usernameNoChinese });
    }

    const { data: existingUsernameRows, error: usernameError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", cleanUsername)
      .limit(1);

    if (usernameError) throw usernameError;

    if (existingUsernameRows && existingUsernameRows.length > 0) {
      return json(res, 400, { success: false, message: text.usernameExists });
    }

    const { data: existingAgencyNameRows, error: agencyNameError } = await supabaseAdmin
      .from("agencies")
      .select("id, agency_name")
      .eq("agency_name", String(agency_name).trim())
      .limit(1);

    if (agencyNameError) throw agencyNameError;

    if (existingAgencyNameRows && existingAgencyNameRows.length > 0) {
      return json(res, 400, {
        success: false,
        message: text.agencyNameExists(existingAgencyNameRows[0].agency_name),
      });
    }

    if (String(business_license_no).trim()) {
      const { data: existingLicenseRows, error: licenseError } = await supabaseAdmin
        .from("agencies")
        .select("id, agency_name, business_license_no")
        .eq("business_license_no", String(business_license_no).trim())
        .limit(1);

      if (licenseError) throw licenseError;

      if (existingLicenseRows && existingLicenseRows.length > 0) {
        return json(res, 400, {
          success: false,
          message: text.licenseExists(existingLicenseRows[0].agency_name),
        });
      }
    }

    const agencyPayload = {
      agency_name: String(agency_name).trim(),
      country: String(country).trim(),
      company_founded_year: company_founded_year ? Number(company_founded_year) : null,
      business_license_no: String(business_license_no).trim() || null,
      legal_representative: String(legal_representative).trim() || null,
      contact_name: String(contact_name).trim(),
      phone: String(phone).trim(),
      email: String(email).trim(),
      status: "pending",
    };

    const { data: agencyRow, error: agencyError } = await supabaseAdmin
      .from("agencies")
      .insert(agencyPayload)
      .select("*")
      .single();

    if (agencyError) throw agencyError;

    createdAgencyId = agencyRow.id;

    const { data: defaultUnit, error: defaultUnitError } = await supabaseAdmin
      .from("agency_units")
      .insert({
        agency_id: createdAgencyId,
        name: String(agency_name).trim(),
        note: null,
        is_default: true,
        is_active: true,
      })
      .select("id")
      .single();

    if (defaultUnitError) throw defaultUnitError;

    const accountPayload = {
      agency_id: createdAgencyId,
      agency_unit_id: defaultUnit.id,
      username: cleanUsername,
      password: hashPassword(String(password)),
      account_name: String(account_name).trim(),
      phone: String(account_phone).trim(),
      email: String(account_email).trim(),
      is_primary: true,
      is_active: false,
    };

    const { error: accountError } = await supabaseAdmin
      .from("agency_accounts")
      .insert(accountPayload);

    if (accountError) throw accountError;

    return json(res, 200, {
      success: true,
      message: text.registerSuccess,
    });
  } catch (error) {
    if (createdAgencyId) {
      await supabaseAdmin.from("agencies").delete().eq("id", createdAgencyId);
    }

    return json(res, 500, {
      success: false,
      message: error.message || text.registerFailed,
    });
  }
}
