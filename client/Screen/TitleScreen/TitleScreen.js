import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import NameCollector from "../../FullSize/NameCollector/NameCollector";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import Screen from "../Screen";
import AuthorScreen from "../AuthorScreen/AuthorScreen";
import InstructionsScreen from "../InstructionScreen/InstructionsScreen";

export default class TitleScreen extends Screen {

    constructor() {
        super();
        this.screenManager = new ScreenManager();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new NameCollector());
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 400, 'Connect', 'ssh', () => socket.emit('join')));
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 440, 'Our Creators', 'blame', () =>
            this.screenManager.set(new AuthorScreen())));
        this.add(new TitleButton(this.screenManager.width / 2 - 200, 480, 'Internal Documentation', 'man', () => {
                console.log('test')
                this.screenManager.set(new InstructionsScreen());
            }
        ));

    }

}
