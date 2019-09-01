<script>

  let activeIndicator = 0;
  let items = 0;
  let availableWidth = 0;
  let topClearence = 43;

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

.swipe-handler {
    width: 100%;
    position: absolute;
    top: 40px;
    bottom: 40px;
    left: 0;
    right: 0;
    background: rgba(0,0,0,0.01);
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
