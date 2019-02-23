import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import LobbyTextOverlay from "../../FullSize/LobbyTextOverlay/LobbyTextOverlay";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";
import SocketManager from "../../SocketManager/SocketManager";
import {EVENTS} from "../../../shared/Enums/Events";
import Enemy from "../../Enemy/Enemy";

export default class MatchmakingScreen extends Screen {

    constructor() {
        super();

        this.infoFrame = new InfoFrame();
        this.infoFrame.ellipsePhase = 0;

        this.infoFrame.interval(() => {
            this.infoFrame.ellipsePhase++;
            if(this.infoFrame.ellipsePhase > 3) this.infoFrame.ellipsePhase = 0;
            var ellipse = '';
            var padding = '';
            _.times(this.infoFrame.ellipsePhase, () => ellipse += '.');
            _.times(this.infoFrame.ellipsePhase, () => padding += ' ');
            this.infoFrame.message = padding + 'Searching' + ellipse;
        }, 1000);

        this.add(new Background());
        this.add(new TitleCard());
        this.add(this.infoFrame);
        this.add(new LobbyTextOverlay());

        this.users = [];

        this.socketManager = new SocketManager();
        this.socketManager.socket.on(EVENTS.UPDATED_QUEUE, this.updateUsers.bind(this));

    }

    onDestroy() {
        this.socketManager.socket.off(EVENTS.UPDATED_QUEUE, this.updateUsers.bind(this));
    }

    updateUsers(users) {
        this.users = users;
        this.add(new Enemy(100, 100, 0, 100, 10, 10))
    }

}