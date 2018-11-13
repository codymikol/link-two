import Entity from "../../shared/Entity/Entity";

export default class FullSize extends Entity {
    constructor(_screen) {
        super(0, 0, window.innerHeight, window.innerWidth, _screen);
        this.timer = 0;
        this.cX = this.width / 2;
        this.cY = this.height / 2;
        this.onResize = function () {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
            this.cX = this.width / 2;
            this.cY = this.height / 2;
        };
        this.onTick = function () {
            this.timer += 1;
            if (this.timer === 60) this.timer = 0;
        };
    }
}