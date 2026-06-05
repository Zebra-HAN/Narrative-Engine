/* ════════════════════════════════════════════════
   DATA DEFINITIONS
════════════════════════════════════════════════ */
const NAV_DATA = {
  character: {
    label: '캐릭터',
    resetLabel: '캐릭터 초기화',
    subs: [
      { id:'archetype', label:'원형', icon:'<img src="images/Giant_Elf.png" class="diamond-img">' },
      { id:'race',      label:'종족', icon:'🐉' },
      { id:'job',       label:'직업', icon:'⚒' },
      { id:'personality',label:'성격',icon:'💫' },
      { id:'attribute', label:'속성', icon:'⚡' },
      { id:'ability',   label:'능력', icon:'✨' },
      { id:'relation',  label:'관계', icon:'🔗' },
    ]
  },
  narrative2: {
    label: '스토리',
    resetLabel: '스토리 초기화',
    subs: [
      { id:'goal',      label:'목표', icon:'🎯' },
      { id:'desire',    label:'욕망', icon:'🔥' },
      { id:'conflict',  label:'갈등', icon:'⚔' },
      { id:'distort',   label:'왜곡', icon:'🌀' },
      { id:'event',     label:'사건', icon:'💥' },
      { id:'choice',    label:'선택', icon:'⚖' },
      { id:'twist',     label:'반전', icon:'🌊' },
      { id:'ending',    label:'결말', icon:'🌅' },
    ]
  },
  world: {
    label: '세계관',
    resetLabel: '세계관 초기화',
    subs: [
      { id:'tech',      label:'기술', icon:'⚙' },
      { id:'culture',   label:'문화', icon:'🏛' },
      { id:'setting',   label:'배경', icon:'🗺' },
    ]
  },
  compass: {
    label: '나침반',
    resetLabel: '나침반 초기화',
    subs: [
      { id:'type',      label:'서사 유형', icon:'📐' },
      { id:'genre',     label:'장르',     icon:'🎭' },
      { id:'message',   label:'메시지',   icon:'📢' },
      { id:'theme',     label:'테마',     icon:'🌙' },
      { id:'reader',    label:'독자 체험', icon:'👁' },
      { id:'tone',      label:'감정 톤',  icon:'🎼' },
    ]
  }
};

