# DEVFOLIO 개발 학습 노트 (한국어)

> 기준 자료: 2026-11-11에 전달된 `src.zip`의 React/TypeScript/CSS 소스. 이 문서는 **현재 코드에서 확인되는 사실**, **개념 설명**, **개선 아이디어**를 구분해서 정리한다. PacketScope와 PlayPort의 내부 구현은 이 ZIP의 검증 대상이 아니다.

## 0. 학습 목표와 현재 진행 상황

DEVFOLIO는 개인 개발 프로젝트를 소개하는 React 기반 원페이지 포트폴리오다. 지금까지의 핵심 목표는 **컴포넌트 분리 → TypeScript 데이터 모델 → Props 전달 → 반복 렌더링 → CSS Modules → High Contrast 디자인 구성**이다.

현재 구현된 페이지는 `Header`, `Hero`, `Projects`, `Footer` 순서로 렌더링된다. `Projects`는 프로젝트 목록을 받아 여러 `ProjectCard`를 표시한다. Hero는 `CODE. CREATE. EVOLVE.` 문구를 애니메이션으로 보여 주고, Projects는 밝은 페이지에서 어두운 섹션으로 전환된다.

**아직 미완성:** 프로젝트 이미지에는 실제 `<img>`가 없고, Header의 `MENU`는 단순한 텍스트, Footer는 임시 문구다. About 섹션도 현재 소스에 존재하지 않는다.

---

## 1. React 컴포넌트: 화면을 역할별로 분리하기

### 코드에서 확인한 구조

```text
App.tsx
├── Header
├── main
│   ├── Hero
│   └── Projects
│       └── ProjectCard × 프로젝트 개수
└── Footer
```

- `App`: 페이지의 큰 구성과 프로젝트 데이터를 담당한다.
- `Header`: 사이트 제목과 메뉴 라벨을 표시한다.
- `Hero`: 첫 화면의 문구와 등장 애니메이션을 담당한다.
- `Projects`: 목록 렌더링과 빈 배열 처리에 집중한다.
- `ProjectCard`: 프로젝트 한 개의 이미지 자리, 제목, 분류, 설명, 기술 태그, 링크를 담당한다.
- `Footer`: 현재는 임시 문구만 출력한다.

### 왜 분리할까?

컴포넌트는 **하나의 책임을 분리**하기 위한 수단이다. 모든 JSX를 `App.tsx`에 몰아 넣으면 프로젝트가 늘어날 때 화면 구조와 데이터 처리 코드가 뒤섞인다. 반대로 `ProjectCard`를 독립시키면 프로젝트가 2개에서 20개로 늘어나도 동일한 렌더링 규칙을 재사용할 수 있다.

**실습 질문:** 새로운 프로젝트가 추가되면 어떤 파일만 수정해도 되는가? 현재 설계에서는 우선 `App.tsx`의 `projects` 데이터에 항목을 추가하면 된다.

---

## 2. TypeScript: 타입은 데이터가 아니라 계약이다

`src/types/project.ts`:

```ts
export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
}
```

`interface`는 객체에 필요한 속성과 타입을 정한다. `export`는 이 **타입 정의를 다른 파일에서 참조할 수 있게 공개**한다. 실제 프로젝트 객체가 다른 파일로 전송되는 것은 아니다.

`App.tsx`에서는 다음처럼 타입을 가져온다.

```tsx
import type { Project } from "./types/project";

const projects: Project[] = [
  // Project 규칙을 만족하는 객체들
];
```

- `Project` = 객체 **한 개**의 타입.
- `Project[]` = 해당 객체들의 **배열** 타입.
- `import type` = TypeScript의 타입 정보만 가져옴. 일반적인 빌드 결과의 JavaScript 런타임에는 인터페이스가 남지 않는다.
- `githubUrl?: string` = GitHub 주소가 **없어도 되는 선택적 속성**. 읽을 때 `undefined`일 수 있다.

### 실제로 겪은 오류: `Project[]`에 `title`이 없다

잘못된 예:

```tsx
interface ProjectCardProps {
  projects: Project[];
}

function ProjectCard({ projects }: ProjectCardProps) {
  return <h3>{projects.title}</h3>;
}
```

`projects`는 배열인데 `.title`은 개별 프로젝트 객체의 속성이다. 따라서 TS2339 오류가 발생한다. **배열에서 항목 하나를 전달받는 컴포넌트라면 `Project` 타입을 사용**해야 한다.

```tsx
interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return <h3>{project.title}</h3>;
}
```

