export const PROGRAM_TRACK_VALUES = {
  korean: "Korean Track",
  english: "English Track",
  bilingual: "Bilingual Program (Chinese)",
};

export const UNDERGRADUATE_ADMISSION_TYPE_VALUES = [
  "Freshman",
  "Transfer (2nd Year)",
  "Transfer (3rd Year)",
  "Transfer (4th Year)",
  "Dual Degree (2+2)",
  "Dual Degree (3+1)",
];

export const UNDERGRADUATE_BILINGUAL_ALLOWED_ADMISSION_TYPE_VALUES = [
  "Transfer (3rd Year)",
  "Transfer (4th Year)",
  "Dual Degree (2+2)",
  "Dual Degree (3+1)",
];

const ALL_TRACK_KEYS = ["korean", "english", "bilingual"];

function createMajor(id, ko, zh, en, tracks = ALL_TRACK_KEYS) {
  return {
    id,
    ko,
    zh,
    en,
    tracks,
  };
}

export const UNDERGRADUATE_MAJOR_CATALOG = [
  createMajor(
    "mechanical_automotive_engineering",
    "기계자동차공학과",
    "机械汽车工程学科",
    "Mechanical and Automotive Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "urban_infrastructure_engineering",
    "도시인프라공학과",
    "城市基础设施工程学科",
    "Urban Infrastructure Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "future_mobility_engineering",
    "미래모빌리티공학과",
    "未来移动出行工程学科",
    "Future Mobility Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "computer_engineering",
    "컴퓨터공학과",
    "计算机工程学科",
    "Computer Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "it_software",
    "IT소프트웨어학과",
    "IT软件学科",
    "IT Software",
    ["korean", "bilingual"]
  ),
  createMajor(
    "electrical_electronic_engineering",
    "전기전자공학과",
    "电气电子工程学科",
    "Electrical and Electronic Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "ai_information_security",
    "AI정보보안학과",
    "AI信息安全学科",
    "AI Information Security",
    ["korean", "bilingual", "english"]
  ),
  createMajor(
    "railway_operation_systems",
    "철도운전시스템학과",
    "铁路驾驶系统学科",
    "Railway Operation Systems",
    ["korean", "bilingual"]
  ),
  createMajor(
    "media_advertising_contents",
    "미디어광고콘텐츠학과",
    "媒体广告内容学科",
    "Media Advertising Contents",
    ["korean", "bilingual"]
  ),
  createMajor(
    "video_production",
    "영상제작학과",
    "影像制作学科",
    "Video Production",
    ["korean", "bilingual"]
  ),
  createMajor(
    "medical_it_convergence",
    "의료IT융합학과",
    "医疗IT融合学科",
    "Medical IT Convergence",
    ["korean", "bilingual"]
  ),
  createMajor(
    "chemical_engineering",
    "화학공학과",
    "化学工程学科",
    "Chemical Engineering",
    ["korean", "bilingual"]
  ),
  createMajor(
    "architecture",
    "건축학과",
    "建筑学科",
    "Architecture",
    ["korean", "bilingual"]
  ),
  createMajor(
    "fire_safety",
    "소방안전학과",
    "消防安全学科",
    "Fire Safety",
    ["korean", "bilingual"]
  ),
  createMajor(
    "social_welfare",
    "사회복지학과",
    "社会福利学科",
    "Social Welfare",
    ["korean", "bilingual"]
  ),
  createMajor(
    "police_administration",
    "경찰행정학과",
    "警察行政学科",
    "Police Administration",
    ["korean", "bilingual"]
  ),
  createMajor(
    "business_administration",
    "경영학과",
    "经营学科 / 工商管理学科",
    "Business Administration",
    ["korean", "bilingual"]
  ),
  createMajor(
    "hotel_aviation_foodservice_management",
    "호텔항공외식경영학과",
    "酒店航空餐饮经营学科",
    "Hotel, Aviation and Foodservice Management",
    ["korean", "bilingual", "english"]
  ),
  createMajor(
    "culture_tourism_management",
    "문화관광경영학과",
    "文化观光经营学科",
    "Culture and Tourism Management",
    ["korean", "bilingual"]
  ),
  createMajor(
    "global_business",
    "글로벌비즈니스학과",
    "全球商务学科",
    "Global Business",
    ["korean", "bilingual", "english"]
  ),
  createMajor(
    "beauty_design",
    "뷰티디자인학과",
    "美容设计学科",
    "Beauty Design",
    ["korean", "bilingual"]
  ),
  createMajor(
    "sports",
    "스포츠학과",
    "体育学科",
    "Sports",
    ["korean", "bilingual"]
  ),
  createMajor(
    "international_trade_logistics",
    "무역물류학과",
    "贸易物流学科",
    "International Trade and Logistics",
    ["korean", "bilingual"]
  ),
  createMajor(
    "future_management",
    "미래경영학과",
    "未来经营学科",
    "Future Management",
    ["korean", "bilingual"]
  ),
  createMajor(
    "culture_arts",
    "문화예술학과",
    "文化艺术学科",
    "Culture and Arts",
    ["korean", "bilingual"]
  ),
  createMajor(
    "golf_industry",
    "골프산업학과",
    "高尔夫产业学科",
    "Golf Industry",
    ["korean"]
  ),
  createMajor(
    "division_of_liberal_studies",
    "자유전공학부",
    "自由专业学部 / 自由选择专业学部",
    "Division of Liberal Studies",
    ["korean"]
  ),
];

