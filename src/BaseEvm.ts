
import EvmEventsMap from "./EventsMap";
import { BaseEvmOptions, EventOptions, EventsMapItem, EventType, StatisticsOptions, } from "./types";
import { createPureObject, getFunctionContent, getStack, isBuiltinFunctionContent, isObject, restoreProperties } from "./utils/index";

import { checkAndProxy } from "./utils/proxy";

import { doBind, undoBind } from "./utils/bind";
import { getListenerFunction, getListenerName, isSameOptions } from "./utils/dom";

const DEFAULT_OPTIONS: BaseEvmOptions = {
    /**
     * 选项相同判断函数
    */
    isSameOptions,
    /**
     * 白名单判断函数
     */
    maxContentLength: 200,
    overrideBind: false,
}


const toString = Object.prototype.toString

export default class EVM {
    protected watched: boolean = false;
    protected eventsMap: EvmEventsMap;

    private options: BaseEvmOptions;

    constructor(options: BaseEvmOptions = {}) {
        this.options = {
            ...DEFAULT_OPTIONS,
            ...options
        };

        this.eventsMap = new EvmEventsMap({
            isSameOptions: this.options.isSameOptions!
        });

        this.innerAddListener = this.innerAddListener.bind(this);
        this.innerRemoveListener = this.innerRemoveListener.bind(this);
    }


    innerAddListener(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {

        const name = getListenerName(listener);
        // EventTarget  https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener#multiple_identical_event_listeners
        // 多次添加，覆盖
        if (isObject(target) && target instanceof EventTarget && this.eventsMap.hasListener(target, event, listener, options)) {
            return console.log(`EventTarget 注册了多个相同的 EventListener， 多余的丢弃！${toString.call(target)} ${event} ${name} 多余的丢弃`);
        }

        const eItems = this.eventsMap.getExtremelyItems(target, event, listener, options);
        if (Array.isArray(eItems) && eItems.length > 0) {
            console.warn(`${toString.call(target)}-${target.constructor.name}`, " ExtremelyItems: type:", event, " name:" + (name || "unknown"), " options: " + options, " content:" + listener.toString().slice(0, 100));
        }
        this.eventsMap.addListener(target, event, listener, options);

    }

    innerRemoveListener(target: Object, event: EventType, listener: EventListenerOrEventListenerObject, options: EventOptions) {
        this.eventsMap.removeListener(target, event, listener, options);
    }


    /**
     * 检查属性，并产生代理
     * @param prototype 
     * @param callback 
     * @param ckProperties 
     * @param proxyProperties 
     * @returns 
     */
    protected checkAndProxy = checkAndProxy;

    /**
     * 还原属性方法
     */
    protected restoreProperties = restoreProperties;



    #getListenerContent(listener: EventListenerOrEventListenerObject) {
        // const { maxContentLength } = this.options;
        return listener.toString(); //.slice(0, maxContentLength)
    }

    #getListenerInfo(listener: EventListenerOrEventListenerObject, containsContent: boolean = false) {
        const name = getListenerName(listener) || "unkown";
        if (!containsContent) {
            return name;
        }
        return createPureObject({
            name,
            content: this.#getListenerContent(listener),
            stack: getStack(getListenerFunction(listener))
        }) as Record<string, any>;
    }

    async statistics({
        containsContent = false,
    }: StatisticsOptions = {}) {

        const data = this.data;
        const keys = [...data.keys()];
        const d = keys.map(target => {

            const events = data.get(target);
            if (!events) {
                return createPureObject();
            }
            return {
                constructor: target?.constructor?.name,
                type: toString.call(target),
                // id: el.id,
                // class: el.className,
                events: [...events.keys()].reduce((obj, cur) => {
                    const items = events.get(cur)?.map(e => {
                        const fn = e.listener
                        if (!fn) return null;
                        return this.#getListenerInfo(fn, containsContent);
                    }).filter(Boolean)

                    if (items && items.length > 0) {
                        obj.set(cur, items);
                    }

                    return obj
                }, new Map())
            }
        })

        return d;
    }

    #getExtremelyListeners(eventsInfo: EventsMapItem[] = []) {
        const map = new Map();
        let listener, listenerStr, listenerKeyStr;
        let info;
        for (let i = 0; i < eventsInfo.length; i++) {
            info = 0;
            const eInfo = eventsInfo[i];
            listener = eInfo.listener;
            // 被回收了
            if (!listener) {
                continue;
            }
            // 函数 + options
            listenerStr = getFunctionContent(getListenerFunction(listener))
            if (isBuiltinFunctionContent(listenerStr)) {
                continue;
            }
            // TODO::  improve
            listenerKeyStr = listenerStr + ` %s----%s ${JSON.stringify(eInfo.options)}`
            // console.log("listenerKeyStr:", listenerKeyStr);
            info = map.get(listenerKeyStr);
            if (!info) {
                map.set(listenerKeyStr, {
                    ...(this.#getListenerInfo(listener, true) as Object),
                    count: 1,
                    options: eInfo.options
                })
            } else {
                info.count++
            }
        }

        return [...map.values()].filter(v => v.count > 1);
    }

    async getExtremelyItems(forceGC: boolean = true) {
        const data = this.data;
        const keys = [...data.keys()];
        const d = keys.map(target => {
            const el = target;

            const eventsObj = data.get(target);

            if (!eventsObj) {
                return createPureObject();
            }

            let exItems: EventsMapItem[];
            const eventsMap = [...eventsObj.keys()].reduce((obj, cur: EventType) => {
                exItems = this.#getExtremelyListeners(eventsObj.get(cur));
                if (exItems.length > 0) {
                    obj.set(cur, exItems);
                }
                return obj

                // 使用map而不适用Object，因为key可能是Symbol
            }, new Map());

            const events = [...eventsMap.keys()].reduce((evs, key) => {
                const arr = eventsMap.get(key) || [];
                evs.push(...arr.map((ev: any) => {
                    ev.key = key;
                    return ev;
                }));
                return evs;
            }, [])


            return events.length > 0 ? createPureObject({
                type: toString.call(el),
                constructor: el?.constructor?.name,
                key: events[0].key,
                // id: el.id,
                // class: el.className,
                events
            }) : null
        }).filter(Boolean)

        return d;
    }



    watch() {
        if (this.watched) {
            return console.error("watched")
        }
        if (this.options.overrideBind) {
            doBind();
        }
        this.watched = true;
    }

    cancel() {
        this.watched = false;
        if (this.options.overrideBind) {
            undoBind();
        }
    }

    get data() {
        return this.eventsMap.data;
    }

    removeByTarget(target: Object) {
        this.eventsMap.removeByTarget(target);
    }

    removeEventsByTarget(target: Object, type: EventType) {
        this.eventsMap.removeEventsByTarget(target, type);
    }

}