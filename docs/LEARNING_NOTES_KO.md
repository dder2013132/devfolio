# DEVFOLIO 개발 학습 노트 (한국어)

> 업데이트: 2026-11-19 | `devfolio(4).zip` 및 실제 배포 과정 기준. 1~28장은 개발 당시의 시행착오를 보존한 기록이다. 최신 구현·공식 배포·복습은 아래 최신 요약과 Part III(29~38장)를 기준으로 한다. 이번 문서 작업에서 빌드나 Lighthouse를 새로 실행한 것은 아니다.

## 최신 구현 빠른 요약

- 공개 주소: https://dev.hexha.org — Cloudflare Pages, GitHub main 자동 배포.
- `App` → Header / main(Hero → HeroGraphic, About, Projects → ProjectCard, Contact) / Footer.
- 데이터: `src/data/projects.ts`의 4개 프로젝트, `src/types/project.ts`의 `Project` 인터페이스(`img: string` 포함).
- Contact와 Scroll Spy는 구현 완료. 스크롤 이동은 `src/utils/scroll.ts`로 공통화.
- 3D 휠, 카드 스냅, `inert`, 모션 감소 시 세로 목록, WebGL 실패 대체 UI 구현.
- WebP 4장 약 78.3 KiB, HDR `/office-small.hdr`, Fontsource 로컬 폰트, DPR 1.5 상한, delta time, 오프스크린 렌더링 중지.
- 배포 시 이미지 경로 대소문자 및 기존 R2 WAF 규칙 충돌 해결. Favicon과 SEO 기본 메타데이터 포함.

### 학습 순서

첫 회독은 1~10장(React/TS/CSS), 두 번째는 14~27장(이벤트/3D), 세 번째는 29~38장(최종 구현/배포/면접). 옛 코드와 최종 코드가 다를 때는 Part III 및 실제 소스를 우선한다.

## 0. 학습 목표와 초기 진행 상황 (11월 11일 기록)

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

---

# Part II. 인터랙션과 3D 그래픽 (11월 12~18일)

## 14. 현재 구조와 역할 분리

```text
App
├── Header       : sticky, 섹션 내비게이션
├── Hero         : 타이포그래피, 소개, About 이동
│   └── HeroGraphic : WebGL 장면과 기술 캡션
├── About        : 소개, 기술 스택, 터미널 패널
├── Projects     : 스크롤 진행률과 3D 회전
│   └── ProjectCard × N
└── Footer       : Contact 정식 구현 예정
```

React는 DOM의 선언적 구성을 담당한다. Three.js와 GSAP은 브라우저의 그래픽 및 애니메이션을 명령형으로 제어한다. 이들을 연결하는 주요 수단이 `useRef`와 `useEffect`다.