export const GRADUATE_MAJOR_CATALOG = [
  createMajor(
    "graduate_mechanical_automotive_engineering",
    "기계자동차공학전공",
    "机械汽车工程专业",
    "Mechanical and Automotive Engineering"
  ),
  createMajor(
    "graduate_electrical_electronic_engineering",
    "전기·전자공학전공",
    "电气电子工程专业",
    "Electrical and Electronic Engineering"
  ),
  createMajor(
    "graduate_computer_engineering",
    "컴퓨터공학전공",
    "计算机工程专业",
    "Computer Engineering"
  ),
  createMajor(
    "graduate_information_communications_engineering",
    "정보통신공학전공",
    "信息通信工程专业",
    "Information and Communications Engineering"
  ),
  createMajor(
    "graduate_architectural_engineering",
    "건축공학전공",
    "建筑工程专业",
    "Architectural Engineering"
  ),
  createMajor(
    "graduate_civil_engineering",
    "토목공학전공",
    "土木工程专业",
    "Civil Engineering"
  ),
  createMajor(
    "graduate_ai_information_security",
    "AI정보보호전공",
    "AI信息保护专业",
    "AI Information Security"
  ),
  createMajor(
    "graduate_future_automotive_engineering",
    "미래자동차공학전공",
    "未来汽车工程专业",
    "Future Automotive Engineering"
  ),
  createMajor(
    "graduate_railway_electrical_signaling_engineering",
    "철도전기신호공학전공",
    "铁路电气信号工程专业",
    "Railway Electrical and Signaling Engineering"
  ),
  createMajor(
    "graduate_railway_construction_engineering",
    "철도건설공학전공",
    "铁路建设工程专业",
    "Railway Construction Engineering"
  ),
  createMajor(
    "graduate_railway_mechanical_vehicle_engineering",
    "철도기계차량공학전공",
    "铁路机械车辆工程专业",
    "Railway Mechanical and Vehicle Engineering"
  ),
  createMajor(
    "graduate_railway_operation_control_systems",
    "철도운영관제시스템전공",
    "铁路运营管制系统专业",
    "Railway Operation and Control Systems"
  ),
  createMajor(
    "graduate_business_administration",
    "경영학전공",
    "经营学专业 / 工商管理专业",
    "Business Administration"
  ),
  createMajor(
    "graduate_police_administration",
    "경찰행정학 전공",
    "警察行政学专业",
    "Police Administration"
  ),
  createMajor(
    "graduate_social_welfare",
    "사회복지학전공",
    "社会福利学专业",
    "Social Welfare"
  ),
  createMajor(
    "graduate_tourism_management",
    "관광경영학전공",
    "旅游经营管理专业",
    "Tourism Management"
  ),
  createMajor(
    "graduate_unification_policy_studies",
    "통일정책학전공",
    "统一政策学专业",
    "Unification Policy Studies"
  ),
  createMajor(
    "graduate_culture_tourism_contents",
    "문화관광콘텐츠전공",
    "文化旅游内容专业",
    "Culture and Tourism Contents"
  ),
  createMajor(
    "graduate_hotel_aviation_foodservice_management",
    "호텔항공외식경영전공",
    "酒店航空餐饮经营专业",
    "Hotel, Aviation and Foodservice Management"
  ),
  createMajor(
    "graduate_beauty_design",
    "뷰티디자인학전공",
    "美容设计专业",
    "Beauty Design"
  ),
];

