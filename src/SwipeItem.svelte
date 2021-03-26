<script>
    import { onMount, createEventDispatcher} from 'svelte';
    export let active = false;
    export let classes = '';
    export let style ='';
    export let allow_dynamic_height = false;

    let swipeItemInner = null;
    let _height = 0;
    const dispatch = createEventDispatcher();


    function firehHeightChange(){
      if(swipeItemInner){
        let {scrollHeight, clientHeight} = swipeItemInner;
        dispatch('swipe_item_height_change', {height: Math.max(scrollHeight, clientHeight)});
      }
    }

    $: active, (allow_dynamic_height && active && _height && requestAnimationFrame(firehHeightChange))

    onMount(() => {
     setTimeout(() => {
      allow_dynamic_height && requestAnimationFrame(firehHeightChange)
     }, 100);
    });
</script>

<style>
  .swipeable-item {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition-timing-function: ease-out;
  }
</style>


<div bind:clientHeight={_height} class="swipeable-item {classes} {active ? 'is-active' : ''} " style="{style}">
  <div bind:this={swipeItemInner} class="swipeable-item-inner">
    <slot></slot>
  </div>
</div>
