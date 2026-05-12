function Cell({ children, className = "", center = false, small = false }) {
  return (
    <div
      className={`border border-black px-2 py-1 text-slate-900 ${
        center ? "text-center" : ""
      } ${small ? "text-[11px] leading-4" : "text-[12px] leading-5"} ${className}`}
    >
      {children || <span>&nbsp;</span>}
    </div>
  );
}

function HeadCell({ children, className = "", center = false, small = false }) {
  return (
    <div
      className={`border border-black bg-[#eef3f8] px-2 py-1 font-semibold text-slate-900 ${
        center ? "text-center" : ""
      } ${small ? "text-[11px] leading-4" : "text-[12px] leading-5"} ${className}`}
    >
      {children}
    </div>
  );
}

function CheckText({ checked, label }) {
  return (
    <span className="mr-2 inline-flex items-start gap-1 align-top">
      <span className="inline-block w-3 shrink-0 text-center text-[11px]">
        {checked ? "☑" : "☐"}
      </span>
      <span className="leading-4">{label}</span>
    </span>
  );
}

function formatDateYMD(value) {
  if (!value) return "";
  const s = String(value).trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.replaceAll("-", "/");
  return s;
}

function getApplicationFormDate(student) {
  return (
    student?.application_form_updated_at ||
    student?.student_fill_updated_at ||
    student?.created_at ||
    ""
  );
}

function getDateParts(value) {
  const source = value ? new Date(value) : null;

  if (!source || Number.isNaN(source.getTime())) {
    return { year: "", month: "", day: "", ymd: "" };
  }

  return {
    year: String(source.getFullYear()),
    month: String(source.getMonth() + 1).padStart(2, "0"),
    day: String(source.getDate()).padStart(2, "0"),
    ymd: `${source.getFullYear()}/${String(source.getMonth() + 1).padStart(2, "0")}/${String(source.getDate()).padStart(2, "0")}`,
  };
}

function splitAddress(student) {
  const raw = student.address || "";
  const city = student.beneficiaryCity || "";
  const country = student.beneficiaryCountry || student.nationality || "";
  return {
    street: raw,
    city,
    country,
  };
}

function getAdmissionType(student) {
  const raw = student.admission_type || student.admissionType || "";
  const text = String(raw).toLowerCase();

  return {
    freshman: text.includes("freshman") || text.includes("신입"),
    transfer: text.includes("transfer") || text.includes("편입"),
    dual: text.includes("dual") || text.includes("복수"),
    year2: text.includes("2nd") || text.includes("2학년"),
    year3: text.includes("3rd") || text.includes("3학년"),
    year4: text.includes("4th") || text.includes("4학년"),
    dual22: text.includes("2+2"),
    dual31: text.includes("3+1"),
  };
}

function getProgramTrack(student) {
  const raw = student.program_track || student.programTrack || "";
  return {
    korean: raw === "Korean Track" || raw.includes("한국어"),
    english: raw === "English Track" || raw.includes("English"),
    bilingual:
      raw === "Bilingual Program (Chinese)" ||
      raw.includes("Bilingual") ||
      raw.includes("이중언어"),
    chinese:
      raw === "Bilingual Program (Chinese)" ||
      raw.includes("Chinese") ||
      raw.includes("중국어"),
  };
}

function getDegreeLevelLabel(student) {
  const raw = String(student.degree_level || student.degreeLevel || "").toLowerCase();
  if (raw === "master" || raw.includes("석사") || raw.includes("master")) {
    return "석사 (Master)";
  }
  if (raw === "doctor" || raw.includes("박사") || raw.includes("doctor")) {
    return "박사 (Doctor)";
  }
  return raw ? String(student.degree_level || student.degreeLevel) : "-";
}

function getSex(student) {
  const raw = String(student.gender || student.sex || "").toLowerCase();
  return {
    male: raw === "male" || raw === "m" || raw.includes("남"),
    female: raw === "female" || raw === "f" || raw.includes("여"),
  };
}

