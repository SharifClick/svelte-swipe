
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

    // (260:3) {#if showIndicators}
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
    			attr(div, "class", "swipe-indicator swipe-indicator-inside svelte-ch1qj4");
    			add_location(div, file, 260, 5, 6228);
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

    // (262:8) {#each indicators as x, i }
    function create_each_block(ctx) {
    	var span, span_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			span = element("span");
    			attr(span, "class", span_class_value = "dot " + (ctx.activeIndicator == ctx.i ? 'is-active' : '') + " svelte-ch1qj4");
    			add_location(span, file, 262, 10, 6329);
    			dispose = listen(span, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, span, anchor);
    		},

    		p: function update_1(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.activeIndicator) && span_class_value !== (span_class_value = "dot " + (ctx.activeIndicator == ctx.i ? 'is-active' : '') + " svelte-ch1qj4")) {
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

    			attr(div0, "class", "swipeable-slot-wrapper svelte-ch1qj4");
    			add_location(div0, file, 253, 6, 5993);
    			attr(div1, "class", "swipeable-items svelte-ch1qj4");
    			add_location(div1, file, 252, 4, 5956);
    			attr(div2, "class", "swipe-item-wrapper svelte-ch1qj4");
    			add_location(div2, file, 251, 2, 5893);
    			attr(div3, "class", "swipe-handler svelte-ch1qj4");
    			add_location(div3, file, 258, 2, 6087);
    			attr(div4, "class", "swipe-panel svelte-ch1qj4");
    			add_location(div4, file, 250, 0, 5864);

    			dispose = [
    				listen(div3, "touchstart", ctx.moveStart),
    				listen(div3, "mousedown", ctx.moveStart)
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

    let topClearence = 0;

    let min = 0;

    function instance($$self, $$props, $$invalidate) {
    	let { transitionDuration = 200, showIndicators = false, autoplay = false, delay = 1000, defaultIndex = 0, active_item = 0 } = $$props; //readonly

      let activeIndicator = 0;
      let indicators;
      let items = 0;
      let availableWidth = 0;

      let elems;
      let diff = 0;

      let swipeWrapper;
      let swipeHandler;
      let touchingTpl = `
    -webkit-transition-duration: 0s;
    transition-duration: 0s;
    -webkit-transform: translate3d(-{{val}}px, 0, 0);
    -ms-transform: translate3d(-{{val}}px, 0, 0);`;
      let non_touchingTpl = `
    -webkit-transition-duration: ${transitionDuration}ms;
    transition-duration: ${transitionDuration}ms;
    -webkit-transform: translate3d(-{{val}}px, 0, 0);
    -ms-transform: translate3d(-{{val}}px, 0, 0);`;
      let touching = false;
      let posX = 0;
      let x;



      let played = defaultIndex || 0;
      let run_interval = false;


      function update(){
        swipeHandler.style.top = topClearence + 'px'; $$invalidate('swipeHandler', swipeHandler);
        availableWidth = swipeWrapper.querySelector('.swipeable-items').offsetWidth;
        for (let i = 0; i < items; i++) {
          elems[i].style.transform = 'translate3d(' + (availableWidth * i) + 'px, 0, 0)';    }
        diff = 0;
        if(defaultIndex){
          changeItem(defaultIndex);
        }
      }

      function init(){
        elems = swipeWrapper.querySelectorAll('.swipeable-item');
        $$invalidate('items', items = elems.length);
        update();
      }

      onMount(() => {
        init();
        window.addEventListener('resize', update);
      });



      onDestroy(()=>{
        window.removeEventListener('resize', update);
      });

      function moveHandler(e){
        if (touching) {
          e.stopImmediatePropagation();
          e.stopPropagation();


          let max = availableWidth;

          let _x = e.touches ? e.touches[0].pageX : e.pageX;
          let _diff = (x - _x) + posX;
          let dir = _x > x ? 0 : 1;
          if (!dir) { _diff = posX - (_x - x); }
          if (_diff <= (max * (items - 1)) && _diff >= min) {

            for (let i = 0; i < items; i++) {
              let template = i < 0 ? '{{val}}' : '-{{val}}';
              let _value = (max * i) - _diff;
              elems[i].style.cssText = touchingTpl.replace(template, _value).replace(template, _value);        }

            diff = _diff;
          }

        }
      }

      function endHandler(e) {
        e && e.stopImmediatePropagation();
        e && e.stopPropagation();
        e && e.preventDefault();

        let max = availableWidth;

        touching = false;
        x = null;



        let swipe_threshold = 0.85;
        let d_max = (diff / max);
        let _target = Math.round(d_max);

        if(Math.abs(_target - d_max) < swipe_threshold ){
          diff = _target * max;
        }else{
          diff = ( (_target + 1)) * max;
        }

        posX = diff;
        $$invalidate('activeIndicator', activeIndicator = (diff / max));
        for (let i = 0; i < items; i++) {
          let template = i < 0 ? '{{val}}' : '-{{val}}';
          let _value = (max * i) - posX;
          elems[i].style.cssText = non_touchingTpl.replace(template, _value).replace(template, _value);    }
        $$invalidate('active_item', active_item = activeIndicator);
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseup', endHandler);
        window.removeEventListener('touchmove', moveHandler);
        window.removeEventListener('touchend', endHandler);
      }

      function moveStart(e){
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();

        touching = true;
        x = e.touches ? e.touches[0].pageX : e.pageX;
        window.addEventListener('mousemove', moveHandler);
        window.addEventListener('mouseup', endHandler);
        window.addEventListener('touchmove', moveHandler);
        window.addEventListener('touchend', endHandler);
      }

      function changeItem(item) {
        let max = availableWidth;
        diff = max * item;
        $$invalidate('activeIndicator', activeIndicator = item);
        endHandler();
      }

      function changeView() {
        changeItem(played);
        played = played < (items - 1) ? ++played : 0;  }

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

    	const writable_props = ['transitionDuration', 'showIndicators', 'autoplay', 'delay', 'defaultIndex', 'active_item'];
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
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = ($$dirty = { items: 1, autoplay: 1, run_interval: 1, delay: 1 }) => {
    		if ($$dirty.items) { $$invalidate('indicators', indicators = Array(items)); }
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
    		activeIndicator,
    		indicators,
    		swipeWrapper,
    		swipeHandler,
    		moveStart,
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
    		init(this, options, instance, create_fragment, safe_not_equal, ["transitionDuration", "showIndicators", "autoplay", "delay", "defaultIndex", "active_item", "goTo", "prevItem", "nextItem"]);

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
    	child_ctx.i = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.image = list[i];
    	return child_ctx;
    }

    // (117:12) <SwipeItem>
    function create_default_slot_6(ctx) {
    	var img, img_src_value, t;

    	return {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr(img, "class", "img-fluid svelte-r89ix1");
    			attr(img, "src", img_src_value = ctx.image);
    			attr(img, "alt", "");
    			add_location(img, file$2, 117, 14, 2435);
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

    // (116:10) {#each images as image}
    function create_each_block_1(ctx) {
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

    // (115:8) <Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex} bind:active_item bind:this={SwipeComp}>
    function create_default_slot_5(ctx) {
    	var each_1_anchor, current;

    	var each_value_1 = ctx.images;

    	var each_blocks = [];

    	for (var i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
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
    				each_value_1 = ctx.images;

    				for (var i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value_1.length; i < each_blocks.length; i += 1) out(i);
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (var i = 0; i < each_value_1.length; i += 1) transition_in(each_blocks[i]);

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

    // (129:4) {#if customThumbnail}
    function create_if_block$1(ctx) {
    	var div1, div0;

    	var each_value = ctx.images;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr(div0, "class", "is-center svelte-r89ix1");
    			add_location(div0, file$2, 130, 8, 2827);
    			attr(div1, "class", "col svelte-r89ix1");
    			add_location(div1, file$2, 129, 6, 2800);
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
    				each_value = ctx.images;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
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
    				detach(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    }

    // (132:10) {#each images as image, i}
    function create_each_block$1(ctx) {
    	var img, img_class_value, img_src_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	return {
    		c: function create() {
    			img = element("img");
    			attr(img, "class", img_class_value = "img-fluid " + (ctx.active_item == ctx.i ? 'rounded' : 'img-thumbnail') + " svelte-r89ix1");
    			set_style(img, "height", "30px");
    			set_style(img, "width", "30px");
    			set_style(img, "cursor", "pointer");
    			attr(img, "src", img_src_value = ctx.image);
    			attr(img, "alt", "");
    			add_location(img, file$2, 132, 12, 2902);
    			dispose = listen(img, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert(target, img, anchor);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.active_item) && img_class_value !== (img_class_value = "img-fluid " + (ctx.active_item == ctx.i ? 'rounded' : 'img-thumbnail') + " svelte-r89ix1")) {
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

    // (151:6) <SwipeItem>
    function create_default_slot_4(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-r89ix1");
    			add_location(button, file$2, 152, 10, 3593);
    			attr(div, "class", "is-stack is-center svelte-r89ix1");
    			set_style(div, "background", "teal");
    			add_location(div, file$2, 151, 8, 3525);
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

    // (157:6) <SwipeItem>
    function create_default_slot_3(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-r89ix1");
    			add_location(button, file$2, 158, 10, 3815);
    			attr(div, "class", "is-stack is-center svelte-r89ix1");
    			set_style(div, "background", "yellowgreen");
    			add_location(div, file$2, 157, 8, 3740);
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

    // (163:6) <SwipeItem>
    function create_default_slot_2(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-r89ix1");
    			add_location(button, file$2, 164, 10, 4030);
    			attr(div, "class", "is-stack is-center svelte-r89ix1");
    			set_style(div, "background", "aqua");
    			add_location(div, file$2, 163, 8, 3962);
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

    // (169:6) <SwipeItem>
    function create_default_slot_1(ctx) {
    	var div, button, dispose;

    	return {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr(button, "class", "custom-button has-pointer-event svelte-r89ix1");
    			add_location(button, file$2, 170, 10, 4251);
    			attr(div, "class", "is-stack is-center svelte-r89ix1");
    			set_style(div, "background", "lightcoral");
    			add_location(div, file$2, 169, 8, 4177);
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

    // (150:4) <Swipe>
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
    	var div14, div1, div0, h1, t1, div5, div4, div2, input0, t2, label0, t4, div3, input1, t5, label1, t7, div8, div7, div6, updating_active_item, t8, div12, div9, input2, input2_value_value, t9, t10, div11, div10, button0, t12, button1, t14, hr, t15, div13, current, dispose;

    	function swipe0_active_item_binding(value) {
    		ctx.swipe0_active_item_binding.call(null, value);
    		updating_active_item = true;
    		add_flush_callback(() => updating_active_item = false);
    	}

    	let swipe0_props = {
    		showIndicators: ctx.showIndicators,
    		autoplay: ctx.autoplay,
    		delay: delay,
    		transitionDuration: transitionDuration,
    		defaultIndex: defaultIndex,
    		$$slots: { default: [create_default_slot_5] },
    		$$scope: { ctx }
    	};
    	if (ctx.active_item !== void 0) {
    		swipe0_props.active_item = ctx.active_item;
    	}
    	var swipe0 = new Swipe({ props: swipe0_props, $$inline: true });

    	binding_callbacks.push(() => bind(swipe0, 'active_item', swipe0_active_item_binding));
    	ctx.swipe0_binding(swipe0);

    	var if_block = (ctx.customThumbnail) && create_if_block$1(ctx);

    	var swipe1 = new Swipe({
    		props: {
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			div14 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Swipable items wrapper component for Svelte";
    			t1 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t2 = space();
    			label0 = element("label");
    			label0.textContent = "Built-in Indicators";
    			t4 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t5 = space();
    			label1 = element("label");
    			label1.textContent = "Custom Thumbnail";
    			t7 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			swipe0.$$.fragment.c();
    			t8 = space();
    			div12 = element("div");
    			div9 = element("div");
    			input2 = element("input");
    			t9 = space();
    			if (if_block) if_block.c();
    			t10 = space();
    			div11 = element("div");
    			div10 = element("div");
    			button0 = element("button");
    			button0.textContent = "Prev";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t14 = space();
    			hr = element("hr");
    			t15 = space();
    			div13 = element("div");
    			swipe1.$$.fragment.c();
    			attr(h1, "class", "display-4 svelte-r89ix1");
    			add_location(h1, file$2, 92, 6, 1521);
    			attr(div0, "class", "col svelte-r89ix1");
    			add_location(div0, file$2, 91, 4, 1496);
    			attr(div1, "class", "row svelte-r89ix1");
    			set_style(div1, "margin-top", "20px");
    			add_location(div1, file$2, 90, 2, 1449);
    			attr(input0, "class", "form-check-input svelte-r89ix1");
    			attr(input0, "type", "checkbox");
    			add_location(input0, file$2, 98, 6, 1725);
    			attr(label0, "class", "text-muted svelte-r89ix1");
    			add_location(label0, file$2, 99, 6, 1812);
    			attr(div2, "class", "form-check form-check-inline float-right svelte-r89ix1");
    			add_location(div2, file$2, 97, 4, 1663);
    			attr(input1, "class", "form-check-input svelte-r89ix1");
    			attr(input1, "type", "checkbox");
    			add_location(input1, file$2, 104, 6, 1963);
    			attr(label1, "class", "text-muted svelte-r89ix1");
    			add_location(label1, file$2, 105, 6, 2051);
    			attr(div3, "class", "form-check form-check-inline float-right svelte-r89ix1");
    			add_location(div3, file$2, 103, 4, 1901);
    			attr(div4, "class", "col svelte-r89ix1");
    			add_location(div4, file$2, 96, 4, 1640);
    			attr(div5, "class", "row svelte-r89ix1");
    			add_location(div5, file$2, 95, 2, 1617);
    			attr(div6, "class", "swipe-holder svelte-r89ix1");
    			add_location(div6, file$2, 113, 6, 2205);
    			attr(div7, "class", "col svelte-r89ix1");
    			add_location(div7, file$2, 112, 4, 2180);
    			attr(div8, "class", "row svelte-r89ix1");
    			add_location(div8, file$2, 111, 2, 2157);
    			attr(input2, "class", "btn btn-info btn-sm svelte-r89ix1");
    			attr(input2, "type", "button");
    			input2.value = input2_value_value = ctx.autoplay ? 'Stop': 'Play';
    			add_location(input2, file$2, 126, 6, 2652);
    			attr(div9, "class", "col svelte-r89ix1");
    			add_location(div9, file$2, 125, 4, 2627);
    			attr(button0, "type", "button");
    			attr(button0, "class", "btn btn-secondary btn-sm svelte-r89ix1");
    			add_location(button0, file$2, 139, 8, 3209);
    			attr(button1, "type", "button");
    			attr(button1, "class", "btn btn-secondary btn-sm svelte-r89ix1");
    			add_location(button1, file$2, 140, 8, 3308);
    			attr(div10, "class", "btn-group float-right svelte-r89ix1");
    			add_location(div10, file$2, 138, 6, 3164);
    			attr(div11, "class", "col svelte-r89ix1");
    			add_location(div11, file$2, 137, 4, 3139);
    			attr(div12, "class", "row svelte-r89ix1");
    			set_style(div12, "margin-top", "10px");
    			add_location(div12, file$2, 124, 2, 2580);
    			attr(hr, "class", "svelte-r89ix1");
    			add_location(hr, file$2, 146, 2, 3447);
    			attr(div13, "class", "swipe-holder svelte-r89ix1");
    			add_location(div13, file$2, 148, 2, 3457);
    			attr(div14, "class", "container svelte-r89ix1");
    			add_location(div14, file$2, 88, 0, 1419);

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
    			insert(target, div14, anchor);
    			append(div14, div1);
    			append(div1, div0);
    			append(div0, h1);
    			append(div14, t1);
    			append(div14, div5);
    			append(div5, div4);
    			append(div4, div2);
    			append(div2, input0);

    			input0.checked = ctx.showIndicators;

    			append(div2, t2);
    			append(div2, label0);
    			append(div4, t4);
    			append(div4, div3);
    			append(div3, input1);

    			input1.checked = ctx.customThumbnail;

    			append(div3, t5);
    			append(div3, label1);
    			append(div14, t7);
    			append(div14, div8);
    			append(div8, div7);
    			append(div7, div6);
    			mount_component(swipe0, div6, null);
    			append(div14, t8);
    			append(div14, div12);
    			append(div12, div9);
    			append(div9, input2);
    			append(div12, t9);
    			if (if_block) if_block.m(div12, null);
    			append(div12, t10);
    			append(div12, div11);
    			append(div11, div10);
    			append(div10, button0);
    			append(div10, t12);
    			append(div10, button1);
    			append(div14, t14);
    			append(div14, hr);
    			append(div14, t15);
    			append(div14, div13);
    			mount_component(swipe1, div13, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.showIndicators) input0.checked = ctx.showIndicators;
    			if (changed.customThumbnail) input1.checked = ctx.customThumbnail;

    			var swipe0_changes = {};
    			if (changed.showIndicators) swipe0_changes.showIndicators = ctx.showIndicators;
    			if (changed.autoplay) swipe0_changes.autoplay = ctx.autoplay;
    			if (changed.delay) swipe0_changes.delay = delay;
    			if (changed.transitionDuration) swipe0_changes.transitionDuration = transitionDuration;
    			if (changed.defaultIndex) swipe0_changes.defaultIndex = defaultIndex;
    			if (changed.$$scope) swipe0_changes.$$scope = { changed, ctx };
    			if (!updating_active_item && changed.active_item) {
    				swipe0_changes.active_item = ctx.active_item;
    			}
    			swipe0.$set(swipe0_changes);

    			if ((!current || changed.autoplay) && input2_value_value !== (input2_value_value = ctx.autoplay ? 'Stop': 'Play')) {
    				input2.value = input2_value_value;
    			}

    			if (ctx.customThumbnail) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div12, t10);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			var swipe1_changes = {};
    			if (changed.$$scope) swipe1_changes.$$scope = { changed, ctx };
    			swipe1.$set(swipe1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(swipe0.$$.fragment, local);

    			transition_in(swipe1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(swipe0.$$.fragment, local);
    			transition_out(swipe1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div14);
    			}

    			ctx.swipe0_binding(null);

    			destroy_component(swipe0);

    			if (if_block) if_block.d();

    			destroy_component(swipe1);

    			run_all(dispose);
    		}
    	};
    }

    let delay = 2000;

    let transitionDuration = 200;

    let defaultIndex = 0;

    function sayHi(){
      alert('Hi');
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let autoplay = false;
      let showIndicators = false;

      let active_item = 0; //readonly


      let customThumbnail = false;

      let SwipeComp;
      
      function toggle(){
        $$invalidate('autoplay', autoplay = !autoplay);
      }

      function nextSlide(){
       SwipeComp.nextItem();
      }

      function prevSlide(){
        SwipeComp.prevItem();
      }

       function changeSlide(i){
        SwipeComp.goTo(i);
      }

      let images = [
        "./images/1.jpg",
        "./images/2.jpg",
        "./images/3.jpg",
        "./images/4.jpg"
      ];

    	function input0_change_handler() {
    		showIndicators = this.checked;
    		$$invalidate('showIndicators', showIndicators);
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
    		autoplay,
    		showIndicators,
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
