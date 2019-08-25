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
.swipeable-item {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  transition-timing-function: ease-out;
}
.swipeable-items,
.swipeable-slot-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
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
