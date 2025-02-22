
export type EventOptions =  boolean | AddEventListenerOptions;

export interface EventsMapItem {
    listener: EventListenerOrEventListenerObject;
    options: EventOptions
}

export type EventType = string;


export interface ISameOptions<O = EventOptions> {
    (options1: O, options2: O): boolean;
}

export interface ISameFunction {
    (fn1: any, fn2: any, ...args: any[]): boolean;
}

export interface BaseEvmOptions<S = any> {
    /**
     * 是否是相同选项
     */
    isSameOptions?: ISameOptions<S>;
}


export interface EVMBaseEventListener<R = void> {
    (target: Object, event: string, listener: Function, options: EventOptions): R
}

export interface ListenerWrapper {
    listener: Function
}

export interface StatisticsOptions {
    containsContent?: boolean;
    forceGC?: boolean;
}

export interface EvmEventsMapOptions {
    isSameOptions?: ISameOptions;
    isSameFunction?(fun1: Function, fun2: Function): boolean;
}


type EVMOptions = BaseEvmOptions & {
    et?: Object
}

export interface CreateOptions {
    events?: EVMOptions,
    cEvents?: EVMOptions,
    eTarget?: EVMOptions
}

export enum EnumEVMType {
    events = "events",
    cEvents = "cEvents",
    eTarget = "eTarget"
}