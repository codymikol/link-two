import Entity from "../Entity";

export default class Projectile extends Entity {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce, wobble, speedFloor, speedCeiling, cooldown, halflife, damage) {
        super(x, y, 5, 5,  1);
        this.nonce = nonce;
        this.weaponCooldown = cooldown;
        this._startingX = x;
        this._startingY = y;
        this.damage = damage;
        this.playerNonce = playerNonce;
        this.rotationDegrees = rotationDegrees;
        this.wobbleRotation = (randomIntFromInterval(-wobble, wobble)) + this.rotationDegrees;
        this.speed = randomIntFromInterval(speedFloor, speedCeiling);
        this.halfLife = halflife - (this.speed * randomIntFromInterval(-(wobble + 5), (wobble + 5))); // 4 seconds.
        this.fireTime = fireTime;
        this.render = function () {
            let vm = this;
            square(vm.x, vm.y, vm.width, vm.height, vm.color || 'orange', 1);
            addEntity(new Contrail(this.x, this.y, this.height, this.width));
        };
        this._getDeltaTime = function () {
            return ((serverTime - this.fireTime) / tick_rate);
        };
        this.onTick = function () {
            this.x = this._startingX + (this.speed * Math.cos(this.wobbleRotation * Math.PI / 180) * this._getDeltaTime());
            this.y = this._startingY + (this.speed * Math.sin(this.wobbleRotation * Math.PI / 180) * this._getDeltaTime());
        };
    }
}