import MiscUtil from "../MiscUtil/MiscUtil";
import Mouse from "../../client/Input/Mouse/Mouse";
import ScreenManager from "../../client/Screen/ScreenManager";

export default class Entity {
    constructor(x, y, height, width) {
        this.nonce = null;
        this.namespace = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
        this._screenManager = new ScreenManager();
        this._intervalList = [];
        this._timeoutList = [];
        this._childEntities =[];
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
            this.zoom = Math.round(window.devicePixelRatio * 100 / 2);
            if (this.onResize) this.onResize();
        };
        this._keydown = function (key) {
            if (this['on' + key.toUpperCase() + 'Down']) this['on' + key.toUpperCase() + 'Down']();
        };
        this._anykeydown = function (key) {
            if (this.onAnyKeyDown) this.onAnyKeyDown(key);
        };
        this.interval = function (fn, interval) {
            this._intervalList.push(setInterval(fn, interval));
        };
        this.timeout = function (fn, timeout) {
            this._timeoutList.push(setTimeout(fn, timeout))
        };
        this.add = function (child) {
            this._screenManager.activeScreen.add(child);
            console.log('Adding Child Entity: ', child)
            this._childEntities.push(child);
        };
        this.destroy = function () {
            this._childEntities.forEach((x) => x.destroy());
            this._intervalList.forEach((x) => clearInterval(x));
            this._timeoutList.forEach((x) => clearTimeout(x));
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

        this.handleClick = function() {
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