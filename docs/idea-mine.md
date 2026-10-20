# 아이디어 광산

기존 화면 전환(switchScreen/goHome)을 사용하는 독립 작업대입니다. 기존 창작 데이터와 저장 키는 변경하지 않습니다.

## 파일

- `index.html`: 홈 버튼과 광산 화면 마크업, 모듈 로딩
- `css/idea-mine.css`: 광산 화면 내부에만 적용되는 스타일
- `js/idea-mine.js`: 여섯 조합 방식의 슬롯 정의/문장 규칙, 작업대, 보관함, 확장 질문
- `data/idea-mine-materials.js`: 실험판에서 옮긴 초기 재료
- `sw.js`: 광산 파일을 오프라인 셸에 포함
- `tests/idea-mine.cjs`: Playwright 핵심 동작/모바일 폭 확인 (`node tests/idea-mine.cjs`)

## 재료 추가

`window.IdeaMineCatalog.materials` 배열에 다음 형식의 객체를 추가합니다. 분류 버튼은 데이터에서 자동 생성됩니다.

```js
{
  id: 'custom-subject-001', // 전체 카탈로그 내 고유하고 안정적인 ID
  name: '유리 고래',
  kind: '생물',           // 재료 자체의 종류
  category: '바다 생물',  // 목록 탐색용 분류
  roles: ['subject'],     // 사용 가능한 슬롯 역할
  modes: ['action', 'quality', 'relation'], // 생략하면 역할이 맞는 모든 방식
  grammar: {}             // 향후 조사/연결형 등 확장 정보 (현재 자동 해석하지 않음)
}
```

방식/슬롯 역할:

|방식 ID|슬롯 역할|
|---|---|
|action|subject, verb, object|
|quality|subject, quality|
|rule|trigger, effect|
|relation|subject, relation, object|
|problem|problem, solution|
|why|outcome, cause|

`action`의 object는 초기 실험판처럼 조사 포함 이름(예: `기억을`)을 사용합니다. `relation`의 object는 조사 없는 명사이며 문장 규칙이 을/를을 붙입니다. `verb`는 종결형, `quality`와 `relation`은 관형형입니다. 직접 입력한 문자열은 그대로 사용합니다.

별도 파일을 추가하려면 기본 재료 스크립트 다음, `js/idea-mine.js` 앞에 로드하고 다음과 같이 추가합니다. 오프라인에서도 사용할 추가 파일은 `sw.js`의 SHELL 목록에도 등록합니다.

```js
window.IdeaMineCatalog.materials.push({
  id: 'extra-subject-001', name: '유리 고래', kind: '생물',
  category: '바다 생물', roles: ['subject'], grammar: {}
});
```

## 보관 및 제한

- `narrative_idea_mine_saves_v1` localStorage 키만 사용합니다.
- 목록 선택과 직접 편집은 자동 잠금, 불러온 조합은 전체 잠금입니다.
- 잠금은 해당 슬롯 재추첨과 일괄 재조합 모두에 적용됩니다. 방식 전환 시 새 작업대를 시작합니다.
- 저장 실패 시 성공 메시지를 표시하지 않고 현재 메모리 보관함에서 텍스트 내보내기를 할 수 있습니다. 새로고침 전 내보내야 합니다.
- 문제·해결 및 원인 역산은 각각 별도 방식 정의의 단순 문장 조합이며 실험 기능입니다. AI 추론·장문 생성·서버·동기화·독창성 평가는 없습니다.
- TXT 내보내기는 읽기/백업용이며 가져오기 기능은 없습니다.
- 실제 iPhone Safari/홈 화면 PWA와 배포 후 서비스 워커 갱신은 별도 실기기 확인이 필요합니다.
