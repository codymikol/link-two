import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import NameCollector from "../../FullSize/NameCollector/NameCollector";
import TitleButton from "../../Button/TitleButton/TitleButton";
import ScreenManager from "../ScreenManager";
import Screen from "../Screen";
import AuthorScreen from "../AuthorScreen/AuthorScreen";
import InstructionsScreen from "../InstructionScreen/InstructionsScreen";
import MatchmakingScreen from "../MatchmakingScreen/MatchmakingScreen";
import PlayerManager from "../../Player/PlayerManager";

export default class TitleScreen extends Screen {

    constructor() {
        super();
        this.screenManager = new ScreenManager();
        this.nameCollector = new NameCollector();
        this.playerManager = new PlayerManager();
        this.add(new Background());
        this.add(new TitleCard());
        this.add(this.nameCollector);

        this.add(new TitleButton(this.screenManager.width / 2 - 200, 400, 'Connect', 'ssh', () => {
            this.playerManager
                .updateName(this.nameCollector.name)
                .then(this.playerManager.searchForGame.bind(this.playerManager))
                .then(() =>this.screenManager.set(new MatchmakingScreen()))
        }));

        this.add(new TitleButton(this.screenManager.width / 2 - 200, 440, 'Our Creators', 'blame', () => {
            this.screenManager.set(new AuthorScreen())
        }));

        this.add(new TitleButton(this.screenManager.width / 2 - 200, 480, 'Internal Documentation', 'man', () => {
            this.screenManager.set(new InstructionsScreen());
        }));

    }

}
