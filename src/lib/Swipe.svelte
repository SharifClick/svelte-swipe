<script>
	// @ts-nocheck

	import { onMount, onDestroy, createEventDispatcher } from 'svelte';

	export let transitionDuration = 200;
	export let showIndicators = false;
	export let autoplay = false;
	export let delay = 1000;
	export let defaultIndex = 0;

	export let active_item = 0; //readonly
	export let is_vertical = false;
	export let allow_infinite_swipe = true;

	let activeIndicator = 0,
		indicators,
		total_elements = 0,
		availableSpace = 0,
		availableMeasure = 0,
		swipeElements,
		availableDistance = 0,
		swipeItemsWrapper,
		swipeWrapper,
		itemsActualLength,
		swipeHandler,
		pos_axis = 0,
		page_axis = is_vertical ? 'pageY' : 'pageX',
		axis,
		longTouch,
		last_axis_pos;

	let played = defaultIndex || 0;
	let run_interval = false;

	let fire = createEventDispatcher();

	function init() {
		swipeItemsWrapper = swipeWrapper.querySelector('.swipeable-slot-wrapper');
		swipeElements = swipeItemsWrapper.querySelectorAll('.swipeable-item');
		total_elements = swipeElements.length;

		if (allow_infinite_swipe) {
			swipeItemsWrapper.prepend(swipeElements[total_elements - 1].cloneNode(true));
			swipeItemsWrapper.append(swipeElements[0].cloneNode(true));
			swipeElements = swipeItemsWrapper.querySelectorAll('.swipeable-item');
		}

		update();
	}

	function update() {
		let { offsetWidth, offsetHeight } = swipeWrapper.querySelector('.swipeable-total_elements');
		availableSpace = is_vertical ? offsetHeight : offsetWidth;

		setElementTransformation({
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

	$: indicators = Array(total_elements);

	$: {
		if (autoplay && !run_interval) {
			run_interval = setInterval(changeView, delay);
		}

		if (!autoplay && run_interval) {
			clearInterval(run_interval);
			run_interval = false;
		}
	}

	// helpers

	function setElementTransformation({
		elems = [],
		availableSpace = 0,
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
				element.style.transform = generateTranslateValue(availableSpace * idx);
			}
			if (moving) {
				element.style.cssText = generateTouchPosCss(availableSpace * idx - distance);
			}
			if (end) {
				element.style.cssText = generateTouchPosCss(availableSpace * idx - pos_axis, true);
			}
			if (reset) {
				element.style.cssText = generateTouchPosCss(availableSpace * idx - pos_axis);
			}
		});
	}

	function eventDelegate(type) {
		let delegationTypes = {
			add: 'addEventListener',
			remove: 'removeEventListener'
		};
		if (typeof window !== 'undefined') {
			window[delegationTypes[type]]('mousemove', onMove);
			window[delegationTypes[type]]('mouseup', onEnd);
			window[delegationTypes[type]]('touchmove', onMove, { passive: false });
			window[delegationTypes[type]]('touchend', onEnd, { passive: false });
		}
	}

	function generateTranslateValue(value) {
		return is_vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`;
	}

	function generateTouchPosCss(value, touch_end = false) {
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

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('resize', update);
		}
	});

	let touch_active = false;

	function onMove(e) {
		if (touch_active) {
			e.stopImmediatePropagation();
			e.stopPropagation();
			let _axis = e.touches ? e.touches[0][page_axis] : e[page_axis],
				distance = axis - _axis + pos_axis;
			// if ((pos_axis == 0 && axis < _axis) || (pos_axis == availableMeasure && axis > _axis)) {
			// 	return;
			// }
			e.preventDefault();

			if (distance <= availableMeasure && distance >= 0) {
			}
			setElementTransformation({
				moving: true,
				elems: [...swipeElements],
				availableSpace,
				distance,
				has_infinite_loop: allow_infinite_swipe
			});
			// [...swipeElements].forEach((element, i) => {
			// 	element.style.cssText = generateTouchPosCss(availableSpace * i - distance);
			// });
			availableDistance = distance;
			last_axis_pos = _axis;
		}
	}

	function onMoveStart(e) {
		// e.preventDefault();
		e.stopImmediatePropagation();
		e.stopPropagation();
		touch_active = true;
		longTouch = false;
		setTimeout(function () {
			longTouch = true;
		}, 250);
		axis = e.touches ? e.touches[0][page_axis] : e[page_axis];
		eventDelegate('add');
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
		activeIndicator = availableDistance / _as;

		// [...swipeElements].forEach((element, i) => {
		// 	element.style.cssText = generateTouchPosCss(_as * i - pos_axis, true);
		// });

		setElementTransformation({
			end: true,
			elems: [...swipeElements],
			availableSpace: _as,
			pos_axis,
			has_infinite_loop: allow_infinite_swipe
		});

		active_item = activeIndicator;
		defaultIndex = active_item;
		eventDelegate('remove');

		console.log({ pos_axis: pos_axis, _as: _as, availableDistance: availableDistance });
		if (active_item === -1 || active_item === total_elements) {
			console.log(_as * (total_elements - 1));
			console.log(pos_axis);
			console.log('shout out');
			pos_axis = _as * (total_elements - 1);
			activeIndicator = pos_axis / _as;
			setTimeout(() => {
				setElementTransformation({
					reset: true,
					elems: [...swipeElements],
					availableSpace: _as,
					pos_axis,
					has_infinite_loop: allow_infinite_swipe
				});
			}, 1000);
		}

		if (active_item === total_elements) {
			console.log(_as * (total_elements - 1));
			console.log(pos_axis);
			console.log('shout out');
			pos_axis = 0;
			activeIndicator = pos_axis / _as;
			setTimeout(() => {
				setElementTransformation({
					reset: true,
					elems: [...swipeElements],
					availableSpace: _as,
					pos_axis,
					has_infinite_loop: allow_infinite_swipe
				});
			}, 1000);
		}

		let swipe_direction = direction ? 'right' : 'left';
		fire('change', { active_item, swipe_direction, active_element: swipeElements[active_item] });
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

	export function goTo(step) {
		let item = Math.max(0, Math.min(step, indicators.length - 1));
		changeItem(item);
	}
	export function prevItem() {
		let step = activeIndicator - 1;
		goTo(step);
	}

	export function nextItem() {
		let step = activeIndicator + 1;
		goTo(step);
	}
</script>

<div class="swipe-panel">
	<div class="swipe-item-wrapper" bind:this={swipeWrapper}>
		<div class="swipeable-total_elements">
			<div class="swipeable-slot-wrapper">
				<slot />
			</div>
		</div>
	</div>
	<div
		class="swipe-handler"
		bind:this={swipeHandler}
		on:touchstart={onMoveStart}
		on:mousedown={onMoveStart}
	/>
	{#if showIndicators}
		<div class="swipe-indicator swipe-indicator-inside">
			{#each indicators as x, i}
				<span
					class="dot {activeIndicator == i ? 'is-active' : ''}"
					on:click={() => {
						changeItem(i);
					}}
				/>
			{/each}
		</div>
	{/if}
</div>

<style>
	.swipe-panel {
		position: relative;
		height: var(--sv-swipe-panel-height, 100%);
		width: var(--sv-swipe-panel-width, inherit);
	}
	.swipe-item-wrapper {
		overflow: hidden;
		position: relative;
		height: inherit;
		z-index: var(--sv-swipe-panel-wrapper-index, 2);
		pointer-events: none;
	}

	.swipeable-total_elements,
	.swipeable-slot-wrapper {
		position: relative;
		width: inherit;
		height: inherit;
	}

	.swipe-handler {
		width: 100%;
		position: absolute;
		top: var(--sv-swipe-handler-top, 0px);
		bottom: 0px;
		left: 0;
		right: 0;
		background: rgba(0, 0, 0, 0);
	}
	.swipe-indicator {
		position: relative;
		bottom: 1.5rem;
		display: flex;
		justify-content: center;
		z-index: var(--sv-swipe-panel-wrapper-index, 2);
		pointer-events: none;
	}

	.dot {
		height: 10px;
		width: 10px;
		background-color: transparent;
		border: 1px solid grey;
		border-radius: 50%;
		display: inline-block;
		margin: 0px 2px;
		cursor: pointer;
		pointer-events: fill;
	}
	.swipe-indicator .is-active {
		background-color: var(--sv-swipe-indicator-active-color, grey);
	}
</style>
