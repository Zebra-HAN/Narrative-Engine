/* ════════════════════════════════════════════════
   나침반 데이터
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
    { id: 'type',     label: '유형',  img:'images/core/sub-nav/comp/type.webp', type:'group' },
    { id: 'genre',    label: '장르',  img:'images/core/sub-nav/comp/genre.webp', type:'group' },
    { id: 'experience', label: '경험', img:'images/core/sub-nav/comp/experience.webp', type:'group' },
    { id: 'scenery',  label: '광경',  img:'images/core/sub-nav/comp/scenery.webp', type:'group' },
    { id: 'appearance', label: '모습', img:'images/core/sub-nav/comp/appearance.webp', type:'group' },
    { id: 'message',  label: '메시지', img:'images/core/sub-nav/comp/message.webp', type:'group' },
    { id: 'theme',    label: '테마',  img:'images/core/sub-nav/comp/theme.webp', type:'group' },
    { id: 'quote',    label: '명언',  img:'images/core/sub-nav/comp/quote.webp', type:'group' },
    { id: 'reader',   label: '체험',  img:'images/core/sub-nav/comp/reader.webp', type:'group' },
    { id: 'mood',     label: '분위기', img:'images/core/sub-nav/comp/mood.webp', type:'group' },
  ]
};



 /* ════════════════════════════════════════════════      나침반 -     ════════════════════════════════════════════════ */  


