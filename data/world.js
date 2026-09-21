/* ═════════════════════════════════════════════════════════════════════
   NARRATIVE DATA
   - NARRATIVE_NAV  : 스토리 탭 네비게이션 정의
   - NARRATIVE_CARDS: 스토리 탭 카드 데이터

섹션 헤더   { type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  

카드 코드  { icon:'🔮', name:'이름' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'  },


layoutType: '3',   ← 5/4/3/2 중 하나로 카드 배열 고정 적용됨. 카드 가로 개수, 기본=3


\n 하나는 줄바꿈,  \n\n 분리,  기본 C 방식은 detail 하나만 쓰면됨,  detailLayout/detailMode: 'AB' 
또는 detailB/detailRight 입력이 있으면 A/B 2열 방식으로 표시. A열은 detailA/detailLeft/detail, B열은 detailB/detailRight로 직접 제어할 수 있음.

    detailMode: 'AB',
    detailA: ' ',
    detailB: ' '},

코딩에서 줄바꿔서 보기좋게 정리 하려면 ''이거속에 넣어서 플러스 입력하면됨.
desc: '설명'+ 
      '설명'+   ←이렇게  ''+ ←얘네 속에 입력하면 됨. \n\n ←얘네들이 있어도 가능함.

═══════════════════════════════════════════════════════════════════════ */


const WORLD_NAV = {
  label: '세계관',
  resetLabel: '세계관 초기화',
  subs: [
     
    { id: 'obstacle',  label: '장애물',  img:'images/core/sub-nav/wrld/setting.jpg',   type:'group' },
    { id: 'setting',   label: '배경',    img:'images/core/sub-nav/wrld/setting.jpg' },
    { id: 'location',  label: '장소',    img:'images/core/sub-nav/wrld/location.jpg' },
    { id: 'item',      label: '아이템',  img:'images/core/sub-nav/wrld/item.jpg' },
    { id: 'tool',      label: '도구',    img:'images/core/sub-nav/wrld/tool.jpg' },
    { id: 'resource',  label: '자원',    img:'images/core/sub-nav/wrld/resource.jpg' },
    { id: 'tech',      label: '기술',    img:'images/core/sub-nav/wrld/tech.jpg' },
    { id: 'skill',     label: '스킬',    img:'images/core/sub-nav/wrld/skill.jpg' },
    { id: 'culture',   label: '문화',    img:'images/core/sub-nav/wrld/culture.jpg' },
    { id: 'costume',   label: '의상',    img:'images/core/sub-nav/wrld/costume.jpg' },
     
  ]
};