## 15. useRef, useEffect, useState: 언제 무엇을 쓰는가?

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const [isVisible, setIsVisible] = useState(false);
```

- `useRef`: 렌더링 사이에 값을 보존한다. `ref.current` 변경만으로 React가 다시 렌더링되지는 않는다. DOM을 참조하거나 외부 라이브러리의 객체를 보관하기 좋다.
- `useState`: JSX에 영향을 주는 상태를 관리한다. 값이 변경되면 렌더링이 예약된다.
- `useEffect`: 렌더링 이후 외부 시스템과 연결하고 연결을 해제한다. 빈 의존성 배열은 마운트 기반의 설정에 사용하지만 개발 모드 StrictMode에서는 설정-정리-설정이 추가로 실행될 수 있다.

Three.js의 매 프레임 회전값을 React State에 저장하지 않은 이유는 UI 트리 전체를 매 프레임 다시 계산할 필요가 없기 때문이다.

## 16. About: IntersectionObserver와 진입 애니메이션

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

## 17. Projects: 가상의 회전축과 CSS 3D

프로젝트는 평면 슬라이더가 아니라 X축을 중심으로 돌아가는 물레방아를 구성한다.

```tsx
const angle = index * (360 / projects.length);
// 바깥: 공간상의 위치
transform: `rotateX(${angle}deg) translateZ(var(--wheel-radius))`
// 안쪽: 카드 자체의 방향
transform: `rotateX(${-angle}deg)`
```

4개라면 각도는 0°, 90°, 180°, 270°다. `translateZ`가 회전축에서 떨어진 거리를 만들고 `rotateX`가 위치를 회전시킨다. CSS 변환의 순서는 중요하다. 안쪽 요소의 역회전은 카드가 읽기 쉬운 방향을 유지하게 한다. `perspective`는 원근감을, `transform-style: preserve-3d`는 자식의 3D 배치를 보존한다.

## 18. GSAP / ScrollTrigger: 스크롤로 시간을 제어하기

```tsx
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "bottom bottom",
    scrub: 0.3,
    markers: false,
  },
});
tl.to(wheelRef.current, { rotationX: 270, duration: 8, ease: "none" });
tl.to({}, { duration: 1 });
```

- `trigger`: 스크롤 기준 엘리먼트.
- `start`/`end`: 요소와 뷰포트 사이의 정렬 조건으로 진행 범위를 결정한다.
- `scrub: 0.3`: 애니메이션 진행률을 스크롤에 연결하면서 따라오는 시간을 준다.
- `ease: "none"`: 회전 진행률이 선형적으로 증가한다.
- 빈 객체의 후속 tween: 회전이 끝난 상태에서 추가 스크롤 여유를 만든다.

스크롤 연결 시 `duration: 8`은 실제로 반드시 8초가 걸린다는 의미가 아니라 타임라인 내 비율을 결정한다. 회전값 270°는 네 카드 배치를 전제로 조정한 값이므로 카드 수가 달라질 때 검증해야 한다. 일반화 후보는 `360 - 360 / projects.length`이며 회전 방향과 마지막 카드 순서도 확인해야 한다.

### 깊이 계산과 클릭 제어

```ts
const totalAngle = angle + rotation;
const radian = totalAngle * Math.PI / 180;
const depth = Math.cos(radian);
const opacity = gsap.utils.mapRange(-1, 1, 0.15, 1, depth);
```

`cos` 결과는 -1~1이다. 앞쪽(1)은 불투명하게, 뒤쪽(-1)은 흐리게 표시한다. 실제 코드의 `pointerEvents: depth >= 0.95 ? "auto" : "none"`은 앞쪽 카드만 포인터 클릭을 받게 한다. 단, `pointer-events: none`만으로 키보드 포커스가 차단되지는 않는다. 비활성 카드의 링크 접근성은 별도 점검이 필요하다.

## 19. 스크롤 정렬, sticky 헤더와 진입 스냅

기존 문제: About으로 이동하는 경로마다 최종 위치가 달랐다. Hero 버튼은 중앙, Header 링크는 조금 위, 휠로 이동하면 Projects가 일부 보였다.

```tsx
event.preventDefault();
document.getElementById("About")?.scrollIntoView({
  behavior: "smooth",
  block: "center",
});
```

`preventDefault()`는 앵커의 기본 이동을 막는다. `block: "center"`는 세로 방향 가운데 정렬을 요청한다. Hero와 Header에서 동일한 호출을 사용해 명시적인 이동의 기준을 통일했다. 사용자의 일반 휠 스크롤은 강제로 위치를 수정하지 않기로 결정했다. `scroll-padding`은 스크롤 컨테이너의 정렬 여백이고 `scroll-margin`은 대상 요소의 정렬 여백이므로 헤더 가림을 조정할 때 구분해서 사용한다.

Projects는 별도 진입 스냅을 가진다. `window.scrollY`의 이전 값으로 아래 방향 여부를 판단하고, ScrollTrigger의 `scrollEnd`에서 섹션 상단까지 남은 거리(`getBoundingClientRect().top`)가 1px보다 크고 화면 높이의 3% 이내이면 `scrollBy`로 이동한다. 모든 섹션을 강제로 스냅시키는 것과 다르다. 카드별 90% 스냅은 이 코드로 구현됐다고 볼 수 없다.

## 20. Three.js의 기본 구조

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
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
camera.position.z = 9;
container.appendChild(renderer.domElement);
```

카메라 생성자의 인자는 시야각(도), 가로세로 비율, near, far다. 카메라가 멀어지면 일반적으로 화면에 보이는 물체가 작아진다. `alpha: true`여도 `scene.background`에 불투명한 색을 지정하면 배경이 표시된다.

