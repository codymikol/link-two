import {PLAYER_STATUS} from "../../shared/Enums/Status";
import {EVENTS} from "../../shared/Enums/Events";
import QueueManager from "../Queue/QueueManager";

export default class User {

    constructor(socket) {

        this.queueManager = new QueueManager();

        this.socket = socket;
        this.name = 'New Player';
        this.status = PLAYER_STATUS.IN_MENU;

        this.socket.on(EVENTS.UPDATE_NAME, this.updateName.bind(this));
        this.socket.on(EVENTS.SEARCH_GAME, this.searchForGame.bind(this));

    }

    updateName(name) {
        this.name = name;
        this.socket.emit(EVENTS.NAME_UPDATED)
    }

    updateStatus(status) {
        this.status = status;
        this.socket.emit(EVENTS.STATUS_UPDATED, this.status);
    }

    searchForGame() {

        this.updateStatus(PLAYER_STATUS.IN_QUEUE);

        this.queueManager.findSession(this);

        this.socket.emit(EVENTS.SEARCHING_GAME);

    }

}