<script>

  import { onMount, onDestroy } from 'svelte';

  
  export let transitionDuration = 200;
  export let showIndicators = false;
  export let autoplay = false;
  export let delay = 1000;



  let activeIndicator = 0;
  let indicators;
  let items = 0;
  let availableWidth = 0;
  let topClearence = 0;

  let elems;
  let diff = 0;

  let swipeWrapper;
  let swipeHandler;

  let min = 0;
  let touchingTpl = `
    -webkit-transition-duration: 0s;
    transition-duration: 0s; 
    -webkit-transform: translate3d(-{{val}}px, 0, 0);
    -ms-transform: translate3d(-{{val}}px, 0, 0);`;
  let non_touchingTpl = `
    -webkit-transition-duration: ${transitionDuration}ms;
    transition-duration: ${transitionDuration}ms; 
    -webkit-transform: translate3d(-{{val}}px, 0, 0);
    -ms-transform: translate3d(-{{val}}px, 0, 0);`;
  let touching = false;
  let posX = 0;
  let dir = 0;
  let x;
  
  
 
  let played = 0;
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
    availableWidth = swipeWrapper.querySelector('.swipeable-items').offsetWidth;
    for (let i = 0; i < items; i++) {
      elems[i].style.transform = 'translate3d(' + (availableWidth * i) + 'px, 0, 0)';
    }
    diff = 0;
  }

  function init(){
    elems = swipeWrapper.querySelectorAll('.swipeable-item');
    items = elems.length;
    update();
  }

  onMount(() => {
    init();
    window.addEventListener('resize', update);
  });

  
  
  onDestroy(()=>{
    if (process.browser)
      window.removeEventListener('resize', update);
  })

  function moveHandler(e){
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

    let max = availableWidth;

    touching = false;
    x = null;


    
    let swipe_threshold = 0.85;
    let d_max = (diff / max);
    let _target = Math.round(d_max);
    
    if(Math.abs(_target - d_max) < swipe_threshold ){
      diff = _target * max;
    }else{
      diff = (dir ? (_target - 1) : (_target + 1)) * max;
    }

    posX = diff;
    activeIndicator = (diff / max);
    for (let i = 0; i < items; i++) {
      let template = i < 0 ? '{{val}}' : '-{{val}}';
      let _value = (max * i) - posX;
      elems[i].style.cssText = non_touchingTpl.replace(template, _value).replace(template, _value);
    }

    if (process.browser) {
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

    let max = availableWidth;

    touching = true;
    x = e.touches ? e.touches[0].pageX : e.pageX;
    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', endHandler);
    window.addEventListener('touchmove', moveHandler);
    window.addEventListener('touchend', endHandler);
  }

  function changeItem(item) {
    let max = availableWidth;
    diff = max * item;
    activeIndicator = item;
    endHandler();
  }

  function changeView() {
    changeItem(played);
    played = played < (items - 1) ? ++played : 0;
  }

</script>

<style>

.swipe-panel {
  position: relative;
  height: var(--sv-swipe-panel-height, inherit);
  width: var(--sv-swipe-panel-width, inherit);
}
.swipe-item-wrapper{
  overflow: hidden;
  position: relative;
  height: inherit;
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
  bottom: 40px;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0);
}
.swipe-indicator {
  position: relative;
  bottom: 1.5rem;
  display: flex;
  justify-content: center;
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
