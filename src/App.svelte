<script>
  import Swipe from "./components/Swipe.svelte";
  let play_slider = false;
  let play_delay = 1000;
  
  function toggle(){
    play_slider = !play_slider;
  }

</script>

<style>
  :root{
    --sv-swipe-panel-height: 100px;
    /* --sv-swipe-indicator-active-color:grey; */
  }
  .is-center{
    display: flex;
    justify-content: center;
    border: 1px solid green;
    position: absolute;
    width: 99%;
  }
</style>

<Swipe showIndicators={true} autoplay={play_slider} delay={play_delay}>
  <div class="swipeable-item is-center">
    <h1>Boo yeaah</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Nope :(</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Oops!</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Ouch!!!</h1>
  </div>
</Swipe>

<div style="margin-top: 100px">
  <button on:click={toggle} >{play_slider ? 'Stop': 'Play'}</button>
  <input type="text" bind:value={play_delay} />
</div>
