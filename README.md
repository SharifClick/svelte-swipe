# svelte-swipe

Swipable items wrapper component for Svelte :fire: :boom: (zero dependencies - 3.37 KB gzipped)

[View the demo.](https://sharifclick.github.io/svelte-swipe/)

## Installation

```bash
npm i svelte-swipe
```

## Usage

```html
<script>

  import { Swipe, SwipeItem } from "svelte-swipe"; // gzipped 3.37 KB

  let autoplay = false;
  let delay = 2000; //ms
  let showIndicators = true;
  let transitionDuration = 1000; //ms

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
  <Swipe {showIndicators} {autoplay} {delay} {transitionDuration}>
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

## Default css custom properties

```css

  :root{
    --sv-swipe-panel-height: inherit;
    --sv-swipe-panel-width: inherit;
    --sv-swipe-panel-wrapper-index: 2;
    --sv-swipe-indicator-active-color: grey;
  }

```
