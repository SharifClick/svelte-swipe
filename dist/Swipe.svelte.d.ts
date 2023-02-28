/** @typedef {typeof __propDef.props}  SwipeProps */
/** @typedef {typeof __propDef.events}  SwipeEvents */
/** @typedef {typeof __propDef.slots}  SwipeSlots */
export default class Swipe extends SvelteComponentTyped<{
    transitionDuration?: number | undefined;
    showIndicators?: boolean | undefined;
    autoplay?: boolean | undefined;
    delay?: number | undefined;
    defaultIndex?: number | undefined;
    active_item?: number | undefined;
    is_vertical?: boolean | undefined;
    allow_infinite_swipe?: boolean | undefined;
    goTo?: ((step: any) => void) | undefined;
    prevItem?: (() => void) | undefined;
    nextItem?: (() => void) | undefined;
}, {
    change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
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
        transitionDuration?: number | undefined;
        showIndicators?: boolean | undefined;
        autoplay?: boolean | undefined;
        delay?: number | undefined;
        defaultIndex?: number | undefined;
        active_item?: number | undefined;
        is_vertical?: boolean | undefined;
        allow_infinite_swipe?: boolean | undefined;
        goTo?: ((step: any) => void) | undefined;
        prevItem?: (() => void) | undefined;
        nextItem?: (() => void) | undefined;
    };
    events: {
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
