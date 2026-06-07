/* ════════════════════════════════════════════════
   DATA DEFINITIONS
════════════════════════════════════════════════ */
const NAV_DATA = {
  character: {
    label: '캐릭터',
    resetLabel: '캐릭터 초기화',
    subs: [
      { id:'archetype', label:'원형', img:'images/Giant_Elf.png' },
      { id:'race',      label:'종족', icon:'🐉', type:'group'  },
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
    {icon:'⚔', img:'images/Giant_Elf.png', name:'영웅'},
     {icon:'🧙',name:'현자'},{icon:'😈',name:'악당'},
    {icon:'🃏',name:'트릭스터'},{icon:'👼',name:'수호자'},{icon:'🔮',name:'예언자'},
    {icon:'⚔',name:'전사'},{icon:'💀',name:'파멸자'},{icon:'🌹',name:'연인'},
    {icon:'👑',name:'통치자'},{icon:'🌿',name:'치유자'},{icon:'🕵',name:'탐정'},
    {icon:'🐺',name:'이방인'},{icon:'🌟',name:'선택받은 자'},{icon:'🦊',name:'교활한 자'},
    {icon:'🔗',name:'속박된 자'},{icon:'🌊',name:'방랑자'},{icon:'⚖',name:'심판자'},
    {icon:'🌙',name:'어둠의 자'},{icon:'☀',name:'빛의 자'},
  ],
  race: {
  // ── type:'group' 구조일 때는 배열 대신 이 형태로 작성 ──
  // groups 배열 안에 그룹 하나씩 추가하면 돼
  groups: [
    {
      id: 'race_human',       // 고유 ID (겹치면 안됨)
      label: '인간',           // 버튼에 표시될 이름
      icon: '👤',             // 버튼 아이콘
      cards: [
        // 여기에 인간 카드들을 넣어
        { icon:'👦', name:'소년' }, { icon:'👧', name:'소녀' },
        { icon:'👨', name:'청년' },
        { icon:'🤖', name:'AI' },
         
      ]
    },
    {
      id: 'race_animal',
      label: '의인화',
      icon: '🐾',
      cards: [
        { icon:'🐺', name:'늑대인간' },
        { icon:'🦊', name:'여우인간' },
        { icon:'🐱', name:'고양이인간' },
      ]
    },
    {
      id: 'race_fantasy',
      label: '판타지',
      icon: '✨',
      cards: [
        { icon:'🧝', name:'엘프' },
        { icon:'🧟', name:'언데드' },
        { icon:'🐉', name:'드래곤족' },
      ]
    },
  ]
},
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
    item.style.animationDelay = animate ? (i * 0.08) + 's' : '0s';    /* 마름모 등장 속도 05빠름,높으면 느림 0.10 밑에 i0.0에도 적용해야함*/
    item.setAttribute('data-sub-id', sub.id);
    item.onclick = () => selectSub(sub.id, navId);

    const count = selectedCards[sub.id] ? selectedCards[sub.id].size : 0;

    item.innerHTML = `
      <div class="diamond-btn" style="animation-delay:${animate ? i*0.08 : 0}s">  
        <span class="diamond-btn-icon">${renderIcon(sub.icon, sub.img, 'diamond-img')}</span>
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



/* ════════════════════════════════════════════════
   그룹 선택 화면 렌더
   ─ type:'group' 인 카테고리를 클릭했을 때 열리는 화면
   ─ 버튼 수를 늘리려면 CARD_DATA 의 groups 배열에 항목 추가만 하면 됨
════════════════════════════════════════════════ */
function showGroupPage(subId, animate = true) {
  const area = document.getElementById('center-area');

  // 기존 페이지 제거
  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId;

  // 그룹 버튼들을 세로로 나열 (3x1, 6x1 등 groups 배열 길이에 따라 자동)
  let html = '<div class="group-select-wrap">';
  data.groups.forEach((grp, i) => {
    const delay = animate ? `style="animation-delay:${i * 0.08}s"` : '';
const grpCount = grp.cards.reduce((sum, _, cIdx) => {
      return sum + (selectedCards[subId]?.has(i * 1000 + cIdx) ? 1 : 0);
    }, 0);
    html += `
      <button
        class="group-select-btn pressable group-deal"
        ${delay}
        onclick="showGroupCards('${subId}', ${i})"
      >
        <span class="group-btn-icon">${grp.icon}</span>
        <span class="group-btn-label">${grp.label}</span>
        ${grpCount > 0 ? `<div class="group-badge">${grpCount}</div>` : ''}
      </button>
    `;
    // ↑ 버튼 하나당 이 블록 하나.
    // groups 배열에 항목 추가하면 버튼 자동으로 늘어남
  });
  html += '</div>';

  page.innerHTML = html;
  area.appendChild(page);
}

/* ════════════════════════════════════════════════
   그룹 버튼 클릭 → 해당 그룹의 카드 목록 열기
════════════════════════════════════════════════ */
function showGroupCards(subId, groupIdx) {
  const area = document.getElementById('center-area');
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;

  const grp = data.groups[groupIdx];
  if (!grp) return;

  // 기존 페이지 제거
  document.querySelectorAll('.center-page:not(#page-default)').forEach(p => p.remove());

  const page = document.createElement('div');
  page.className = 'center-page active';
  page.id = 'page-' + subId + '_' + grp.id;

  // storeKey = subId (종족 전체로 통합)
  if (!selectedCards[subId]) selectedCards[subId] = new Set();

  // 카드 idx = groupIdx * 1000 + cardIdx (그룹 구분용 오프셋)
  const offset = groupIdx * 1000;

  let html = `<div class="section-label">${grp.icon} ${grp.label}</div>`;
  html += '<div class="card-grid">';
  grp.cards.forEach((card, idx) => {
    const globalIdx = offset + idx;
    const sel = selectedCards[subId].has(globalIdx) ? ' selected' : '';
    html += `
  <div class="data-card pressable card-deal${sel}"
    style="animation-delay:${idx * 0.04}s"
    onclick="groupCardClick('${subId}', ${groupIdx}, ${idx})"
    ondblclick="groupCardDblClick('${subId}', ${groupIdx}, ${idx})"
    onmousedown="startLongPress(this,'group','${subId}',${groupIdx},${idx})"
    ontouchstart="startLongPress(this,'group','${subId}',${groupIdx},${idx})"
    onmouseup="cancelLongPress()" ontouchend="cancelLongPress()"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
        
        <div class="card-icon-area">${renderIcon(card.icon, card.img, 'card-img')}</div>
        <div class="card-name">${card.name}</div>
      </div>
    `;
  });
  html += '</div>';
  page.innerHTML = html;
  area.appendChild(page);
}

/* 그룹 카드 클릭 — info 패널 업데이트 */
function groupCardClick(subId, groupIdx, idx) {
  const grp = CARD_DATA[subId].groups[groupIdx];
  const card = grp.cards[idx];
  const globalIdx = groupIdx * 1000 + idx;
  focusedCard = { subId, idx: globalIdx, name: card.name, icon: card.icon, img: card.img };
  setInfoSlide(false);
  updateInfoPanel();
}

/* 그룹 카드 더블클릭 — 선택/해제 */
function groupCardDblClick(subId, groupIdx, idx) {
  const globalIdx = groupIdx * 1000 + idx;
  if (!selectedCards[subId]) selectedCards[subId] = new Set();
  if (selectedCards[subId].has(globalIdx)) {
    selectedCards[subId].delete(globalIdx);
  } else {
    selectedCards[subId].add(globalIdx);
  }

  // 카드 DOM 토글 (애니메이션 재발생 없음, 더블클릭 후 카드 뒤집는 모션 오류 수정한듯)
  const page = document.getElementById('page-' + subId + '_' + CARD_DATA[subId].groups[groupIdx].id);
  if (page) {
    const cards = page.querySelectorAll('.data-card');
    if (cards[idx]) {
      cards[idx].classList.remove('card-deal');
      cards[idx].classList.toggle('selected', selectedCards[subId].has(globalIdx));
    }
  }

// 그룹 페이지가 현재 열려있으면 배지 갱신, 없으면 패스 (showGroupPage 호출 시 자동 반영)
  const groupPageEl = document.getElementById('page-' + subId);
  if (groupPageEl) updateGroupBadges(subId);

  // focusedCard 동기화
  groupCardClick(subId, groupIdx, idx);

  // 배지 & 상태 갱신
  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${subId}"]`);
  if (el) el.classList.add('active');
  updateNavBadges();
  refreshStatusIfOpen();
}

