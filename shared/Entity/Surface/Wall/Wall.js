import Surface from "../Surface";

export default class Wall extends Surface {
    constructor(nonce, x, y, height, width) {
        super(x, y, height, width);
        this.nonce = nonce;
        this.blocking = true;
        this.render = function () {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}