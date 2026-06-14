/* ════════════════════════════════════════════════
   CHARACTER DATA
   - CHARACTER_NAV  : 캐릭터 탭 네비게이션 정의
   - CHARACTER_CARDS: 캐릭터 탭 카드 데이터
════════════════════════════════════════════════ */

const CHARACTER_NAV = {
  label: '캐릭터',
  resetLabel: '캐릭터 초기화',
  subs: [
    { id:'archetype',   label:'원형', img:'images/Giant_Elf.jpg' },
    { id:'race',        label:'종족', icon:'🐉', type:'group'    },
    { id:'job',         label:'직업', img:'images/golem.png',  type:'group'    },
    { id:'personality', label:'성격', icon:'💫'   },
    { id:'attribute',   label:'속성', icon:'⚡'  ,type:'group'  },
    { id:'ability',     label:'능력',   },
    { id:'relation',    label:'관계', icon:'🔗'    },
  ]
};

const CHARACTER_CARDS = {

   
 /* ════════════════════════════════════════════════
   캐릭터 - 원형 
   ════════════════════════════════════════════════ */  
   archetype: [ 
     { icon:'⚔', img:'images/Giant_Elf.jpg', name:'영웅의 이름이 엄청길어서 옆으로 튀어나오는 현상이 아이디어 통합 창에서 발견됐는데 이거 어떻게 해결하면 좋을까?',
  desc:'시련을 통해 성장하고 세계를 구하는 존재. 결핍과 각성, 희생의 구조를 가진 서사의 중심축.',
  detail:'【서사 포지션】주인공 고정\n【핵심 갈등】내면의 결핍 vs 외부의 시련\n【변화 축】각성 → 희생 → 재탄생\n\n활용 팁: 결말부의 희생 장면에서 이 원형의 설득력이 가장 강해진다.' },
  
     { img:'images/golem.png',name:'골렘',   
  desc:'시련을 통해 성장하고 세계를 구하는 존재. 결핍과 각성, 희생의 구조를 가진 서사의 중심축.',
  detail:'【서사 포지션】주인공 고정\n【핵심 갈등】내면의 결핍 vs 외부의 시련\n【변화 축】각성 → 희생 → 재탄생\n\n활용 팁: 결말부의 희생 장면에서 이 원형의 설득력이 가장 강해진다.'},
 
    { icon:'😈', img:'images/Peep.png',name:'악당'  ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'🃏', name:'트릭스터1'     }, { icon:'👼', name:'수호자'     },

{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  
    { icon:'🔮', name:'이름이몇개까지가능할까요' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용' },
    { icon:'⚔', name:'전사' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'}, 
    { icon:'💀', name:'파멸자'     }, { icon:'🌹', name:'연인'       },
    { icon:'👑', name:'통치자'       }, { icon:'🌿', name:'치유자'     }, { icon:'🕵', name:'탐정'       },
    { icon:'🐺', name:'이방인'       }, { icon:'🌟', name:'선택받은 자'}, { icon:'🦊', name:'교활한 자'  },
    { icon:'🔗', name:'속박된 자'    }, { icon:'🌊', name:'방랑자'     },
      
 { type: 'section' ,  label: ' 수정 알림이 🚨' },  
    { icon:'⚖', name:'심판자' ,     desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'🌙', name:'어둠의 자',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'☀',  name:'빛의 자' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'☀',  name:'빛의 자' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
  ],

   
  // ── type:'group' 구조 ──
  // groups 배열 안에 그룹 하나씩 추가하면 돼
   
 /* ════════════════════════════════════════════════
   캐릭터 - 종족
   ════════════════════════════════════════════════ */  
 race: {   /* ═══  [종족]  ═══ */
  groups: [

    /* ────────   인간형   ──────── */
    {
      id: 'race_human',     /* ─  메인 메뉴 ─ */
      label: '인간형', 
      icon: '👤',
      img: 'images/golem.png',
      subgroups: [
        {
          id: 'race_human_skin',   /* 🟥🟥🟥🟥🟥🟥🟥 소그룹  1 🟥🟥🟥🟥🟥🟥🟥 */
          label: '피부',
          icon: '🟫', img: 'images/golem.png',
          cards: [         /* ─────[ ⬇️ 카드 ⬇️ ]───── */
            { icon: '⬜', name: '백색 2015 헤더 에러',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🟡', name: '금발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬛', name: '흑발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🔴', name: '적발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬜', name: '백발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'}, 
             
              { type: 'section' ,  label: ' 헤더 — 추가 내용 ' }, 
            { icon: '🟫', name: '갈색 피부',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬛', name: '흑색 피부',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🔵', name: '이색 피부',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🟡', name: '금발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬛', name: '흑발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🔴', name: '적발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬜', name: '백발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
          ]  /* ───────────────── 카드1 ───────────────── */
        },
        {
          id: 'race_human_hair',     /* 🟧🟧🟧🟧🟧🟧🟧 소그룹  2 🟧🟧🟧🟧🟧🟧🟧 */
          label: '모발',
          icon: '💇',
          cards: [        /* ─────[ ⬇️ 카드 ⬇️ ]───── */
            { icon: '🟡', name: '금발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬛', name: '흑발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🔴', name: '적발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '⬜', name: '백발',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
          ]  /* ───────────────── 카드2 ───────────────── */
        },
        {
          id: 'race_human_eye',    /* 🟨🟨🟨🟨🟨🟨🟨  소그룹  3  🟨🟨🟨🟨🟨🟨🟨 */
          label: '눈',
          icon: '👁',
          cards: [         /* ─────[ ⬇️ 카드 ⬇️ ]───── */
            { icon: '🔵', name: '청안',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🟤', name: '갈안',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🔴', name: '홍안',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '💜', name: '자안',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
          ]   /* ───────────────── 카드3 ───────────────── */
        },
        {
          id: 'race_human_body',   /* 🟩🟩🟩🟩🟩🟩🟩 소그룹  4  🟩🟩🟩🟩🟩🟩🟩 */
          label: '신체',
          icon: '💪',
          cards: [         /* ─────[ ⬇️ 카드 ⬇️ ]───── */
            { icon: '💪', name: '근육질',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🪶', name: '날렵한',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '🧸', name: '통통한',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
            { icon: '📏', name: '장신형',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용 '}, 
          ]  /* ───────────────── 카드4 ───────────────── */
        },
      ]
    },


    /* ── 의인화 계열 ── */
    {
      id: 'race_animal',
      label: '의인화',
      icon: '🐾',
      subgroups: [
        {
          id: 'race_animal_land',
          label: '육지 동물',
          icon: '🐺',
          cards: [
            { icon: '🐺', name: '늑대인간' },
            { icon: '🦊', name: '여우인간' },
            { icon: '🐱', name: '고양이인간' },
            { icon: '🐻', name: '곰인간' },
          ]
        },
        {
          id: 'race_animal_sea',
          label: '바다 어류',
          icon: '🐟',
          cards: [
            { icon: '🐟', name: '어인족' },
            { icon: '🦈', name: '상어인간' },
            { icon: '🐙', name: '문어인간' },
            { icon: '🦑', name: '오징어인간' },
          ]
        },
        {
          id: 'race_animal_insect',
          label: '곤충',
          icon: '🐛',
          cards: [
            { icon: '🐝', name: '벌인간' },
            { icon: '🦋', name: '나비인간' },
            { icon: '🐜', name: '개미인간' },
            { icon: '🕷', name: '거미인간' },
          ]
        },
        {
          id: 'race_animal_plant',
          label: '식물',
          icon: '🌿',
          cards: [
            { icon: '🌿', name: '덩굴인간' },
            { icon: '🌵', name: '선인장인간' },
            { icon: '🍄', name: '버섯인간' },
            { icon: '🌸', name: '꽃인간' },
          ]
        },
      ]
    },

    /* ── 판타지 계열 ── */
    {
      id: 'race_fantasy',
      label: '판타지',
      icon: '✨',
      subgroups: [
        {
          id: 'race_fantasy_demi',
          label: '아인종',
          icon: '🧝',
          cards: [
            { icon: '🧝', name: '엘프' },
            { icon: '🧔', name: '드워프' },
            { icon: '🧌', name: '오크' },
            { icon: '🐉', name: '드래곤족' },
          ]
        },
        {
          id: 'race_fantasy_undead',
          label: '언데드',
          icon: '🧟',
          cards: [
            { icon: '🧟', name: '좀비' },
            { icon: '🧛', name: '뱀파이어' },
            { icon: '💀', name: '스켈레톤' },
            { icon: '👻', name: '유령' },
          ]
        },
        {
          id: 'race_fantasy_beastman',
          label: '수인종',
          icon: '🦁',
          cards: [
            { icon: '🦁', name: '사자인' },
            { icon: '🐯', name: '호랑이인' },
            { icon: '🦅', name: '독수리인' },
            { icon: '🐊', name: '악어인' },
          ]
        },
        {
          id: 'race_fantasy_yokai',
          label: '요괴',
          icon: '👹',
          cards: [
            { icon: '👹', name: '오니' },
            { icon: '🦊', name: '구미호' },
            { icon: '🐍', name: '뱀요괴' },
            { icon: '👺', name: '텐구' },
          ]
        },
        {
          id: 'race_fantasy_divine',
          label: '천사와 악마',
          icon: '😇',
          cards: [
            { icon: '😇', name: '천사' },
            { icon: '😈', name: '악마' },
            { icon: '🌟', name: '세라핌' },
            { icon: '🌑', name: '타락천사' },
          ]
        },
        {
          id: 'race_fantasy_other',
          label: '판타지',
          icon: '🔮',
          cards: [
            { icon: '🔮', name: '마인' },
            { icon: '🌊', name: '정령족' },
            { icon: '🤖', name: '골렘족' },
            { icon: '🌌', name: '성간존재' },
          ]
        },
      ]
    },

     
  ]
},

   
 /* ════════════════════════════════════════════════
   캐릭터 - 직업 
   ════════════════════════════════════════════════ */  
     job: {
    groups: [
      {
        id: 'job_1',
        label: '직업1',
        icon: '👤',
        cards: [
   { icon:'⚔', name:'검사'      }, { icon:'🏹', name:'궁수'       }, { icon:'🧙', name:'마법사'   },

           
 { type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  
    { icon:'🛡', name:'기사'  ,  desc:'내용' ,  detail:'【상세】 정보\n【상세】\n\n내용'    },
    { icon:'🗡', name:'암살자',  desc:'내용' ,  detail:'【상세】 정보\n【상세】\n\n내용'  }, 
           
           
 { type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  
           { icon:'🎵', name:'음유시인' },
    { icon:'⚕', name:'치유사' ,  desc:'내용' ,  detail:'【상세】 정보\n【상세】\n\n내용'   }, 
    { icon:'🔧', name:'장인'  ,  desc:'내용' ,  detail:'【상세】 정보\n【상세】\n\n내용'      }, { icon:'📜', name:'학자'     },
        ]
      },

       {
        id: 'job_3',
        label: '직업3',
        icon: '✨',
        cards: [
              { icon:'⚗', name:'연금술사'  },
              { icon:'🕵', name:'첩보원'      },
        ]
      },
    ]
  },

   
 /* ════════════════════════════════════════════════
   캐릭터 - 성격
   ════════════════════════════════════════════════ */  
  personality: [
    { icon:'🔥', name:'열정적'   }, { icon:'❄',  name:'냉정한'    }, { icon:'🌊', name:'유연한'   },
    { icon:'🪨', name:'완고한'   }, { icon:'🌟', name:'낙관적'     }, { icon:'🌑', name:'비관적'   },
    { icon:'💫', name:'충동적'   }, { icon:'⚖',  name:'신중한'    }, { icon:'🎭', name:'이중적'   },
    { icon:'🦁', name:'용감한'   }, { icon:'🐇', name:'소심한'     }, { icon:'🦊', name:'교활한'   },
    { icon:'🕊', name:'온화한'   }, { icon:'🐺', name:'거친'       }, { icon:'🌹', name:'낭만적'   },
    { icon:'🔬', name:'분석적'   }, { icon:'🎨', name:'예술적'     }, { icon:'🤝', name:'친화적'   },
    { icon:'👤', name:'고독한'   }, { icon:'✨', name:'신비로운'    },
  ],

   
 /* ════════════════════════════════════════════════
   캐릭터 - 속성
   ════════════════════════════════════════════════ */  

 attribute: {　 /* 속성  카테고리 */
    groups: [
      {
        id: 'attribute_1',
        label: '속성 1',　 /*그룹 이름*/
        icon: '👤',
        cards: [
   { icon:'⚔', name:'검사' ,     desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용' },
   { icon:'🏹', name:'궁수'   ,  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
   { icon:'🧙', name:'마법사',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
   { icon:'🛡', name:'기사' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
   { icon:'🗡', name:'암살자' ,  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'}, 
   { icon:'🎵', name:'음유시인',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용' },
    { icon:'⚕', name:'치유사'    }, { icon:'🔧', name:'장인'        }, { icon:'📜', name:'학자'     },
        ]
      },
      {
        id: 'attribute_2',
        label: '속성 2',
        icon: '🐾',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },
        ]
      },
      {
        id: 'attribute_3',
        label: '속성 3',
        icon: '✨',
        cards: [
              { icon:'⚗', name:'연금술사'  },
              { icon:'🕵', name:'첩보원'      },
        ]
      },
   {
        id: 'attribute_4',
        label: '속성 4',
        icon: '🐾',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },
        ]
      },
      {
        id: 'attribute_5',
        label: '속성 5',
        icon: '✨',
        cards: [
              { icon:'⚗', name:'연금술사'  },
              { icon:'🕵', name:'첩보원'      },
        ]
      },
   {
        id: 'attribute_6',
        label: '속성 6번',
        icon: '🐾',  img:'images/Peep.png',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },
        ]
      },
    ]
  },



 /* ════════════════════════════════════════════════
   캐릭터 - 능력
   ════════════════════════════════════════════════ */  
  ability: [
    { icon:'🔮', name:'예지',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'}, 
    { icon:'🌀', name:'공간이동',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
     { type: 'section' ,  label: ' 헤더 — 추가 내용 ' }, 
    { icon:'⏳', name:'시간조작',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'🔗', name:'결박' ,     desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'🌊', name:'소환'  ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'💥', name:'폭발'  ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'🛡', name:'방벽'     }, { icon:'👁',  name:'투시'      }, { icon:'🎭', name:'변신'     },
    { icon:'💀', name:'부활'     }, { icon:'⚡', name:'가속'        }, { icon:'🌿', name:'치유'     },
    { icon:'🔥', name:'소각'     }, { icon:'❄',  name:'동결'       }, { icon:'💫', name:'정화'     },
    { icon:'🌑', name:'잠식'     }, { icon:'🎵', name:'매혹'        }, { icon:'🧠', name:'독심'     },
    { icon:'⚔', name:'검기'     }, { icon:'🌌', name:'절대영역'    },
  ],

   
 /* ════════════════════════════════════════════════
   캐릭터 - 관계
   ════════════════════════════════════════════════ */  
  relation: [
    { icon:'👥', name:'동료',   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
     { type: 'section' ,  label: ' 헤더 — 추가 내용 ' }, 
     { icon:'❤',  name:'연인' ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용' },
     { icon:'🤝', name:'동맹'  ,   desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'},
    { icon:'⚔', name:'라이벌'       }, { icon:'🐍', name:'배신자'          }, { icon:'🛡', name:'보호자'       },
    { icon:'👑', name:'주종'         }, { icon:'🎭', name:'쌍둥이'          }, { icon:'💀', name:'숙적'         },
    { icon:'🌹', name:'짝사랑'       }, { icon:'🔗', name:'운명적 인연'     }, { icon:'🌙', name:'비밀결사'     },
    { icon:'🐾', name:'사제지간'     }, { icon:'👤', name:'고독한 자'       }, { icon:'🌊', name:'이별'         },
    { icon:'🔮', name:'예언의 관계'  }, { icon:'💫', name:'전생인연'        }, { icon:'🌿', name:'치유자와 상처'},
    { icon:'⚖', name:'거래관계'     }, { icon:'🌑', name:'어둠의 계약'     },
  ],
};
