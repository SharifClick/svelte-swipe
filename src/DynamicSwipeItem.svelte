<script>
    import { onMount, afterUpdate, createEventDispatcher} from 'svelte';
    export let active = false;
    export let classes = '';
    export let style ='';
    export let track_height = false;

    let swipeItemInner = null;
    let _height = 0;
    const dispatch = createEventDispatcher();

    console.log('swipeitem')

    function pollForRender(){
          console.log({active, track_height, _height})
      if(swipeItemInner && typeof swipeItemInner != 'undefined'){
        init();
      }else{
        setTimeout(() => {
         pollForRender();
        }, 200);
      }
    };

    function fireSizeChange(){
      console.log('fireSizeChange')
        if(!swipeItemInner || swipeItemInner == 'undefined'){
          pollForRender();
        }else{
          requestAnimationFrame(() => {
            if(!swipeItemInner || typeof swipeItemInner == 'undefined'){
              return;
            }
            var h1 = swipeItemInner.scrollHeight,
            h2 = swipeItemInner.clientHeight;
                  // console.log(swipeItemInner.scrollHeight)
            dispatch('heightChange', {height: Math.max(h1, h2)});
          });
        }
    }
    function init(){
        fireSizeChange();
    }

    $: active, (active && _height && requestAnimationFrame(fireSizeChange))


    onMount(() => {
      setTimeout(() => {
        pollForRender()
      }, 100)
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
