import Actor from "../../shared/Entity/Actor/Actor";

export default class Player extends Actor {
    constructor(x, y, rotationDegrees, health, height, width) {
        super(x, y, 'green', rotationDegrees, health, height, width);
        this.onMouseMove = function () {
            this.rotationDegrees = Math.atan2(mousePos.y - this.y, mousePos.x - this.x) * 180 / Math.PI;
        };
        this.onTick = function (delta) {

            let vm = this;

            let originalX = this.x;
            let originalY = this.y;

            if (keyDown.w) this.y -= this.velocity * delta;
            if (keyDown.s) this.y += this.velocity * delta;

            if (Object.keys(entities).some(function (entityKey) {
                if (!entities[entityKey].blocking) return false;
                return entitiesCollide(entities[entityKey], vm);
            })) {
                this.y = originalY;
            }

            if (keyDown.a) this.x -= this.velocity * delta;
            if (keyDown.d) this.x += this.velocity * delta;

            if (Object.keys(entities).some(function (entityKey) {
                if (!entities[entityKey].blocking) return false;
                return entitiesCollide(entities[entityKey], vm);
            })) {
                this.x = originalX;
            }

            if (mouseDown && !this.isDead && this.weaponCooldown === 0) {
                socket.emit('fire-projectile', {x: this.x, y: this.y, rotationDegrees: this.rotationDegrees});
            };

        };
    }
}