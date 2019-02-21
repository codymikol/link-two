import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import LobbyTextOverlay from "../../FullSize/LobbyTextOverlay/LobbyTextOverlay";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";

export default class MatchmakingScreen extends Screen {

    constructor() {
        super();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new InfoFrame('Searching for a game...'));
        this.add(new LobbyTextOverlay());
    }

}