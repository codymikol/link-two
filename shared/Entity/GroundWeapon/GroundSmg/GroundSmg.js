import GroundWeapon from "../GroundWeapon";

class GroundSmg extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundSmg', 'SMG BABYY!');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            square(vm.cX - 15, vm.cY - 5, 5, 12, 'black');
            square(vm.cX - 2, vm.cY - 5, 5, 15, 'black');
            square(vm.cX - 15, vm.cY - 5, 30, 5, 'black');
        }
    }
}