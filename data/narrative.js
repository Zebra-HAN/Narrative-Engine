/* ════════════════════════════════════════════════
   NARRATIVE DATA
   - NARRATIVE_NAV  : 스토리 탭 네비게이션 정의
   - NARRATIVE_CARDS: 스토리 탭 카드 데이터

   
섹션 헤더
{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  

카드 코드
{ icon:'🔮', name:'이름' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'  },


layoutType: 'C',   ← 여기에 'A'/'B'/'C'/'D' 중 원하는 타입을 입력하면 이 그룹 카드 목록에 고정 적용됨 


════════════════════════════════════════════════ */

const NARRATIVE_NAV = {
  label: '스토리',
  resetLabel: '스토리 초기화',
  subs: [
    { id:'goal',    label:'목표', img:'images/core/sub-nav/stry/goal.jpg' },
    { id:'want',  label:'욕망', img:'images/core/sub-nav/stry/desire.jpg',   type:'group'   },
    { id:'conflict',label:'갈등', img:'images/core/sub-nav/stry/conflict.jpg'  },
    { id:'distort', label:'왜곡', img:'images/core/sub-nav/stry/distort.jpg' },
    { id:'event',   label:'사건', img:'images/core/sub-nav/stry/event.jpg' },
    { id:'choice',  label:'선택', img:'images/core/sub-nav/stry/choice.jpg'  },
    { id:'twist',   label:'반전', img:'images/core/sub-nav/stry/twist.jpg' },
    { id:'ending',  label:'결말', img:'images/core/sub-nav/stry/ending.jpg' },
  ]
};

const NARRATIVE_CARDS = {


   
/* ════════════════════════════════════════════════     🔻 목표 goal 🔻     ════════════════════════════════════════════════ */  

  goal: [
    { icon:'🏆', name:'최강'       }, { icon:'👑', name:'왕위'       }, { icon:'💎', name:'보물'   },
    { icon:'🔮', name:'진실'       }, { icon:'🌅', name:'평화'       }, { icon:'💀', name:'복수'   },
    { icon:'❤',  name:'사랑'       }, { icon:'🌿', name:'생존'       }, { icon:'🌌', name:'신'     },
    { icon:'⚔',  name:'전쟁 종식' }, { icon:'🔗', name:'자유'       }, { icon:'🌊', name:'귀환'   },
    { icon:'🧬', name:'불사'       }, { icon:'🔥', name:'혁명'       }, { icon:'💫', name:'구원'   },
    { icon:'🌙', name:'기억'       }, { icon:'👥', name:'가족'       }, { icon:'⚖',  name:'정의'  },
    { icon:'🎭', name:'인정'       }, { icon:'🌱', name:'성장'       },
  ],


      
/* ════════════════════════════════════════════════     🔻 욕망 want 🔻     ════════════════════════════════════════════════ */  


    want: {　 /*  욕망 카테고리  */
    groups: [
      {
        id: 'want_1',
        label: '생존·안전', /*그룹 이름*/
        img: 'images/character/race/angels.jpg',
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
        id: 'want_2',
        label: '힘·지배',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },
        ]
      },
      {
        id: 'want_3',
        label: '자유·해방',
        img: 'images/character/race/angels.jpg',
        cards: [
              { icon:'⚗', name:'연금술사'  },
              { icon:'🕵', name:'첩보원'      },
        ]
      },
   {
        id: 'want_4',
        label: '쾌락·경험·향유',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },
        ]
      },
      {
        id: 'want_5',
        label: '사랑·소속',
        img: 'images/character/race/angels.jpg',
        cards: [
              { icon:'⚗', name:'연금술사'  },
              { icon:'🕵', name:'첩보원'      },
        ]
      },
   {
        id: 'want_6',
        label: '인정·명예',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },


        ]
      },
   {
        id: 'want_7',
        label: '소유·성공',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },


        ]
      },
   {
        id: 'want_8',
        label: '성장·자아실현',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },

       ]
      },
   {
        id: 'want_9',
        label: '창조·표현',
        img: 'images/character/group/fantasy.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },


        ]
      },
   {
        id: 'want_10',
        label: '상실·회복',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },


        ]
      },
   {
        id: 'want_11',
        label: '정의·복수',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },



        ]
      },
   {
        id: 'want_12',
        label: '진실·수수께끼',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },


        ]
      },
   {
        id: 'want_13',
        label: '초월·의미·구원',
        img: 'images/character/race/angels.jpg',
        cards: [
    { icon:'🏴', name:'해적'      }, { icon:'🐾', name:'사냥꾼'      }, { icon:'💰', name:'상인'     },
    { icon:'👑', name:'귀족'      }, { icon:'🌿', name:'드루이드'    }, { icon:'🎭', name:'배우'     },
    { icon:'🔮', name:'점술사'    }, { icon:'🌑', name:'네크로맨서'  }, { icon:'🐉', name:'용기사'   },

           
        ]
      },
    ]
  },



   
   
   
