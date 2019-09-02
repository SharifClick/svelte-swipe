<script>
  import Swipe from "./components/Swipe.svelte";
</script>

<style>
  .is-center{
    display: flex;
    justify-content: center;
    border: 1px solid green;
  }
</style>

<Swipe>
  <div class="swipeable-item is-center">
    <h1>Boo yeaah</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Nope :(</h1>
  </div>
</Swipe>
