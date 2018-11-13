import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import PlayerListGUI from "../../FullSize/PlayerListGUI/PlayerListGUI";
import StatsTextOverlay from "../../FullSize/StatsTextOverlay/StatsTextOverlay";

export default class RoundStatsScreen extends Screen {

    constructor(props) {
        super(props);
        this.add(new Background());
        this.add(new TitleCard());
        this.add(PlayerListGUI(4, 'Post round stats, the next round will begin shortly'));
        this.add(StatsTextOverlay())
    }


}