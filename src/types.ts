
export type EventOptions = boolean | AddEventListenerOptions | undefined;

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

export interface EvmEventsMapOptions {
    isSameOptions?: ISameOptions;
    isSameFunction?(fun1: Function, fun2: Function): boolean;
}


export type BooleanFunction = () => boolean;

export interface BaseEvmOptions<S = any> {
    /**
     * 是否是相同选项
     */
    isSameOptions?: ISameOptions<S>;
    /**
     * 最大的函数内容截取长度
     */
    maxContentLength?: number;
    /**
     * 是否重写bind函数
     */
    overrideBind?: boolean;
}


export interface StatisticsOptions {
    containsContent?: boolean;
}

export interface EVMBaseEventListener<R = void, ET = EventType> {
    (target: Object, event: ET, listener: EventListenerOrEventListenerObject, options: EventOptions): R
}