import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class LobbyTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            let vm = this;
            //Draw.text(`Competitor: ${player.name}`, vm.width / 2 - 325, 465, undefined, 30);
            //getEnemies().forEach((enemy, index) => text(`Competitor: ${enemy.name}`, vm.width / 2 - 325, 465 + 110 * (index + 1), undefined, 30))
        };
    }
}