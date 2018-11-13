import FullSize from "../FullSize";

export default class InstructionsTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            text('MOUSE', this.cX - 396, 450, 'black', 15, 1, 'center');
            text('DOWN', this.cX - 396, 470, 'black', 15, 1, 'center');
            text('Fire your held Killing Device', this.cX - 330, 470, undefined, 20, 1, 'start');
            text('W A', this.cX - 396, 560, 'black', 25, 1, 'center');
            text('S D', this.cX - 396, 590, 'black', 25, 1, 'center');
            text('Navigate the Pre-Network Dungeon', this.cX - 330, 570, undefined, 20, 1, 'start');
            text('E', this.cX - 396, 680, 'black', 25, 1, 'center');
            text('Pick up Killing Devices scattered about the Pre Network', this.cX - 330, 680, undefined, 20, 1, 'start');
        }
    }
}