<script>
  import Swipe from "../src/Swipe.svelte";
  let play_slider = false;
  let play_delay = 1000;
  
  function toggle(){
    play_slider = !play_slider;
  }

</script>

<style>
  :root{
    --sv-swipe-panel-height: 600px;
    --sv-swipe-panel-width: 100vw;
    --sv-swipe-indicator-active-color:white;
  }
  .container{
    height: 100%;
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
    height: 100%;
    width: 100%;
  }
</style>

<div class="container" >
  <Swipe showIndicators={true} autoplay={play_slider} delay={play_delay}>
    <div class="swipeable-item is-center">
      <img src="./images/1.jpg" alt="">
    </div>

    <div class="swipeable-item is-center">
      <img src="./images/2.jpg" alt="">
    </div>

    <div class="swipeable-item is-center">
      <img src="./images/3.jpg" alt="">
    </div>

    <div class="swipeable-item is-center">
      <img src="./images/4.jpg" alt="">
    </div>
  </Swipe>
  <div style="margin-top: 100px">
    <button on:click={toggle} >{play_slider ? 'Stop': 'Play'}</button>
    <input type="text" bind:value={play_delay} />
  </div>
</div>

