import { createPureObject, hasOwnProperty, isBoolean, isObject } from ".";

/**
 * 获取
 */
function getAddEventListenerOptions(options: boolean | AddEventListenerOptions): AddEventListenerOptions {
    // 未定义
    if (options === undefined) {
        return {
            capture: false
        }
    }

    if (isBoolean(options)) {
        return {
            capture: options as boolean
        }
    }

    if (isObject(options)) {
        return options as AddEventListenerOptions
    }

    return {
        capture: false
    }

}


/**
 * EventTarget的addEventListener, removeEventListener的第三个参数options是否相同的判断
 * @param options1 
 * @param options2 
 */
export function isSameOptions(options1: boolean | AddEventListenerOptions = {
    capture: false
}, options2: boolean | AddEventListenerOptions = {
    capture: false
}): boolean {

    const opt1 = getAddEventListenerOptions(options1);
    const opt2 = getAddEventListenerOptions(options2);
    return opt1.capture === opt2.capture;
}



/**
 * 忽略 signal属性 https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
 * 忽略对象属性 
 * TODO:: improve
 * @param option 
 */
export function copyListenerOption<T = any>(options: T) {
    if (typeof options !== "object") {
        return options;
    }


    const result = createPureObject();
    let v;
    for (let p in options) {

        // TODO::  improve 
        if (typeof p !== "string" || typeof p !== "number") {
            continue;
        }

        if (!hasOwnProperty(options, p)) {
            continue;
        }
        v = options[p];
        if (isObject(v)) {
            continue;
        }
        result[p] = v;
    }
    return result;
}