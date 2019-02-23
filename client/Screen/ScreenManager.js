let instance = null;

import _ from "lodash"

export default class ScreenManager {

    constructor() {

        if (instance) return instance;

        instance = this;

        this.container = ScreenManager.getCanvas();
        this.container.width = window.innerWidth;
        this.container.height = window.innerHeight;

        Object.defineProperty(this, 'height', {get: () => this.container.height});
        Object.defineProperty(this, 'width', {get: () => this.container.width});

        window.addEventListener('resize', () => {
            this.container.width = window.innerWidth;
            this.container.height = window.innerHeight;
            this.resize();
        });

        window.addEventListener('contextmenu', () => false);

    }

    static getCanvas() {
        return document.getElementById('a');
    }

    static getRect() {
        return ScreenManager.getCanvas().getBoundingClientRect();
    }

    resize() {
        this.activeScreen.forEntities((e) => e._resize())
    }

    tick() {
        this.activeScreen.forEntities((e) => e._tick());
    }

    render() {
        this.activeScreen.forEntities((e) => e.render());
    }

    set(screenInstance) {
        console.log('setting screen to  ', screenInstance);
        if(this.activeScreen) {
            _.each(this.activeScreen.entities, (entity) => entity.destroy());
            if (this.activeScreen.onDestroy) this.activeScreen.onDestroy();
        }
        delete this.activeScreen;
        this.activeScreen = screenInstance;
    }

}