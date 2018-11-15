import MiscUtil from "../MiscUtil/MiscUtil";
import Mouse from "../../client/Input/Mouse/Mouse";

//TODO: Clean up these event handlers on destroy. ;D

export default class Entity {
    constructor(x, y, height, width, _screen) {
        this.nonce = null;
        this.namespace = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
        this._screen = _screen;
        this._anyclick = function () {
            if (this.onAnyClick) this.onAnyClick();
        };
        this._click = function () {
            if (this.hovered && this.onClick) this.onClick();
        };
        this._render = function () {
            this.render();
        };
        this._mousemove = function () {
            if (this.onMouseMove) this.onMouseMove();
        };
        this._tick = function (delta) {
            if (this.onTick) this.onTick(delta);
        };
        this._resize = function () {
            if (this.onResize) this.onResize();
        };
        this._keydown = function (key) {
            if (this['on' + key.toUpperCase() + 'Down']) this['on' + key.toUpperCase() + 'Down']();
        };
        this._anykeydown = function (key) {
            if (this.onAnyKeyDown) this.onAnyKeyDown(key);
        };
        this.destroy = function () {
            delete entities[this.namespace || this.nonce];
        };

        let self = this;

        let mouse = new Mouse();

        window.addEventListener('keydown', (e) => {
            this._keydown(e.key);
            this._anykeydown(e.key)
        });

        window.addEventListener('click', () => {
            this._anyclick();
            this._click();
        });

        window.addEventListener('mousemove', (e) => {
            self.hovered = MiscUtil.mouseInBounds(this.x, this.y, this.height, this.width, mouse.x, mouse.y);
            this._mousemove();
        });

        window.addEventListener('mousemove', () => {

        });

    }
}