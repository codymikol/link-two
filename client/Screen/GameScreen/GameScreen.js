import Background from "../../FullSize/Background/Background";
import Floor from "../../../shared/Entity/Surface/Floor/Floor";
import Player from "../../Player/Player";
import Screen from "../Screen"

export default class GameScreen extends Screen {

    constructor() {
        super();
        this.add(new Background());
        this.add(new Floor());
        this.add(new Player())
    }

}