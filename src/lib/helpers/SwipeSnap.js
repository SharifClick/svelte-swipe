/**
 * A class for creating a swipeable carousel with snapping behavior.
 * @class
 */

class SwipeSnap {
  /**
   * Creates an instance of SwipeSnap.
   * @constructor
   * @param {Object} [options={}] - Options for configuring the SwipeSnap carousel.
   * @param {HTMLElement} [options.element] - The HTML element that contains the carousel.
   * @param {boolean} [options.is_vertical=false] - Whether the carousel is vertical (true) or horizontal (false).
   * @param {number} [options.transition_duration=300] - The duration of the transition animation in milliseconds.
   * @param {boolean} [options.allow_infinite_swipe=false] - Whether to allow infinite looping of carousel items.
   * @param {function} [options.fire] - A function to trigger events when carousel items change.
   */

  constructor(options = {}) {
    this.element = options.element;
    this.wrapper = this.element && this.element.querySelector('.swipeable-slot-wrapper');
    this.elements = this.wrapper && this.wrapper.querySelectorAll('.swipeable-item');
    this.elements_count = this.elements && this.elements.length;

    this.is_vertical = options.is_vertical;
    this.transition_duration = options.transition_duration;
    this.allow_infinite_swipe = options.allow_infinite_swipe;
    this.fire = options.fire;

    this.pos_axis = 0;
    this.page_axis = options.is_vertical ? 'pageY' : 'pageX';
    this.axis = 0;
    this.long_touch = false;
    this.last_axis_pos = 0;
    this.default_index = 0;
    this.active_indicator = 0;
    this.active_item = 0;
    this.touch_active = false;

    if (options.allow_infinite_swipe) {
      this.setInfiniteSwipe();
    }

    this.SWIPE = this.swipe.bind(this);
    this.SWIPE_END = this.swipeEnd.bind(this);
  }

  /**
   * Prevents the default behavior of an event.
   * @param {Event} event - The event to prevent.
   */

  prevent(event) {
    if (event && event.cancelable) {
      event.preventDefault();
    }
    event && event.stopImmediatePropagation();
    event && event.stopPropagation();
  }

  update() {
    let { offsetWidth, offsetHeight } = this.wrapper;
    this.available_space = this.is_vertical ? offsetHeight : offsetWidth;

    this.setElementsPosition({
      init: true,
      elems: [...this.elements],
      available_space: this.available_space,
      has_infinite_loop: this.allow_infinite_swipe
    });

    this.available_distance = 0;
    this.available_measure = this.available_space * (this.elements_count - 1);
    if (this.default_index) {
      this.changeItem(this.default_index);
    }
  }

  setInfiniteSwipe() {
    this.wrapper.prepend(this.elements[this.elements_count - 1].cloneNode(true));
    this.wrapper.append(this.elements[0].cloneNode(true));
    this.elements = this.element.querySelectorAll('.swipeable-item');
  }

  setElementsPosition({
    elems = [],
    available_space = 0,
    pos_axis = 0,
    has_infinite_loop = false,
    distance = 0,
    moving = false,
    init = false,
    end = false,
    reset = false
  }) {
    elems.forEach((element, i) => {
      let idx = has_infinite_loop ? i - 1 : i;
      if (init) {
        element.style.transform = this.generateTranslateValue(available_space * idx);
        element.classList.remove('is-item-hidden');
      }
      if (moving) {
        element.style.cssText = this.generateTouchPosCss(available_space * idx - distance);
      }
      if (end) {
        element.style.cssText = this.generateTouchPosCss(available_space * idx - pos_axis, true);
      }
      if (reset) {
        element.style.cssText = this.generateTouchPosCss(available_space * idx - pos_axis);
      }
    });
  }

  generateTranslateValue(value) {
    return this.is_vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
  }

  generateTouchPosCss(value, touch_end = false) {
    let transform_string = this.generateTranslateValue(value);
    let _css = `
-webkit-transition-duration: ${touch_end ? this.transition_duration : '0'}ms;
transition-duration: ${touch_end ? this.transition_duration : '0'}ms;
-webkit-transform: ${transform_string};
-ms-transform: ${transform_string};`;
    return _css;
  }

