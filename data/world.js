/* ═════════════════════════════════════════════════════════════════════
   NARRATIVE DATA
   - NARRATIVE_NAV  : 스토리 탭 네비게이션 정의
   - NARRATIVE_CARDS: 스토리 탭 카드 데이터

섹션 헤더
{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  

카드 코드
{ icon:'🔮', name:'이름' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'  },


layoutType: 'C',   ← 여기에 A/B/C/D 입력하면 됨.  A=5 B=4 C=3 D=2  카드 가로 갯수,기본=B


상세 정보  \n\n 분리, 기본 C 방식은 detail 하나로,  detailLayout/detailMode: 'AB' 
또는 detailB/detailRight 입력이 있으면 A/B 2열 방식으로 표시. A열은 detailA/detailLeft/detail, B열은 detailB/detailRight로 직접 제어할 수 있습니다.

    detailMode: 'AB',
    detailA: ' ',
    detailB: ' '},


═══════════════════════════════════════════════════════════════════════ */


const WORLD_NAV = {
  label: '세계관',
  resetLabel: '세계관 초기화',
  subs: [
     
  { id: 'obstacle',  label: '장애물',  img:'images/core/sub-nav/wrld/setting.jpg',   type:'group'   },
  { id: 'setting',  label: '배경',  img:'images/core/sub-nav/wrld/setting.jpg'  },
  { id: 'location', label: '장소',  img:'images/core/sub-nav/wrld/location.jpg' },
  { id: 'item',     label: '아이템', img:'images/core/sub-nav/wrld/item.jpg'    },
  { id: 'tool',     label: '도구',  img:'images/core/sub-nav/wrld/tool.jpg'    },
  { id: 'resource', label: '자원',  img:'images/core/sub-nav/wrld/resource.jpg'},
  { id: 'tech',     label: '기술',  img:'images/core/sub-nav/wrld/tech.jpg'    },
  { id: 'skill',    label: '스킬',  img:'images/core/sub-nav/wrld/skill.jpg'   },
  { id: 'culture',  label: '문화',  img:'images/core/sub-nav/wrld/culture.jpg' },
  { id: 'costume',  label: '의상',  img:'images/core/sub-nav/wrld/costume.jpg' },
     
  ]
};


