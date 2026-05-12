function CheckMark({ checked }) {
  return <span className="inline-block w-4 text-center">{checked ? "☑" : "☐"}</span>;
}

function TableCell({ children, center = false, head = false, className = "" }) {
  return (
    <div
      className={`border border-black px-2 py-1 text-[9px] leading-[1.25] ${
        center ? "text-center" : ""
      } ${head ? "bg-[#eef3f8] font-semibold" : ""} ${className}`}
    >
      {children}
    </div>
  );
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

export default function PersonalInfoConsentPreview({ student }) {
  if (!student) return null;

  const agreeRaw = String(
    student.agreePersonalInfo ||
      student.personal_info_agree ||
      student.personalInfoConsent ||
      "agree"
  ).toLowerCase();

  const acknowledgeRaw = String(
    student.acknowledgeNotice ||
      student.acknowledge_notice ||
      student.confirmPrivacyNotice ||
      "yes"
  ).toLowerCase();

  const agree =
    agreeRaw.includes("agree") ||
    agreeRaw.includes("동의") ||
    agreeRaw === "yes" ||
    agreeRaw === "true";

  const disagree =
    agreeRaw.includes("disagree") ||
    agreeRaw.includes("미동의") ||
    agreeRaw === "no" ||
    agreeRaw === "false";

  const acknowledged =
    acknowledgeRaw.includes("acknowledge") ||
    acknowledgeRaw.includes("확인") ||
    acknowledgeRaw === "yes" ||
    acknowledgeRaw === "true";

      const fullName =
    student.english_name ||
    student.full_name_passport ||
    student.fullNamePassport ||
    student.chinese_name ||
    "-";

  const applicationFormDate = getApplicationFormDate(student);
  const dateParts = getDateParts(applicationFormDate);
  const applicantSignatureImage = getApplicantSignatureImage(student, fullName);
  const autoSignatureImage = buildAutoSignature(fullName);

  return (
        <div className="personal-info-consent-form mx-auto flex flex-col items-center gap-6 bg-transparent text-black">
            {/* 第1页 */}
      <div
        className="consent-page bg-white text-[9px] leading-[1.25]"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "7mm",
          boxSizing: "border-box",
          overflow: "hidden",
          breakAfter: "page",
          pageBreakAfter: "always",
        }}
      >
        <div className="border border-black px-2 py-3 text-center">
          <div className="text-[15px] font-bold">개인정보수집·이용 제공 동의서 [1-3]</div>
          <div className="mt-1 text-[9px]">
            (Consent to the Collection and Use of Personal Information)
          </div>
        </div>

        <div className="mt-2 border border-black px-2 py-2 text-[9px] leading-1.25">
          <p>
            외국인 입학 심사 신청서 접수 및 심사 과정에서 수집된 지원자의 개인정보는 아래의 범위 내에서 처리되며,
            이 과정에서 대학은 「개인정보 보호법」 등 관련 법령에 따라 아래에 명시된 수집 항목, 목적,
            보유 및 이용 기간의 범위 내에서 이를 처리합니다.
          </p>

          <p className="mt-1">
            The personal information collected in the process of admission for students with foreign nationality
            will be processed in the scope specified below and the university will collect, use, and retain such
            information based on the relevant laws, such as the Personal Information Protection Act (PIPA).
          </p>

          <div className="mt-2 space-y-1">
            <div>
              1. 개인정보 항목: 성명, 국적, 생년월일, 성별, 주소, 이메일, 전화번호, 학력 및 성적, 가족관계
              <br />
              1. Type of personal information: Name, nationality, date of birth, gender, address, e-mail,
              phone number, academic records, family relations
            </div>

            <div>
              2. 제출 서류: 가족관계증명서, 예금 잔액 증명서, 최종 학력 증명서, 성적표, 한국어 능력 증명서(소지자에 한함),
              재직증명서(부모) 등
              <br />
              2. Submitted documents: Family relation certificate, bank statement, education background certificate,
              transcript, Korean proficiency certificate (if applicable), proof of employment (of parents), etc.
            </div>

            <div>
              3. 개인정보 수집 및 이용 목적: 외국인 입학 전형 운영, 입학 심사, 학적 생성 및 학생 관리, 출입국 관련 업무 처리
              <br />
              3. Purposes of collecting and using personal information: To process admission, evaluate applications,
              manage student records, and handle immigration-related procedures
            </div>

            <div>
              4. 보유 및 이용 기간: 5년 또는 관련 법령에 따름
              <br />
              4. Retention period: 5 years or as required by applicable laws
            </div>

            <div>
              5. 보유기간 경과 또는 처리 목적 달성 시 해당 개인정보는 즉시 파기됩니다.
              <br />
              5. Personal information will be destroyed once the retention period expires or the purpose is fulfilled.
            </div>
          </div>

          <div className="mt-3">
            <table className="w-full border-collapse text-[9px] leading-1.25">
              <colgroup>
                <col style={{ width: "66%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
              </colgroup>
              <tbody>
                <tr>
                  <td className="border border-black bg-[#eef3f8] px-2 py-2 font-semibold">
                    개인정보 수집·이용에 동의하십니까?
                    <br />
                    Do you agree to allow Halla University to collect and use your personal information?
                  </td>
                  <td className="border border-black bg-[#eef3f8] px-2 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <CheckMark checked={agree} />
                      <span>동의함</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CheckMark checked={agree} />
                      <span>I agree</span>
                    </div>
                  </td>
                  <td className="border border-black bg-[#eef3f8] px-2 py-2 align-top">
                    <div className="flex items-center gap-2">
                      <CheckMark checked={disagree} />
                      <span>동의하지 않음</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <CheckMark checked={disagree} />
                      <span>I disagree</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="border border-black px-2 py-2">
                    개인정보 수집 및 이용에 동의하지 않을 경우, 외국인 입학 심사 신청서를 접수할 수 없습니다.
                    <br />
                    If you disagree, we cannot process your application for admission of students with foreign nationality.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 space-y-1">
            <div>
              6. &lt;외국인 지원자 화상 면접 녹화에 대한 안내&gt;
              <br />
              6. &lt;Recording of video interviews for applicants residing outside of Korea&gt;
            </div>

            <div>
              외국에 거주하는 지원자의 경우, 표준입학허가서 발급을 위한 비자 서류 심사 과정에서 필요시 화상 면접을 진행할 수 있으며,
              이 과정에서 영상 또는 음성 정보가 녹화될 수 있습니다.
              <br />
              For applicants residing outside Korea, a video interview may be conducted if necessary during the visa
              document screening process for issuance of the standard admission letter, and video or audio may be recorded.
            </div>

            <div>
              7. &lt;고유 식별 정보 수집 및 이용 가이드&gt;
              <br />
              7. &lt;Collection and use of personally identifiable information&gt;
            </div>

            <div>
              법령에 따라 여권번호, 외국인등록번호 등 고유 식별 정보를 수집·이용할 수 있으며,
              이는 입학 심사와 출입국 관련 행정처리를 위해 사용됩니다.
              <br />
              Personally identifiable information such as passport number and alien registration number may be collected
              and used pursuant to relevant laws, and will be used for admission review and immigration-related administration.
            </div>
          </div>
        </div>
      </div>

            {/* 第2页 */}
      <div
        className="consent-page bg-white text-[9px] leading-[1.25]"
        style={{
          width: "210mm",
          height: "297mm",
          padding: "7mm",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* 8 */}
        <div className="border border-black">
          <div className="border-b border-black bg-[#eef3f8] px-2 py-2 text-[9px] font-bold leading-1.25">
            8. &lt;개인정보 처리 위탁&gt;
            <br />
            8. &lt;Personal information handling consignment&gt;
          </div>

          <div className="border-b border-black px-2 py-2 text-[9px] leading-1.25">
            <div>
              외국인 입학 심사 신청서 접수 및 심사를 위해, 필요시 관련 법령에 따라 개인정보 처리를 위탁할 수 있습니다.
              위탁 계약을 체결할 때는 개인정보 보호 및 관리 감독에 관한 의무 사항을 명시합니다.
            </div>

            <div className="mt-1">
              Halla University consigns the collected personal information to a third party if it is legally required
              to process the admission of students with foreign nationality. When personal information is consigned,
              the university specifies the regulations needed to safeguard such personal information.
            </div>
          </div>

          <table className="w-full border-collapse text-[9px] leading-1.25">
            <colgroup>
              <col style={{ width: "150px" }} />
              <col style={{ width: "165px" }} />
              <col style={{ width: "315px" }} />
              <col style={{ width: "150px" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  위탁기관
                  <br />
                  Consignment agency
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  위탁업무범위
                  <br />
                  Details of consignment
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  위탁 업무 처리 개인정보 항목
                  <br />
                  Types of personal information for consignment
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  개인정보 보유 및 이용 기간
                  <br />
                  Personal Information retention period
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 text-center">
                  한라대학교
                  <br />
                  Halla University
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  입학서류
                  <br />
                  Documents collected in the process of admission
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  개인정보 수집 항목 동일
                  <br />
                  Same as the personal information stated above
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  준영구
                  <br />
                  semi-permanent
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 9 */}
        <div className="mt-2 border border-black">
          <div className="border-b border-black bg-[#eef3f8] px-2 py-2 text-[9px] font-bold leading-1.25">
            9. &lt;개인정보의 제 3자 제공 동의&gt;
            <br />
            9. &lt;Disclosure of personal information to a third party&gt;
          </div>

          <div className="border-b border-black px-2 py-2 text-[9px] leading-1.25">
            <div>제 3자에게 이하의 개인 정보를 제공합니다.</div>
            <div className="mt-1">Halla University provides personal information to a third party.</div>
          </div>

          <table className="w-full border-collapse text-[9px] leading-1.25">
            <colgroup>
              <col style={{ width: "150px" }} />
              <col style={{ width: "180px" }} />
              <col style={{ width: "285px" }} />
              <col style={{ width: "165px" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  제공받는 자
                  <br />
                  Recipient
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  개인 정보 사용하는 목적
                  <br />
                  Recipient's purposes of using personal information
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  제공하는 개인정보 항목
                  <br />
                  Provided personal information
                </td>
                <td className="border border-black bg-[#eef3f8] px-2 py-2 text-center font-semibold">
                  제공된 개인정보 보유 및 이용 기간
                  <br />
                  Recipient's retention and use period
                </td>
              </tr>

              <tr>
                <td className="border border-black px-2 py-2 text-center">
                  한국 법무부 출입국외국인정책본부
                  <br />
                  Ministry of Justice, Policy Agency for Foreigner Entry and Exit
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  표준 입학 허가서 발급 및 비자 발급 업무
                  <br />
                  Issuance of standard admissions letter and other visas
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  이름, 생년월일, 외국인등록번호, 성별, 여권번호, 국적, 메일, 입학유형 등
                  <br />
                  Name, birthdate, Alien Registration Number, gender, passport number, nationality, e-mail,
                  admission type, etc.
                </td>
                <td className="border border-black px-2 py-2 text-center">
                  처리 목적이 달성되었을 때
                  <br />
                  Until the purposes are fulfilled
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 확인 */}
        <div className="mt-3 border border-black">
          <div className="flex items-center justify-between border-b border-black bg-[#eef3f8] px-2 py-2 text-[9px] leading-1.25">
            <div>
              위 내용 확인하셨습니까?
              <br />
              Do you acknowledge the above?
            </div>

            <div className="flex items-center gap-2">
              <CheckMark checked={acknowledged} />
              <span>확인했습니다. / I acknowledge</span>
            </div>
          </div>

          <div className="px-2 py-4 text-[9px] leading-1.25">
                        <div>
              {dateParts.year}년(Year) {dateParts.month}월(Month) {dateParts.day}일(Day)
            </div>

                        <div className="mt-4 flex items-center gap-2">
              <span>신청인(Applicant) ：</span>

              <div className="flex h-[36px] min-w-[150px] items-center border-b border-black">
                {autoSignatureImage ? (
                  <img
                    src={autoSignatureImage}
                    alt="auto-signature"
                    className="max-h-[32px] max-w-[145px] object-contain"
                  />
                ) : (
                  <span>__________________</span>
                )}
              </div>

              <div className="flex h-[36px] min-w-[60px] items-center justify-center">
                {applicantSignatureImage ? (
                  <img
                    src={applicantSignatureImage}
                    alt="manual-signature"
                    className="max-h-[32px] max-w-[56px] object-contain"
                  />
                ) : (
                  <span>（인）</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}