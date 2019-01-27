import MiscUtil from "../MiscUtil/MiscUtil";
import Mouse from "../../client/Input/Mouse/Mouse";

export default class Entity {
    constructor(x, y, height, width) {
        this.nonce = null;
        this.namespace = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
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
            window.removeEventListener('keydown', this.handleKeyDown);
            window.removeEventListener('click', this.handleClick);
            window.removeEventListener('mousemove', this.handleMouseMove)
        };

        let self = this;

        let mouse = new Mouse();

        this.handleKeyDown = function(e) {
            self._keydown(e.key);
            self._anykeydown(e.key)
        };

        window.addEventListener('keydown', this.handleKeyDown);

        this.handleClick = function(e) {
            self._anyclick();
            self._click();
        };

        window.addEventListener('click', this.handleClick);

        this.handleMouseMove = function() {
            self.hovered = MiscUtil.mouseInBounds(self.x, self.y, self.height, self.width, mouse.x, mouse.y);
            self._mousemove();
        };

        window.addEventListener('mousemove', this.handleMouseMove);

    }
}