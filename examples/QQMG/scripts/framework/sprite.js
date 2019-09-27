export default class Sprite {
    constructor(src = '', styles = {}) {
        this.img = new Image();
        this.img.src = src;

        this.width = styles.width || 0;
        this.height = styles.height || 0;
        this.x = styles.x || 0;
        this.y = styles.y || 0;

        this.zIndex = styles.zIndex || 0;

        this.visible = true;

        this.children = [];
        this.parent = null;
    }

    beforeRender() {
        return 0;
    }
    afterRender() {
        return 0;
    }
    render(ctx) {
        if (!this.visible) {
            return;
        }
        this.beforeRender(ctx);

        if (this.parent) {
            ctx.drawImage(this.img, this.x + this.parent.x, this.y + this.parent.y, this.width, this.height);
        } else {
            ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        }

        this.afterRender(ctx);
    }

    appendChild(sprite) {
        this.children.push(sprite);
        sprite.parent = this;
    }

    removeChild(sprite) {
        const index = this.children.findIndex((child) => child === sprite);
        if (index > -1) {
            return this.children.splice(index, 1);
        }
        sprite.parent = null;
        return null;
    }

    getChildren() {
        return this.children.concat();
    }

    getChildrenTraversing() {
        let children = this.getChildren();
        let childrenTraversing = [];
        children.forEach(child => {
            childrenTraversing = childrenTraversing.concat(child.getChildren());
        });
        return children.concat(childrenTraversing);
    }

    isImpacted(sprite) {
        if (!(sprite instanceof Sprite)) {
            throw new TypeError(`'sprite' must be an instance of 'Sprite'.`);
        }
        if (!this.visible || !sprite.visible) {
            return false;
        }

        return (sprite.x > this.x - sprite.width &&
            sprite.x < this.x + this.width + sprite.width &&
            sprite.y > this.y - sprite.height &&
            sprite.y < this.y + this.height + sprite.height);
    }

    isTouched(touches, firstFingerOnly = true) {
        if (!touches || touches.length === 0) {
            return false;
        }

        for (let index = 0; index < touches.length; ++index) {
            if (firstFingerOnly && index > 0) {
                return false;
            }
            let touch = touches[index];

            if (touch.clientX >= this.x && touch.clientX <= this.x + this.width &&
                touch.clientY >= this.y && touch.clientY <= this.y + this.height) {
                return true;
            }
        }

        return false;
    }

}