# Svelte Swipe
<p>
  <a href="https://www.npmjs.com/package/svelte-swipe"><img  src="https://img.shields.io/npm/v/svelte-swipe?style=for-the-badge"/></a>
  <a href="https://www.npmjs.com/package/svelte-swipe">
    <img src="https://img.shields.io/npm/dm/svelte-swipe?style=for-the-badge"/>
  </a>
  <a href="https://bundlephobia.com/result?p=svelte-swipe">
    <img src="https://img.shields.io/bundlephobia/min/svelte-swipe?style=for-the-badge"/>
  </a>

  <a href="https://bundlephobia.com/result?p=svelte-swipe">
    <img src="https://img.shields.io/bundlephobia/minzip/svelte-swipe?style=for-the-badge"/>
  </a>
  <a href="https://svelte.dev"><img  src="https://img.shields.io/badge/svelte-v3-blueviolet?style=for-the-badge"/></a>
</p>

[English](README.md) / [Korean](README_KO.md)

Swipable items wrapper component for Svelte :fire: :boom: (zero dependencies - 3.37 KB gzipped)

## 🚀[See it in Action](https://sharifclick.github.io/svelte-swipe/)


## Installation

```bash
npm i -D svelte-swipe
```

## Usage

```html
<script>

  import { Swipe, SwipeItem } from "svelte-swipe";

  const swipeConfig = {
    autoplay: false,
    delay: 2000,
    showIndicators: true,
    transitionDuration: 1000,
    defaultIndex: 0,
  };
</script>

<style>
  .swipe-holder{
    height: 30vh;
    width: 100%;
  }
  img{
    max-width: 100%;
    height: auto;
  }
</style>

<div class="swipe-holder">
  <Swipe {...swipeConfig}>
    <SwipeItem>
      <img src="./images/1.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/2.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/3.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/4.jpg" alt="">
    </SwipeItem>
  </Swipe>
</div>

```
### Vertical Swipe 🔥

```html

<div class="swipe-holder">
  <Swipe is_vertical={true}>
    <SwipeItem>
      ...
    </SwipeItem>
    ...
  </Swipe>
</div>
```

### Pointer event inside Swipe Item

```html
<style>
   ...

  .has-pointer-event{
    pointer-events:fill;
  }
</style>

<div class="swipe-holder">
  <Swipe>
    <SwipeItem>
      <div>
        <button class="has-pointer-event" on:click={sayHi}>Say Hi</button>
      </div>
    </SwipeItem>
    ...
  </Swipe>
</div>

```


### Programmatically change slides 

```html

<script>
  let SwipeComp;

  function nextSlide(){
   SwipeComp.nextItem()
  }

  function prevSlide(){
    SwipeComp.prevItem()
  }

</script>
<div class="swipe-holder">
  <Swipe bind:this={SwipeComp}>
    <SwipeItem>....</SwipeItem>
    ...
  </Swipe>
</div>
<div class="buttons-holder">
  <button type="button" on:click={prevSlide}>Prev</button>
  <button type="button" on:click={nextSlide}>Next</button>
</div>
```

### Supports custom thumbnail
## 🚀[See example with custom thumbnail](https://svelte.dev/repl/be477862ac8b4dfea4c8e454e556ef2c?version=3.20.1)
```html

<script>
  let SwipeComp;

  function changeSlide(i){
    SwipeComp.goTo(i)
  }

</script>
<div class="swipe-holder">
  <Swipe bind:this={SwipeComp}>
    <SwipeItem>....</SwipeItem>
    ...
  </Swipe>
</div>

```

## Default css custom properties

```css

  :root{
    --sv-swipe-panel-height: inherit;
    --sv-swipe-panel-width: inherit;
    --sv-swipe-panel-wrapper-index: 2;
    --sv-swipe-indicator-active-color: grey;
    --sv-swipe-handler-top: 0px;
  }

```

## Config Props

| Name | Type | Description | Required | Default |
| --- | --- | --- | --- | --- |
| `is_vertical` | `Boolean` | allow swipe items vertically | No | `false` |
| `direction_reverse` | `Boolean` | reverse swipe sliding direction  | No |`false` |
| `autoplay` | `Boolean` | Play items as slide | No | `false` |
| `showIndicators` | `Boolean` | appears clickable circle indicators bottom center of item | No | `false` |
| `transitionDuration` | `Number` | staying duration of per slide/swipe item | No | `200` *ms |
| `delay` | `Number` | transition delay | No | `1000` *ms |
| `defaultIndex` | `Number` | initial item index | No |`0` |

## NPM Statistics

Download stats for this NPM package

[![NPM](https://nodei.co/npm/svelte-swipe.png)](https://nodei.co/npm/svelte-swipe/)

### Scan qr code to see url in your device

![demo-url](https://github.com/SharifClick/svelte-swipe/blob/master/docs/images/url-code.png)
