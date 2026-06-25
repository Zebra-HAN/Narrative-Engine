/* ════════════════════════════════════════════════
   COMPASS DATA
   - COMPASS_NAV  : 나침반 탭 네비게이션 정의
   - COMPASS_CARDS: 나침반 탭 카드 데이터

   
섹션 헤더
{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  

카드 코드
{ icon:'🔮', name:'이름' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'  },

════════════════════════════════════════════════ */


const COMPASS_NAV = {
  label: '나침반',
  resetLabel: '나침반 초기화',
  subs: [
    { id: 'type',     label: '유형',  img:'images/core/sub-nav/comp/type.jpg'  },
    { id: 'genre',    label: '장르',  img:'images/core/sub-nav/comp/genre.jpg'  },
    { id: 'message',  label: '메시지', img:'images/core/sub-nav/comp/message.jpg'  },
    { id: 'theme',    label: '테마',  img:'images/core/sub-nav/comp/theme.jpg'  },
    { id: 'quote',    label: '명언',  img:'images/core/sub-nav/comp/quote.jpg'  },
    { id: 'reader',   label: '체험',  img:'images/core/sub-nav/comp/reader.jpg'  },
    { id: 'mood',     label: '분위기', img:'images/core/sub-nav/comp/mood.jpg'  },
  ]
};



 /* ════════════════════════════════════════════════      나침반 -     ════════════════════════════════════════════════ */  