export function getProgramTrackKey(programTrack) {
  const value = String(programTrack || "").trim();

  if (!value) return "";

  if (
    value === PROGRAM_TRACK_VALUES.korean ||
    value === "Korean" ||
    value === "Korean Program" ||
    value === "韩语授课" ||
    value === "韩文授课" ||
    value === "한국어"
  ) {
    return "korean";
  }

  if (
    value === PROGRAM_TRACK_VALUES.english ||
    value === "English" ||
    value === "英语授课" ||
    value === "英文授课" ||
    value === "영어"
  ) {
    return "english";
  }

  if (
    value === PROGRAM_TRACK_VALUES.bilingual ||
    value === "Bilingual" ||
    value === "Bilingual Program" ||
    value === "双语授课" ||
    value === "中韩双语授课" ||
    value === "이중언어"
  ) {
    return "bilingual";
  }

  return "";
}

export function getLocalizedMajorLabel(major, language = "zh") {
  if (!major) return "";

  if (language === "en") return major.en;
  if (language === "ko") return major.ko;
  return major.zh;
}

export function getMajorCatalog(applicationType = "undergraduate") {
  return applicationType === "graduate"
    ? GRADUATE_MAJOR_CATALOG
    : UNDERGRADUATE_MAJOR_CATALOG;
}

export function getMajorOptions({
  applicationType = "undergraduate",
  programTrack = "",
  language = "zh",
} = {}) {
  const catalog = getMajorCatalog(applicationType);
  const trackKey = getProgramTrackKey(programTrack);

  return catalog
    .filter((major) => {
      if (applicationType === "graduate") return true;
      if (!trackKey) return false;
      return major.tracks.includes(trackKey);
    })
    .map((major) => ({
      value: major.zh,
      label: getLocalizedMajorLabel(major, language),
      ko: major.ko,
      zh: major.zh,
      en: major.en,
      id: major.id,
      tracks: major.tracks,
    }));
}

export function getAllowedAdmissionTypeValues({
  applicationType = "undergraduate",
  programTrack = "",
} = {}) {
  if (applicationType !== "undergraduate") {
    return [];
  }

  const trackKey = getProgramTrackKey(programTrack);

  if (trackKey === "bilingual") {
    return [...UNDERGRADUATE_BILINGUAL_ALLOWED_ADMISSION_TYPE_VALUES];
  }

  return [...UNDERGRADUATE_ADMISSION_TYPE_VALUES];
}

export function filterAdmissionTypeOptions(options = [], params = {}) {
  const allowedValues = getAllowedAdmissionTypeValues(params);

  if (!allowedValues.length) {
    return options;
  }

  const allowedSet = new Set(allowedValues);
  return options.filter((option) => allowedSet.has(option.value));
}

export function isMajorAllowedForTrack({
  applicationType = "undergraduate",
  programTrack = "",
  major = "",
} = {}) {
  if (!major) return false;

  const options = getMajorOptions({
    applicationType,
    programTrack,
    language: "zh",
  });

  return options.some((option) => option.value === major);
}

export function isAdmissionTypeAllowedForTrack({
  applicationType = "undergraduate",
  programTrack = "",
  admissionType = "",
} = {}) {
  if (!admissionType) return false;

  const allowedValues = getAllowedAdmissionTypeValues({
    applicationType,
    programTrack,
  });

  if (!allowedValues.length) {
    return true;
  }

  return allowedValues.includes(admissionType);
}
