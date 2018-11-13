import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class Background extends FullSize {
    constructor(screen) {
        super(screen);
        let vm = this;
        vm.render = function () {
            Draw.square(0, 0, vm.width, vm.height, 'black');
            let ctx = Draw.getCtx();
            ctx.fillStyle = '#208C30';
            ctx.globalAlpha = 0.05;
            for (let i = 0; i < 1000; i++) {
                [5, 10, 15, 120].forEach((height) => ctx.fillRect(0, 15 * i + vm.timer - 200, vm.width, height))
            }
        };
    }
}