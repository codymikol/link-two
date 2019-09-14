import Entity from '../Entity'

export default class Surface extends Entity {
    constructor(x, y, height, width) {
        super(x, y, height, width, 1);
    }
}