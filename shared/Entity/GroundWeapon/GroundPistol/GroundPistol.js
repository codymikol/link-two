import GroundWeapon from '../GroundWeapon'

export default class GroundPistol extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundPistol', 'Pocket Pistol');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            square(vm.cX - 10, vm.cY - 5, 5, 13, 'brown');
            square(vm.cX - 10, vm.cY - 5, 15, 5, 'silver');
        };
    }

}