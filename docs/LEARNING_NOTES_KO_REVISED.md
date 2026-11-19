# DEVFOLIO — 개발 학습 노트 (한국어)

> 통합 개정판 · 2026-11-19 · 최종 `devfolio(4).zip` 및 배포 기록 기준. 실제 구현, 설명용 축약 예시, 과거 실험, 개선안을 구분한다. 이번 문서 작성에서 빌드와 Lighthouse를 재실행하지 않았다.

학습 방법: 개념을 읽고 해당 소스 파일을 열어 코드를 따라간다. 코드 없이 원리를 설명하고 복습 문제를 푼다. 단순 암기보다 다른 프로젝트에도 적용할 수 있는 이해가 목표다.

| Part | 장 | 학습 주제 |
| --- | --- | --- |
| I | 01–05 | React, 타입, Props, 배열 |
| II | 06–08 | CSS, 레이아웃, 반응형 |
| III | 09–13 | Hooks, 브라우저, 스크롤, GSAP, CSS 3D |
| IV | 14–17 | Three.js, 모델링, 재질, 애니메이션 |
| V | 18–21 | 성능, 접근성, 예외 처리, SEO |
| VI | 22–24 | 빌드, 배포, DNS, HTTP 보안 |
| VII | 25–26 | 면접, 복습 및 실습 |

---

# Part I. 기초

---

## 01. 프로젝트 개요 및 최종 아키텍처

DEVFOLIO는 React + TypeScript + Vite 기반 원페이지 포트폴리오다. 공개 주소는 https://dev.hexha.org. 2026년 11월 19일 Cloudflare Pages 배포 및 사용자 지정 도메인 접속에 성공했다. 정적 프론트엔드이며 소개된 프로젝트의 백엔드를 호스팅하지는 않는다.

```text
App
├── Header
├── main
│   ├── Hero
│   │   └── HeroGraphic
│   ├── About
│   ├── Projects
│   │   └── ProjectCard × 4
│   └── Contact
└── Footer
```

| 파일 | 책임 |
| --- | --- |
| `App.tsx` | 페이지 조립, 프로젝트 배열 전달 |
| `data/projects.ts` | 프로젝트 4개의 데이터와 이미지 import |
| `types/project.ts` | 데이터 계약 (`img: string`, `githubUrl?: string` 포함) |
| `ProjectCard.tsx` | 개별 프로젝트 표시 |
| `Projects.tsx` | 회전·스냅·활성 카드 상태 |
| `HeroGraphic.tsx` | WebGL 장면 및 자원 수명 |
| `Header.tsx` | 중앙 기준 Scroll Spy |
| `utils/scroll.ts` | 모션 설정에 맞는 공통 스크롤 동작 |
| `Contact.tsx`, `Footer.tsx` | 연락처, 외부 링크, 상단 이동 |

데이터 수정이 필요하면 UI 대신 `data/projects.ts`를 수정한다. `ProjectCard`가 데이터 출처를 몰라도 되는 설계는 백엔드에서 DTO와 서비스 책임을 분리하는 사고와 연결된다. 현재 Kimbap과 NoodleMES의 `techStack`은 빈 배열이다. 실제 정보 확인 후 채우면 된다.

PacketScope, PlayPort, Kimbap, NoodleMES의 실제 이미지와 링크, Contact, Scroll Spy, 3D 휠, 반응형 레이아웃, 모션 감소 대응, WebGL 예외 처리, 파비콘 및 SEO 기본 설정을 구현했다. 배포 이후에도 최종 테스트와 개선점은 26장을 참조한다.

---

## 02. React와 컴포넌트 설계

### 왜 분리할까?

컴포넌트는 **하나의 책임을 분리**하기 위한 수단이다. 모든 JSX를 `App.tsx`에 몰아 넣으면 프로젝트가 늘어날 때 화면 구조와 데이터 처리 코드가 뒤섞인다. 반대로 `ProjectCard`를 독립시키면 프로젝트가 2개에서 20개로 늘어나도 동일한 렌더링 규칙을 재사용할 수 있다.

**실습 질문:** 새로운 프로젝트가 추가되면 어떤 파일만 수정해도 되는가? 현재 설계에서는 우선 `src/data/projects.ts`의 `projects` 데이터에 항목을 추가하면 된다.

React는 JSX로 원하는 화면을 선언한다. Three.js와 GSAP처럼 명령형 라이브러리를 연동할 때 DOM 참조와 생명주기 정리가 필요하다. `main.tsx`는 createRoot로 앱을 마운트하고 StrictMode로 개발 중 부작용을 점검한다. 실무에서는 단순 줄 수보다 변경 이유와 책임을 기준으로 컴포넌트를 분리한다.

---

## 03. TypeScript와 데이터 모델

`src/types/project.ts`:

```ts
export interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  githubUrl?: string;
  img: string;
}
```

`interface`는 객체에 필요한 속성과 타입을 정한다. `export`는 이 **타입 정의를 다른 파일에서 참조할 수 있게 공개**한다. 실제 프로젝트 객체가 다른 파일로 전송되는 것은 아니다.

`src/data/projects.ts`에서는 다음처럼 타입을 가져온다.

```tsx
import type { Project } from "../types/project";

export const projects: Project[] = [
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

`img`는 필수 문자열이다. Vite에서 이미지 import는 빌드된 자산 URL을 제공한다. TypeScript는 런타임 서버 응답을 자동 검증하지 않으므로 외부 데이터는 별도 검증이 필요하다. Java DTO와 유사한 계약 역할을 하지만 런타임에 남는 형태는 다르다.

---

## 04. Props와 데이터 흐름

현재 데이터 흐름:

```text
data/projects.ts → App의 projects: Project[]
          │
          ▼
<Projects projects={projects} />
          │  map으로 Project 하나씩 꺼냄
          ▼
<div key={project.id}><ProjectCard project={project} /></div>
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

