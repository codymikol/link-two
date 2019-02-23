import GroundWeapon from '../GroundWeapon'
import Draw from "../../../../client/Draw/Draw";

export default class GroundPistol extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundPistol', 'Pocket Pistol');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            Draw.square(vm.cX - 10, vm.cY - 5, 5, 13, 'brown');
            Draw.square(vm.cX - 10, vm.cY - 5, 15, 5, 'silver');
        };
    }

}