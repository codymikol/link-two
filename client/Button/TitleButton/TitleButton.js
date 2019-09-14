import Button from "../Button";
import Draw from "../../Draw/Draw"
import ScreenManager from "../../Screen/ScreenManager";

export default class TitleButton extends Button {
    constructor(x, y, txt, sideText, onClick, _screen) {

        let screenManager = new ScreenManager();

        super(screenManager.width / 2 - 200, y, txt, onClick, _screen);
        this.sideText = sideText;

        this.render = function () {
            let vm = this;
            Draw.square(vm.x, vm.y, vm.width, vm.height, this.hovered ? '#208C80' : '#208C30', 0.6);
            Draw.text(vm.text, vm.x + 20, vm.y + 20, 'black', 20, 0.6);
            if (this.hovered) Draw.text('> ' + vm.sideText, vm.x - 10, vm.y + (this.height / 2) + 7, '#208C80', 20, 1, 'right');
        };

        this.onResize = function () {
            this.x = (screenManager.width / 2) - 200;
        }
    }
}