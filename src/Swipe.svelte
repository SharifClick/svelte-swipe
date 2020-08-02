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
    items = 0,
    availableSpace = 0,
    topClearence = 0,
    elems,
    diff = 0,
    swipeWrapper,
    swipeHandler,

    min = 0,
    transformString = is_vertical ? 'translate3d(0, -{{val}}px, 0)' : 'translate3d(-{{val}}px, 0, 0)',

    touchingTpl = `
    -webkit-transition-duration: 0s;
    transition-duration: 0s;
    -webkit-transform: ${transformString};
    -ms-transform: ${transformString};`,

    non_touchingTpl = `
    -webkit-transition-duration: ${transitionDuration}ms;
    transition-duration: ${transitionDuration}ms;
    -webkit-transform: ${transformString};
    -ms-transform: ${transformString};`,

    touching = false,
    pos_axis = 0,
    page_axis = is_vertical ? 'pageY' : 'pageX',
    dir = 0,
    axis;



  let played = defaultIndex || 0;
  let run_interval = false;

  $: indicators = Array(items);

  $: {
    if(autoplay && !run_interval){
      run_interval = setInterval(changeView , delay);
    }

    if(!autoplay && run_interval){
      clearInterval(run_interval)
      run_interval = false;
    }
  }


  function update(){
    swipeHandler.style.top = topClearence + 'px';
    let {offsetWidth, offsetHeight} = swipeWrapper.querySelector('.swipeable-items');
    availableSpace = is_vertical ? offsetHeight : offsetWidth;
    for (let i = 0; i < items; i++) {
      let _transformValue = (availableSpace * i)+'px';
      let _transformString = is_vertical ? `translate3d(0, ${_transformValue}, 0)` :`translate3d(${_transformValue}, 0, 0)`;
      elems[i].style.transform = _transformString;
    }
    diff = 0;
    if(defaultIndex){
      changeItem(defaultIndex);
    }
  }

  function init(){
    elems = swipeWrapper.querySelectorAll('.swipeable-item');
    items = elems.length;
    update();
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

  function moveHandler(e){
    if (touching) {
      e.stopImmediatePropagation();
      e.stopPropagation();


      let max = availableSpace;

      let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
      let _diff = (axis - _axis) + pos_axis;
      let dir = _axis > axis ? 0 : 1;
      if (!dir) { _diff = pos_axis - (_axis - axis) }
      if (_diff <= (max * (items - 1)) && _diff >= min) {

        for (let i = 0; i < items; i++) {
          let template = i < 0 ? '{{val}}' : '-{{val}}';
          let _value = (max * i) - _diff;
          elems[i].style.cssText = touchingTpl.replace(template, _value).replace(template, _value);
        }

        diff = _diff;
      }

    }
  }

  function endHandler(e) {
    e && e.stopImmediatePropagation();
    e && e.stopPropagation();
    e && e.preventDefault();

    let max = availableSpace;

    touching = false;
    axis = null;



    let swipe_threshold = 0.85;
    let d_max = (diff / max);
    let _target = Math.round(d_max);

    if(Math.abs(_target - d_max) < swipe_threshold ){
      diff = _target * max;
    }else{
      diff = (dir ? (_target - 1) : (_target + 1)) * max;
    }

    pos_axis = diff;
    activeIndicator = (diff / max);
    for (let i = 0; i < items; i++) {
      let template = i < 0 ? '{{val}}' : '-{{val}}';
      let _value = (max * i) - pos_axis;
      elems[i].style.cssText = non_touchingTpl.replace(template, _value).replace(template, _value);
    }
    active_item = activeIndicator;
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', endHandler);
      window.removeEventListener('touchmove', moveHandler);
      window.removeEventListener('touchend', endHandler);
    }
  }

  function moveStart(e){
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();

    let max = availableSpace;

    touching = true;
    axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', moveHandler);
      window.addEventListener('mouseup', endHandler);
      window.addEventListener('touchmove', moveHandler);
      window.addEventListener('touchend', endHandler);
    }
  }

  function changeItem(item) {
    let max = availableSpace;
    diff = max * item;
    activeIndicator = item;
    endHandler();
  }

  function changeView() {
    changeItem(played);
    played = played < (items - 1) ? ++played : 0;
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

.swipeable-items,
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
    <div class="swipeable-items">
      <div class="swipeable-slot-wrapper">
        <slot />
      </div>
    </div>
  </div>
  <div class="swipe-handler" bind:this={swipeHandler} on:touchstart={moveStart} on:mousedown={moveStart}></div>
   {#if showIndicators}
     <div class="swipe-indicator swipe-indicator-inside">
        {#each indicators as x, i }
          <span class="dot {activeIndicator == i ? 'is-active' : ''}" on:click={() => {changeItem(i)}}></span>
        {/each}
    </div>
   {/if}

</div>
