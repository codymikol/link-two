"use strict";

function forObj(obj, fn) {
    Object.keys(obj).forEach(function (key) {
        fn(obj[key], key);
    })
}

let abs = Math.abs;
const map_height = 5000;
const map_width = 5000;
const required_players = 1;
const tick_rate = 30;
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
    constructor(nonce) {
        this.nonce = nonce;
        this.players = new Map();
        this.projectiles = new Map();
        this.walls = new Map();
        this.floors = new Map();
    }

    environmentTick() {
        let self = this;
        Object.keys(this.projectiles).forEach(function (key) {
            let projectile = self.projectiles[key];
            projectile.onTick();
            let hitPlayers = self.getPlayerColliding(projectile);
            if (projectile.isOutOfBounds() || hitPlayers.length > 0) {
                self.projectiles.delete(key);
            }
            hitPlayers.forEach(function (player, index) {
                self.hurtPlayer(player, index)
            })
        });
    }
    hurtPlayer(player, index) {
        player.health--;
        console.log("Killing player" + index);
        if (player.health <= 0) {
            this.players.delete(index);
        }
    }

    addPlayer(player) {
        if (player && player.nonce) {
            this.players[player.nonce] = player;
        }
    }

    addProjectile(projectile) {
        if (projectile && projectile.nonce) {
            this.projectiles[projectile.nonce] = projectile;
        }
    }

    addWall(wall) {
        if (wall && wall.nonce) {
            this.walls[wall.nonce] = wall;
        }
    }

    getPlayerColliding(projectile) {
        var self = this;
        return Object.keys(this.players).filter(function (key) {
            return (projectile.playerNonce !== self.players[key].nonce && entitiesCollide(projectile, self.players[key]));
        });
    }
}

class Projectile extends Entity {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce, map) {
        super(x, y, 5, 5, 1, map);
        this.halflife = 15;
        this.nonce = nonce;
        this._startingX = x;
        this._startingY = y;
        this.playerNonce = playerNonce;
        this.rotationDegrees = rotationDegrees;
        this.wobbleRotation = (randomIntFromInterval(-8, 8)) + this.rotationDegrees;
        this.speed = randomIntFromInterval(100, 105);
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

class Contrail extends Entity {
    constructor(x,y,height,width) {
        super(x,y,height,width,1);
        this.halflife = 1;
        this.render = function () {
            ctx.globalAlpha = 1 / this.halflife;
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x,this.y,this.height * this.halflife / 2,0,2*Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.globalAlpha = 1;
        };
        this.onTick = function () {
            this.halflife++;
            if(this.halflife === 10) this.destroy();
        }
    }
}