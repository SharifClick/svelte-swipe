
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
    	child_ctx[42] = list[i];
    	child_ctx[44] = i;
    	return child_ctx;
    }

    // (275:3) {#if showIndicators}
    function create_if_block(ctx) {
    	let div;
    	let each_value = /*indicators*/ ctx[2];
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

    			attr_dev(div, "class", "swipe-indicator swipe-indicator-inside svelte-hja3vj");
    			add_location(div, file, 275, 5, 6572);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*activeIndicator, changeItem, indicators*/ 70) {
    				each_value = /*indicators*/ ctx[2];
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
    		source: "(275:3) {#if showIndicators}",
    		ctx
    	});

    	return block;
    }

    // (277:8) {#each indicators as x, i }
    function create_each_block(ctx) {
    	let span;
    	let span_class_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[41](/*i*/ ctx[44], ...args);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");

    			attr_dev(span, "class", span_class_value = "dot " + (/*activeIndicator*/ ctx[1] == /*i*/ ctx[44]
    			? "is-active"
    			: "") + " svelte-hja3vj");

    			add_location(span, file, 277, 10, 6671);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(span, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*activeIndicator*/ 2 && span_class_value !== (span_class_value = "dot " + (/*activeIndicator*/ ctx[1] == /*i*/ ctx[44]
    			? "is-active"
    			: "") + " svelte-hja3vj")) {
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
    		source: "(277:8) {#each indicators as x, i }",
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
    	const default_slot_template = /*$$slots*/ ctx[38].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[37], null);
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
    			attr_dev(div0, "class", "swipeable-slot-wrapper svelte-hja3vj");
    			add_location(div0, file, 268, 6, 6344);
    			attr_dev(div1, "class", "swipeable-items svelte-hja3vj");
    			add_location(div1, file, 267, 4, 6308);
    			attr_dev(div2, "class", "swipe-item-wrapper svelte-hja3vj");
    			add_location(div2, file, 266, 2, 6246);
    			attr_dev(div3, "class", "swipe-handler svelte-hja3vj");
    			add_location(div3, file, 273, 2, 6433);
    			attr_dev(div4, "class", "swipe-panel svelte-hja3vj");
    			add_location(div4, file, 265, 0, 6218);
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

    			/*div2_binding*/ ctx[39](div2);
    			append_dev(div4, t0);
    			append_dev(div4, div3);
    			/*div3_binding*/ ctx[40](div3);
    			append_dev(div4, t1);
    			if (if_block) if_block.m(div4, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(div3, "touchstart", /*moveStart*/ ctx[5], false, false, false),
    				listen_dev(div3, "mousedown", /*moveStart*/ ctx[5], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty[1] & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[37], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[37], dirty, null));
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
    			/*div2_binding*/ ctx[39](null);
    			/*div3_binding*/ ctx[40](null);
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

    function instance($$self, $$props, $$invalidate) {
    	let { transitionDuration = 200 } = $$props;
    	let { showIndicators = false } = $$props;
    	let { autoplay = false } = $$props;
    	let { delay = 1000 } = $$props;
    	let { defaultIndex = 0 } = $$props;
    	let { active_item = 0 } = $$props; //readonly
    	let { is_vertical = false } = $$props;

    	let activeIndicator = 0,
    		indicators,
    		items = 0,
    		availableSpace = 0,
    		topClearence = 0,
    		elems,
    		diff = 0,
    		swipeWrapper,
    		swipeHandler,
    		min = 0,
    		transformString = is_vertical
    		? "translate3d(0, -{{val}}px, 0)"
    		: "translate3d(-{{val}}px, 0, 0)",
    		touchingTpl = `
    -webkit-transition-duration: 0s;
    transition-duration: 0s;
    -webkit-transform: ${transformString};
    -ms-transform: ${transformString};`,
    		non_touchingTpl = `
    -webkit-transition-duration: ${transitionDuration}ms;
    transition-duration: ${transitionDuration}ms;
    -webkit-transform: ${transformString};
    -ms-transform: ${transformString};`,
    		touching = false,
    		pos_axis = 0,
    		page_axis = is_vertical ? "pageY" : "pageX",
    		dir = 0,
    		axis;

    	let played = defaultIndex || 0;
    	let run_interval = false;

    	function update() {
    		$$invalidate(4, swipeHandler.style.top = topClearence + "px", swipeHandler);
    		let { offsetWidth, offsetHeight } = swipeWrapper.querySelector(".swipeable-items");
    		availableSpace = is_vertical ? offsetHeight : offsetWidth;

    		for (let i = 0; i < items; i++) {
    			let _transformValue = availableSpace * i + "px";

    			let _transformString = is_vertical
    			? `translate3d(0, ${_transformValue}, 0)`
    			: `translate3d(${_transformValue}, 0, 0)`;

    			elems[i].style.transform = _transformString;
    		}

    		diff = 0;

    		if (defaultIndex) {
    			changeItem(defaultIndex);
    		}
    	}

    	function init() {
    		elems = swipeWrapper.querySelectorAll(".swipeable-item");
    		$$invalidate(16, items = elems.length);
    		update();
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

    	function moveHandler(e) {
    		if (touching) {
    			e.stopImmediatePropagation();
    			e.stopPropagation();
    			let max = availableSpace;
    			let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
    			let _diff = axis - _axis + pos_axis;
    			let dir = _axis > axis ? 0 : 1;

    			if (!dir) {
    				_diff = pos_axis - (_axis - axis);
    			}

    			if (_diff <= max * (items - 1) && _diff >= min) {
    				for (let i = 0; i < items; i++) {
    					let template = i < 0 ? "{{val}}" : "-{{val}}";
    					let _value = max * i - _diff;
    					elems[i].style.cssText = touchingTpl.replace(template, _value).replace(template, _value);
    				}

    				diff = _diff;
    			}
    		}
    	}

    	function endHandler(e) {
    		e && e.stopImmediatePropagation();
    		e && e.stopPropagation();
    		e && e.preventDefault();
    		let max = availableSpace;
    		touching = false;
    		axis = null;
    		let swipe_threshold = 0.85;
    		let d_max = diff / max;
    		let _target = Math.round(d_max);

    		if (Math.abs(_target - d_max) < swipe_threshold) {
    			diff = _target * max;
    		} else {
    			diff = (dir ? _target - 1 : _target + 1) * max;
    		}

    		pos_axis = diff;
    		$$invalidate(1, activeIndicator = diff / max);

    		for (let i = 0; i < items; i++) {
    			let template = i < 0 ? "{{val}}" : "-{{val}}";
    			let _value = max * i - pos_axis;
    			elems[i].style.cssText = non_touchingTpl.replace(template, _value).replace(template, _value);
    		}

    		$$invalidate(7, active_item = activeIndicator);

    		if (typeof window !== "undefined") {
    			window.removeEventListener("mousemove", moveHandler);
    			window.removeEventListener("mouseup", endHandler);
    			window.removeEventListener("touchmove", moveHandler);
    			window.removeEventListener("touchend", endHandler);
    		}
    	}

    	function moveStart(e) {
    		e.stopImmediatePropagation();
    		e.stopPropagation();
    		e.preventDefault();
    		touching = true;
    		axis = e.touches ? e.touches[0][page_axis] : e[page_axis];

    		if (typeof window !== "undefined") {
    			window.addEventListener("mousemove", moveHandler);
    			window.addEventListener("mouseup", endHandler);
    			window.addEventListener("touchmove", moveHandler);
    			window.addEventListener("touchend", endHandler);
    		}
    	}

    	function changeItem(item) {
    		let max = availableSpace;
    		diff = max * item;
    		$$invalidate(1, activeIndicator = item);
    		endHandler();
    	}

    	function changeView() {
    		changeItem(played);
    		played = played < items - 1 ? ++played : 0;
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
    		"is_vertical"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Swipe> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Swipe", $$slots, ['default']);

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(3, swipeWrapper = $$value);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, swipeHandler = $$value);
    		});
    	}

    	const click_handler = i => {
    		changeItem(i);
    	};

    	$$self.$set = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("showIndicators" in $$props) $$invalidate(0, showIndicators = $$props.showIndicators);
    		if ("autoplay" in $$props) $$invalidate(9, autoplay = $$props.autoplay);
    		if ("delay" in $$props) $$invalidate(10, delay = $$props.delay);
    		if ("defaultIndex" in $$props) $$invalidate(11, defaultIndex = $$props.defaultIndex);
    		if ("active_item" in $$props) $$invalidate(7, active_item = $$props.active_item);
    		if ("is_vertical" in $$props) $$invalidate(12, is_vertical = $$props.is_vertical);
    		if ("$$scope" in $$props) $$invalidate(37, $$scope = $$props.$$scope);
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
    		activeIndicator,
    		indicators,
    		items,
    		availableSpace,
    		topClearence,
    		elems,
    		diff,
    		swipeWrapper,
    		swipeHandler,
    		min,
    		transformString,
    		touchingTpl,
    		non_touchingTpl,
    		touching,
    		pos_axis,
    		page_axis,
    		dir,
    		axis,
    		played,
    		run_interval,
    		update,
    		init,
    		moveHandler,
    		endHandler,
    		moveStart,
    		changeItem,
    		changeView,
    		goTo,
    		prevItem,
    		nextItem
    	});

    	$$self.$inject_state = $$props => {
    		if ("transitionDuration" in $$props) $$invalidate(8, transitionDuration = $$props.transitionDuration);
    		if ("showIndicators" in $$props) $$invalidate(0, showIndicators = $$props.showIndicators);
    		if ("autoplay" in $$props) $$invalidate(9, autoplay = $$props.autoplay);
    		if ("delay" in $$props) $$invalidate(10, delay = $$props.delay);
    		if ("defaultIndex" in $$props) $$invalidate(11, defaultIndex = $$props.defaultIndex);
    		if ("active_item" in $$props) $$invalidate(7, active_item = $$props.active_item);
    		if ("is_vertical" in $$props) $$invalidate(12, is_vertical = $$props.is_vertical);
    		if ("activeIndicator" in $$props) $$invalidate(1, activeIndicator = $$props.activeIndicator);
    		if ("indicators" in $$props) $$invalidate(2, indicators = $$props.indicators);
    		if ("items" in $$props) $$invalidate(16, items = $$props.items);
    		if ("availableSpace" in $$props) availableSpace = $$props.availableSpace;
    		if ("topClearence" in $$props) topClearence = $$props.topClearence;
    		if ("elems" in $$props) elems = $$props.elems;
    		if ("diff" in $$props) diff = $$props.diff;
    		if ("swipeWrapper" in $$props) $$invalidate(3, swipeWrapper = $$props.swipeWrapper);
    		if ("swipeHandler" in $$props) $$invalidate(4, swipeHandler = $$props.swipeHandler);
    		if ("min" in $$props) min = $$props.min;
    		if ("transformString" in $$props) transformString = $$props.transformString;
    		if ("touchingTpl" in $$props) touchingTpl = $$props.touchingTpl;
    		if ("non_touchingTpl" in $$props) non_touchingTpl = $$props.non_touchingTpl;
    		if ("touching" in $$props) touching = $$props.touching;
    		if ("pos_axis" in $$props) pos_axis = $$props.pos_axis;
    		if ("page_axis" in $$props) page_axis = $$props.page_axis;
    		if ("dir" in $$props) dir = $$props.dir;
    		if ("axis" in $$props) axis = $$props.axis;
    		if ("played" in $$props) played = $$props.played;
    		if ("run_interval" in $$props) $$invalidate(24, run_interval = $$props.run_interval);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*items*/ 65536) {
    			 $$invalidate(2, indicators = Array(items));
    		}

    		if ($$self.$$.dirty[0] & /*autoplay, run_interval, delay*/ 16778752) {
    			 {
    				if (autoplay && !run_interval) {
    					$$invalidate(24, run_interval = setInterval(changeView, delay));
    				}

    				if (!autoplay && run_interval) {
    					clearInterval(run_interval);
    					$$invalidate(24, run_interval = false);
    				}
    			}
    		}
    	};

    	return [
    		showIndicators,
    		activeIndicator,
    		indicators,
    		swipeWrapper,
    		swipeHandler,
    		moveStart,
    		changeItem,
    		active_item,
    		transitionDuration,
    		autoplay,
    		delay,
    		defaultIndex,
    		is_vertical,
    		goTo,
    		prevItem,
    		nextItem,
    		items,
    		availableSpace,
    		elems,
    		diff,
    		touching,
    		pos_axis,
    		axis,
    		played,
    		run_interval,
    		topClearence,
    		min,
    		transformString,
    		touchingTpl,
    		non_touchingTpl,
    		page_axis,
    		dir,
    		update,
    		init,
    		moveHandler,
    		endHandler,
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
    				transitionDuration: 8,
    				showIndicators: 0,
    				autoplay: 9,
    				delay: 10,
    				defaultIndex: 11,
    				active_item: 7,
    				is_vertical: 12,
    				goTo: 13,
    				prevItem: 14,
    				nextItem: 15
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

    	get goTo() {
    		return this.$$.ctx[13];
    	}

    	set goTo(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prevItem() {
    		return this.$$.ctx[14];
    	}

    	set prevItem(value) {
    		throw new Error("<Swipe>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get nextItem() {
    		return this.$$.ctx[15];
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
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	child_ctx[22] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[18] = list[i];
    	return child_ctx;
    }

    // (112:12) <SwipeItem>
    function create_default_slot_8(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-fluid svelte-vzf4ra");
    			if (img.src !== (img_src_value = /*image*/ ctx[18])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 112, 14, 2279);
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
    		source: "(112:12) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (111:10) {#each images as image}
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

    			if (dirty & /*$$scope*/ 33554432) {
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
    		source: "(111:10) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    // (110:8) <Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex} bind:active_item bind:this={SwipeComp}>
    function create_default_slot_7(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value_2 = /*images*/ ctx[12];
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
    			if (dirty & /*images*/ 4096) {
    				each_value_2 = /*images*/ ctx[12];
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
    		source: "(110:8) <Swipe {showIndicators} {autoplay} {delay} {transitionDuration} {defaultIndex} bind:active_item bind:this={SwipeComp}>",
    		ctx
    	});

    	return block;
    }

    // (124:4) {#if customThumbnail}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let each_value_1 = /*images*/ ctx[12];
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

    			attr_dev(div0, "class", "is-center svelte-vzf4ra");
    			add_location(div0, file$2, 125, 8, 2658);
    			attr_dev(div1, "class", "col svelte-vzf4ra");
    			add_location(div1, file$2, 124, 6, 2632);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*active_item, images, changeSlide*/ 6148) {
    				each_value_1 = /*images*/ ctx[12];
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
    		source: "(124:4) {#if customThumbnail}",
    		ctx
    	});

    	return block;
    }

    // (127:10) {#each images as image, i}
    function create_each_block_1(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let dispose;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[17](/*i*/ ctx[22], ...args);
    	}

    	const block = {
    		c: function create() {
    			img = element("img");

    			attr_dev(img, "class", img_class_value = "img-fluid " + (/*active_item*/ ctx[2] == /*i*/ ctx[22]
    			? "rounded"
    			: "img-thumbnail") + " svelte-vzf4ra");

    			set_style(img, "height", "30px");
    			set_style(img, "width", "30px");
    			set_style(img, "cursor", "pointer");
    			if (img.src !== (img_src_value = /*image*/ ctx[18])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 127, 12, 2731);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, img, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(img, "click", click_handler, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*active_item*/ 4 && img_class_value !== (img_class_value = "img-fluid " + (/*active_item*/ ctx[2] == /*i*/ ctx[22]
    			? "rounded"
    			: "img-thumbnail") + " svelte-vzf4ra")) {
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
    		source: "(127:10) {#each images as image, i}",
    		ctx
    	});

    	return block;
    }

    // (148:12) <SwipeItem>
    function create_default_slot_6(ctx) {
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			attr_dev(img, "class", "img-fluid svelte-vzf4ra");
    			if (img.src !== (img_src_value = /*image*/ ctx[18])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$2, 148, 14, 3491);
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
    		source: "(148:12) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (147:10) {#each images as image}
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

    			if (dirty & /*$$scope*/ 33554432) {
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
    		source: "(147:10) {#each images as image}",
    		ctx
    	});

    	return block;
    }

    // (146:8) <Swipe is_vertical={true} >
    function create_default_slot_5(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*images*/ ctx[12];
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
    			if (dirty & /*images*/ 4096) {
    				each_value = /*images*/ ctx[12];
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
    		source: "(146:8) <Swipe is_vertical={true} >",
    		ctx
    	});

    	return block;
    }

    // (161:6) <SwipeItem>
    function create_default_slot_4(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-vzf4ra");
    			add_location(button, file$2, 162, 10, 3841);
    			attr_dev(div, "class", "is-stack is-center svelte-vzf4ra");
    			set_style(div, "background", "teal");
    			add_location(div, file$2, 161, 8, 3774);
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
    		source: "(161:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (167:6) <SwipeItem>
    function create_default_slot_3(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-vzf4ra");
    			add_location(button, file$2, 168, 10, 4057);
    			attr_dev(div, "class", "is-stack is-center svelte-vzf4ra");
    			set_style(div, "background", "yellowgreen");
    			add_location(div, file$2, 167, 8, 3983);
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
    		source: "(167:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (173:6) <SwipeItem>
    function create_default_slot_2(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-vzf4ra");
    			add_location(button, file$2, 174, 10, 4266);
    			attr_dev(div, "class", "is-stack is-center svelte-vzf4ra");
    			set_style(div, "background", "aqua");
    			add_location(div, file$2, 173, 8, 4199);
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
    		source: "(173:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (179:6) <SwipeItem>
    function create_default_slot_1(ctx) {
    	let div;
    	let button;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "Say Hi";
    			attr_dev(button, "class", "custom-button has-pointer-event svelte-vzf4ra");
    			add_location(button, file$2, 180, 10, 4481);
    			attr_dev(div, "class", "is-stack is-center svelte-vzf4ra");
    			set_style(div, "background", "lightcoral");
    			add_location(div, file$2, 179, 8, 4408);
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
    		source: "(179:6) <SwipeItem>",
    		ctx
    	});

    	return block;
    }

    // (160:4) <Swipe>
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

    			if (dirty & /*$$scope*/ 33554432) {
    				swipeitem0_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem0.$set(swipeitem0_changes);
    			const swipeitem1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				swipeitem1_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem1.$set(swipeitem1_changes);
    			const swipeitem2_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				swipeitem2_changes.$$scope = { dirty, ctx };
    			}

    			swipeitem2.$set(swipeitem2_changes);
    			const swipeitem3_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
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
    		source: "(160:4) <Swipe>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div18;
    	let div1;
    	let div0;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let div5;
    	let div4;
    	let div2;
    	let input0;
    	let t4;
    	let label0;
    	let t6;
    	let div3;
    	let input1;
    	let t7;
    	let label1;
    	let t9;
    	let div8;
    	let div7;
    	let div6;
    	let updating_active_item;
    	let t10;
    	let div12;
    	let div9;
    	let input2;
    	let input2_value_value;
    	let t11;
    	let t12;
    	let div11;
    	let div10;
    	let button0;
    	let t14;
    	let button1;
    	let t16;
    	let hr0;
    	let t17;
    	let p1;
    	let t19;
    	let div15;
    	let div14;
    	let div13;
    	let t20;
    	let hr1;
    	let t21;
    	let p2;
    	let t23;
    	let div16;
    	let t24;
    	let div17;
    	let current;
    	let dispose;

    	function swipe0_active_item_binding(value) {
    		/*swipe0_active_item_binding*/ ctx[15].call(null, value);
    	}

    	let swipe0_props = {
    		showIndicators: /*showIndicators*/ ctx[1],
    		autoplay: /*autoplay*/ ctx[0],
    		delay: /*delay*/ ctx[5],
    		transitionDuration: /*transitionDuration*/ ctx[6],
    		defaultIndex: /*defaultIndex*/ ctx[7],
    		$$slots: { default: [create_default_slot_7] },
    		$$scope: { ctx }
    	};

    	if (/*active_item*/ ctx[2] !== void 0) {
    		swipe0_props.active_item = /*active_item*/ ctx[2];
    	}

    	const swipe0 = new Swipe({ props: swipe0_props, $$inline: true });
    	binding_callbacks.push(() => bind(swipe0, "active_item", swipe0_active_item_binding));
    	/*swipe0_binding*/ ctx[16](swipe0);
    	let if_block = /*customThumbnail*/ ctx[3] && create_if_block$1(ctx);

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
    			div18 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Svelte Swipe";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Swipable items wrapper component for Svelte";
    			t3 = space();
    			div5 = element("div");
    			div4 = element("div");
    			div2 = element("div");
    			input0 = element("input");
    			t4 = space();
    			label0 = element("label");
    			label0.textContent = "Built-in Indicators";
    			t6 = space();
    			div3 = element("div");
    			input1 = element("input");
    			t7 = space();
    			label1 = element("label");
    			label1.textContent = "Custom Thumbnail";
    			t9 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			create_component(swipe0.$$.fragment);
    			t10 = space();
    			div12 = element("div");
    			div9 = element("div");
    			input2 = element("input");
    			t11 = space();
    			if (if_block) if_block.c();
    			t12 = space();
    			div11 = element("div");
    			div10 = element("div");
    			button0 = element("button");
    			button0.textContent = "Prev";
    			t14 = space();
    			button1 = element("button");
    			button1.textContent = "Next";
    			t16 = space();
    			hr0 = element("hr");
    			t17 = space();
    			p1 = element("p");
    			p1.textContent = "Vertical Swipe 🔥";
    			t19 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			create_component(swipe1.$$.fragment);
    			t20 = space();
    			hr1 = element("hr");
    			t21 = space();
    			p2 = element("p");
    			p2.textContent = "Also allow pointer events inside Swipe Item";
    			t23 = space();
    			div16 = element("div");
    			create_component(swipe2.$$.fragment);
    			t24 = space();
    			div17 = element("div");
    			attr_dev(h1, "class", "text-muted svelte-vzf4ra");
    			add_location(h1, file$2, 86, 6, 1344);
    			attr_dev(p0, "class", "text-muted svelte-vzf4ra");
    			add_location(p0, file$2, 87, 6, 1391);
    			attr_dev(div0, "class", "col svelte-vzf4ra");
    			add_location(div0, file$2, 85, 4, 1320);
    			attr_dev(div1, "class", "row svelte-vzf4ra");
    			set_style(div1, "margin-top", "20px");
    			add_location(div1, file$2, 84, 2, 1274);
    			attr_dev(input0, "class", "form-check-input svelte-vzf4ra");
    			attr_dev(input0, "type", "checkbox");
    			add_location(input0, file$2, 93, 6, 1588);
    			attr_dev(label0, "class", "text-muted svelte-vzf4ra");
    			add_location(label0, file$2, 94, 6, 1674);
    			attr_dev(div2, "class", "form-check form-check-inline float-right svelte-vzf4ra");
    			add_location(div2, file$2, 92, 4, 1527);
    			attr_dev(input1, "class", "form-check-input svelte-vzf4ra");
    			attr_dev(input1, "type", "checkbox");
    			add_location(input1, file$2, 99, 6, 1820);
    			attr_dev(label1, "class", "text-muted svelte-vzf4ra");
    			add_location(label1, file$2, 100, 6, 1907);
    			attr_dev(div3, "class", "form-check form-check-inline float-right svelte-vzf4ra");
    			add_location(div3, file$2, 98, 4, 1759);
    			attr_dev(div4, "class", "col svelte-vzf4ra");
    			add_location(div4, file$2, 91, 4, 1505);
    			attr_dev(div5, "class", "row svelte-vzf4ra");
    			add_location(div5, file$2, 90, 2, 1483);
    			attr_dev(div6, "class", "swipe-holder svelte-vzf4ra");
    			add_location(div6, file$2, 108, 6, 2053);
    			attr_dev(div7, "class", "col svelte-vzf4ra");
    			add_location(div7, file$2, 107, 4, 2029);
    			attr_dev(div8, "class", "row svelte-vzf4ra");
    			add_location(div8, file$2, 106, 2, 2007);
    			attr_dev(input2, "class", "btn btn-info btn-sm svelte-vzf4ra");
    			attr_dev(input2, "type", "button");
    			input2.value = input2_value_value = /*autoplay*/ ctx[0] ? "Stop" : "Play";
    			add_location(input2, file$2, 121, 6, 2487);
    			attr_dev(div9, "class", "col svelte-vzf4ra");
    			add_location(div9, file$2, 120, 4, 2463);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-secondary btn-sm svelte-vzf4ra");
    			add_location(button0, file$2, 134, 8, 3031);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-secondary btn-sm svelte-vzf4ra");
    			add_location(button1, file$2, 135, 8, 3129);
    			attr_dev(div10, "class", "btn-group float-right svelte-vzf4ra");
    			add_location(div10, file$2, 133, 6, 2987);
    			attr_dev(div11, "class", "col svelte-vzf4ra");
    			add_location(div11, file$2, 132, 4, 2963);
    			attr_dev(div12, "class", "row svelte-vzf4ra");
    			set_style(div12, "margin-top", "10px");
    			add_location(div12, file$2, 119, 2, 2417);
    			attr_dev(hr0, "class", "svelte-vzf4ra");
    			add_location(hr0, file$2, 140, 4, 3257);
    			attr_dev(p1, "class", "text-muted svelte-vzf4ra");
    			add_location(p1, file$2, 141, 2, 3264);
    			attr_dev(div13, "class", "swipe-holder svelte-vzf4ra");
    			add_location(div13, file$2, 144, 6, 3356);
    			attr_dev(div14, "class", "col svelte-vzf4ra");
    			add_location(div14, file$2, 143, 4, 3332);
    			attr_dev(div15, "class", "row svelte-vzf4ra");
    			add_location(div15, file$2, 142, 2, 3310);
    			attr_dev(hr1, "class", "svelte-vzf4ra");
    			add_location(hr1, file$2, 156, 2, 3630);
    			attr_dev(p2, "class", "text-muted svelte-vzf4ra");
    			add_location(p2, file$2, 157, 2, 3637);
    			attr_dev(div16, "class", "swipe-holder svelte-vzf4ra");
    			add_location(div16, file$2, 158, 2, 3709);
    			attr_dev(div17, "class", "row mt-3 svelte-vzf4ra");
    			add_location(div17, file$2, 186, 2, 4621);
    			attr_dev(div18, "class", "container svelte-vzf4ra");
    			add_location(div18, file$2, 82, 0, 1246);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div18, anchor);
    			append_dev(div18, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div18, t3);
    			append_dev(div18, div5);
    			append_dev(div5, div4);
    			append_dev(div4, div2);
    			append_dev(div2, input0);
    			input0.checked = /*showIndicators*/ ctx[1];
    			append_dev(div2, t4);
    			append_dev(div2, label0);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, input1);
    			input1.checked = /*customThumbnail*/ ctx[3];
    			append_dev(div3, t7);
    			append_dev(div3, label1);
    			append_dev(div18, t9);
    			append_dev(div18, div8);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			mount_component(swipe0, div6, null);
    			append_dev(div18, t10);
    			append_dev(div18, div12);
    			append_dev(div12, div9);
    			append_dev(div9, input2);
    			append_dev(div12, t11);
    			if (if_block) if_block.m(div12, null);
    			append_dev(div12, t12);
    			append_dev(div12, div11);
    			append_dev(div11, div10);
    			append_dev(div10, button0);
    			append_dev(div10, t14);
    			append_dev(div10, button1);
    			append_dev(div18, t16);
    			append_dev(div18, hr0);
    			append_dev(div18, t17);
    			append_dev(div18, p1);
    			append_dev(div18, t19);
    			append_dev(div18, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			mount_component(swipe1, div13, null);
    			append_dev(div18, t20);
    			append_dev(div18, hr1);
    			append_dev(div18, t21);
    			append_dev(div18, p2);
    			append_dev(div18, t23);
    			append_dev(div18, div16);
    			mount_component(swipe2, div16, null);
    			append_dev(div18, t24);
    			append_dev(div18, div17);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(input0, "change", /*input0_change_handler*/ ctx[13]),
    				listen_dev(input1, "change", /*input1_change_handler*/ ctx[14]),
    				listen_dev(input2, "click", /*toggle*/ ctx[8], false, false, false),
    				listen_dev(button0, "click", /*prevSlide*/ ctx[10], false, false, false),
    				listen_dev(button1, "click", /*nextSlide*/ ctx[9], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*showIndicators*/ 2) {
    				input0.checked = /*showIndicators*/ ctx[1];
    			}

    			if (dirty & /*customThumbnail*/ 8) {
    				input1.checked = /*customThumbnail*/ ctx[3];
    			}

    			const swipe0_changes = {};
    			if (dirty & /*showIndicators*/ 2) swipe0_changes.showIndicators = /*showIndicators*/ ctx[1];
    			if (dirty & /*autoplay*/ 1) swipe0_changes.autoplay = /*autoplay*/ ctx[0];

    			if (dirty & /*$$scope*/ 33554432) {
    				swipe0_changes.$$scope = { dirty, ctx };
    			}

    			if (!updating_active_item && dirty & /*active_item*/ 4) {
    				updating_active_item = true;
    				swipe0_changes.active_item = /*active_item*/ ctx[2];
    				add_flush_callback(() => updating_active_item = false);
    			}

    			swipe0.$set(swipe0_changes);

    			if (!current || dirty & /*autoplay*/ 1 && input2_value_value !== (input2_value_value = /*autoplay*/ ctx[0] ? "Stop" : "Play")) {
    				prop_dev(input2, "value", input2_value_value);
    			}

    			if (/*customThumbnail*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div12, t12);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const swipe1_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
    				swipe1_changes.$$scope = { dirty, ctx };
    			}

    			swipe1.$set(swipe1_changes);
    			const swipe2_changes = {};

    			if (dirty & /*$$scope*/ 33554432) {
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
    			if (detaching) detach_dev(div18);
    			/*swipe0_binding*/ ctx[16](null);
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
    	let autoplay = false;
    	let delay = 2000;
    	let showIndicators = false;
    	let transitionDuration = 200;
    	let defaultIndex = 0;
    	let active_item = 0; //readonly
    	let customThumbnail = false;
    	let SwipeComp;

    	function toggle() {
    		$$invalidate(0, autoplay = !autoplay);
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
    		showIndicators = this.checked;
    		$$invalidate(1, showIndicators);
    	}

    	function input1_change_handler() {
    		customThumbnail = this.checked;
    		$$invalidate(3, customThumbnail);
    	}

    	function swipe0_active_item_binding(value) {
    		active_item = value;
    		$$invalidate(2, active_item);
    	}

    	function swipe0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(4, SwipeComp = $$value);
    		});
    	}

    	const click_handler = i => changeSlide(i);

    	$$self.$capture_state = () => ({
    		Swipe,
    		SwipeItem,
    		autoplay,
    		delay,
    		showIndicators,
    		transitionDuration,
    		defaultIndex,
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
    		if ("autoplay" in $$props) $$invalidate(0, autoplay = $$props.autoplay);
    		if ("delay" in $$props) $$invalidate(5, delay = $$props.delay);
    		if ("showIndicators" in $$props) $$invalidate(1, showIndicators = $$props.showIndicators);
    		if ("transitionDuration" in $$props) $$invalidate(6, transitionDuration = $$props.transitionDuration);
    		if ("defaultIndex" in $$props) $$invalidate(7, defaultIndex = $$props.defaultIndex);
    		if ("active_item" in $$props) $$invalidate(2, active_item = $$props.active_item);
    		if ("customThumbnail" in $$props) $$invalidate(3, customThumbnail = $$props.customThumbnail);
    		if ("SwipeComp" in $$props) $$invalidate(4, SwipeComp = $$props.SwipeComp);
    		if ("images" in $$props) $$invalidate(12, images = $$props.images);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		autoplay,
    		showIndicators,
    		active_item,
    		customThumbnail,
    		SwipeComp,
    		delay,
    		transitionDuration,
    		defaultIndex,
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
