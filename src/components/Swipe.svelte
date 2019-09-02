<script>

  import { onMount, createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

  let activeIndicator = 0;
  let items = 0;
  let availableWidth = 0;
  let topClearence = 43;

  let elems;
  let diff = 0;

  let swipeWrapper;
  let swipeHandler;

  let min = 0;
  let touchingTpl = '-webkit-transition-duration: 0s;transition-duration: 0s;' + '-webkit-transform: translate3d(-{{val}}px, 0, 0);';
  let touchingTplMS = '-ms-transform: translate3d(-{{val}}px, 0, 0);';
  let non_touchingTpl = '-webkit-transition-duration: 0.1s;transition-duration: 0.2s;' + '-webkit-transform: translate3d(-{{val}}px, 0, 0);';
  let non_touchingTplMS = ' -ms-transform: translate3d(-{{val}}px, 0, 0);';
  let touching = false;
  let posX = 0;
  let dir = 0;
  let x;

  // $: maxWidth = swipeWrapper.querySelector('.swipeable-items');

   function update(){
    swipeHandler.style.top = topClearence + 'px';
    for (let i = 0; i < items; i++) {
      elems[i].style.transform = 'translate3d(' + (availableWidth * i) + 'px, 0, 0)';
    }
    diff = 0;
  }

  function init(){
    elems = swipeWrapper.querySelectorAll('.swipeable-item');
    items = elems.length;
    update();
    console.dir(availableWidth)
  }

  onMount(() => {
    availableWidth = swipeWrapper.querySelector('.swipeable-items').offsetWidth;
		init();
  });

  function moveHandler(e){
    console.log(e)
    if (touching) {
      e.stopImmediatePropagation();
      e.stopPropagation();

      
      let max = availableWidth;

      let _x = e.touches ? e.touches[0].pageX : e.pageX;
      let _diff = (x - _x) + posX;
      let dir = _x > x ? 0 : 1;
      if (!dir) { _diff = posX - (_x - x) }
      if (_diff <= (max * (items - 1)) && _diff >= min) {

        for (let i = 0; i < items; i++) {
          let template = i < 0 ? '{{val}}' : '-{{val}}';
          elems[i].style.cssText = touchingTpl.replace(template, (max * i) - _diff);
          elems[i].style.cssText += touchingTplMS.replace(template, (max * i) - _diff);
        }

        diff = _diff;
      }
     
    }
  }

  function endHandler(e) {
    e && e.stopImmediatePropagation();
    e && e.stopPropagation();
    e && e.preventDefault();

    let max = availableWidth;

    touching = false;
    x = null;


    
    let swipe_threshold = 0.85;
    


    window.removeEventListener('mousemove', moveHandler);
  }

  function touchStart(e){
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();

    let max = availableWidth;

    touching = true;
    x = e.touches ? e.touches[0].pageX : e.pageX;
    window.addEventListener('mousemove', moveHandler);
  }

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
  <div class="swipe-item-wrapper" bind:this={swipeWrapper}>
    <div class="swipeable-items">
      <div class="swipeable-slot-wrapper">
        <slot />
      </div>
    </div>
  </div>
  <div class="swipe-handler" bind:this={swipeHandler} on:mousedown={touchStart}></div>

</div>
