<script>
  export let classes = '';
  export let shouldLoadVideo;
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

<div class="swipeable-item {classes}">
  {#if shouldLoadVideo}
    <slot name="video" />
  {:else}
    <slot name="poster" />
  {/if}
</div>