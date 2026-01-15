# overlay-kit 사용 가이드

## 개요

`overlay-kit`은 오버레이 컴포넌트(Dialog, BottomSheet, Modal 등)를 선언적으로 관리하기 위한 라이브러리입니다.
기존 Toss의 `@toss/use-overlay`에서 발전한 버전입니다.

## 설치

```bash
pnpm add overlay-kit
```

## 설정

`providers.tsx`에서 `OverlayProvider`를 추가합니다 (이미 설정됨):

```tsx
import { OverlayProvider } from "overlay-kit";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <OverlayProvider>
      {children}
    </OverlayProvider>
  );
}
```

## 사용법

### 기본 사용

```tsx
import { overlay } from "overlay-kit";

// 오버레이 열기
overlay.open(({ isOpen, close, unmount }) => (
  <Dialog open={isOpen} onClose={close} onExited={unmount}>
    <DialogContent>Hello World</DialogContent>
  </Dialog>
));
```

### Promise와 함께 사용 (Confirm/Prompt 패턴)

```tsx
import { overlay } from "overlay-kit";

// Confirm 다이얼로그
async function confirmDelete() {
  const confirmed = await new Promise<boolean>((resolve) => {
    overlay.open(({ isOpen, close }) => (
      <ConfirmDialog
        open={isOpen}
        onConfirm={() => {
          resolve(true);
          close();
        }}
        onCancel={() => {
          resolve(false);
          close();
        }}
      />
    ));
  });

  if (confirmed) {
    // 삭제 로직
  }
}

// Prompt 다이얼로그
async function promptUserName() {
  const name = await new Promise<string | null>((resolve) => {
    overlay.open(({ isOpen, close }) => (
      <PromptDialog
        open={isOpen}
        onConfirm={(value) => {
          resolve(value);
          close();
        }}
        onCancel={() => {
          resolve(null);
          close();
        }}
      />
    ));
  });

  return name;
}
```

### 유틸리티 함수 패턴 (권장)

```tsx
// lib/overlay.ts
import { overlay } from "overlay-kit";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { PromptDialog } from "@/components/common/PromptDialog";

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <ConfirmDialog
        open={isOpen}
        onConfirm={() => {
          resolve(true);
          close();
        }}
        onCancel={() => {
          resolve(false);
          close();
        }}
        onExited={unmount}
        {...options}
      />
    ));
  });
}

interface PromptOptions {
  title: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export function prompt(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    overlay.open(({ isOpen, close, unmount }) => (
      <PromptDialog
        open={isOpen}
        onConfirm={(value) => {
          resolve(value);
          close();
        }}
        onCancel={() => {
          resolve(null);
          close();
        }}
        onExited={unmount}
        {...options}
      />
    ));
  });
}

// 사용 예시
const confirmed = await confirm({
  title: "삭제 확인",
  description: "정말 삭제하시겠습니까?",
  variant: "destructive",
});
```

## API Reference

### overlay.open()

```tsx
overlay.open(({ isOpen, close, unmount }) => ReactNode);
```

- **isOpen**: 오버레이가 열려있는지 여부 (boolean)
- **close()**: 오버레이를 닫음 (isOpen을 false로)
- **unmount()**: 오버레이를 DOM에서 제거

### overlay.close()

현재 열린 오버레이를 닫습니다.

### overlay.closeAll()

모든 오버레이를 닫습니다.

## 주의사항

1. **close와 unmount 분리**: 애니메이션이 있는 경우 `close()`로 닫고, 애니메이션 완료 후 `onExited`에서 `unmount()`를 호출해야 합니다.

2. **여러 오버레이 지원**: `overlay.open()`을 여러 번 호출하면 여러 오버레이가 쌓입니다.

3. **Promise 패턴**: 사용자 입력이 필요한 경우 Promise로 감싸서 async/await 패턴으로 사용합니다.

## 기존 패턴과의 비교

### Before (Zustand 방식)
```tsx
// 훅에서 상태 관리
const { confirm } = useConfirmDialog();
const confirmed = await confirm({ title: "확인" });
```

### After (overlay-kit 방식)
```tsx
// 직접 호출
import { confirm } from "@/lib/overlay";
const confirmed = await confirm({ title: "확인" });
```

**장점:**
- 훅 없이 어디서나 호출 가능 (서버 액션, 유틸 함수 등)
- 전역 상태 불필요
- 더 직관적인 API