**암기보다 이해:** 단수형 이름 자체가 문법 규칙은 아니다. 중요한 것은 실제 값이 배열인지 객체인지, 그리고 타입 선언이 그 사실과 일치하는지다.

---

## 3. Props: 부모가 자식에게 데이터를 전달하는 방법

현재 데이터 흐름:

```text
App의 projects: Project[]
          │
          ▼
<Projects projects={projects} />
          │  map으로 Project 하나씩 꺼냄
          ▼
<ProjectCard key={project.id} project={project} />
          │
          ▼
project.title / project.description / ...
```

왼쪽 `project`는 자식이 받는 **Props 이름**, 오른쪽 `{project}`는 부모의 **실제 JavaScript 값**이다.

### 실제로 겪은 오류: `title` 속성이 없다 (TS2322)

`ProjectCard`를 `project: Project` 하나를 받는 구조로 바꾼 뒤에도 부모에서 `title={project.title}`처럼 이전 방식으로 전달하면 Props 규약이 맞지 않는다.

잘못된 호출:

```tsx
<ProjectCard title={project.title} />
```

현재 구조에 맞는 호출:

```tsx
<ProjectCard key={project.id} project={project} />
```

**참고:** `key`는 React가 목록 요소를 식별하는 특수한 값이며 `ProjectCard`의 일반 Props로 자동 전달되지 않는다.

---

## 4. 배열 렌더링과 조건부 렌더링

현재 `Projects.tsx`의 핵심:

```tsx
{projects.length === 0 ? (
  <p>등록된 프로젝트가 없습니다.</p>
) : (
  projects.map((project) => (
    <ProjectCard key={project.id} project={project} />
  ))
)}
```

### 왜 조건문을 `map` 바깥에 둘까?

빈 배열에서 `map()`의 콜백은 **0번 실행**된다. 아래 코드는 실행되지 않는 분기를 포함한다.

```tsx
projects.map((project) =>
  projects.length === 0 ? <p>비어 있음</p> : <ProjectCard project={project} />
)
```

배열이 비었는지를 판단하려면 `map()` 바깥에서 검사해야 한다.

### `key`는 왜 `id`가 좋을까?

`key={project.id}`는 항목이 이름을 바꾸거나 순서가 바뀌어도 동일한 항목을 추적하기 쉽게 한다. 이름(`title`)은 변경되거나 중복될 수 있고 배열 인덱스는 재정렬 시 의미가 변할 수 있다. `id`가 목록 내에서 고유하고 안정적이라는 전제가 중요하다.

### 기술 스택 태그

```tsx
<div className={styles.projectTechstack}>
  {project.techStack.map((tech) => (
    <span key={tech} className={styles.techTag}>{tech}</span>
  ))}
</div>
```

기술명이 **같은 카드 안에서 중복되지 않는다면** `key={tech}`가 가능하다. `join(", ")`는 배열을 한 줄 문자열로 만들지만, 태그별 스타일을 주려면 `map()`이 더 적합하다. 두 방식으로 동시에 출력하면 중복이 발생한다.

---

## 5. CSS Modules: 클래스 이름의 범위

예시:

```tsx
import styles from "../css/ProjectCard.module.css";

<div className={styles.projectCard}>...</div>
```

```css
.projectCard {
  background-color: #24292d;
}
```

`.module.css`의 클래스는 컴포넌트별로 충돌을 피하도록 처리된다. `styles.projectCard`는 CSS의 **`.projectCard` 클래스**에 대응한다.

과거에 혼동했던 다음 두 선택자는 다르다.

```css
header { /* HTML header 태그 선택자 */ }
.header { /* header라는 클래스 선택자 */ }
```

특히 `className={styles.header}`를 쓰는 경우 CSS Module에는 `.header`가 있어야 한다.

### CSS 경로 주의

Windows 파일 경로에 익숙하더라도 CSS `@import` 경로에는 `/`를 사용한다.

```css
@import "./css/tokens.css";
```

현재 프로젝트에서는 `src/App.css`가 토큰 파일을 불러오고 있다. 다른 CSS 파일에서 같은 토큰을 여러 번 가져올 필요는 없는지 점검할 수 있다.

---

## 6. 디자인 토큰과 High Contrast 디자인

`src/css/tokens.css`에서 확인한 공통 값:

```css
:root {
  --color-bg: #F5F1E8;
  --color-text: #171717;
  --color-accent: #FF5934;
  --color-muted: #C9C1B3;
  --container-width: 1200px;
  --section-spacing: 120px;
  --font-body: Arial, sans-serif;
}
```

