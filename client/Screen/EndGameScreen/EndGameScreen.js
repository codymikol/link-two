import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import PlayerListGUI from "../../FullSize/PlayerListGUI/PlayerListGUI";
import EndGameTextOverlay from "../../FullSize/EndGameTextOverlay/EndGameTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import TitleScreen from "../TitleScreen/TitleScreen";

export default class EndGameScreen extends Screen {

    constructor(props) {
        super(props);
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new PlayerListGUI(7, ' '));
        this.add(new EndGameTextOverlay());
        this.add(new TitleButton(ScreenManager.width / 2 - 200, 350, 'Return To Prompt', ':q!', () => {
            //TODO: manage this somehow :(
            getEnemies().forEach((enemy) => {delete entities['enemy-' + enemy.nonce];});
            ScreenManager.set(new TitleScreen())
        }));
    }

}

