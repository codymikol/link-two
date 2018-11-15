import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import NameCollector from "../../FullSize/NameCollector/NameCollector";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import Screen from "../Screen";
import InstructionsTextOverlay from "../../FullSize/InstructionsTextOverlay/InstructionsTextOverlay";
import CreditsTextOverlay from "../../FullSize/CreditsTextOverlay/CreditsTextOverlay";

export default class TitleScreen extends Screen {

    constructor() {
        super();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new NameCollector());
        //TODO Network manager...
        let screenManager = new ScreenManager();
        this.add(new TitleButton(screenManager.width / 2 - 200, 400, 'Connect', 'ssh', () => socket.emit('join')));
        this.add(new TitleButton(screenManager.width / 2 - 200, 440, 'Our Creators', 'blame', () =>
            screenManager.set(new CreditsTextOverlay())));
        this.add(new TitleButton(screenManager.width / 2 - 200, 480, 'Internal Documentation', 'man', () =>
            screenManager.set(new InstructionsTextOverlay())));
    }

}
