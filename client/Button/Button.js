import Entity from "../../shared/Entity/Entity";

export default class Button extends Entity {
    constructor(x, y, text, onClick, _screen) {
        super(x, y, 30, 400, _screen);
        this.text = text;
        this.onClick = onClick;
    }
}