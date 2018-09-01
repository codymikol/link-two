"use strict";
function forObj(obj, fn) {Object.keys(obj).forEach(function (key) {fn(obj[key], key);})}
let abs = Math.abs;
const map_height = 5000;
const map_width = 5000;
const required_players = 1;

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
            if(this.onResize) this.onResize();
        };
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };
    }
}

function entitiesCollide(a,b) {
    return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));
}

function randomIntFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

class Projectile extends Entity {
    constructor(nonce, x, y, rotationDegrees, color, playerNonce) {
        super(x, y, 5, 5, 1);
        this.nonce = nonce;
        this.playerNonce = playerNonce;
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

        this.onTick = function () {

            let vm = this;

          if (Object.keys(entities).some(function(entityKey){
              if(!entities[entityKey].blocking) return false;
              return entitiesCollide(vm, entities[entityKey])
          })){
              addEntity(new Floor(vm.x, vm.y, 30, 30));
          }
        };

        this.isOutOfBounds = function() {
            return this.x > map_width || this.x < 0 || this.y > map_height || this.y < 0;
        };

        this._serverTick = function () {
            this.wobbleRotation = 3;
            this.x += this.speed * Math.cos(this.rotationDegrees * Math.PI / 180);
            this.y += this.speed * Math.sin(this.rotationDegrees * Math.PI / 180);
        };


    }
}