# svelte-swipe
Svelte V3 Swipe 

## Installation

```bash
npm i svelte-swipe
```

## Usage

```html
<script>

  import { Swipe, SwipeItem } from "svelte-swipe";

  let autoplay = false;
  let delay = 1000; //ms
  let showIndicators = true;
  let transitionDuration = 200; //ms

</script>

<style>
   .swipe-holder{
    height: 30vh;
    width: 100%;
  }
  .is-center{
    display: flex;
    justify-content: center;
    border: 1px solid green;
    position: absolute;
    width: 99%;
    height: 100%;
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
