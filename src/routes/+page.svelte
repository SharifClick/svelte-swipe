<script>
  import { Swipe, SwipeItem } from '../lib';
  import { base } from '$app/paths';

  const swipeConfig = {
    autoplay: false,
    showIndicators: false,
    transitionDuration: 200,
    defaultIndex: 0
  };

  let active_item = 0; //readonly
  let _active_item = 0; // used in dynamic height swipe items

  let customThumbnail = false;

  let SwipeComp;

  function toggle() {
    swipeConfig.autoplay = !swipeConfig.autoplay;
  }

  function sayHi() {
    alert('Hi');
  }

  function nextSlide() {
    SwipeComp.nextItem();
  }

  function prevSlide() {
    SwipeComp.prevItem();
  }

  function changeSlide(i) {
    SwipeComp.goTo(i);
  }

  let images = ['images/1.jpg', 'images/2.jpg', 'images/3.jpg', 'images/4.jpg'];

  let dy_images = [
    'images/dy-1.jpg',
    'images/dy-2.jpg',
    'images/dy-3.jpg',
    'images/dy-4.jpg',
    'images/dy-5.jpg'
  ];

  let tabs = [
    { name: 'Deafult', value: 'default' },
    { name: 'Vertical', value: 'vertical' },
    { name: 'Allow Pointer', value: 'allow-pointer' },
    { name: 'Dynamic Height', value: 'dynamic-height' },
    { name: 'Infinite Swipe', value: 'infinite-swipe' }
  ];
  let active_tab = 'default';

  function changeTab(tab) {
    active_tab = tab.value;
  }

  let swipe_holder_height = 500;
  function heightChanged({ detail }) {
    console.log('Swipe Holder Height ' + detail.height);
    swipe_holder_height = detail.height;
  }

  function itemChanged({ detail }) {
    console.log(detail);
  }
</script>

<a
  href="https://github.com/SharifClick/svelte-swipe"
  class="github-corner"
  aria-label="View source on GitHub"
>
  <svg
    width="80"
    height="80"
    viewBox="0 0 250 250"
    style="fill:#151513; color:#fff; position: absolute; top: 0; border: 0;
    right: 0;"
    aria-hidden="true"
  >
    <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
    <path
      d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6
      120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3
      125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
      fill="currentColor"
      style="transform-origin: 130px 106px;"
      class="octo-arm"
    />
    <path
      d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6
      C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0
      C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1
      C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4
      C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9
      C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5
      C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9
      L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
      fill="currentColor"
      class="octo-body"
    />
  </svg>