## 21. 절차적 Geometry: 모양을 수학으로 만드는 방법

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

## 22. 금속, HDR, 유리 표현

금속은 `MeshStandardMaterial`의 높은 `metalness`와 낮은 `roughness`로 표현한다. HDR 환경 텍스처는 여러 방향의 빛 정보를 반사에 제공한다.

```ts
hdrLoader.load("/office.hdr", (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
});
```

`scene.environment`는 물리 기반 재질의 환경광과 반사에 영향을 준다. `scene.background`와 다른 개념이다.

유리 상자는 얇은 `BoxGeometry(6, 6, 0.06)`를 여섯 개 복제해 구성했다. 중심으로부터 `boxSize / 2 - glassThickness / 2`만큼 양·음의 X/Y/Z 방향으로 이동하고 옆면과 윗면은 90° 회전시킨다. 처음 앞면과 뒷면을 같은 +Z 위치에 둬 유리 한 장처럼 보였던 문제를 해결했다.

최종 재질은 `MeshPhysicalMaterial`의 `transparent: true`, `opacity: 0.12`, `clearcoat: 1`, `depthWrite: false`, `transmission: 0`을 사용한다. 즉 실제 굴절 중심의 유리가 아니라 투명도와 광택, 연한 청록색 모서리로 유리의 인상을 만든 표현이다. `EdgesGeometry`와 `LineSegments`로 각 패널의 윤곽을 표시한다. 여러 투명 패널의 겹침이나 정렬 문제는 남을 수 있다.

## 23. 포인터 인터랙션, 보간, 렌더링 루프

```ts
mouseX = (event.clientX / window.innerWidth) * 2 - 1;
mouseY = (event.clientY / window.innerHeight) * 2 - 1;
targetPosition.set(mouseX * 0.5, -mouseY * 0.5, 0);
group.position.lerp(targetPosition, 0.05);
glass.position.copy(group.position);
```

좌표를 -1~1로 정규화하고 Y를 반전하여 3D 좌표에 맞춘다. `lerp`는 현재값에서 목표값까지 일정 비율만큼 이동하는 선형 보간이다. 매 프레임 5%씩 접근하므로 포인터 위치를 바로 대입하는 것보다 부드럽다. 유리 Group 회전에도 `MathUtils.lerp`를 적용했다.

`requestAnimationFrame`은 다음 화면 갱신 시점에 콜백을 요청한다. `group.rotation.x += 0.003` 같은 프레임당 증가 방식은 모니터 주사율에 따라 실제 속도가 달라질 수 있다. 향후 시간 간격(delta time)을 적용하고 화면 밖 Hero 렌더링을 중지하는 것이 최적화 과제다.

## 24. ResizeObserver와 GPU 자원 정리

캔버스 컨테이너가 변하면 카메라의 `aspect`를 업데이트하고 `updateProjectionMatrix()`를 실행한다. `renderer.setSize(width, height, false)`는 CSS 크기 변경 없이 렌더러 크기를 갱신한다. `setPixelRatio(Math.min(window.devicePixelRatio, 2))`는 고밀도 화면의 선명도와 GPU 부담을 절충한다. DPR 2는 같은 CSS 너비·높이에서 픽셀 수를 약 4배로 만든다.

정리 함수에서는 다음 자원을 해제한다.

- `cancelAnimationFrame(animationId)`
- `resizeObserver.disconnect()`와 `removeEventListener`
- Geometry, Material, Texture의 `dispose()` (공유 자원은 한 번만)
- `scene.environment = null`, `renderer.dispose()`, 캔버스 제거

HDR 로딩은 비동기라 언마운트 이후 콜백이 실행될 수 있다. `disposed` 플래그를 확인해 늦게 도착한 텍스처도 해제한다. DOM만 제거한다고 WebGL 자원이 모두 자동 해제되는 것은 아니다.

## 25. Hero 레이아웃 실패에서 배운 것: Flexbox와 Grid

