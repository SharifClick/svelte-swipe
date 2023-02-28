/** @typedef {typeof __propDef.props}  SwipeItemProps */
/** @typedef {typeof __propDef.events}  SwipeItemEvents */
/** @typedef {typeof __propDef.slots}  SwipeItemSlots */
export default class SwipeItem extends SvelteComponentTyped<{
    active?: boolean | undefined;
    classes?: string | undefined;
    style?: string | undefined;
    allow_dynamic_height?: boolean | undefined;
}, {
    swipe_item_height_change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> {
}
export type SwipeItemProps = typeof __propDef.props;
export type SwipeItemEvents = typeof __propDef.events;
export type SwipeItemSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        active?: boolean | undefined;
        classes?: string | undefined;
        style?: string | undefined;
        allow_dynamic_height?: boolean | undefined;
    };
    events: {
        swipe_item_height_change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {};
    };
};
export {};
