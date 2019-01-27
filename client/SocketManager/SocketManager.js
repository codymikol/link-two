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

    promit(event, payload, response) {
        return new Promise((resolve, reject) => {
            this.emit(event, payload);
            this.on(response, (response) => resolve(response))
        })
    }

}