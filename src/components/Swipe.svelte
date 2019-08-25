<script>

</script>

<style>
:root{
  --header-height: 50px;
}
.swipe-panel {
  position: relative;
}
.swipe-item-wrapper{
  overflow: hidden;
  position: relative;
  height: calc(45vh - var(--header-height));
}
</style>

<div class="swipe-panel">
  <div class="swipe-item-wrapper">
    <div class="swipeable-items">
      <div class="swipeable-slot-wrapper">
        <slot />
      </div>
    </div>
  </div>
  <div class="swipe-handler"></div>

</div>
