"use strict";

function forObj(obj, fn) {
    Object.keys(obj).forEach(function (key) {
        fn(obj[key], key);
    })
}

function copyProps(src, dest) {
    Object.keys(src).forEach((key) => dest[key] = src[key]);
}

let abs = Math.abs;
let wallNonce = 0;
const map_height = 5000;
const map_width = 5000;
const map_count = 3;
const tick_rate = 25;
let serverTime = 0;

const wallTestList = [
];

class Entity {
    constructor(x, y, height, width, _screen) {
        this.nonce = null;
        this.namespace = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
        this.isOnScreen = function () {
            return this._screen === screen
        };
        this._screen = _screen;
        this._sethover = function () {
            this.hovered = this.isOnScreen() && mouseInBounds(this.x, this.y, this.height, this.width)
        };
        this._anyclick = function () {
            if (this.isOnScreen() && this.onAnyClick) this.onAnyClick();
        };
        this._click = function () {
            if (this.hovered && this.onClick) this.onClick();
        };
        this._render = function () {
            if (this.isOnScreen()) this.render();
        };
        this._mousemove = function () {
            if (this.isOnScreen() && this.onMouseMove) this.onMouseMove();
        };
        this._tick = function (delta) {
            if (this.isOnScreen() && this.onTick) this.onTick(delta);
        };
        this._resize = function () {
            if (this.onResize) this.onResize();
        };
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };
    }
}

function entitiesCollide(a, b) {
    return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));
}

function randomIntFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

class Environment {
    constructor(room) {
        this.room = room;
        this.nonce = room.nonce;
        this.projectiles = new Map();
        this.eventQueue = new Map();
        this.walls = this.buildWalls();
    }

    //TODO: This should be nonspecific to entities
    buildWalls() {

        return wallTestList[Math.floor(randomIntFromInterval(0,wallTestList.length-1))]
            .reduce(function (col, currentWall) {
                col.set(wallNonce++, new Wall(wallNonce, ...currentWall.args));
                return col;
            }, new Map())

    }

    addEventQueue(eventName, val) {
        if (!this.eventQueue.has(eventName)) {
            this.eventQueue.set(eventName, []);
        }
        this.eventQueue.get(eventName).push(val);
    }

    environmentTick() {
        this.projectiles.forEach((projectile, key) => {

            let projectileOwner = this.room.actors.get(projectile.playerNonce);

            projectile.onTick();

            let hitPlayers = this.getPlayerColliding(projectile);
            //TODO: Assume the client knows that wall colisions result in projectile destruction so we can remove this from network calls...
            let wallColliding = this.getWallColliding(projectile);

            let destroyProjectile = hitPlayers.length > 0 || wallColliding.length > 0;

            if(hitPlayers.length > 0) projectileOwner.stats.awardHit();
            if (wallColliding.length > 0) projectileOwner.stats.awardMiss();

            if (destroyProjectile) {
                this.addEventQueue("projectile-collision", {nonce: projectile.nonce});
                this.projectiles.delete(key);
            }

            hitPlayers.forEach((player) => {
                player.takeDamage(1);
                if(player.isDead) projectileOwner.stats.awardKill();
            })

        });
    }

    addProjectile(projectile) {
        if (projectile && projectile.nonce) {
            this.projectiles.set(projectile.nonce, projectile);
        }
    }

    addWall(wall) {
        if (wall && wall.nonce) {
            this.walls.set(wall.nonce, wall);
        }
    }

    getPlayerColliding(projectile) {
        return Array.from(this.room.actors.values())
            .filter((actor) => !actor.isDead && (actor.nonce !== projectile.playerNonce) && entitiesCollide(actor, projectile));
    }

    getWallColliding(projectile) {
        return Array.from(this.walls.values()).filter((wall) => entitiesCollide(wall, projectile));
    }
}


class Actor extends Entity {
    constructor(x, y, color, name) {
        super(x, y, 20, 20, 1);
        this.health = 100;
        this.name = name;
        this.isDead = false;
        this.rotationDegrees = 0;
        this.color = color;
        this.velocity = .1;
        this.render = function () {
            ctx.globalAlpha = (this.isDead) ? .3 : 1;
            ctx.fillStyle = (this.isDead) ? 'white' : this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationDegrees * Math.PI / 180);
            ctx.fillRect(this.width / this.x - 10, this.height / this.y - 10, this.width, this.height);
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
    takeDamage(damageAmount){
        this.health -= damageAmount;
        this.isDead = this.health <= 0;
        if(this.isDead) this.stats.awardDeath();
    }

    reset() {
        this.health = 100;
        this.isDead = false;
    }
}

class Projectile extends Entity {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce, wobble, speedFloor, speedCeiling) {
        super(x, y, 5, 5, 1);
        this.halflife = 15;
        this.nonce = nonce;
        this._startingX = x;
        this._startingY = y;
        this.playerNonce = playerNonce;
        this.rotationDegrees = rotationDegrees;
        this.wobbleRotation = (randomIntFromInterval(-wobble, wobble)) + this.rotationDegrees;
        this.speed = randomIntFromInterval(speedFloor, speedCeiling);
        this.fireTime = fireTime;
        this.render = function () {
            let vm = this;
            square(vm.x,vm.y,vm.width,vm.height,vm.color || 'orange', 1)
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

class PistolProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8);
    }
}

class ShotgunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8);
    }
}

class MachineGunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8);
    }
}

class SmgProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8);
    }
}

class Surface extends Entity {
    constructor(x, y, height, width) {
        super(x, y, height, width, 1);
    }
}

class GroundWeapon extends Entity {
    constructor() {
        super(x,y,height,width, 1)
    }

}

class Floor extends Surface {
    constructor(x, y, height, width) {
        super(x, y, height, width);
        this.render = function () {
            ctx.globalAlpha = .5;
            ctx.fillStyle = '#bcb9ad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }
    }
}

class Wall extends Surface {
    constructor(nonce, x, y, height, width) {
        super(x, y, height, width);
        this.nonce = nonce;
        this.blocking = true;
        this.render = function () {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}
