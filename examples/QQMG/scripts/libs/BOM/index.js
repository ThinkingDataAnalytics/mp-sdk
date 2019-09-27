/**
 * 把expandedWindow中的属性复制到小游戏运行时的window对象上
 */
import * as expandedWindow from "./window";

const global = GameGlobal;

const inject = () => {
    expandedWindow.addEventListener = (type, listener) => {
        expandedWindow.document.addEventListener(type, listener);
    };
    expandedWindow.removeEventListener = (type, listener) => {
        expandedWindow.document.removeEventListener(type, listener);
    };

    if (expandedWindow.canvas) {
        expandedWindow.canvas.addEventListener =
            expandedWindow.addEventListener;
        expandedWindow.canvas.removeEventListener =
            expandedWindow.removeEventListener;
    }

    const { platform } = qq.getSystemInfoSync();

    if (platform === "devtools") {
        for (const key in expandedWindow) {
            if (!Object.prototype.hasOwnProperty.call(expandedWindow, key)) {
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(global, key);
            if (!descriptor || descriptor.configurable === true) {
                Object.defineProperty(window, key, {
                    value: expandedWindow[key]
                });
            }
        }

        for (const key in expandedWindow.document) {
            if (
                !Object.prototype.hasOwnProperty.call(
                    expandedWindow.document,
                    key
                )
            ) {
                continue;
            }
            const descriptor = Object.getOwnPropertyDescriptor(
                global.document,
                key
            );

            if (!descriptor || descriptor.configurable === true) {
                Object.defineProperty(global.document, key, {
                    value: expandedWindow.document[key]
                });
            }
        }
        window.parent = window;
    } else {
        for (const key in expandedWindow) {
            if (!Object.prototype.hasOwnProperty.call(expandedWindow, key)) {
                continue;
            }
            global[key] = expandedWindow[key];
        }
        global.window = expandedWindow;
        window = global;
        window.top = window.parent = window;
    }
};

if (!global.__hasAdapterInjected) {
    global.__hasAdapterInjected = true;
    inject();
}