</a>
<div class="container">
  <div class="row" style="margin-top:20px">
    <div class="col">
      <h1 class="text-muted">Svelte Swipe</h1>
      <p class="text-muted">Swipable items wrapper component for Svelte</p>
    </div>
  </div>
  <div class="row">
    <div class="col">
      <ul class="nav nav-tabs">
        {#each tabs as tab}
          <li class="nav-item" on:click={() => changeTab(tab)}>
            <button class="nav-link {tab.value == active_tab ? 'active' : ''}" type="button"
              >{tab.name}</button
            >
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <div class="row top-buffer">
    <div class="col">
      <div class="tab-content">
        <div class="tab-pane fade {active_tab == 'default' ? 'show active' : ''}">
          <div class="row">
            <div class="col">
              <div class="form-check form-check-inline float-right">
                <input
                  class="form-check-input"
                  type="checkbox"
                  bind:checked={swipeConfig.showIndicators}
                />
                <label class="text-muted">Built-in Indicators</label>
              </div>
              <div class="form-check form-check-inline float-right">
                <input class="form-check-input" type="checkbox" bind:checked={customThumbnail} />
                <label class="text-muted">Custom Thumbnail</label>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col">
              <div class="swipe-holder">
                <Swipe
                  {...swipeConfig}
                  bind:active_item
                  bind:this={SwipeComp}
                  on:change={itemChanged}
                >
                  {#each images as image}
                    <SwipeItem>
                      <img class="img-fluid" src={base + '/' + image} alt="" />
                    </SwipeItem>
                  {/each}
                </Swipe>
              </div>
            </div>
          </div>
          <div class="row" style="margin-top:10px">
            <div class="col">
              <input
                class="btn btn-info btn-sm"
                type="button"
                on:click={toggle}
                value={swipeConfig.autoplay ? 'Stop' : 'Play'}
              />
            </div>
            {#if customThumbnail}
              <div class="col">
                <div class="is-center">
                  {#each images as image, i}
                    <img
                      class="img-fluid {active_item == i ? 'rounded' : 'img-thumbnail'}"
                      on:click={() => changeSlide(i)}
                      style="height:30px; width:30px; cursor:pointer"
                      src={base + '/' + image}
                      alt=""
                    />
                  {/each}
                </div>
              </div>
            {/if}
            <div class="col">
              <div class="btn-group float-right">
                <button type="button" class="btn btn-secondary btn-sm" on:click={prevSlide}>
                  Prev
                </button>
                <button type="button" class="btn btn-secondary btn-sm" on:click={nextSlide}>
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
        {#if active_tab == 'vertical'}
          <div class="tab-pane fade show active">
            <p class="lead">Vertical Swipe 🔥</p>
            <div class="row">
              <div class="col">
                <div class="swipe-holder">
                  <Swipe is_vertical={true}>
                    {#each images as image}
                      <SwipeItem>
                        <img class="img-fluid" src={base + '/' + image} alt="" />
                      </SwipeItem>
                    {/each}
                  </Swipe>
                </div>
              </div>
            </div>
          </div>
        {/if}
        {#if active_tab == 'allow-pointer'}
          <div class="tab-pane fade show active">
            <p class="lead">Also allow pointer events inside Swipe Item</p>
            <div class="swipe-holder">
              <Swipe>
                <SwipeItem>
                  <div class="is-stack is-center" style="background:teal">
                    <button class="custom-button has-pointer-event" on:click={sayHi}>
                      Say Hi
                    </button>
                  </div>
                </SwipeItem>

                <SwipeItem>
                  <div class="is-stack is-center" style="background:yellowgreen">
                    <button class="custom-button has-pointer-event" on:click={sayHi}>
                      Say Hi
                    </button>
                  </div>
                </SwipeItem>

                <SwipeItem>
                  <div class="is-stack is-center" style="background:aqua">
                    <button class="custom-button has-pointer-event" on:click={sayHi}>
                      Say Hi
                    </button>
                  </div>
                </SwipeItem>

                <SwipeItem>
                  <div class="is-stack is-center" style="background:lightcoral">
                    <button class="custom-button has-pointer-event" on:click={sayHi}>
                      Say Hi
                    </button>
                  </div>
                </SwipeItem>
              </Swipe>
            </div>
          </div>
        {/if}
        {#if active_tab == 'dynamic-height'}
          <div class="tab-pane fade show active">
            <div class="row">
              <div class="col-md-6"><p class="lead">Dynamic height with children</p></div>
              <div class="col-md-6 text-right">
                <p class="lead">Item Height: {swipe_holder_height}</p>
              </div>
            </div>
            <div class="swipe-holder" style="height:{swipe_holder_height}px">
              <Swipe bind:active_item={_active_item}>
                {#each dy_images as image, i}
                  <SwipeItem
                    active={_active_item == i}
                    allow_dynamic_height={true}
                    on:swipe_item_height_change={heightChanged}
                  >
                    <div class="text-center" style="background-color:lightgrey">
                      <img class="img-fluid" src={base + '/' + image} alt="" />
                    </div>
                  </SwipeItem>
                {/each}
              </Swipe>
            </div>
          </div>
        {/if}
        {#if active_tab == 'infinite-swipe'}
          <div class="tab-pane fade show active">
            <div class="row">
              <div class="col">
                <div class="form-check form-check-inline float-right">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    bind:checked={swipeConfig.showIndicators}
                  />
                  <label class="text-muted">Built-in Indicators</label>
                </div>
                <div class="form-check form-check-inline float-right">
                  <input class="form-check-input" type="checkbox" bind:checked={customThumbnail} />
                  <label class="text-muted">Custom Thumbnail</label>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="swipe-holder">
                  <Swipe
                    {...swipeConfig}
                    allow_infinite_swipe={true}
                    bind:active_item
                    bind:this={SwipeComp}
                    on:change={itemChanged}
                  >
                    {#each images as image}
                      <SwipeItem>
                        <img class="img-fluid" src={base + '/' + image} alt="" />
                      </SwipeItem>
                    {/each}
                  </Swipe>
                </div>
              </div>
            </div>
            <div class="row" style="margin-top:10px">
              <div class="col">
                <input
                  class="btn btn-info btn-sm"
                  type="button"
                  on:click={toggle}
                  value={swipeConfig.autoplay ? 'Stop' : 'Play'}
                />
              </div>
              {#if customThumbnail}
                <div class="col">
                  <div class="is-center">
                    {#each images as image, i}
                      <img
                        class="img-fluid {active_item == i ? 'rounded' : 'img-thumbnail'}"
                        on:click={() => changeSlide(i)}
                        style="height:30px; width:30px; cursor:pointer"
                        src={base + '/' + image}
                        alt=""
                      />
                    {/each}
                  </div>
                </div>
              {/if}
              <div class="col">
                <div class="btn-group float-right">
                  <button type="button" class="btn btn-secondary btn-sm" on:click={prevSlide}>
                    Prev
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" on:click={nextSlide}>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  :root {
    --sv-swipe-indicator-active-color: white;
  }
  .is-stack {
    height: 300px;
    width: 100%;
  }
  .swipe-holder {
    height: 30vh;
    width: 100%;
  }

  .custom-button {
    background-color: #4caf50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
  }
  .is-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  img {
    max-width: 100%;
    height: auto;
  }
  .has-pointer-event {
    pointer-events: fill;
  }

  .github-corner:hover .octo-arm {
    animation: octocat-wave 560ms ease-in-out;
  }
  @keyframes octocat-wave {
    0%,
    100% {
      transform: rotate(0);
    }
    20%,
    60% {
      transform: rotate(-25deg);
    }
    40%,
    80% {
      transform: rotate(10deg);
    }
  }
  @media (max-width: 500px) {
    .github-corner:hover .octo-arm {
      animation: none;
    }
    .github-corner .octo-arm {
      animation: octocat-wave 560ms ease-in-out;
    }
  }
  .top-buffer {
    margin-top: 20px;
  }
</style>
