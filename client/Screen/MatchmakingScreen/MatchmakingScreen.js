import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import LobbyTextOverlay from "../../FullSize/LobbyTextOverlay/LobbyTextOverlay";
import Screen from "../Screen"
import SocketManager from "../../SocketManager/SocketManager";
import {EVENTS} from "../../../shared/Enums/Events";
import Enemy from "../../Enemy/Enemy";
import SearchingFrame from "../../FullSize/InfoFrame/SearchingFrame/SearchingFrame";

export default class MatchmakingScreen extends Screen {

    constructor() {
        super();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new SearchingFrame());
        this.add(new LobbyTextOverlay());
        this.users = [];
        this.socketManager = new SocketManager();
        this.socketManager.socket.on(EVENTS.UPDATED_QUEUE, this.updateUsers.bind(this));
    }

    onDestroy() {
        this.socketManager.socket.off(EVENTS.UPDATED_QUEUE, this.updateUsers.bind(this));
    }

    updateUsers(users) {
        this.users = users.filter((u) => u.id !== this.socketManager.socket.sessionId);
        this.add(new Enemy(100, 100, 0, 100, 10, 10))
    }

}