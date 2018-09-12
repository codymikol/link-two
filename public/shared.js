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

const wallTestList = [];

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
        this._keydown = function (key) {
            if (this['on' + key.toUpperCase() + 'Down'] && this.isOnScreen()) this['on' + key.toUpperCase() + 'Down']();
        };
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };
    }
}

function asCentered(e) {
    return {x: e.width / 2 + e.x, y: e.height / 2 + e.y, height: e.height, width: e.width}
}

function entitiesCollide(a, b) {
    return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));
}

function randomIntFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function newGunWithNonce(nonce, type, args) {
    let theGun = newGun(type, args);
    theGun.nonce = nonce;
    return theGun;
}

function newGun(type, args) {
    switch (type) {
        case 'GroundPistol' :
            return new GroundPistol(...args);
        case 'GroundShotgun':
            return new GroundShotgun(...args);
        case 'GroundMachineGun':
            return new GroundMachineGun(...args);
        case 'GroundSmg':
            return new GroundSmg(...args);
    }
}

class Environment {
    constructor(room) {
        this.room = room;
        this.nonce = room.nonce;
        this.projectiles = new Map();
        this.eventQueue = new Map();
        // let mapIndex = Math.floor(randomIntFromInterval(0,wallTestList.length-1))
        let mapIndex = 0;
        this.walls = this.buildWalls(mapIndex);
        this.assignStartingPositions(mapIndex);
        this.groundWeapons = this.buildGroundWeapons(mapIndex);
    }

    //TODO: This should be nonspecific to entities
    buildWalls(mapIndex) {
        return wallTestList[mapIndex]
            .filter((currentWall) => {
                return currentWall.type === 'Wall';
            }).reduce((col, currentWall) => {
                wallNonce++;
                let newNonce = wallNonce;
                col.set(newNonce, new Wall(newNonce, ...currentWall.args));
                return col;
            }, new Map());
    }

    buildGroundWeapons(mapIndex) {
        return wallTestList[mapIndex]
            .filter((currentObj) => {
                return currentObj.type === 'GroundPistol'
                    || currentObj.type === 'GroundShotgun'
                    || currentObj.type === 'GroundMachineGun'
                    || currentObj.type === 'GroundSmg';
            }).reduce((col, currentObj) => {
                wallNonce++;
                let weaponNonce = wallNonce;
                let gun = newGunWithNonce(weaponNonce, currentObj.type, currentObj.args);
                col.set(weaponNonce, gun);
                return col;
            }, new Map());
    }

    assignStartingPositions(mapIndex) {
        let startingPosition = wallTestList[mapIndex].filter(function (currentObj) {
            return currentObj.type === 'Starting';
        })[0];

        var positionIndex = 0;
        this.room.actors.forEach(function (actor, index) {
            actor.x = startingPosition.args[positionIndex];
            actor.y = startingPosition.args[positionIndex + 1];
            positionIndex += 2;
        });
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
            //TODO: Assume the client knows that wall colisions result in projectile destruction so we can remove this
            // from network calls...
            let wallColliding = this.getWallColliding(projectile);

            let destroyProjectile = hitPlayers.length > 0 || wallColliding.length > 0;

            if (hitPlayers.length > 0) projectileOwner.stats.awardHit();
            if (wallColliding.length > 0) projectileOwner.stats.awardMiss();

            if (destroyProjectile) {
                this.addEventQueue("projectile-collision", {nonce: projectile.nonce});
                this.projectiles.delete(key);
            }

            hitPlayers.forEach((player) => {
                player.takeDamage(1);
                if (player.isDead) projectileOwner.stats.awardKill();
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
            ctx.globalAlpha = (this.isDead) ? .3 : 1;
            ctx.fillStyle = (this.isDead) ? 'white' : this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationDegrees * Math.PI / 180);
            ctx.fillRect(this.width / this.x - 10, this.height / this.y - 10, this.width, this.height);

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
        this.health = 100;
        this.isDead = false;
    }

    tickCooldown() {
        if(this.weaponCooldown > 0) this.weaponCooldown--;
    }
}

class Projectile extends Entity {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce, wobble, speedFloor, speedCeiling, cooldown) {
        super(x, y, 5, 5,  1);
        this.halflife = 15;
        this.nonce = nonce;
        this.weaponCooldown = cooldown;
        this._startingX = x;
        this._startingY = y;
        this.playerNonce = playerNonce;
        this.rotationDegrees = rotationDegrees;
        this.wobbleRotation = (randomIntFromInterval(-wobble, wobble)) + this.rotationDegrees;
        this.speed = randomIntFromInterval(speedFloor, speedCeiling);
        this.fireTime = fireTime;
        this.render = function () {
            let vm = this;
            square(vm.x, vm.y, vm.width, vm.height, vm.color || 'orange', 1)
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
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 1, 8, 8, 10);
    }
}

class ShotgunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8, 50);
    }
}

class MachineGunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 5, 8, 1);
    }
}

class SmgProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 3, 10, 11, 5);
    }
}

class Surface extends Entity {
    constructor(x, y, height, width) {
        super(x, y, height, width, 1);
    }
}

class GroundWeapon extends Entity {
    constructor(x, y, weaponTag, weaponName) {
        super(x, y, 50, 50, 1);
        this.weaponName = weaponName;
        this.weaponTag = weaponTag;
        this.cX = this.width / 2 + this.x;
        this.cY = this.height / 2 + this.y;
        this.baseRender = function () {
            let vm = this;
            if (entitiesCollide(player, asCentered(this))) {
                square(50, 50, 800, 50, 'white', 0.3);
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

class GroundPistol extends GroundWeapon {
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
        this.renderWeapon = function () {
            let vm = this;
            square(vm.cX - 10, vm.cY - 5, 5, 13, 'brown');
            square(vm.cX - 10, vm.cY - 5, 15, 5, 'silver');
        }
    }

}

class GroundShotgun extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundShotgun', 'Thunderous Blunderbuss');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            square(vm.cX - 15, vm.cY - 5, 40, 5, 'silver');
            square(vm.cX - 5, vm.cY - 1, 20, 6, 'brown');
            square(vm.cX - 20, vm.cY - 5, 10, 10, 'brown');
            square(vm.cX - 20, vm.cY + 5, 10, 5, 'brown');
        }
    }
}

class GroundMachineGun extends GroundWeapon {
    constructor(x, y) {
        super(x, y, 'GroundMachineGun', 'Gatling Gun');
        this.render = function () {
            this.baseRender();
            this.renderWeapon();
        };
        this.renderWeapon = function () {
            let vm = this;
            square(vm.cX - 15, vm.cY - 5, 35, 4, '#BDDA00');
            square(vm.cX - 15, vm.cY, 35, 4, '#BDDA00');
            square(vm.cX - 15, vm.cY + 5, 35, 4, '#BDDA00');
            square(vm.cX - 25, vm.cY - 6, 14, 18, '#858585');
        }
    }
}

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

class Floor extends Surface {
    constructor(x, y, height, width) {
        super(x, y, height, width);
        this.render = function () {
            ctx.globalAlpha = .5;
            ctx.fillStyle = '#bcb9ad';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
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