  swipeStart(event) {
    this.prevent(event);
    this.touch_active = true;
    this.long_touch = false;
    setTimeout(() => {
      this.long_touch = true;
    }, 250);
    this.axis = event.touches ? event.touches[0][this.page_axis] : event[this.page_axis];
    this.eventDelegate('add');
  }

  swipe(event) {
    if (this.touch_active) {
      this.prevent(event);
      let axis = event.touches ? event.touches[0][this.page_axis] : event[this.page_axis];
      let distance = this.axis - axis + this.pos_axis;
      if (!this.allow_infinite_swipe) {
        if (
          (this.pos_axis == 0 && this.axis < axis) ||
          (this.pos_axis == this.available_measure && this.axis > axis)
        ) {
          return;
        }
      }
      event.preventDefault();

      // if (distance <= availableMeasure && distance >= 0) {
      // }
      this.setElementsPosition({
        moving: true,
        elems: [...this.elements],
        available_space: this.available_space,
        has_infinite_loop: this.allow_infinite_swipe,
        distance
      });
      this.available_distance = distance;
      this.last_axis_pos = axis;
    }
  }

  swipeEnd(event) {
    console.log('swipeEnd', event);
    this.prevent(event);
    let direction = this.axis < this.last_axis_pos;
    this.touch_active = false;
    let available_space = this.available_space;
    let accidental_touch =
      Math.round(this.available_space / 50) > Math.abs(this.axis - this.last_axis_pos);
    if (this.long_touch || accidental_touch) {
      this.available_distance =
        Math.round(this.available_distance / available_space) * available_space;
    } else {
      this.available_distance = direction
        ? Math.floor(this.available_distance / available_space) * available_space
        : Math.ceil(this.available_distance / available_space) * available_space;
    }
    this.axis = null;
    this.last_axis_pos = null;
    this.pos_axis = this.available_distance;
    this.active_indicator = this.available_distance / available_space;
    this.active_item = this.active_indicator;
    this.default_index = this.active_item;

    console.log(this.active_indicator);

    this.setElementsPosition({
      end: true,
      elems: [...this.elements],
      available_space: available_space,
      pos_axis: this.pos_axis,
      has_infinite_loop: this.allow_infinite_swipe
    });

    if (this.allow_infinite_swipe) {
      if (this.active_item === -1) {
        this.pos_axis = available_space * (this.elements_count - 1);
      }
      if (this.active_item === this.elements_count) {
        this.pos_axis = 0;
      }
      this.active_indicator = this.pos_axis / available_space;
      this.active_item = this.active_indicator;
      this.default_index = this.active_item;

      setTimeout(() => {
        this.setElementsPosition({
          reset: true,
          elems: [...this.elements],
          available_space: available_space,
          pos_axis: this.pos_axis,
          has_infinite_loop: this.allow_infinite_swipe
        });
      }, this.transition_duration);
    }
    let swipe_direction = direction ? 'right' : 'left';
    this.eventDelegate('remove');

    this.fire('change', {
      active_item: this.active_item,
      swipe_direction,
      active_element: this.elements[this.active_item]
    });
  }

  eventDelegate(type) {
    let delegationTypes = {
      add: 'addEventListener',
      remove: 'removeEventListener'
    };
    if (typeof window !== 'undefined') {
      window[delegationTypes[type]]('mousemove', this.SWIPE);
      window[delegationTypes[type]]('mouseup', this.SWIPE_END);
      window[delegationTypes[type]]('touchmove', this.SWIPE, { passive: false });
      window[delegationTypes[type]]('touchend', this.SWIPE_END, { passive: false });
    }
  }

  changeItem(item) {
    let max = this.available_space;
    this.available_distance = max * item;
    this.active_indicator = item;
    this.swipeEnd();
  }

  goTo(step) {
    let item = this.allow_infinite_swipe
      ? step
      : Math.max(0, Math.min(step, this.elements_count - 1));
    this.changeItem(item);
  }

  prevItem() {
    let step = this.active_indicator - 1;
    this.goTo(step);
  }

  nextItem() {
    let step = this.active_indicator + 1;
    this.goTo(step);
  }

  getProps() {
    return {
      elements_count: this.elements_count,
      active_item: this.active_item,
      active_element: this.active_element
    };
  }
}

export default SwipeSnap;
