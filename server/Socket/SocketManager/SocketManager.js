export default class SocketManager {

    constructor() {
        this.sockets = new Map();
    }

    add(socket) {
        console.log(socket.id, ' - connected');
        this.sockets.set(socket.id, socket);
    }

    remove(socket) {
        console.log(socket.id, ' - disconnected');
        this.sockets.delete(socket.sessionId);
    }

}