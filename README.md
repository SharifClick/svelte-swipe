# svelte-swipe
Svelte V3 Swipe 

## Installation

```bash
npm i svelte-swipe
```

## Usage

```html
<script>
  import Swipe from "svelte-swipe";

</script>

<style>
  .is-center{
    display: flex;
    justify-content: center;
    border: 1px solid green;
    position: absolute;
    width: 99%;
  }
</style>

<Swipe>
  <div class="swipeable-item is-center">
    <h1>Boo yeaah</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Nope :(</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Oops!</h1>
  </div>

  <div class="swipeable-item is-center">
    <h1>Ouch!!!</h1>
  </div>
</Swipe>

```
