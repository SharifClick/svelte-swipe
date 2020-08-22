# Svelte Swipe

[![NPM version](https://img.shields.io/npm/v/svelte-swipe.svg?style=flat)](https://www.npmjs.com/package/svelte-swipe) [![NPM downloads](https://img.shields.io/npm/dm/svelte-swipe.svg?style=flat)](https://www.npmjs.com/package/svelte-swipe) [![Svelte v3](https://img.shields.io/badge/svelte-v3-blueviolet.svg)](https://svelte.dev)

Svelte의 스와이프 가능한 wrapper 컴포넌트 :fire: :boom: (의존성 없음 - 3.37 KB gzipped)

## 🚀[동작 예시 보기](https://sharifclick.github.io/svelte-swipe/)

## 설치

```bash
npm i svelte-swipe
```

## 사용

```html
<script>
  import { Swipe, SwipeItem } from "svelte-swipe"; // gzipped 3.37 KB

  const swipeConfig = {
    autoplay: false,
    delay: 2000,
    showIndicators: true,
    transitionDuration: 1000,
    defaultIndex: 0,
  };
</script>

<style>
  .swipe-holder {
    height: 30vh;
    width: 100%;
  }
  img {
    max-width: 100%;
    height: auto;
  }
</style>

<div class="swipe-holder">
  <Swipe {...swipeConfig}>
    <SwipeItem>
      <img src="./images/1.jpg" alt="" />
    </SwipeItem>

    <SwipeItem>
      <img src="./images/2.jpg" alt="" />
    </SwipeItem>

    <SwipeItem>
      <img src="./images/3.jpg" alt="" />
    </SwipeItem>

    <SwipeItem>
      <img src="./images/4.jpg" alt="" />
    </SwipeItem>
  </Swipe>
</div>
```

### 수직 스와이프 🔥

```html
<div class="swipe-holder">
  <Swipe is_vertical="{true}">
    <SwipeItem>
      ...
    </SwipeItem>
    ...
  </Swipe>
</div>
```

### 스와이프 항목 내부의 포인터 이벤트

```html
<style>
  ... .has-pointer-event {
    pointer-events: fill;
  }
</style>

<div class="swipe-holder">
  <Swipe>
    <SwipeItem>
      <div>
        <button class="has-pointer-event" on:click="{sayHi}">Say Hi</button>
      </div>
    </SwipeItem>
    ...
  </Swipe>
</div>
```

### 코드로 슬라이드 바꾸기

```html
<script>
  let SwipeComp;

  function nextSlide() {
    SwipeComp.nextItem();
  }

  function prevSlide() {
    SwipeComp.prevItem();
  }
</script>
<div class="swipe-holder">
  <Swipe bind:this="{SwipeComp}">
    <SwipeItem>....</SwipeItem>
    ...
  </Swipe>
</div>
<div class="buttons-holder">
  <button type="button" on:click="{prevSlide}">Prev</button>
  <button type="button" on:click="{nextSlide}">Next</button>
</div>
```

## 기본 css 커스텀 값들

```css
:root {
  --sv-swipe-panel-height: inherit;
  --sv-swipe-panel-width: inherit;
  --sv-swipe-panel-wrapper-index: 2;
  --sv-swipe-indicator-active-color: grey;
}
```

## Config에 넘길 수 있는 인자

| Name                 | Type      | Description                                             | Required | Default     |
| -------------------- | --------- | ------------------------------------------------------- | -------- | ----------- |
| `is_vertical`        | `Boolean` | 수직 방향으로 swipe 여부                                | No       | `false`     |
| `autoplay`           | `Boolean` | 항목 자동 슬라이드 여부                                 | No       | `false`     |
| `showIndicators`     | `Boolean` | 중앙 하단에 클릭 가능한 원형의 인디케이터 표시 여부     | No       | `false`     |
| `transitionDuration` | `Number`  | 각 스와이프 아이템으로 넘어가는 데 걸리는 시간          | No       | `200` \*ms  |
| `delay`              | `Number`  | autoplay 활성화 시 다음 아이템으로 스와이프 하는 딜레이 | No       | `1000` \*ms |
| `defaultIndex`       | `Number`  | 가장 먼저 표시할 기본 항목의 인덱스                     | No       | `0`         |

## NPM 통계

이 NPM 패키지에 대한 통계 다운로드

[![NPM](https://nodei.co/npm/svelte-swipe.png)](https://nodei.co/npm/svelte-swipe/)

### QR 코드를 스캔하여 URL 확인

![데모-url](https://github.com/SharifClick/svelte-swipe/blob/master/docs/images/url-code.png)