const COMPASS_CARDS = {

   
  type: [
     
{ type: 'section' ,  label: ' 헤더 　　　— 추가 내용 ' },  
    { icon:'🌟', name:'영웅 서사'    }, { icon:'💀', name:'비극'         },

     
{ type: 'section' ,  label: ' 드래곤 ' },  
{ type: 'section' ,  label: '  　— 추가 내용 ' },  
     
    { icon:'🌱', name:'성장담'       }, { icon:'🌊', name:'모험담'        },
    { icon:'❤',  name:'로맨스'      }, { icon:'🕵', name:'추리'          },
    { icon:'🌌', name:'서사시'       }, { icon:'🎭', name:'풍자'          },
    { icon:'🔮', name:'신화'         }, { icon:'🌿', name:'힐링'          },
    { icon:'💥', name:'액션'         }, { icon:'⚖',  name:'철학적 탐구'  },
    { icon:'🌙', name:'다크 판타지'  }, { icon:'🤖', name:'SF'            },
    { icon:'🔥', name:'혁명 서사'    }, { icon:'💫', name:'초자연'        },
    { icon:'👥', name:'앙상블'       }, { icon:'🏆', name:'스포츠'        },
    { icon:'🌑', name:'호러'         }, { icon:'🌸', name:'일상'          },
    { icon: '🎬', name: '상업 영화' }, { icon: '📺', name: 'TV 시리즈' },
    { icon: '📖', name: '장편 소설' }, { icon: '🎨', name: '웹툰/만화' },
    { icon: '🎮', name: '인디 게임' }, { icon: '🎭', name: '무대 연극' },
    { icon: '🎧', name: '오디오 드라마' }, { icon: '📱', name: '숏폼 콘텐츠' },
  ],

  genre: [
    { icon:'⚔',  name:'판타지'      }, { icon:'🚀', name:'SF'            },
    { icon:'❤',  name:'로맨스'      }, { icon:'🕵', name:'미스터리'       },
    { icon:'💀', name:'호러'         }, { icon:'🌌', name:'서사시'         },
    { icon:'🎭', name:'드라마'       }, { icon:'💥', name:'액션'           },
    { icon:'🌿', name:'힐링'         }, { icon:'🌸', name:'일상'           },
    { icon:'🔥', name:'무협'         }, { icon:'👑', name:'궁중'           },
    { icon:'🌑', name:'다크 판타지'  }, { icon:'⚗',  name:'스팀펑크'     },
    { icon:'🌊', name:'해양'         }, { icon:'🏔', name:'고산'           },
    { icon:'🤖', name:'사이버펑크'   }, { icon:'🌙', name:'고딕'           },
    { icon:'🔮', name:'신화'         }, { icon:'💫', name:'초자연'         },
    { icon: '⚔️', name: '정통 판타지' }, { icon: '🚀', name: '스페이스 오페라' },
    { icon: '🕵️', name: '추리/미스터리' }, { icon: '👻', name: '오컬트/호러' },
    { icon: '❤️', name: '로맨틱 코미디' }, { icon: '🥊', name: '열혈 액션' },
    { icon: '🕰️', name: '대체 역사' }, { icon: '치', name: '일상/힐링' },
  ],

  message: [
    { icon:'🌱', name:'성장'         }, { icon:'❤',  name:'사랑의 힘'    },
    { icon:'⚖',  name:'정의'        }, { icon:'🔥', name:'용기'           },
    { icon:'🌊', name:'자유'         }, { icon:'💀', name:'희생의 의미'   },
    { icon:'🌿', name:'공존'         }, { icon:'💫', name:'초월'           },
    { icon:'🌙', name:'어둠 속의 빛' }, { icon:'🔗', name:'연결'           },
    { icon:'👑', name:'권력의 부패'  }, { icon:'🌌', name:'존재의 의미'   },
    { icon:'🎭', name:'진실의 가치'  }, { icon:'🐺', name:'본성의 수용'   },
    { icon:'⚔',  name:'전쟁의 무의미'}, { icon:'✨', name:'기적'          },
    { icon:'🌑', name:'어둠의 필요성'}, { icon:'🌸', name:'일상의 소중함' },
    { icon:'🔮', name:'운명과 의지'  }, { icon:'👥', name:'공동체'         },
  ],

  theme: [
    { icon:'🔥', name:'복수'         }, { icon:'❤',  name:'사랑'         },
    { icon:'🌱', name:'성장'         }, { icon:'💀', name:'죽음'          },
    { icon:'⚖',  name:'정의'        }, { icon:'🌊', name:'자유'           },
    { icon:'👑', name:'권력'         }, { icon:'🌿', name:'자연'           },
    { icon:'🔮', name:'운명'         }, { icon:'🌑', name:'어둠'           },
    { icon:'✨', name:'구원'          }, { icon:'🎭', name:'정체성'        },
    { icon:'🌌', name:'우주'         }, { icon:'🐾', name:'야성'           },
    { icon:'💫', name:'초월'         }, { icon:'🌙', name:'신비'           },
    { icon:'🔗', name:'유대'         }, { icon:'⚔',  name:'전쟁'         },
    { icon:'🌸', name:'치유'         }, { icon:'💎', name:'희생'           },
  ],


   
  quote: [
    { icon: '🔥', name: '열정적인 선언' }, { icon: '❄️', name: '냉혹한 진실' },
    { icon: '🦉', name: '철학적 조언' }, { icon: '🃏', name: '위트 있는 풍자' },
    { icon: '🖤', name: '비장한 유언' }, { icon: '☀️', name: '따뜻한 위로' },
    { icon: '🔮', name: '수수께끼의 예언' }, { icon: '📣', name: '혁명의 구호' },
  ],

   
  reader: [
    { icon:'🔥', name:'흥분'         }, { icon:'❄',  name:'소름'         },
    { icon:'❤',  name:'설렘'        }, { icon:'💀', name:'공포'           },
    { icon:'😢', name:'슬픔'         }, { icon:'😂', name:'웃음'          },
    { icon:'🌊', name:'해방감'       }, { icon:'💫', name:'경이로움'      },
    { icon:'⚖',  name:'공감'        }, { icon:'🌑', name:'불안'           },
    { icon:'✨', name:'희망'          }, { icon:'🌹', name:'두근거림'      },
    { icon:'🎭', name:'충격'         }, { icon:'🌿', name:'위로'           },
    { icon:'👁',  name:'통찰'        }, { icon:'🌌', name:'몰입'           },
    { icon:'🔮', name:'신비감'       }, { icon:'💥', name:'카타르시스'    },
    { icon:'🌸', name:'따뜻함'       }, { icon:'⚔',  name:'긴장감'       },
  ],

  mood: [
    { icon:'🔥', name:'열정적'       }, { icon:'❄',  name:'냉담한'       },
    { icon:'🌊', name:'서정적'       }, { icon:'💀', name:'어두운'        },
    { icon:'✨', name:'밝은'          }, { icon:'🌿', name:'잔잔한'        },
    { icon:'💥', name:'격렬한'       }, { icon:'🌙', name:'몽환적'        },
    { icon:'⚖',  name:'중립적'      }, { icon:'😂', name:'유머러스'       },
    { icon:'😢', name:'비장한'       }, { icon:'🎭', name:'아이러니'       },
    { icon:'🌌', name:'웅장한'       }, { icon:'🌸', name:'따뜻한'        },
    { icon:'⚡', name:'긴박한'        }, { icon:'🔮', name:'신비로운'      },
    { icon:'💫', name:'초월적'       }, { icon:'🌑', name:'음울한'         },
    { icon:'🌹', name:'로맨틱'       }, { icon:'🐾', name:'야성적'         },
    { icon: '🌆', name: '사이버펑크' }, { icon: '🌫️', name: '피카레스크/다크' },
    { icon: '☀️', name: '청량하고 밝은' }, { icon: '🌌', name: '몽환적이고 신비한' },
    { icon: '🏜️', name: '포스트 아포칼립스' }, { icon: '🏰', name: '고풍스럽고 클래식' },
    { icon: '🍁', name: '쓸쓸하고 서정적' }, { icon: '⚡', name: '긴장감 넘치는' },
  ],
};













