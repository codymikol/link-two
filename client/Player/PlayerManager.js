import Player from "./Player";
import SocketManager from "../SocketManager/SocketManager";

let instance = null;

export default class PlayerManager {

    constructor() {
        if(instance) return instance;
        instance = this;

        this.player = new Player();
        this.socket = new SocketManager();

    }

    updateName(name) {
        return this.socket.promit('update-name', name, 'name-updated');
    }

}