최종 구조의 축약 예시(실제 key는 wheelItem에 적용):

```tsx
<div key={project.id}><ProjectCard project={project} /></div>
```

**참고:** `key`는 React가 목록 요소를 식별하는 특수한 값이며 `ProjectCard`의 일반 Props로 자동 전달되지 않는다.

Props는 읽기 전용처럼 취급한다. 부모 상태를 바꾸려면 콜백을 전달할 수 있지만 현재 카드에는 필요하지 않다.

---

## 05. 배열 및 조건부 렌더링

`Projects.tsx`의 핵심을 축약한 예시(실제로 wheelItem과 cardWrapper가 존재):

```tsx
{projects.length === 0 ? (
  <p>등록된 프로젝트가 없습니다.</p>
) : (
  projects.map((project) => (
    <div key={project.id}><ProjectCard project={project} /></div>
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

`map`은 콜백 반환값으로 새 배열을 만든다. 빈 배열과 undefined를 요소로 가지는 배열은 다르다. About은 `Object.entries(skills).map(([category, skillList], index) => ...)`로 객체를 반복 렌더링한다.

### 선택적 링크

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

`noopener`는 새 탭의 원본 창 접근을 제한하고 `noreferrer`는 참조자 정보도 보내지 않는다.

---

# Part II. 화면 설계

---

## 06. CSS Modules와 디자인 토큰

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

### 최종 디자인 토큰

```css
:root {
  /* Colors */
  --color-bg: #f5f1e8;
  --color-text: #171717;
  --color-accent: #ff5934;
  --color-accent-dark: #c43d20;
  --color-muted: #c9c1b3;
  --color-neon: #c6ff45;
  --color-surface: #24292d;

  /* Layout */
  --container-width: 1000px;
  --section-spacing: clamp(32px, 6dvh, 80px);
  --header-height: 56px;

  --page-padding: clamp(12px, 2vw, 24px);

  /* Typography */
  --font-body: "Space Grotesk Variable", sans-serif;
  --font-mono: "IBM Plex Mono", monospace;
}
```

공통 변수는 색상, 간격, 폰트의 일관성을 유지한다. 밝은 Hero와 다크 Projects, 오렌지 강조색과 About 네온을 사용한다. CSS Modules는 클래스 충돌을 줄이지만 전역 CSS 변수까지 격리하지는 않는다.

---

## 07. Flexbox, Grid, Position

초기에는 하나의 `.Card`에 `background-color`와 `max-width: 1200px`를 함께 지정했다. 그러면 배경도 1200px까지만 칠해져 화면 양쪽에 밝은 공간이 남는다.

초기 세로 목록 구조(과거 실험):

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

### 레이아웃 실패 및 해결

기존 레이아웃에서는 왼쪽 타이포그래피와 오른쪽 그래픽 전체를 `align-items: center`로 배치했다. 양쪽 구분선을 정확히 일치시키기 위해 `subgrid` 실험을 했지만, 450px 캔버스가 공유 행 높이에 영향을 줘 타이포그래피가 내려갔다. `min-height: 75vh`도 수정 과정에서 누락됐다.

최종 결정은 Flexbox 복구였다. `heroHeading`과 상세 설명을 묶는 래퍼를 사용하고, Hero는 `justify-content: space-between`, `align-items: center`, `min-height: 75vh`를 적용한다. 그래픽 figure는 폭 450px 및 `max-width: 100%`, 내부 컨테이너는 `aspect-ratio: 1 / 1`이며 좁은 화면에서는 Hero 전체가 세로 배치된다.

중요한 교훈: 시각적 균형과 수학적인 정렬은 동일하지 않다. 레이아웃을 변경하기 전에 DevTools에서 부모 크기, 자식의 실제 `getBoundingClientRect()`, Flex/Grid 축, margin/padding, computed style을 먼저 확인한다.

최종 Projects는 긴 scrollArea와 헤더 아래의 sticky ProjectBackground로 구성된다. sticky는 컨테이너 내 스크롤을 따라 고정되며 fixed와 다르다. absolute인 wheelItem은 상대 위치 부모를 기준으로 겹친다. 모바일 Grid의 minmax(0, 1fr), min-height: 0, overflow: clip과 Flex의 min-width: 0은 콘텐츠가 영역을 밀어 넘치는 문제를 완화한다.

---

## 08. 반응형 디자인

초기 실험(현재 구현 아님):

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

**주의:** `max-height` 제한이 걸리는 구간에서는 실제 표시 영역이 항상 정확히 21:9를 유지하지 않을 수 있다. 스크린샷의 UI 전체를 보여줘야 한다면 `object-fit: contain`은 전체 이미지를 보존하고 `cover`는 일부를 자를 수 있다.

### 이미지 영역이 카드 밖에 생겼던 이유

`Projects.tsx`에서 `projectImage`를 `ProjectCard`와 나란히 형제 요소로 배치하면 프로젝트마다 이미지가 생기는 것이 아니라 독립된 빈 영역 **한 개**가 목록 앞에 생긴다. 이미지 영역은 `ProjectCard.tsx` 안에 배치해야 각 카드에 개별적으로 속한다.

최종 카드는 16:9, flex: 1 1 50%, min-width: 0, object-fit: contain을 사용한다. 800px 이하 이미지 비중은 35%이며 텍스트와 패딩을 축소한다. 21:9는 이전 실험이다.

Hero 스타일의 핵심:

```css
.heroTitle {
  font-size: clamp(36px, 5.5vw, 88px);
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

`dvh`는 동적 뷰포트 높이 기준이다. 헤더 높이 56px과 스크롤 여백을 고려하여 좁은 화면과 가로 넘침을 검증한다.

---

# Part III. 동작 원리

---

## 09. React Hooks와 생명주기

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [isVisible, setIsVisible] = useState(false);
```

- `useRef`: 렌더링 사이에 값을 보존한다. `ref.current` 변경만으로 React가 다시 렌더링되지는 않는다. DOM을 참조하거나 외부 라이브러리의 객체를 보관하기 좋다.
- `useState`: JSX에 영향을 주는 상태를 관리한다. 값이 변경되면 렌더링이 예약된다.
- `useEffect`: 렌더링 이후 외부 시스템과 연결하고 연결을 해제한다. 빈 의존성 배열은 마운트 기반의 설정에 사용하지만 개발 모드 StrictMode에서는 설정-정리-설정이 추가로 실행될 수 있다.

Three.js의 매 프레임 회전값을 React State에 저장하지 않은 이유는 UI 트리 전체를 매 프레임 다시 계산할 필요가 없기 때문이다.

Effect는 외부 시스템과 동기화한다. 이벤트 등록과 제거에는 동일한 콜백 참조가 필요하다. state 변경은 렌더링을 예약하고 해당 변수의 값을 즉시 바꾸지는 않는다. ref를 사용해도 자원 정리가 자동으로 수행되지는 않는다.

---

## 10. DOM, 이벤트, Observer

```tsx
const observer = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) setIsVisible(true);
  else if (entry.boundingClientRect.top > 0) setIsVisible(false);
}, { threshold: 0.3 });
observer.observe(element);
return () => observer.disconnect();
```

`threshold: 0.3`은 관찰 대상 면적의 교차 비율이 30% 경계를 넘을 때 알림을 받도록 설정한다. `isIntersecting` 자체가 반드시 30% 이상이라는 뜻은 아니다. 엄밀한 30% 이상 조건은 `intersectionRatio >= 0.3`으로 검사한다.

`boundingClientRect.top > 0` 조건은 요소가 화면 아래로 돌아갔을 때만 상태를 초기화한다. 결과적으로 위로 스크롤하여 Hero로 돌아간 후 다시 진입하면 등장 애니메이션을 재생할 수 있다. CSS 클래스는 State에 따라 붙인다.

getElementById는 DOM 요소를 찾고 getBoundingClientRect는 뷰포트 기준 위치와 크기를 반환한다. ResizeObserver는 요소 크기를, IntersectionObserver는 화면 교차를 관찰한다. scroll, resize, pointermove는 각각 cleanup에서 제거한다. 서버의 구독과 연결처럼 브라우저 이벤트에도 수명이 있다.

---

## 11. 스크롤 제어와 Scroll Spy

기존 문제: About으로 이동하는 경로마다 최종 위치가 달랐다. Hero 버튼은 중앙, Header 링크는 조금 위, 휠로 이동하면 Projects가 일부 보였다.

```tsx
event.preventDefault();
scrollToSection("About", "center");
```

`preventDefault()`는 앵커의 기본 이동을 막는다. `block: "center"`는 세로 방향 가운데 정렬을 요청한다. 최종 Hero와 Header에서 공통 유틸리티를 사용해 명시적인 이동의 기준을 통일했다. 사용자의 일반 휠 스크롤은 강제로 위치를 수정하지 않기로 결정했다. `scroll-padding`은 스크롤 컨테이너의 정렬 여백이고 `scroll-margin`은 대상 요소의 정렬 여백이므로 헤더 가림을 조정할 때 구분해서 사용한다.

Projects는 별도 진입 스냅을 가진다. `window.scrollY`의 이전 값으로 아래 방향 여부를 판단하고, ScrollTrigger의 `scrollEnd`에서 섹션 상단까지 남은 거리(`getBoundingClientRect().top`)가 1px보다 크고 화면 높이의 3% 이내이면 `scrollBy`로 이동한다. 모든 섹션을 강제로 스냅시키는 것과 다르다. 카드별 스냅은 별도 타임라인 설정으로 구현되어 있다(12장).

Sticky 헤더의 위치와 기존 링크 동작은 유지하면서 번호, 모노스페이스 폰트, 오렌지 포인트, hover를 적용했다. Header와 Hero의 About 이동 동작은 동일하게 맞췄다. Projects와 Contact는 start 정렬을 사용한다.

최종 Header의 화면 중앙 기준 판정 축약 예시:

```tsx
const centerY = window.innerHeight / 2;
const currentSection = ["About", "Projects", "Contact"].find(id => {
  const section = document.getElementById(id);
  if (!section) return false;
  const rect = section.getBoundingClientRect();
  return rect.top <= centerY && rect.bottom > centerY;
});
setActiveSection(currentSection ?? "");
```

`find()`는 조건에 맞는 첫 번째 요소를 반환하며 없으면 `undefined`다. `??`로 빈 문자열을 기본값으로 지정한다. Projects는 길이가 긴 스크롤 영역이므로 단순히 대상 면적 대비 50%의 교차 비율을 검사하면 감지되지 않을 가능성이 있다. `scroll`/`resize` 리스너의 정리, 필요시 프레임 단위 제한, `aria-current="location"` 적용을 검토한다. Contact는 구현되어 있다.

### 공통 스크롤 함수

```ts
function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "instant"
    : "smooth";
}

