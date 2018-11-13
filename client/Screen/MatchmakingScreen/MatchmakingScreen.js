import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import PlayerListGUI from "../../FullSize/PlayerListGUI/PlayerListGUI";
import LobbyTextOverlay from "../../FullSize/LobbyTextOverlay/LobbyTextOverlay";

export default class MatchmakingScreen extends Screen {

    constructor(props) {
        super(props);
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new PlayerListGUI());
        this.add(new LobbyTextOverlay());
    }

}