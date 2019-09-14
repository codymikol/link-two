import ListOffset from "../ListOffset";
import IconFrame from "./IconFrame/IconFrame";
import ListName from "./ListName/ListName";

export default class ListItem extends ListOffset {

    constructor(offset) {
        super(offset);
        this.add(new ListName());
        this.add(new IconFrame());
    }

}