/* 각 서브메뉴에 표시할 카드 20개 (아이콘 + 이름) */
const CARD_DATA = {
  archetype: [
    {icon:'<img src="images/Giant_Elf.png" class="card-img">', name:'영웅'},
     {icon:'🧙',name:'현자'},{icon:'😈',name:'악당'},
    {icon:'🃏',name:'트릭스터'},{icon:'👼',name:'수호자'},{icon:'🔮',name:'예언자'},
    {icon:'⚔',name:'전사'},{icon:'💀',name:'파멸자'},{icon:'🌹',name:'연인'},
    {icon:'👑',name:'통치자'},{icon:'🌿',name:'치유자'},{icon:'🕵',name:'탐정'},
    {icon:'🐺',name:'이방인'},{icon:'🌟',name:'선택받은 자'},{icon:'🦊',name:'교활한 자'},
    {icon:'🔗',name:'속박된 자'},{icon:'🌊',name:'방랑자'},{icon:'⚖',name:'심판자'},
    {icon:'🌙',name:'어둠의 자'},{icon:'☀',name:'빛의 자'},
  ],
  race: [
    {icon:'🧝',name:'엘프'},{icon:'🪨',name:'드워프'},{icon:'🧛',name:'뱀파이어'},
    {icon:'🐉',name:'드래곤족'},{icon:'👁',name:'신족'},{icon:'🌿',name:'수인족'},
    {icon:'💀',name:'언데드'},{icon:'🌊',name:'해양족'},{icon:'🔥',name:'화염족'},
    {icon:'⚡',name:'뇌전족'},{icon:'🌙',name:'달의 종족'},{icon:'☀',name:'태양족'},
    {icon:'🌀',name:'공허족'},{icon:'🍃',name:'정령족'},{icon:'🧬',name:'혼혈'},
    {icon:'🤖',name:'기계인'},{icon:'👤',name:'인간'},{icon:'🦋',name:'환상족'},
    {icon:'🌑',name:'심연족'},{icon:'💎',name:'결정족'},
  ],
  job: [
    {icon:'⚔',name:'검사'},{icon:'🏹',name:'궁수'},{icon:'🧙',name:'마법사'},
    {icon:'🛡',name:'기사'},{icon:'🗡',name:'암살자'},{icon:'🎵',name:'음유시인'},
    {icon:'⚕',name:'치유사'},{icon:'🔧',name:'장인'},{icon:'📜',name:'학자'},
    {icon:'🏴',name:'해적'},{icon:'🐾',name:'사냥꾼'},{icon:'💰',name:'상인'},
    {icon:'👑',name:'귀족'},{icon:'🌿',name:'드루이드'},{icon:'🎭',name:'배우'},
    {icon:'🔮',name:'점술사'},{icon:'🌑',name:'네크로맨서'},{icon:'🐉',name:'용기사'},
    {icon:'⚗',name:'연금술사'},{icon:'🕵',name:'첩보원'},
  ],
  personality: [
    {icon:'🔥',name:'열정적'},{icon:'❄',name:'냉정한'},{icon:'🌊',name:'유연한'},
    {icon:'🪨',name:'완고한'},{icon:'🌟',name:'낙관적'},{icon:'🌑',name:'비관적'},
    {icon:'💫',name:'충동적'},{icon:'⚖',name:'신중한'},{icon:'🎭',name:'이중적'},
    {icon:'🦁',name:'용감한'},{icon:'🐇',name:'소심한'},{icon:'🦊',name:'교활한'},
    {icon:'🕊',name:'온화한'},{icon:'🐺',name:'거친'},{icon:'🌹',name:'낭만적'},
    {icon:'🔬',name:'분석적'},{icon:'🎨',name:'예술적'},{icon:'🤝',name:'친화적'},
    {icon:'👤',name:'고독한'},{icon:'✨',name:'신비로운'},
  ],
  attribute: [
    {icon:'🔥',name:'화염'},{icon:'❄',name:'빙결'},{icon:'⚡',name:'번개'},
    {icon:'🌊',name:'물'},{icon:'🌿',name:'자연'},{icon:'💨',name:'바람'},
    {icon:'🪨',name:'대지'},{icon:'✨',name:'빛'},{icon:'🌑',name:'어둠'},
    {icon:'🌀',name:'공허'},{icon:'☠',name:'독'},{icon:'⚙',name:'기계'},
    {icon:'🧿',name:'마법'},{icon:'💫',name:'성스러움'},{icon:'💀',name:'죽음'},
    {icon:'🌙',name:'달'},{icon:'☀',name:'태양'},{icon:'🌌',name:'우주'},
    {icon:'🩸',name:'피'},{icon:'🎭',name:'환상'},
  ],
  ability: [
    {icon:'🔮',name:'예지'},{icon:'🌀',name:'공간이동'},{icon:'⏳',name:'시간조작'},
    {icon:'🔗',name:'결박'},{icon:'🌊',name:'소환'},{icon:'💥',name:'폭발'},
    {icon:'🛡',name:'방벽'},{icon:'👁',name:'투시'},{icon:'🎭',name:'변신'},
    {icon:'💀',name:'부활'},{icon:'⚡',name:'가속'},{icon:'🌿',name:'치유'},
    {icon:'🔥',name:'소각'},{icon:'❄',name:'동결'},{icon:'💫',name:'정화'},
    {icon:'🌑',name:'잠식'},{icon:'🎵',name:'매혹'},{icon:'🧠',name:'독심'},
    {icon:'⚔',name:'검기'},{icon:'🌌',name:'절대영역'},
  ],
  relation: [
    {icon:'👥',name:'동료'},{icon:'❤',name:'연인'},{icon:'🤝',name:'동맹'},
    {icon:'⚔',name:'라이벌'},{icon:'🐍',name:'배신자'},{icon:'🛡',name:'보호자'},
    {icon:'👑',name:'주종'},{icon:'🎭',name:'쌍둥이'},{icon:'💀',name:'숙적'},
    {icon:'🌹',name:'짝사랑'},{icon:'🔗',name:'운명적 인연'},{icon:'🌙',name:'비밀결사'},
    {icon:'🐾',name:'사제지간'},{icon:'👤',name:'고독한 자'},{icon:'🌊',name:'이별'},
    {icon:'🔮',name:'예언의 관계'},{icon:'💫',name:'전생인연'},{icon:'🌿',name:'치유자와 상처'},
    {icon:'⚖',name:'거래관계'},{icon:'🌑',name:'어둠의 계약'},
  ],
  goal: [
    {icon:'🏆',name:'최강'},{icon:'👑',name:'왕위'},{icon:'💎',name:'보물'},
    {icon:'🔮',name:'진실'},{icon:'🌅',name:'평화'},{icon:'💀',name:'복수'},
    {icon:'❤',name:'사랑'},{icon:'🌿',name:'생존'},{icon:'🌌',name:'신'},
    {icon:'⚔',name:'전쟁 종식'},{icon:'🔗',name:'자유'},{icon:'🌊',name:'귀환'},
    {icon:'🧬',name:'불사'},{icon:'🔥',name:'혁명'},{icon:'💫',name:'구원'},
    {icon:'🌙',name:'기억'},{icon:'👥',name:'가족'},{icon:'⚖',name:'정의'},
    {icon:'🎭',name:'인정'},{icon:'🌱',name:'성장'},
  ],
  desire: [
    {icon:'🔥',name:'힘'},{icon:'❤',name:'사랑'},{icon:'💎',name:'소유'},
    {icon:'👁',name:'인정'},{icon:'🌊',name:'자유'},{icon:'💀',name:'복수'},
    {icon:'🌿',name:'안식'},{icon:'🌟',name:'영광'},{icon:'🔮',name:'지식'},
    {icon:'💫',name:'신성'},{icon:'🌑',name:'망각'},{icon:'⚔',name:'전투'},
    {icon:'🌹',name:'아름다움'},{icon:'🎭',name:'변신'},{icon:'🌙',name:'비밀'},
    {icon:'⚖',name:'균형'},{icon:'👑',name:'지배'},{icon:'🐾',name:'야성'},
    {icon:'🌌',name:'초월'},{icon:'🔗',name:'연결'},
  ],
  conflict: [
    {icon:'⚔',name:'인간 vs 인간'},{icon:'🌊',name:'인간 vs 자연'},
    {icon:'🤖',name:'인간 vs 기계'},{icon:'🌑',name:'인간 vs 어둠'},
    {icon:'💫',name:'자아 vs 자아'},{icon:'👑',name:'개인 vs 사회'},
    {icon:'🔮',name:'운명 vs 자유의지'},{icon:'⚖',name:'선 vs 악'},
    {icon:'❤',name:'사랑 vs 의무'},{icon:'🌿',name:'생존 vs 신념'},
    {icon:'💀',name:'삶 vs 죽음'},{icon:'🎭',name:'진실 vs 거짓'},
    {icon:'🔥',name:'욕망 vs 이성'},{icon:'🌙',name:'과거 vs 현재'},
    {icon:'🌌',name:'인간 vs 신'},{icon:'🐺',name:'본능 vs 문명'},
    {icon:'🌊',name:'혁명 vs 질서'},{icon:'💎',name:'희생 vs 이익'},
    {icon:'👥',name:'집단 vs 개인'},{icon:'⚡',name:'전통 vs 변화'},
  ],
  distort: [
    {icon:'🎭',name:'거짓 믿음'},{icon:'🌑',name:'자기부정'},
    {icon:'💀',name:'트라우마'},{icon:'🔗',name:'집착'},
    {icon:'🌀',name:'망상'},{icon:'⚖',name:'합리화'},
    {icon:'👁',name:'편견'},{icon:'🐍',name:'배신의 상처'},
    {icon:'🔥',name:'분노'},{icon:'❄',name:'감정 마비'},
    {icon:'🌊',name:'공허'},{icon:'🧠',name:'인지왜곡'},
    {icon:'💫',name:'이상화'},{icon:'🌙',name:'집단 사고'},
    {icon:'⚔',name:'복수심'},{icon:'🌿',name:'죄책감'},
    {icon:'👑',name:'자만'},{icon:'🐾',name:'공포'},
    {icon:'🎵',name:'유혹'},{icon:'🔮',name:'예언의 굴레'},
  ],
  event: [
    {icon:'🌋',name:'대재앙'},{icon:'💥',name:'충돌'},
    {icon:'👑',name:'왕의 죽음'},{icon:'🔮',name:'예언 성취'},
    {icon:'❤',name:'첫 만남'},{icon:'💀',name:'배신'},
    {icon:'🌊',name:'전쟁'},{icon:'🌱',name:'탄생'},
    {icon:'🌅',name:'각성'},{icon:'🔗',name:'계약'},
    {icon:'🎭',name:'정체 폭로'},{icon:'⚔',name:'결투'},
    {icon:'🌙',name:'밤의 습격'},{icon:'💎',name:'보물 발견'},
    {icon:'🌿',name:'치유'},{icon:'🌌',name:'차원 이동'},
    {icon:'🔥',name:'혁명'},{icon:'⚖',name:'재판'},
    {icon:'🌑',name:'봉인 해제'},{icon:'✨',name:'기적'},
  ],
  choice: [
    {icon:'⚖',name:'희생 vs 생존'},{icon:'❤',name:'사랑 vs 의무'},
    {icon:'👑',name:'권력 vs 양심'},{icon:'💀',name:'복수 vs 용서'},
    {icon:'🌊',name:'도피 vs 직면'},{icon:'🔗',name:'자유 vs 안전'},
    {icon:'🌿',name:'진실 vs 평화'},{icon:'🎭',name:'위선 vs 솔직'},
    {icon:'⚔',name:'싸움 vs 화해'},{icon:'🌙',name:'과거 vs 미래'},
    {icon:'💫',name:'개인 vs 공동체'},{icon:'🔥',name:'욕망 vs 신념'},
    {icon:'🌑',name:'어둠 vs 빛'},{icon:'🐺',name:'본능 vs 이성'},
    {icon:'🌌',name:'초월 vs 인간'},{icon:'💎',name:'명예 vs 생명'},
    {icon:'🌱',name:'성장 vs 안주'},{icon:'👥',name:'혼자 vs 함께'},
    {icon:'🔮',name:'운명 수용 vs 저항'},{icon:'⚡',name:'행동 vs 침묵'},
  ],
  twist: [
    {icon:'🎭',name:'적이 아군'},{icon:'💀',name:'아군이 적'},
    {icon:'🔮',name:'예언의 반전'},{icon:'👁',name:'정체 폭로'},
    {icon:'🌑',name:'선인의 타락'},{icon:'⚔',name:'악인의 구원'},
    {icon:'🌊',name:'죽은 자의 귀환'},{icon:'🌀',name:'시간의 역전'},
    {icon:'💫',name:'기억의 조작'},{icon:'🔗',name:'진짜 목적'},
    {icon:'🌙',name:'꿈과 현실'},{icon:'💥',name:'동기의 반전'},
    {icon:'🌿',name:'희생의 이유'},{icon:'🌌',name:'세계의 진실'},
    {icon:'⚖',name:'판단의 오류'},{icon:'❤',name:'사랑의 배신'},
    {icon:'👑',name:'왕의 비밀'},{icon:'🐍',name:'내부의 적'},
    {icon:'🔥',name:'신의 거짓'},{icon:'✨',name:'기적의 대가'},
  ],
  ending: [
    {icon:'🌅',name:'완전한 승리'},{icon:'⚖',name:'쓸쓸한 승리'},
    {icon:'💀',name:'비극적 결말'},{icon:'🌱',name:'열린 결말'},
    {icon:'🔗',name:'순환의 결말'},{icon:'🌊',name:'희생의 결말'},
    {icon:'❤',name:'화해'},{icon:'🌑',name:'타락의 결말'},
    {icon:'💫',name:'초월의 결말'},{icon:'🌿',name:'재생'},
    {icon:'👑',name:'왕국의 건설'},{icon:'🌌',name:'새로운 세계'},
    {icon:'🎭',name:'아이러니'},{icon:'💎',name:'대가의 결말'},
    {icon:'⚡',name:'혁명 성공'},{icon:'🌙',name:'진실 수용'},
    {icon:'🔥',name:'자기 파멸'},{icon:'✨',name:'구원'},
    {icon:'⚔',name:'끝나지 않은 싸움'},{icon:'🌸',name:'평화'},
  ],
  tech: [
    {icon:'⚙',name:'증기 기술'},{icon:'💡',name:'전기 문명'},
    {icon:'🤖',name:'인공지능'},{icon:'🚀',name:'우주 항법'},
    {icon:'🧬',name:'생체공학'},{icon:'🔮',name:'마법 기계'},
    {icon:'⚗',name:'연금술'},{icon:'📡',name:'통신망'},
    {icon:'🌌',name:'차원 기술'},{icon:'⚡',name:'에너지 결정'},
    {icon:'🏗',name:'거대 건축'},{icon:'🛡',name:'방어 시스템'},
    {icon:'🌊',name:'해양 기술'},{icon:'🌿',name:'바이오 기술'},
    {icon:'💻',name:'사이버네틱스'},{icon:'🔭',name:'천문학'},
    {icon:'⚖',name:'자동화'},{icon:'🔬',name:'나노 기술'},
    {icon:'🌑',name:'어둠의 기술'},{icon:'✨',name:'신성 공학'},
  ],
  culture: [
    {icon:'👑',name:'군주제'},{icon:'⚖',name:'공화제'},
    {icon:'🌿',name:'자연 숭배'},{icon:'🔥',name:'전쟁 문화'},
    {icon:'📜',name:'학문 중심'},{icon:'🎭',name:'예술 중심'},
    {icon:'🌊',name:'해양 문화'},{icon:'🏛',name:'고대 문명'},
    {icon:'🌑',name:'어둠의 의식'},{icon:'✨',name:'신성 종교'},
    {icon:'🔗',name:'씨족 사회'},{icon:'👥',name:'집단주의'},
    {icon:'💎',name:'상업 중심'},{icon:'⚔',name:'명예 사회'},
    {icon:'🌙',name:'신비 결사'},{icon:'🌌',name:'다신교'},
    {icon:'🌿',name:'자연 공존'},{icon:'🤖',name:'기계 숭배'},
    {icon:'🌊',name:'유목 문화'},{icon:'🏔',name:'산악 문화'},
  ],
  setting: [
    {icon:'🏰',name:'중세 왕국'},{icon:'🌆',name:'미래 도시'},
    {icon:'🌿',name:'원시 밀림'},{icon:'🌊',name:'심해 세계'},
    {icon:'🏔',name:'고산 왕국'},{icon:'🌌',name:'우주'},
    {icon:'🌑',name:'지하 세계'},{icon:'🌅',name:'사막 제국'},
    {icon:'❄',name:'빙하 세계'},{icon:'🔥',name:'화산 땅'},
    {icon:'🌙',name:'달 세계'},{icon:'🌀',name:'차원 공간'},
    {icon:'🏛',name:'고대 유적'},{icon:'🌿',name:'마법 숲'},
    {icon:'💀',name:'폐허'},{icon:'🌊',name:'섬 군도'},
    {icon:'⚙',name:'스팀펑크 도시'},{icon:'🎭',name:'환상 무대'},
    {icon:'🌸',name:'평화로운 마을'},{icon:'🌑',name:'암흑 지대'},
  ],
  type: [
    {icon:'🌟',name:'영웅 서사'},{icon:'💀',name:'비극'},
    {icon:'🌱',name:'성장담'},{icon:'🌊',name:'모험담'},
    {icon:'❤',name:'로맨스'},{icon:'🕵',name:'추리'},
    {icon:'🌌',name:'서사시'},{icon:'🎭',name:'풍자'},
    {icon:'🔮',name:'신화'},{icon:'🌿',name:'힐링'},
    {icon:'💥',name:'액션'},{icon:'⚖',name:'철학적 탐구'},
    {icon:'🌙',name:'다크 판타지'},{icon:'🤖',name:'SF'},
    {icon:'🔥',name:'혁명 서사'},{icon:'💫',name:'초자연'},
    {icon:'👥',name:'앙상블'},{icon:'🏆',name:'스포츠'},
    {icon:'🌑',name:'호러'},{icon:'🌸',name:'일상'},
  ],
  genre: [
    {icon:'⚔',name:'판타지'},{icon:'🚀',name:'SF'},
    {icon:'❤',name:'로맨스'},{icon:'🕵',name:'미스터리'},
    {icon:'💀',name:'호러'},{icon:'🌌',name:'서사시'},
    {icon:'🎭',name:'드라마'},{icon:'💥',name:'액션'},
    {icon:'🌿',name:'힐링'},{icon:'🌸',name:'일상'},
    {icon:'🔥',name:'무협'},{icon:'👑',name:'궁중'},
    {icon:'🌑',name:'다크 판타지'},{icon:'⚗',name:'스팀펑크'},
    {icon:'🌊',name:'해양'},{icon:'🏔',name:'고산'},
    {icon:'🤖',name:'사이버펑크'},{icon:'🌙',name:'고딕'},
    {icon:'🔮',name:'신화'},{icon:'💫',name:'초자연'},
  ],
  message: [
    {icon:'🌱',name:'성장'},{icon:'❤',name:'사랑의 힘'},
    {icon:'⚖',name:'정의'},{icon:'🔥',name:'용기'},
    {icon:'🌊',name:'자유'},{icon:'💀',name:'희생의 의미'},
    {icon:'🌿',name:'공존'},{icon:'💫',name:'초월'},
    {icon:'🌙',name:'어둠 속의 빛'},{icon:'🔗',name:'연결'},
    {icon:'👑',name:'권력의 부패'},{icon:'🌌',name:'존재의 의미'},
    {icon:'🎭',name:'진실의 가치'},{icon:'🐺',name:'본성의 수용'},
    {icon:'⚔',name:'전쟁의 무의미'},{icon:'✨',name:'기적'},
    {icon:'🌑',name:'어둠의 필요성'},{icon:'🌸',name:'일상의 소중함'},
    {icon:'🔮',name:'운명과 의지'},{icon:'👥',name:'공동체'},
  ],
  theme: [
    {icon:'🔥',name:'복수'},{icon:'❤',name:'사랑'},
    {icon:'🌱',name:'성장'},{icon:'💀',name:'죽음'},
    {icon:'⚖',name:'정의'},{icon:'🌊',name:'자유'},
    {icon:'👑',name:'권력'},{icon:'🌿',name:'자연'},
    {icon:'🔮',name:'운명'},{icon:'🌑',name:'어둠'},
    {icon:'✨',name:'구원'},{icon:'🎭',name:'정체성'},
    {icon:'🌌',name:'우주'},{icon:'🐾',name:'야성'},
    {icon:'💫',name:'초월'},{icon:'🌙',name:'신비'},
    {icon:'🔗',name:'유대'},{icon:'⚔',name:'전쟁'},
    {icon:'🌸',name:'치유'},{icon:'💎',name:'희생'},
  ],
  reader: [
    {icon:'🔥',name:'흥분'},{icon:'❄',name:'소름'},
    {icon:'❤',name:'설렘'},{icon:'💀',name:'공포'},
    {icon:'😢',name:'슬픔'},{icon:'😂',name:'웃음'},
    {icon:'🌊',name:'해방감'},{icon:'💫',name:'경이로움'},
    {icon:'⚖',name:'공감'},{icon:'🌑',name:'불안'},
    {icon:'✨',name:'희망'},{icon:'🌹',name:'두근거림'},
    {icon:'🎭',name:'충격'},{icon:'🌿',name:'위로'},
    {icon:'👁',name:'통찰'},{icon:'🌌',name:'몰입'},
    {icon:'🔮',name:'신비감'},{icon:'💥',name:'카타르시스'},
    {icon:'🌸',name:'따뜻함'},{icon:'⚔',name:'긴장감'},
  ],
  tone: [
    {icon:'🔥',name:'열정적'},{icon:'❄',name:'냉담한'},
    {icon:'🌊',name:'서정적'},{icon:'💀',name:'어두운'},
    {icon:'✨',name:'밝은'},{icon:'🌿',name:'잔잔한'},
    {icon:'💥',name:'격렬한'},{icon:'🌙',name:'몽환적'},
    {icon:'⚖',name:'중립적'},{icon:'😂',name:'유머러스'},
    {icon:'😢',name:'비장한'},{icon:'🎭',name:'아이러니'},
    {icon:'🌌',name:'웅장한'},{icon:'🌸',name:'따뜻한'},
    {icon:'⚡',name:'긴박한'},{icon:'🔮',name:'신비로운'},
    {icon:'💫',name:'초월적'},{icon:'🌑',name:'음울한'},
    {icon:'🌹',name:'로맨틱'},{icon:'🐾',name:'야성적'},
  ],
};