function yesNo(value) {
  const raw = String(value || "").toLowerCase();
  return {
    yes: raw === "yes" || raw === "y" || raw.includes("yes"),
    no: raw === "no" || raw === "n" || raw.includes("no"),
  };
}

function LogoBox() {
  return (
    <div className="flex h-[95px] items-center justify-center bg-white p-2">
      <img
        src="/halla-logo.png"
        alt="Halla University"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  );
}

function PhotoBox({ photoUrl = "" }) {
  if (photoUrl) {
    return (
      <div className="h-[95px] overflow-hidden border border-black bg-white">
        <img
          src={photoUrl}
          alt="photo"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[95px] flex-col items-center justify-center border border-black text-center text-[11px] leading-4">
      <div>사진 (photo)</div>
      <div className="mt-3">(4X5cm)</div>
    </div>
  );
}

function buildAutoSignature(name) {
  if (!name || typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 90;

  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0f172a";
  ctx.font = "36px cursive";
  ctx.textBaseline = "middle";
  ctx.fillText(String(name), 12, canvas.height / 2);

  return canvas.toDataURL("image/png");
}

function getApplicantSignatureImage(student, fullName) {
  const method = String(student?.applicant_signature_method || "auto");

  if (method === "upload" && student?.applicant_uploaded_signature) {
    return student.applicant_uploaded_signature;
  }

  if (method === "draw" && student?.applicant_drawn_signature) {
    return student.applicant_drawn_signature;
  }

  if (method === "auto") {
    return buildAutoSignature(fullName);
  }

  return "";
}

export default function GraduateApplicationFormPreview({ student, photoUrl = "" }) {
  if (!student) return null;

  const fullName =
    student.english_name ||
    student.full_name_passport ||
    student.fullNamePassport ||
    student.chinese_name ||
    "-";

      const applicantSignatureImage = getApplicantSignatureImage(student, fullName);
  const major = student.major || "-";
  const applicantNationality =
    student.nationality || student.nationalityApplicant || "-";
  const fatherNationality = student.nationalityFather || "-";
  const motherNationality = student.nationalityMother || "-";
  const passportNo = student.passport_no || student.passportNo || "-";
  const alienNo =
    student.alien_registration_no || student.alienRegistrationNo || "";
  const dob = formatDateYMD(student.date_of_birth || student.dateOfBirth);
  const phone = student.tel || student.phone || "-";
  const email = student.email || "-";
  const addr = splitAddress(student);
  const dormitory = yesNo(student.dormitory);
  const sex = getSex(student);
  const admission = getAdmissionType(student);
  const track = getProgramTrack(student);
  const degreeLevelLabel = getDegreeLevelLabel(student);

  const educationRows = [
    student.education1 || "",
    student.education2 || "",
    student.education3 || "",
  ];

  const topik = student.topik || "";
  const ska = student.ska || "";
  const kiip = student.kiip || "";
  const ielts = student.ielts || "";
  const toefl = student.toefl || "";
  const toeflIbt = student.toeflIbt || "";
  const cefr = student.cefr || "";
  const teps = student.teps || "";
  const newTeps = student.newTeps || "";

    const refundName = student.refundName || "";
  const refundDob = formatDateYMD(student.refundDob);
  const applicationFormDate = getApplicationFormDate(student);
  const dateParts = getDateParts(applicationFormDate);
  const refundEmail = student.refundEmail || "";
  const accountHolder = student.accountHolder || "";
  const relationship = student.relationship || "";
  const beneficiaryAddress = student.beneficiaryAddress || "";
  const beneficiaryCity = student.beneficiaryCity || "";
  const beneficiaryCountry = student.beneficiaryCountry || "";
  const bankName = student.bankName || "";
  const bankAddress = student.bankAddress || "";
  const bankCity = student.bankCity || "";
  const bankCountry = student.bankCountry || "";
  const accountNumber = student.accountNumber || "";
  const swiftCode = student.swiftCode || "";

    return (
    <div className="school-application-form mx-auto w-full max-w-[980px] bg-white p-2 text-[12px] leading-4 text-black">
      <style>{`
        .school-application-form .application-page {
          width: 100%;
          background: #fff;
        }

        @media print {
          .school-application-form .application-page {
            page-break-after: always;
            break-after: page;
          }

          .school-application-form .page1-tail {
  break-inside: avoid;
  page-break-inside: avoid;
}

          .school-application-form .application-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
      `}</style>

      <div className="application-page page-1">
        {/* 顶部三栏 */}
        <div className="grid grid-cols-[88px_minmax(0,1fr)_96px] items-start gap-2">
          <LogoBox />

          <div className="pt-1 text-center">
            <div className="text-[20px] font-bold leading-7">한라대학교 입학지원서</div>
            <div className="mt-0.5 text-[14px] leading-5">
              (Application for Admission)
            </div>
            <div className="mt-1 text-[12px]">[1-1]</div>
          </div>

                    <PhotoBox photoUrl={photoUrl} />
        </div>        {/* 지원학과 / 수험번호 */}
        <div className="mt-2 grid grid-cols-[110px_minmax(0,1fr)_346px]">
          <HeadCell small>지원학과 (Major)</HeadCell>
          <Cell small>{major}</Cell>

          <div className="grid grid-cols-[66px_minmax(0,1fr)]">
            <HeadCell center small>수험번호</HeadCell>
            <Cell small />
          </div>
        </div>

        {/* 학위과정 */}
        <div className="grid grid-cols-[110px_minmax(0,1fr)]">
          <HeadCell small>학위과정 (Degree Level)</HeadCell>
          <Cell small>{degreeLevelLabel}</Cell>
        </div>

        {/* 지원구분 */}
        <div className="grid grid-cols-[110px_1fr_2fr]">
          <HeadCell center small className="flex items-center justify-center">
            <div>
              지원구분
              <br />
              (Admission Type)
            </div>
          </HeadCell>

          <Cell small className="flex min-h-[50px] flex-wrap items-start px-2 py-1">
            <CheckText checked={admission.freshman} label="신입학 (Freshman)" />
          </Cell>

          <Cell small className="px-2 py-1">
            <div className="flex min-h-[23px] flex-wrap items-center border-b border-black">
              <CheckText checked={admission.transfer} label="편입학 (Transfer)" />
            </div>
            <div className="flex min-h-[23px] flex-wrap items-center">
              <CheckText checked={admission.year2} label="2학기(2nd Semester)" />
              <CheckText checked={admission.year3} label="3학기(3rd Semester)" />
            </div>
          </Cell>
        </div>

        {/* 지원트랙 */}
        <div className="grid grid-cols-[110px_1fr_1fr_1fr]">
          <HeadCell center small className="flex items-center justify-center">
            <div>
              지원트랙
              <br />
              (Program Track)
            </div>
          </HeadCell>

          <Cell small className="flex min-h-[50px] flex-wrap items-start px-2 py-1">
            <CheckText checked={track.korean} label="한국어트랙 (Korean Track)" />
          </Cell>

          <Cell small className="flex min-h-[50px] flex-wrap items-start px-2 py-1">
            <CheckText checked={track.english} label="영어트랙 (English Track)" />
          </Cell>

          <Cell small className="px-2 py-1">
            <div className="flex min-h-[23px] flex-wrap items-center border-b border-black">
              <CheckText checked={track.bilingual} label="이중언어과정 (Bilingual Program)" />
            </div>
            <div className="flex min-h-[23px] flex-wrap items-center">
              <CheckText checked={track.chinese} label="중국어 (Chinese)" />
            </div>
          </Cell>
        </div>

        {/* 지원자 정보 */}
        <div className="mt-4">
          <table className="w-full border-collapse text-[11px] leading-4">
            <colgroup>
              <col style={{ width: "170px" }} />
              <col style={{ width: "145px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "110px" }} />
              <col style={{ width: "145px" }} />
              <col style={{ width: "150px" }} />
            </colgroup>

            <tbody>
              <tr>
                <td
                  colSpan={6}
                  className="border border-black bg-[#eef3f8] px-2 py-1 font-bold"
                >
                  지원자 정보 (Applicant Information)
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-1 font-semibold">
                  성명 (여권기준) Full Name (as shown on passport)
                </td>
                <td colSpan={5} className="border border-black px-2 py-1">
                  {fullName}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-1 text-center font-semibold">
                  성별 (Sex)
                </td>
                <td className="border border-black px-2 py-1">
                  <CheckText checked={sex.male} label="남 (M)" />
                  <CheckText checked={sex.female} label="여 (F)" />
                </td>

                <td className="border border-black bg-[#eef3f8] px-2 py-1 text-center font-semibold">
                  국적(Nationality)
                </td>
                <td colSpan={3} className="border border-black px-2 py-1">
                  {applicantNationality}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-1 font-semibold">
                  여권번호 (Passport No.)
                </td>
                <td colSpan={2} className="border border-black px-2 py-1">
                  {passportNo}
                </td>

                <td className="border border-black bg-[#eef3f8] px-2 py-1 text-center font-semibold">
                  생년월일 (Date of Birth)
                </td>
                <td colSpan={2} className="border border-black px-2 py-1 text-center">
                  {dob || "(YYYY/MM/DD)"}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-1 font-semibold">
                  전화번호 Contact Number
                </td>
                <td colSpan={2} className="border border-black px-2 py-1">
                  {phone}
                </td>

                <td className="border border-black bg-[#eef3f8] px-2 py-1 text-center font-semibold">
                  E-mail
                </td>
                <td colSpan={2} className="border border-black px-2 py-1">
                  {email}
                </td>
              </tr>

              <tr>
                <td
                  rowSpan={2}
                  className="border border-black bg-[#eef3f8] px-2 py-1 align-middle font-semibold"
                >
                  주소 (Address)
                </td>
                <td colSpan={5} className="border border-black px-2 py-1">
                  (Street Address) : {addr.street || ""}
                </td>
              </tr>

              <tr>
                <td colSpan={3} className="border border-black px-2 py-1">
                  (City) : {addr.city || ""}
                </td>
                <td colSpan={2} className="border border-black px-2 py-1">
                  (Country) : {addr.country || ""}
                </td>
              </tr>

              <tr>
                <td colSpan={3} className="border border-black bg-[#eef3f8] px-2 py-1 font-semibold">
                  외국인등록번호 Alien Registration Number (if applicable)
                </td>
                <td className="border border-black px-2 py-1">
                  {alienNo || "-"}
                </td>

                <td className="border border-black bg-[#eef3f8] px-2 py-1 text-center font-semibold">
                  생활관 신청 (Dormitory)
                </td>
                <td className="border border-black px-2 py-1">
                  <CheckText checked={dormitory.yes} label="YES" />
                  <CheckText checked={dormitory.no} label="NO" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 부모 정보 */}
        <div className="mt-1 border border-black">
          <div className="border-b border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            부모 정보 (Parent Information)
          </div>

          <div className="border-b border-black px-2 py-1 text-[11px]">
            ※ 본 전형은 부모 모두 외국인인 경우에만 지원 가능함 This admission track is only for applicants whose both parents are foreign nationals
          </div>

          <div className="grid grid-cols-[200px_minmax(0,1fr)_200px_minmax(0,1fr)]">
            <HeadCell small>부 국적 (Father Nationality)</HeadCell>
            <Cell small>{fatherNationality}</Cell>
            <HeadCell small>모 국적 (Mother Nationality)</HeadCell>
            <Cell small>{motherNationality}</Cell>
          </div>

          <div className="grid grid-cols-[200px_minmax(0,1fr)]">
            <HeadCell small>부모 모두 외국인임을 확인함</HeadCell>
            <Cell small>
              <CheckText
                checked={!!fatherNationality && !!motherNationality}
                label="I confirm that both of my parents are foreign nationals"
              />
            </Cell>
          </div>
        </div>

        {/* 학력 정보 */}
        <div className="mt-1 border border-black">
          <div className="border-b border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            학력 정보 : 고등학교 ~ 현재까지 / Educational Background (From High School to Present)
          </div>

          <div className="grid grid-cols-[245px_minmax(0,1fr)_170px]">
            <HeadCell center small>기간 (Dates)</HeadCell>
            <HeadCell center small>학교명 (Institutions)</HeadCell>
            <HeadCell center small>
              학교소재지국가/도시
              <br />
              School Location (Country/City)
            </HeadCell>
          </div>

          {educationRows.map((row, idx) => {
            const parts = String(row || "").split("|").map((v) => v.trim());
            const dates = parts[0] || "";
            const school = parts[1] || "";
            const location = parts[2] || "";

            return (
              <div key={idx} className="grid grid-cols-[245px_minmax(0,1fr)_170px]">
                <Cell small>{dates || "YYYY/MM/DD ~ YYYY/MM/DD"}</Cell>
                <Cell small>{school}</Cell>
                <Cell small>{location}</Cell>
              </div>
            );
          })}
        </div>

        {/* 언어능력 */}
        <div className="mt-1 border border-black">
          <div className="grid grid-cols-[105px_1fr_1fr]">
            <HeadCell center small className="flex items-center justify-center">
              <div>
                언어능력
                <br />
                Language Proficiency
              </div>
            </HeadCell>

            <Cell small className="min-h-[70px]">
              <div className="font-semibold">[한국어능력] [Korean]</div>
              <div>① TOPIK ({topik || "     "})급</div>
              <div>② 세종학당(SKA) ({ska || "     "})급</div>
              <div>③ 사회통합프로그램(KIIP) ({kiip || "     "})단계</div>
            </Cell>

            <Cell small className="min-h-[70px]">
              <div className="font-semibold">[영어능력] [English]</div>
              <div>① IELTS ({ielts || "     "})급</div>
              <div>② TOEFL CBT({toefl || "     "}) / TOEFL iBT({toeflIbt || "     "})</div>
              <div>③ CEFR({cefr || "     "})</div>
              <div>④ TEPS({teps || "     "}) / NEW TEPS({newTeps || "     "})</div>
            </Cell>
          </div>
        </div>

        {/* 申请确认 + 接收栏（固定为同一块，避免被拆页） */}
<div className="page1-tail break-inside-avoid">
  <div className="border-x border-b border-black px-4 py-2 text-center text-[11px] leading-5">
    <div>
      귀 대학의 외국인 특별전형에 지원하고자 별첨 구비서류를 갖추어 대학 입학 지원을 신청합니다.
    </div>
    <div className="mt-1">
      I hereby apply for admission under the international student special admission track at your university and submit the required documents as attached.
    </div>

        <div className="mt-3 flex justify-end gap-8">
      <div>지원자(Applicant): {fullName}</div>
      <div className="flex h-[40px] min-w-[90px] items-center justify-center">
        {applicantSignatureImage ? (
          <img
            src={applicantSignatureImage}
            alt="applicant-signature"
            className="max-h-[36px] max-w-[88px] object-contain"
          />
        ) : (
          <div>(인)</div>
        )}
      </div>
    </div>

        <div className="mt-3 flex justify-center gap-8">
      <span>{dateParts.year}년(Year)</span>
      <span>{dateParts.month}월(Month)</span>
      <span>{dateParts.day}일(Day)</span>
    </div>

    <div className="mt-3 text-[16px] font-bold">한라대학교 총장 귀하</div>
  </div>

  <div className="grid grid-cols-[120px_minmax(0,1fr)_120px_120px]">
    <HeadCell center small>접수일자</HeadCell>
    <Cell small />
    <HeadCell center small>접수자</HeadCell>
    <Cell center small>(서명)</Cell>
  </div>
</div>
      </div>

      <div className="application-page page-2">
        <div className="mt-8 border border-black">
          <div className="border-b border-black px-4 py-4 text-center">
            <div className="text-[20px] font-bold">한라대학교 등록금 환불계좌 신청서</div>
            <div className="text-[13px]">(Tuition Refund Bank Account Form)</div>
          </div>

          <div className="border-b border-black px-4 py-3 text-[12px] leading-5">
            <div>※ 본 계좌정보는 등록금 환불이 발생하는 경우에만 사용됩니다.</div>
            <div>※ This account information will be used only in case of tuition refund.</div>
          </div>

          <div className="border-b border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            1. 신청자 정보 (Applicant Information)
          </div>

          <div className="grid grid-cols-[220px_minmax(0,1fr)]">
            <HeadCell small>성명 (Name)</HeadCell>
            <Cell small>{refundName || fullName}</Cell>
            <HeadCell small>생년월일 (Date of Birth)</HeadCell>
            <Cell small>{refundDob || dob}</Cell>
            <HeadCell small>이메일 (E-mail)</HeadCell>
            <Cell small>{refundEmail || email}</Cell>
          </div>

          <div className="border-b border-t border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            2-1. 환불 계좌 정보 (Bank Account Information) / [수취인 정보 (Beneficiary Information)]
          </div>

          <div className="grid grid-cols-[220px_minmax(0,1fr)]">
            <HeadCell small>예금주명 (Account Holder)</HeadCell>
            <Cell small>{accountHolder}</Cell>
            <HeadCell small>신청자와의 관계 (Relationship)</HeadCell>
            <Cell small>{relationship}</Cell>
            <HeadCell small>주소 (Address)</HeadCell>
            <Cell small>{beneficiaryAddress}</Cell>
            <HeadCell small>도시 (City)</HeadCell>
            <Cell small>{beneficiaryCity}</Cell>
            <HeadCell small>국가 (Country)</HeadCell>
            <Cell small>{beneficiaryCountry}</Cell>
          </div>

          <div className="border-b border-t border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            2-2. 환불 계좌 정보 (Bank Account Information) / [은행 정보 (Bank Information)]
          </div>

          <div className="grid grid-cols-[220px_minmax(0,1fr)]">
            <HeadCell small>은행명 (Bank Name)</HeadCell>
            <Cell small>{bankName}</Cell>
            <HeadCell small>은행 주소 (Bank Address)</HeadCell>
            <Cell small>{bankAddress}</Cell>
            <HeadCell small>도시 (City)</HeadCell>
            <Cell small>{bankCity}</Cell>
            <HeadCell small>국가 (Country)</HeadCell>
            <Cell small>{bankCountry}</Cell>
            <HeadCell small>계좌번호 (Account Number)</HeadCell>
            <Cell small>{accountNumber}</Cell>
            <HeadCell small>SWIFT Code</HeadCell>
            <Cell small>{swiftCode}</Cell>
          </div>

          <div className="border-b border-t border-black bg-[#eef3f8] px-2 py-1 text-[12px] font-bold">
            3. 신청자 확인 (Applicant Confirmation)
          </div>

          <div className="px-4 py-4 text-[12px] leading-6">
            <div>
              본인은 상기 계좌정보를 등록금 환불 목적으로 제공하며, 입력 오류 또는 계좌 정보 불일치로 인해 발생하는 모든 불이익은 본인에게 책임이 있음을 확인합니다.
            </div>
            <div className="mt-1">
              I confirm that the above account information is provided for tuition refund purposes, and I take full responsibility for any issues arising from incorrect or mismatched account information.
            </div>

                         <div className="mt-6">신청일 (Date): {dateParts.ymd || "__________________________"}</div>
            <div className="mt-3 flex items-center gap-2">
              <span>신청자 서명 (Signature):</span>
              <div className="flex h-[36px] min-w-[140px] items-center">
                {applicantSignatureImage ? (
                  <img
                    src={applicantSignatureImage}
                    alt="applicant-signature"
                    className="max-h-[34px] max-w-[140px] object-contain"
                  />
                ) : (
                  <span>__________________________</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}