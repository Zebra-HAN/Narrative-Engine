# 상단 정보 패널 설명 편집

설명 문구는 각 data 파일에서만 수정합니다. 앱 동작 코드나 HTML은 수정할 필요가 없습니다.

| 화면 | 파일 | NAV 객체 | 카드/그룹 객체 |
| --- | --- | --- | --- |
| 캐릭터 | `character.js` | `CHARACTER_NAV` | `CHARACTER_CARDS` |
| 스토리 | `narrative.js` | `NARRATIVE_NAV` | `NARRATIVE_CARDS` |
| 세계관 | `world.js` | `WORLD_NAV` | `WORLD_CARDS` |
| 나침반 | `compass.js` | `COMPASS_NAV` | `COMPASS_CARDS` |

모든 NAV, 카테고리, 그룹, 서브그룹 객체에 다음 두 필드를 마련했습니다.

- `description`: 상단 패널 오른쪽의 짧은 설명. 패널 크기는 유지되므로 간결하게 작성하세요.
- `detail`: 패널을 눌렀을 때 표시할 긴 설명. `\n`으로 줄바꿈하고 `\n\n`으로 문단을 나눌 수 있습니다. 일반 텍스트로 표시하며 HTML은 실행하지 않습니다.

현재 가장 깊은 위치의 설명을 사용합니다. 해당 필드를 지우거나 빈 문자열로 두면 서브그룹 → 그룹 → 카테고리 → NAV 순으로 가장 가까운 상위 설명을 사용합니다. 짧은 설명과 긴 설명은 각각 독립적으로 찾습니다. 모든 단계에 해당 필드가 없으면 빈 내용으로 표시합니다.

## NAV와 카테고리: data/compass.js

아래는 실제 객체 이름과 ID를 사용하는 발췌 예시입니다. 기존 객체의 필드 값을 수정하세요. 객체 전체를 교체하거나 다른 카테고리를 삭제하지 마세요.

```js
const COMPASS_NAV = {
  label: '나침반',
  description: '나침반의 짧은 설명',
  detail: '나침반 활용 가이드\n\n자세한 설명을 입력하세요.',
  // resetLabel 등 기존 필드 유지
  subs: [
    {
      id: 'genre',
      label: '장르',
      img: 'images/core/sub-nav/comp/genre.webp',
      type: 'group',
      description: '장르 카테고리의 짧은 설명',
      detail: '장르 카테고리의 긴 설명\n활용 예시를 입력하세요.'
    }
    // 다른 카테고리 유지
  ]
};
```

## 그룹: data/compass.js

`COMPASS_CARDS.genre.groups` 안의 해당 그룹 객체에서 수정합니다. 현재 장르의 실제 그룹은 `genre_existing`(기존 장르), `genre_new`(혼합 장르)입니다. 판타지는 현재 이 그룹 안의 카드이므로 카드의 `detail`과 그룹 설명을 구별하세요.

```js
const COMPASS_CARDS = {
  genre: {
    groups: [
      {
        id: 'genre_existing',
        label: '기존 장르',
        description: '기존 장르 그룹의 짧은 설명',
        detail: '기존 장르 그룹의 긴 설명\n\n활용 가이드',
        // icon, img, layoutType, cards 등 기존 필드 유지
      }
      // 다른 그룹 유지
    ]
  }
  // 다른 카테고리 유지
};
```

## 서브그룹: data/character.js

현재 종족 카테고리의 인간형 그룹에 서브그룹이 있습니다. `CHARACTER_CARDS.race.groups`의 `race_human` 객체 안에서 그룹 설명을, 그 객체의 `subgroups`에 있는 `race_human_skin`에서 피부 서브그룹 설명을 수정합니다.

```js
const CHARACTER_CARDS = {
  race: {
    groups: [
      {
        id: 'race_human',
        label: '인간형',
        description: '인간형 그룹의 짧은 설명',
        detail: '인간형 그룹의 긴 설명',
        subgroups: [
          {
            id: 'race_human_skin',
            label: '피부',
            description: '피부 서브그룹의 짧은 설명',
            detail: '피부 서브그룹의 긴 설명\n\n활용 가이드',
            // icon, img, cards 등 기존 필드 유지
          }
          // 다른 서브그룹 유지
        ]
      }
      // 다른 그룹 유지
    ]
  }
  // 다른 카테고리 유지
};
```

이 정보 팝업은 읽기 전용입니다. 카드의 `desc`, `detail`, 선택, 잠금, 세부 항목 체크와는 별개이며 아이디어 통합에 추가되지 않습니다. 상단 패널 왼쪽 이미지는 NAV 단계에서는 NAV 이미지, 카테고리 단계에서는 카테고리 이미지를 표시합니다. 그룹과 서브그룹으로 들어가도 해당 카테고리 이미지를 유지하며, 제목·설명과 상세 팝업은 현재 가장 깊은 위치의 정보를 표시합니다. 팝업은 바깥 클릭, 닫기 버튼, 좌우 스와이프로 닫습니다. 패널은 탭/클릭 외에 Enter와 Space 키로도 열 수 있습니다.
