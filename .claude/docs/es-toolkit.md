# es-toolkit 사용 가이드

## 개요

`es-toolkit`은 Lodash를 대체하는 모던 JavaScript 유틸리티 라이브러리입니다.
최신 ECMAScript 기능을 활용하여 더 작은 번들 사이즈와 더 나은 타입 안정성을 제공합니다.

## 설치

```bash
pnpm add es-toolkit
```

## 주요 장점

1. **작은 번들 사이즈**: Lodash 대비 최대 97% 작은 번들
2. **트리 쉐이킹 지원**: 사용하는 함수만 번들에 포함
3. **타입 안정성**: TypeScript로 작성되어 완벽한 타입 지원
4. **최신 ECMAScript**: 최신 JS 문법 활용

## 자주 사용하는 함수

### 배열 유틸리티

```tsx
import { chunk, uniq, groupBy, partition, difference, intersection } from "es-toolkit";

// 배열 분할
chunk([1, 2, 3, 4, 5], 2); // [[1, 2], [3, 4], [5]]

// 중복 제거
uniq([1, 2, 2, 3, 3, 3]); // [1, 2, 3]

// 그룹화
groupBy([{ type: 'a', val: 1 }, { type: 'b', val: 2 }], (item) => item.type);
// { a: [{ type: 'a', val: 1 }], b: [{ type: 'b', val: 2 }] }

// 조건에 따라 분리
partition([1, 2, 3, 4], (n) => n % 2 === 0); // [[2, 4], [1, 3]]

// 차집합
difference([1, 2, 3], [2, 3]); // [1]

// 교집합
intersection([1, 2, 3], [2, 3, 4]); // [2, 3]
```

### 객체 유틸리티

```tsx
import { pick, omit, mapValues, merge, cloneDeep } from "es-toolkit";

const obj = { a: 1, b: 2, c: 3 };

// 특정 키만 선택
pick(obj, ['a', 'b']); // { a: 1, b: 2 }

// 특정 키 제외
omit(obj, ['c']); // { a: 1, b: 2 }

// 값 변환
mapValues(obj, (v) => v * 2); // { a: 2, b: 4, c: 6 }

// 깊은 병합
merge({ a: { b: 1 } }, { a: { c: 2 } }); // { a: { b: 1, c: 2 } }

// 깊은 복사
cloneDeep({ nested: { value: 1 } });
```

### 함수 유틸리티

```tsx
import { debounce, throttle, once, memoize } from "es-toolkit";

// 디바운스 (마지막 호출 후 지연 실행)
const debouncedSearch = debounce((query: string) => {
  console.log('Searching:', query);
}, 300);

// 스로틀 (일정 간격으로 실행)
const throttledScroll = throttle(() => {
  console.log('Scrolling');
}, 100);

// 한 번만 실행
const initialize = once(() => {
  console.log('Initialized');
});

// 메모이제이션
const expensiveCalc = memoize((n: number) => {
  return n * n;
});
```

### 문자열 유틸리티

```tsx
import { camelCase, snakeCase, kebabCase, capitalize } from "es-toolkit";

camelCase('hello world'); // 'helloWorld'
snakeCase('helloWorld'); // 'hello_world'
kebabCase('helloWorld'); // 'hello-world'
capitalize('hello'); // 'Hello'
```

### 숫자 유틸리티

```tsx
import { clamp, random, range, sum, mean } from "es-toolkit";

// 범위 제한
clamp(15, 0, 10); // 10

// 랜덤 숫자
random(1, 10); // 1~10 사이 정수

// 범위 배열 생성
range(0, 5); // [0, 1, 2, 3, 4]

// 합계
sum([1, 2, 3, 4]); // 10

// 평균
mean([1, 2, 3, 4]); // 2.5
```

### 타입 체크

```tsx
import { isNil, isEmpty, isEqual } from "es-toolkit";

isNil(null); // true
isNil(undefined); // true
isNil(0); // false

isEmpty([]); // true
isEmpty({}); // true
isEmpty(''); // true

isEqual({ a: 1 }, { a: 1 }); // true (깊은 비교)
```

## Lodash에서 마이그레이션

### Import 변경

```tsx
// Before (Lodash)
import _ from 'lodash';
_.debounce(fn, 300);

// After (es-toolkit)
import { debounce } from 'es-toolkit';
debounce(fn, 300);
```

### 주요 차이점

1. **기본 내보내기 없음**: es-toolkit은 named export만 지원
2. **일부 함수 이름 변경**: 대부분 동일하지만 일부 다름
3. **체이닝 없음**: `_.chain()` 패턴 없음, 함수 합성 사용

### 함수 합성 (체이닝 대체)

```tsx
// Lodash 체이닝
_.chain(arr)
  .filter(predicate)
  .map(transform)
  .value();

// es-toolkit (pipe 패턴)
import { filter, map, pipe } from 'es-toolkit';

pipe(
  arr,
  (arr) => filter(arr, predicate),
  (arr) => map(arr, transform)
);
```

## 프로젝트 사용 지침

1. **새 코드에서는 es-toolkit 사용**: 새로 작성하는 코드에서는 항상 es-toolkit 사용
2. **Lodash 금지**: lodash, lodash-es 설치/사용 금지
3. **트리 쉐이킹**: 전체 import 대신 개별 함수 import
4. **타입 활용**: TypeScript 타입 추론 적극 활용

## 참고 링크

- [es-toolkit 공식 문서](https://es-toolkit.slash.page/)
- [Lodash에서 마이그레이션 가이드](https://es-toolkit.slash.page/reference/compat.html)
