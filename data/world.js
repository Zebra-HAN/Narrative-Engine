/* ════════════════════════════════════════════════
   WORLD DATA
   - WORLD_NAV  : 세계관 탭 네비게이션 정의
   - WORLD_CARDS: 세계관 탭 카드 데이터
════════════════════════════════════════════════ */

const WORLD_NAV = {
  label: '세계관',
  resetLabel: '세계관 초기화',
  subs: [
    { id:'tech',    label:'기술', icon:'⚙'  },
    { id:'culture', label:'문화', icon:'🏛' },
    { id:'setting', label:'배경', icon:'🗺' },
  ]
};

const WORLD_CARDS = {
  tech: [
    { icon:'⚙',  name:'증기 기술'    }, { icon:'💡', name:'전기 문명'   },
    { icon:'🤖', name:'인공지능'      }, { icon:'🚀', name:'우주 항법'   },
    { icon:'🧬', name:'생체공학'      }, { icon:'🔮', name:'마법 기계'   },
    { icon:'⚗',  name:'연금술'       }, { icon:'📡', name:'통신망'      },
    { icon:'🌌', name:'차원 기술'     }, { icon:'⚡', name:'에너지 결정' },
    { icon:'🏗',  name:'거대 건축'    }, { icon:'🛡', name:'방어 시스템' },
    { icon:'🌊', name:'해양 기술'     }, { icon:'🌿', name:'바이오 기술' },
    { icon:'💻', name:'사이버네틱스'  }, { icon:'🔭', name:'천문학'      },
    { icon:'⚖',  name:'자동화'       }, { icon:'🔬', name:'나노 기술'   },
    { icon:'🌑', name:'어둠의 기술'   }, { icon:'✨', name:'신성 공학'   },
  ],

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
  ],

  setting: [
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
};
