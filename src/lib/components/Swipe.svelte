<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import SwipeSnap from '../helpers/SwipeSnap';

  /**
   * @type {number}
   */
  export let transitionDuration = 200;

  /**
   * @type {boolean}
   */
  export let showIndicators = false;

  /**
   * @type {boolean}
   */
  export let autoplay = false;

  /**
   * @type {number}
   */
  export let delay = 1000;

  /**
   * @type {number}
   */
  export let defaultIndex = 0;

  /**
   * @type {number}
   */
  export const active_item = 0; //readonly

  /**
   * @type {boolean}
   */
  export let is_vertical = false;

  /**
   * @type {boolean}
   */
  export let allow_infinite_swipe = false;

  /**
   * @type {boolean}
   */
  export const pause_on_hover = false;

  /**
   * @type {SwipeSnap | null}
   */
  let Swiper = null;
  /**
   * @type {any[]}
   */
  let activeIndicator = 0,
    indicators,
    total_elements = 0,
    swipeWrapper;

  let played = defaultIndex || 0;
  let run_interval = false;
  let autoplay_pause = false;

  let fire = createEventDispatcher();

  function init() {
    Swiper = new SwipeSnap({
      element: swipeWrapper,
      is_vertical: is_vertical,
      transition_duration: transitionDuration,
      allow_infinite_swipe: allow_infinite_swipe,
      fire: fire
    });
    update();
  }

  function update() {
    Swiper.update();

    let props = Swiper.getProps();
    total_elements = props.elements_count;
  }

  $: indicators = Array(total_elements);

  $: {
    if (autoplay && !run_interval) {
      run_interval = setInterval(playSlide, delay);
    }

    if (!autoplay && run_interval) {
      clearInterval(run_interval);
      run_interval = false;
    }
  }

  onMount(() => {
    init();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', update);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', update);
    }
  });

  function onMoveStart(e) {
    Swiper.swipeStart(e);
  }

  function onMouseOver(e) {
    if (autoplay) {
      autoplay_pause = true;
    }
  }
  function onMouseOut(e) {
    if (autoplay) {
      autoplay_pause = false;
    }
  }

  function changeItem(step) {
    Swiper.goTo(step);
    let props = Swiper.getProps();
    activeIndicator = props.active_item;
  }

  function playSlide() {
    if (autoplay_pause) return;
    if (allow_infinite_swipe) {
      nextItem();
    } else {
      changeItem(played);
      played = played < total_elements - 1 ? ++played : 0;
    }
  }

  export function goTo(step) {
    Swiper.goTo(step);
  }
  export function prevItem() {
    Swiper.prevItem();
    let props = Swiper.getProps();
    activeIndicator = props.active_item;
  }

  export function nextItem() {
    // let step = activeIndicator + 1;
    // goTo(step);
    Swiper.nextItem();
    let props = Swiper.getProps();
    activeIndicator = props.active_item;
  }
</script>

<div class="swipe-panel">
  <div class="swipe-item-wrapper" bind:this={swipeWrapper}>
    <div class="swipeable-slot-wrapper">
      <slot />
    </div>
  </div>
  <!-- svelte-ignore a11y-mouse-events-have-key-events -->
  <div
    class="swipe-handler"
    on:touchstart={onMoveStart}
    on:mousedown={onMoveStart}
    on:mouseover={onMouseOver}
    on:mouseout={onMouseOut}
  />
  {#if showIndicators}
    <div class="swipe-indicator swipe-indicator-inside">
      {#each indicators as x, i}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <span
          class="dot {activeIndicator == i ? 'is-active' : ''}"
          on:click={() => {
            changeItem(i);
          }}
        />
      {/each}
    </div>
  {/if}
</div>

<style>
  .swipe-panel {
    position: relative;
    height: var(--sv-swipe-panel-height, 100%);
    width: var(--sv-swipe-panel-width, inherit);
  }
  .swipe-item-wrapper {
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
    top: var(--sv-swipe-handler-top, 0px);
    bottom: 0px;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0);
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
