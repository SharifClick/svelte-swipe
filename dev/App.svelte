<script>
  import { Swipe, SwipeItem } from "../src/index.js";
  let autoplay = false;
  let delay = 2000;
  let showIndicators = false;
  let transitionDuration = 200;
  let defaultIndex = 0;

  let SwipeComp;
  
  function toggle(){
    autoplay = !autoplay;
  }

  function sayHi(){
    alert('Hi')
  }

  function nextSlide(){
   SwipeComp.goTo(+1)
  }

  function prevSlide(){
    SwipeComp.goTo(-1)
  }

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
  .desc-holder{
    padding: 20px 20px;
  }

  .desc-holder h1{
    font-size: 3vh;
  }
  .option-holder input{
    padding: 10px 10px;
    margin: 10px;
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
</style>

<div class="container" >

  <div class="row" style="margin-top:20px">
    <h1 class="display-4">Swipable items wrapper component for Svelte</h1>
  </div>

  <div class="row">
    <div class="swipe-holder">
      <Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex} bind:this={SwipeComp}>
        <SwipeItem>
          <img class="img-fluid" src="./images/1.jpg" alt="">
        </SwipeItem>

        <SwipeItem>
          <img class="img-fluid" src="./images/2.jpg" alt="">
        </SwipeItem>

        <SwipeItem>
          <img class="img-fluid" src="./images/3.jpg" alt="">
        </SwipeItem>

        <SwipeItem>
          <img class="img-fluid" src="./images/4.jpg" alt="">
        </SwipeItem>
      </Swipe>
    </div>
  </div>
  <div class="row d-flex flex-row-reverse" style="margin-top:10px">
    <div class="btn-group">
      <button type="button" class="btn btn-secondary" on:click={prevSlide}>Prev</button>
      <button type="button" class="btn btn-secondary" on:click={nextSlide}>Next</button>
    </div>
  </div>
  <div class="option-holder">
    <input type="button" on:click={toggle} value={autoplay ? 'Stop': 'Play'}>
    Show Indicators:<input type="checkbox" bind:checked={showIndicators}> 
  </div>
  <input type="text" bind:value={defaultIndex}>
  


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