export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: getScrollBehavior(),
  });
}

export function scrollToSection(
  id: string,
  block: ScrollLogicalPosition = "start",
) {
  document.getElementById(id)?.scrollIntoView({
    behavior: getScrollBehavior(),
    block,
  });
}
```

중복된 정책을 한 곳에서 관리하고 모션 감소 설정에 맞춘다.

---

## 12. GSAP과 ScrollTrigger

```tsx
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.3,
    markers: false,
  },
});
tl.to(wheel, { rotationX: maxRotation, duration: 8, ease: "none", onUpdate: updateCards });
tl.to({}, { duration: 1 });
```

- `trigger`: 스크롤 기준 엘리먼트.
- `start`/`end`: 요소와 뷰포트 사이의 정렬 조건으로 진행 범위를 결정한다.
- `scrub: 0.3`: 애니메이션 진행률을 스크롤에 연결하면서 따라오는 시간을 준다.
- `ease: "none"`: 회전 진행률이 선형적으로 증가한다.
- 빈 객체의 후속 tween: 회전이 끝난 상태에서 추가 스크롤 여유를 만든다.

스크롤 연결 시 `duration: 8`은 실제로 반드시 8초가 걸린다는 의미가 아니라 타임라인 내 비율을 결정한다. 최종 회전량은 카드 수에 따라 자동 계산한다(13장).



### Snap 정책

스크롤 전체의 8/9만 회전에 사용하고 나머지 1/9는 마지막 카드 유지 구간이다. 카드가 4개면 정지 지점은 0, 8/27, 16/27, 8/9. `snapTo`는 가장 가까운 지점과의 차이가 한 구간의 10% 이하일 때만 그 지점으로 이동한다. `progress >= 8/9`에서는 그대로 반환한다. 즉 항상 강제 스냅시키는 것이 아니다.

```ts
const step = 8 / 9 / (projects.length - 1);
const nearest = Math.round(progress / step) * step;
```

`useGSAP`에서 0~1개는 애니메이션 초기화를 생략한다. JSX는 빈 목록 메시지를 별도로 렌더링한다. 다만 빈 배열일 때 `displayIndex` 계산은 NaN이 되므로 데이터가 동적으로 변하는 기능을 추가할 때는 별도의 가드와 타임라인 재생성 의존성을 검토한다.

useGSAP은 GSAP Context를 사용해 애니메이션 생명주기를 관리하고 matchMedia는 미디어 조건 전환을 처리한다. 외부 이벤트와 inert처럼 GSAP이 관리하지 않는 변경은 별도 cleanup이 필요하다.

---

## 13. CSS 3D와 회전축의 수학

프로젝트는 평면 슬라이더가 아니라 X축을 중심으로 돌아가는 물레방아를 구성한다.

```tsx
const angle = index * (360 / projects.length);
// 바깥: 공간상의 위치
transform: `rotateX(${angle}deg) translateZ(var(--wheel-radius))`
// 안쪽: 카드 자체의 방향
transform: `rotateX(${-angle}deg)`
```

4개라면 각도는 0°, 90°, 180°, 270°다. `translateZ`가 회전축에서 떨어진 거리를 만들고 `rotateX`가 위치를 회전시킨다. CSS 변환의 순서는 중요하다. 안쪽 요소의 역회전은 카드가 읽기 쉬운 방향을 유지하게 한다. `perspective`는 원근감을, `transform-style: preserve-3d`는 자식의 3D 배치를 보존한다.

```ts
const angleStep = 360 / projects.length;
const maxRotation = angleStep * (projects.length - 1);
```

4개면 90° 간격, 총 270° 회전이다. 휠은 양의 방향으로 돌기 때문에 전면 카드의 배열 인덱스는 0 → 3 → 2 → 1이다. `displayIndex`는 이를 진행 순서 1 → 2 → 3 → 4로 변환한다.

```ts
const index = (projects.length - Math.round(rotation / angleStep)) % projects.length;
const displayIndex = ((projects.length - activeIndex) % projects.length) + 1;
```



### 깊이와 역회전

```ts
const totalAngle = angle + rotation;
const radian = totalAngle * Math.PI / 180;
const depth = Math.cos(radian);
const opacity = gsap.utils.mapRange(-1, 1, 0.15, 1, depth);
```

`cos` 결과는 -1~1이다. 앞쪽(1)은 불투명하게, 뒤쪽(-1)은 흐리게 표시한다. 실제 코드의 `pointerEvents: depth >= 0.95 ? "auto" : "none"`은 앞쪽 카드만 포인터 클릭을 받게 한다. 단, `pointer-events: none`만으로 키보드 포커스가 차단되지는 않는다. 최종 코드에서는 inert도 함께 지정한다(19장).

카드 래퍼는 rotationX: -totalAngle로 역회전하고 깊이를 opacity 0.15~1에 매핑한다. 카운터는 배열 인덱스가 아니라 진행 순서를 표시한다.

---

# Part IV. 그래픽

---

## 14. Three.js 기본 구조

| 구성 | 역할 |
|---|---|
| Scene | 장면 전체, 오브젝트와 조명 배치 |
| PerspectiveCamera | 보는 위치, 시야각, 원근 투영 |
| WebGLRenderer | 장면과 카메라를 받아 캔버스에 렌더링 |
| Geometry | 정점과 면으로 정의되는 형태 |
| Material | 색상, 거칠기, 금속성 등 표면 표현 |
| Mesh | Geometry와 Material을 합친 렌더링 객체 |
| Group | 여러 객체를 묶어 공통 변환 적용 |

```ts
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
// 축약 예시: 실제 생성은 try/catch 내부
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
camera.position.z = 9;
container.appendChild(renderer.domElement);
```

카메라 생성자의 인자는 시야각(도), 가로세로 비율, near, far다. 카메라가 멀어지면 일반적으로 화면에 보이는 물체가 작아진다. `alpha: true`여도 `scene.background`에 불투명한 색을 지정하면 배경이 표시된다.

WebGL은 브라우저 GPU 그래픽 API이며 Three.js는 객체 기반 추상화를 제공한다. Mesh/Group transform으로 위치·회전·크기를 바꾸며 Geometry를 재사용할 수 있다.

---

## 15. Geometry와 좌표계

최종 채택한 형태는 `LatheGeometry(profile, 96)`이다. `Vector2`로 반지름과 높이의 단면을 정의한 뒤 Y축 주위로 회전시키면 고리 형태가 된다. 첫 점과 마지막 점을 연결하면 단면이 닫힌다. 96은 회전 방향의 분할 수로, 많을수록 부드럽지만 정점 수가 늘어난다.

```ts
const geometry = new THREE.LatheGeometry(profile, 96);
const mesh = new THREE.Mesh(geometry, material);
const secondMesh = mesh.clone();
secondMesh.scale.setScalar(0.75);
```

`clone()`으로 만든 Mesh는 기본적으로 Geometry와 Material 참조를 공유할 수 있다. 별도의 색상이나 거칠기가 필요할 때 Material을 `clone()`한 이유다. 중심 코어에는 `SphereGeometry`를 사용했다. 회전 대칭인 Lathe 고리를 자신의 Y축으로 90° 회전해도 초기 외관은 크게 변하지 않는다는 점도 기억할 것.

### 이전 실험: Trefoil Knot

`Vector3` 점들을 삼각함수로 만들고 `CatmullRomCurve3`으로 부드러운 폐곡선을 구성했다. `Vector2`와 `Shape`로 단면을 정의하고 `ExtrudeGeometry`의 `extrudePath`를 사용하면 곡선을 따라 단면을 밀어낸 입체를 만들 수 있다. `TorusGeometry`, `EdgesGeometry`, `LineSegments`도 학습했다. 최종 Hero에 채택한 것은 Trefoil이 아니라 Lathe 기반 Orbital System이다.

CSS의 도 단위와 Three.js 라디안을 구분한다(180° = π rad). Group의 변환은 자식 Mesh에 영향을 준다. 절차적 모델링은 외부 모델 파일 없이 수학과 좌표로 형태를 만드는 방식이다.

---

## 16. Material, Lighting, HDR

금속은 `MeshStandardMaterial`의 높은 `metalness`와 낮은 `roughness`로 표현한다. HDR 환경 텍스처는 여러 방향의 빛 정보를 반사에 제공한다.

```ts
hdrLoader.load("/office-small.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});
```

`scene.environment`는 물리 기반 재질의 환경광과 반사에 영향을 준다. `scene.background`와 다른 개념이다.

유리 상자는 얇은 `BoxGeometry(6, 6, 0.06)`를 여섯 개 복제해 구성했다. 중심으로부터 `boxSize / 2 - glassThickness / 2`만큼 양·음의 X/Y/Z 방향으로 이동하고 옆면과 윗면은 90° 회전시킨다. 처음 앞면과 뒷면을 같은 +Z 위치에 둬 유리 한 장처럼 보였던 문제를 해결했다.

최종 재질은 `MeshPhysicalMaterial`의 `transparent: true`, `opacity: 0.12`, `clearcoat: 1`, `depthWrite: false`, `transmission: 0`을 사용한다. 즉 실제 굴절 중심의 유리가 아니라 투명도와 광택, 연한 청록색 모서리로 유리의 인상을 만든 표현이다. `EdgesGeometry`와 `LineSegments`로 각 패널의 윤곽을 표시한다. 여러 투명 패널의 겹침이나 정렬 문제는 남을 수 있다.

최종 AmbientLight 강도는 1, DirectionalLight 강도는 3이다. 전자는 균일한 광원이고 후자는 방향성을 제공한다. PBR은 금속성과 거칠기 등 표면 특성을 이용한다.

---

## 17. 애니메이션과 선형 보간

```ts
mouseX = (event.clientX / window.innerWidth) * 2 - 1;
mouseY = (event.clientY / window.innerHeight) * 2 - 1;
targetPosition.set(mouseX * 0.5, -mouseY * 0.5, 0);
group.position.lerp(targetPosition, alpha);
glass.position.copy(group.position);
```

좌표를 -1~1로 정규화하고 Y를 반전하여 3D 좌표에 맞춘다. `lerp`는 현재값에서 목표값까지 일정 비율만큼 이동하는 선형 보간이다. 고정 alpha 0.05라면 매 프레임 5%씩 접근하므로 포인터 위치를 바로 대입하는 것보다 부드럽다. 유리 Group 회전에도 `MathUtils.lerp`를 적용했다.

`requestAnimationFrame`은 다음 화면 갱신 시점에 콜백을 요청한다. `group.rotation.x += 0.003` 같은 프레임당 증가 방식은 모니터 주사율에 따라 실제 속도가 달라질 수 있다. 최종 코드에서는 delta time과 화면 밖 렌더링 중지를 적용한다.

```ts
const deltaTime = lastTime === null ? 0 : Math.min((currentTime - lastTime) / 1000, 0.1);
const alpha = 1 - Math.pow(0.95, deltaTime * 60);
group.rotation.x += 0.18 * deltaTime;
```

RAF 시간은 밀리초이므로 1000으로 나누어 초 단위로 변환한다. 0.18은 초당 회전 라디안이다. 60Hz에서 약 0.003씩, 120Hz에서 약 0.0015씩 증가하므로 초당 속도가 동일하다. 0.1초 상한은 긴 프레임 지연 후 갑자기 크게 움직이지 않게 한다(실제 시간과 완전히 일치시키기보다는 안정성을 우선).

`alpha`는 60Hz에서의 5% 보간을 다른 주사율에도 비슷하게 맞춘다. 두 번의 120Hz 보간을 거치면 남은 거리 비율이 0.95가 되는 구조다.



보간식은 current + (target - current) × alpha다. 목표 위치를 바로 대입하는 대신 부드럽게 추적한다.

---

# Part V. 품질 관리

---

## 18. 성능 및 리소스 최적화

`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`로 내부 해상도를 제한한다. CSS 크기 400×400일 때 DPR 1.5는 600×600, DPR 3은 1200×1200이다. 전자는 후자의 픽셀 수 1/4이다. 실제 GPU 시간은 셰이더·장면 복잡도에 따라서도 달라진다.

기존 PNG 총량 1,880.6 KiB(개발 기록) → 현재 WebP 80,190바이트 ≈ 78.3 KiB. 감소율은 `(1 - 78.3 / 1880.6) × 100 ≈ 95.8%`. HDR은 개발 기록상 1024×512에서 512×256으로 줄였고, 최종 파일 `/office-small.hdr`은 약 337.5 KiB다. WebP 사진 합계와 HDR 크기는 별개다.

`main.tsx`에서 Fontsource 패키지의 폰트를 import한다. Vite가 CSS와 폰트 파일을 번들에 포함하므로 Google Fonts CDN에 대한 별도의 외부 연결 의존성이 줄어든다. 외부 CDN 제거가 자동으로 모든 폰트 로딩 지연을 제거하지는 않는다.



### 화면 밖 렌더링 중지

`IntersectionObserver`는 HeroGraphic이 뷰포트에 들어오면 RAF를 예약하고 나가면 취소한다. `animationId !== null` 가드는 중복 루프를 막고, 종료 시 `lastTime = null`로 이전 실행의 시간을 초기화한다. reduced-motion인 상태에서 시작하면 정적인 프레임만 그린다.

웹 성능 문제는 네트워크 전송, CPU 및 GPU 비용을 나눠 측정한다. 파일 압축과 렌더링 중단은 서로 다른 병목을 해결한다.

---

## 19. 접근성과 Reduced Motion

`depth = Math.cos(totalAngle * Math.PI / 180)`으로 앞뒤 위치를 판정한다. 깊이 0.95 이상만 조작 가능하도록 설정한다.

```ts
card.inert = !isInteractive;
gsap.set(card, { pointerEvents: isInteractive ? "auto" : "none" });
```

`pointer-events`는 마우스 이벤트를 제한하지만 Tab 탐색을 막지 못한다. `inert`는 비활성 하위 요소의 클릭과 포커스 및 접근성 트리 노출을 제한한다. Cleanup에서 반드시 `inert = false`로 되돌린다.

GSAP MatchMedia가 no-preference일 때만 타임라인을 생성하고, reduced-motion CSS가 sticky/3D 배치와 카운터를 해제해 세로 목록을 제공한다. `mm.revert()`로 모션 설정 변경 및 언마운트 시 정리한다. Header/Hero/Footer의 공통 스크롤 유틸리티는 `matchMedia`에 따라 instant 또는 smooth를 반환한다.

Hero, About, Projects의 장식적 CSS 애니메이션은 모션 감소 시 제한된다. 상태 표시등의 aria-hidden은 장식 요소를 숨기며 텍스트가 의미를 전달한다. ACTIVE는 실제 서버 헬스체크가 아니다. opacity: 0만으로 포커스가 사라지지 않는다. inert, aria-hidden, visibility는 목적이 다르다.

**검토 포인트:** HeroGraphic에는 motionQuery의 `change` 리스너가 없다. Projects는 즉시 모션 모드 전환을 처리하지만 Hero는 화면 진입/재진입 또는 새로고침 등에서 motionQuery를 읽는다. 지속 표시 중 설정을 바꿨을 때의 즉시 중지/재시작은 추가 확인 대상이다.

---

## 20. 예외 처리와 자원 해제

캔버스 컨테이너가 변하면 카메라의 `aspect`를 업데이트하고 `updateProjectionMatrix()`를 실행한다. `renderer.setSize(width, height, false)`는 CSS 크기 변경 없이 렌더러 크기를 갱신한다. `setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`는 고밀도 화면의 선명도와 GPU 부담을 절충한다. DPR 1.5는 CSS 기준 픽셀 수의 약 2.25배다(18장).

정리 함수에서는 다음 자원을 해제한다.

- `cancelAnimationFrame(animationId)`
- `resizeObserver.disconnect()`와 `removeEventListener`
- Geometry, Material, Texture의 `dispose()` (공유 자원은 한 번만)
- `scene.environment = null`, `renderer.dispose()`, 캔버스 제거

HDR 로딩은 비동기라 언마운트 이후 콜백이 실행될 수 있다. `disposed` 플래그를 확인해 늦게 도착한 텍스처도 해제한다. DOM만 제거한다고 WebGL 자원이 모두 자동 해제되는 것은 아니다.

`try/catch`는 WebGLRenderer **생성 실패**를 처리하며 `hasError` 상태에 따라 `3D GRAPHICS UNAVAILABLE`이 나타난다. 전체 렌더링 오류를 모두 처리한다는 뜻은 아니다. HDR이 늦게 도착하면 `disposed` 플래그로 이미 해제된 장면에 적용하지 않고 텍스처를 폐기한다.

정리 순서: disposed 표시 → RAF 중단 → 옵저버·리스너 해제 → 환경·geometry·material 해제 → renderer 해제 → canvas 제거. StrictMode의 설정-정리-설정 사이클에서 이 순서가 특히 중요하다.

HDR 로드 실패 및 WebGL context lost 복구는 별도 구현하지 않았다. 예외 처리는 오류를 숨기는 것이 아니라 영향을 제한하고 의미 있는 대체 UI를 제공하는 것이다.

---

## 21. Lighthouse와 SEO

Lighthouse는 성능·접근성·모범 사례·SEO를 자동 점검한다. 기존 Performance 95는 당시 측정값이고, 현재 사이트에서 재측정한 결과가 아니다. 특히 동일한 기기/네트워크 조건에서 비교해야 개선 효과를 판단할 수 있다. `index.html`의 title/description/favicon, `robots.txt`, 색 대비, heading, 반응형 CSS를 점검한다. `robots.txt`의 Allow는 색인 허용 의사 표현이지 색인 성공 보장이 아니다.

index.html에는 title, description, viewport, lang, favicon이 포함된다. Open Graph 및 sitemap은 별도 개선 후보이다. LCP(주요 콘텐츠 표시), CLS(레이아웃 이동), INP(상호작용 응답)는 서로 다른 문제를 평가한다. 점수만으로 모든 접근성 및 사용 경험을 보장할 수 없다. 문서에는 구현 완료, 측정값, 검증 필요를 구분한다.

---

# Part VI. 배포

---

## 22. Vite 빌드와 CI/CD

```text
Local files → git commit → git push main → GitHub
  → Cloudflare Pages → npm ci → tsc -b && vite build → dist → CDN
```

`npm run dev`는 개발 서버, `npm run build`는 배포용 정적 번들 생성, `npm run preview`는 빌드 결과 확인이다. Cloudflare Pages 설정은 main / npm run build / dist. `devfolio-6hx.pages.dev`는 기본 주소이고 `dev.hexha.org`는 같은 배포를 가리키는 사용자 지정 호스트다. DNS 연결과 HTTPS 인증서는 빌드 과정과 별도다.

실제 발생한 빌드 실패: `noodleMES.webp`를 import했지만 Git에는 `noodlemes.webp`가 등록됐다. Windows에서 우연히 통과하더라도 Linux에서 대소문자 불일치는 서로 다른 경로다. TypeScript 단계 통과 이후 Vite가 실제 자산을 해석할 때 실패했다.

```powershell
git ls-files "src/assets/screenshots/*"
npm run lint
npm run build
git add src/data/projects.ts
git commit -m "fix: correct image import path"
git push origin main
```

재배포는 push 후 자동으로 이루어진다. 커밋 전에 `git status`로 수정 대상만 확인한다. 파일 자체의 대소문자만 바꿀 필요가 있다면 Windows에서는 임시 이름을 거친 `git mv`를 사용한다.

npm ci는 lockfile에 기반해 깨끗하게 의존성을 설치한다. tsc -b는 TypeScript 프로젝트 빌드/검사, Vite는 JS·CSS·자산 번들 생성, Oxlint는 정적 검사 도구이다. 빌드 성공과 실제 브라우저 작동은 별도 검증이다.

public/favicon.svg를 index.html의 link rel=icon으로 연결하고 main에 push하면 재배포된다. 이전 아이콘이 보이면 브라우저 캐시를 확인한다.

---

## 23. DNS, HTTPS, Cloudflare

| 구성 | 역할 |
| --- | --- |
| DNS | 호스트 이름을 서비스에 연결 |
| Pages | 정적 포트폴리오 파일 제공 |
| R2 | 기존 챗봇 이미지 저장 및 제공 |
| TLS | 전송 암호화 및 서버 인증 |
| WAF | HTTP 요청의 규칙 기반 차단 |

기존 apex `hexha.org`는 R2 이미지 서버로 사용 중이므로 연결을 삭제하지 않고 `dev.hexha.org`를 Pages에 연결했다. 그런데 보안 규칙이 호스트 전체에 적용되어 포트폴리오까지 차단됐다. 기본 pages.dev는 접속 가능했고 사용자 지정 도메인만 403이었으므로 배포 파일 자체 대신 DNS/보안 계층을 조사했다.



CNAME은 이름을 다른 이름에 연결하는 DNS 레코드다. 사용자 지정 도메인은 DNS 연결 후 검증과 인증서 활성화를 거친다. HTTPS는 TLS로 통신을 암호화하고 서버 신원을 검증한다. DNS와 코드의 배포 주기는 별개다. R2는 객체 스토리지이고 Pages는 정적 웹 호스팅이다.

---

## 24. WAF와 HTTP 보안

Security Analytics 이벤트에서 Ray ID, 호스트, 요청 경로, 차단 규칙을 확인했다. 기존 참조자(Referer) 허용 조건에 `http.host eq "hexha.org"`를 AND로 추가하여 이미지 보호 범위를 apex로 제한했다. 규칙 자체를 삭제하지 않고 문제의 범위를 수정한 사례다. Referer는 클라이언트가 위조하거나 생략할 수 있으므로 엄격한 인증 수단이 아니다. 영구적으로 사적 자원을 보호할 경우 서명 URL이나 인증 등을 고려한다.

### 실제 디버깅 순서

1. pages.dev 정상, 커스텀 도메인 403 확인.
2. Security Analytics의 Events에서 Ray ID 및 시각 조회.
3. 사용자 지정 규칙 `new`, dev.hexha.org 호스트와 GET/favicon 요청 차단을 확인.
4. 기존 Referer 조건에 apex 호스트 제한을 AND로 연결.
5. 커스텀 도메인 정상 접속 확인. 기존 R2 링크는 별도 테스트.

보안 설정을 끄지 말고 문제 조건을 로그로 특정하여 범위를 최소한으로 바꾼다. 403은 HTTP 수준의 거부로 DNS 해석 실패와 다르다.

---

# Part VII. 복습

---

## 25. 면접 예상 질문

1. `useRef`와 `useState`를 각각 어디에 쓰고 왜 구분하는가?
2. 배열 렌더링에서 key와 빈 배열 검사를 왜 따로 처리하는가?
3. 휠 카드가 5개라면 각도와 총 회전량은 얼마인가?
4. `pointer-events: none`만으로 접근성 문제를 해결할 수 없는 이유는?
5. DPR 3과 1.5의 픽셀 수 차이는?
6. delta time이 없으면 60Hz와 120Hz에서 무슨 일이 발생하는가?
7. HDR 비동기 콜백의 `disposed`가 필요한 이유는?
8. 로컬 빌드가 정상인데 배포가 실패할 수 있는 사례는?
9. Pages 기본 주소는 열리는데 커스텀 도메인에서 403이 발생했다. 어디부터 확인할 것인가?
10. 왜 WAF를 끄지 않고 호스트 조건을 추가했는가?

**정답:** 1. DOM/외부 상태 보존 vs JSX 상태 변경. 2. 항목 정체성과 빈 배열의 콜백 미실행. 3. 72°, 288°. 4. 키보드 포커스는 남을 수 있다. 5. 4배. 6. 프레임당 고정 변화량이면 120Hz가 두 배 빠르다. 7. 해제된 장면에 텍스처를 적용하는 누수 방지. 8. Linux 경로 대소문자. 9. 호스트·Ray ID·이벤트·규칙 비교. 10. 기존 R2 보호를 유지하고 새 호스트만 차단 대상에서 제외하기 위해.

면접에서는 '무엇을 했다'보다 **문제 → 원인 → 근거 → 수정 → 검증** 순서로 말한다. 본 프로젝트의 배포 오류와 WAF 충돌이 대표 사례다.

### 추가 핵심 개념 질문

1. DOM 참조에 `useRef`를 쓰는 이유는 무엇인가?
2. `IntersectionObserver`의 교차 비율 기준과 `isIntersecting`은 어떻게 다른가?
3. 프로젝트가 4개일 때 각 카드의 각도는 어떻게 구하는가?
4. 왜 카드에 역회전을 적용하는가?
5. ScrollTrigger의 `scrub`와 일반 애니메이션 시간은 어떻게 다른가?
6. 화면 중앙 정렬과 앵커 기본 이동은 왜 다른 결과를 만들 수 있는가?
7. Geometry, Material, Mesh의 관계를 설명하라.
8. HDR 환경과 장면 배경의 차이는?
9. 왜 `clone()` 후 공유 Material을 수정할 때 조심해야 하는가?
10. 유리 상자에 `depthWrite: false`를 사용한 이유는?
11. `lerp(current, target, 0.05)`에서 0.05의 의미는?
12. 매 프레임 고정 회전량의 문제와 개선책은?
13. React 컴포넌트가 사라질 때 어떤 자원을 정리해야 하는가?
14. Subgrid 실험에서 왜 타이포그래피가 아래로 이동했는가?
15. 길이가 긴 Projects 섹션에서 중앙 기준 Scroll Spy가 유용한 이유는?

### 정답 키워드

1. 값 보존, DOM 접근, 불필요한 렌더링 방지. 2. 면적 비율 경계와 실제 교차 여부. 3. `index * 360 / N` (0/90/180/270). 4. 회전축을 따라 이동하면서 카드 방향 유지. 5. 스크롤 진행률과 타임라인 진행률 연결. 6. 정렬 기준, sticky 헤더 및 스크롤 여백. 7. 형태 + 재질 = 렌더링 가능한 객체. 8. 반사·조명 환경과 화면 배경. 9. 복제 객체가 원본 재질 참조를 공유할 수 있음. 10. 투명 패널이 뒤쪽 물체의 깊이 기록을 가리는 문제 완화. 11. 남은 거리의 5% 접근. 12. 주사율 의존, delta time. 13. RAF, Observer, 이벤트, GPU 자원, 캔버스. 14. 높은 공유 행과 정렬 방식, 최소 높이 누락. 15. 대상 전체 면적이 아닌 뷰포트 내 위치로 판별하기 때문.

---

## 26. 코드 분석 및 실습 문제

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

### 확장 실습 (향후 개선안)

- 프로젝트 수를 0, 1, 5개로 바꾸고 카운터 및 스냅 가드를 검증한다.
- Hero 화면 표시 중 모션 설정을 변경하고 change 이벤트 처리 및 cleanup을 설계한다.
- HDR 로드 실패와 WebGL context lost의 복구 방안을 구분한다.
- 모바일 화면, Tab 탐색, 브라우저 확대, 이미지 alt를 확인한다.
- lint/build/preview 후 실제 배포 사이트와 비교한다.

### 출시 후 체크리스트

- [x] 4개 프로젝트 이미지, Contact, Scroll Spy 구현
- [x] 성능 및 reduced-motion 대응 기능 구현
- [x] Cloudflare Pages 배포와 dev.hexha.org 접속 확인(개발 대화 기준)
- [x] 대소문자 및 WAF 충돌 해결
- [ ] 최종 포트폴리오 배포본 lint/build 및 모바일·키보드 점검
- [ ] 최신 배포본 Lighthouse 재측정
- [ ] Hero 모션 설정 실시간 변경, WebGL 실패 및 HDR 로드 실패 테스트
- [ ] 이미지 대체 텍스트를 프로젝트별 영어 설명으로 개선할지 검토
- [ ] HDR 등 외부 자산 라이선스와 출처 확인

핵심: 코드를 암기하는 것보다 문제를 재현하고 원인·근거·선택 이유를 설명할 수 있어야 한다.

---

# 부록. 초기 Trefoil 실험 코드 (학습 기록, 최종 구현 아님)

```ts
/*
 * Three.js Experiment
 * Procedural Trefoil Knot + ExtrudeGeometry
 *
 * Vector3, CatmullRomCurve3, Vector2, Shape,
 * ExtrudeGeometry, EdgesGeometry 실습
 *

const points: THREE.Vector3[] = [];
const pointCount = 48;

for (let i = 0; i < pointCount; i++) {
  const angle = (i / pointCount) * Math.PI * 2;
  const radius = 1.5 + Math.cos(angle * 3) * 0.4;

  const x = Math.cos(angle * 2) * radius;
  const y = Math.sin(angle * 3) * 0.5;
  const z = Math.sin(angle * 2) * radius;

  points.push(new THREE.Vector3(x, y, z));
}

const curve = new THREE.CatmullRomCurve3(points, true);

const shapePoints: THREE.Vector2[] = [
  new THREE.Vector2(-0.2, -0.15),
  new THREE.Vector2(0.2, -0.15),
  new THREE.Vector2(0.2, 0.15),
  new THREE.Vector2(-0.2, 0.15),
];

const shape = new THREE.Shape(shapePoints);

const geometry = new THREE.ExtrudeGeometry(shape, {
  extrudePath: curve,
  steps: 120,
  bevelEnabled: false,
});

// 별도 대체 실험: const geometry = new THREE.TorusGeometry(1.5, 0.15, 32, 96);

const edges = new THREE.EdgesGeometry(geometry, 45);

const material = new THREE.LineBasicMaterial({
  color: 0x171717,
});

const mesh = new THREE.LineSegments(edges, material);

// Cleanup
geometry.dispose();
edges.dispose();
material.dispose();

*/
```

