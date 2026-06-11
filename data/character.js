/* ════════════════════════════════════════════════
   CHARACTER DATA
   - CHARACTER_NAV  : 캐릭터 탭 네비게이션 정의
   - CHARACTER_CARDS: 캐릭터 탭 카드 데이터
════════════════════════════════════════════════ */

const CHARACTER_NAV = {
  label: '캐릭터',
  resetLabel: '캐릭터 초기화',
  subs: [
    { id:'archetype',   label:'원형', img:'images/Giant_Elf.png' },
    { id:'race',        label:'종족', icon:'🐉', type:'group'    },
    { id:'job',         label:'직업', img:'images/golem.png',  type:'group'    },
    { id:'personality', label:'성격', icon:'💫'                   },
    { id:'attribute',   label:'속성', icon:'⚡'  ,type:'group'  },
    { id:'ability',     label:'능력', icon:'✨'                   },
    { id:'relation',    label:'관계', icon:'🔗'                   },
  ]
};

const CHARACTER_CARDS = {

 /* ════════════════════════════════════════════════
   캐릭터 - 원형 
   ════════════════════════════════════════════════ */  
   archetype: [
    { icon:'⚔', img:'images/Giant_Elf.png', name:'영웅임',
  desc:'시련을 통해 성장하고 세계를 구하는 존재. 결핍과 각성, 희생의 구조를 가진 서사의 중심축.',
  detail:'【서사 포지션】주인공 고정\n【핵심 갈등】내면의 결핍 vs 외부의 시련\n【변화 축】각성 → 희생 → 재탄생\n\n활용 팁: 결말부의 희생 장면에서 이 원형의 설득력이 가장 강해진다.' },
  
     { img:'images/golem.png',name:'골렘',   
  desc:'시련을 통해 성장하고 세계를 구하는 존재. 결핍과 각성, 희생의 구조를 가진 서사의 중심축.',
  detail:'【서사 포지션】주인공 고정\n【핵심 갈등】내면의 결핍 vs 외부의 시련\n【변화 축】각성 → 희생 → 재탄생\n\n활용 팁: 결말부의 희생 장면에서 이 원형의 설득력이 가장 강해진다.'},
 
     { icon:'😈', img:'images/Peep.png',name:'악당'       },
    { icon:'🃏', name:'트릭스터'     }, { icon:'👼', name:'수호자'     }, { icon:'🔮', name:'예언자'     },
    { icon:'⚔', name:'전사'         }, { icon:'💀', name:'파멸자'     }, { icon:'🌹', name:'연인'       },
    { icon:'👑', name:'통치자'       }, { icon:'🌿', name:'치유자'     }, { icon:'🕵', name:'탐정'       },
    { icon:'🐺', name:'이방인'       }, { icon:'🌟', name:'선택받은 자'}, { icon:'🦊', name:'교활한 자'  },
    { icon:'🔗', name:'속박된 자'    }, { icon:'🌊', name:'방랑자'     }, { icon:'⚖', name:'심판자'     },
    { icon:'🌙', name:'어둠의 자'    }, { icon:'☀',  name:'빛의 자'   },
  ],

   
  // ── type:'group' 구조 ──
  // groups 배열 안에 그룹 하나씩 추가하면 돼
 /* ════════════════════════════════════════════════
   캐릭터 - 종족
   ════════════════════════════════════════════════ */  
  race: {  　 /* 카테고리 */
    groups: [
      {
        id: 'race_human',
        label: '인간',
        icon: '👤',  img:'images/golem.png', 
        cards: [
          { icon:'👦', name:'소년'  },
          { icon:'👧', name:'소녀'  },
          { icon:'👨', name:'청년'  },
          { icon:'🤖', name:'AI'    },
        ]
      },
      {
        id: 'race_animal',
        label: '의인화',
        icon: '🐾',
        cards: [
          { icon:'🐺', name:'늑대인간'   },
          { icon:'🦊', name:'여우인간'   },
          { icon:'🐱', name:'고양이인간' },
        ]
      },
      {
        id: 'race_fantasy',
        label: '판타지',
        icon: '✨',
        cards: [
          { icon:'🧝', name:'엘프'     },
          { icon:'🧟', name:'언데드'   },
          { icon:'🐉', name:'드래곤족' },
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
    { icon:'🛡', name:'기사'      }, { icon:'🗡', name:'암살자'      }, { icon:'🎵', name:'음유시인' },
    { icon:'⚕', name:'치유사'    }, { icon:'🔧', name:'장인'        }, { icon:'📜', name:'학자'     },
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
   { icon:'⚔', name:'검사'      }, { icon:'🏹', name:'궁수'       }, { icon:'🧙', name:'마법사'   },
    { icon:'🛡', name:'기사'      }, { icon:'🗡', name:'암살자'      }, { icon:'🎵', name:'음유시인' },
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
        label: '속성 6',
        icon: '🐾',
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
    { icon:'🔮', name:'예지'     }, { icon:'🌀', name:'공간이동'   }, { icon:'⏳', name:'시간조작' },
    { icon:'🔗', name:'결박'     }, { icon:'🌊', name:'소환'       }, { icon:'💥', name:'폭발'     },
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
    { icon:'👥', name:'동료'         }, { icon:'❤',  name:'연인'           }, { icon:'🤝', name:'동맹'         },
    { icon:'⚔', name:'라이벌'       }, { icon:'🐍', name:'배신자'          }, { icon:'🛡', name:'보호자'       },
    { icon:'👑', name:'주종'         }, { icon:'🎭', name:'쌍둥이'          }, { icon:'💀', name:'숙적'         },
    { icon:'🌹', name:'짝사랑'       }, { icon:'🔗', name:'운명적 인연'     }, { icon:'🌙', name:'비밀결사'     },
    { icon:'🐾', name:'사제지간'     }, { icon:'👤', name:'고독한 자'       }, { icon:'🌊', name:'이별'         },
    { icon:'🔮', name:'예언의 관계'  }, { icon:'💫', name:'전생인연'        }, { icon:'🌿', name:'치유자와 상처'},
    { icon:'⚖', name:'거래관계'     }, { icon:'🌑', name:'어둠의 계약'     },
  ],
};
