### **TRD: ‘하루살이 프로젝트’ 공식 아카이브 웹사이트**
**문서 버전:** 1.0
**작성일:** 2023년 10월 27일
**관련 PRD:** PRD Ver 1.0

---

#### **1. 개요 (Overview)**

본 문서는 PRD Ver 1.0에 명시된 ‘하루살이 프로젝트’ 공식 아카이브 웹사이트의 기능 및 비기능 요구사항을 기술적으로 구현하기 위한 지침을 정의한다. 본 TRD는 프로젝트에 사용될 기술 스택, 개발 환경, 코딩 컨벤션, 성능 표준, 그리고 배포 전략을 포함한다.

#### **2. 기술 스택 (Technology Stack)**

*   **프레임워크 (Framework):** **Next.js 14+**
    *   **선정 사유:** App Router를 활용하여 서버 컴포넌트와 클라이언트 컴포넌트를 유연하게 사용. 인터랙티브한 요소는 클라이언트 컴포넌트로, 정적인 콘텐츠는 서버 컴포넌트로 구성하여 최적의 성능을 확보한다. Vercel과의 완벽한 통합으로 효율적인 배포 파이프라인을 구축한다.
    *   **렌더링 전략:** 주요 콘텐츠 페이지(`readme.txt`, `images/` 등)는 **SSG (Static Site Generation)**를 통해 빌드 시점에 정적 HTML로 생성하여 빠른 로딩 속도를 보장한다. 동적인 상태 관리가 필요한 컴포넌트(음악 플레이어 등)는 클라이언트 사이드 렌더링(CSR)을 사용한다.

*   **프로그래밍 언어 (Language):** **TypeScript**
    *   **선정 사유:** 정적 타입 검사를 통해 코드의 안정성을 높이고, 컴포넌트의 props 타입을 명확히 하여 개발 과정에서의 오류를 최소화한다.

*   **스타일링 (Styling):** **Tailwind CSS**
    *   **선정 사유:** 유틸리티-우선(Utility-First) 접근법을 통해 PRD에 명시된 비정형적이고 커스텀한 "깨진 GUI" 디자인을 빠르고 일관성 있게 구현한다. `tailwind.config.js` 파일에 앨범의 컬러 팔레트, 커스텀 폰트, 애니메이션 효과 등을 사전에 정의하여 디자인 시스템을 구축한다.

*   **상태 관리 (State Management):** **Zustand** 또는 **Jotai**
    *   **선정 사유:** 음악 플레이어의 재생 상태, 열려있는 창(window) 목록 등 여러 컴포넌트에서 공유되어야 하는 글로벌 상태를 관리하기 위함. Redux보다 가볍고 API가 단순하여 프로젝트 규모에 적합하다.

*   **애니메이션 및 인터랙션 (Animation & Interaction):** **Framer Motion**
    *   **선정 사유:** 선언적인 API를 통해 PRD에 명시된 복잡한 동적 효과(창 드래그, 글리치, 페이드인/아웃 등)를 쉽게 구현할 수 있다. Next.js와의 호환성이 뛰어나다.

*   **코드 품질 관리 (Code Quality):** **ESLint** & **Prettier**
    *   **선정 사유:** 일관된 코드 스타일과 컨벤션을 강제하여 코드 가독성과 유지보수성을 높인다. `husky`와 `lint-staged`를 연동하여 Git 커밋 시점에 자동으로 코드 포맷팅 및 린트 검사를 실행한다.

#### **3. 개발 환경 및 인프라 (Environment & Infrastructure)**

*   **패키지 매니저 (Package Manager):** **pnpm** 또는 **Yarn**
    *   **선정 사유:** npm 대비 빠른 설치 속도와 효율적인 디스크 공간 활용.
*   **버전 관리 (Version Control):** **Git** & **GitHub**
    *   **브랜치 전략:** **Git Flow**를 간소화한 모델을 사용한다.
        *   `main`: 프로덕션(배포) 브랜치
        *   `develop`: 개발의 중심이 되는 브랜치
        *   `feature/기능-이름`: 각 기능 개발을 위한 브랜치 (`develop`에서 분기하여 `develop`으로 머지)
