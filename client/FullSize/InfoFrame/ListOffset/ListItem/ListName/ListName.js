import ListOffset from "../../ListOffset";
import Draw from "../../../../../Draw/Draw";

export default class ListName extends ListOffset{

    constructor(){
        super();
        this.render = function () {
            Draw.square(this.width / 2 - 435, this.y + 3, 80, 80, 'reddit', 0.2)
        }
    }

}