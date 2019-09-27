export default function Canvas() {
    const canvas = qq.createCanvas();

    // Object.setPrototypeOf(canvas, new HTMLElement('canvas'));

    canvas.getBoundingClientRect = () => {
        const ret = {
            top: 0,
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight
        };
        return ret;
    };

    return canvas;
}
