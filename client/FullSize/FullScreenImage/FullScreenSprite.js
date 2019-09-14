import FullSize from "../FullSize";
import Sprite from "../../Image/Sprite";

export default class FullScreenSprite extends FullSize {

    constructor(src, xOffset, yOffset, width, height) {
        super(0);
        this.image = new Sprite(src, this.cX + xOffset, this.cY + yOffset);
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.render = () => {
            this.image.x = this.cX + this.xOffset;
            this.image.y = this.yOffset;
            this.image.height = height * (this.zoom / 100);
            this.image.width = width * (this.zoom / 100);
            this.image.render();
        };

    }

}