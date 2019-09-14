import ListOffset from "../../ListOffset";
import Draw from "../../../../../Draw/Draw";

export default class IconFrame extends ListOffset {

    constructor(){
        super();
    }

    render() {
        Draw.square(this.width / 2 - 435, this.y - 22, 80, 80, 'white', 0.2)
    }

}