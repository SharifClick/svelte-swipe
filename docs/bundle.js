
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
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
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
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
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.21.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
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
        $capture_state() { }
        $inject_state() { }
    }

    /* src/Swipe.svelte generated by Svelte v3.21.0 */
    const file = "src/Swipe.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[43] = list[i];
    	child_ctx[45] = i;
    	return child_ctx;
    }

    // (268:3) {#if showIndicators}
    function create_if_block(ctx) {
    	let div;
    	let each_value = /*indicators*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "swipe-indicator swipe-indicator-inside svelte-1dixg8e");
    			toggle_class(div, "reverse", /*direction_reverse*/ ctx[1]);
    			add_location(div, file, 268, 5, 6800);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeIndicator, changeItem, indicators*/ 140) {
    				each_value = /*indicators*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty[0] & /*direction_reverse*/ 2) {
    				toggle_class(div, "reverse", /*direction_reverse*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(268:3) {#if showIndicators}",
    		ctx
    	});

    	return block;
    }

    // (270:8) {#each indicators as x, i }
    function create_each_block(ctx) {
    	let span;
    	let span_class_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[42](/*i*/ ctx[45], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");

    			attr_dev(span, "class", span_class_value = "dot " + (/*activeIndicator*/ ctx[2] == /*i*/ ctx[45]
    			? "is-active"
    			: "") + " svelte-1dixg8e");

    			add_location(span, file, 270, 10, 6933);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*activeIndicator*/ 4 && span_class_value !== (span_class_value = "dot " + (/*activeIndicator*/ ctx[2] == /*i*/ ctx[45]
    			? "is-active"
    			: "") + " svelte-1dixg8e")) {
    				attr_dev(span, "class", span_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(270:8) {#each indicators as x, i }",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div4;
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let div3;
    	let t1;
    	let current;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[39].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[38], null);
    	let if_block = /*showIndicators*/ ctx[0] && create_if_block(ctx);

    	const block = {
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
    			attr_dev(div0, "class", "swipeable-slot-wrapper svelte-1dixg8e");
    			add_location(div0, file, 261, 6, 6568);
    			attr_dev(div1, "class", "swipeable-total_elements svelte-1dixg8e");
    			add_location(div1, file, 260, 4, 6523);
    			attr_dev(div2, "class", "swipe-item-wrapper svelte-1dixg8e");
    			add_location(div2, file, 259, 2, 6461);
    			attr_dev(div3, "class", "swipe-handler svelte-1dixg8e");
    			add_location(div3, file, 266, 2, 6657);
    			attr_dev(div4, "class", "swipe-panel svelte-1dixg8e");
    			add_location(div4, file, 258, 0, 6433);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div2_binding*/ ctx[40](div2);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			/*div3_binding*/ ctx[41](div3);
    			append_dev(div4, t1);
    			if (if_block) if_block.m(div4, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div3, "touchstart", /*onMoveStart*/ ctx[6], false, false, false),
    				listen_dev(div3, "mousedown", /*onMoveStart*/ ctx[6], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 128) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[38], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[38], dirty, null));
    				}
    			}

    			if (/*showIndicators*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(div4);
    			if (default_slot) default_slot.d(detaching);
    			/*div2_binding*/ ctx[40](null);
    			/*div3_binding*/ ctx[41](null);
    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function normalizeEventBehavior(e) {
    	e && e.preventDefault();
    	e && e.stopImmediatePropagation();
    	e && e.stopPropagation();
    }

    function instance($$self, $$props, $$invalidate) {
    	let { transitionDuration = 200 } = $$props;
    	let { showIndicators = false } = $$props;
    	let { autoplay = false } = $$props;
    	let { delay = 1000 } = $$props;
    	let { defaultIndex = 0 } = $$props;
    	let { active_item = 0 } = $$props; //readonly
    	let { is_vertical = false } = $$props;
    	let { direction_reverse = false } = $$props;

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
    		page_axis = is_vertical ? "pageY" : "pageX",
    		axis,
    		longTouch,
    		last_axis_pos;

    	let played = defaultIndex || 0;
    	let run_interval = false;

    	function init() {
    		swipeElements = swipeWrapper.querySelectorAll(".swipeable-item");
    		$$invalidate(17, total_elements = swipeElements.length);
    		update();
    	}

    	function update() {
    		let { offsetWidth, offsetHeight } = swipeWrapper.querySelector(".swipeable-total_elements");
    		availableSpace = is_vertical ? offsetHeight : offsetWidth;

    		[...swipeElements].forEach((element, i) => {
    			element.style.transform = generateTranslateValue(availableSpace * i);
    		});

    		availableDistance = 0;
    		availableWidth = availableSpace * (total_elements - 1);

    		if (defaultIndex) {
    			changeItem(defaultIndex);
    		}
    	}

    	// helpers
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
    		return is_vertical
    		? `translate3d(0, ${value}px, 0)`
    		: `translate3d(${direction_reverse ? -value : value}px, 0, 0)`;
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

    	onMount(() => {
    		init();

    		if (typeof window !== "undefined") {
    			window.addEventListener("resize", update);
    		}
    	});

    	onDestroy(() => {
    		if (typeof window !== "undefined") {
    			window.removeEventListener("resize", update);
    		}
    	});

    	let touch_active = false;

    	function onMove(e) {
    		if (touch_active) {
    			normalizeEventBehavior(e);

    			let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis],
    				distance = direction_reverse && !is_vertical
    				? _axis - axis + pos_axis
    				: axis - _axis + pos_axis;

    			if (distance <= availableWidth && distance >= 0) {
    				[...swipeElements].forEach((element, i) => {
    					element.style.cssText = generateTouchPosCss(availableSpace * i - distance);
    				});

    				availableDistance = distance;
    				last_axis_pos = _axis;
    			}
    		}
    	}

    	function onMoveStart(e) {
    		normalizeEventBehavior(e);
    		touch_active = true;
    		longTouch = false;

    		setTimeout(
    			function () {
    				longTouch = true;
    			},
    			250
    		);

    		axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
    		eventDelegate("add");
    	}

    	function onEnd(e) {
    		normalizeEventBehavior(e);

    		let direction = direction_reverse
    		? axis > last_axis_pos
    		: axis < last_axis_pos;

    		touch_active = false;
    		let _as = availableSpace;
    		let accidental_touch = Math.round(availableSpace / 50) > Math.abs(axis - last_axis_pos);

    		if (longTouch || accidental_touch) {
    			availableDistance = Math.round(availableDistance / _as) * _as;
    		} else {
    			availableDistance = direction
    			? Math.floor(availableDistance / _as) * _as
    			: Math.ceil(availableDistance / _as) * _as;
    		}

    		axis = null;
    		last_axis_pos = null;
    		pos_axis = availableDistance;
    		$$invalidate(2, activeIndicator = availableDistance / _as);

    		[...swipeElements].forEach((element, i) => {
    			element.style.cssText = generateTouchPosCss(_as * i - pos_axis, true);
    		});

    		$$invalidate(9, active_item = activeIndicator);
    		$$invalidate(8, defaultIndex = active_item);
    		eventDelegate("remove");
    	}

    	function changeItem(item) {
    		let max = availableSpace;
    		availableDistance = max * item;
    		$$invalidate(2, activeIndicator = item);
    		onEnd();
    	}

    	function changeView() {
    		changeItem(played);
    		played = played < total_elements - 1 ? ++played : 0;
    	}

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

    	const writable_props = [
    		"transitionDuration",
    		"showIndicators",
    		"autoplay",
    		"delay",
    		"defaultIndex",
    		"active_item",
    		"is_vertical",
    		"direction_reverse"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Swipe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Swipe", $$slots, ['default']);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, swipeWrapper = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(5, swipeHandler = $$value);
    		});
    	}

    	const click_handler = i => {
    		changeItem(i);
    	};

    	$$self.$set = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(10, transitionDuration = $$props.transitionDuration);
    		if ("showIndicators" in $$props) $$invalidate(0, showIndicators = $$props.showIndicators);
    		if ("autoplay" in $$props) $$invalidate(11, autoplay = $$props.autoplay);
    		if ("delay" in $$props) $$invalidate(12, delay = $$props.delay);
    		if ("defaultIndex" in $$props) $$invalidate(8, defaultIndex = $$props.defaultIndex);
    		if ("active_item" in $$props) $$invalidate(9, active_item = $$props.active_item);
    		if ("is_vertical" in $$props) $$invalidate(13, is_vertical = $$props.is_vertical);
    		if ("direction_reverse" in $$props) $$invalidate(1, direction_reverse = $$props.direction_reverse);
    		if ("$$scope" in $$props) $$invalidate(38, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		transitionDuration,
    		showIndicators,
    		autoplay,
    		delay,
    		defaultIndex,
    		active_item,
    		is_vertical,
    		direction_reverse,
    		activeIndicator,
    		indicators,
    		total_elements,
    		availableSpace,
    		availableWidth,
    		swipeElements,
    		availableDistance,
    		swipeWrapper,
    		swipeHandler,
    		pos_axis,
    		page_axis,
    		axis,
    		longTouch,
    		last_axis_pos,
    		played,
    		run_interval,
    		init,
    		update,
    		eventDelegate,
    		normalizeEventBehavior,
    		generateTranslateValue,
    		generateTouchPosCss,
    		touch_active,
    		onMove,
    		onMoveStart,
    		onEnd,
    		changeItem,
    		changeView,
    		goTo,
    		prevItem,
    		nextItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(10, transitionDuration = $$props.transitionDuration);
    		if ("showIndicators" in $$props) $$invalidate(0, showIndicators = $$props.showIndicators);
    		if ("autoplay" in $$props) $$invalidate(11, autoplay = $$props.autoplay);
    		if ("delay" in $$props) $$invalidate(12, delay = $$props.delay);
    		if ("defaultIndex" in $$props) $$invalidate(8, defaultIndex = $$props.defaultIndex);
    		if ("active_item" in $$props) $$invalidate(9, active_item = $$props.active_item);
    		if ("is_vertical" in $$props) $$invalidate(13, is_vertical = $$props.is_vertical);
    		if ("direction_reverse" in $$props) $$invalidate(1, direction_reverse = $$props.direction_reverse);
    		if ("activeIndicator" in $$props) $$invalidate(2, activeIndicator = $$props.activeIndicator);
    		if ("indicators" in $$props) $$invalidate(3, indicators = $$props.indicators);
    		if ("total_elements" in $$props) $$invalidate(17, total_elements = $$props.total_elements);
    		if ("availableSpace" in $$props) availableSpace = $$props.availableSpace;
    		if ("availableWidth" in $$props) availableWidth = $$props.availableWidth;
    		if ("swipeElements" in $$props) swipeElements = $$props.swipeElements;
    		if ("availableDistance" in $$props) availableDistance = $$props.availableDistance;
    		if ("swipeWrapper" in $$props) $$invalidate(4, swipeWrapper = $$props.swipeWrapper);
    		if ("swipeHandler" in $$props) $$invalidate(5, swipeHandler = $$props.swipeHandler);
    		if ("pos_axis" in $$props) pos_axis = $$props.pos_axis;
    		if ("page_axis" in $$props) page_axis = $$props.page_axis;
    		if ("axis" in $$props) axis = $$props.axis;
    		if ("longTouch" in $$props) longTouch = $$props.longTouch;
    		if ("last_axis_pos" in $$props) last_axis_pos = $$props.last_axis_pos;
    		if ("played" in $$props) played = $$props.played;
    		if ("run_interval" in $$props) $$invalidate(27, run_interval = $$props.run_interval);
    		if ("touch_active" in $$props) touch_active = $$props.touch_active;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*total_elements*/ 131072) {
    			 $$invalidate(3, indicators = Array(total_elements));
    		}

    		if ($$self.$$.dirty[0] & /*autoplay, run_interval, delay*/ 134223872) {
    			 {
    				if (autoplay && !run_interval) {
    					$$invalidate(27, run_interval = setInterval(changeView, delay));
    				}

    				if (!autoplay && run_interval) {
    					clearInterval(run_interval);
    					$$invalidate(27, run_interval = false);
    				}
    			}
    		}
    	};

    	return [
    		showIndicators,
    		direction_reverse,
    		activeIndicator,
    		indicators,
    		swipeWrapper,
    		swipeHandler,
    		onMoveStart,
    		changeItem,
    		defaultIndex,
    		active_item,
    		transitionDuration,
    		autoplay,
    		delay,
    		is_vertical,
    		goTo,
    		prevItem,
    		nextItem,
    		total_elements,
    		availableSpace,
    		availableWidth,
    		swipeElements,
    		availableDistance,
    		pos_axis,
    		axis,
    		longTouch,
    		last_axis_pos,
    		played,
    		run_interval,
    		touch_active,
    		page_axis,
    		init,
    		update,
    		eventDelegate,
    		generateTranslateValue,
    		generateTouchPosCss,
    		onMove,
    		onEnd,
    		changeView,
    		$$scope,
    		$$slots,
    		div2_binding,
    		div3_binding,
    		click_handler
    	];
    }

    class Swipe extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				transitionDuration: 10,
    				showIndicators: 0,
    				autoplay: 11,
    				delay: 12,
    				defaultIndex: 8,
    				active_item: 9,
    				is_vertical: 13,
    				direction_reverse: 1,
    				goTo: 14,
    				prevItem: 15,
    				nextItem: 16
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Swipe",
    			options,
    			id: create_fragment.name
    		});
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

    	get direction_reverse() {
    		throw new Error("<Swipe>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction_reverse(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goTo() {
    		return this.$$.ctx[14];
    	}

    	set goTo(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prevItem() {
    		return this.$$.ctx[15];
    	}

    	set prevItem(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextItem() {
    		return this.$$.ctx[16];
    	}

    	set nextItem(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SwipeItem.svelte generated by Svelte v3.21.0 */

    const file$1 = "src/SwipeItem.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let div_class_value;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", div_class_value = "swipeable-item " + /*classes*/ ctx[0] + " svelte-1ks2opm");
    			add_location(div, file$1, 15, 0, 209);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 2) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[1], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null));
    				}
    			}

    			if (!current || dirty & /*classes*/ 1 && div_class_value !== (div_class_value = "swipeable-item " + /*classes*/ ctx[0] + " svelte-1ks2opm")) {
    				attr_dev(div, "class", div_class_value);
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
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { classes = "" } = $$props;
    	const writable_props = ["classes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SwipeItem> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("SwipeItem", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("classes" in $$props) $$invalidate(0, classes = $$props.classes);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ classes });

    	$$self.$inject_state = $$props => {
    		if ("classes" in $$props) $$invalidate(0, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [classes, $$scope, $$slots];
    }

    class SwipeItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { classes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SwipeItem",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get classes() {
    		throw new Error("<SwipeItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<SwipeItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* dev/App.svelte generated by Svelte v3.21.0 */
    const file$2 = "dev/App.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[19] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (178:12) <SwipeItem>
    function create_default_slot_8(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-fluid svelte-fybjfc");
    			if (img.src !== (img_src_value = /*image*/ ctx[15])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 178, 14, 4427);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_8.name,
    		type: "slot",
    		source: "(178:12) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (177:10) {#each images as image}
    function create_each_block_2(ctx) {
    	let current;

    	const swipeitem = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_8] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(swipeitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(swipeitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const swipeitem_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem_changes.$$scope = { dirty, ctx };
    			}

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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(177:10) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    // (176:8) <Swipe {...swipeConfig} bind:active_item bind:this={SwipeComp}>
    function create_default_slot_7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*images*/ ctx[8];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 256) {
    				each_value_2 = /*images*/ ctx[8];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_7.name,
    		type: "slot",
    		source: "(176:8) <Swipe {...swipeConfig} bind:active_item bind:this={SwipeComp}>",
    		ctx
    	});

    	return block;
    }

    // (194:4) {#if customThumbnail}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let div0_style_value;
    	let each_value_1 = /*images*/ ctx[8];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "is-center svelte-fybjfc");

    			attr_dev(div0, "style", div0_style_value = /*swipeConfig*/ ctx[0].direction_reverse
    			? "direction:rtl"
    			: "direction:ltr");

    			add_location(div0, file$2, 195, 8, 4855);
    			attr_dev(div1, "class", "col svelte-fybjfc");
    			add_location(div1, file$2, 194, 6, 4829);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*active_item, images, changeSlide*/ 386) {
    				each_value_1 = /*images*/ ctx[8];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (dirty & /*swipeConfig*/ 1 && div0_style_value !== (div0_style_value = /*swipeConfig*/ ctx[0].direction_reverse
    			? "direction:rtl"
    			: "direction:ltr")) {
    				attr_dev(div0, "style", div0_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(194:4) {#if customThumbnail}",
    		ctx
    	});

    	return block;
    }

    // (197:10) {#each images as image, i}
    function create_each_block_1(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[14](/*i*/ ctx[19], ...args);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");

    			attr_dev(img, "class", img_class_value = "img-fluid " + (/*active_item*/ ctx[1] == /*i*/ ctx[19]
    			? "rounded"
    			: "img-thumbnail") + " svelte-fybjfc");

    			set_style(img, "height", "30px");
    			set_style(img, "width", "30px");
    			set_style(img, "cursor", "pointer");
    			if (img.src !== (img_src_value = /*image*/ ctx[15])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 197, 12, 5002);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, img, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(img, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*active_item*/ 2 && img_class_value !== (img_class_value = "img-fluid " + (/*active_item*/ ctx[1] == /*i*/ ctx[19]
    			? "rounded"
    			: "img-thumbnail") + " svelte-fybjfc")) {
    				attr_dev(img, "class", img_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(197:10) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (233:12) <SwipeItem>
    function create_default_slot_6(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-fluid svelte-fybjfc");
    			if (img.src !== (img_src_value = /*image*/ ctx[15])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 233, 14, 5931);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_6.name,
    		type: "slot",
    		source: "(233:12) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (232:10) {#each images as image}
    function create_each_block$1(ctx) {
    	let current;

    	const swipeitem = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_6] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(swipeitem.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(swipeitem, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const swipeitem_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem_changes.$$scope = { dirty, ctx };
    			}

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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(232:10) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    // (231:8) <Swipe is_vertical={true}>
    function create_default_slot_5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*images*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*images*/ 256) {
    				each_value = /*images*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_5.name,
    		type: "slot",
    		source: "(231:8) <Swipe is_vertical={true}>",
    		ctx
    	});

    	return block;
    }

    // (246:6) <SwipeItem>
    function create_default_slot_4(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-fybjfc");
    			add_location(button, file$2, 247, 10, 6284);
    			attr_dev(div, "class", "is-stack is-center svelte-fybjfc");
    			set_style(div, "background", "teal");
    			add_location(div, file$2, 246, 8, 6217);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", sayHi, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_4.name,
    		type: "slot",
    		source: "(246:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (254:6) <SwipeItem>
    function create_default_slot_3(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-fybjfc");
    			add_location(button, file$2, 255, 10, 6524);
    			attr_dev(div, "class", "is-stack is-center svelte-fybjfc");
    			set_style(div, "background", "yellowgreen");
    			add_location(div, file$2, 254, 8, 6450);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", sayHi, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_3.name,
    		type: "slot",
    		source: "(254:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (262:6) <SwipeItem>
    function create_default_slot_2(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-fybjfc");
    			add_location(button, file$2, 263, 10, 6757);
    			attr_dev(div, "class", "is-stack is-center svelte-fybjfc");
    			set_style(div, "background", "aqua");
    			add_location(div, file$2, 262, 8, 6690);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", sayHi, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_2.name,
    		type: "slot",
    		source: "(262:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (270:6) <SwipeItem>
    function create_default_slot_1(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-fybjfc");
    			add_location(button, file$2, 271, 10, 6996);
    			attr_dev(div, "class", "is-stack is-center svelte-fybjfc");
    			set_style(div, "background", "lightcoral");
    			add_location(div, file$2, 270, 8, 6923);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", sayHi, false, false, false);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(270:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (245:4) <Swipe>
    function create_default_slot(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let current;

    	const swipeitem0 = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const swipeitem1 = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const swipeitem2 = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const swipeitem3 = new SwipeItem({
    			props: {
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(swipeitem0.$$.fragment);
    			t0 = space();
    			create_component(swipeitem1.$$.fragment);
    			t1 = space();
    			create_component(swipeitem2.$$.fragment);
    			t2 = space();
    			create_component(swipeitem3.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(swipeitem0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(swipeitem1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(swipeitem2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(swipeitem3, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const swipeitem0_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem0_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem0.$set(swipeitem0_changes);
    			const swipeitem1_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem1_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem1.$set(swipeitem1_changes);
    			const swipeitem2_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem2_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem2.$set(swipeitem2_changes);
    			const swipeitem3_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipeitem3_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach_dev(t0);
    			destroy_component(swipeitem1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(swipeitem2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(swipeitem3, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(245:4) <Swipe>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let a;
    	let svg;
    	let path0;
    	let path1;
    	let path2;
    	let t0;
    	let div19;
    	let div1;
    	let div0;
    	let h1;
    	let t2;
    	let p0;
    	let t4;
    	let div6;
    	let div5;
    	let div2;
    	let input0;
    	let t5;
    	let label0;
    	let t7;
    	let div3;
    	let input1;
    	let t8;
    	let label1;
    	let t10;
    	let div4;
    	let input2;
    	let t11;
    	let label2;
    	let t13;
    	let div9;
    	let div8;
    	let div7;
    	let updating_active_item;
    	let t14;
    	let div13;
    	let div10;
    	let input3;
    	let input3_value_value;
    	let t15;
    	let t16;
    	let div12;
    	let div11;
    	let button0;
    	let t18;
    	let button1;
    	let t20;
    	let hr0;
    	let t21;
    	let p1;
    	let t23;
    	let div16;
    	let div15;
    	let div14;
    	let t24;
    	let hr1;
    	let t25;
    	let p2;
    	let t27;
    	let div17;
    	let t28;
    	let div18;
    	let current;
    	let dispose;
    	const swipe0_spread_levels = [/*swipeConfig*/ ctx[0]];

    	function swipe0_active_item_binding(value) {
    		/*swipe0_active_item_binding*/ ctx[12].call(null, value);
    	}

    	let swipe0_props = {
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < swipe0_spread_levels.length; i += 1) {
    		swipe0_props = assign(swipe0_props, swipe0_spread_levels[i]);
    	}

    	if (/*active_item*/ ctx[1] !== void 0) {
    		swipe0_props.active_item = /*active_item*/ ctx[1];
    	}

    	const swipe0 = new Swipe({ props: swipe0_props, $$inline: true });
    	binding_callbacks.push(() => bind(swipe0, "active_item", swipe0_active_item_binding));
    	/*swipe0_binding*/ ctx[13](swipe0);
    	let if_block = /*customThumbnail*/ ctx[2] && create_if_block$1(ctx);

    	const swipe1 = new Swipe({
    			props: {
    				is_vertical: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const swipe2 = new Swipe({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			div19 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte Swipe";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "Swipable items wrapper component for Svelte";
    			t4 = space();
    			div6 = element("div");
    			div5 = element("div");
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
    			div4 = element("div");
    			input2 = element("input");
    			t11 = space();
    			label2 = element("label");
    			label2.textContent = "Direaction Reverse";
    			t13 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div7 = element("div");
    			create_component(swipe0.$$.fragment);
    			t14 = space();
    			div13 = element("div");
    			div10 = element("div");
    			input3 = element("input");
    			t15 = space();
    			if (if_block) if_block.c();
    			t16 = space();
    			div12 = element("div");
    			div11 = element("div");
    			button0 = element("button");
    			button0.textContent = "Prev";
    			t18 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t20 = space();
    			hr0 = element("hr");
    			t21 = space();
    			p1 = element("p");
    			p1.textContent = "Vertical Swipe 🔥";
    			t23 = space();
    			div16 = element("div");
    			div15 = element("div");
    			div14 = element("div");
    			create_component(swipe1.$$.fragment);
    			t24 = space();
    			hr1 = element("hr");
    			t25 = space();
    			p2 = element("p");
    			p2.textContent = "Also allow pointer events inside Swipe Item";
    			t27 = space();
    			div17 = element("div");
    			create_component(swipe2.$$.fragment);
    			t28 = space();
    			div18 = element("div");
    			attr_dev(path0, "d", "M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z");
    			attr_dev(path0, "class", "svelte-fybjfc");
    			add_location(path0, file$2, 119, 4, 2086);
    			attr_dev(path1, "d", "M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6\n      120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3\n      125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2");
    			attr_dev(path1, "fill", "currentColor");
    			set_style(path1, "transform-origin", "130px 106px");
    			attr_dev(path1, "class", "octo-arm svelte-fybjfc");
    			add_location(path1, file$2, 120, 4, 2153);
    			attr_dev(path2, "d", "M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6\n      C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0\n      C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1\n      C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4\n      C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9\n      C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5\n      C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9\n      L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z");
    			attr_dev(path2, "fill", "currentColor");
    			attr_dev(path2, "class", "octo-body svelte-fybjfc");
    			add_location(path2, file$2, 127, 4, 2467);
    			attr_dev(svg, "width", "80");
    			attr_dev(svg, "height", "80");
    			attr_dev(svg, "viewBox", "0 0 250 250");
    			set_style(svg, "fill", "#151513");
    			set_style(svg, "color", "#fff");
    			set_style(svg, "position", "absolute");
    			set_style(svg, "top", "0");
    			set_style(svg, "border", "0");
    			set_style(svg, "right", "0");
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "class", "svelte-fybjfc");
    			add_location(svg, file$2, 112, 2, 1905);
    			attr_dev(a, "href", "https://github.com/SharifClick/svelte-swipe");
    			attr_dev(a, "class", "github-corner svelte-fybjfc");
    			attr_dev(a, "aria-label", "View source on GitHub");
    			add_location(a, file$2, 108, 0, 1785);
    			attr_dev(h1, "class", "text-muted svelte-fybjfc");
    			add_location(h1, file$2, 143, 6, 3220);
    			attr_dev(p0, "class", "text-muted svelte-fybjfc");
    			add_location(p0, file$2, 144, 6, 3267);
    			attr_dev(div0, "class", "col svelte-fybjfc");
    			add_location(div0, file$2, 142, 4, 3196);
    			attr_dev(div1, "class", "row svelte-fybjfc");
    			set_style(div1, "margin-top", "20px");
    			add_location(div1, file$2, 141, 2, 3150);
    			attr_dev(input0, "class", "form-check-input svelte-fybjfc");
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file$2, 150, 8, 3468);
    			attr_dev(label0, "class", "text-muted svelte-fybjfc");
    			add_location(label0, file$2, 154, 8, 3599);
    			attr_dev(div2, "class", "form-check form-check-inline float-right svelte-fybjfc");
    			add_location(div2, file$2, 149, 6, 3405);
    			attr_dev(input1, "class", "form-check-input svelte-fybjfc");
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$2, 157, 8, 3735);
    			attr_dev(label1, "class", "text-muted svelte-fybjfc");
    			add_location(label1, file$2, 161, 8, 3855);
    			attr_dev(div3, "class", "form-check form-check-inline float-right svelte-fybjfc");
    			add_location(div3, file$2, 156, 6, 3672);
    			attr_dev(input2, "class", "form-check-input svelte-fybjfc");
    			attr_dev(input2, "type", "checkbox");
    			add_location(input2, file$2, 164, 8, 3988);
    			attr_dev(label2, "class", "text-muted svelte-fybjfc");
    			add_location(label2, file$2, 168, 8, 4122);
    			attr_dev(div4, "class", "form-check form-check-inline float-right svelte-fybjfc");
    			add_location(div4, file$2, 163, 6, 3925);
    			attr_dev(div5, "class", "col svelte-fybjfc");
    			add_location(div5, file$2, 148, 4, 3381);
    			attr_dev(div6, "class", "row svelte-fybjfc");
    			add_location(div6, file$2, 147, 2, 3359);
    			attr_dev(div7, "class", "swipe-holder svelte-fybjfc");
    			add_location(div7, file$2, 174, 6, 4256);
    			attr_dev(div8, "class", "col svelte-fybjfc");
    			add_location(div8, file$2, 173, 4, 4232);
    			attr_dev(div9, "class", "row svelte-fybjfc");
    			add_location(div9, file$2, 172, 2, 4210);
    			attr_dev(input3, "class", "btn btn-info btn-sm svelte-fybjfc");
    			attr_dev(input3, "type", "button");
    			input3.value = input3_value_value = /*swipeConfig*/ ctx[0].autoplay ? "Stop" : "Play";
    			add_location(input3, file$2, 187, 6, 4637);
    			attr_dev(div10, "class", "col svelte-fybjfc");
    			add_location(div10, file$2, 186, 4, 4613);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-secondary btn-sm svelte-fybjfc");
    			add_location(button0, file$2, 209, 8, 5372);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-secondary btn-sm svelte-fybjfc");
    			add_location(button1, file$2, 215, 8, 5520);
    			attr_dev(div11, "class", "btn-group float-right svelte-fybjfc");
    			add_location(div11, file$2, 208, 6, 5328);
    			attr_dev(div12, "class", "col svelte-fybjfc");
    			add_location(div12, file$2, 207, 4, 5304);
    			attr_dev(div13, "class", "row svelte-fybjfc");
    			set_style(div13, "margin-top", "10px");
    			add_location(div13, file$2, 185, 2, 4567);
    			attr_dev(hr0, "class", "svelte-fybjfc");
    			add_location(hr0, file$2, 225, 2, 5696);
    			attr_dev(p1, "class", "text-muted svelte-fybjfc");
    			add_location(p1, file$2, 226, 2, 5705);
    			attr_dev(div14, "class", "swipe-holder svelte-fybjfc");
    			add_location(div14, file$2, 229, 6, 5797);
    			attr_dev(div15, "class", "col svelte-fybjfc");
    			add_location(div15, file$2, 228, 4, 5773);
    			attr_dev(div16, "class", "row svelte-fybjfc");
    			add_location(div16, file$2, 227, 2, 5751);
    			attr_dev(hr1, "class", "svelte-fybjfc");
    			add_location(hr1, file$2, 241, 2, 6071);
    			attr_dev(p2, "class", "text-muted svelte-fybjfc");
    			add_location(p2, file$2, 242, 2, 6080);
    			attr_dev(div17, "class", "swipe-holder svelte-fybjfc");
    			add_location(div17, file$2, 243, 2, 6152);
    			attr_dev(div18, "class", "row mt-3 svelte-fybjfc");
    			add_location(div18, file$2, 279, 2, 7160);
    			attr_dev(div19, "class", "container svelte-fybjfc");
    			add_location(div19, file$2, 140, 0, 3124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, path0);
    			append_dev(svg, path1);
    			append_dev(svg, path2);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div19, anchor);
    			append_dev(div19, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t2);
    			append_dev(div0, p0);
    			append_dev(div19, t4);
    			append_dev(div19, div6);
    			append_dev(div6, div5);
    			append_dev(div5, div2);
    			append_dev(div2, input0);
    			input0.checked = /*swipeConfig*/ ctx[0].showIndicators;
    			append_dev(div2, t5);
    			append_dev(div2, label0);
    			append_dev(div5, t7);
    			append_dev(div5, div3);
    			append_dev(div3, input1);
    			input1.checked = /*customThumbnail*/ ctx[2];
    			append_dev(div3, t8);
    			append_dev(div3, label1);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, input2);
    			input2.checked = /*swipeConfig*/ ctx[0].direction_reverse;
    			append_dev(div4, t11);
    			append_dev(div4, label2);
    			append_dev(div19, t13);
    			append_dev(div19, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div7);
    			mount_component(swipe0, div7, null);
    			append_dev(div19, t14);
    			append_dev(div19, div13);
    			append_dev(div13, div10);
    			append_dev(div10, input3);
    			append_dev(div13, t15);
    			if (if_block) if_block.m(div13, null);
    			append_dev(div13, t16);
    			append_dev(div13, div12);
    			append_dev(div12, div11);
    			append_dev(div11, button0);
    			append_dev(div11, t18);
    			append_dev(div11, button1);
    			append_dev(div19, t20);
    			append_dev(div19, hr0);
    			append_dev(div19, t21);
    			append_dev(div19, p1);
    			append_dev(div19, t23);
    			append_dev(div19, div16);
    			append_dev(div16, div15);
    			append_dev(div15, div14);
    			mount_component(swipe1, div14, null);
    			append_dev(div19, t24);
    			append_dev(div19, hr1);
    			append_dev(div19, t25);
    			append_dev(div19, p2);
    			append_dev(div19, t27);
    			append_dev(div19, div17);
    			mount_component(swipe2, div17, null);
    			append_dev(div19, t28);
    			append_dev(div19, div18);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[9]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[10]),
    				listen_dev(input2, "change", /*input2_change_handler*/ ctx[11]),
    				listen_dev(input3, "click", /*toggle*/ ctx[4], false, false, false),
    				listen_dev(button0, "click", /*prevSlide*/ ctx[6], false, false, false),
    				listen_dev(button1, "click", /*nextSlide*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*swipeConfig*/ 1) {
    				input0.checked = /*swipeConfig*/ ctx[0].showIndicators;
    			}

    			if (dirty & /*customThumbnail*/ 4) {
    				input1.checked = /*customThumbnail*/ ctx[2];
    			}

    			if (dirty & /*swipeConfig*/ 1) {
    				input2.checked = /*swipeConfig*/ ctx[0].direction_reverse;
    			}

    			const swipe0_changes = (dirty & /*swipeConfig*/ 1)
    			? get_spread_update(swipe0_spread_levels, [get_spread_object(/*swipeConfig*/ ctx[0])])
    			: {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipe0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_item && dirty & /*active_item*/ 2) {
    				updating_active_item = true;
    				swipe0_changes.active_item = /*active_item*/ ctx[1];
    				add_flush_callback(() => updating_active_item = false);
    			}

    			swipe0.$set(swipe0_changes);

    			if (!current || dirty & /*swipeConfig*/ 1 && input3_value_value !== (input3_value_value = /*swipeConfig*/ ctx[0].autoplay ? "Stop" : "Play")) {
    				prop_dev(input3, "value", input3_value_value);
    			}

    			if (/*customThumbnail*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div13, t16);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const swipe1_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipe1_changes.$$scope = { dirty, ctx };
    			}

    			swipe1.$set(swipe1_changes);
    			const swipe2_changes = {};

    			if (dirty & /*$$scope*/ 4194304) {
    				swipe2_changes.$$scope = { dirty, ctx };
    			}

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
    			if (detaching) detach_dev(a);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div19);
    			/*swipe0_binding*/ ctx[13](null);
    			destroy_component(swipe0);
    			if (if_block) if_block.d();
    			destroy_component(swipe1);
    			destroy_component(swipe2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function sayHi() {
    	alert("Hi");
    }

    function instance$2($$self, $$props, $$invalidate) {
    	const swipeConfig = {
    		autoplay: false,
    		showIndicators: false,
    		transitionDuration: 200,
    		defaultIndex: 0,
    		direction_reverse: false
    	};

    	let active_item = 0; //readonly
    	let customThumbnail = false;
    	let SwipeComp;

    	function toggle() {
    		$$invalidate(0, swipeConfig.autoplay = !swipeConfig.autoplay, swipeConfig);
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

    	let images = ["./images/1.jpg", "./images/2.jpg", "./images/3.jpg", "./images/4.jpg"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	function input0_change_handler() {
    		swipeConfig.showIndicators = this.checked;
    		$$invalidate(0, swipeConfig);
    	}

    	function input1_change_handler() {
    		customThumbnail = this.checked;
    		$$invalidate(2, customThumbnail);
    	}

    	function input2_change_handler() {
    		swipeConfig.direction_reverse = this.checked;
    		$$invalidate(0, swipeConfig);
    	}

    	function swipe0_active_item_binding(value) {
    		active_item = value;
    		$$invalidate(1, active_item);
    	}

    	function swipe0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, SwipeComp = $$value);
    		});
    	}

    	const click_handler = i => changeSlide(i);

    	$$self.$capture_state = () => ({
    		Swipe,
    		SwipeItem,
    		swipeConfig,
    		active_item,
    		customThumbnail,
    		SwipeComp,
    		toggle,
    		sayHi,
    		nextSlide,
    		prevSlide,
    		changeSlide,
    		images
    	});

    	$$self.$inject_state = $$props => {
    		if ("active_item" in $$props) $$invalidate(1, active_item = $$props.active_item);
    		if ("customThumbnail" in $$props) $$invalidate(2, customThumbnail = $$props.customThumbnail);
    		if ("SwipeComp" in $$props) $$invalidate(3, SwipeComp = $$props.SwipeComp);
    		if ("images" in $$props) $$invalidate(8, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
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
    		input2_change_handler,
    		swipe0_active_item_binding,
    		swipe0_binding,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
