import GroundWeapon from "../GroundWeapon";
import Draw from "../../../../client/Draw/Draw";

export default class GroundMachineGun extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundMachineGun', 'Gatling Gun');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            Draw.square(vm.cX - 15, vm.cY - 5, 35, 4, '#BDDA00');
            Draw.square(vm.cX - 15, vm.cY, 35, 4, '#BDDA00');
            Draw.square(vm.cX - 15, vm.cY + 5, 35, 4, '#BDDA00');
            Draw.square(vm.cX - 25, vm.cY - 6, 14, 18, '#858585');
        }
    }
}