/* ════════════════════════════════════════════════
   STATE
════════════════════════════════════════════════ */
let currentNav   = 'character';
let currentSubId = null;
let selectedCards = {};   // { subId: Set<idx> }
let focusedCard  = null;  // { subId, idx, name, icon }
let infoSlideCategory = false; // false=카드, true=카테고리

function getCardDescription(name) {
  return `[${name}] 항목의 상세 설명이 여기에 표시됩니다. 추후 각 항목별 설명과 서사적 활용 예시가 추가될 예정입니다.`;
}

function getSubDescription(subId) {
  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const sub = navInfo ? navInfo.subs.find(s => s.id === subId) : null;
  const label = sub ? sub.label : subId;
  return `[${label}] 카테고리에 대한 설명이 여기에 표시됩니다. 추후 카테고리별 가이드와 활용 예시가 추가될 예정입니다.`;
}

/* ════════════════════════════════════════════════
   OPENING ANIMATION   오프닝
════════════════════════════════════════════════ */
  // 검은 화면의 시간 300 에서 100으로 줄임 다시300
const FADE_MS = 150;

window.addEventListener('load', () => {
  const content = document.getElementById('opening-content');
  const divider = document.getElementById('opening-divider');

  // 페이드인 + 선 확장 (동시에, 약 0.5초 분량에서 수정함 100에서 130 )
  setTimeout(() => {
    content.classList.add('visible');
    divider.classList.add('expand');
  }, 130);

  // 짧은 정지 후 페이드 아웃 (페이드인+선확장의 시간과 여기 시간을 빼면 제목표시시간. 1500에서 1100로 수정)
  setTimeout(() => content.classList.add('fade-out'), 1100);

  // 디졸브로 홈 화면 전환 (전체 약 2.1초에서 1.2초 변경 1.9초) 
  setTimeout(() => {
    switchScreen('screen-home', null, true);
  }, 1300);
});

