import {EVENTS} from "../../shared/Enums/Events";

let instance = null;

export default class SocketManager {

    constructor() {
        if(instance) return instance;
        instance = this;
        this.socket = io({upgrade: true, transports: ["websocket"]});
    }

    on(event, fn) {
        this.socket.on(event, fn);
    }

    emit(event, payload) {
        this.socket.emit(event, payload)
    }

    promit(event, response, payload) {
        return new Promise((resolve, reject) => {
            this.socket.emit(event, payload);
            this.socket.once(response, (response) => resolve(response) )
        })
    }

}