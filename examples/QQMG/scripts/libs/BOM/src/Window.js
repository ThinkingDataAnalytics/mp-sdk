const { screenWidth, screenHeight, devicePixelRatio } = qq.getSystemInfoSync();

export const innerWidth = screenWidth;
export const innerHeight = screenHeight;
export { devicePixelRatio };
export const screen = {
    availWidth: innerWidth,
    availHeight: innerHeight
};
export const ontouchstart = null;
export const ontouchmove = null;
export const ontouchend = null;

// export performance from './performance'