const WORLD_CARDS = {
 /* ════════════════════════════════════════════════      세계관     ════════════════════════════════════════════════ */  

   
   /* ════════════════════════════════════════════════     🔻 장애물 Obstacle 🔻     ════════════════════════════════════════════════ */  


 obstacle: { /*  장애물 카테고리  */
    groups: [
                   
/* ════════════════════════════════════════════════     🔻 장애물 - 사람관계 people 🔻     ════════════════════════════════════════════════ */  

    { /* 그룹 객체 열기 */
      id: 'obstacle_people',     /* ─  메인 메뉴 ─ */
      label: '인간·사회', 
      layoutType: 'C',  /* ← 여기에 'A'/'B'/'C'/'D' 중 원하는 타입을 입력하면 이 그룹 카드 목록에 고정 적용됨 */
      icon: '👤',
      /* ═══ img: 'images/character/group/human.jpg', ═════ */    /* ─  그룹 이미지 ─ */
      subgroups: [   /* 서브그룹 전체  */
        {      /* 서브그룹 객체  */
           
          id: 'people',
          label: '사람·관계',   /*그룹 이름*/
          layoutType: 'D',
          img: 'images/narrative/group/want_01.jpg',    /* ─  그룹 이미지 ─ */
          cards: [


{ type: 'section' ,  label: ' 사람·관계의 장애물 ' },
           
  { name: '직접적인 적대·공격',    img: 'images/narrative/want/w1/sala.jpg',  subImg:'images/narrative/want/w1/salas.jpg',
    desc: '설명',  
    detailLayout: 'AB',
    detailA: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n',
    detailB: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
   },
             
  { name: '경쟁·이해관계 충돌',    img: 'images/narrative/want/w1/sojung.jpg',
    desc: '설명',
    detailMode: 'AB',
    detail: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n',
    detailB: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
  },


  { name: '통제·지배·강요',    img: 'images/narrative/want/w1/kiken.jpg',
    desc: '설명',
    detail: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
  },

           
        ]   /* 카드 배열 닫기 */
       }     /* subgroup 객체 닫기 */
      ]     /* subgroups 배열 닫기 */
    },      /* group 객체 닫기 */
 
               
/* ════════════════════════════════════════════════     🔻 장애물 - 사람관계 people 🔻     ════════════════════════════════════════════════ */  

    {  /* 그룹 객체 열기 */
      id: 'obstacle_people2',     /* ─  메인 메뉴 ─ */
      label: '인간·사회', 
      layoutType: 'C',  /* ← 여기에 'A'/'B'/'C'/'D' 중 원하는 타입을 입력하면 이 그룹 카드 목록에 고정 적용됨 */
      icon: '👤',
      /* ═══ img: 'images/character/group/human.jpg', ═════ */    /* ─  그룹 이미지 ─ */
      subgroups: [  /* 서브그룹 전체 */
        {    /* 서브그룹 객체  */
           
          id: 'people2',
          label: '사람·관계',   /*그룹 이름*/
          layoutType: 'D',
          img: 'images/narrative/group/want_01.jpg',    /* ─  그룹 이미지 ─ */
          cards: [


{ type: 'section' ,  label: ' 사람·관계의 장애물 ' },
           
  { name: '직접적인 적대·공격',    img: 'images/narrative/want/w1/sala.jpg',  subImg:'images/narrative/want/w1/salas.jpg',
    desc: '설명',  
    detailLayout: 'AB',
    detailA: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n',
    detailB: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
   },
             
  { name: '경쟁·이해관계 충돌',    img: 'images/narrative/want/w1/sojung.jpg',
    desc: '설명',
    detailMode: 'AB',
    detail: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n',
    detailB: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
  },


  { name: '통제·지배·강요',    img: 'images/narrative/want/w1/kiken.jpg',
    desc: '설명',
    detail: '【방향 태그】 자기 자신 / 미래\n\n【활용법】\n《일상·치유물》\n결말\n\n《비틀기3》\n희생적 결말\n\n' 
  },

           
        ]   /* 카드 배열 닫기 */
       }     /* subgroup 객체 닫기 */
      ]     /* subgroups 배열 닫기 */
    },      /* group 객체 닫기 */



/* ════════════════════════════════════════════════     🔻 장애물 - 관계 relations 🔻     ════════════════════════════════════════════════ */  
 
    {
      id: 'want_13',
      label: '초월·의미·구원',
      layoutType: 'D',
      img: 'images/narrative/group/want_13.jpg',   /* ─  그룹 이미지 ─ */
      cards: [


{ name: '살아갈 이유를 찾고 싶다', img:'images/character/race/slime.jpg', 
    desc: '특정 목표가 아니라, 삶을 지속해야 할 근본적인 이유 자체를 잃어버린 상태에서 그것을 다시 찾고 싶은 욕망', 
    detail: '【방향 태그】 자기 자신 / 결핍\n\n【활용법】\n《드라마》\n이유를 찾는 과정을 거창한 깨달음이 아니라, 아주 사소한 것(반려동물, 계절의 냄새)에서 발견되는 것으로 그리면 진정성이 커짐\n\n《일상·치유물》\n삶의 이유를 잃은 캐릭터가 일상의 작은 루틴을 통해 서서히 회복해가는 과정을 담담하게 그리면 깊은 공감을 줄 수 있음\n\n《포스트 아포칼립스》\n모든 게 무너진 세계에서도 "그래도 살아야 할 이유"를 찾는 구조는 생존 욕망과 자연스럽게 겹쳐지며 스케일이 커짐\n\n《다크판타지》\n이유를 찾지 못한 채 절망 속에 머무르는 기간을 충분히 길게 그려야, 이후 찾아낸 이유의 무게가 진짜로 느껴짐\n\n【바로 써먹는 씨앗】\n왜 살아야 하는지 답을 잃은 채로, 그냥 관성처럼 하루를 버티는 캐릭터\n아주 사소한 계기(누군가의 부탁, 작은 약속)로 다시 살아갈 힘을 얻는 캐릭터\n살아갈 이유를 찾아 헤매다가, 그 이유가 거창할 필요 없다는 걸 깨닫는 캐릭터\n\n【상세설명】\n《결핍판》\n이유를 찾지 못한 상태가 길어지면 깊은 무기력, 삶에 대한 근본적 회의로 이어질 수 있음\n\n《과잉판》\n이유를 찾으려는 집착이 지나치면, 하나의 이유(사람, 목표)에 삶 전체를 걸어버리는 위태로운 의존으로 흐를 수 있음\n\n《자주 짝지어지는 갈등》\n삶의 이유를 앗아간 상실이나 좌절, 이유를 찾아도 그것이 흔들릴 때의 재추락 위험, 이유를 강요하는 주변과의 어긋남\n\n《자주 따르는 대가》\n이유를 찾기까지의 오랜 방황과 고통, 찾은 이유마저 언젠가 사라질 수 있다는 불안\n\n【결말·골인지점】\n《클리셰형》\n소중한 존재나 목표를 통해 다시 살아갈 이유를 찾음\n\n《비틀기1》\n거창한 이유가 아니라, 그냥 "오늘 하루를 살아냈다"는 사실 자체가 이유가 되는 결말\n\n《비틀기2》\n이유를 찾았다가 다시 잃지만, 그 반복 속에서도 계속 찾아 나서는 법을 배우는 결말\n\n《비틀기3》\n자신이 살아갈 이유를 찾던 중, 오히려 누군가에게 살아갈 이유가 되어주는 존재로 전환되는 결말\n\n' 
},

  { name: '속죄하고 싶다', img:'images/character/race/slime.jpg', 
    desc: '과거에 저지른 잘못이나 죄로 인한 죄책감을 씻어내고, 스스로를 용서할 수 있는 상태에 이르고 싶은 욕망', 
    detail: '【방향 태그】 자기 자신 / 과거\n\n【활용법】\n《다크판타지·비극물》\n속죄가 결코 완전히 이뤄지지 않을 수도 있다는 걸 인정하는 톤으로 가면("씻을 수 없는 죄"), 장르 특유의 무거운 진정성이 생김\n\n《드라마》\n속죄를 한 번의 큰 행동이 아니라, 평생에 걸친 반복적인 선행으로 그리면 죄의 무게에 걸맞은 서사가 됨\n\n《영웅물》\n과거에 죄를 지은 자가 이번 생에는 다른 이를 구하는 데 삶을 바치는 구조는 클리셰지만 강력한 동기부여가 됨\n\n《느와르》\n속죄가 사회적 용서가 아니라, 죄의 대상(피해자)에게 직접 갚는 형태로 그려지면 훨씬 구체적인 서사가 됨\n\n【바로 써먹는 씨앗】\n오래전 저지른 잘못을 갚기 위해, 평생을 다른 이들을 돕는 데 바치는 캐릭터\n속죄할 대상이 이미 죽거나 사라져, 갚을 방법조차 없는 캐릭터의 절망\n속죄를 위해 애썼지만, 정작 자신을 용서하지 못하는 캐릭터\n\n【상세설명】\n《결핍판》\n속죄할 기회조차 없으면 죄책감이 평생의 짐으로 굳어질 수 있음\n\n《과잉판》\n속죄에 대한 집착이 지나치면, 스스로를 끝없이 벌하는 자기파괴적 고행으로 흐를 수 있음\n\n《자주 짝지어지는 갈등》\n속죄를 받아줄 대상의 부재나 거부, 죄를 완전히 갚을 수 없다는 근본적 한계, 과거를 아는 이들의 용서받지 못할 거라는 냉담함\n\n《자주 따르는 대가》\n속죄를 위해 바치는 평생의 헌신과 희생, 완전한 해소는 오지 않을 수 있다는 걸 받아들여야 함\n\n【결말·골인지점】\n《클리셰형》\n오랜 속죄 끝에 진심이 닿아 용서받고 짐을 내려놓음\n\n《비틀기1》\n타인에게는 용서받지만, 끝내 스스로를 용서하지 못한 채 살아가는 결말\n\n《비틀기2》\n완전한 속죄란 불가능하다는 걸 받아들이며, 그 죄를 안은 채로도 계속 살아가기로 하는 결말\n\n《비틀기3》\n속죄의 과정 자체가 다른 이들을 구원하며, 죄가 오히려 선한 유산으로 전환되는 결말\n\n' 
  },

           
       
        ]   /* 그룹 속 카드들  끝 */
      },   /* 그룹 하나의 끝 */

       
  /* ════════════════════════════════════════════════ ↑ 끝 장애물 obstacle ════════════════════════════════════════════════ */

    ]    /* groups 끝 */
  },     /* 카테고리 끝 */

   
 /* ════════════════════════════════════════════════      세팅 = 배경     ════════════════════════════════════════════════ */  
   
   
   
  setting: [

/* 헤더 */  { type: 'section' ,  label: ' 헤더 — 추가 내용1 ' },  
    { icon:'🌍', name:'판타지 세계' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용' },
    { icon:'🏙', name:'사이버 도시' },
    { icon:'🏜', name:'황무지' },
    { icon:'🏝', name:'고립된 섬' },
    { icon:'🌌', name:'우주 개척지' },
    { icon:'🏰', name:'왕국 시대' },
    { icon:'🌋', name:'화산 지대' },
    { icon:'❄', name:'빙설 세계' },

{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },       
    { icon:'🏰', name:'중세 왕국'      }, { icon:'🌆', name:'미래 도시'    },
    { icon:'🌿', name:'원시 밀림'      }, { icon:'🌊', name:'심해 세계'    },
    { icon:'🏔', name:'고산 왕국'      }, { icon:'🌌', name:'우주'         },
    { icon:'🌑', name:'지하 세계'      }, { icon:'🌅', name:'사막 제국'    },
    { icon:'❄',  name:'빙하 세계'     }, { icon:'🔥', name:'화산 땅'      },
    { icon:'🌙', name:'달 세계'        }, { icon:'🌀', name:'차원 공간'    },
    { icon:'🏛', name:'고대 유적'      }, { icon:'🌿', name:'마법 숲'      },
    { icon:'💀', name:'폐허'           }, { icon:'🌊', name:'섬 군도'      },
    { icon:'⚙',  name:'스팀펑크 도시' }, { icon:'🎭', name:'환상 무대'    },
    { icon:'🌸', name:'평화로운 마을'  }, { icon:'🌑', name:'암흑 지대'    },
  ],


   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
   
   
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



   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
   
   
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



   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
   
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



   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
   
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


   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
   
  tech: [
     
    { icon:'⚙',  name:'증기 기술',  img:'images/Giant_Elf.jpg', subImg:'images/Peep.png'  }, 
    { icon:'💡', name:'전기 문명'   },
    { icon:'🤖', name:'인공지능'      }, { icon:'🚀', name:'우주 항법'   },
    { icon:'🧬', name:'생체공학'      }, { icon:'🔮', name:'마법 기계'   },
    { icon:'⚗',  name:'연금술'       }, { icon:'📡', name:'통신망'      },
    { icon:'🌌', name:'차원 기술'     }, { icon:'⚡', name:'에너지 결정' },
    { icon:'🏗',  name:'거대 건축'    }, { icon:'🛡', name:'방어 시스템' },
    { icon:'🌊', name:'해양 기술'     }, { icon:'🌿', name:'바이오 기술' },
    { icon:'💻', name:'사이버네틱스'  }, { icon:'🔭', name:'천문학'      },
    { icon:'⚖',  name:'자동화'       }, { icon:'🔬', name:'나노 기술'   },
    { icon:'🌑', name:'어둠의 기술'   }, { icon:'✨', name:'신성 공학'   },

     
    { icon:'🚀', name:'우주 항법' },
    { icon:'🧬', name:'생체공학' },
    { icon:'🔮', name:'마법 기계' },
    { icon:'⚗', name:'연금술' },
    { icon:'📡', name:'통신망' },
  ],



 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  

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


   
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */ 
   
  culture: [
     
    { icon:'👑', name:'군주제'     }, { icon:'⚖',  name:'공화제'     },
    { icon:'🌿', name:'자연 숭배' }, { icon:'🔥', name:'전쟁 문화'   },
    { icon:'📜', name:'학문 중심' }, { icon:'🎭', name:'예술 중심'   },
    { icon:'🌊', name:'해양 문화' }, { icon:'🏛', name:'고대 문명'   },
    { icon:'🌑', name:'어둠의 의식'}, { icon:'✨', name:'신성 종교'  },
    { icon:'🔗', name:'씨족 사회' }, { icon:'👥', name:'집단주의'    },
    { icon:'💎', name:'상업 중심' }, { icon:'⚔',  name:'명예 사회'  },
    { icon:'🌙', name:'신비 결사' }, { icon:'🌌', name:'다신교'      },
    { icon:'🌿', name:'자연 공존' }, { icon:'🤖', name:'기계 숭배'   },
    { icon:'🌊', name:'유목 문화' }, { icon:'🏔', name:'산악 문화'   },
     
    { icon:'🏛', name:'제국 문화' },
    { icon:'⛩', name:'신앙 사회' },
    { icon:'🎭', name:'가면 축제' },
    { icon:'📖', name:'구전 전통' },
    { icon:'⚔', name:'전사 문화' },
    { icon:'🤝', name:'상인 연합' },
    { icon:'🎨', name:'예술 도시' },
    { icon:'👑', name:'귀족 사회' },
  ],


/* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  
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







