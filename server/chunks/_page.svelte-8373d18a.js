import { c as create_ssr_component, d as each, e as escape, f as add_attribute, v as validate_component, h as createEventDispatcher, o as onDestroy } from './index-c5a1ae32.js';

const css$2 = {
  code: ".swipe-panel.svelte-17g4ceu.svelte-17g4ceu{position:relative;height:var(--sv-swipe-panel-height, 100%);width:var(--sv-swipe-panel-width, inherit)}.swipe-item-wrapper.svelte-17g4ceu.svelte-17g4ceu{overflow:hidden;position:relative;height:inherit;z-index:var(--sv-swipe-panel-wrapper-index, 2);pointer-events:none}.swipeable-total_elements.svelte-17g4ceu.svelte-17g4ceu,.swipeable-slot-wrapper.svelte-17g4ceu.svelte-17g4ceu{position:relative;width:inherit;height:inherit}.swipe-handler.svelte-17g4ceu.svelte-17g4ceu{width:100%;position:absolute;top:var(--sv-swipe-handler-top, 0px);bottom:0px;left:0;right:0;background:rgba(0, 0, 0, 0)}.swipe-indicator.svelte-17g4ceu.svelte-17g4ceu{position:relative;bottom:1.5rem;display:flex;justify-content:center;z-index:var(--sv-swipe-panel-wrapper-index, 2);pointer-events:none}.dot.svelte-17g4ceu.svelte-17g4ceu{height:10px;width:10px;background-color:transparent;border:1px solid grey;border-radius:50%;display:inline-block;margin:0px 2px;cursor:pointer;pointer-events:fill}.swipe-indicator.svelte-17g4ceu .is-active.svelte-17g4ceu{background-color:var(--sv-swipe-indicator-active-color, grey)}",
  map: null
};
const Swipe = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { transitionDuration = 200 } = $$props;
  let { showIndicators = false } = $$props;
  let { autoplay = false } = $$props;
  let { delay = 1e3 } = $$props;
  let { defaultIndex = 0 } = $$props;
  let { active_item = 0 } = $$props;
  let { is_vertical = false } = $$props;
  let { allow_infinite_swipe = false } = $$props;
  let activeIndicator = 0, indicators, total_elements = 0, availableSpace = 0, availableMeasure = 0, swipeElements, availableDistance = 0, swipeWrapper, pos_axis = 0, page_axis = is_vertical ? "pageY" : "pageX", axis, last_axis_pos;
  let played = defaultIndex || 0;
  let run_interval = false;
  let fire = createEventDispatcher();
  function update() {
    let { offsetWidth, offsetHeight } = swipeWrapper.querySelector(".swipeable-total_elements");
    availableSpace = is_vertical ? offsetHeight : offsetWidth;
    setElementsPosition({
      init: true,
      elems: [...swipeElements],
      availableSpace,
      has_infinite_loop: allow_infinite_swipe
    });
    availableDistance = 0;
    availableMeasure = availableSpace * (total_elements - 1);
    if (defaultIndex) {
      changeItem(defaultIndex);
    }
  }
  function setElementsPosition({ elems = [], availableSpace: availableSpace2 = 0, pos_axis: pos_axis2 = 0, has_infinite_loop = false, distance = 0, moving = false, init = false, end = false, reset = false }) {
    elems.forEach((element, i) => {
      let idx = has_infinite_loop ? i - 1 : i;
      if (init) {
        element.style.transform = generateTranslateValue(availableSpace2 * idx);
      }
      if (moving) {
        element.style.cssText = generateTouchPosCss(availableSpace2 * idx - distance);
      }
      if (end) {
        element.style.cssText = generateTouchPosCss(availableSpace2 * idx - pos_axis2, true);
      }
      if (reset) {
        element.style.cssText = generateTouchPosCss(availableSpace2 * idx - pos_axis2);
      }
    });
  }
  function eventDelegate(type) {
    let delegationTypes = {
      add: "addEventListener",
      remove: "removeEventListener"
    };
    if (typeof window !== "undefined") {
      window[delegationTypes[type]]("mousemove", onMove);
      window[delegationTypes[type]]("mouseup", onEnd);
      window[delegationTypes[type]]("touchmove", onMove, { passive: false });
      window[delegationTypes[type]]("touchend", onEnd, { passive: false });
    }
  }
  function generateTranslateValue(value) {
    return is_vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
  }
  function generateTouchPosCss(value, touch_end = false) {
    let transformString = generateTranslateValue(value);
    let _css = `
-webkit-transition-duration: ${touch_end ? transitionDuration : "0"}ms;
transition-duration: ${touch_end ? transitionDuration : "0"}ms;
-webkit-transform: ${transformString};
-ms-transform: ${transformString};`;
    return _css;
  }
  onDestroy(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", update);
    }
  });
  let touch_active = false;
  function onMove(e) {
    if (touch_active) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis], distance = axis - _axis + pos_axis;
      if (!allow_infinite_swipe) {
        if (pos_axis == 0 && axis < _axis || pos_axis == availableMeasure && axis > _axis) {
          return;
        }
      }
      e.preventDefault();
      setElementsPosition({
        moving: true,
        elems: [...swipeElements],
        availableSpace,
        distance,
        has_infinite_loop: allow_infinite_swipe
      });
      availableDistance = distance;
      last_axis_pos = _axis;
    }
  }
  function onEnd(e) {
    if (e && e.cancelable) {
      e.preventDefault();
    }
    e && e.stopImmediatePropagation();
    e && e.stopPropagation();
    let direction = axis < last_axis_pos;
    touch_active = false;
    let _as = availableSpace;
    let accidental_touch = Math.round(availableSpace / 50) > Math.abs(axis - last_axis_pos);
    if (accidental_touch) {
      availableDistance = Math.round(availableDistance / _as) * _as;
    } else {
      availableDistance = direction ? Math.floor(availableDistance / _as) * _as : Math.ceil(availableDistance / _as) * _as;
    }
    axis = null;
    last_axis_pos = null;
    pos_axis = availableDistance;
    activeIndicator = availableDistance / _as;
    active_item = activeIndicator;
    defaultIndex = active_item;
    setElementsPosition({
      end: true,
      elems: [...swipeElements],
      availableSpace: _as,
      pos_axis,
      has_infinite_loop: allow_infinite_swipe
    });
    if (allow_infinite_swipe) {
      if (active_item === -1) {
        pos_axis = _as * (total_elements - 1);
      }
      if (active_item === total_elements) {
        pos_axis = 0;
      }
      activeIndicator = pos_axis / _as;
      active_item = activeIndicator;
      defaultIndex = active_item;
      setTimeout(
        () => {
          setElementsPosition({
            reset: true,
            elems: [...swipeElements],
            availableSpace: _as,
            pos_axis,
            has_infinite_loop: allow_infinite_swipe
          });
        },
        transitionDuration
      );
    }
    eventDelegate("remove");
    let swipe_direction = direction ? "right" : "left";
    fire("change", {
      active_item,
      swipe_direction,
      active_element: swipeElements[active_item]
    });
  }
  function changeItem(item) {
    let max = availableSpace;
    availableDistance = max * item;
    activeIndicator = item;
    onEnd();
  }
  function changeView() {
    changeItem(played);
    played = played < total_elements - 1 ? ++played : 0;
  }
  function goTo(step) {
    let item = allow_infinite_swipe ? step : Math.max(0, Math.min(step, indicators.length - 1));
    changeItem(item);
  }
  function prevItem() {
    let step = activeIndicator - 1;
    goTo(step);
  }
  function nextItem() {
    let step = activeIndicator + 1;
    goTo(step);
  }
  if ($$props.transitionDuration === void 0 && $$bindings.transitionDuration && transitionDuration !== void 0)
    $$bindings.transitionDuration(transitionDuration);
  if ($$props.showIndicators === void 0 && $$bindings.showIndicators && showIndicators !== void 0)
    $$bindings.showIndicators(showIndicators);
  if ($$props.autoplay === void 0 && $$bindings.autoplay && autoplay !== void 0)
    $$bindings.autoplay(autoplay);
  if ($$props.delay === void 0 && $$bindings.delay && delay !== void 0)
    $$bindings.delay(delay);
  if ($$props.defaultIndex === void 0 && $$bindings.defaultIndex && defaultIndex !== void 0)
    $$bindings.defaultIndex(defaultIndex);
  if ($$props.active_item === void 0 && $$bindings.active_item && active_item !== void 0)
    $$bindings.active_item(active_item);
  if ($$props.is_vertical === void 0 && $$bindings.is_vertical && is_vertical !== void 0)
    $$bindings.is_vertical(is_vertical);
  if ($$props.allow_infinite_swipe === void 0 && $$bindings.allow_infinite_swipe && allow_infinite_swipe !== void 0)
    $$bindings.allow_infinite_swipe(allow_infinite_swipe);
  if ($$props.goTo === void 0 && $$bindings.goTo && goTo !== void 0)
    $$bindings.goTo(goTo);
  if ($$props.prevItem === void 0 && $$bindings.prevItem && prevItem !== void 0)
    $$bindings.prevItem(prevItem);
  if ($$props.nextItem === void 0 && $$bindings.nextItem && nextItem !== void 0)
    $$bindings.nextItem(nextItem);
  $$result.css.add(css$2);
  indicators = Array(total_elements);
  {
    {
      if (autoplay && !run_interval) {
        run_interval = setInterval(changeView, delay);
      }
      if (!autoplay && run_interval) {
        clearInterval(run_interval);
        run_interval = false;
      }
    }
  }
  return `<div class="${"swipe-panel svelte-17g4ceu"}"><div class="${"swipe-item-wrapper svelte-17g4ceu"}"${add_attribute("this", swipeWrapper, 0)}><div class="${"swipeable-total_elements svelte-17g4ceu"}"><div class="${"swipeable-slot-wrapper svelte-17g4ceu"}">${slots.default ? slots.default({}) : ``}</div></div></div>
  <div class="${"swipe-handler svelte-17g4ceu"}"></div>
  ${showIndicators ? `<div class="${"swipe-indicator swipe-indicator-inside svelte-17g4ceu"}">${each(indicators, (x, i) => {
    return `<span class="${"dot " + escape(activeIndicator == i ? "is-active" : "", true) + " svelte-17g4ceu"}"></span>`;
  })}</div>` : ``}
</div>`;
});
const css$1 = {
  code: ".swipeable-item.svelte-1ks2opm{position:absolute;top:0;bottom:0;left:0;right:0;transition-timing-function:ease-out}",
  map: null
};
const SwipeItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { active = false } = $$props;
  let { classes = "" } = $$props;
  let { style = "" } = $$props;
  let { allow_dynamic_height = false } = $$props;
  let swipeItemInner = null;
  let _height = 0;
  createEventDispatcher();
  function firehHeightChange() {
  }
  if ($$props.active === void 0 && $$bindings.active && active !== void 0)
    $$bindings.active(active);
  if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0)
    $$bindings.classes(classes);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0)
    $$bindings.style(style);
  if ($$props.allow_dynamic_height === void 0 && $$bindings.allow_dynamic_height && allow_dynamic_height !== void 0)
    $$bindings.allow_dynamic_height(allow_dynamic_height);
  $$result.css.add(css$1);
  {
    allow_dynamic_height && active && _height && requestAnimationFrame(firehHeightChange);
  }
  return `<div class="${"swipeable-item " + escape(classes, true) + " " + escape(active ? "is-active" : "", true) + " svelte-1ks2opm"}"${add_attribute("style", style, 0)}><div class="${"swipeable-item-inner"}"${add_attribute("this", swipeItemInner, 0)}>${slots.default ? slots.default({}) : ``}</div>
</div>`;
});
const css = {
  code: ":root{--sv-swipe-indicator-active-color:white}.is-stack.svelte-1oyxu6g.svelte-1oyxu6g{height:300px;width:100%}.swipe-holder.svelte-1oyxu6g.svelte-1oyxu6g{height:30vh;width:100%}.custom-button.svelte-1oyxu6g.svelte-1oyxu6g{background-color:#4caf50;border:none;color:white;padding:15px 32px;text-align:center;text-decoration:none;display:inline-block;font-size:16px}.is-center.svelte-1oyxu6g.svelte-1oyxu6g{display:flex;justify-content:center;align-items:center}img.svelte-1oyxu6g.svelte-1oyxu6g{max-width:100%;height:auto}.has-pointer-event.svelte-1oyxu6g.svelte-1oyxu6g{pointer-events:fill}.github-corner.svelte-1oyxu6g:hover .octo-arm.svelte-1oyxu6g{animation:svelte-1oyxu6g-octocat-wave 560ms ease-in-out}@keyframes svelte-1oyxu6g-octocat-wave{0%,100%{transform:rotate(0)}20%,60%{transform:rotate(-25deg)}40%,80%{transform:rotate(10deg)}}@media(max-width: 500px){.github-corner.svelte-1oyxu6g:hover .octo-arm.svelte-1oyxu6g{animation:none}.github-corner.svelte-1oyxu6g .octo-arm.svelte-1oyxu6g{animation:svelte-1oyxu6g-octocat-wave 560ms ease-in-out}}.top-buffer.svelte-1oyxu6g.svelte-1oyxu6g{margin-top:20px}",
  map: null
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  const swipeConfig = {
    autoplay: false,
    showIndicators: false,
    transitionDuration: 200,
    defaultIndex: 0
  };
  let active_item = 0;
  let customThumbnail = false;
  let SwipeComp;
  let images = ["images/1.jpg", "images/2.jpg", "images/3.jpg", "images/4.jpg"];
  let tabs = [
    { name: "Deafult", value: "default" },
    { name: "Vertical", value: "vertical" },
    {
      name: "Allow Pointer",
      value: "allow-pointer"
    },
    {
      name: "Dynamic Height",
      value: "dynamic-height"
    },
    {
      name: "Infinite Swipe",
      value: "infinite-swipe"
    }
  ];
  let active_tab = "default";
  $$result.css.add(css);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<a href="${"https://github.com/SharifClick/svelte-swipe"}" class="${"github-corner svelte-1oyxu6g"}" aria-label="${"View source on GitHub"}"><svg width="${"80"}" height="${"80"}" viewBox="${"0 0 250 250"}" style="${"fill:#151513; color:#fff; position: absolute; top: 0; border: 0; right: 0;"}" aria-hidden="${"true"}"><path d="${"M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"}"></path><path d="${"M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6\r\n      120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3\r\n      125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"}" fill="${"currentColor"}" style="${"transform-origin: 130px 106px;"}" class="${"octo-arm svelte-1oyxu6g"}"></path><path d="${"M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6\r\n      C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0\r\n      C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1\r\n      C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4\r\n      C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9\r\n      C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5\r\n      C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9\r\n      L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"}" fill="${"currentColor"}" class="${"octo-body"}"></path></svg></a>
<div class="${"container"}"><div class="${"row"}" style="${"margin-top:20px"}"><div class="${"col"}"><h1 class="${"text-muted"}">Svelte Swipe</h1>
      <p class="${"text-muted"}">Swipable items wrapper component for Svelte</p></div></div>
  <div class="${"row"}"><div class="${"col"}"><ul class="${"nav nav-tabs"}">${each(tabs, (tab) => {
      return `<li class="${"nav-item"}"><button class="${"nav-link " + escape(tab.value == active_tab ? "active" : "", true)}" type="${"button"}">${escape(tab.name)}</button>
          </li>`;
    })}</ul></div></div>
  <div class="${"row top-buffer svelte-1oyxu6g"}"><div class="${"col"}"><div class="${"tab-content"}"><div class="${"tab-pane fade " + escape("show active", true)}"><div class="${"row"}"><div class="${"col"}"><div class="${"form-check form-check-inline float-right"}"><input class="${"form-check-input"}" type="${"checkbox"}"${add_attribute("checked", swipeConfig.showIndicators, 1)}>
                <label class="${"text-muted"}">Built-in Indicators</label></div>
              <div class="${"form-check form-check-inline float-right"}"><input class="${"form-check-input"}" type="${"checkbox"}"${add_attribute("checked", customThumbnail, 1)}>
                <label class="${"text-muted"}">Custom Thumbnail</label></div></div></div>
          <div class="${"row"}"><div class="${"col"}"><div class="${"swipe-holder svelte-1oyxu6g"}">${validate_component(Swipe, "Swipe").$$render(
      $$result,
      Object.assign({}, swipeConfig, { active_item }, { this: SwipeComp }),
      {
        active_item: ($$value) => {
          active_item = $$value;
          $$settled = false;
        },
        this: ($$value) => {
          SwipeComp = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${each(images, (image) => {
            return `${validate_component(SwipeItem, "SwipeItem").$$render($$result, {}, {}, {
              default: () => {
                return `<img class="${"img-fluid svelte-1oyxu6g"}"${add_attribute("src", image, 0)} alt="${""}">
                    `;
              }
            })}`;
          })}`;
        }
      }
    )}</div></div></div>
          <div class="${"row"}" style="${"margin-top:10px"}"><div class="${"col"}"><input class="${"btn btn-info btn-sm"}" type="${"button"}"${add_attribute("value", swipeConfig.autoplay ? "Stop" : "Play", 0)}></div>
            ${``}
            <div class="${"col"}"><div class="${"btn-group float-right"}"><button type="${"button"}" class="${"btn btn-secondary btn-sm"}">Prev
                </button>
                <button type="${"button"}" class="${"btn btn-secondary btn-sm"}">Next
                </button></div></div></div></div>
        ${``}
        ${``}
        ${``}
        ${``}</div></div></div>
</div>`;
  } while (!$$settled);
  return $$rendered;
});

export { Page as default };
//# sourceMappingURL=_page.svelte-8373d18a.js.map
