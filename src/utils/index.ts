const hasOwnP = Object.prototype.hasOwnProperty;
const NATIVE_CODE_ANONYMOUS_FUN = "function () { [native code] }";
const NATIVE_CODE_CON = `{ [native code] }`;

/**
 * 是否有某属性
 * @param obj 
 * @param property 
 * @returns 
 */
export function hasOwnProperty(obj: unknown, property: string): boolean {
    if (!isObject(obj)) {
        return false;
    }
    return hasOwnP.call(obj, property);
}


export function isFunction(fn: Function): boolean {
    return typeof fn === 'function'
}

export function isBoolean(obj: any) {
    return typeof obj === "boolean";
}

export function isObject(obj: unknown): boolean {
    return obj !== null && typeof obj === 'object';
}

/**
 * 创建纯净对象
 * @returns 
 */
export function createPureObject(obj: unknown = undefined): object {

    const pObj = Object.create(null);
    if (!isObject(obj)) {
        return pObj;
    }

    return Object.assign(pObj, obj)
}

/**
 * 是否是同一函数
 * @param fn1 
 * @param fn2 
 * @param compareContent 
 * @returns 
 */
export function isSameFunction(fn1: Function | undefined | null, fn2: Function | undefined | null, compareContent = false) {

    if (fn1 == undefined || fn2 == undefined) {
        return false;
    }

    if (!isFunction(fn1) || !isFunction(fn2)) {
        return false;
    }

    if (fn1.length !== fn2.length) {
        return false;
    }

    // if (fn1.name !== fn2.name) {
    //     return false;
    // }

    if (!compareContent) {
        return fn1 === fn2;
    }

    return fn1 === fn2 || isSameContentFunction(fn1, fn2);
}

function isSameContentFunction(fn1: Function, fn2: Function) {
    if (!isFunction(fn1) || !isFunction(fn2)) {
        return false;
    }
    const fn1Content = getFunctionContent(fn1);
    const fn2Content = getFunctionContent(fn2);

    if (isBuiltinFunctionContent(fn1Content) || isBuiltinFunctionContent(fn2Content)) {
        return false;
    }
    return fn1Content == fn2Content;
}

/**
 * 获取函数体
 * @param fn 
 * @returns 
 */
export function getFunctionContent(fn: Function) {
    const content = fn.toString();
    if (content == NATIVE_CODE_ANONYMOUS_FUN) {
        return NATIVE_CODE_ANONYMOUS_FUN.slice(11);
    }
    // TODO:: 特殊函数名处理
    // const startIndex = `function ${fn.name}()`.length;
    // return content.slice(startIndex)
    const index = content.indexOf("{");
    return content.slice(index);
}


export function isBuiltinFunctionContent(content: string): boolean {
    return content.trim() == NATIVE_CODE_CON;
}

export function isSameStringifyObject(obj1: unknown, obj2: unknown) {
    return JSON.stringify(obj1) === JSON.stringify(obj2)
}

export function booleanFalse(): boolean {
    return false;
}

/**
 * 还原属性方法
 * @param target 
 * @param oriTarget 
 * @param properties 
 */
export function restoreProperties(target: any, oriTarget: any, properties: string[]): void {
    properties.forEach(pname => {
        if ( (pname in target) && isFunction(target[pname])) {
            if (pname in Object.getPrototypeOf(oriTarget)) {
                // 因为是原型上有，删除自身即可
                // target[pname] = oriTarget[pname]
                delete target[pname]
            } else {
                target[pname] = oriTarget[pname]
            }
        }
    })
}

export function isStrict(this: any) {
    return this === undefined;
};

const regexpUseStrict = /^function[^(]*\([^)]*\)\s*\{\s*(["'])use strict\1/
export function isFunctionStrict(fn: Function) {
    return regexpUseStrict.test(fn.toString())
}

export function getStack(fn: Function): string[] {
    const stacks: string[] = [];

    // 严格模式
    if (isStrict() || isFunctionStrict(fn)) {
        return stacks;
    }
    stacks.unshift(`function ${fn.name}`);
    let caller = fn.caller;
    while (caller) {
        stacks.unshift(`function ${caller.name}`);
        caller = caller.caller;
    }
    return stacks;
}