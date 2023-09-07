/** @typedef {typeof __propDef.props}  SwipeProps */
/** @typedef {typeof __propDef.events}  SwipeEvents */
/** @typedef {typeof __propDef.slots}  SwipeSlots */
export default class Swipe extends SvelteComponentTyped<{
    is_vertical?: boolean | undefined;
    active_item?: number | undefined;
    allow_infinite_swipe?: boolean | undefined;
    goTo?: ((step: any) => void) | undefined;
    nextItem?: (() => void) | undefined;
    prevItem?: (() => void) | undefined;
    transitionDuration?: number | undefined;
    showIndicators?: boolean | undefined;
    autoplay?: boolean | undefined;
    delay?: number | undefined;
    defaultIndex?: number | undefined;
    pause_on_hover?: boolean | undefined;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
    get active_item(): number;
    get pause_on_hover(): NonNullable<boolean | undefined>;
    get goTo(): (step: any) => void;
    get prevItem(): () => void;
    get nextItem(): () => void;
}
export type SwipeProps = typeof __propDef.props;
export type SwipeEvents = typeof __propDef.events;
export type SwipeSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        is_vertical?: boolean | undefined;
        active_item?: number | undefined;
        allow_infinite_swipe?: boolean | undefined;
        goTo?: ((step: any) => void) | undefined;
        nextItem?: (() => void) | undefined;
        prevItem?: (() => void) | undefined;
        transitionDuration?: number | undefined;
        showIndicators?: boolean | undefined;
        autoplay?: boolean | undefined;
        delay?: number | undefined;
        defaultIndex?: number | undefined;
        pause_on_hover?: boolean | undefined;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
