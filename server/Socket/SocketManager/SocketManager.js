import User from "../../User/User";

export default class SocketManager {

    constructor() {
        this.users = new Map();
    }

    add(socket) {
        console.log(socket.id, ' - connected');
        this.users.set(socket.id, new User(socket));
    }

    remove(socket) {
        console.log(socket.id, ' - disconnected');
        this.users.delete(socket.sessionId);
    }

}