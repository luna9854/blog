# Toast UI Editor 리팩토링 계획

**생성일**: 2026-01-15
**최종 수정**: 2026-01-15
**상태**: 진행 중

---

## 개요

포스트 작성 시스템을 Toast UI Editor 기반 마크다운 에디터로 전환하고, 이미지 캐러셀을 외부 리스트(PostCard)로 이동합니다.

### 목표

1. Toast UI Editor (@toast-ui/react-editor) 설치 및 통합
2. 이미지 캐러셀을 PostCard(외부 목록)로 이동
3. 포스트 상세 페이지는 블로그 포스트처럼 마크다운 렌더링
4. 관리자 폼에서 마크다운 편집 기능 제공

### 변경 요약

| 현재 | 변경 후 |
|------|---------|
| PostCard: 단일 썸네일 이미지 | PostCard: 이미지 캐러셀 |
| PostDetail: 이미지 캐러셀 + 텍스트 | PostDetail: 마크다운 블로그 포스트 |
| TuiEditor: textarea placeholder | TuiEditor: 실제 Toast UI Editor |

---

## Phase 1: Toast UI Editor 설치 및 통합

**목표**: 실제 Toast UI Editor 패키지 설치 및 TuiEditor 컴포넌트 교체

### 작업 목록

- [ ] `@toast-ui/react-editor` 패키지 설치
- [ ] `TuiEditor.tsx` 컴포넌트를 실제 Toast UI Editor로 교체
- [ ] 다크모드 테마 적용
- [ ] 이미지 업로드 훅 연동 (Supabase Storage)

### Quality Gate

- [ ] 빌드 성공
- [ ] 관리자 포스트 작성 폼에서 에디터 표시
- [ ] 마크다운 입력/출력 동작 확인

---

## Phase 2: PostCard 캐러셀 이동

**목표**: PostCard에서 다중 이미지 캐러셀 표시

### 작업 목록

- [ ] PostCard 컴포넌트에 images prop 추가
- [ ] PostCard 내부에 미니 캐러셀 구현 (좌우 화살표, dot indicators)
- [ ] AuthorSection에서 PostCard에 images 전달
- [ ] 터치 스와이프 지원 (모바일)
- [ ] 캐러셀 이벤트 버블링 방지 (Link 클릭 방지)

### Quality Gate

- [ ] 빌드 성공
- [ ] 다중 이미지 포스트 카드에서 캐러셀 동작 확인
- [ ] 캐러셀 클릭 시 모달 열리지 않음 확인
- [ ] 카드 클릭 시 모달 정상 열림 확인

---

## Phase 3: PostDetail 마크다운 렌더링

**목표**: 포스트 상세 페이지를 블로그 포스트처럼 마크다운 렌더링

### 작업 목록

- [ ] `@toast-ui/react-editor` Viewer 컴포넌트 사용 또는 `react-markdown` 설치
- [ ] PostDetail/PostModal에서 ImageGallery 제거
- [ ] 마크다운 콘텐츠 렌더링 구현
- [ ] 마크다운 내 이미지 스타일링
- [ ] 코드 블록, 테이블 등 스타일링

### Quality Gate

- [ ] 빌드 성공
- [ ] 포스트 상세에서 마크다운이 HTML로 렌더링됨
- [ ] 이미지, 코드블록, 링크 등 정상 표시

---

## Phase 4: 정리 및 테스트

**목표**: 불필요한 코드 정리 및 전체 플로우 테스트

### 작업 목록

- [ ] PostDetail의 ImageGallery import 정리
- [ ] 사용하지 않는 props 제거
- [ ] 전체 플로우 테스트 (작성 → 목록 → 상세)
- [ ] 모바일 반응형 테스트

### Quality Gate

- [ ] 빌드 성공
- [ ] 포스트 작성 → 목록 표시 → 상세 확인 전체 플로우 동작
- [ ] 모바일/데스크탑 반응형 정상

---

## 기술 결정

| 결정 | 선택 | 이유 |
|------|------|------|
| 마크다운 에디터 | Toast UI Editor | 사용자 요청, WYSIWYG 지원, 이미지 업로드 훅 |
| 마크다운 뷰어 | Toast UI Viewer or react-markdown | 에디터와 일관성, 또는 가벼운 대안 |
| PostCard 캐러셀 | 커스텀 구현 | 기존 ImageGallery 로직 재사용 |

---

## 진행 상황

- [x] Phase 1: Toast UI Editor 설치 및 통합
- [x] Phase 2: PostCard 캐러셀 이동
- [x] Phase 3: PostDetail 마크다운 렌더링
- [ ] Phase 4: 정리 및 테스트
