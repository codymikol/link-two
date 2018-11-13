let instance = null;

export default class DrawUtil {

    constructor() {
        if(instance) return instance;
        instance = this;
    }

    static resetCTX() {
        let ctx = this.getCtx();
        ctx.globalAlpha = 1;
        ctx.font = '30px Arial Black';
        ctx.textAlign = 'start';
        ctx.fillStyle = 'black';
    }

    static getCtx() {
        return document.getElementById('a').getContext('2d');
    }

    static square(x, y, width, height, color = 'red', alpha = 1) {
        let ctx = this.getCtx();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
        this.resetCTX();
    }

    static text(text, x, y, color = '#208C30', fontSize = 30, alpha = 1, align = 'start')  {
        let ctx = this.getCtx();
        ctx.globalAlpha = 0.6;
        ctx.font = fontSize + 'px Arial Black';
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.fillText(text, x, y);
        this.resetCTX();
    }

}

