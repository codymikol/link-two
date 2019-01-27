import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class CreditsTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            [
                'Cody Mikol|https://github.com/codymikol|grey',
                'John Flynn|https://github.com/Neuman968|purple',
                'Morgan Coleman|https://github.com/KingCole22|blue',
            ].forEach((line, index) => {
                let parts = line.split('|');
                Draw.text(parts[0], this.cX, 440 + 110 * index, undefined, 30, 1, 'center');
                Draw.text(parts[1], this.cX, 480 + 110 * index, undefined, 25, 1, 'center');
            });
        }
    }
}