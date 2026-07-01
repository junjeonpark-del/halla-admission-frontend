const normalizeSearchValue = (value) =>
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

const COUNTRY_ALIASES = {
  BD: ["bangladeshi", "孟加拉", "孟加拉人"],
  CN: [
    "china",
    "chinese",
    "prc",
    "中国",
    "中国大陆",
    "中国内地",
    "中华人民共和国",
    "중국",
  ],
  KR: [
    "south korea",
    "south korean",
    "republic of korea",
    "rok",
    "韩国",
    "大韩民国",
    "한국",
    "대한민국",
  ],
  KP: ["north korea", "north korean", "朝鲜", "조선", "북한"],
  JP: ["japanese", "日本人", "일본인"],
  VN: ["vietnamese", "越南人", "베트남인"],
  MN: ["mongolian", "蒙古人", "몽골인"],
  NP: ["nepali", "nepalese", "尼泊尔人", "네팔인"],
  UZ: ["uzbek", "uzbekistani", "乌兹别克", "우즈베크"],
  KZ: ["kazakh", "kazakhstani", "哈萨克", "카자흐"],
  KG: ["kyrgyz", "kyrgyzstani", "吉尔吉斯", "키르기스"],
  TJ: ["tajik", "tajikistani", "塔吉克", "타지크"],
  IN: ["indian", "印度人", "인도인"],
  PK: ["pakistani", "巴基斯坦人", "파키스탄인"],
  ID: ["indonesian", "印尼人", "印度尼西亚人", "인도네시아인"],
  TH: ["thai", "泰国人", "태국인"],
  MY: ["malaysian", "马来西亚人", "말레이시아인"],
  PH: ["filipino", "filipina", "philippine", "菲律宾人", "필리핀인"],
  MM: ["burma", "burmese", "myanmarese", "缅甸人", "미얀마인"],
  RU: ["russian", "俄罗斯人", "러시아인"],
  US: ["american", "america", "美国人", "미국인"],
  GB: ["british", "britain", "great britain", "england", "英国人", "영국인"],
  CA: ["canadian", "加拿大人", "캐나다인"],
  AU: ["australian", "澳大利亚人", "호주인"],
  DE: ["german", "德国人", "독일인"],
  FR: ["french", "法国人", "프랑스인"],
};

function createDisplayNames(locale) {
  try {
    return new Intl.DisplayNames([locale], {
      type: "region",
    });
  } catch {
    return null;
  }
}

const DISPLAY_NAMES = {
  zh: createDisplayNames("zh-CN"),
  en: createDisplayNames("en"),
  ko: createDisplayNames("ko"),
};

function getRegionName(displayNames, alpha2) {
  return displayNames?.of(alpha2) || alpha2;
}

const ISO_ENTRIES = ISO_CODE_DATA
  .split(/[\s,]+/)
  .filter(Boolean)
  .map((item) => {
    const [alpha2, numeric, alpha3] = item.split(":");

    return {
      alpha2,
      alpha3,
      numeric: numeric.padStart(3, "0"),
    };
  });

export const COUNTRY_CATALOG = ISO_ENTRIES.map((entry) => {
  const names = {
    zh: getRegionName(DISPLAY_NAMES.zh, entry.alpha2),
    en: getRegionName(DISPLAY_NAMES.en, entry.alpha2),
    ko: getRegionName(DISPLAY_NAMES.ko, entry.alpha2),
  };

  const aliases = COUNTRY_ALIASES[entry.alpha2] || [];

  const searchValues = [
    entry.alpha2,
    entry.alpha3,
    entry.numeric,
    names.zh,
    names.en,
    names.ko,
    ...aliases,
  ]
    .map(normalizeSearchValue)
    .filter(Boolean);

  return Object.freeze({
    ...entry,
    names: Object.freeze(names),
    aliases: Object.freeze(aliases),
    searchValues: Object.freeze(searchValues),
  });
});

const COUNTRY_BY_NUMERIC = new Map(
  COUNTRY_CATALOG.map((country) => [
    country.numeric,
    country,
  ])
);

export function getCountryByNumericCode(value) {
  const raw = String(value || "").trim();

  if (!/^\d{1,3}$/.test(raw)) {
    return null;
  }

  return COUNTRY_BY_NUMERIC.get(
    raw.padStart(3, "0")
  ) || null;
}

export function getCountryLabel(country, language = "zh") {
  if (!country) return "";

  const locale =
    language === "en"
      ? "en"
      : language === "ko"
      ? "ko"
      : "zh";

  return country.names[locale] || country.names.en;
}

export function resolveCountry(value) {
  const raw = String(value || "").trim();

  if (!raw) return null;

  const numericMatch = getCountryByNumericCode(raw);

  if (numericMatch) {
    return numericMatch;
  }

  const normalized = normalizeSearchValue(raw);

  const matches = COUNTRY_CATALOG.filter(
    (country) =>
      country.searchValues.includes(normalized)
  );

  return matches.length === 1 ? matches[0] : null;
}

export function searchCountries(
  searchText,
  language = "zh"
) {
  const normalized = normalizeSearchValue(searchText);

  const results = normalized
    ? COUNTRY_CATALOG.filter((country) =>
        country.searchValues.some((value) =>
          value.includes(normalized)
        )
      )
    : [...COUNTRY_CATALOG];

  return results.sort((a, b) =>
    getCountryLabel(a, language).localeCompare(
      getCountryLabel(b, language),
      language === "ko"
        ? "ko"
        : language === "en"
        ? "en"
        : "zh-CN"
    )
  );
}

export function getCountrySelection(country) {
  if (!country) {
    return {
      code: "",
      name: "",
      country: null,
    };
  }

  return {
    code: country.numeric,
    name: country.names.en,
    country,
  };
}