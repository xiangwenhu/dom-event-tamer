import { hasOwnProperty, isFunction } from "./index";

/**
 * 检查属性，并产生代理
 * @param target 
 * @param callback 
 * @param ckProperties 
 * @param proxyProperties 
 * @returns 
 */
export function checkAndProxy(target: any, callback: Function, ckProperties: string[], proxyProperties: string[] = ckProperties) {
    let fn;

    // 检查方法
    for (let i = 0; i < ckProperties.length; i++) {
        const property = ckProperties[i];
        if (!(property in target)) {
            continue;
        }
        fn = target[property];
        if (isFunction(fn)) {
            break;
        }

    }

    if (!isFunction(fn)) {
        return null;
    }

    const rpProxy = createFunProxy(fn, callback);
    if (!rpProxy) {
        return null;
    }

    // 替换方法
    proxyProperties.forEach(pname => {
        if ( (pname in target) && isFunction(target[pname])) {
            target[pname] = rpProxy.proxy
        }
    })

    return rpProxy;
}

export function createFunProxy(oriFun: Function, callback: Function) {
    if (!isFunction(oriFun)) {
        throw new Error("createFunProxy:: oriFun should be a function");
    }
    const rProxy = createRevocableProxy(oriFun,
        createApplyHandler(callback));

    return rProxy;
}

/**
 * 创建可取消的代理
 * @param obj 
 * @param handler 
 * @returns 
 */
export function createRevocableProxy(obj: object | Function, handler: any) {
    return Proxy.revocable(obj, handler);
}


/**
 * 创建拦截函数调用的代理
 * @param callback 
 * @returns 
 */
export function createApplyHandler(callback: Function) {
    return {
        apply(target: Function, ctx: object, args: unknown[]) {
            // 因为执行过程中能失败，所以callback后置执行
            const result = Reflect.apply(target, ctx, args);
            callback(...[ctx].concat(args));
            return result;
        }
    }
}