*   **호스팅 및 배포 (Hosting & Deployment):** **Vercel**
    *   **선정 사유:** GitHub 레포지토리와 연동하여 main 브랜치에 푸시될 때마다 자동으로 빌드 및 프로덕션 배포(CI/CD)를 수행한다. 각 PR에 대해 미리보기(Preview) 배포를 생성하여 코드 리뷰 및 테스트를 용이하게 한다.

#### **4. 주요 기능 구현 가이드라인**

*   **[ G-01-03 ] 로딩 애니메이션:**
    *   `_app.tsx` 또는 레이아웃 컴포넌트에서 로딩 상태를 관리한다.
    *   애니메이션은 CSS 애니메이션 또는 Framer Motion을 활용하여 구현하고, 부팅 텍스트는 배열에 저장 후 `useEffect`와 `setTimeout`을 이용해 순차적으로 렌더링한다.

*   **[ P-01 ] 드래그 가능한 창 (Draggable Windows):**
    *   Framer Motion의 `drag` prop을 활용하여 구현한다. 각 창의 위치(x, y), z-index, 열림/닫힘 상태는 Zustand 스토어에서 중앙 관리하여 작업 표시줄과 연동한다.

*   **[ P-03 ] 음악 플레이어:**
    *   오디오 제어는 `HTMLAudioElement` API를 직접 사용하거나, `react-player`와 같은 라이브러리를 활용한다.
    *   재생 상태(현재 시간, 전체 길이, 재생/일시정지 등)는 Zustand 스토어에서 관리하여 재생 바 및 다른 컴포넌트와 동기화한다.
    *   시각화 효과는 CSS 애니메이션과 `requestAnimationFrame`을 결합하여 구현한다.

*   **글리치 (Glitch) 효과:**
    *   CSS의 `clip-path`, `transform`, 그리고 `@keyframes`를 조합하여 구현한다.
    *   JavaScript를 이용해 랜덤성을 부여하여 호버할 때마다 다른 형태의 글리치 효과가 나타나도록 한다.

#### **5. 데이터 및 에셋 관리 (Data & Assets)**

*   **음원 파일:** 저작권 보호 및 스트리밍 최적화를 위해 Vercel에 직접 올리기보다 **SoundCloud**, **Bandcamp** 또는 **Vercel Blob** 같은 외부 스토리지/서비스에 업로드하고 API를 통해 스트리밍하는 방식을 권장한다. MVP 단계에서는 `/public` 폴더에 직접 포함하여 구현할 수 있다.
*   **이미지 및 텍스트:**
    *   `public/` 폴더 내에 체계적으로 정리한다. (예: `/public/images/artwork`, `/public/fonts`)
    *   이미지는 WebP 포맷으로 변환하고, Next.js의 `<Image>` 컴포넌트를 사용하여 최적화된 이미지를 제공한다.
    *   앨범 소개, 가사 등 텍스트 콘텐츠는 `json` 또는 `mdx` 파일로 관리하여 코드와 분리한다.

#### **6. 성능 목표 (Performance Goals)**

*   **Core Web Vitals:** 모든 페이지에서 'Good' 등급을 목표로 한다.
    *   **LCP (Largest Contentful Paint):** 2.5초 미만
    *   **FID (First Input Delay):** 100ms 미만
    *   **CLS (Cumulative Layout Shift):** 0.1 미만
*   **최적화 전략:**
    *   Next.js의 코드 스플리팅(Code Splitting)을 통해 초기 로딩 시 필요한 JavaScript만 불러온다.
    *   `React.lazy`와 `Suspense`를 활용하여 무거운 컴포넌트(예: 이미지 뷰어)를 지연 로딩한다.
    *   모든 이미지는 용량 최적화 후 제공한다.

#### **7. 테스트 전략 (Testing Strategy)**

*   **단위/통합 테스트:** Jest와 React Testing Library를 사용하여 주요 컴포넌트 및 커스텀 훅의 기능이 의도대로 동작하는지 테스트한다.
*   **E2E 테스트 (선택사항):** Cypress 또는 Playwright를 사용하여 사용자의 주요 시나리오(예: "웹사이트 접속 후 음악을 재생하고 가사를 본다")가 정상적으로 작동하는지 자동화 테스트를 구성할 수 있다.
*   **크로스 브라우징 테스트:** BrowserStack과 같은 서비스를 이용하여 주요 브라우저(Chrome, Safari, Firefox)의 최신 버전에서 UI가 깨지지 않는지 확인한다.