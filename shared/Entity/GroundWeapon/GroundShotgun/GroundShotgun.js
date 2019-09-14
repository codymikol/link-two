import GroundWeapon from "../GroundWeapon";
import Draw from "../../../../client/Draw/Draw";

export default class GroundShotgun extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundShotgun', 'Thunderous Blunderbuss');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            Draw.square(vm.cX - 15, vm.cY - 5, 40, 5, 'silver');
            Draw.square(vm.cX - 5, vm.cY - 1, 20, 6, 'brown');
            Draw.square(vm.cX - 20, vm.cY - 5, 10, 10, 'brown');
            Draw.square(vm.cX - 20, vm.cY + 5, 10, 5, 'brown');
        }
    }
}