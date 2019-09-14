import Player from "./Player";
import SocketManager from "../SocketManager/SocketManager";
import {EVENTS} from "../../shared/Enums/Events";

let instance = null;

export default class PlayerManager {

    constructor() {
        if(instance) return instance;
        instance = this;
        this.player = new Player();
        this.socketManager = new SocketManager();
    }

    updateName(name) {
        return this.socketManager.promit(EVENTS.UPDATE_NAME, EVENTS.NAME_UPDATED, name);
    }

    searchForGame() {
        return this.socketManager.promit(EVENTS.SEARCH_GAME, EVENTS.SEARCHING_GAME);
    }

}