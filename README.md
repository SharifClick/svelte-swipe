# svelte-swipe
Swipable items wrapper component for Svelte :fire: :boom: (zero dependencies - gzipped 3.37 KB)

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
  .is-center{
    display: flex;
    justify-content: center;
  }
  img{
    max-width: 100%;
    height: auto;
  }
</style>

<div class="swipe-holder">
  <Swipe {showIndicators} {autoplay} {delay} {transitionDuration}>
    <SwipeItem classes="is-center">
      <img src="./images/1.jpg" alt="">
    </SwipeItem>

    <SwipeItem classes="is-center">
      <img src="./images/2.jpg" alt="">
    </SwipeItem>

    <SwipeItem classes="is-center">
      <img src="./images/3.jpg" alt="">
    </SwipeItem>

    <SwipeItem classes="is-center">
      <img src="./images/4.jpg" alt="">
    </SwipeItem>
  </Swipe>
</div>

```
