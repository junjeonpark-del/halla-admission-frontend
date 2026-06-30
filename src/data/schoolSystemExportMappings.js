const normalizeLookupValue = (value) =>
  String(value || "")
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s()（）【】[\]{}／/、,，.;；:_-]+/g, "");

const ISO_CODE_DATA = `
DZ:012:DZA,EG:818:EGY,LY:434:LBY,MA:504:MAR,SD:729:SDN,TN:788:TUN,EH:732:ESH,
IO:086:IOT,BI:108:BDI,KM:174:COM,DJ:262:DJI,ER:232:ERI,ET:231:ETH,TF:260:ATF,
KE:404:KEN,MG:450:MDG,MW:454:MWI,MU:480:MUS,YT:175:MYT,MZ:508:MOZ,RE:638:REU,
RW:646:RWA,SC:690:SYC,SO:706:SOM,SS:728:SSD,UG:800:UGA,TZ:834:TZA,ZM:894:ZMB,
ZW:716:ZWE,AO:024:AGO,CM:120:CMR,CF:140:CAF,TD:148:TCD,CG:178:COG,CD:180:COD,
GQ:226:GNQ,GA:266:GAB,ST:678:STP,BW:072:BWA,SZ:748:SWZ,LS:426:LSO,NA:516:NAM,
ZA:710:ZAF,BJ:204:BEN,BF:854:BFA,CV:132:CPV,CI:384:CIV,GM:270:GMB,GH:288:GHA,
GN:324:GIN,GW:624:GNB,LR:430:LBR,ML:466:MLI,MR:478:MRT,NE:562:NER,NG:566:NGA,
SH:654:SHN,SN:686:SEN,SL:694:SLE,TG:768:TGO,
AI:660:AIA,AG:028:ATG,AW:533:ABW,BS:044:BHS,BB:052:BRB,BQ:535:BES,VG:092:VGB,
KY:136:CYM,CU:192:CUB,CW:531:CUW,DM:212:DMA,DO:214:DOM,GD:308:GRD,GP:312:GLP,
HT:332:HTI,JM:388:JAM,MQ:474:MTQ,MS:500:MSR,PR:630:PRI,BL:652:BLM,KN:659:KNA,
LC:662:LCA,MF:663:MAF,VC:670:VCT,SX:534:SXM,TT:780:TTO,TC:796:TCA,VI:850:VIR,
BZ:084:BLZ,CR:188:CRI,SV:222:SLV,GT:320:GTM,HN:340:HND,MX:484:MEX,NI:558:NIC,
PA:591:PAN,AR:032:ARG,BO:068:BOL,BV:074:BVT,BR:076:BRA,CL:152:CHL,CO:170:COL,
EC:218:ECU,FK:238:FLK,GF:254:GUF,GY:328:GUY,PY:600:PRY,PE:604:PER,GS:239:SGS,
SR:740:SUR,UY:858:URY,VE:862:VEN,BM:060:BMU,CA:124:CAN,GL:304:GRL,PM:666:SPM,
US:840:USA,AQ:010:ATA,
KZ:398:KAZ,KG:417:KGZ,TJ:762:TJK,TM:795:TKM,UZ:860:UZB,
CN:156:CHN,HK:344:HKG,MO:446:MAC,KP:408:PRK,JP:392:JPN,MN:496:MNG,KR:410:KOR,
TW:158:TWN,BN:096:BRN,KH:116:KHM,ID:360:IDN,LA:418:LAO,MY:458:MYS,MM:104:MMR,
PH:608:PHL,SG:702:SGP,TH:764:THA,TL:626:TLS,VN:704:VNM,AF:004:AFG,BD:050:BGD,
BT:064:BTN,IN:356:IND,IR:364:IRN,MV:462:MDV,NP:524:NPL,PK:586:PAK,LK:144:LKA,
AM:051:ARM,AZ:031:AZE,BH:048:BHR,CY:196:CYP,GE:268:GEO,IQ:368:IRQ,IL:376:ISR,
JO:400:JOR,KW:414:KWT,LB:422:LBN,OM:512:OMN,QA:634:QAT,SA:682:SAU,PS:275:PSE,
SY:760:SYR,TR:792:TUR,AE:784:ARE,YE:887:YEM,
BY:112:BLR,BG:100:BGR,CZ:203:CZE,HU:348:HUN,PL:616:POL,MD:498:MDA,RO:642:ROU,
RU:643:RUS,SK:703:SVK,UA:804:UKR,AX:248:ALA,DK:208:DNK,EE:233:EST,FO:234:FRO,
FI:246:FIN,GG:831:GGY,IS:352:ISL,IE:372:IRL,IM:833:IMN,JE:832:JEY,LV:428:LVA,
LT:440:LTU,NO:578:NOR,SJ:744:SJM,SE:752:SWE,GB:826:GBR,AL:008:ALB,AD:020:AND,
BA:070:BIH,HR:191:HRV,GI:292:GIB,GR:300:GRC,VA:336:VAT,IT:380:ITA,MT:470:MLT,
ME:499:MNE,MK:807:MKD,PT:620:PRT,SM:674:SMR,RS:688:SRB,SI:705:SVN,ES:724:ESP,
AT:040:AUT,BE:056:BEL,FR:250:FRA,DE:276:DEU,LI:438:LIE,LU:442:LUX,MC:492:MCO,
NL:528:NLD,CH:756:CHE,
AU:036:AUS,CX:162:CXR,CC:166:CCK,HM:334:HMD,NZ:554:NZL,NF:574:NFK,FJ:242:FJI,
NC:540:NCL,PG:598:PNG,SB:090:SLB,VU:548:VUT,GU:316:GUM,KI:296:KIR,MH:584:MHL,
FM:583:FSM,NR:520:NRU,MP:580:MNP,PW:585:PLW,UM:581:UMI,AS:016:ASM,CK:184:COK,
PF:258:PYF,NU:570:NIU,PN:612:PCN,WS:882:WSM,TK:772:TKL,TO:776:TON,TV:798:TUV,
WF:876:WLF
`;

