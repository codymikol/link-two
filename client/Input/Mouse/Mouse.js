import ScreenManager from "../../Screen/ScreenManager";

let instance = null;

export default class Mouse {

    constructor() {

        if(instance) return instance;
        instance = this;

        this.mousePos = {
            x:0,
            y:0
        };

        window.addEventListener('mousemove', (e) => {
            let rect = ScreenManager.getRect();
            this.mousePos.x = e.clientX - rect.left;
            this.mousePos.y = e.clientY - rect.top;
        })

    }

    get x() {
        return this.mousePos.x;
    }

    get y() {
        return this.mousePos.y;
    }


}