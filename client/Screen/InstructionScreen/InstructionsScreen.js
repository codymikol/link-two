import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import InstructionsTextOverlay from "../../FullSize/InstructionsTextOverlay/InstructionsTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";
import Screen from "../Screen"
import InfoFrame from "../../FullSize/InfoFrame/InfoFrame";
import ScreenManager from "../ScreenManager";
import TitleScreen from "../TitleScreen/TitleScreen";

export default class InstructionScreen extends Screen {

    constructor() {
        super();
        this.screenManager = new ScreenManager();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new InfoFrame('This terminal has many useful commands for accessing "The Network"'));
        this.add(new InstructionsTextOverlay());
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 770, 'Return', 'CTRL C', () => {
            this.screenManager.set(new TitleScreen())
        }, 5))
    }

}