기존 레이아웃에서는 왼쪽 타이포그래피와 오른쪽 그래픽 전체를 `align-items: center`로 배치했다. 양쪽 구분선을 정확히 일치시키기 위해 `subgrid` 실험을 했지만, 450px 캔버스가 공유 행 높이에 영향을 줘 타이포그래피가 내려갔다. `min-height: 75vh`도 수정 과정에서 누락됐다.

최종 결정은 Flexbox 복구였다. `heroHeading`과 `heroDetails`의 래퍼는 남겨두고, Hero는 `justify-content: space-between`, `align-items: center`, `min-height: 75vh`를 사용한다. 그래픽은 450px 폭과 `aspect-ratio: 1 / 1`의 캔버스를 가지며 좁은 화면에서는 세로 배치한다.

중요한 교훈: 시각적 균형과 수학적인 정렬은 동일하지 않다. 레이아웃을 변경하기 전에 DevTools에서 부모 크기, 자식의 실제 `getBoundingClientRect()`, Flex/Grid 축, margin/padding, computed style을 먼저 확인한다.

## 26. 헤더 디자인과 Scroll Spy (제안 단계)

Sticky 헤더의 위치와 기존 링크 동작은 유지하면서 번호, 모노스페이스 폰트, 오렌지 포인트, hover를 적용했다. Header와 Hero의 About 이동 동작은 동일하게 맞췄다. Projects는 기존 앵커 이동을 유지한다.

다음은 화면 중앙을 기준으로 활성 섹션을 찾는 방식이다. 최신 적용 소스 확인 전까지 완료 기능으로 간주하지 않는다.

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

`find()`는 조건에 맞는 첫 번째 요소를 반환하며 없으면 `undefined`다. `??`로 빈 문자열을 기본값으로 지정한다. Projects는 길이가 긴 스크롤 영역이므로 단순히 대상 면적 대비 50%의 교차 비율을 검사하면 감지되지 않을 가능성이 있다. `scroll`/`resize` 리스너의 정리, 필요시 프레임 단위 제한, `aria-current="location"` 적용을 검토한다. Contact가 실제 존재하지 않을 때는 링크 구현도 보류해야 한다.

## 27. 복습 문제: 설명할 수 있어야 내 기술이다

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

## 28. 다음 개발 및 학습 순서

- [ ] Scroll Spy 적용 결과와 헤더 모바일 크기 확인
- [ ] Contact 섹션 및 실제 연락처 링크 구현
- [ ] 프로젝트 스크린샷, 카드 수에 따른 휠 회전 검증
- [ ] Three.js 화면 밖 렌더링 및 delta time, 동작 감소 설정 대응
- [ ] 반응형 레이아웃, 키보드 탐색, 색상 대비 검증
- [ ] 전체 빌드·린트 실행 및 배포 검증

**핵심:** 포트폴리오는 외형만 보여주는 사이트가 아니다. React 상태와 DOM, 이벤트 처리, 좌표계, 그래픽 자원 수명, 라이브러리와 브라우저의 연결을 직접 실험한 결과물이다.

# Part III. 최종 구현과 배포 (11월 19일)

## 29. 최종 코드 지도: 책임을 분리하는 이유

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

## 30. 3D 휠 최종 수학과 Snap

```ts
const angleStep = 360 / projects.length;
const maxRotation = angleStep * (projects.length - 1);
```

4개면 90° 간격, 총 270° 회전이다. 휠은 양의 방향으로 돌기 때문에 전면 카드의 배열 인덱스는 0 → 3 → 2 → 1이다. `displayIndex`는 이를 진행 순서 1 → 2 → 3 → 4로 변환한다.

```ts
const index = (projects.length - Math.round(rotation / angleStep)) % projects.length;
const displayIndex = ((projects.length - activeIndex) % projects.length) + 1;
```

스크롤 전체의 8/9만 회전에 사용하고 나머지 1/9는 마지막 카드 유지 구간이다. 카드가 4개면 정지 지점은 0, 8/27, 16/27, 8/9. `snapTo`는 가장 가까운 지점과의 차이가 한 구간의 10% 이하일 때만 그 지점으로 이동한다. `progress >= 8/9`에서는 그대로 반환한다. 즉 항상 강제 스냅시키는 것이 아니다.

