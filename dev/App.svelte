<script>
  import { Swipe, SwipeItem } from "../src/index.js";
  let autoplay = false;
  let delay = 2000;
  let showIndicators = false;
  let transitionDuration = 200;
  
  function toggle(){
    autoplay = !autoplay;
  }

  function testing(){
    console.log('hi')
  }

</script>

<style>
  :root{
    --sv-swipe-indicator-active-color:white;
  }
  .container, .is-stack{
    height: 100%;
    width: 100%;
  }
  .swipe-holder{
    height: 30vh;
    width: 100%;
  }
  .desc-holder{
    padding: 20px 20px;
  }

  .desc-holder h1{
    font-size: 3vh;
  }
  .is-center{
    display: flex;
    justify-content: center;
  }
  img{
    max-width: 100%;
    height: auto;
  }
  .has-event{
    pointer-events:fill;
  }
</style>

<div class="container" >
  <div class="desc-holder">
    <h1>Swipable items wrapper component for Svelte</h1>
  </div>
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
  <div class="desc-holder">
    <button on:click={toggle} >{autoplay ? 'Stop': 'Play'}</button><br>
    Show Indicators : <input type="checkbox" bind:checked={showIndicators}>
  </div>

  <hr>

  <div class="swipe-holder">
    <Swipe>
      <SwipeItem classes="is-center">
        <div class="is-stack" style="background:teal"></div>
      </SwipeItem>

      <SwipeItem classes="is-center">
        <div class="is-stack" style="background:yellowgreen"></div>
      </SwipeItem>

      <SwipeItem classes="is-center">
        <div class="is-stack" style="background:aqua"></div>
      </SwipeItem>

      <SwipeItem classes="is-center">
        <div class="is-stack" style="background:lightcoral"></div>
      </SwipeItem>
    </Swipe>
  </div>
</div>

