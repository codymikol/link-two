import MiscUtil from "../MiscUtil/MiscUtil";


export default class Entity {
    constructor(x, y, height, width, _screen) {
        this.nonce = null;
        this.namespace = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
        this.isOnScreen = function () {
            return true
        };
        this._screen = _screen;
        this._sethover = function () {
            this.hovered = this.isOnScreen() && MiscUtil.mouseInBounds(this.x, this.y, this.height, this.width)
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
        this._anykeydown = function (key) {
            if (this.isOnScreen() && this.onAnyKeyDown) this.onAnyKeyDown(key);
        };
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };
    }
}