
## 起因
HTML5的 Node, Element, Document ,Window, WebSocket，Worker， XMLHttpRequest等实例, 可以通过 addEventListener 来添加事件监听，也可以通过 removeEventListener 移除事件监听，但是却无法知道添加了多少个监听函数。 比如 window.addEventListener("error", fn), 多处添加后后，却无法知道整体的情况。



## 思路
已知道添加监听函数的参数如下：  
```javascript
EventTarget.addEventListener(type, listener)
EventTarget.addEventListener(type, listener, options)
EventTarget.addEventListener(type, listener, useCapture)
```
通过预设`EventTarget`, `type` 和 `options | useCapture`，然后专注管理监听函数即可。

 
## 安装
`npm install 

## 示例
```javascript
const resizeTamer = new EventTamer(window, "resize", false);

// 订阅后，监听事件才生效
resizeTamer.subscribe();

resizeTamer.add((ev) => {
    console.log("resize1")
}, {
    name: "resize1"
});

function resize2() {
    console.log("resize2");
}
resizeTamer.add(resize2, {
    name: "resize2"
});
console.log(resizeTamer.summary(true));

resizeTamer.remove(resize2);

resizeTamer.add((ev) => {
    console.log("resize3");
    console.log(globalThis.exports);
}, {
    name: "resize3"
});

console.log(resizeTamer.summary(true));
```
## 特性
* 预设监听函数的参数
* 统计监听函数的信息
* 监听函数可以添加额外信息，比如name，方便查看
* 提供 subscribe 和 unsubscribe，可以预设监听函数，等到何时时机再生效，比如等待 WebSocket 连接成功后。