```ts
const step = 8 / 9 / (projects.length - 1);
const nearest = Math.round(progress / step) * step;
```

`useGSAP`에서 0~1개는 애니메이션 초기화를 생략한다. JSX는 빈 목록 메시지를 별도로 렌더링한다. 다만 빈 배열일 때 `displayIndex` 계산은 NaN이 되므로 데이터가 동적으로 변하는 기능을 추가할 때는 별도의 가드와 타임라인 재생성 의존성을 검토한다.

## 31. 접근성: 보여야 하는 것과 조작 가능한 것은 다르다

`depth = Math.cos(totalAngle * Math.PI / 180)`으로 앞뒤 위치를 판정한다. 깊이 0.95 이상만 조작 가능하도록 설정한다.

```ts
card.inert = !isInteractive;
gsap.set(card, { pointerEvents: isInteractive ? "auto" : "none" });
```

`pointer-events`는 마우스 이벤트를 제한하지만 Tab 탐색을 막지 못한다. `inert`는 비활성 하위 요소의 클릭과 포커스 및 접근성 트리 노출을 제한한다. Cleanup에서 반드시 `inert = false`로 되돌린다.

GSAP MatchMedia가 no-preference일 때만 타임라인을 생성하고, reduced-motion CSS가 sticky/3D 배치와 카운터를 해제해 세로 목록을 제공한다. `mm.revert()`로 모션 설정 변경 및 언마운트 시 정리한다. Header/Hero/Footer의 공통 스크롤 유틸리티는 `matchMedia`에 따라 instant 또는 smooth를 반환한다.

## 32. 시간 기반 애니메이션과 GPU 비용

```ts
const deltaTime = lastTime === null ? 0 : Math.min((currentTime - lastTime) / 1000, 0.1);
const alpha = 1 - Math.pow(0.95, deltaTime * 60);
group.rotation.x += 0.18 * deltaTime;
```

RAF 시간은 밀리초이므로 1000으로 나누어 초 단위로 변환한다. 0.18은 초당 회전 라디안이다. 60Hz에서 약 0.003씩, 120Hz에서 약 0.0015씩 증가하므로 초당 속도가 동일하다. 0.1초 상한은 긴 프레임 지연 후 갑자기 크게 움직이지 않게 한다(실제 시간과 완전히 일치시키기보다는 안정성을 우선).

`alpha`는 60Hz에서의 5% 보간을 다른 주사율에도 비슷하게 맞춘다. 두 번의 120Hz 보간을 거치면 남은 거리 비율이 0.95가 되는 구조다.

`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))`로 내부 해상도를 제한한다. CSS 크기 400×400일 때 DPR 1.5는 600×600, DPR 3은 1200×1200이다. 전자는 후자의 픽셀 수 1/4이다. 실제 GPU 시간은 셰이더·장면 복잡도에 따라서도 달라진다.

## 33. 렌더링 수명과 예외 처리

`IntersectionObserver`는 HeroGraphic이 뷰포트에 들어오면 RAF를 예약하고 나가면 취소한다. `animationId !== null` 가드는 중복 루프를 막고, 종료 시 `lastTime = null`로 이전 실행의 시간을 초기화한다. reduced-motion인 상태에서 시작하면 정적인 프레임만 그린다.

`try/catch`는 WebGLRenderer **생성 실패**를 처리하며 `hasError` 상태에 따라 `3D GRAPHICS UNAVAILABLE`이 나타난다. 전체 렌더링 오류를 모두 처리한다는 뜻은 아니다. HDR이 늦게 도착하면 `disposed` 플래그로 이미 해제된 장면에 적용하지 않고 텍스처를 폐기한다.

정리 순서: disposed 표시 → RAF 중단 → 옵저버·리스너 해제 → 환경·geometry·material 해제 → renderer 해제 → canvas 제거. StrictMode의 설정-정리-설정 사이클에서 이 순서가 특히 중요하다.

**검토 포인트:** HeroGraphic에는 motionQuery의 `change` 리스너가 없다. Projects는 즉시 모션 모드 전환을 처리하지만 Hero는 화면 진입/재진입 또는 새로고침 등에서 motionQuery를 읽는다. 지속 표시 중 설정을 바꿨을 때의 즉시 중지/재시작은 추가 확인 대상이다. HDR 로드 실패 및 WebGL context lost 복구도 현재 별도 처리하지 않는다.

