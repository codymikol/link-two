"use strict";
function forObj(obj, fn) {Object.keys(obj).forEach(function (key) {fn(obj[key], key);})}

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
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };
    }
}
function randomIntFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

class Projectile extends Entity {
    constructor(id, x, y, rotationDegrees, color) {
        super(x, y, 5, 5, 1);
        this.id = id;
        this.rotationDegrees = rotationDegrees;
        this.speed = randomIntFromInterval(2, 5);
        this.color = color;
        this.render = function () {
            ctx.beginPath();
            ctx.fillStyle = this.color || 'purple';
            ctx.font = "12px Arial";
            ctx.fillRect(this.x, this.y, this.height, this.width);
            ctx.stroke();
        };
        this._serverTick = function () {
            this.wobbleRotation = 3;

            this.x += this.speed * Math.cos(this.rotationDegrees * Math.PI / 180);
            this.y += this.speed * Math.sin(this.rotationDegrees * Math.PI / 180);
            // todo destroy projectiles once they have exited the room this requires canvas dimensions to be tracked.
            // if(this.x > a.width || this.x < 0 || this.y > a.height || this.y < 0) this.destroy();
        };
    }
}