const WORLD_CARDS = {
 /* ════════════════════════════════════════════════      세계관     ════════════════════════════════════════════════ */  

   
 /* ════════════════════════════════════════════════     🔻 장애물 Obstacle 🔻     ════════════════════════════════════════════════ */  




  obstacle: { /*  장애물 카테고리  */
    groups: [
/* ════════════════════════════════════════════════     🔻 장애물 - 1 인간·사회: society🔻     ════════════════════════════════════════════════ */
       
    { id: 'society',
      label: '인간·사회',
      layoutType: '3',
      img: 'images/world/group/society.jpg',
      cards: [
         
{ type: 'section' ,  label: ' 사람·관계의 장애물 — 다른 사람은 어떤 방식으로 인물의 목적·행동·생존을 방해하는가? ' },  
         
        { name: '직접적인 적대·공격',
          icon:'⚔️',
          desc: '상대가 의도적으로 인물에게 피해를 주거나 목적 달성을 막는다', detailLayout: 'AB',
          detailA: '공격해 옴\n\n죽이려 함\n\n다치게 하려 함\n\n붙잡으려 함\n\n쫓아옴\n\n몰아내려 함\n\n길을 막음\n\n',
          detailB: '목적지에 가지 못하게 함\n\n행동을 강제로 저지함\n\n가진 것을 빼앗으려 함\n\n중요한 것을 파괴하려 함\n\n위협・협박함\n\n약점을 잡고 압박함\n\n인질을 이용함\n\n함정에 빠뜨림\n\n지속적으로 괴롭힘\n\n'
        },
        { name: '경쟁·이해관계 충돌',
          icon: '🏆',
          desc: '악의가 없어도 서로 원하는 것이 충돌한다', detailLayout: 'AB',
          detailA: '같은 목표를 노림\n\n같은 자리·지위를 노림\n\n같은 보상을 노림\n\n한정된 자원을 두고 경쟁함\n\n먼저 도착해야 함\n\n상대보다 높은 평가를 받아야 함\n\n',
          detailB: '한쪽의 성공이 다른 쪽의 실패가 됨\n\n서로 다른 해결책을 주장함\n\n서로 양보할 수 없는 조건을 가짐\n\n한쪽이 얻으면 다른 쪽이 잃음\n\n같은 사람·대상을 서로 원함\n\n서로 다른 집단의 이익을 대표함\n\n'
        },
        { name: '통제·지배·강요',
          icon: '👑',
          desc: '상대가 인물의 행동이나 선택권을 제한한다', detailLayout: 'AB',
          detailA: '명령을 내림\n\n복종을 요구함\n\n선택을 대신 결정함\n\n특정 행동을 강요함\n\n원하는 일을 하지 못하게 함\n\n떠나지 못하게 함\n\n특정 역할을 강요함\n\n',
          detailB: '감시함\n\n행동을 보고하게 함\n\n자유를 제한함\n\n경제적으로 통제함\n\n약점을 이용해 조종함\n\n관계를 이용해 통제함\n\n보호를 명목으로 행동을 제한함\n\n'
        },
        { name: '추적·발각의 위험',
          icon: '🔍',
          desc: '상대와 싸우는 것보다 ‘들키지 않는 것’ 자체가 장애물이 된다', detailLayout: 'AB',
          detailA: '추적당함\n\n수색당함\n\n감시당함\n\n의심받음\n\n정체를 조사당함\n\n거짓말을 들킬 위험이 있음\n\n',
          detailB: '숨어 있는 장소를 발견당할 위험이 있음\n\n흔적을 추적당함\n\n행동의 증거가 남음\n\n내부에 자신을 의심하는 사람이 있음\n\n자신을 알아보는 사람이 나타남\n\n비밀을 알고 있는 사람이 있음\n\n'
        },
        { name: '기만·배신·이용',
          icon: '🎭',
          desc: '믿었던 사람이나 제공받은 정보·협력이 장애물로 뒤집힌다', detailLayout: 'AB',
          detailA: '거짓말을 함\n\n중요한 사실을 숨김\n\n거짓 정보를 줌\n\n속여서 행동하게 만듦\n\n이용함\n\n미끼로 이용함\n\n약속을 어김\n\n거래를 배신함\n\n',
          detailB: '결정적인 순간에 등을 돌림\n\n적에게 정보를 넘김\n\n중요한 것을 훔침\n\n일부러 실패하게 만듦\n\n내부에서 방해함\n\n아군인 척 접근함\n\n도움을 주는 척 함정으로 이끎\n\n'
        },
        { name: '비협조·무능·실수',
          icon: '🤦‍♂️',
          desc: '악의가 없는데 다른 사람 때문에 일이 어려워진다', detailLayout: 'AB',
          detailA: '협조하지 않음\n\n부탁을 거절함\n\n말을 듣지 않음\n\n중요한 정보를 전달하지 않음\n\n약속시간을 지키지 않음\n\n맡은 일을 하지 않음\n\n실수함\n\n잘못 이해함\n\n',
          detailB: '잘못된 판단을 함\n\n중요한 물건을 잃어버림\n\n계획을 망침\n\n공포에 빠져 행동하지 못함\n\n독단적으로 행동함\n\n계획과 다른 행동을 함\n\n구하려다 오히려 일을 악화시킴\n\n'
        },
        { name: '보호해야 하는 사람',
          icon: '🛡️',
          desc: '적이 아니라 오히려 소중한 사람이 장애물의 원인이 된다', detailLayout: 'AB',
          detailA: '약한 동료를 데려가야 함\n\n어린아이를 보호해야 함\n\n부상자를 데리고 이동해야 함\n\n환자를 돌봐야 함\n\n길을 모르는 사람을 이끌어야 함\n\n위험을 모르는 사람을 지켜야 함\n\n',
          detailB: '제멋대로 행동하는 사람을 보호해야 함\n\n느린 사람에게 속도를 맞춰야 함\n\n구조해야 할 사람이 움직일 수 없음\n\n보호대상이 적에게 노려짐\n\n보호대상이 붙잡힘\n\n보호대상이 스스로 위험에 뛰어듦\n\n'
        },
        { name: '선의의 방해',
          icon: '🕊️',
          desc: '상대가 좋은 의도로 주인공을 막는다', detailLayout: 'AB',
          detailA: '위험하다는 이유로 막음\n\n보호하기 위해 가둠\n\n꿈을 포기시키려 함\n\n현실적인 길을 강요함\n\n대신 문제를 해결하려 함\n\n',
          detailB: '실패하지 않도록 도전을 금지함\n\n진실을 알면 상처받을까 봐 숨김\n\n위험한 능력을 사용하지 못하게 함\n\n소중한 사람을 잃을까 봐 떠나지 못하게 함\n\n공동체를 위해 개인의 선택을 막음\n\n'
        },
        { name: '관계·감정 때문에 생기는 제약',
          icon: '💔',
          desc: '상대를 적으로 대할 수 없기 때문에 해결이 어려워진다', detailLayout: 'AB',
          detailA: '적이 가족임\n\n적이 친구임\n\n적이 은인임\n\n적이 스승임\n\n싸워야 할 상대를 좋아함\n\n상대에게 빚이 있음\n\n',
          detailB: '상대를 상처 입힐 수 없음\n\n상대를 버리고 갈 수 없음\n\n상대에게 진실을 말할 수 없음\n\n관계가 깨질까 봐 행동하지 못함\n\n한 사람을 선택하면 다른 사람이 상처받음\n\n서로 소중하지만 목표가 다름\n\n'
        },
        { name: '오해·불신·소통 실패',
          icon: '⚡',
          desc: '실제 적대관계가 아닌데 관계가 장애물로 변한다', detailLayout: 'AB',
          detailA: '오해받음\n\n상대를 오해함\n\n믿어주지 않음\n\n서로 의심함\n\n설명할 기회가 없음\n\n말을 해도 믿지 않음\n\n',
          detailB: '증명할 방법이 없음\n\n서로 다른 정보를 알고 있음\n\n의도가 잘못 전달됨\n\n문화·관습 차이로 충돌함\n\n언어가 통하지 않음\n\n과거의 사건 때문에 신뢰하지 못함\n\n'
        },
        { name: '가치관·신념의 충돌',
          icon: '⚖️',
          desc: '둘 다 나름의 이유가 있어서 물러서지 않는다', detailLayout: 'AB',
          detailA: '정의에 대한 생각이 다름\n\n옳고 그름의 기준이 다름\n\n생명을 대하는 기준이 다름\n\n희생을 허용하는 기준이 다름\n\n규칙을 지켜야 하는지 의견이 다름\n\n전통을 지킬지 바꿀지 충돌함\n\n',
          detailB: '개인과 공동체 중 무엇이 중요한지 다름\n\n목적을 위해 수단을 어디까지 허용할지 다름\n\n위험을 감수할 가치가 있는지 다름\n\n적을 용서할지 처벌할지 다름\n\n무엇을 지켜야 하는지 서로 다름\n\n'
        },
        { name: '관계의 변화·붕괴',
          icon: '🔗',
          desc: '기존 관계가 변하면서 새로운 장애물이 발생한다', detailLayout: 'AB',
          detailA: '동료가 떠남\n\n사이가 틀어짐\n\n신뢰가 깨짐\n\n협력관계가 끝남\n\n친구가 경쟁자가 됨\n\n동료가 적이 됨\n\n',
          detailB: '보호자가 더 이상 도와주지 못함\n\n중요한 사람이 자신을 거부함\n\n집단에서 따돌림당함\n\n관계가 끊겨 필요한 도움을 받을 수 없음\n\n서로 갈라져 따로 행동하게 됨\n\n'
        }


         
      ]
    },

       
/* ════════════════════════════════════════════════     🔻 장애물 - 2  세계·환경: environment 🔻     ════════════════════════════════════════════════ */
    { id: 'environment',
      label: '세계·환경',
      layoutType: '3',
      img: 'images/world/group/environment.jpg',
      cards: [
        {
          name: '카드명',
          img: 'images/core/sub-nav/wrld/setting.jpg', desc: '설명', detailLayout: 'AB',
          detailA: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n',
          detailB: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n'
        }
      ]
    },

       
/* ════════════════════════════════════════════════     🔻 장애물 - 3 생존·자원·수단: survival🔻     ════════════════════════════════════════════════ */
       
    { id: 'survival',
      label: '생존·자원·수단',
      layoutType: '3',
      img: 'images/world/group/survival.jpg',
      cards: [
        {
          name: '카드명',
          img: 'images/core/sub-nav/wrld/setting.jpg', desc: '설명', detailLayout: 'AB',
          detailA: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n',
          detailB: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n'
        }
      ]
    },
       
/* ════════════════════════════════════════════════     🔻 장애물 - 4 정보·시간·상황: context 🔻     ════════════════════════════════════════════════ */
       
    { id: 'context',
      label: '정보·시간·상황',
      layoutType: '3',
      img: 'images/world/group/context.jpg',
      cards: [
        {
          name: '카드명',
          img: 'images/core/sub-nav/wrld/setting.jpg', desc: '설명', detailLayout: 'AB',
          detailA: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n',
          detailB: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n'
        }
      ]
    },
       
/* ════════════════════════════════════════════════     🔻 장애물 - 5 세계 법칙: lars 🔻     ════════════════════════════════════════════════ */
       
    { id: 'lars',
      label: '세계 법칙',
      layoutType: '3',
      img: 'images/world/group/laws.jpg',
      cards: [
        {
          name: '카드명',
          img: 'images/core/sub-nav/wrld/setting.jpg', desc: '설명', detailLayout: 'AB',
          detailA: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n',
          detailB: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n'
        }
      ]
    },
       
/* ════════════════════════════════════════════════     🔻 장애물 - 6 초자연: supernatural 🔻     ════════════════════════════════════════════════ */
       
    { id: 'supernatural',
      label: '초자연',
      layoutType: '3',
      img: 'images/world/group/supernatural.jpg',
      cards: [
        {
          name: '카드명',
          img: 'images/core/sub-nav/wrld/setting.jpg', desc: '설명', detailLayout: 'AB',
          detailA: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n',
          detailB: '【제목】 내용 / 내용\n\n【활용법】\n《제목》\n내용\n\n《제목》\n내용\n\n'
        }
      ]
    }
    ] /* groups 끝 */
  }, /* 카테고리 끝 */

   
/* ════════════════════════════════════════════════      세팅 = 배경     ════════════════════════════════════════════════ */  
  setting: [

    /* 헤더 */
    { type: 'section' ,  label: ' 헤더 — 추가 내용1 ' },  

    { icon:'🌍', name:'판타지 세계', img:'images/Peep.png', subImg:'images/Giant_Elf.jpg', desc:'내용', detail:'【상세】 정보\n【상세】\n\n내용' },
    { icon:'🏙', name:'사이버 도시' },
    { icon:'🏜', name:'황무지' },
    { icon:'🏝', name:'고립된 섬' },
    { icon:'🌌', name:'우주 개척지' },
    { icon:'🏰', name:'왕국 시대' },
    { icon:'🌋', name:'화산 지대' },
    { icon:'❄', name:'빙설 세계' },

    { type: 'section' ,  label: ' 헤더 — 추가 내용 ' },       

    { icon:'🏰', name:'중세 왕국' }, { icon:'🌆', name:'미래 도시' },
    { icon:'🌿', name:'원시 밀림' }, { icon:'🌊', name:'심해 세계' },
    { icon:'🏔', name:'고산 왕국' }, { icon:'🌌', name:'우주' },
    { icon:'🌑', name:'지하 세계' }, { icon:'🌅', name:'사막 제국' },
    { icon:'❄', name:'빙하 세계' }, { icon:'🔥', name:'화산 땅' },
    { icon:'🌙', name:'달 세계' }, { icon:'🌀', name:'차원 공간' },
    { icon:'🏛', name:'고대 유적' }, { icon:'🌿', name:'마법 숲' },
    { icon:'💀', name:'폐허' }, { icon:'🌊', name:'섬 군도' },
    { icon:'⚙', name:'스팀펑크 도시' }, { icon:'🎭', name:'환상 무대' },
    { icon:'🌸', name:'평화로운 마을' }, { icon:'🌑', name:'암흑 지대' },
  ],


/* ════════════════════════════════════════════════      세계관 - 장소     ════════════════════════════════════════════════ */  

  location: [
     
    { icon:'🏰', name:'고성' },
    { icon:'🌲', name:'고대 숲' },
    { icon:'🏔', name:'설산' },
    { icon:'🏜', name:'사막 도시' },
    { icon:'🌋', name:'화산 던전' },
    { icon:'🏛', name:'신전' },
    { icon:'🚢', name:'해상 도시' },
    { icon:'🌌', name:'우주 정거장' },
  ],


/* ════════════════════════════════════════════════      세계관 - 아이템     ════════════════════════════════════════════════ */  

  item: [
     
    { icon:'💎', name:'마력 보석' },
    { icon:'📜', name:'고대 문서' },
    { icon:'👑', name:'왕관' },
    { icon:'🔑', name:'봉인 열쇠' },
    { icon:'🧿', name:'부적' },
    { icon:'💍', name:'마법 반지' },
    { icon:'⚔', name:'전설의 검' },
    { icon:'📦', name:'수수께끼 상자' },
  ],


/* ════════════════════════════════════════════════      세계관 - 도구     ════════════════════════════════════════════════ */  

  tool: [
     
    { icon:'🔨', name:'대장장이 망치' },
    { icon:'🪓', name:'벌목 도끼' },
    { icon:'🧭', name:'항해 나침반' },
    { icon:'🏹', name:'사냥 활' },
    { icon:'⛏', name:'채굴 곡괭이' },
    { icon:'🔬', name:'분석 장비' },
    { icon:'🛠', name:'만능 공구' },
    { icon:'⚒', name:'제작 도구' },
  ],


/* ════════════════════════════════════════════════      세계관 - 자원     ════════════════════════════════════════════════ */  

  resource: [
     
    { icon:'⛏', name:'철광석' },
    { icon:'💎', name:'마정석' },
    { icon:'🌲', name:'목재' },
    { icon:'🛢', name:'석유' },
    { icon:'💧', name:'수자원' },
    { icon:'☀', name:'태양 에너지' },
    { icon:'🔥', name:'연료' },
    { icon:'🔋', name:'에너지 결정' },
  ],


/* ════════════════════════════════════════════════      세계관 - 기술     ════════════════════════════════════════════════ */  

  tech: [
     
    { icon:'⚙', name:'증기 기술', img:'images/Giant_Elf.jpg', subImg:'images/Peep.png' }, 
    { icon:'💡', name:'전기 문명' },
    { icon:'🤖', name:'인공지능' }, { icon:'🚀', name:'우주 항법' },
    { icon:'🧬', name:'생체공학' }, { icon:'🔮', name:'마법 기계' },
    { icon:'⚗', name:'연금술' }, { icon:'📡', name:'통신망' },
    { icon:'🌌', name:'차원 기술' }, { icon:'⚡', name:'에너지 결정' },
    { icon:'🏗', name:'거대 건축' }, { icon:'🛡', name:'방어 시스템' },
    { icon:'🌊', name:'해양 기술' }, { icon:'🌿', name:'바이오 기술' },
    { icon:'💻', name:'사이버네틱스' }, { icon:'🔭', name:'천문학' },
    { icon:'⚖', name:'자동화' }, { icon:'🔬', name:'나노 기술' },
    { icon:'🌑', name:'어둠의 기술' }, { icon:'✨', name:'신성 공학' },

    { icon:'🚀', name:'우주 항법' },
    { icon:'🧬', name:'생체공학' },
    { icon:'🔮', name:'마법 기계' },
    { icon:'⚗', name:'연금술' },
    { icon:'📡', name:'통신망' },
  ],


/* ════════════════════════════════════════════════      세계관 - 스킬     ════════════════════════════════════════════════ */  

  skill: [
     
    { icon:'⚔', name:'검술' },
    { icon:'🏹', name:'궁술' },
    { icon:'🔥', name:'화염 마법' },
    { icon:'❄', name:'빙결 마법' },
    { icon:'🩹', name:'치유술' },
    { icon:'🥷', name:'암살술' },
    { icon:'🧠', name:'전략 전술' },
    { icon:'🐉', name:'용 조련' },
  ],


/* ════════════════════════════════════════════════      세계관 - 문화     ════════════════════════════════════════════════ */ 

  culture: [
     
    { icon:'👑', name:'군주제' }, { icon:'⚖', name:'공화제' },
    { icon:'🌿', name:'자연 숭배' }, { icon:'🔥', name:'전쟁 문화' },
    { icon:'📜', name:'학문 중심' }, { icon:'🎭', name:'예술 중심' },
    { icon:'🌊', name:'해양 문화' }, { icon:'🏛', name:'고대 문명' },
    { icon:'🌑', name:'어둠의 의식' }, { icon:'✨', name:'신성 종교' },
    { icon:'🔗', name:'씨족 사회' }, { icon:'👥', name:'집단주의' },
    { icon:'💎', name:'상업 중심' }, { icon:'⚔', name:'명예 사회' },
    { icon:'🌙', name:'신비 결사' }, { icon:'🌌', name:'다신교' },
    { icon:'🌿', name:'자연 공존' }, { icon:'🤖', name:'기계 숭배' },
    { icon:'🌊', name:'유목 문화' }, { icon:'🏔', name:'산악 문화' },
     
    { icon:'🏛', name:'제국 문화' },
    { icon:'⛩', name:'신앙 사회' },
    { icon:'🎭', name:'가면 축제' },
    { icon:'📖', name:'구전 전통' },
    { icon:'⚔', name:'전사 문화' },
    { icon:'🤝', name:'상인 연합' },
    { icon:'🎨', name:'예술 도시' },
    { icon:'👑', name:'귀족 사회' },
  ],


/* ════════════════════════════════════════════════      세계관 - 의상     ════════════════════════════════════════════════ */  

  costume: [
     
    { icon:'👑', name:'왕족 의복' },
    { icon:'🛡', name:'기사 갑옷' },
    { icon:'🥷', name:'닌자 복장' },
    { icon:'🧙', name:'마법사 로브' },
    { icon:'🎭', name:'축제 의상' },
    { icon:'👘', name:'전통 의복' },
    { icon:'🦾', name:'강화 슈트' },
    { icon:'🤖', name:'기계 장갑' },
  ],
};
