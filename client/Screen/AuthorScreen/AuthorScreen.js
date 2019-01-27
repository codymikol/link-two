import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import CreditsTextOverlay from "../../FullSize/CreditsTextOverlay/CreditsTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import TitleScreen from "../TitleScreen/TitleScreen";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";
import FullScreenSprite from "../../FullSize/FullScreenImage/FullScreenSprite";
import Button from "../../Button/Button";
import HighlightButton from "../../Button/HighlightButton/HighlightButton";

export default class AuthorScreen extends Screen {

    constructor(){
        super();
        this.screenManager = new ScreenManager();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new InfoFrame('This hot mess was brought to you by...'));
        this.add(new CreditsTextOverlay());
        this.add(new FullScreenSprite('koaty.png', -421, 428, 65, 65));
        this.add(new HighlightButton(-421, 428, 200, 200, () => console.log('MY MAN!')));
        this.add(new FullScreenSprite('john.jpeg', -421, 538, 65, 65));
        this.add(new FullScreenSprite('morgan.png', -421, 648, 65, 65));
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 770, 'Return', 'CTRL C', () => {
            this.screenManager.set(new TitleScreen())
        }, 5))
    }

}