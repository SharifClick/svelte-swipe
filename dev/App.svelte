<script>
  import { Swipe, SwipeItem } from "../src/index.js";

  let autoplay = false;
  let delay = 2000;
  let showIndicators = false;
  let transitionDuration = 200;
  let defaultIndex = 0;

  let active_item = 0; //readonly


  let customThumbnail = false;

  let SwipeComp;
  
  function toggle(){
    autoplay = !autoplay;
  }

  function sayHi(){
    alert('Hi')
  }

  function nextSlide(){
   SwipeComp.nextItem()
  }

  function prevSlide(){
    SwipeComp.prevItem()
  }

   function changeSlide(i){
    SwipeComp.goTo(i)
  }

  let images = [
    "./images/1.jpg",
    "./images/2.jpg",
    "./images/3.jpg",
    "./images/4.jpg"
  ];

</script>

<style>
  :root{
    --sv-swipe-indicator-active-color:white;
  }
  .is-stack{
    height: 100%;
    width: 100%;
  }
  .swipe-holder{
    height: 30vh;
    width: 100%;
  }

  .custom-button{
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }
  .is-center{
    display: flex;
    justify-content: center;
    align-items: center;
  }
  img{
    max-width: 100%;
    height: auto;
  }
  .has-pointer-event{
    pointer-events:fill;
  }

  @media (max-width: 764px) {
    .display-4{
      font-size: 2rem;
    }
  }   
</style>

<div class="container" >

  <div class="row" style="margin-top:20px">
    <div class="col">
      <h1 class="display-4">Swipable items wrapper component for Svelte</h1>
    </div>
  </div>
  <div class="row">
    <div class="col">
    <div class="form-check form-check-inline float-right">
      <input class="form-check-input" type="checkbox"  bind:checked={showIndicators}>
      <label class="text-muted">
        Built-in Indicators
      </label>
    </div>
    <div class="form-check form-check-inline float-right">
      <input class="form-check-input" type="checkbox"  bind:checked={customThumbnail}>
      <label class="text-muted">
        Custom Thumbnail
      </label>
    </div>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <div class="swipe-holder">
        <Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex} bind:active_item bind:this={SwipeComp}>
          {#each images as image}
            <SwipeItem>
              <img class="img-fluid" src={image} alt="">
            </SwipeItem>
          {/each}
        </Swipe>
      </div>
    </div>
  </div>
  <div class="row" style="margin-top:10px">
    <div class="col">
      <input class="btn btn-info btn-sm" type="button" on:click={toggle} value={autoplay ? 'Stop': 'Play'}>
    </div>
    {#if customThumbnail}
      <div class="col">
        <div class="is-center">
          {#each images as image, i}
            <img class="img-fluid {active_item == i ? 'rounded' : 'img-thumbnail'}" on:click={() => changeSlide(i)} style="height:30px; width:30px; cursor:pointer" src={image} alt="">
          {/each}
        </div>
      </div>
    {/if}
    <div class="col">
      <div class="btn-group float-right">
        <button type="button" class="btn btn-secondary btn-sm" on:click={prevSlide}>Prev</button>
        <button type="button" class="btn btn-secondary btn-sm" on:click={nextSlide}>Next</button>
      </div>
    </div>
    
  </div>
  
  <hr>

  <div class="swipe-holder">
    <Swipe>
      <SwipeItem>
        <div class="is-stack is-center" style="background:teal">
          <button class="custom-button has-pointer-event" on:click={sayHi}>Say Hi</button>
        </div>
      </SwipeItem>

      <SwipeItem>
        <div class="is-stack is-center" style="background:yellowgreen">
          <button class="custom-button has-pointer-event" on:click={sayHi}>Say Hi</button>
        </div>
      </SwipeItem>

      <SwipeItem>
        <div class="is-stack is-center" style="background:aqua">
          <button class="custom-button has-pointer-event" on:click={sayHi}>Say Hi</button>
        </div>
      </SwipeItem>

      <SwipeItem>
        <div class="is-stack is-center" style="background:lightcoral">
          <button class="custom-button has-pointer-event" on:click={sayHi}>Say Hi</button>
        </div>
      </SwipeItem>
    </Swipe>
  </div>
</div>