function updateGroupBadges(subId) {
  const data = CARD_DATA[subId];
  if (!data || !data.groups) return;
  data.groups.forEach((grp, gIdx) => {
    const btn = document.querySelector(`#page-${subId} .group-select-btn:nth-child(${gIdx + 1})`);
    if (!btn) return;
    const count = grp.cards.reduce((sum, _, cIdx) => {
      return sum + (selectedCards[subId]?.has(gIdx * 1000 + cIdx) ? 1 : 0);
    }, 0);
    let badge = btn.querySelector('.group-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('div');
        badge.className = 'group-badge';
        btn.appendChild(badge);
      }
      badge.textContent = count;
    } else {
      if (badge) badge.remove();
    }
  });
}


function showCardPage(subId, animate = true) {

  // type:'group' 인 경우 그룹 선택 화면을 열고 종료
  const navInfo2 = Object.values(NAV_DATA).find(n => n.subs.find(s => s.id === subId));
  const subCheck = navInfo2 ? navInfo2.subs.find(s => s.id === subId) : null;
  if (subCheck && subCheck.type === 'group') {
    showGroupPage(subId, animate);
    return;
  }

  const area = document.getElementById('center-area');

  // default 숨기기
  document.getElementById('page-default').classList.remove('active');

  // 기존 페이지 제거
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
  <div class="data-card pressable${sel}${deal}"${delay}
    onclick="cardClick('${subId}', ${idx})"
    ondblclick="toggleCardSelect('${subId}', ${idx})"
    onmousedown="startLongPress(this,'card','${subId}',${idx})"
    ontouchstart="startLongPress(this,'card','${subId}',${idx})"
    onmouseup="cancelLongPress()"  ontouchend="cancelLongPress()"
    onmouseleave="cancelLongPress()" ontouchcancel="cancelLongPress()">
    
        <div class="card-icon-area">${renderIcon(card.icon, card.img, 'card-img')}</div>
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
function cardClick(subId, idx) {
  const card = CARD_DATA[subId][idx];
  focusedCard = { subId, idx, name: card.name, icon: card.icon, img: card.img };
  setInfoSlide(false);
  updateInfoPanel();
}

function setInfoSlide(showCategory) {
  infoSlideCategory = showCategory;
  const track    = document.getElementById('info-slider-track');
  const viewport = document.getElementById('info-slider-viewport');
  if (!track || !viewport) return;
  // classList 방식 제거 → transform 방식으로 직접 이동
  const w = viewport.offsetWidth;
  const offset = showCategory ? -w : 0;
  track.style.transition = 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)';
  track.style.transform  = `translateX(${offset}px)`;
  // dot 갱신
  const dot0 = document.getElementById('dot-0');
  const dot1 = document.getElementById('dot-1');
  if (dot0 && dot1) {
    dot0.style.transform = showCategory ? 'scale(1)' : 'scale(1.55)';
    dot1.style.transform = showCategory ? 'scale(1.55)' : 'scale(1)';
    dot0.style.opacity   = showCategory ? '0.45' : '1';
    dot1.style.opacity   = showCategory ? '1' : '0.45';
  }
  const hint = document.getElementById('info-swipe-hint');
  if (hint) hint.classList.add('hidden');
}

