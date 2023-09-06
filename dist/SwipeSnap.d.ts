export default SwipeSnap;
declare class SwipeSnap {
    constructor(options?: {});
    element: any;
    wrapper: any;
    elements: any;
    elements_count: any;
    is_vertical: any;
    transition_duration: any;
    allow_infinite_swipe: any;
    fire: any;
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
    prevent(event: any): void;
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
    getProps(): {
        elements_count: any;
        active_item: number;
        active_element: any;
    };
}