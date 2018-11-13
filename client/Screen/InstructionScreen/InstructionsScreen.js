import Background from "../../FullSize/Background/Background";
import TitleCard from "../../FullSize/TitleCard/TitleCard";
import PlayerListGUI from "../../FullSize/PlayerListGUI/PlayerListGUI";
import InstructionsTextOverlay from "../../FullSize/InstructionsTextOverlay/InstructionsTextOverlay";
import TitleButton from "../../Button/TitleButton/TitleButton";

export default class InstructionScreen extends Screen {

    constructor(props) {
        super(props);
        this.add(new Background());
        this.add(new TitleCard());
        this.add(new PlayerListGUI(6, 'This terminal has many useful commands for accessing "The Network"', true));
        this.add(new InstructionsTextOverlay());
        this.add(new TitleButton());
    }

}