import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import PlayerListGUI from "../../FullSize/PlayerListGUI/PlayerListGUI";
import CreditsTextOverlay from "../../FullSize/CreditsTextOverlay/CreditsTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import TitleScreen from "../TitleScreen/TitleScreen";

export default class AuthorScreen extends Screen{

    constructor(){
        super();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new PlayerListGUI(5, 'This hot mess was brought to you by...'));
        this.add(new CreditsTextOverlay());
        this.add(new TitleButton(ScreenManager.width / 2 - 200, 770, 'Return', 'CTRL C', () => {
            ScreenManager.set(new TitleScreen())
        }, 5))
    }

}