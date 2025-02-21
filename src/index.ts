type EventTamerElement = Node | Window | Document;

export interface EventTamerListenerOptions {
    name: string;
}

export interface EventTamerListenerObject {
    options?: EventTamerListenerOptions;
    listener: EventListenerOrEventListenerObject;
}

export class EventTamer {

    private listeners: EventTamerListenerObject[] = [];
    private isSubscribed: boolean = false;

    constructor(private el: EventTamerElement, private type: string, private options?: boolean | AddEventListenerOptions) {
        if (!el) {
            throw Error("SoleEventContainer el 必须是有效的元素");
        }
        if (!type) {
            throw Error("SoleEventContainer event 必须是有效的事件名");
        }
    }

    private onEvent: EventListenerOrEventListenerObject = (evt) => {
        this.listeners.forEach(listener => {
            this.callListenerObject(listener, evt)
        });
    }

    private callListenerObject(listenerObject: EventTamerListenerObject, evt: Event) {
        if (typeof listenerObject.listener === "function") {
            listenerObject.listener.call(this.el, evt)
        } else if (typeof listenerObject.listener.handleEvent === "function") {
            listenerObject.listener.handleEvent.call(this.el, evt)
        }
    }

    private listenerToString(listener: EventListenerOrEventListenerObject) {
        if (typeof listener === "function") {
            return listener.toString();
        } else if (typeof listener.handleEvent === "function") {
            return {
                handleEvent: listener.handleEvent.toString()
            }
        }
    }

    subscribe() {
        if (this.isSubscribed) {
            return console.warn(`${this.type} 重复订阅`);
        }
        this.el.addEventListener(this.type, this.onEvent, this.options);
        this.isSubscribed = true;
    }

    unsubscribe() {
        this.el.removeEventListener(this.type, this.onEvent, this.options);
        this.listeners = [];
        this.isSubscribed = false;
    }

    add(listener: EventListenerOrEventListenerObject, options?: EventTamerListenerOptions) {
        this.listeners.push({
            listener,
            options
        });
    }

    remove(listener: EventListenerOrEventListenerObject) {
        const index = this.listeners.findIndex(l => l.listener == listener);
        if (index < 0) {
            return
        }
        this.listeners.splice(index, 1);
    }

    summary(listenerToString: boolean = false) {
        const listeners = listenerToString ? this.listeners.map(l => ({
            options: l.options,
            listener: this.listenerToString(l.listener)
        })) : this.listeners

        return Object.freeze({
            type: this.type,
            el: this.el,
            options: this.options,
            listeners
        })
    }
}