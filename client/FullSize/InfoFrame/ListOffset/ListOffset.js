import FullSize from "../../FullSize";

export default class ListOffset extends FullSize {

    constructor(offset) {
        super();
        this.y = 22 + (offset * 100);
    }

}