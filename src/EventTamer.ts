import EvmEventsMap from "./EventsMap";
import { EventOptions } from "./types";
import { isSameOptions } from "./utils/dom";

export class EventTamer<T extends EventTarget> {

    private eventsMap: EvmEventsMap;

    constructor(private target: T) {
        if (!target) {
            throw Error("EventTamer target 必须是有效的元素");
        }
        this.eventsMap = new EvmEventsMap({
            isSameOptions: isSameOptions
        });
    }

    add(type: string, listener: EventListenerOrEventListenerObject, options: EventOptions) {
        this.eventsMap.addListener(this.target, type, listener, options)
    }

    remove(type: string, listener: EventListenerOrEventListenerObject, options: EventOptions) {
        this.eventsMap.removeListener(this.target, type, listener, options)
    }


    clear(type: string | undefined) {
        const objMap = this.eventsMap.getEventsObj(this.target);
        if (!objMap) return;


        let keys = Object.keys(objMap);
        if (typeof type === 'string') {
            keys = keys.filter(k => k === type);
        }

        for (let key of Object.keys(objMap)) {
            const eventItems = objMap.get(key);
            if (!Array.isArray(eventItems)) return;
            for (let i = eventItems.length - 1; i >= 0; i--) {
                const eventItem = eventItems[i];
                this.target.removeEventListener(key, eventItem.listener, eventItem.options)
            }
        }
    }
}