import { EventOptions, EventsMapItem, EventType, EvmEventsMapOptions, ISameFunction, ISameOptions } from "./types";
import { isSameFunction } from "./utils/index";
import { copyListenerOption, isSameOptions } from "./utils/dom";

const DEFAULT_OPTIONS: EvmEventsMapOptions = {
    isSameOptions,
    isSameFunction,
}

export default class EvmEventsMap {

    private isSameOptions: ISameOptions;
    private isSameFunction: ISameFunction;
    constructor(options: EvmEventsMapOptions = DEFAULT_OPTIONS) {
        const opt = { ...DEFAULT_OPTIONS, ...options };
        this.isSameOptions = opt.isSameOptions!;
        this.isSameFunction = opt.isSameFunction!;
    }

    #map = new Map<Object, Map<EventType, EventsMapItem[]>>();

    keys() {
        return [...this.#map.keys()];
    }

    /**
     * 添加
     * @param target object
     * @param event 事件类型，比如message,click等
     * @param listener 事件处理程序
     */
    addListener(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {

        const map = this.#map;

        let t: Map<EventType, EventsMapItem[]> | undefined;

        t = this.#map.get(target);
        if (!t) {
            t = new Map<EventType, EventsMapItem[]>();
            map.set(target, t);
        }

        if (!t.has(event)) {
            t.set(event, []);
        }
        const eventsInfo = t.get(event);
        if (!eventsInfo) {
            return this;
        }
        eventsInfo.push({
            listener,
            options: copyListenerOption(options)
        });
        return this;
    }

    /**
     * 添加
     * @param target object
     * @param event 事件类型，比如message,click等
     * @param listener 事件处理程序
     */
    removeListener(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {
        const map = this.#map;

        const t = map.get(target);

        if (!t) {
            return
        }
        if (!t.has(event)) {
            return console.error(`EvmEventsMap:: remove failed, event (${event}) is not found`);
        }

        // options 不能比同一个对象，比字符串的值
        const eventsInfo = t.get(event);
        if (!eventsInfo) {
            return this;
        }
        const index = eventsInfo.findIndex(l => {
            const fun = l.listener;
            if (!fun) {
                return false;
            }
            return fun === listener && this.isSameOptions(l.options, options)
        });

        if (index >= 0) {
            eventsInfo.splice(index, 1);
        }

        const hasItem = eventsInfo.some(l => l.listener);
        if (!hasItem) {
            t.delete(event);
        }
        if (Object.keys(t).length === 0) {
            map.delete(target);
        }
        return this;
    }


    /**
     * 删除某个实例的某个类别的全部信息
     * @param target 
     * @param event 
     */
    removeEventsByTarget(target: object, event: EventType) {
        const infos = this.#map.get(target);
        if (!infos) {
            return;
        }
        return infos.delete(event);
    }

    removeByTarget(target: object) {
        const infos = this.#map.delete(target)
    }


    /**
     * 
     * @param wrTarget WeakRef(object)
     * @returns 
     */
    has(target: Object) {
        return this.#map.has(target);
    }

    /**
     * 获取关联的事件信息信息
     * @param target 
     * @returns 
     */
    getEventsObj(target: object) {
        const eventsObj = this.#map.get(target);
        return eventsObj;
    }


    /**
     * 是有已经有listener
     * @param target 
     * @param event 
     * @param listener 
     * @param options 
     * @returns 
     */
    hasListener(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {
        const t = this.#map.get(target);
        if (!t) return false;
        const wrListeners = t.get(event);

        if (!Array.isArray(wrListeners)) {
            return false;
        }

        return wrListeners.findIndex(lObj => {
            const l = lObj.listener;
            if (!l) {
                return false;
            }
            return l === listener && this.isSameOptions(options, lObj.options)
        }) > -1

    }

    /**
     * 获取极可能是有问题的事件监听信息
     * @param target 
     * @param event 
     * @param listener 
     * @param options 
     * @returns 
     */
    getExtremelyItems(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {

        const eventsObj = this.getEventsObj(target);
        if (!eventsObj) {
            return null;
        }
        const listenerObjs = eventsObj.get(event);
        if (!listenerObjs) {
            return null;
        }
        const items = listenerObjs.filter(l => this.isSameFunction(l.listener, listener, true) && this.isSameOptions(l.options, options));
        return items;
    }

    get data() {
        return this.#map
    }
}