function initInfoSliderSwipe() {
  const viewport = document.getElementById('info-slider-viewport');
  const track    = document.getElementById('info-slider-track');
  if (!viewport || !track) return;

  let startX   = 0;
  let curX     = 0;
  let dragging = false;
  let baseOffset = 0; // 현재 슬라이드의 시작 오프셋 (0 or -50%)

  function getSlideWidth() {
    return viewport.offsetWidth;
  }

  function applyTransform(offsetPx, animate) {
    track.style.transition = animate
      ? 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)'
      : 'none';
    track.style.transform = `translateX(${offsetPx}px)`;
    updateDots(offsetPx);
  }

  function updateDots(offsetPx) {
    const w = getSlideWidth();
    // 0px = 카드(왼쪽), -w = 카테고리(오른쪽)
    // ratio: 0(카드) ~ 1(카테고리)
    const ratio = Math.min(1, Math.max(0, -offsetPx / w));
    const dot0 = document.getElementById('dot-0');
    const dot1 = document.getElementById('dot-1');
    if (!dot0 || !dot1) return;
    // 큰 점이 ratio에 따라 오른쪽으로 이동
    // dot0: ratio=0일때 크게, dot1: ratio=1일때 크게
    const s0 = 1 + (1 - ratio) * 0.55; // 1 ~ 1.55
    const s1 = 1 + ratio * 0.55;
    dot0.style.transform = `scale(${s0})`;
    dot1.style.transform = `scale(${s1})`;
    dot0.style.opacity = 0.45 + (1 - ratio) * 0.55;
    dot1.style.opacity = 0.45 + ratio * 0.55;
  }

  function snapToSlide(targetCategory) {
    infoSlideCategory = targetCategory;
    baseOffset = targetCategory ? -getSlideWidth() : 0;
    applyTransform(baseOffset, true);
    updateDots(baseOffset);
    // hint 숨기기
    const hint = document.getElementById('info-swipe-hint');
    if (hint) hint.classList.add('hidden');
  }

  function onStart(clientX) {
    if (!currentSubId) return;
    startX = clientX;
    curX   = clientX;
    dragging = true;
    baseOffset = infoSlideCategory ? -getSlideWidth() : 0;
    track.style.transition = 'none';
  }

  function onMove(clientX) {
    if (!dragging || !currentSubId) return;
    curX = clientX;
    const dx = curX - startX;
    // 경계에서 저항감 (rubber band)
    let offset = baseOffset + dx;
    const w = getSlideWidth();
    if (offset > 0)        offset = offset * 0.25;
    if (offset < -w)       offset = -w + (offset + w) * 0.25;
    applyTransform(offset, false);
  }

  function onEnd() {
    if (!dragging || !currentSubId) return;
    dragging = false;
    const dx = curX - startX;
    const w  = getSlideWidth();
    const THRESHOLD = w * 0.2; // 20%만 넘어도 전환
    if (dx < -THRESHOLD && !infoSlideCategory) {
      snapToSlide(true);
    } else if (dx > THRESHOLD && infoSlideCategory) {
      snapToSlide(false);
    } else {
      // 원래 위치로 복귀
      applyTransform(baseOffset, true);
      updateDots(baseOffset);
    }
  }

  // Touch
  viewport.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
  viewport.addEventListener('touchmove',  (e) => onMove(e.touches[0].clientX),  { passive: true });
  viewport.addEventListener('touchend',   (e) => onEnd(), { passive: true });

  // Mouse
  viewport.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e.clientX); });
  window.addEventListener('mousemove',   (e) => onMove(e.clientX));
  window.addEventListener('mouseup',     ()  => onEnd());
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

  document.getElementById('info-cat-icon').innerHTML = subInfo ? renderIcon(subInfo.icon, subInfo.img, 'info-icon-img') : '✦';
  document.getElementById('info-cat-name').textContent = subInfo ? subInfo.label : currentSubId;
  document.getElementById('info-cat-desc').textContent = getSubDescription(currentSubId);

  if (focusedCard && focusedCard.subId === currentSubId) {
    document.getElementById('info-card-icon').innerHTML = renderIcon(focusedCard.icon, focusedCard.img, 'info-icon-img');
    document.getElementById('info-card-name').textContent = focusedCard.name;
    document.getElementById('info-card-desc').textContent = getCardDescription(focusedCard.name);
    const isSelected = selectedCards[focusedCard.subId] && selectedCards[focusedCard.subId].has(focusedCard.idx);
    selectBtn.textContent = isSelected ? '취소' : '선택';
    selectBtn.classList.toggle('is-selected', isSelected);
    setInfoSlide(false);
  } else {
    document.getElementById('info-card-icon').innerHTML = '·';
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
  // 그룹 타입 카드인지 판별 (globalIdx >= 0, subId에 groups가 있으면)
  const data = CARD_DATA[focusedCard.subId];
  if (data && data.groups) {
    // globalIdx에서 groupIdx, cardIdx 역산
    const groupIdx = Math.floor(focusedCard.idx / 1000);
    const cardIdx = focusedCard.idx % 1000;
    groupCardDblClick(focusedCard.subId, groupIdx, cardIdx);
  } else {
    toggleCardSelect(focusedCard.subId, focusedCard.idx);
  }
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

      const data = CARD_DATA[sub.id];
      set.forEach(globalIdx => {
        let card = null;
        if (data && data.groups) {
          // 그룹 타입: globalIdx = groupIdx * 1000 + cardIdx
          const groupIdx = Math.floor(globalIdx / 1000);
          const cardIdx = globalIdx % 1000;
          card = data.groups[groupIdx]?.cards[cardIdx];
        } else if (Array.isArray(data)) {
          card = data[globalIdx];
        }
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
   RENDER ICON (이모지 or 이미지 자동 분기)
════════════════════════════════════════════════ */
function renderIcon(icon, img, className) {
  if (img) {
    return `<img src="${img}" class="${className}" alt="">`;
  }
  return icon || '';
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

   
const data = CARD_DATA[currentSubId];
  // group 타입 처리
  let allCards = [];
  if (data && data.groups) {
    data.groups.forEach((grp, gIdx) => {
      grp.cards.forEach((card, cIdx) => {
        allCards.push({ globalIdx: gIdx * 1000 + cIdx, ...card });
      });
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((card, idx) => ({ globalIdx: idx, ...card }));
  }
  if (allCards.length === 0) return;

  const pick = allCards[Math.floor(Math.random() * allCards.length)];
  selectedCards[currentSubId] = new Set([pick.globalIdx]);
   

  // UI 갱신
  showCardPage(currentSubId, false);
  renderSubnav(currentNav, false);
  const el = document.querySelector(`[data-sub-id="${currentSubId}"]`);
  if (el) el.classList.add('active');

  // 설명창 갱신
  focusedCard = { subId: currentSubId, idx: pick.globalIdx, name: pick.name, icon: pick.icon, img: pick.img };
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
  const data = CARD_DATA[sub.id];
  let allCards = [];
  if (data && data.groups) {
    data.groups.forEach((grp, gIdx) => {
      grp.cards.forEach((card, cIdx) => {
        allCards.push({ globalIdx: gIdx * 1000 + cIdx });
      });
    });
  } else if (Array.isArray(data)) {
    allCards = data.map((_, idx) => ({ globalIdx: idx }));
  }
  if (allCards.length === 0) return;
  const pick = allCards[Math.floor(Math.random() * allCards.length)];
  selectedCards[sub.id] = new Set([pick.globalIdx]);
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


/* ════════════════════════════════════════════════
   LONG PRESS → 상세 정보 열기
════════════════════════════════════════════════ */
let _lpTimer = null;
const LONG_PRESS_MS = 480; // 꾹 누르는 시간 (ms)

function startLongPress(el, type, subId, a, b) {
  cancelLongPress();
  _lpTimer = setTimeout(() => {
    _lpTimer = null;
    // 카드 포커스 먼저 맞추기
    if (type === 'group') {
      groupCardClick(subId, a, b);
    } else {
      cardClick(subId, a);
    }
    openDetailSheet('card');
  }, LONG_PRESS_MS);
}

function cancelLongPress() {
  if (_lpTimer) {
    clearTimeout(_lpTimer);
    _lpTimer = null;
  }
}