/* ════════════════════════════════════════════════     🔻 왜곡 🔻     ════════════════════════════════════════════════ */  

  conflict: [
    { icon:'⚔',  name:'인간 vs 인간'     }, { icon:'🌊', name:'인간 vs 자연'   },
    { icon:'🤖', name:'인간 vs 기계'     }, { icon:'🌑', name:'인간 vs 어둠'   },
    { icon:'💫', name:'자아 vs 자아'     }, { icon:'👑', name:'개인 vs 사회'   },
    { icon:'🔮', name:'운명 vs 자유의지' }, { icon:'⚖',  name:'선 vs 악'      },
    { icon:'❤',  name:'사랑 vs 의무'    }, { icon:'🌿', name:'생존 vs 신념'   },
    { icon:'💀', name:'삶 vs 죽음'      }, { icon:'🎭', name:'진실 vs 거짓'   },
    { icon:'🔥', name:'욕망 vs 이성'    }, { icon:'🌙', name:'과거 vs 현재'   },
    { icon:'🌌', name:'인간 vs 신'      }, { icon:'🐺', name:'본능 vs 문명'   },
    { icon:'🌊', name:'혁명 vs 질서'    }, { icon:'💎', name:'희생 vs 이익'   },
    { icon:'👥', name:'집단 vs 개인'    }, { icon:'⚡', name:'전통 vs 변화'    },
  ],

  distort: [
    { icon:'🎭', name:'거짓 믿음'    }, { icon:'🌑', name:'자기부정'     },
    { icon:'💀', name:'트라우마'     }, { icon:'🔗', name:'집착'         },
    { icon:'🌀', name:'망상'         }, { icon:'⚖',  name:'합리화'      },
    { icon:'👁',  name:'편견'        }, { icon:'🐍', name:'배신의 상처'  },
    { icon:'🔥', name:'분노'         }, { icon:'❄',  name:'감정 마비'   },
    { icon:'🌊', name:'공허'         }, { icon:'🧠', name:'인지왜곡'     },
    { icon:'💫', name:'이상화'       }, { icon:'🌙', name:'집단 사고'    },
    { icon:'⚔',  name:'복수심'      }, { icon:'🌿', name:'죄책감'       },
    { icon:'👑', name:'자만'         }, { icon:'🐾', name:'공포'         },
    { icon:'🎵', name:'유혹'         }, { icon:'🔮', name:'예언의 굴레'  },
  ],

  event: [
    { icon:'🌋', name:'대재앙'       }, { icon:'💥', name:'충돌'         },
    { icon:'👑', name:'왕의 죽음'    }, { icon:'🔮', name:'예언 성취'    },
    { icon:'❤',  name:'첫 만남'     }, { icon:'💀', name:'배신'         },
    { icon:'🌊', name:'전쟁'         }, { icon:'🌱', name:'탄생'         },
    { icon:'🌅', name:'각성'         }, { icon:'🔗', name:'계약'         },
    { icon:'🎭', name:'정체 폭로'    }, { icon:'⚔',  name:'결투'        },
    { icon:'🌙', name:'밤의 습격'    }, { icon:'💎', name:'보물 발견'    },
    { icon:'🌿', name:'치유'         }, { icon:'🌌', name:'차원 이동'    },
    { icon:'🔥', name:'혁명'         }, { icon:'⚖',  name:'재판'        },
    { icon:'🌑', name:'봉인 해제'    }, { icon:'✨', name:'기적'          },
  ],

  choice: [
    { icon:'⚖',  name:'희생 vs 생존'     }, { icon:'❤',  name:'사랑 vs 의무'     },
    { icon:'👑', name:'권력 vs 양심'      }, { icon:'💀', name:'복수 vs 용서'      },
    { icon:'🌊', name:'도피 vs 직면'      }, { icon:'🔗', name:'자유 vs 안전'      },
    { icon:'🌿', name:'진실 vs 평화'      }, { icon:'🎭', name:'위선 vs 솔직'      },
    { icon:'⚔',  name:'싸움 vs 화해'     }, { icon:'🌙', name:'과거 vs 미래'      },
    { icon:'💫', name:'개인 vs 공동체'    }, { icon:'🔥', name:'욕망 vs 신념'      },
    { icon:'🌑', name:'어둠 vs 빛'        }, { icon:'🐺', name:'본능 vs 이성'      },
    { icon:'🌌', name:'초월 vs 인간'      }, { icon:'💎', name:'명예 vs 생명'      },
    { icon:'🌱', name:'성장 vs 안주'      }, { icon:'👥', name:'혼자 vs 함께'      },
    { icon:'🔮', name:'운명 수용 vs 저항' }, { icon:'⚡', name:'행동 vs 침묵'       },
  ],

  twist: [
    { icon:'🎭', name:'적이 아군'     }, { icon:'💀', name:'아군이 적'     },
    { icon:'🔮', name:'예언의 반전'   }, { icon:'👁',  name:'정체 폭로'   },
    { icon:'🌑', name:'선인의 타락'   }, { icon:'⚔',  name:'악인의 구원' },
    { icon:'🌊', name:'죽은 자의 귀환'}, { icon:'🌀', name:'시간의 역전'  },
    { icon:'💫', name:'기억의 조작'   }, { icon:'🔗', name:'진짜 목적'    },
    { icon:'🌙', name:'꿈과 현실'     }, { icon:'💥', name:'동기의 반전'  },
    { icon:'🌿', name:'희생의 이유'   }, { icon:'🌌', name:'세계의 진실'  },
    { icon:'⚖',  name:'판단의 오류'  }, { icon:'❤',  name:'사랑의 배신' },
    { icon:'👑', name:'왕의 비밀'     }, { icon:'🐍', name:'내부의 적'    },
    { icon:'🔥', name:'신의 거짓'     }, { icon:'✨', name:'기적의 대가'   },
  ],

  ending: [
    { icon:'🌅', name:'완전한 승리'     }, { icon:'⚖',  name:'쓸쓸한 승리' },
    { icon:'💀', name:'비극적 결말'     }, { icon:'🌱', name:'열린 결말'    },
    { icon:'🔗', name:'순환의 결말'     }, { icon:'🌊', name:'희생의 결말'  },
    { icon:'❤',  name:'화해'           }, { icon:'🌑', name:'타락의 결말'  },
    { icon:'💫', name:'초월의 결말'     }, { icon:'🌿', name:'재생'         },
    { icon:'👑', name:'왕국의 건설'     }, { icon:'🌌', name:'새로운 세계'  },
    { icon:'🎭', name:'아이러니'        }, { icon:'💎', name:'대가의 결말'  },
    { icon:'⚡', name:'혁명 성공'        }, { icon:'🌙', name:'진실 수용'    },
    { icon:'🔥', name:'자기 파멸'       }, { icon:'✨', name:'구원'          },
    { icon:'⚔',  name:'끝나지 않은 싸움'}, { icon:'🌸', name:'평화'         },
  ],
};