## 34. 리소스 최적화와 Lighthouse

기존 PNG 총량 1,880.6 KiB(개발 기록) → 현재 WebP 80,190바이트 ≈ 78.3 KiB. 감소율은 `(1 - 78.3 / 1880.6) × 100 ≈ 95.8%`. HDR은 개발 기록상 1024×512에서 512×256으로 줄였고, 최종 파일 `/office-small.hdr`은 약 337.5 KiB다. WebP 사진 합계와 HDR 크기는 별개다.

`main.tsx`에서 Fontsource 패키지의 폰트를 import한다. Vite가 CSS와 폰트 파일을 번들에 포함하므로 Google Fonts CDN에 대한 별도의 외부 연결 의존성이 줄어든다. 외부 CDN 제거가 자동으로 모든 폰트 로딩 지연을 제거하지는 않는다.

Lighthouse는 성능·접근성·모범 사례·SEO를 자동 점검한다. 기존 Performance 95는 당시 측정값이고, 현재 사이트에서 재측정한 결과가 아니다. 특히 동일한 기기/네트워크 조건에서 비교해야 개선 효과를 판단할 수 있다. `index.html`의 title/description/favicon, `robots.txt`, 색 대비, heading, 반응형 CSS를 점검한다. `robots.txt`의 Allow는 색인 허용 의사 표현이지 색인 성공 보장이 아니다.

## 35. CI/CD: 로컬 개발에서 실제 인터넷까지

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

## 36. DNS, R2, WAF: 서로 다른 책임

| 구성 | 역할 |
| --- | --- |
| DNS | 호스트 이름을 서비스에 연결 |
| Pages | 정적 포트폴리오 파일 제공 |
| R2 | 기존 챗봇 이미지 저장 및 제공 |
| TLS | 전송 암호화 및 서버 인증 |
| WAF | HTTP 요청의 규칙 기반 차단 |

기존 apex `hexha.org`는 R2 이미지 서버로 사용 중이므로 연결을 삭제하지 않고 `dev.hexha.org`를 Pages에 연결했다. 그런데 보안 규칙이 호스트 전체에 적용되어 포트폴리오까지 차단됐다. 기본 pages.dev는 접속 가능했고 사용자 지정 도메인만 403이었으므로 배포 파일 자체 대신 DNS/보안 계층을 조사했다.

Security Analytics 이벤트에서 Ray ID, 호스트, 요청 경로, 차단 규칙을 확인했다. 기존 참조자(Referer) 허용 조건에 `http.host eq "hexha.org"`를 AND로 추가하여 이미지 보호 범위를 apex로 제한했다. 규칙 자체를 삭제하지 않고 문제의 범위를 수정한 사례다. Referer는 클라이언트가 위조하거나 생략할 수 있으므로 엄격한 인증 수단이 아니다. 영구적으로 사적 자원을 보호할 경우 서명 URL이나 인증 등을 고려한다.

## 37. 면접 대비: 답을 가리고 말하기

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

## 38. 출시 후 체크리스트

- [x] 4개 프로젝트 이미지, Contact, Scroll Spy 구현
- [x] 성능 및 reduced-motion 대응 기능 구현
- [x] Cloudflare Pages 배포와 dev.hexha.org 접속 확인(개발 대화 기준)
- [x] 대소문자 및 WAF 충돌 해결
- [ ] 최종 포트폴리오 배포본 lint/build 및 모바일·키보드 점검
- [ ] 최신 배포본 Lighthouse 재측정
- [ ] Hero 모션 설정 실시간 변경, WebGL 실패 및 HDR 로드 실패 테스트
- [ ] 이미지 대체 텍스트를 프로젝트별 영어 설명으로 개선할지 검토
- [ ] HDR 등 외부 자산 라이선스와 출처 확인

---

## 부록. 초기 Trefoil 실험 코드 (학습 기록, 최종 구현 아님)

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

const geometry = new THREE.TorusGeometry(1.5, 0.15, 32, 96);

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
