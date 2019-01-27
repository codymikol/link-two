import Entity from "../../shared/Entity/Entity";
import Draw from "../Draw/Draw";

export default class Contrail extends Entity {
    constructor(x, y, height, width) {
        super(x, y, height, width);
        this.halflife = 1;
        this.render = function () {
            let ctx = Draw.getCtx();
            ctx.globalAlpha = 1 / this.halflife;
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.height * this.halflife / 20, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.globalAlpha = 1;
        };
        this.onTick = function () {
            this.halflife++;
            if (this.halflife === 10) this.destroy();
        }
    }
}