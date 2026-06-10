/* ════════════════════════════════════════════════
   NARRATIVE DATA
   - NARRATIVE_NAV  : 스토리 탭 네비게이션 정의
   - NARRATIVE_CARDS: 스토리 탭 카드 데이터
════════════════════════════════════════════════ */

const NARRATIVE_NAV = {
  label: '스토리',
  resetLabel: '스토리 초기화',
  subs: [
    { id:'goal',    label:'목표', icon:'🎯' },
    { id:'desire',  label:'욕망', icon:'🔥' },
    { id:'conflict',label:'갈등', icon:'⚔'  },
    { id:'distort', label:'왜곡', icon:'🌀' },
    { id:'event',   label:'사건', icon:'💥' },
    { id:'choice',  label:'선택', icon:'⚖'  },
    { id:'twist',   label:'반전', icon:'🌊' },
    { id:'ending',  label:'결말', icon:'🌅' },
  ]
};

const NARRATIVE_CARDS = {
  goal: [
    { icon:'🏆', name:'최강'       }, { icon:'👑', name:'왕위'       }, { icon:'💎', name:'보물'   },
    { icon:'🔮', name:'진실'       }, { icon:'🌅', name:'평화'       }, { icon:'💀', name:'복수'   },
    { icon:'❤',  name:'사랑'       }, { icon:'🌿', name:'생존'       }, { icon:'🌌', name:'신'     },
    { icon:'⚔',  name:'전쟁 종식' }, { icon:'🔗', name:'자유'       }, { icon:'🌊', name:'귀환'   },
    { icon:'🧬', name:'불사'       }, { icon:'🔥', name:'혁명'       }, { icon:'💫', name:'구원'   },
    { icon:'🌙', name:'기억'       }, { icon:'👥', name:'가족'       }, { icon:'⚖',  name:'정의'  },
    { icon:'🎭', name:'인정'       }, { icon:'🌱', name:'성장'       },
  ],

  desire: [
    { icon:'🔥', name:'힘'         }, { icon:'❤',  name:'사랑'      }, { icon:'💎', name:'소유'   },
    { icon:'👁',  name:'인정'      }, { icon:'🌊', name:'자유'       }, { icon:'💀', name:'복수'   },
    { icon:'🌿', name:'안식'       }, { icon:'🌟', name:'영광'       }, { icon:'🔮', name:'지식'   },
    { icon:'💫', name:'신성'       }, { icon:'🌑', name:'망각'       }, { icon:'⚔',  name:'전투'  },
    { icon:'🌹', name:'아름다움'   }, { icon:'🎭', name:'변신'       }, { icon:'🌙', name:'비밀'   },
    { icon:'⚖',  name:'균형'      }, { icon:'👑', name:'지배'       }, { icon:'🐾', name:'야성'   },
    { icon:'🌌', name:'초월'       }, { icon:'🔗', name:'연결'       },
  ],

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