initInfoSliderSwipe();

/* ════════════════════════════════════════════════
   SCREEN TRANSITION
════════════════════════════════════════════════ */
function switchScreen(targetId, callback, useFade) {
  const screens = document.querySelectorAll('.screen');
  const target = document.getElementById(targetId);

  if (!useFade) {
    screens.forEach(s => {
      s.classList.add('no-transition');
      s.classList.remove('active');
    });
    target.classList.add('active');
    requestAnimationFrame(() => {
      screens.forEach(s => s.classList.remove('no-transition'));
    });
    if (callback) callback();
    return;
  }

  const current = document.querySelector('.screen.active');
  if (current && current.id !== targetId) {
    current.classList.remove('active');
  }

  setTimeout(() => {
    screens.forEach(s => s.classList.remove('active'));
    target.classList.add('active');
    if (callback) callback();
  }, FADE_MS);
}

/* ════════════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════════════ */
function goHome() {
  closeDetailSheet();
  closeStatusOverlay();
  const create = document.getElementById('screen-create');
  if (create) create.classList.remove('entering');
  switchScreen('screen-home', null, true);
}
function goToNarrative() {
  switchScreen('screen-narrative', null, true);
}
function goToCreate() {
  switchScreen('screen-create', () => {
    const create = document.getElementById('screen-create');
    create.classList.remove('entering');
    void create.offsetWidth;
    create.classList.add('entering');
    setTimeout(() => create.classList.remove('entering'), 600);
    switchNav('character', true);
  }, true);
}

