let instance = null;

export default class ScreenManager {

    constructor() {

        if (instance) return instance;

        instance = this;

        this.container = document.getElementById('a');
        this.container.width = window.innerWidth;
        this.container.height = window.innerHeight;
        Object.defineProperty(this, 'height', {get: () => this.container.height});
        Object.defineProperty(this, 'width', {get: () => this.container.width});

        window.addEventListener('resize',() => {
            this.container.width = window.innerWidth;
            this.container.height = window.innerHeight;
            this.resize();
        })

    }

    resize() {
        this.activeScreen.resize();
    }

    update() {
        this.activeScreen.tick();
    }

    draw() {
        this.activeScreen.render();
    }

    set(screenInstance) {
        delete this.activeScreen;
        this.activeScreen = screenInstance;
    }

}