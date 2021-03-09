# Svelte Swipe

<p>
  <a href="https://www.npmjs.com/package/svelte-swipe"><img  src="https://img.shields.io/npm/v/svelte-swipe?style=for-the-badge"/></a>
  <a href="https://www.npmjs.com/package/svelte-swipe">
    <img src="https://img.shields.io/npm/dm/svelte-swipe?style=for-the-badge"/>
  </a>
  <a href="https://bundlephobia.com/result?p=svelte-swipe">
    <img src="https://img.shields.io/bundlephobia/min/svelte-swipe?style=for-the-badge"/>
  </a>

  <a href="https://bundlephobia.com/result?p=svelte-swipe">
    <img src="https://img.shields.io/bundlephobia/minzip/svelte-swipe?style=for-the-badge"/>
  </a>
  <a href="https://svelte.dev"><img  src="https://img.shields.io/badge/svelte-v3-blueviolet?style=for-the-badge"/></a>
</p>

Svelte 轮播组件 :fire: :boom: (无依赖文件 - 压缩后仅 3.37 KB )

## 🚀[查看示例](https://sharifclick.github.io/svelte-swipe/)


## 如何安装

```bash
npm i -D svelte-swipe
```

## 使用方法

```html
<script>

  import { Swipe, SwipeItem } from "svelte-swipe";

  const swipeConfig = {
    autoplay: false,
    delay: 2000,
    showIndicators: true,
    transitionDuration: 1000,
    defaultIndex: 0,
  };
</script>

<style>
  .swipe-holder{
    height: 30vh;
    width: 100%;
  }
  img{
    max-width: 100%;
    height: auto;
  }
</style>

<div class="swipe-holder">
  <Swipe {...swipeConfig}>
    <SwipeItem>
      <img src="./images/1.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/2.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/3.jpg" alt="">
    </SwipeItem>

    <SwipeItem>
      <img src="./images/4.jpg" alt="">
    </SwipeItem>
  </Swipe>
</div>

```
### 垂直轮播 🔥

```html

<div class="swipe-holder">
  <Swipe is_vertical={true}>
    <SwipeItem>
      ...
    </SwipeItem>
    ...
  </Swipe>
</div>
```

### 轮播项的点击事件

```html
<style>
   ...

  .has-pointer-event{
    pointer-events:fill;
  }
</style>

<div class="swipe-holder">
  <Swipe>
    <SwipeItem>
      <div>
        <button class="has-pointer-event" on:click={sayHi}>Say Hi</button>
      </div>
    </SwipeItem>
    ...
  </Swipe>
</div>

```


### 自定义的轮播方式 

```html

<script>
  let SwipeComp;

  function nextSlide(){
   SwipeComp.nextItem()
  }

  function prevSlide(){
    SwipeComp.prevItem()
  }

</script>
<div class="swipe-holder">
  <Swipe bind:this={SwipeComp}>
    <SwipeItem>....</SwipeItem>
    ...
  </Swipe>
</div>
<div class="buttons-holder">
  <button type="button" on:click={prevSlide}>Prev</button>
  <button type="button" on:click={nextSlide}>Next</button>
</div>
```

### 支持自定义轮播缩略图
## 🚀[查看带有自定义轮播图的示例](https://svelte.dev/repl/be477862ac8b4dfea4c8e454e556ef2c?version=3.20.1)
```html

<script>
  let SwipeComp;

  function changeSlide(i){
    SwipeComp.goTo(i)
  }

</script>
<div class="swipe-holder">
  <Swipe bind:this={SwipeComp}>
    <SwipeItem>....</SwipeItem>
    ...
  </Swipe>
</div>

```

## 默认的css自定义属性

```css

  :root{
    --sv-swipe-panel-height: inherit;
    --sv-swipe-panel-width: inherit;
    --sv-swipe-panel-wrapper-index: 2;
    --sv-swipe-indicator-active-color: grey;
    --sv-swipe-handler-top: 0px;
  }

```

## 配置项

| 名称 | 类型 | 描述 | 必填 | 默认值 |
| --- | --- | --- | --- | --- |
| `is_vertical` | `Boolean` | 允许轮播图垂直滑动 | No | `false` |
| `autoplay` | `Boolean` | 允许轮播图自动滚动 | No | `false` |
| `showIndicators` | `Boolean` | 在轮播图下方显示默认轮播指示器 | No | `false` |
| `transitionDuration` | `Number` | 轮播图动画过渡时间 | No | `200` 毫秒 |
| `delay` | `Number` | 轮播图自动滚动等待时间 | No | `1000` 毫秒 |
| `defaultIndex` | `Number` | 轮播图初始位置索引 | No |`0` |

## NPM 统计

此 NPM 包的统计信息

[![NPM](https://nodei.co/npm/svelte-swipe.png)](https://nodei.co/npm/svelte-swipe/)

### 扫描二维码在手机端查看示例效果

![demo-url](https://github.com/SharifClick/svelte-swipe/blob/master/docs/images/url-code.png)
