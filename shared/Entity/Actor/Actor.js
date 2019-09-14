import Entity from "../Entity";
import DrawUtil from "../../../client/Draw/Draw";
import GroundPistol from "../GroundWeapon/GroundPistol/GroundPistol";
import GroundMachineGun from "../GroundWeapon/GroundMachineGun/GroundMachineGun";
import GroundShotgun from "../GroundWeapon/GroundShotgun/GroundShotgun";
import GroundSmg from "../GroundWeapon/GroundSmg/GroundSmg";

export default class Actor extends Entity {
    constructor(x, y, color, name) {
        super(x, y, 20, 20, 1);
        this.health = 100;
        this.activeWeapon = 'GroundPistol';
        this.weaponCooldown = 0;
        this.name = name;
        this.isDead = false;
        this.rotationDegrees = 0;
        this.color = color;
        this.velocity = .15;
        this.getCallCtx = function () {
            return {cX: this.width / this.x + 27, cY: this.height / -5};
        };
        this.render = function () {
            var ctx = DrawUtil.getCtx();
            ctx.globalAlpha = (this.isDead) ? .3 : 1;
            ctx.fillStyle = (this.isDead) ? 'white' : this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationDegrees * Math.PI / 180);
            ctx.fillRect(this.width / this.x - 10, this.height / this.y - 10, this.width, this.height);

            if(!this.isDead) {
                switch (this.activeWeapon) {
                    case 'GroundPistol':
                        let pistol = new GroundPistol();
                        pistol.renderWeapon.call(this.getCallCtx());
                        break;
                    case 'GroundMachineGun':
                        let machinegun = new GroundMachineGun();
                        machinegun.renderWeapon.call(this.getCallCtx());
                        break;
                    case 'GroundShotgun':
                        let shotgun = new GroundShotgun();
                        shotgun.renderWeapon.call(this.getCallCtx());
                        break;
                    case 'GroundSmg':
                        let smg = new GroundSmg();
                        smg.renderWeapon.call(this.getCallCtx());
                        break;
                }
            }

            ctx.fillStyle = (this.isDead) ? 'grey' : 'salmon';
            ctx.beginPath();
            ctx.moveTo(-(this.width / 2), this.height / 2);
            ctx.lineTo(-(this.width / 2), -(this.height / 2));
            ctx.lineTo(this.width / 2, 0);
            ctx.fill();
            ctx.restore();
            ctx.globalAlpha = 1;
        };
    }

    takeDamage(damageAmount) {
        this.health -= damageAmount;
        this.isDead = this.health <= 0;
        if (this.isDead) this.stats.awardDeath();
    }

    reset() {
        this.health = max_health;
        this.activeWeapon = 'GroundPistol';
        this.isDead = false;
    }

    tickCooldown() {
        if(this.weaponCooldown > 0) this.weaponCooldown--;
    }
}