import Surface from "../Surface"

export default class Floor extends Surface {
    constructor(x, y, height, width) {
        super(x, y, height, width);
        this.render = function () {
            ctx.globalAlpha = .5;
            ctx.fillStyle = '#bcb9ad';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
            ctx.globalAlpha = 1;
        }
    }
}