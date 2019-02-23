import Entity from "../Entity";
import Draw from "../../../client/Draw/Draw";

export default class GroundWeapon extends Entity {
    constructor(x, y, weaponTag, weaponName) {
        super(x, y, 50, 50, 1);
        this.weaponName = weaponName;
        this.weaponTag = weaponTag;
        this.cX = this.width / 2 + this.x;
        this.cY = this.height / 2 + this.y;
        this.baseRender = function () {
            let vm = this;
            if (entitiesCollide(player, asCentered(this))) {
                Draw.square(50, 50, 800, 50, 'white', 0.3);
                text('Press E to pickup: ' + vm.weaponName, 60, 85, 'black', 30);
            }
        };
        this.onEDown = function () {
            if (entitiesCollide(player, asCentered(this))) {
                socket.emit('weapon-pickup', this.nonce);
            }
        };
    }
}