const ISO_ENTRIES = ISO_CODE_DATA
  .split(/[\s,]+/)
  .filter(Boolean)
  .map((item) => {
    const [alpha2, numeric, alpha3] = item.split(":");
    return { alpha2, numeric, alpha3 };
  });

let countryAliasMap = null;

function getCountryAliasMap() {
  if (countryAliasMap) return countryAliasMap;

  countryAliasMap = new Map();

  const displayNames = ["en", "zh-CN", "ko"]
    .map((locale) => {
      try {
        return new Intl.DisplayNames([locale], { type: "region" });
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  ISO_ENTRIES.forEach((entry) => {
    [
      entry.alpha2,
      entry.alpha3,
      entry.numeric,
      ...displayNames.map((display) => display.of(entry.alpha2)),
    ]
      .filter(Boolean)
      .forEach((alias) => {
        countryAliasMap.set(normalizeLookupValue(alias), entry.numeric);
      });
  });

  const manualAliases = {
    china: "156",
    prc: "156",
    peoplesrepublicofchina: "156",
    中国: "156",
    中国大陆: "156",
    中国内地: "156",
    中华人民共和国: "156",
    korea: "410",
    southkorea: "410",
    republicofkorea: "410",
    rok: "410",
    韩国: "410",
    大韩民国: "410",
    usa: "840",
    america: "840",
    美国: "840",
    uk: "826",
    britain: "826",
    greatbritain: "826",
    england: "826",
    英国: "826",
    russia: "643",
    俄罗斯: "643",
    vietnam: "704",
    越南: "704",
    uzbek: "860",
    乌兹别克斯坦: "860",
    northkorea: "408",
    朝鲜: "408",
    hongkong: "344",
    香港: "344",
    macao: "446",
    macau: "446",
    澳门: "446",
    taiwan: "158",
    台湾: "158",
  };

  Object.entries(manualAliases).forEach(([alias, numeric]) => {
    countryAliasMap.set(normalizeLookupValue(alias), numeric);
  });

  return countryAliasMap;
}

export function toIsoNumericCountryCode(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";

  if (/^\d{1,3}$/.test(raw)) {
    return raw.padStart(3, "0");
  }

  return getCountryAliasMap().get(normalizeLookupValue(raw)) || "";
}

const ADMISSION_TYPE_CODES = {
  Freshman: "01",
  "Transfer (2nd Year)": "02",
  "Transfer (3rd Year)": "03",
  "Transfer (4th Year)": "04",
  "Dual Degree (2+2)": "05",
  "Dual Degree (3+1)": "06",
};

export function getSchoolAdmissionTypeCode(value) {
  return ADMISSION_TYPE_CODES[String(value || "").trim()] || "";
}

const TRACK_CODES = {
  "Korean Track": "01",
  "English Track": "02",
  "Bilingual Program (Chinese)": "03",
};

export function getSchoolTrackCode(value) {
  return TRACK_CODES[String(value || "").trim()] || "";
}

const MAJOR_CODES_BY_ID = {
  mechanical_automotive_engineering: "01",
  future_mobility_engineering: "02",
  urban_infrastructure_engineering: "03",
  computer_engineering: "04",
  it_software: "05",
  electrical_electronic_engineering: "06",
  ai_information_security: "07",
  railway_operation_systems: "08",
  media_advertising_contents: "09",
  video_production: "10",
  architecture: "11",
  fire_safety: "12",
  social_welfare: "13",
  police_administration: "14",
  business_administration: "15",
  hotel_aviation_foodservice_management: "16",
  culture_tourism_management: "17",
  global_business: "18",
  beauty_design: "19",
  sports: "20",
  division_of_liberal_studies: "21",
};

export function getSchoolMajorCode(value, majorCatalog = []) {
  const normalized = normalizeLookupValue(value);
  if (!normalized) return "";

  const matched = majorCatalog.find((major) =>
    [major.id, major.ko, major.zh, major.en]
      .filter(Boolean)
      .some((item) => normalizeLookupValue(item) === normalized)
  );

  return matched ? MAJOR_CODES_BY_ID[matched.id] || "" : "";
}

const CEFR_CODES = {
  A1: "1",
  A2: "2",
  B1: "3",
  B2: "4",
  C1: "5",
  C2: "9",
};

export function getCefrCode(value) {
  const normalized = String(value || "")
    .toUpperCase()
    .replace(/CEFR/g, "")
    .replace(/\s+/g, "")
    .trim();

  return CEFR_CODES[normalized] || "";
}

export function getSponsorRelationCode(value) {
  const normalized = normalizeLookupValue(value);

  if (
    ["father", "dad", "父亲", "爸爸", "아버지", "부"].includes(normalized)
  ) {
    return "01";
  }

  if (
    ["mother", "mom", "母亲", "妈妈", "어머니", "모"].includes(normalized)
  ) {
    return "02";
  }

  if (
    [
      "sibling",
      "siblings",
      "brother",
      "sister",
      "兄弟",
      "姐妹",
      "兄弟姐妹",
      "형제",
      "자매",
    ].includes(normalized)
  ) {
    return "03";
  }

  if (
    ["relative", "relatives", "亲戚", "친척"].includes(normalized)
  ) {
    return "04";
  }

  if (
    ["self", "本人", "本 人", "본인"].map(normalizeLookupValue).includes(normalized)
  ) {
    return "06";
  }

  return normalized ? "05" : "";
}