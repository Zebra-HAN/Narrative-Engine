// ══════════════════════════════════════════
//  캐릭터 데이터
//  항목 추가할 때: items 배열 안에 아래 형식으로 추가
//  { id: "고유ID", name: "이름", sub: "설명" }
// ══════════════════════════════════════════

const CHARACTER_DATA = {

  archetype: {
    label: "원형",
    sub: "기본 인물 유형",
    multi: true,
    items: [
      { id: "ar1", name: "전사",    sub: "싸우는 자" },
      { id: "ar2", name: "탐험가",  sub: "찾는 자" },
      { id: "ar3", name: "치유자",  sub: "회복시키는 자" },
      { id: "ar4", name: "창조자",  sub: "만드는 자" },
      { id: "ar5", name: "광대",    sub: "웃기는 자" },
      { id: "ar6", name: "지도자",  sub: "이끄는 자" },
      { id: "ar7", name: "현자",    sub: "아는 자" },
      { id: "ar8", name: "반역자",  sub: "거부하는 자" },
      { id: "ar9", name: "수호자",  sub: "지키는 자" },
    ]
  },

  race: {
    label: "종족",
    sub: "출신 종족",
    multi: false,
    items: [
      { id: "rc1",  name: "인간",   sub: "가능성의 존재" },
      { id: "rc2",  name: "수인",   sub: "야성과 본능" },
      { id: "rc3",  name: "엘프",   sub: "오래된 지혜" },
      { id: "rc4",  name: "드워프", sub: "불굴의 장인" },
      { id: "rc5",  name: "언데드", sub: "죽음을 넘은 자" },
      { id: "rc6",  name: "정령",   sub: "자연의 화신" },
      { id: "rc7",  name: "악마",   sub: "욕망의 화신" },
      { id: "rc8",  name: "천사",   sub: "순수한 의지" },
      { id: "rc9",  name: "기계",   sub: "창조된 생명" },
      { id: "rc10", name: "용인",   sub: "힘의 혈통" },
    ]
  },

  job: {
    label: "직업",
    sub: "사회적 역할",
    multi: false,
    items: [
      { id: "jb1",  name: "검사",     sub: "칼의 길" },
      { id: "jb2",  name: "마법사",   sub: "지식과 주문" },
      { id: "jb3",  name: "도둑",     sub: "그림자의 길" },
      { id: "jb4",  name: "사냥꾼",   sub: "추적과 생존" },
      { id: "jb5",  name: "성직자",   sub: "신의 대리인" },
      { id: "jb6",  name: "연금술사", sub: "변환의 기술" },
      { id: "jb7",  name: "음유시인", sub: "말과 노래" },
      { id: "jb8",  name: "귀족",     sub: "권력과 책임" },
      { id: "jb9",  name: "상인",     sub: "거래의 달인" },
      { id: "jb10", name: "의사",     sub: "생명을 다루는 자" },
      { id: "jb11", name: "기사",     sub: "명예의 갑옷" },
      { id: "jb12", name: "탐정",     sub: "진실을 파는 자" },
    ]
  },

  attribute: {
    label: "속성",
    sub: "자연 속성",
    multi: true,
    items: [
      { id: "at1", name: "불",   sub: "열정·파괴" },
      { id: "at2", name: "물",   sub: "유연·치유" },
      { id: "at3", name: "바람", sub: "자유·속도" },
      { id: "at4", name: "번개", sub: "예민·충격" },
      { id: "at5", name: "대지", sub: "안정·힘" },
      { id: "at6", name: "어둠", sub: "공포·비밀" },
      { id: "at7", name: "빛",   sub: "희망·폭로" },
      { id: "at8", name: "공허", sub: "소멸·절망" },
    ]
  },

  trauma: {
    label: "트라우마",
    sub: "내면의 상처",
    multi: true,
    items: [
      { id: "tr1", name: "유기",        sub: "버려진 기억" },
      { id: "tr2", name: "배신",        sub: "믿었던 자에게" },
      { id: "tr3", name: "상실",        sub: "소중한 것을 잃음" },
      { id: "tr4", name: "죄책",        sub: "못 막은 일" },
      { id: "tr5", name: "무력감",      sub: "아무것도 못 했던 순간" },
      { id: "tr6", name: "정체성 부정", sub: "존재 자체의 부정" },
      { id: "tr7", name: "폭력",        sub: "당한 상처" },
      { id: "tr8", name: "거절",        sub: "반복된 부정" },
    ]
  },

  desire: {
    label: "욕망",
    sub: "표면적 Want",
    multi: false,
    items: [
      { id: "dc1", name: "강해지고 싶다",      sub: "성장 동기" },
      { id: "dc2", name: "인정받고 싶다",      sub: "자존 동기" },
      { id: "dc3", name: "지키고 싶다",        sub: "보호 동기" },
      { id: "dc4", name: "진실을 알고 싶다",   sub: "탐구 동기" },
      { id: "dc5", name: "용서받고 싶다",      sub: "속죄 동기" },
      { id: "dc6", name: "연결되고 싶다",      sub: "유대 동기" },
      { id: "dc7", name: "자유로워지고 싶다",  sub: "해방 동기" },
      { id: "dc8", name: "복수하고 싶다",      sub: "분노 동기" },
    ]
  },

  values: {
    label: "가치관",
    sub: "신념과 판단 기준",
    multi: true,
    items: [
      { id: "vl1", name: "명예",   sub: "체면과 긍지" },
      { id: "vl2", name: "생존",   sub: "어떻게든 살아남기" },
      { id: "vl3", name: "정의",   sub: "옳고 그름" },
      { id: "vl4", name: "자유",   sub: "구속 거부" },
      { id: "vl5", name: "가족",   sub: "혈연과 유대" },
      { id: "vl6", name: "지식",   sub: "앎의 추구" },
      { id: "vl7", name: "힘",     sub: "강함의 추구" },
      { id: "vl8", name: "사랑",   sub: "연결과 헌신" },
    ]
  },

  goal: {
    label: "목표",
    sub: "이야기 안에서의 목적",
    multi: false,
    items: [
      { id: "gl1", name: "적을 쓰러뜨린다",  sub: "전투 목표" },
      { id: "gl2", name: "진실을 밝힌다",    sub: "탐구 목표" },
      { id: "gl3", name: "고향으로 돌아간다", sub: "귀환 목표" },
      { id: "gl4", name: "누군가를 구한다",  sub: "구원 목표" },
      { id: "gl5", name: "세계를 바꾼다",    sub: "혁명 목표" },
      { id: "gl6", name: "과거를 청산한다",  sub: "속죄 목표" },
      { id: "gl7", name: "자신을 증명한다",  sub: "인정 목표" },
    ]
  },

};
