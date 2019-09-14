import Button from "../Button";
import Draw from "../../Draw/Draw";

export default class HighlightButton extends Button {
    constructor(x, y, height, width, text, onClick) {
        super(x, y, text, onClick);
    }

    render() {
        Draw.square(this.x, this.y, this.width, this.height, 'white', this.hovered ? 0.1 : 0.3)
    }

}