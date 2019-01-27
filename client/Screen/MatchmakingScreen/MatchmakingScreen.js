import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import LobbyTextOverlay from "../../FullSize/LobbyTextOverlay/LobbyTextOverlay";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";

export default class MatchmakingScreen extends Screen {

    constructor(props) {
        super(props);
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new InfoFrame());
        this.add(new LobbyTextOverlay());
    }

}