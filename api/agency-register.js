import {
  clearSessionCookie,
  hashPassword,
  json,
  supabaseAdmin,
} from "./_agencyAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { success: false, message: "Method Not Allowed" });
  }

    clearSessionCookie(res);

  let createdAgencyId = "";

  try {
    const {
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

    if (!String(agency_name).trim()) {
      return json(res, 400, { success: false, message: "请填写机构名称" });
    }

    if (!String(username).trim()) {
      return json(res, 400, { success: false, message: "请填写登录账号" });
    }

    if (!String(password).trim()) {
      return json(res, 400, { success: false, message: "请填写登录密码" });
    }

    const { data: existingUsernameRows, error: usernameError } = await supabaseAdmin
      .from("agency_accounts")
      .select("id, username")
      .eq("username", String(username).trim())
      .limit(1);

    if (usernameError) throw usernameError;

    if (existingUsernameRows && existingUsernameRows.length > 0) {
      return json(res, 400, { success: false, message: "该登录账号已存在，请更换" });
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
          message: `营业执照号已存在：${existingLicenseRows[0].agency_name}`,
        });
      }
    }

          const agencyPayload = {
      agency_name: String(agency_name).trim(),
      country: String(country).trim() || null,
      company_founded_year: company_founded_year ? Number(company_founded_year) : null,
      business_license_no: String(business_license_no).trim() || null,
      legal_representative: String(legal_representative).trim() || null,
      contact_name: String(contact_name).trim() || null,
      phone: String(phone).trim() || null,
      email: String(email).trim() || null,
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
      username: String(username).trim(),
      password: hashPassword(String(password)),
      account_name: String(account_name).trim() || null,
      phone: String(account_phone).trim() || null,
      email: String(account_email).trim() || null,
      is_primary: true,
      is_active: false,
    };

    const { error: accountError } = await supabaseAdmin
      .from("agency_accounts")
      .insert(accountPayload);

    if (accountError) throw accountError;

    return json(res, 200, {
      success: true,
      message: "注册成功，等待管理员审核通过后启用账号",
    });
  } catch (error) {
    if (createdAgencyId) {
      await supabaseAdmin.from("agencies").delete().eq("id", createdAgencyId);
    }

    return json(res, 500, {
      success: false,
      message: error.message || "注册失败",
    });
  }
}