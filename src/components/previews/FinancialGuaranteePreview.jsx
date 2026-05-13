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
    return { year: "", month: "", day: "" };
  }

  return {
    year: String(source.getFullYear()),
    month: String(source.getMonth() + 1).padStart(2, "0"),
    day: String(source.getDate()).padStart(2, "0"),
  };
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

function getGuarantorSignatureImage(student, guarantorName) {
  const method = String(student?.guarantor_signature_method || "auto");

  if (method === "upload" && student?.guarantor_uploaded_signature) {
    return student.guarantor_uploaded_signature;
  }

  if (method === "draw" && student?.guarantor_drawn_signature) {
    return student.guarantor_drawn_signature;
  }

  if (method === "auto") {
    return buildAutoSignature(guarantorName);
  }

  return "";
}

export default function FinancialGuaranteePreview({ student }) {
  if (!student) return null;

  const major = student.major || "";
  const fullName =
    student.english_name ||
    student.full_name_passport ||
    student.full_name ||
    "";

  const nationality = student.nationality || "";

  const idNumber =
    student.id_number ||
    student.alien_registration_number ||
    student.registration_number ||
    "";

  const passportNumber =
    student.passport_no ||
    student.passport_number ||
    "";

  const guarantorName = student.guarantor_name || "";
  const guarantorRelationship =
    student.guarantor_relationship ||
    student.relationship ||
    "";
  const guarantorIdNumber = student.guarantor_id_number || "";
  const guarantorOccupation = student.guarantor_occupation || "";
  const guarantorAddress =
    student.guarantor_address ||
    student.beneficiaryAddress ||
    "";
  const guarantorMobile =
    student.guarantor_mobile ||
    student.phone ||
    "";
  const guarantorEmail =
    student.guarantor_email ||
    student.email ||
    "";
  const guarantorWork = student.guarantor_work || "";

    const applicationFormDate = getApplicationFormDate(student);
  const dateParts = getDateParts(applicationFormDate);
  const guarantorSignatureImage = getGuarantorSignatureImage(student, guarantorName);

  return (
    <div className="financial-guarantee-form mx-auto w-full max-w-[980px] bg-[#f3f3f3] p-4 text-black">
      <div className="bg-white p-4">
        {/* 顶部 */}
        <div className="flex items-start gap-6">
          <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center bg-white">
  <img
    src="/halla-logo.png"
    alt="Halla University"
    className="max-h-full max-w-full object-contain"
  />
</div>

          <div className="pt-2">
            <div className="text-[24px] font-semibold leading-8">
              입학신청인 재정보증서 <span className="text-[20px]">[1-4]</span>
            </div>
            <div className="mt-1 text-[13px] font-semibold leading-6">
              (Letter of Financial Guarantee)
            </div>
          </div>
        </div>

        {/* 提示 */}
        <div className="mt-6 space-y-1 text-[11px] leading-6">
          <div>※ 지원자가 본인 명의의 재정증명서를 제출한 경우, 본 재정보증서는 제출을 면제함.</div>
          <div>※ This form is exempted if the applicant submits financial proof under his/her own name.</div>
        </div>

        {/* Applicant details */}
        <div className="mt-5">
          <div className="mb-2 text-[12px] font-bold">
            ■ 신청인개인정보 (Applicant details)
          </div>

          <table className="w-full border-collapse text-[11px] leading-5">
            <colgroup>
              <col style={{ width: "160px" }} />
              <col style={{ width: "310px" }} />
              <col style={{ width: "150px" }} />
              <col style={{ width: "auto" }} />
            </colgroup>

            <tbody>
              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  입학학부 (학과)
                  <br />
                  Department (Major)
                </td>
                <td colSpan={3} className="border border-black px-3 py-2">
                  {major}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  이름 (Full Name)
                </td>
                <td className="border border-black px-3 py-2">
                  {fullName}
                </td>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  국적 (Nationality)
                </td>
                <td className="border border-black px-3 py-2">
                  {nationality}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  신분증번호 (ID Number)
                </td>
                <td className="border border-black px-3 py-2">
                  {idNumber}
                </td>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  여권번호 (Passport number)
                </td>
                <td className="border border-black px-3 py-2">
                  {passportNumber}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Guarantor details */}
        <div className="mt-5">
          <div className="mb-2 text-[12px] font-bold">
            ■ 재정보증인정보 (Guarantor details)
          </div>

          <table className="w-full border-collapse text-[11px] leading-5">
            <colgroup>
  <col style={{ width: "160px" }} />
  <col style={{ width: "310px" }} />
  <col style={{ width: "150px" }} />
  <col style={{ width: "auto" }} />
</colgroup>

            <tbody>
              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  이름 (Full name)
                </td>
                <td className="border border-black px-3 py-2">
                  {guarantorName}
                </td>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  신청인과 관계
                  <br />
                  (Relationship with applicant)
                </td>
                <td className="border border-black px-3 py-2">
                  {guarantorRelationship}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  신분증번호 (ID number)
                </td>
                <td className="border border-black px-3 py-2">
                  {guarantorIdNumber}
                </td>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  직업 (Occupation)
                </td>
                <td className="border border-black px-3 py-2">
                  {guarantorOccupation}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  주소 (Address)
                </td>
                <td colSpan={3} className="border border-black px-3 py-2">
                  {guarantorAddress}
                </td>
              </tr>

              <tr>
                <td
                  rowSpan={3}
                  className="border border-black bg-[#eef3f8] px-3 py-2 align-middle font-semibold"
                >
                  연락처 (Contact)
                </td>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  Mobile
                </td>
                <td colSpan={2} className="border border-black px-3 py-2">
                  {guarantorMobile}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  E-mail
                </td>
                <td colSpan={2} className="border border-black px-3 py-2">
                  {guarantorEmail}
                </td>
              </tr>

              <tr>
                <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                  Work (optional)
                </td>
                <td colSpan={2} className="border border-black px-3 py-2">
                  {guarantorWork}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 承诺文字 */}
        <div className="mt-5 text-[11px] leading-7">
          <div>
            본인은 상기 지원자가 귀교에 입학하여 졸업할 때까지의 등록금 및 체재비 등 모든 유학 경비를 부담할 충분한
            재정 능력이 있으며, 이에 대한 모든 책임을 질 것을 서약합니다.
          </div>
          <div className="mt-2">
            I hereby confirm that I have sufficient financial resources to cover all expenses, including tuition and
            living costs, for the applicant until completion of the program, and I take full responsibility for such
            expenses.
          </div>
        </div>

                {/* 签字区 */}
        <div className="mt-14 flex justify-end text-[11px]">
          <div className="flex items-center gap-2">
            <span>보증인 (Guarantor) ：</span>

            <div className="flex min-w-[180px] items-center border-b border-black px-1">
              <span>{guarantorName || "____________________"}</span>
            </div>

            <div className="flex h-[36px] min-w-[60px] items-center justify-center">
              {guarantorSignatureImage ? (
                <img
                  src={guarantorSignatureImage}
                  alt="guarantor-signature"
                  className="max-h-[32px] max-w-[56px] object-contain"
                />
              ) : (
                <span>（인）</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center gap-10 text-[11px]">
          <div>{dateParts.year}년(Year)</div>
          <div>{dateParts.month}월(Month)</div>
          <div>{dateParts.day}일(Day)</div>
        </div>

        <div className="mt-10 text-center text-[16px] font-semibold">
          한라대학교 총장 귀하
        </div>
      </div>
    </div>
  );
}