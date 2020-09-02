<script>

  import { onMount, onDestroy } from 'svelte';


  export let transitionDuration = 200;
  export let showIndicators = false;
  export let autoplay = false;
  export let delay = 1000;
  export let defaultIndex = 0;

  export let active_item = 0; //readonly
  export let is_vertical = false;

  let activeIndicator = 0,
    indicators,
    total_elements = 0,
    availableSpace = 0,
    availableWidth = 0,
    topClearence = 0,
    swipeElements,
    availableDistance = 0,
    swipeWrapper,
    swipeHandler,
    pos_axis = 0,
    page_axis = is_vertical ? 'pageY' : 'pageX',
    dir = 0,
    axis;



  let played = defaultIndex || 0;
  let run_interval = false;

  function init(){
    swipeElements = swipeWrapper.querySelectorAll('.swipeable-item');
    total_elements = swipeElements.length;
    update();
  }

  function update(){
    swipeHandler.style.top = topClearence + 'px';
    let {offsetWidth, offsetHeight} = swipeWrapper.querySelector('.swipeable-total_elements');
    availableSpace = is_vertical ? offsetHeight : offsetWidth;
     [...swipeElements].forEach((element, i) => {
      element.style.transform = generateTranslateValue(availableSpace * i);
    });
    availableDistance = 0;
    availableWidth = availableSpace * (total_elements - 1)
    if(defaultIndex){
      changeItem(defaultIndex);
    }
  }


  $: indicators = Array(total_elements);

  $: {
    if(autoplay && !run_interval){
      run_interval = setInterval(changeView , delay);
    }

    if(!autoplay && run_interval){
      clearInterval(run_interval)
      run_interval = false;
    }
  }

  // helpers
  function eventDelegate(type) {
    let delegationTypes = {
      add: 'addEventListener',
      remove: 'removeEventListener'
    };
    if (typeof window !== 'undefined') {
      window[delegationTypes[type]]('mousemove', onMove);
      window[delegationTypes[type]]('mouseup', onEnd);
      window[delegationTypes[type]]('touchmove', onMove);
      window[delegationTypes[type]]('touchend', onEnd);
    }
  }

  function normalizeEventBehavior(e) {
    e && e.stopImmediatePropagation();
    e && e.stopPropagation();
    e && e.preventDefault();
  }

  function getTouchingPos(e){
   return  e.touches ? e.touches[0][page_axis] : e[page_axis]
  }

  function generateTranslateValue(value){
    return  is_vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
  }

  function generateTouchPosCss(value, touch_end = false){
    let transformString = generateTranslateValue(value);
    let _css = `
      -webkit-transition-duration: ${touch_end ? transitionDuration : '0'}ms;
      transition-duration: ${touch_end ? transitionDuration : '0'}ms;
      -webkit-transform: ${transformString};
      -ms-transform: ${transformString};`;
    return _css;
  }


  onMount(() => {
    init();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
    }
  });



  onDestroy(()=>{
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', update);
    }
  })



  let touch_active = false;

  function onMove(e){
    if (touch_active) {
      normalizeEventBehavior(e)

      console.log('moving')
      let _axis = getTouchingPos(e),
        distance = (axis - _axis) + pos_axis;

      if (distance <= availableWidth && distance >= 0) {
        [...swipeElements].forEach((element, i) => {
          element.style.cssText = generateTouchPosCss((availableSpace * i) - distance);
        });
        availableDistance = distance;
      }
    }
  }

  function onMoveStart(e){
    normalizeEventBehavior(e);
    touch_active = true;
    axis = getTouchingPos(e);
    eventDelegate('add');
  }

  function onEnd(e) {
    normalizeEventBehavior(e)
    console.log('end')
    touch_active = false;
    axis = null;
    let _as = availableSpace;
    availableDistance = Math.round((availableDistance / _as)) * _as;

    pos_axis = availableDistance;
    activeIndicator = (availableDistance / _as);

    [...swipeElements].forEach((element, i) => {
      element.style.cssText = generateTouchPosCss((_as * i) - pos_axis, true);
    });

    active_item = activeIndicator;
    eventDelegate('remove');
  }

  function changeItem(item) {
    let max = availableSpace;
    availableDistance = max * item;
    activeIndicator = item;
    onEnd();
  }

  function changeView() {
    changeItem(played);
    played = played < (total_elements - 1) ? ++played : 0;
  }

  export function goTo(step) {
    let item = Math.max(0, Math.min(step, indicators.length - 1));
    changeItem(item)
  }
  export function prevItem() {
    let step = activeIndicator - 1;
    goTo(step)
  }

  export function nextItem() {
    let step = activeIndicator + 1;
    goTo(step)
  }
</script>

<style>

.swipe-panel {
  position: relative;
  height: var(--sv-swipe-panel-height, 100%);
  width: var(--sv-swipe-panel-width, inherit);
}
.swipe-item-wrapper{
  overflow: hidden;
  position: relative;
  height: inherit;
  z-index: var(--sv-swipe-panel-wrapper-index, 2);
  pointer-events: none;
}

.swipeable-total_elements,
.swipeable-slot-wrapper {
  position: relative;
  width: inherit;
  height: inherit;
}

.swipe-handler {
  width: 100%;
  position: absolute;
  top: 40px;
  bottom: 0px;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0);
}
.swipe-indicator {
  position: relative;
  bottom: 1.5rem;
  display: flex;
  justify-content: center;
  z-index: var(--sv-swipe-panel-wrapper-index, 2);
  pointer-events: none;
}

.dot {
  height: 10px;
  width: 10px;
  background-color: transparent;
  border: 1px solid grey;
  border-radius: 50%;
  display: inline-block;
  margin: 0px 2px;
  cursor: pointer;
  pointer-events: fill;
}
.swipe-indicator .is-active {
  background-color: var(--sv-swipe-indicator-active-color, grey);
}

</style>
<div class="swipe-panel">
  <div class="swipe-item-wrapper" bind:this={swipeWrapper}>
    <div class="swipeable-total_elements">
      <div class="swipeable-slot-wrapper">
        <slot />
      </div>
    </div>
  </div>
  <div class="swipe-handler" bind:this={swipeHandler} on:touchstart={onMoveStart} on:mousedown={onMoveStart}></div>
   {#if showIndicators}
     <div class="swipe-indicator swipe-indicator-inside">
        {#each indicators as x, i }
          <span class="dot {activeIndicator == i ? 'is-active' : ''}" on:click={() => {changeItem(i)}}></span>
        {/each}
    </div>
   {/if}

</div>
