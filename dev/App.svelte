<script>
  import { Swipe, SwipeItem } from "../src/index.js";
  let autoplay = false;
  let delay = 2000;
  let showIndicators = false;
  let transitionDuration = 200;
  
  function toggle(){
    autoplay = !autoplay;
  }

</script>

<style>
  :root{
    --sv-swipe-indicator-active-color:white;
  }
  .container{
    height: 100%;
    width: 100%;
  }
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

<div class="container" >
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
  <div style="margin: 100px 20px">
    <button on:click={toggle} >{autoplay ? 'Stop': 'Play'}</button><br>
    Show Indicators : <input type="checkbox" bind:checked={showIndicators}>
  </div>
</div>

