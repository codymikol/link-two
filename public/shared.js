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



class Projectile extends Entity {
    constructor(x, y, rotation, color) {
        super(x, y, 5, 5, 1);
        console.log("creating projectile! " + this.id);
        this.rotation = rotation;
        this.speed = randomIntFromInterval(5, 10);
        this.color = color;
        this.wobble = 1;
        this.wobbleRotation = randomIntFromInterval(this.rotation - this.wobble, this.rotation + this.wobble);
        this.render = function () {
            ctx.beginPath();
            ctx.fillStyle = this.color || 'purple';
            ctx.font = "12px Arial";
            ctx.fillRect(this.x, this.y, this.height, this.width);
            ctx.stroke();
        };
        this.onTick = function () {
            this.wobbleRotation += 3;
            this.x += this.speed * Math.cos(this.wobbleRotation * Math.PI / 180);
            this.y += this.speed * Math.sin(this.wobbleRotation * Math.PI / 180);
            if(this.x > a.width || this.x < 0 || this.y > a.height || this.y < 0) this.destroy();
        };
    }
}