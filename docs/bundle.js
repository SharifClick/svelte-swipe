
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\Swipe.svelte generated by Svelte v3.9.1 */

    const file = "src\\Swipe.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.x = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (264:3) {#if showIndicators}
    function create_if_block(ctx) {
    	var div;

    	var each_value = ctx.indicators;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div, "class", "swipe-indicator swipe-indicator-inside svelte-pbdz13");
    			add_location(div, file, 264, 5, 6765);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update_1(changed, ctx) {
    			if (changed.activeIndicator || changed.indicators) {
    				each_value = ctx.indicators;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (266:8) {#each indicators as x, i }
    function create_each_block(ctx) {
    	var span, span_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			span = element("span");
    			attr(span, "class", span_class_value = "dot " + (ctx.activeIndicator == ctx.i ? 'is-active' : '') + " svelte-pbdz13");
    			add_location(span, file, 266, 10, 6866);
    			dispose = listen(span, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update_1(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.activeIndicator) && span_class_value !== (span_class_value = "dot " + (ctx.activeIndicator == ctx.i ? 'is-active' : '') + " svelte-pbdz13")) {
    				attr(span, "class", span_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(span);
    			}

    			dispose();
    		}
    	};
    }

    function create_fragment(ctx) {
    	var div4, div2, div1, div0, t0, div3, t1, current, dispose;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	var if_block = (ctx.showIndicators) && create_if_block(ctx);

    	return {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");

    			if (default_slot) default_slot.c();
    			t0 = space();
    			div3 = element("div");
    			t1 = space();
    			if (if_block) if_block.c();

    			attr(div0, "class", "swipeable-slot-wrapper svelte-pbdz13");
    			add_location(div0, file, 257, 6, 6526);
    			attr(div1, "class", "swipeable-total_elements svelte-pbdz13");
    			add_location(div1, file, 256, 4, 6480);
    			attr(div2, "class", "swipe-item-wrapper svelte-pbdz13");
    			add_location(div2, file, 255, 2, 6417);
    			attr(div3, "class", "swipe-handler svelte-pbdz13");
    			add_location(div3, file, 262, 2, 6620);
    			attr(div4, "class", "swipe-panel svelte-pbdz13");
    			add_location(div4, file, 254, 0, 6388);

    			dispose = [
    				listen(div3, "touchstart", ctx.onMoveStart),
    				listen(div3, "mousedown", ctx.onMoveStart)
    			];
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div0_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div4, anchor);
    			append(div4, div2);
    			append(div2, div1);
    			append(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			ctx.div2_binding(div2);
    			append(div4, t0);
    			append(div4, div3);
    			ctx.div3_binding(div3);
    			append(div4, t1);
    			if (if_block) if_block.m(div4, null);
    			current = true;
    		},

    		p: function update_1(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (ctx.showIndicators) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div4);
    			}

    			if (default_slot) default_slot.d(detaching);
    			ctx.div2_binding(null);
    			ctx.div3_binding(null);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    }

    function normalizeEventBehavior(e) {
      e && e.stopImmediatePropagation();
      e && e.stopPropagation();
    }

    function instance($$self, $$props, $$invalidate) {
    	let { transitionDuration = 200, showIndicators = false, autoplay = false, delay = 1000, defaultIndex = 0, active_item = 0, is_vertical = false } = $$props;

      let activeIndicator = 0,
        indicators,
        total_elements = 0,
        availableSpace = 0,
        availableWidth = 0,
        swipeElements,
        availableDistance = 0,
        swipeWrapper,
        swipeHandler,
        pos_axis = 0,
        page_axis = is_vertical ? 'pageY' : 'pageX',
        axis,
        longTouch,
        last_axis_pos;



      let played = defaultIndex || 0;
      let run_interval = false;

      function init(){
        swipeElements = swipeWrapper.querySelectorAll('.swipeable-item');
        $$invalidate('total_elements', total_elements = swipeElements.length);
        update();
      }

      function update(){
        let {offsetWidth, offsetHeight} = swipeWrapper.querySelector('.swipeable-total_elements');
        availableSpace = is_vertical ? offsetHeight : offsetWidth;
         [...swipeElements].forEach((element, i) => {
          element.style.transform = generateTranslateValue(availableSpace * i);
        });
        availableDistance = 0;
        availableWidth = availableSpace * (total_elements - 1);
        if(defaultIndex){
          changeItem(defaultIndex);
        }
      }

      // helpers
      function eventDelegate(type) {
        let delegationTypes = {
          add: 'addEventListener',
          remove: 'removeEventListener'
        };
        if (typeof window !== 'undefined') {
          window[delegationTypes[type]]('mousemove', onMove);
          window[delegationTypes[type]]('mouseup', onEnd);
          window[delegationTypes[type]]('touchmove', onMove);
          window[delegationTypes[type]]('touchend', onEnd);
        }
      }

      function generateTranslateValue(value){
        return  is_vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
      }

      function generateTouchPosCss(value, touch_end = false){
        let transformString = generateTranslateValue(value);
        let _css = `
      -webkit-transition-duration: ${touch_end ? transitionDuration : '0'}ms;
      transition-duration: ${touch_end ? transitionDuration : '0'}ms;
      -webkit-transform: ${transformString};
      -ms-transform: ${transformString};`;
        return _css;
      }


      onMount(() => {
        init();
        if (typeof window !== 'undefined') {
          window.addEventListener('resize', update);
        }
      });



      onDestroy(()=>{
        if (typeof window !== 'undefined') {
          window.removeEventListener('resize', update);
        }
      });



      let touch_active = false;

      function onMove(e){
        if (touch_active) {
          normalizeEventBehavior(e);
          let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis],
            distance = (axis - _axis) + pos_axis;
          if (distance <= availableWidth && distance >= 0) {
            [...swipeElements].forEach((element, i) => {
              element.style.cssText = generateTouchPosCss((availableSpace * i) - distance);
            });
            availableDistance = distance;
            last_axis_pos = _axis;
          }
        }
      }

      function onMoveStart(e){
        normalizeEventBehavior(e);
        touch_active = true;
        longTouch = false;
        setTimeout(function() {
          longTouch = true;
        }, 250);
        axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
        eventDelegate('add');
      }

      function onEnd(e) {
        normalizeEventBehavior(e);
        let direction = axis < last_axis_pos;
        touch_active = false;
        let _as = availableSpace;
        let accidental_touch = Math.round(availableSpace / 50) > Math.abs(axis - last_axis_pos);
        if(longTouch || accidental_touch){
          availableDistance = Math.round((availableDistance / _as)) * _as;
        }else{
          availableDistance = direction ? Math.floor((availableDistance / _as))  * _as : Math.ceil((availableDistance / _as))  * _as;
        }

        axis = null;
        last_axis_pos = null;
        pos_axis = availableDistance;
        $$invalidate('activeIndicator', activeIndicator = (availableDistance / _as));

        [...swipeElements].forEach((element, i) => {
          element.style.cssText = generateTouchPosCss((_as * i) - pos_axis, true);
        });

        $$invalidate('active_item', active_item = activeIndicator);
        eventDelegate('remove');
      }

      function changeItem(item) {
        let max = availableSpace;
        availableDistance = max * item;
        $$invalidate('activeIndicator', activeIndicator = item);
        onEnd();
      }

      function changeView() {
        changeItem(played);
        played = played < (total_elements - 1) ? ++played : 0;  }

      function goTo(step) {
        let item = Math.max(0, Math.min(step, indicators.length - 1));
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

    	const writable_props = ['transitionDuration', 'showIndicators', 'autoplay', 'delay', 'defaultIndex', 'active_item', 'is_vertical'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Swipe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('swipeWrapper', swipeWrapper = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('swipeHandler', swipeHandler = $$value);
    		});
    	}

    	function click_handler({ i }) {changeItem(i);}

    	$$self.$set = $$props => {
    		if ('transitionDuration' in $$props) $$invalidate('transitionDuration', transitionDuration = $$props.transitionDuration);
    		if ('showIndicators' in $$props) $$invalidate('showIndicators', showIndicators = $$props.showIndicators);
    		if ('autoplay' in $$props) $$invalidate('autoplay', autoplay = $$props.autoplay);
    		if ('delay' in $$props) $$invalidate('delay', delay = $$props.delay);
    		if ('defaultIndex' in $$props) $$invalidate('defaultIndex', defaultIndex = $$props.defaultIndex);
    		if ('active_item' in $$props) $$invalidate('active_item', active_item = $$props.active_item);
    		if ('is_vertical' in $$props) $$invalidate('is_vertical', is_vertical = $$props.is_vertical);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { total_elements: 1, autoplay: 1, run_interval: 1, delay: 1 }) => {
    		if ($$dirty.total_elements) { $$invalidate('indicators', indicators = Array(total_elements)); }
    		if ($$dirty.autoplay || $$dirty.run_interval || $$dirty.delay) { {
            if(autoplay && !run_interval){
              $$invalidate('run_interval', run_interval = setInterval(changeView , delay));
            }
        
            if(!autoplay && run_interval){
              clearInterval(run_interval);
              $$invalidate('run_interval', run_interval = false);
            }
          } }
    	};

    	return {
    		transitionDuration,
    		showIndicators,
    		autoplay,
    		delay,
    		defaultIndex,
    		active_item,
    		is_vertical,
    		activeIndicator,
    		indicators,
    		swipeWrapper,
    		swipeHandler,
    		onMoveStart,
    		changeItem,
    		goTo,
    		prevItem,
    		nextItem,
    		div2_binding,
    		div3_binding,
    		click_handler,
    		$$slots,
    		$$scope
    	};
    }

    class Swipe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["transitionDuration", "showIndicators", "autoplay", "delay", "defaultIndex", "active_item", "is_vertical", "goTo", "prevItem", "nextItem"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.goTo === undefined && !('goTo' in props)) {
    			console.warn("<Swipe> was created without expected prop 'goTo'");
    		}
    		if (ctx.prevItem === undefined && !('prevItem' in props)) {
    			console.warn("<Swipe> was created without expected prop 'prevItem'");
    		}
    		if (ctx.nextItem === undefined && !('nextItem' in props)) {
    			console.warn("<Swipe> was created without expected prop 'nextItem'");
    		}
    	}

    	get transitionDuration() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionDuration(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get showIndicators() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set showIndicators(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplay() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplay(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get delay() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set delay(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get defaultIndex() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set defaultIndex(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active_item() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active_item(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get is_vertical() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set is_vertical(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goTo() {
    		return this.$$.ctx.goTo;
    	}

    	set goTo(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prevItem() {
    		return this.$$.ctx.prevItem;
    	}

    	set prevItem(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextItem() {
    		return this.$$.ctx.nextItem;
    	}

    	set nextItem(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SwipeItem.svelte generated by Svelte v3.9.1 */

    const file$1 = "src\\SwipeItem.svelte";

    function create_fragment$1(ctx) {
    	var div, div_class_value, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	return {
    		c: function create() {
    			div = element("div");

    			if (default_slot) default_slot.c();

    			attr(div, "class", div_class_value = "swipeable-item " + ctx.classes + " svelte-exn8e7");
    			add_location(div, file$1, 15, 0, 224);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(div_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if ((!current || changed.classes) && div_class_value !== (div_class_value = "swipeable-item " + ctx.classes + " svelte-exn8e7")) {
    				attr(div, "class", div_class_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { classes = '' } = $$props;

    	const writable_props = ['classes'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SwipeItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('classes' in $$props) $$invalidate('classes', classes = $$props.classes);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	return { classes, $$slots, $$scope };
    }

    class SwipeItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["classes"]);
    	}

    	get classes() {
    		throw new Error("<SwipeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<SwipeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* dev\App.svelte generated by Svelte v3.9.1 */

    const file$2 = "dev\\App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.image = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.image = list[i];
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.image = list[i];
    	return child_ctx;
    }

    // (170:12) <SwipeItem>
    function create_default_slot_8(ctx) {
    	var img, img_src_value, t;

    	return {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr(img, "class", "img-fluid svelte-18aj70p");
    			attr(img, "src", img_src_value = ctx.image);
    			attr(img, "alt", "");
    			add_location(img, file$2, 170, 14, 4298);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    				detach(t);
    			}
    		}
    	};
    }

    // (169:10) {#each images as image}
    function create_each_block_2(ctx) {
    	var current;

    	var swipeitem = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_8] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			swipeitem.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(swipeitem, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var swipeitem_changes = {};
    			if (changed.$$scope) swipeitem_changes.$$scope = { changed, ctx };
    			swipeitem.$set(swipeitem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(swipeitem.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(swipeitem.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(swipeitem, detaching);
    		}
    	};
    }

    // (168:8) <Swipe {...swipeConfig} bind:active_item bind:this={SwipeComp}>
    function create_default_slot_7(ctx) {
    	var each_1_anchor, current;

    	var each_value_2 = ctx.images;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.images) {
    				each_value_2 = ctx.images;

    				for (var i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value_2.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_2.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (186:4) {#if customThumbnail}
    function create_if_block$1(ctx) {
    	var div1, div0;

    	var each_value_1 = ctx.images;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "is-center svelte-18aj70p");
    			add_location(div0, file$2, 187, 8, 4743);
    			attr(div1, "class", "col svelte-18aj70p");
    			add_location(div1, file$2, 186, 6, 4716);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.active_item || changed.images) {
    				each_value_1 = ctx.images;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (189:10) {#each images as image, i}
    function create_each_block_1(ctx) {
    	var img, img_class_value, img_src_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "class", img_class_value = "img-fluid " + (ctx.active_item == ctx.i ? 'rounded' : 'img-thumbnail') + " svelte-18aj70p");
    			set_style(img, "height", "30px");
    			set_style(img, "width", "30px");
    			set_style(img, "cursor", "pointer");
    			attr(img, "src", img_src_value = ctx.image);
    			attr(img, "alt", "");
    			add_location(img, file$2, 189, 12, 4818);
    			dispose = listen(img, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.active_item) && img_class_value !== (img_class_value = "img-fluid " + (ctx.active_item == ctx.i ? 'rounded' : 'img-thumbnail') + " svelte-18aj70p")) {
    				attr(img, "class", img_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    			}

    			dispose();
    		}
    	};
    }

    // (225:12) <SwipeItem>
    function create_default_slot_6(ctx) {
    	var img, img_src_value, t;

    	return {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr(img, "class", "img-fluid svelte-18aj70p");
    			attr(img, "src", img_src_value = ctx.image);
    			attr(img, "alt", "");
    			add_location(img, file$2, 225, 14, 5783);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    			insert(target, t, anchor);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(img);
    				detach(t);
    			}
    		}
    	};
    }

    // (224:10) {#each images as image}
    function create_each_block$1(ctx) {
    	var current;

    	var swipeitem = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_6] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			swipeitem.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(swipeitem, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var swipeitem_changes = {};
    			if (changed.$$scope) swipeitem_changes.$$scope = { changed, ctx };
    			swipeitem.$set(swipeitem_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(swipeitem.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(swipeitem.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(swipeitem, detaching);
    		}
    	};
    }

    // (223:8) <Swipe is_vertical={true}>
    function create_default_slot_5(ctx) {
    	var each_1_anchor, current;

    	var each_value = ctx.images;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.images) {
    				each_value = ctx.images;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value.length; i += 1) transition_in(each_blocks[i]);

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) transition_out(each_blocks[i]);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    // (238:6) <SwipeItem>
    function create_default_slot_4(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-18aj70p");
    			add_location(button, file$2, 239, 10, 6150);
    			attr(div, "class", "is-stack is-center svelte-18aj70p");
    			set_style(div, "background", "teal");
    			add_location(div, file$2, 238, 8, 6082);
    			dispose = listen(button, "click", sayHi);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (246:6) <SwipeItem>
    function create_default_slot_3(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-18aj70p");
    			add_location(button, file$2, 247, 10, 6398);
    			attr(div, "class", "is-stack is-center svelte-18aj70p");
    			set_style(div, "background", "yellowgreen");
    			add_location(div, file$2, 246, 8, 6323);
    			dispose = listen(button, "click", sayHi);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (254:6) <SwipeItem>
    function create_default_slot_2(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-18aj70p");
    			add_location(button, file$2, 255, 10, 6639);
    			attr(div, "class", "is-stack is-center svelte-18aj70p");
    			set_style(div, "background", "aqua");
    			add_location(div, file$2, 254, 8, 6571);
    			dispose = listen(button, "click", sayHi);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (262:6) <SwipeItem>
    function create_default_slot_1(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-18aj70p");
    			add_location(button, file$2, 263, 10, 6886);
    			attr(div, "class", "is-stack is-center svelte-18aj70p");
    			set_style(div, "background", "lightcoral");
    			add_location(div, file$2, 262, 8, 6812);
    			dispose = listen(button, "click", sayHi);
    		},

    		m: function mount(target, anchor) {
    			insert(target, div, anchor);
    			append(div, button);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div);
    			}

    			dispose();
    		}
    	};
    }

    // (237:4) <Swipe>
    function create_default_slot(ctx) {
    	var t0, t1, t2, current;

    	var swipeitem0 = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var swipeitem1 = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var swipeitem2 = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var swipeitem3 = new SwipeItem({
    		props: {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			swipeitem0.$$.fragment.c();
    			t0 = space();
    			swipeitem1.$$.fragment.c();
    			t1 = space();
    			swipeitem2.$$.fragment.c();
    			t2 = space();
    			swipeitem3.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(swipeitem0, target, anchor);
    			insert(target, t0, anchor);
    			mount_component(swipeitem1, target, anchor);
    			insert(target, t1, anchor);
    			mount_component(swipeitem2, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(swipeitem3, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var swipeitem0_changes = {};
    			if (changed.$$scope) swipeitem0_changes.$$scope = { changed, ctx };
    			swipeitem0.$set(swipeitem0_changes);

    			var swipeitem1_changes = {};
    			if (changed.$$scope) swipeitem1_changes.$$scope = { changed, ctx };
    			swipeitem1.$set(swipeitem1_changes);

    			var swipeitem2_changes = {};
    			if (changed.$$scope) swipeitem2_changes.$$scope = { changed, ctx };
    			swipeitem2.$set(swipeitem2_changes);

    			var swipeitem3_changes = {};
    			if (changed.$$scope) swipeitem3_changes.$$scope = { changed, ctx };
    			swipeitem3.$set(swipeitem3_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(swipeitem0.$$.fragment, local);

    			transition_in(swipeitem1.$$.fragment, local);

    			transition_in(swipeitem2.$$.fragment, local);

    			transition_in(swipeitem3.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(swipeitem0.$$.fragment, local);
    			transition_out(swipeitem1.$$.fragment, local);
    			transition_out(swipeitem2.$$.fragment, local);
    			transition_out(swipeitem3.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(swipeitem0, detaching);

    			if (detaching) {
    				detach(t0);
    			}

    			destroy_component(swipeitem1, detaching);

    			if (detaching) {
    				detach(t1);
    			}

    			destroy_component(swipeitem2, detaching);

    			if (detaching) {
    				detach(t2);
    			}

    			destroy_component(swipeitem3, detaching);
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	var a, svg, path0, path1, path2, t0, div18, div1, div0, h1, t2, p0, t4, div5, div4, div2, input0, t5, label0, t7, div3, input1, t8, label1, t10, div8, div7, div6, updating_active_item, t11, div12, div9, input2, input2_value_value, t12, t13, div11, div10, button0, t15, button1, t17, hr0, t18, p1, t20, div15, div14, div13, t21, hr1, t22, p2, t24, div16, t25, div17, current, dispose;

    	var swipe0_spread_levels = [
    		ctx.swipeConfig
    	];

    	function swipe0_active_item_binding(value) {
    		ctx.swipe0_active_item_binding.call(null, value);
    		updating_active_item = true;
    		add_flush_callback(() => updating_active_item = false);
    	}

    	let swipe0_props = {
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};
    	for (var i = 0; i < swipe0_spread_levels.length; i += 1) {
    		swipe0_props = assign(swipe0_props, swipe0_spread_levels[i]);
    	}
    	if (ctx.active_item !== void 0) {
    		swipe0_props.active_item = ctx.active_item;
    	}
    	var swipe0 = new Swipe({ props: swipe0_props, $$inline: true });

    	binding_callbacks.push(() => bind(swipe0, 'active_item', swipe0_active_item_binding));
    	ctx.swipe0_binding(swipe0);

    	var if_block = (ctx.customThumbnail) && create_if_block$1(ctx);

    	var swipe1 = new Swipe({
    		props: {
    		is_vertical: true,
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var swipe2 = new Swipe({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			div18 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte Swipe";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Swipable items wrapper component for Svelte";
    			t4 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t5 = space();
    			label0 = element("label");
    			label0.textContent = "Built-in Indicators";
    			t7 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t8 = space();
    			label1 = element("label");
    			label1.textContent = "Custom Thumbnail";
    			t10 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			swipe0.$$.fragment.c();
    			t11 = space();
    			div12 = element("div");
    			div9 = element("div");
    			input2 = element("input");
    			t12 = space();
    			if (if_block) if_block.c();
    			t13 = space();
    			div11 = element("div");
    			div10 = element("div");
    			button0 = element("button");
    			button0.textContent = "Prev";
    			t15 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t17 = space();
    			hr0 = element("hr");
    			t18 = space();
    			p1 = element("p");
    			p1.textContent = "Vertical Swipe 🔥";
    			t20 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			swipe1.$$.fragment.c();
    			t21 = space();
    			hr1 = element("hr");
    			t22 = space();
    			p2 = element("p");
    			p2.textContent = "Also allow pointer events inside Swipe Item";
    			t24 = space();
    			div16 = element("div");
    			swipe2.$$.fragment.c();
    			t25 = space();
    			div17 = element("div");
    			attr(path0, "d", "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z");
    			attr(path0, "class", "svelte-18aj70p");
    			add_location(path0, file$2, 118, 4, 2174);
    			attr(path1, "d", "M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6\r\n      120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3\r\n      125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2");
    			attr(path1, "fill", "currentColor");
    			set_style(path1, "transform-origin", "130px 106px");
    			attr(path1, "class", "octo-arm svelte-18aj70p");
    			add_location(path1, file$2, 119, 4, 2242);
    			attr(path2, "d", "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6\r\n      C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0\r\n      C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1\r\n      C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4\r\n      C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9\r\n      C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5\r\n      C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9\r\n      L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z");
    			attr(path2, "fill", "currentColor");
    			attr(path2, "class", "octo-body svelte-18aj70p");
    			add_location(path2, file$2, 126, 4, 2563);
    			attr(svg, "width", "80");
    			attr(svg, "height", "80");
    			attr(svg, "viewBox", "0 0 250 250");
    			set_style(svg, "fill", "#151513");
    			set_style(svg, "color", "#fff");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "top", "0");
    			set_style(svg, "border", "0");
    			set_style(svg, "right", "0");
    			attr(svg, "aria-hidden", "true");
    			attr(svg, "class", "svelte-18aj70p");
    			add_location(svg, file$2, 111, 2, 1986);
    			attr(a, "href", "https://github.com/SharifClick/svelte-swipe");
    			attr(a, "class", "github-corner svelte-18aj70p");
    			attr(a, "aria-label", "View source on GitHub");
    			add_location(a, file$2, 107, 0, 1862);
    			attr(h1, "class", "text-muted svelte-18aj70p");
    			add_location(h1, file$2, 142, 6, 3332);
    			attr(p0, "class", "text-muted svelte-18aj70p");
    			add_location(p0, file$2, 143, 6, 3380);
    			attr(div0, "class", "col svelte-18aj70p");
    			add_location(div0, file$2, 141, 4, 3307);
    			attr(div1, "class", "row svelte-18aj70p");
    			set_style(div1, "margin-top", "20px");
    			add_location(div1, file$2, 140, 2, 3260);
    			attr(input0, "class", "form-check-input svelte-18aj70p");
    			attr(input0, "type", "checkbox");
    			add_location(input0, file$2, 149, 8, 3587);
    			attr(label0, "class", "text-muted svelte-18aj70p");
    			add_location(label0, file$2, 153, 8, 3722);
    			attr(div2, "class", "form-check form-check-inline float-right svelte-18aj70p");
    			add_location(div2, file$2, 148, 6, 3523);
    			attr(input1, "class", "form-check-input svelte-18aj70p");
    			attr(input1, "type", "checkbox");
    			add_location(input1, file$2, 156, 8, 3861);
    			attr(label1, "class", "text-muted svelte-18aj70p");
    			add_location(label1, file$2, 160, 8, 3985);
    			attr(div3, "class", "form-check form-check-inline float-right svelte-18aj70p");
    			add_location(div3, file$2, 155, 6, 3797);
    			attr(div4, "class", "col svelte-18aj70p");
    			add_location(div4, file$2, 147, 4, 3498);
    			attr(div5, "class", "row svelte-18aj70p");
    			add_location(div5, file$2, 146, 2, 3475);
    			attr(div6, "class", "swipe-holder svelte-18aj70p");
    			add_location(div6, file$2, 166, 6, 4123);
    			attr(div7, "class", "col svelte-18aj70p");
    			add_location(div7, file$2, 165, 4, 4098);
    			attr(div8, "class", "row svelte-18aj70p");
    			add_location(div8, file$2, 164, 2, 4075);
    			attr(input2, "class", "btn btn-info btn-sm svelte-18aj70p");
    			attr(input2, "type", "button");
    			input2.value = input2_value_value = ctx.swipeConfig.autoplay ? 'Stop' : 'Play';
    			add_location(input2, file$2, 179, 6, 4517);
    			attr(div9, "class", "col svelte-18aj70p");
    			add_location(div9, file$2, 178, 4, 4492);
    			attr(button0, "type", "button");
    			attr(button0, "class", "btn btn-secondary btn-sm svelte-18aj70p");
    			add_location(button0, file$2, 201, 8, 5200);
    			attr(button1, "type", "button");
    			attr(button1, "class", "btn btn-secondary btn-sm svelte-18aj70p");
    			add_location(button1, file$2, 207, 8, 5354);
    			attr(div10, "class", "btn-group float-right svelte-18aj70p");
    			add_location(div10, file$2, 200, 6, 5155);
    			attr(div11, "class", "col svelte-18aj70p");
    			add_location(div11, file$2, 199, 4, 5130);
    			attr(div12, "class", "row svelte-18aj70p");
    			set_style(div12, "margin-top", "10px");
    			add_location(div12, file$2, 177, 2, 4445);
    			attr(hr0, "class", "svelte-18aj70p");
    			add_location(hr0, file$2, 217, 2, 5540);
    			attr(p1, "class", "text-muted svelte-18aj70p");
    			add_location(p1, file$2, 218, 2, 5550);
    			attr(div13, "class", "swipe-holder svelte-18aj70p");
    			add_location(div13, file$2, 221, 6, 5645);
    			attr(div14, "class", "col svelte-18aj70p");
    			add_location(div14, file$2, 220, 4, 5620);
    			attr(div15, "class", "row svelte-18aj70p");
    			add_location(div15, file$2, 219, 2, 5597);
    			attr(hr1, "class", "svelte-18aj70p");
    			add_location(hr1, file$2, 233, 2, 5931);
    			attr(p2, "class", "text-muted svelte-18aj70p");
    			add_location(p2, file$2, 234, 2, 5941);
    			attr(div16, "class", "swipe-holder svelte-18aj70p");
    			add_location(div16, file$2, 235, 2, 6014);
    			attr(div17, "class", "row mt-3 svelte-18aj70p");
    			add_location(div17, file$2, 271, 2, 7058);
    			attr(div18, "class", "container svelte-18aj70p");
    			add_location(div18, file$2, 139, 0, 3233);

    			dispose = [
    				listen(input0, "change", ctx.input0_change_handler),
    				listen(input1, "change", ctx.input1_change_handler),
    				listen(input2, "click", ctx.toggle),
    				listen(button0, "click", ctx.prevSlide),
    				listen(button1, "click", ctx.nextSlide)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, a, anchor);
    			append(a, svg);
    			append(svg, path0);
    			append(svg, path1);
    			append(svg, path2);
    			insert(target, t0, anchor);
    			insert(target, div18, anchor);
    			append(div18, div1);
    			append(div1, div0);
    			append(div0, h1);
    			append(div0, t2);
    			append(div0, p0);
    			append(div18, t4);
    			append(div18, div5);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, input0);

    			input0.checked = ctx.swipeConfig.showIndicators;

    			append(div2, t5);
    			append(div2, label0);
    			append(div4, t7);
    			append(div4, div3);
    			append(div3, input1);

    			input1.checked = ctx.customThumbnail;

    			append(div3, t8);
    			append(div3, label1);
    			append(div18, t10);
    			append(div18, div8);
    			append(div8, div7);
    			append(div7, div6);
    			mount_component(swipe0, div6, null);
    			append(div18, t11);
    			append(div18, div12);
    			append(div12, div9);
    			append(div9, input2);
    			append(div12, t12);
    			if (if_block) if_block.m(div12, null);
    			append(div12, t13);
    			append(div12, div11);
    			append(div11, div10);
    			append(div10, button0);
    			append(div10, t15);
    			append(div10, button1);
    			append(div18, t17);
    			append(div18, hr0);
    			append(div18, t18);
    			append(div18, p1);
    			append(div18, t20);
    			append(div18, div15);
    			append(div15, div14);
    			append(div14, div13);
    			mount_component(swipe1, div13, null);
    			append(div18, t21);
    			append(div18, hr1);
    			append(div18, t22);
    			append(div18, p2);
    			append(div18, t24);
    			append(div18, div16);
    			mount_component(swipe2, div16, null);
    			append(div18, t25);
    			append(div18, div17);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.swipeConfig) input0.checked = ctx.swipeConfig.showIndicators;
    			if (changed.customThumbnail) input1.checked = ctx.customThumbnail;

    			var swipe0_changes = (changed.swipeConfig) ? get_spread_update(swipe0_spread_levels, [
    									ctx.swipeConfig
    								]) : {};
    			if (changed.$$scope) swipe0_changes.$$scope = { changed, ctx };
    			if (!updating_active_item && changed.active_item) {
    				swipe0_changes.active_item = ctx.active_item;
    			}
    			swipe0.$set(swipe0_changes);

    			if ((!current || changed.swipeConfig) && input2_value_value !== (input2_value_value = ctx.swipeConfig.autoplay ? 'Stop' : 'Play')) {
    				input2.value = input2_value_value;
    			}

    			if (ctx.customThumbnail) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div12, t13);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			var swipe1_changes = {};
    			if (changed.$$scope) swipe1_changes.$$scope = { changed, ctx };
    			swipe1.$set(swipe1_changes);

    			var swipe2_changes = {};
    			if (changed.$$scope) swipe2_changes.$$scope = { changed, ctx };
    			swipe2.$set(swipe2_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(swipe0.$$.fragment, local);

    			transition_in(swipe1.$$.fragment, local);

    			transition_in(swipe2.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(swipe0.$$.fragment, local);
    			transition_out(swipe1.$$.fragment, local);
    			transition_out(swipe2.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(a);
    				detach(t0);
    				detach(div18);
    			}

    			ctx.swipe0_binding(null);

    			destroy_component(swipe0);

    			if (if_block) if_block.d();

    			destroy_component(swipe1);

    			destroy_component(swipe2);

    			run_all(dispose);
    		}
    	};
    }

    function sayHi() {
      alert("Hi");
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const swipeConfig = {
        autoplay: false,
        showIndicators: false,
        transitionDuration: 200,
        defaultIndex: 0
      };

      let active_item = 0; //readonly

      let customThumbnail = false;

      let SwipeComp;

      function toggle() {
        swipeConfig.autoplay = !swipeConfig.autoplay; $$invalidate('swipeConfig', swipeConfig);
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

      let images = [
        "./images/1.jpg",
        "./images/2.jpg",
        "./images/3.jpg",
        "./images/4.jpg"
      ];

    	function input0_change_handler() {
    		swipeConfig.showIndicators = this.checked;
    		$$invalidate('swipeConfig', swipeConfig);
    	}

    	function input1_change_handler() {
    		customThumbnail = this.checked;
    		$$invalidate('customThumbnail', customThumbnail);
    	}

    	function swipe0_active_item_binding(value) {
    		active_item = value;
    		$$invalidate('active_item', active_item);
    	}

    	function swipe0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$$invalidate('SwipeComp', SwipeComp = $$value);
    		});
    	}

    	function click_handler({ i }) {
    		return changeSlide(i);
    	}

    	return {
    		swipeConfig,
    		active_item,
    		customThumbnail,
    		SwipeComp,
    		toggle,
    		nextSlide,
    		prevSlide,
    		changeSlide,
    		images,
    		input0_change_handler,
    		input1_change_handler,
    		swipe0_active_item_binding,
    		swipe0_binding,
    		click_handler
    	};
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, []);
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
