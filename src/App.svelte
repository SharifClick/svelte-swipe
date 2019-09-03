<script>
  import Swipe from "./components/Swipe.svelte";
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

<Swipe showIndicators={true}>
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
