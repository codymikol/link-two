import Entity from "../../shared/Entity/Entity";

export default class FullSize extends Entity {
    constructor(xOffset, yOffset, height, width) {
        super(0, 0, window.innerHeight, window.innerWidth);
        this.timer = 0;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.calculateDimensions();
    }

    calculateDimensions() {
        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.cX = this.width / 2;
        this.cY = this.height / 2;
        this.zoom = Math.round(window.devicePixelRatio * 100 / 2);
    };

    onTick() {
        this.timer += 1;
        if (this.timer === 60) this.timer = 0;
    }

    onResize() {
        this.calculateDimensions();
    }

}