import Actor from "../../shared/Entity/Actor/Actor";

export default class Enemy extends Actor {
    constructor(x, y, rotationDegrees, health, height, width) {
        super(x, y, 'red', rotationDegrees, health, height, width);
    }
}