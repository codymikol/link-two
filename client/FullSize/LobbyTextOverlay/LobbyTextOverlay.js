import FullSize from "../FullSize";

export default class LobbyTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            let vm = this;
            text(`Competitor: ${player.name}`, vm.width / 2 - 325, 465, undefined, 30);
            getEnemies().forEach((enemy, index) => text(`Competitor: ${enemy.name}`, vm.width / 2 - 325, 465 + 110 * (index + 1), undefined, 30))
        };
    }
}