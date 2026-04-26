function BlockTitle({ children }) {
  return (
    <div className="border border-black bg-[#eef3f8] px-3 py-2 text-[12px] font-bold">
      {children}
    </div>
  );
}

function LabelCell({ children }) {
  return (
    <div className="border border-black bg-[#eef3f8] px-3 py-2 text-[11px] font-semibold leading-4">
      {children}
    </div>
  );
}

function ValueCell({ children, minH = "min-h-[44px]" }) {
  return (
    <div className={`border border-black px-3 py-2 text-[11px] leading-5 whitespace-pre-wrap ${minH}`}>
      {children || ""}
    </div>
  );
}

export default function PersonalStatementPreview({ student }) {
  if (!student) return null;

  const fullName =
    student.english_name ||
    student.full_name_passport ||
    student.fullNamePassport ||
    student.chinese_name ||
    "-";

  const major = student.major || "-";
  const dob = student.date_of_birth || student.dateOfBirth || "-";

  const q1 =
    student.personal_statement_1 ||
    student.ps_q1 ||
    student.self_intro ||
    "";
  const q2 =
    student.personal_statement_2 ||
    student.ps_q2 ||
    student.preparation_for_korea ||
    "";
  const q3 =
    student.personal_statement_3 ||
    student.ps_q3 ||
    student.why_halla_and_major ||
    "";
  const q4 =
    student.personal_statement_4 ||
    student.ps_q4 ||
    student.study_and_career_plan ||
    "";

  return (
    <div className="personal-statement-form mx-auto w-full max-w-[980px] bg-white p-4 text-black">
      <div className="border border-black px-4 py-5 text-center">
        <div className="text-[20px] font-bold">자기소개서 및 학업계획서 [1-2]</div>
        <div className="mt-1 text-[13px]">(Personal Statement and Study Plan)</div>
      </div>

      <div className="mt-4">
        <table className="w-full border-collapse text-[11px] leading-4">
          <colgroup>
            <col style={{ width: "165px" }} />
            <col style={{ width: "255px" }} />
            <col style={{ width: "145px" }} />
            <col style={{ width: "auto" }} />
          </colgroup>

          <tbody>
            <tr>
              <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                지원학과(부)
                <br />
                Department / Major Applied
              </td>
              <td colSpan={3} className="border border-black px-3 py-2">
                {major}
              </td>
            </tr>

            <tr>
              <td className="border border-black bg-[#eef3f8] px-3 py-2 font-semibold">
                성명(여권 영문명)
                <br />
                Full Name (as in Passport)
              </td>
              <td className="border border-black px-3 py-2">
                {fullName}
              </td>
              <td className="border border-black bg-[#eef3f8] px-3 py-2 text-center font-semibold">
                생년월일
                <br />
                Date of Birth
              </td>
              <td className="border border-black px-3 py-2">
                {dob}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <BlockTitle>
          1. 본인에 대해 자유롭게 소개해 주세요.(가족, 성장과정, 성격 장단점 등)
          <br />
          1. Please introduce yourself freely (including family background, upbringing, personality, strengths and weaknesses, etc.)
        </BlockTitle>
        <ValueCell minH="min-h-[180px]">{q1}</ValueCell>
      </div>

      <div className="mt-4">
        <BlockTitle>
          2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지 구체적으로 작성해 주세요.
          <br />
          2. Please describe in detail the efforts you have made to prepare for studying in Korea.
        </BlockTitle>
        <ValueCell minH="min-h-[180px]">{q2}</ValueCell>
      </div>

      <div className="mt-4">
        <BlockTitle>
          3. 한라대학교를 선택한 이유와 지원 학과(전공)를 선택한 사유를 구체적으로 작성해 주세요.
          <br />
          3. Please explain your motivation for applying to Halla University and the reasons for choosing your major.
        </BlockTitle>
        <ValueCell minH="min-h-[180px]">{q3}</ValueCell>
      </div>

      <div className="mt-4">
        <BlockTitle>
          4. 입학 후 학업계획과 졸업 후 진로계획을 구체적으로 작성해 주세요.
          <br />
          4. Please describe your study plan after admission and your career plan after graduation.
        </BlockTitle>
        <ValueCell minH="min-h-[180px]">{q4}</ValueCell>
      </div>
    </div>
  );
}