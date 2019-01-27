import Entity from "../../shared/Entity/Entity";

export default class Button extends Entity {
    constructor(x, y, text, onClick) {
        super(x, y, 30, 400);
        this.text = text;
        this.onClick = onClick;
    }
}