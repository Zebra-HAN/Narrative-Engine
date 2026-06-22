/* ════════════════════════════════════════════════
   WORLD DATA
   - WORLD_NAV  : 세계관 탭 네비게이션 정의
   - WORLD_CARDS: 세계관 탭 카드 데이터
섹션 헤더
{ type: 'section' ,  label: ' 헤더 — 추가 내용 ' },  

카드 코드
{ icon:'🔮', name:'이름' ,img:'images/Peep.png', subImg:'images/Giant_Elf.jpg',  desc:'내용' ,   detail:'【상세】 정보\n【상세】\n\n내용'  },

════════════════════════════════════════════════ */


const WORLD_NAV = {
  label: '세계관',
  resetLabel: '세계관 초기화',
  subs: [
     
  { id: 'setting',   label: '배경',      img:'images/core/sub-nav/wrld/setting.jpg' },
  { id: 'location',  label: '장소',      img:'images/core/sub-nav/wrld/location.jpg' },
  { id: 'item',      label: '아이템',     img:'images/core/sub-nav/wrld/item.jpg' },
  { id: 'tool',      label: '도구',      img:'images/core/sub-nav/wrld/tool.jpg' },
  { id: 'resource',  label: '자원',      img:'images/core/sub-nav/wrld/resource.jpg' },
  { id: 'tech',      label: '기술',      img:'images/core/sub-nav/wrld/tech.jpg' },
  { id: 'skill',     label: '스킬',      img:'images/core/sub-nav/wrld/skill.jpg' },
  { id: 'culture',   label: '문화',      img:'images/core/sub-nav/wrld/culture.jpg' },
  { id: 'costume',   label: '의상',      img:'images/core/sub-nav/wrld/costume.jpg' },
     
  ]
};



const WORLD_CARDS = {
 /* ════════════════════════════════════════════════      세계관 -     ════════════════════════════════════════════════ */  

   
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
     
    { icon:'⚙',  name:'증기 기술'  img:'images/Giant_Elf.jpg', subImg:'images/Peep.png'  },  { icon:'💡', name:'전기 문명'   },
    { icon:'🤖', name:'인공지능'      }, { icon:'🚀', name:'우주 항법'   },
    { icon:'🧬', name:'생체공학'      }, { icon:'🔮', name:'마법 기계'   },
    { icon:'⚗',  name:'연금술'       }, { icon:'📡', name:'통신망'      },
    { icon:'🌌', name:'차원 기술'     }, { icon:'⚡', name:'에너지 결정' },
    { icon:'🏗',  name:'거대 건축'    }, { icon:'🛡', name:'방어 시스템' },
    { icon:'🌊', name:'해양 기술'     }, { icon:'🌿', name:'바이오 기술' },
    { icon:'💻', name:'사이버네틱스'  }, { icon:'🔭', name:'천문학'      },
    { icon:'⚖',  name:'자동화'       }, { icon:'🔬', name:'나노 기술'   },
    { icon:'🌑', name:'어둠의 기술'   }, { icon:'✨', name:'신성 공학'   },

     
    { icon:'⚙', name:'증기 기술' },
    { icon:'💡', name:'전기 문명' },
    { icon:'🤖', name:'인공지능' },
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







