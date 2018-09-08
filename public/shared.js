"use strict";

function forObj(obj, fn) {
    Object.keys(obj).forEach(function (key) {
        fn(obj[key], key);
    })
}

function copyProps(src, dest) {
    Object.keys(src).forEach((key) => dest[key] = src[key]);
}

function asCentered(entity) {
    return {
        x: entity.x + entity.width /2,
        y: entity.y + entity.height /2,
        height:entity.height,
        width: entity.width
    }
}

let abs = Math.abs;
let nonce = 0;
const map_height = 5000;
const map_width = 5000;
const required_players = 1;
const tick_rate = 25;
let serverTime = 0;

class Entity {
    constructor(x, y, height, width, _screen, map) {
        this.nonce = null;
        this.map = map;
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
            this.hovered = this.isOnScreen() && entitiesCollide(asCentered(this), {x:mousePos.x, y:mousePos.y,height:1,width:1})
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
    constructor(roomNonce) {
        this.nonce = roomNonce;
        this.actors = new Map();
        this.projectiles = new Map();
        this.eventQueue = new Map();
        this.walls = new Map();
        this.floors = new Map();
    }

    addEventQueue(eventName, val) {
        if (!this.eventQueue.has(eventName)) {
            this.eventQueue.set(eventName, []);
        }
        this.eventQueue.get(eventName).push(val);
    }

    environmentTick() {
        this.projectiles.forEach((value, key) => {
            value.onTick();
            let hitPlayers = this.getPlayerColliding(value);
            let wallColliding = this.getWallColliding(value);
            let destroyProjectile = hitPlayers.length > 0 || wallColliding.length > 0;

            if (destroyProjectile) {
                this.addEventQueue("projectile-collision", {nonce: value.nonce});
                this.projectiles.delete(key);
            }

            hitPlayers.forEach((player) => player.takeDamage(1))

        });
    }

    addPlayer(player) {
        if (player && player.nonce) {
            this.actors.set(player.nonce, player);
        }
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
        return Array.from(this.actors.values())
            .filter((actor) => !actor.isDead && (actor.nonce !== projectile.playerNonce) && entitiesCollide(actor, projectile));
    }

    getWallColliding(projectile) {
        return Array.from(this.walls.values()).filter((wall) => entitiesCollide(wall, projectile));
    }
}


class Actor extends Entity {
    constructor(x, y, color) {
        super(x, y, 20, 20, 1);
        this.health = 100;
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
    }
}

class Projectile extends Entity {
    constructor(projectileNonce, x, y, rotationDegrees, fireTime, playerNonce, map) {
        super(x, y, 5, 5, 1, map);
        this.halflife = 15;
        this.nonce = projectileNonce;
        this._startingX = x;
        this._startingY = y;
        this.playerNonce = playerNonce;
        this.rotationDegrees = rotationDegrees;
        this.wobbleRotation = (randomIntFromInterval(-8, 8)) + this.rotationDegrees;
        this.speed = randomIntFromInterval(5, 8);
        this.fireTime = fireTime;
        this.render = function () {
            ctx.beginPath();
            ctx.fillStyle = this.color || 'orange';
            ctx.font = "12px Arial";
            ctx.fillRect(this.x, this.y, this.height, this.width);
            ctx.stroke();
        };
        this.isOutOfBounds = function () {
            return this.x > map_width || this.x < 0 || this.y > map_height || this.y < 0;
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
class Surface extends Entity {
    constructor(x, y, height, width, map) {
        super(x, y, height, width, 1, map);
    }
}

class Floor extends Surface {
    constructor(x, y, height, width, map) {
        super(x, y, height, width, map);
        this.render = function () {
            ctx.globalAlpha = .5;
            ctx.fillStyle = '#bcb9ad';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.globalAlpha = 1;
        }
    }
}

class Wall extends Surface {
    constructor(wallNonce, x, y, height, width, map) {
        super(x, y, height, width, map);
        this.nonce = wallNonce;
        this.blocking = true;
        this.render = function () {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        }
    }
}
