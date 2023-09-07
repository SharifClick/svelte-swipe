export default SwipeSnap;
/**
 * A class for creating a swipeable carousel with snapping behavior.
 * @class
 */
declare class SwipeSnap {
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
    constructor(options?: {
        element?: HTMLElement | undefined;
        is_vertical?: boolean | undefined;
        transition_duration?: number | undefined;
        allow_infinite_swipe?: boolean | undefined;
        fire?: Function | undefined;
    } | undefined);
    element: HTMLElement | undefined;
    wrapper: Element | null | undefined;
    elements: NodeListOf<Element> | null | undefined;
    elements_count: number | null | undefined;
    is_vertical: boolean | undefined;
    transition_duration: number | undefined;
    allow_infinite_swipe: boolean | undefined;
    fire: Function | undefined;
    pos_axis: number;
    page_axis: string;
    axis: number;
    long_touch: boolean;
    last_axis_pos: number;
    default_index: number;
    active_indicator: number;
    active_item: number;
    touch_active: boolean;
    SWIPE: (event: any) => void;
    SWIPE_END: (event: any) => void;
    /**
     * Prevents the default behavior of an event.
     * @param {Event} event - The event to prevent.
     */
    prevent(event: Event): void;
    update(): void;
    available_space: any;
    available_distance: any;
    available_measure: number | undefined;
    setInfiniteSwipe(): void;
    setElementsPosition({ elems, available_space, pos_axis, has_infinite_loop, distance, moving, init, end, reset }: {
        elems?: any[] | undefined;
        available_space?: number | undefined;
        pos_axis?: number | undefined;
        has_infinite_loop?: boolean | undefined;
        distance?: number | undefined;
        moving?: boolean | undefined;
        init?: boolean | undefined;
        end?: boolean | undefined;
        reset?: boolean | undefined;
    }): void;
    generateTranslateValue(value: any): string;
    generateTouchPosCss(value: any, touch_end?: boolean): string;
    swipeStart(event: any): void;
    swipe(event: any): void;
    swipeEnd(event: any): void;
    eventDelegate(type: any): void;
    changeItem(item: any): void;
    goTo(step: any): void;
    prevItem(): void;
    nextItem(): void;
    /**
     * Retrieves the current properties of the carousel.
     * @returns {Object} Carousel properties object.
     * @property {number} elements_count - The total number of carousel items.
     * @property {number} active_item - The index of the currently active carousel item.
     * @property {HTMLElement} active_element - The currently active carousel item element.
     */
    getProps(): Object;
}