`var(--color-accent)`처럼 쓰면 특정 색을 여러 곳에서 일관되게 적용할 수 있다. 공통 팔레트를 바꿀 때 요소별 CSS를 일일이 찾아 수정할 필요가 줄어든다.

**의도:** 밝은 Hero와 어두운 Projects 섹션이 대비되는 크리에이티브 에디토리얼 포트폴리오. 현재 `--font-body` 토큰은 존재하지만 최종 웹폰트 선정은 아직 진행하지 않았다.

---

## 7. 전체 배경과 콘텐츠 폭을 분리한 이유

초기에는 하나의 `.Card`에 `background-color`와 `max-width: 1200px`를 함께 지정했다. 그러면 배경도 1200px까지만 칠해져 화면 양쪽에 밝은 공간이 남는다.

현재 구조:

```tsx
<div className={styles.ProjectBackground}>
  <section className={styles.Card}>
    {/* 프로젝트 카드들 */}
  </section>
</div>
```

```css
.ProjectBackground {
  background-color: #171717;
  padding: 100px 24px;
}

.Card {
  width: 100%;
  max-width: var(--container-width);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 48px;
  box-sizing: border-box;
}
```

**역할을 나누는 원리:** 바깥 요소는 화면 전체를 덮는 배경을 담당하고, 안쪽 요소는 읽기 좋은 콘텐츠 너비를 담당한다. `margin: 0 auto`는 사용 가능한 가로 공간에서 제한된 너비의 블록을 중앙에 놓는 데 활용된다.

### `padding`에서 겪은 실수

`padding-top: 20;`처럼 길이 단위가 없는 값은 (`0`이 아닌 경우) 유효하지 않다. `20px` 또는 `1.25rem`처럼 단위를 적는다. 이미 `padding: 100px 24px`로 지정한 경우 세부 방향을 다시 선언할 이유가 있는지도 확인한다.

---

## 8. `aspect-ratio`와 너무 커진 이미지 영역

```css
.projectImage {
  width: 100%;
  aspect-ratio: 21 / 9;
  max-height: 360px;
  background-color: #30343a;
  overflow: hidden;
}
```

처음 사용했던 `16 / 9`는 틀린 값이 아니다. **너비가 넓으면 높이도 함께 커지는** 것이 문제였다. 예를 들어 너비가 1200px이면 16:9의 이론적 높이는 675px이다. 21:9라면 약 514px이다. 그래서 더 납작한 비율로 조정하고 최대 높이를 360px로 제한했다.

**주의:** `max-height` 제한이 걸리는 구간에서는 실제 표시 영역이 항상 정확히 21:9를 유지하지 않을 수 있다. 스크린샷의 UI 전체를 보여줘야 한다면 나중에 `object-fit: contain`과 `cover`의 차이를 실험해 보자.

### 이미지 영역이 카드 밖에 생겼던 이유

`Projects.tsx`에서 `projectImage`를 `ProjectCard`와 나란히 형제 요소로 배치하면 프로젝트마다 이미지가 생기는 것이 아니라 독립된 빈 영역 **한 개**가 목록 앞에 생긴다. 이미지 영역은 `ProjectCard.tsx` 안에 배치해야 각 카드에 개별적으로 속한다.

---

## 9. 반응형 글자 크기와 애니메이션

Hero 스타일의 핵심:

```css
.heroTitle {
  font-size: clamp(48px, 8vw, 120px);
  line-height: 1;
  letter-spacing: clamp(-4px, -0.25vw, -1px);
}
```

`clamp(최소값, 선호값, 최대값)`는 화면 너비에 따라 유연하게 조정하되 상한과 하한을 설정한다. `vw`는 뷰포트 너비를 기준으로 한다.

현재 Hero는 `@keyframes fadeIn`으로 `opacity`와 `translateY()`를 변경하며, `.second`와 `.third`로 애니메이션 시작 시간을 다르게 둔다. 실제 `Hero.tsx`에서는 `CREATE.`에 `.third`, `EVOLVE.`에 `.second`가 붙어 있으므로 등장 순서는 화면에 적힌 문구 순서와 다를 수 있다. 의도한 연출인지 확인할 필요가 있다.

```css
@media (prefers-reduced-motion: reduce) {
  .fadeIn { animation: none; }
}
```

이 코드는 OS에서 움직임 감소를 선호하는 사용자의 접근성을 고려한다. 카드에서도 해당 설정에 대해 트랜지션을 제거하고 Hover 이동을 없앤다.