/* ════════════════════════════════════════════════
   MAIN NAV SWITCH
════════════════════════════════════════════════ */
function switchNav(navId, skipAnimation) {
  if (navId === currentNav && !skipAnimation) return;

  const prev = currentNav;
  currentNav = navId;
  currentSubId = null;

  // 버튼 상태 (부드러운 전환 — CSS transition)
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  const navMap = { character:'nav-character', narrative2:'nav-narrative2', world:'nav-world', compass:'nav-compass' };
  const nb = document.getElementById(navMap[navId]);
  if (nb) nb.classList.add('active');

  // 부분 초기화 버튼 텍스트
  document.getElementById('btn-partial-reset').textContent = NAV_DATA[navId].resetLabel;

  // 서브 메뉴 렌더
  renderSubnav(navId, !skipAnimation && prev !== navId);

  // 중앙 기본 상태로
  focusedCard = null;
  showDefaultCenter();
  updateInfoPanel();
}

function renderSubnav(navId, animate) {
  const scroll = document.getElementById('subnav-scroll');
  scroll.innerHTML = '';

  const subs = NAV_DATA[navId].subs;
  subs.forEach((sub, i) => {
    const item = document.createElement('div');
    item.className = 'subnav-item pressable' + (animate ? ' reveal' : '');
    item.style.animationDelay = animate ? (i * 0.05) + 's' : '0s';
    item.setAttribute('data-sub-id', sub.id);
    item.onclick = () => selectSub(sub.id, navId);

    const count = selectedCards[sub.id] ? selectedCards[sub.id].size : 0;

    item.innerHTML = `
      <div class="diamond-btn" style="animation-delay:${animate ? i*0.05 : 0}s">
        <span class="diamond-btn-icon">${sub.icon}</span>
        ${count > 0 ? `<div class="selection-badge">${count}</div>` : ''}
      </div>
      <div class="subnav-label">${sub.label}</div>
    `;
    scroll.appendChild(item);
  });
}

