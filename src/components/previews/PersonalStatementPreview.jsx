function BlockTitle({ children }) {
  return (
    <div className="border border-black bg-[#eef3f8] px-2 py-1.5 text-[10px] font-bold leading-[1.25]">
      {children}
    </div>
  );
}

function ValueCell({ children }) {
  return (
    <div className="h-[43mm] border border-t-0 border-black px-2 py-1.5 text-[10px] leading-[1.35] whitespace-pre-wrap">
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
    <div
      className="personal-statement-form mx-auto bg-white text-black"
      style={{
        width: "210mm",
        height: "297mm",
        padding: "10mm",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <div className="border border-black px-4 py-3 text-center">
        <div className="text-[16px] font-bold leading-tight">
          자기소개서 및 학업계획서 [1-2]
        </div>
        <div className="mt-1 text-[10px] leading-tight">
          (Personal Statement and Study Plan)
        </div>
      </div>

      <table className="mt-3 w-full border-collapse text-[10px] leading-[1.25]">
        <colgroup>
          <col style={{ width: "28mm" }} />
          <col style={{ width: "56mm" }} />
          <col style={{ width: "28mm" }} />
          <col style={{ width: "auto" }} />
        </colgroup>

        <tbody>
          <tr>
            <td className="border border-black bg-[#eef3f8] px-2 py-1.5 font-semibold">
              지원학과(부)
              <br />
              Department / Major Applied
            </td>
            <td colSpan={3} className="border border-black px-2 py-1.5">
              {major}
            </td>
          </tr>

          <tr>
            <td className="border border-black bg-[#eef3f8] px-2 py-1.5 font-semibold">
              성명(여권 영문명)
              <br />
              Full Name (as in Passport)
            </td>
            <td className="border border-black px-2 py-1.5">{fullName}</td>
            <td className="border border-black bg-[#eef3f8] px-2 py-1.5 text-center font-semibold">
              생년월일
              <br />
              Date of Birth
            </td>
            <td className="border border-black px-2 py-1.5">{dob}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3">
        <BlockTitle>
          1. 본인에 대해 자유롭게 소개해 주세요.(가족, 성장과정, 성격 장단점 등)
          <br />
          1. Please introduce yourself freely (including family background, upbringing, personality, strengths and weaknesses, etc.)
        </BlockTitle>
        <ValueCell>{q1}</ValueCell>
      </div>

      <div className="mt-3">
        <BlockTitle>
          2. 한국 유학을 준비하기 위해 어떤 노력을 하였는지 구체적으로 작성해 주세요.
          <br />
          2. Please describe in detail the efforts you have made to prepare for studying in Korea.
        </BlockTitle>
        <ValueCell>{q2}</ValueCell>
      </div>

      <div className="mt-3">
        <BlockTitle>
          3. 한라대학교를 선택한 이유와 지원 학과(전공)를 선택한 사유를 구체적으로 작성해 주세요.
          <br />
          3. Please explain your motivation for applying to Halla University and the reasons for choosing your major.
        </BlockTitle>
        <ValueCell>{q3}</ValueCell>
      </div>

      <div className="mt-3">
        <BlockTitle>
          4. 입학 후 학업계획과 졸업 후 진로계획을 구체적으로 작성해 주세요.
          <br />
          4. Please describe your study plan after admission and your career plan after graduation.
        </BlockTitle>
        <ValueCell>{q4}</ValueCell>
      </div>
    </div>
  );
}