---

## 10. 링크와 선택적 속성

```tsx
{project.githubUrl && (
  <a
    href={project.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className={styles.gitlink}
  >
    View Source ↗
  </a>
)}
```

`githubUrl?: string`이므로 링크가 없는 프로젝트도 존재할 수 있다. 조건부 렌더링을 통해 주소가 없을 때 링크를 만들지 않는다. `target="_blank"`는 새 탭을 열고 `rel`은 새 탭 사용 시 보안·개인정보 관점의 방어적 설정이다.

`.gitlink:focus-visible`은 키보드 사용자에게 현재 포커스가 어디 있는지 보여 주는 데 도움이 된다.

---

## 11. README와 실제 구현 상태를 구분하는 법

### 현재 소스에서 확인한 구현

- React 19 + TypeScript 7 + Vite 8 기반 화면 구성 (`package.json` 선언 기준)
- 프로젝트 정보를 `App.tsx`에 로컬 배열로 선언
- 기술 스택 태그와 GitHub 링크 렌더링
- 빈 목록일 때 한국어 안내 문구 표시
- 아이보리 Hero / 다크 Projects 섹션
- 프로젝트 이미지 플레이스홀더, Hover, 일부 모션 접근성

### 아직 구현되지 않았거나 검증되지 않은 부분

- 실제 프로젝트 스크린샷 이미지 삽입
- 동작하는 내비게이션 메뉴 (`MENU`는 현재 `<p>`)
- 정식 Footer와 연락처
- About 섹션
- 모든 기기에서의 반응형 화면 검증
- 실제 GitHub 배포/빌드 성공 여부 (ZIP을 읽었으나 이 문서 작성 과정에서 실행 검증은 하지 않음)

**문서 작성 원칙:** '구현됨', '계획 중', '검증 필요'를 구분하자. 실제 코드에 없는 기능을 채용용 소개에 완료 상태로 적지 않는 것이 중요하다.

---

## 12. 복습 미션 (정답은 접어서 보기 대신 아래에 분리)

1. `Project`와 `Project[]`의 차이를 한 문장으로 설명해 보자.
2. `projects.map(...)` 안에서 빈 배열 안내 문구를 넣으면 왜 보이지 않을까?
3. `key={project.id}`가 `key={project.title}`보다 안정적일 수 있는 이유는?
4. `.projectImage`를 `Projects.tsx` 안에 `ProjectCard`와 형제로 배치하면 어떤 현상이 생길까?
5. 화면 전체를 다크 배경으로 칠하면서 카드 목록만 중앙 1200px로 제한하려면 어떤 두 레이어가 필요할까?
6. `githubUrl`이 선택적 속성일 때 `<a>`를 안전하게 표시하는 방법은?

### 정답 / 해설

1. `Project`는 프로젝트 객체 하나, `Project[]`는 그 객체들이 담긴 배열의 타입이다.
2. 빈 배열의 `map()` 콜백은 한 번도 실행되지 않기 때문이다. 빈 배열 조건은 바깥에서 판단해야 한다.
3. 제목은 바뀌거나 중복될 수 있지만 고유 ID는 항목의 정체성을 유지하는 데 더 적합하다.
4. 개별 카드의 이미지가 아니라 목록 앞에 별도의 이미지 빈 영역 하나가 생긴다.
5. 전체 폭 배경을 맡는 부모와 `max-width`, `margin: 0 auto`를 가진 내부 콘텐츠 컨테이너를 분리한다.
6. `project.githubUrl && <a href={project.githubUrl}>...</a>`처럼 값이 있을 때만 렌더링한다.

---

## 13. 다음 학습 순서

1. 프로젝트 스크린샷을 실제 21:9 미디어 영역에 배치하고 `object-fit`을 비교한다.
2. 시맨틱한 헤더 내비게이션 링크와 섹션 ID를 추가한다.
3. About/Contact 섹션과 Footer를 구현한다.
4. 모바일에서 카드 패딩·타이포그래피·메뉴를 점검한다.
5. `npm run build`, `npm run lint`를 실행해 진단 결과를 수정한다.
6. 배포 후 실사용 화면을 README에 기록한다.

**한 줄 정리:** DEVFOLIO에서 가장 중요한 배움은 *타입은 데이터의 구조를 정의하고, Props는 실제 값을 전달하며, 컴포넌트와 CSS는 각자 맡은 영역의 표현을 책임진다*는 것이다.