const COMPASS_CARDS = {

   
  type: {
  groups: [
    { id:'type_existing', label:'기존 유형', icon:'📚', cards:[
     
{ type: 'section' ,  label: ' 드래곤 종족　　— 추가 내용 샬라샬라 ㅇㅋ1234 ' },  
    { icon:'🌟', name:'영웅 서사'    }, { icon:'💀', name:'비극'         },

     
{ type: 'section' ,  label: ' 👤드래곤 ' },  
{ type: 'section' ,  label: '　드래곤　— 추가 내용 ' },  
     
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
  ] },
    { id:'type_new', label:'실험적 유형', icon:'🧩', cards:[
      { icon:'🧵', name:'교차 시점 서사' },
      { icon:'🔁', name:'순환 구조 서사' },
      { icon:'📨', name:'서간체 이야기' },
      { icon:'⏱️', name:'실시간 진행극' },
      { icon:'🗺️', name:'탐험형 옴니버스' }
    ]}
  ]
},

  genre: {
  groups: [
    { id:'genre_existing', label:'기존 장르', icon:'📚', cards:[
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
  ] },
    { id:'genre_new', label:'혼합 장르', icon:'🎬', cards:[
      { icon:'🧙', name:'판타지 미스터리' },
      { icon:'🚀', name:'SF 로맨스' },
      { icon:'👻', name:'호러 코미디' },
      { icon:'🏛️', name:'역사 스릴러' },
      { icon:'🌿', name:'힐링 어드벤처' }
    ]}
  ]
},

  experience: {
  groups: [
    { id:'experience_daily', label:'일상의 경험', icon:'☕', cards:[
      { icon:'🤝', name:'새로운 만남', desc:'낯선 사람과 대화를 나누는 경험.', detail:'【상세】우연한 만남에서 새로운 인연이 시작된다.' },
      { icon:'🍳', name:'첫 요리', desc:'처음으로 직접 음식을 만드는 경험.', detail:'【상세】서툰 도전 속에서 작은 성취를 느낀다.' }
    ]},
    { id:'experience_adventure', label:'모험의 경험', icon:'🧭', cards:[
      { icon:'🥾', name:'낯선 길 탐험', desc:'처음 가는 길을 따라 걷는 경험.', detail:'【상세】익숙한 곳을 떠나 새로운 가능성을 발견한다.' },
      { icon:'🏕️', name:'숲속 야영', desc:'숲에서 하룻밤을 보내는 경험.', detail:'【상세】자연의 소리를 들으며 두려움과 설렘을 함께 느낀다.' }
    ]}
  ]
},

  scenery: {
  groups: [
    { id:'scenery_nature', label:'자연의 광경', icon:'🌿', cards:[
      { icon:'🌅', name:'바다의 일출', desc:'수평선 위로 해가 떠오르는 광경.', detail:'【상세】붉은 햇빛이 잔잔한 바다를 물들인다.' },
      { icon:'🌌', name:'별이 가득한 밤', desc:'밤하늘을 수많은 별이 채운 광경.', detail:'【상세】어두운 들판 위로 은하수가 길게 펼쳐진다.' }
    ]},
    { id:'scenery_city', label:'도시의 광경', icon:'🏙️', cards:[
      { icon:'🌃', name:'빛나는 야경', desc:'도시의 불빛이 켜진 밤의 광경.', detail:'【상세】건물과 거리의 불빛이 서로 다른 색으로 반짝인다.' },
      { icon:'🚉', name:'분주한 역', desc:'사람들이 오가는 기차역의 광경.', detail:'【상세】떠나는 사람과 도착한 사람이 플랫폼에서 스쳐 간다.' }
    ]}
  ]
},

  appearance: {
  groups: [
    { id:'appearance_expression', label:'표정과 모습', icon:'🙂', cards:[
      { icon:'😊', name:'밝은 미소', desc:'기쁨이 드러나는 환한 모습.', detail:'【상세】반가운 소식에 눈과 입가가 함께 웃는다.' },
      { icon:'🤔', name:'깊은 생각', desc:'고민에 잠긴 진지한 모습.', detail:'【상세】말없이 시선을 낮추며 다음 선택을 생각한다.' }
    ]},
    { id:'appearance_attire', label:'차림과 모습', icon:'👕', cards:[
      { icon:'🧥', name:'여행자의 차림', desc:'긴 여정을 준비한 실용적인 모습.', detail:'【상세】튼튼한 외투와 작은 배낭에 여행의 흔적이 남아 있다.' },
      { icon:'🎩', name:'축제의 차림', desc:'축제를 위해 꾸민 화려한 모습.', detail:'【상세】색색의 장식과 모자가 즐거운 분위기를 더한다.' }
    ]}
  ]
},

  message: {
  groups: [
    { id:'message_existing', label:'기존 메시지', icon:'📚', cards:[
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
  ] },
    { id:'message_new', label:'질문을 남기는 메시지', icon:'💬', cards:[
      { icon:'🧭', name:'옳은 길은 누가 정하는가' },
      { icon:'⚖️', name:'정의는 누구에게 공평한가' },
      { icon:'🌱', name:'변화는 상실을 요구하는가' },
      { icon:'🤝', name:'용서에도 조건이 필요한가' },
      { icon:'🕰️', name:'과거를 잊어야 나아가는가' }
    ]}
  ]
},

  theme: {
  groups: [
    { id:'theme_existing', label:'기존 테마', icon:'📚', cards:[
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
  ] },
    { id:'theme_new', label:'관계 테마', icon:'🎨', cards:[
      { icon:'🪢', name:'신뢰와 의심' },
      { icon:'🏠', name:'소속과 고립' },
      { icon:'🪞', name:'이해와 오해' },
      { icon:'🌉', name:'세대 간의 화해' },
      { icon:'🕊️', name:'용서와 책임' }
    ]}
  ]
},


   
  quote: {
  groups: [
    { id:'quote_existing', label:'기존 명언', icon:'📚', cards:[
    { icon: '🔥', name: '열정적인 선언' }, { icon: '❄️', name: '냉혹한 진실' },
    { icon: '🦉', name: '철학적 조언' }, { icon: '🃏', name: '위트 있는 풍자' },
    { icon: '🖤', name: '비장한 유언' }, { icon: '☀️', name: '따뜻한 위로' },
    { icon: '🔮', name: '수수께끼의 예언' }, { icon: '📣', name: '혁명의 구호' },
  ] },
    { id:'quote_new', label:'새로운 문장', icon:'💡', cards:[
      { icon:'🌅', name:'끝은 다른 시작의 이름이다' },
      { icon:'🧭', name:'길을 잃어야 내 방향을 안다' },
      { icon:'🔥', name:'용기는 두려움과 함께 걷는다' },
      { icon:'🌱', name:'작은 선택이 운명을 키운다' },
      { icon:'🤝', name:'믿음은 함께 견딘 시간이다' }
    ]}
  ]
},

   
  reader: {
  groups: [
    { id:'reader_existing', label:'기존 체험', icon:'📚', cards:[
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
  ] },
    { id:'reader_new', label:'사유하는 체험', icon:'👁️', cards:[
      { icon:'🧩', name:'단서를 맞추는 즐거움' },
      { icon:'🪞', name:'자신을 돌아보는 순간' },
      { icon:'⚖️', name:'판단을 망설이는 긴장' },
      { icon:'🌌', name:'낯선 세계를 발견하는 감각' },
      { icon:'🕯️', name:'긴 여운을 곱씹는 체험' }
    ]}
  ]
},

  mood: {
  groups: [
    { id:'mood_existing', label:'기존 분위기', icon:'📚', cards:[
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
  ] },
    { id:'mood_new', label:'복합 분위기', icon:'🌈', cards:[
      { icon:'🌦️', name:'쓸쓸하지만 희망찬' },
      { icon:'🕯️', name:'고요하고 불길한' },
      { icon:'🎪', name:'화려하지만 공허한' },
      { icon:'🌊', name:'평온하지만 긴장된' },
      { icon:'🌙', name:'신비롭고 따뜻한' }
    ]}
  ]
},
};
