import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import CreditsTextOverlay from "../../FullSize/CreditsTextOverlay/CreditsTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import TitleScreen from "../TitleScreen/TitleScreen";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";

export default class AuthorScreen extends Screen {

    constructor(){
        super();
        this.screenManager = new ScreenManager();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new InfoFrame('This hot mess was brought to you by...'));
        this.add(new CreditsTextOverlay());
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 770, 'Return', 'CTRL C', () => {
            this.screenManager.set(new TitleScreen())
        }, 5))
    }

}