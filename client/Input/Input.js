export default class Input {

    constructor(onEvent) {
        window[onEvent]= this._eventHandler;
        this.listeners = {}
    }

    _eventHandler(event) {
        this.listeners[event]
    }

    on(event, fn) {
        
    }

    matcher() {
        return true;
    }

}