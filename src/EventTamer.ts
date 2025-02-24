import BaseEvm from "./BaseEvm";
import { EventOptions, EVMBaseEventListener } from "./types";
import { isSameOptions } from "./utils/dom";

interface EventTamerOptions {
    getElement: () => EventTarget;
}

const ADD_PROPERTIES = ["addEventListener"];
const REMOVE_PROPERTIES = ["removeEventListener"];

export class EventTamer<T extends EventTarget> extends BaseEvm {

    private oriTarget: EventTarget;

    protected rpList: {
        proxy: object;
        revoke: () => void;
    }[] = [];

    constructor(private target: T, private tamerOptions: EventTamerOptions) {
        if (!target) {
            throw Error("EventTamer target 必须是有效的元素");
        }
        super({
            isSameOptions
        })
        this.oriTarget = {
            ...target
        };

        Reflect.setPrototypeOf(this.oriTarget, Object.getPrototypeOf(target));

        this.watch()
    }

    private validateElement = () => {
        return this.tamerOptions.getElement() === this.target;
    }


    private addListenerProxy: EVMBaseEventListener = (target, event, listener, options) => {
        return super.innerAddListener(target, event, listener, options);
    }

    private removeListenerProxy: EVMBaseEventListener = (target, event, listener, options) => {
        return super.innerRemoveListener(target, event, listener, options);
    }

    add = (event: string, listener: EventListenerOrEventListenerObject, options: EventOptions) => {
        if (!this.validateElement()) throw new Error(`EventTamer target已失效`)
        this.addListenerProxy(this.target, event, listener, options)
    }

    remove = (event: string, listener: EventListenerOrEventListenerObject, options: EventOptions) => {
        if (!this.validateElement()) throw new Error(`EventTamer target已失效`)
        this.removeListenerProxy(this.target, event, listener, options)
    }


    watch() {
        super.watch();
        let rp;
        // addListener addEventListener on prependListener
        rp = this.checkAndProxy(this.target, this.addListenerProxy, ADD_PROPERTIES);
        if (rp !== null) {
            this.rpList.push(rp);
        }
        // removeListener removeEventListener off
        rp = this.checkAndProxy(this.target, this.removeListenerProxy, REMOVE_PROPERTIES);
        if (rp !== null) {
            this.rpList.push(rp);
        }

        return () => this.cancel();
    }

    cancel(clear: boolean = false) {
        super.cancel();
        this.restoreProperties(this.target, this.oriTarget, ADD_PROPERTIES);
        this.restoreProperties(this.target, this.oriTarget, REMOVE_PROPERTIES);
        this.rpList.forEach(rp => rp.revoke());
        this.rpList = [];
        if (clear) {
            this.clear();
        }
    }


    clear(type: string | undefined = undefined) {
        if (!this.validateElement()) console.error("EventTamer target已失效");
        const objMap = this.eventsMap.getEventsObj(this.target);
        if (!objMap) return;

        let keys = [...objMap.keys()];
        if (typeof type === 'string') {
            keys = keys.filter(k => k === type);
        }

        if (keys.length === 0) return;

        keys.forEach(key => {
            const eventItems = objMap.get(key);
            if (!Array.isArray(eventItems)) return;
            for (let i = eventItems.length - 1; i >= 0; i--) {
                const eventItem = eventItems[i];
                this.target.removeEventListener(key, eventItem.listener, eventItem.options)
            }
        })


    }

    summary() {
        return this.eventsMap.getEventsObj(this.target)
    }
}