import SocketManager from "../Socket/SocketManager/SocketManager";

const io = require('socket.io');

let instance = null;

export default class IOManager {

    constructor(server) {
        if (instance) return instance;
        instance = this;
        this.server = server;
        this.io = io(server, {wsEngine: 'ws'});
    }

    init() {

    }

    listen() {
        this.socketManager = new SocketManager();
        this.io.on('connection', (socket) => {
            this.socketManager.add(socket);
            socket.on('disconnect', () => this.socketManager.remove(socket));
        })
    }

}