/* ════════════════════════════════════════════════
   SUB MENU SELECT
════════════════════════════════════════════════ */
function selectSub(subId, navId) {
  // 이전 active 제거
  document.querySelectorAll('.subnav-item').forEach(el => el.classList.remove('active'));
  // 현재 active
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');

  const same = currentSubId === subId;
  currentSubId = subId;
  if (!same) {
    focusedCard = null;
    setInfoSlide(false);
  }

  showCardPage(subId, !same);
  updateInfoPanel();
}

/* ════════════════════════════════════════════════
   CENTER DISPLAY
════════════════════════════════════════════════ */
function showDefaultCenter() {
  const area = document.getElementById('center-area');

  // 기존 동적 페이지 제거
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const def = document.getElementById('page-default');
  def.classList.add('active');
}

function showCardPage(subId, animate) {
  const area = document.getElementById('center-area');

  // default 숨기기
  document.getElementById('page-default').classList.remove('active');

  // 기존 페이지 제거 (애니메이션 없이 즉시)
  area.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  const cards = CARD_DATA[subId] || [];
  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const subInfo = navInfo ? navInfo.subs.find(s => s.id === subId) : null;
  const label = subInfo ? subInfo.label : subId;

  let html = `<div class="section-label">${label}</div><div class="card-grid">`;

  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  cards.forEach((card, idx) => {
    const sel = selectedCards[subId].has(idx) ? ' selected' : '';
    const deal = animate ? ' card-deal' : '';
    const delay = animate ? ` style="animation-delay:${idx * 0.04}s"` : '';
    html += `
      <div class="data-card pressable${sel}${deal}"${delay} onclick="cardClick('${subId}', ${idx}, '${escHtml(card.name)}', '${escHtml(card.icon)}')"ondblclick="toggleCardSelect('${subId}', ${idx})">
        <div class="card-icon-area">${card.icon}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  });

  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);
}

/* ════════════════════════════════════════════════
   CARD INTERACTION & INFO PANEL
════════════════════════════════════════════════ */
function cardClick(subId, idx, name, icon) {
  focusedCard = { subId, idx, name, icon };
  setInfoSlide(false);
  updateInfoPanel();
}

function setInfoSlide(showCategory) {
  infoSlideCategory = showCategory;
  const track = document.getElementById('info-slider-track');
  const hint = document.getElementById('info-swipe-hint');
  if (!track) return;
  track.classList.toggle('show-category', showCategory);
  if (hint) {
    hint.textContent = showCategory ? '카드 설명 보기 →' : '← 카테고리 설명 보기';
    hint.classList.toggle('hidden', !currentSubId);
  }
}

function initInfoSliderSwipe() {
  const viewport = document.getElementById('info-slider-viewport');
  if (!viewport) return;

  let startX = 0;
  let dragging = false;

  viewport.addEventListener('touchstart', (e) => {
    if (!currentSubId) return;
    startX = e.touches[0].clientX;
    dragging = true;
  }, { passive: true });

  viewport.addEventListener('touchend', (e) => {
    if (!dragging || !currentSubId) return;
    dragging = false;
    const dx = e.changedTouches[0].clientX - startX;
    if (dx < -40) setInfoSlide(true);
    else if (dx > 40) setInfoSlide(false);
  }, { passive: true });

  viewport.addEventListener('mousedown', (e) => {
    if (!currentSubId) return;
    startX = e.clientX;
    dragging = true;
  });

  window.addEventListener('mouseup', (e) => {
    if (!dragging || !currentSubId) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (dx < -40) setInfoSlide(true);
    else if (dx > 40) setInfoSlide(false);
  });
}

function updateInfoPanel() {
  const emptyEl = document.getElementById('info-empty');
  const sliderWrap = document.getElementById('info-slider-wrap');
  const selectBtn = document.getElementById('info-select-btn');

  if (!currentSubId) {
    emptyEl.classList.remove('hidden');
    sliderWrap.classList.add('hidden');
    return;
  }

  emptyEl.classList.add('hidden');
  sliderWrap.classList.remove('hidden');

  const navInfo = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === currentSubId));
  const subInfo = navInfo ? navInfo.subs.find(s => s.id === currentSubId) : null;

  document.getElementById('info-cat-icon').textContent = subInfo ? subInfo.icon : '✦';
  document.getElementById('info-cat-name').textContent = subInfo ? subInfo.label : currentSubId;
  document.getElementById('info-cat-desc').textContent = getSubDescription(currentSubId);

  if (focusedCard && focusedCard.subId === currentSubId) {
    document.getElementById('info-card-icon').textContent = focusedCard.icon;
    document.getElementById('info-card-name').textContent = focusedCard.name;
    document.getElementById('info-card-desc').textContent = getCardDescription(focusedCard.name);
    const isSelected = selectedCards[focusedCard.subId] && selectedCards[focusedCard.subId].has(focusedCard.idx);
    selectBtn.textContent = isSelected ? '취소' : '선택';
    selectBtn.classList.toggle('is-selected', isSelected);
    setInfoSlide(false);
  } else {
    document.getElementById('info-card-icon').textContent = '·';
    document.getElementById('info-card-name').textContent = '카드 미선택';
    document.getElementById('info-card-desc').textContent = '카드를 탭하면 이곳에 항목 설명이 표시됩니다.';
    selectBtn.textContent = '선택';
    selectBtn.classList.remove('is-selected');
    setInfoSlide(true);
  }

  const hint = document.getElementById('info-swipe-hint');
  if (hint) hint.classList.remove('hidden');
}

function selectCurrentCard() {
  if (!focusedCard) return;
  toggleCardSelect(focusedCard.subId, focusedCard.idx);
}

function toggleCardSelect(subId, idx) {
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(idx)) {
    selectedCards[subId].delete(idx);
  } else {
    selectedCards[subId].add(idx);
  }

  // 카드 UI 업데이트
  const page = document.getElementById('page-' + subId);
  if (page) {
    const cards = page.querySelectorAll('.data-card');
    cards.forEach((card, i) => {
      if (i === idx) {
        card.classList.toggle('selected', selectedCards[subId].has(idx));
      }
    });
  }

  // 서브메뉴 배지 업데이트
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }

  // 설명창 선택 버튼 업데이트
  if (focusedCard && focusedCard.subId === subId && focusedCard.idx === idx) {
    updateInfoPanel();
  }
  refreshStatusIfOpen();
   updateNavBadges();  /* ← 여기 추가, 선택한 카드 총량 표시 추가*/
}

function openDetailSheet(mode) {
  if (mode === 'card' && !focusedCard) return;
  if (mode === 'category' && !currentSubId) return;
  document.getElementById('detail-overlay').classList.add('active');
}

function closeDetailSheet(e) {
  if (e && e.target !== document.getElementById('detail-overlay')) return;
  document.getElementById('detail-overlay').classList.remove('active');
}

/* ════════════════════════════════════════════════
   STATUS OVERLAY
════════════════════════════════════════════════ */
function openStatusOverlay() {
  renderStatusContent();
  document.getElementById('status-overlay').classList.add('active');
}

function closeStatusOverlay(e) {
  if (e && e.target !== document.getElementById('status-overlay')) return;
  document.getElementById('status-overlay').classList.remove('active');
}

function renderStatusContent() {
  const body = document.getElementById('status-body');
  let html = '';

  Object.keys(NAV_DATA).forEach(navKey => {
    const nav = NAV_DATA[navKey];
    html += `<div class="status-section"><div class="status-section-title">${nav.label}</div>`;

    let hasAny = false;
    let itemsHtml = '';

    nav.subs.forEach(sub => {
      const set = selectedCards[sub.id];
      if (!set || set.size === 0) return;
      hasAny = true;
      itemsHtml += `<div class="status-sub"><div class="status-sub-label">${sub.label}</div><div class="status-chips">`;
      set.forEach(idx => {
        const card = CARD_DATA[sub.id][idx];
        if (card) {
          itemsHtml += `<span class="status-chip">${card.icon} ${card.name}</span>`;
        }
      });
      itemsHtml += '</div></div>';
    });

    html += hasAny ? itemsHtml : '<div class="status-empty">선택 없음</div>';
    html += '</div>';
  });

  body.innerHTML = html;
}

function shareStatus() {
  showAppNotice('공유 기능은 다음 업데이트 예정입니다.');
}

/* ════════════════════════════════════════════════
   APP DIALOG (confirm / notice)
════════════════════════════════════════════════ */
let appDialogResolve = null;

function showAppDialog(msg, buttons) {
  return new Promise((resolve) => {
    appDialogResolve = resolve;
    const overlay = document.getElementById('app-dialog-overlay');
    const actions = document.getElementById('app-dialog-actions');
    document.getElementById('app-dialog-msg').textContent = msg;
    actions.innerHTML = '';
    buttons.forEach((b) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'app-dialog-btn pressable ' + b.className;
      btn.textContent = b.label;
      btn.onclick = () => closeAppDialog(b.value);
      actions.appendChild(btn);
    });
    overlay.classList.add('active');
  });
}

function closeAppDialog(value) {
  document.getElementById('app-dialog-overlay').classList.remove('active');
  if (appDialogResolve) {
    const r = appDialogResolve;
    appDialogResolve = null;
    r(value);
  }
}

function showAppNotice(msg) {
  return showAppDialog(msg, [
    { label: '확인', className: 'app-dialog-btn-single', value: true }
  ]);
}

function showAppConfirm(msg) {
  return showAppDialog(msg, [
    { label: '아니오', className: 'app-dialog-btn-cancel', value: false },
    { label: '예', className: 'app-dialog-btn-confirm', value: true }
  ]);
}

function refreshStatusIfOpen() {
  const overlay = document.getElementById('status-overlay');
  if (overlay && overlay.classList.contains('active')) {
    renderStatusContent();
  }
}

/* ════════════════════════════════════════════════
   RESET
════════════════════════════════════════════════ */
async function partialReset() {
  const label = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`${label} 탭의 선택을 모두 초기화할까요?`);
  if (!ok) return;
  const subs = NAV_DATA[currentNav].subs;
  subs.forEach(sub => { delete selectedCards[sub.id]; });
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
  refreshStatusIfOpen();
}

async function fullReset() {
  const ok = await showAppConfirm('모든 선택을 초기화할까요?');
  if (!ok) return;
  selectedCards = {};
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
  refreshStatusIfOpen();
}


    // 해당 탭 전체 선택 수 합산 하단 탭 배지 렌더 함수
function updateNavBadges() {
  Object.keys(NAV_DATA).forEach(navId => {
    const navMap = {
      character: 'nav-character',
      narrative2: 'nav-narrative2',
      world: 'nav-world',
      compass: 'nav-compass'
    };
    const btn = document.getElementById(navMap[navId]);
    if (!btn) return;

    // 해당 탭 전체 선택 수 합산 
    const total = NAV_DATA[navId].subs.reduce((sum, sub) => {
      return sum + (selectedCards[sub.id] ? selectedCards[sub.id].size : 0);
    }, 0);

    // 기존 배지 제거 후 다시 렌더
    const existing = btn.querySelector('.nav-badge');
    if (existing) existing.remove();
    if (total > 0) {
      const badge = document.createElement('div');
      badge.className = 'nav-badge';
      badge.textContent = total;
      btn.appendChild(badge);
    }
  });
}

/* ════════════════════════════════════════════════
   UTIL
════════════════════════════════════════════════ */
function escHtml(s) {
  return s.replace(/'/g, "\\'");
}

/* ════════════════════════════════════════════════
   EXTRA MENU TOGGLE
════════════════════════════════════════════════ */
let extraMenuOpen = false;

function toggleExtraMenu() {
  extraMenuOpen = !extraMenuOpen;
  const panel = document.getElementById('extra-menu-panel');
  const btn   = document.getElementById('btn-extra-menu');
  const icon  = document.getElementById('extra-menu-icon');

  panel.classList.toggle('open', extraMenuOpen);
  btn.classList.toggle('open', extraMenuOpen);

  // 닫혀있을때 ☰, 열려있을때 삼각형 ▲
  icon.textContent = extraMenuOpen ? '▼' : '☰';
}

/* ════════════════════════════════════════════════
   RANDOM SELECT
════════════════════════════════════════════════ */

// 현재 탭의 현재 서브(마름모) 카드 1개 랜덤 선택
async function randomSelectCurrent() {
  if (!currentSubId) {
    showAppNotice('먼저 카테고리를 선택해주세요.');
    return;
  }
  const navLabel = NAV_DATA[currentNav].label;
  const subLabel = NAV_DATA[currentNav].subs.find(s => s.id === currentSubId)?.label || currentSubId;
  const ok = await showAppConfirm(`[${navLabel} — ${subLabel}]\n랜덤 선택을 하시겠습니까?`);
  if (!ok) return;

  const cards = CARD_DATA[currentSubId];
  if (!cards || cards.length === 0) return;

  const randomIdx = Math.floor(Math.random() * cards.length);
  if (!selectedCards[currentSubId]) selectedCards[currentSubId] = new Set();
  selectedCards[currentSubId] = new Set([randomIdx]);

  // UI 갱신
  showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
  if (el) el.classList.add('active');

  // 설명창 갱신
  focusedCard = { subId: currentSubId, idx: randomIdx, ...cards[randomIdx] };
  updateInfoPanel();
  refreshStatusIfOpen();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
}

// 현재 탭의 모든 서브(마름모) 각 1개씩 랜덤 선택
async function randomSelectAll() {
  const navLabel = NAV_DATA[currentNav].label;
  const ok = await showAppConfirm(`[${navLabel}]\n모든 카테고리에서 각 1개씩\n랜덤 선택을 하시겠습니까?`);
  if (!ok) return;

  const subs = NAV_DATA[currentNav].subs;
subs.forEach(sub => {
  const cards = CARD_DATA[sub.id];
  if (!cards || cards.length === 0) return;
  const randomIdx = Math.floor(Math.random() * cards.length);
  selectedCards[sub.id] = new Set([randomIdx]);              // 기존 초기화 후 새로 선택
});

  // UI 갱신
  if (currentSubId) showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  if (currentSubId) {
    const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
    if (el) el.classList.add('active');
  }
  updateInfoPanel();
  refreshStatusIfOpen();
   updateNavBadges();  // ← 여기 추가,  선택한 총량 표시 배지 추가
}


/* ════════════════════════════════════════════════
   MOBILE TOUCH — pressable 눌림 효과
   iOS Safari는 :active가 터치에서 작동 안 함
   → touchstart/touchend로 직접 클래스 제어
════════════════════════════════════════════════ */
(function () {
  function onTouchStart(e) {
    const el = e.target.closest('.pressable');
    if (!el) return;
    el.classList.add('is-pressing');
  }

  function onTouchEnd(e) {
    // 현재 누르고 있는 모든 pressable에서 클래스 제거
    document.querySelectorAll('.is-pressing').forEach(el => {
      el.classList.remove('is-pressing');
    });
  }

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchend',   onTouchEnd,   { passive: true });
  document.addEventListener('touchcancel',onTouchEnd,   { passive: true });
})();


