import FullSize from "../FullSize";
import DrawUtil from "../../Draw/Draw";
import MatchmakingScreen from "../../Screen/MatchmakingScreen/MatchmakingScreen";
import PlayerManager from "../../Player/PlayerManager";
import ScreenManager from "../../Screen/ScreenManager";

export default class NameCollector extends FullSize {
    constructor(_screen){
        super(_screen);
        this.playerManager = new PlayerManager();
        this.screenManager = new ScreenManager();
        this.name ='';
        this.dirty = false;
        this.render = function () {
            let vm = this;
            let yOffset = 580;
            DrawUtil.square(vm.cX - 200, yOffset - 235, 400, 40, '#208C30', 1);
            DrawUtil.square(vm.cX - 195, yOffset - 230, 390, 30, 'black', 1);
            if(vm.timer < 30) DrawUtil.text('>',vm.cX - 190, yOffset - 205, '#208C30', 24);
            if(!this.dirty) DrawUtil.text('Enter Name',vm.cX - 170, yOffset - 207, '#208C30', 24);
            if(this.dirty) DrawUtil.text(this.name,vm.cX - 170, yOffset - 207, '#208C30', 24);
        };

        this.onAnyKeyDown = function (key) {

            if(this.name.length > 10 && key !== 'Backspace') return;
            if(key === 'Enter') {
                this.playerManager
                    .updateName(this.name)
                    .then(this.playerManager.searchForGame.bind(this.playerManager))
                    .then(() =>this.screenManager.set(new MatchmakingScreen()))
                return;
            }
            if (key === 'Backspace' && this.name !== '') {
                this.name = this.name.substring(0, this.name.length - 1);
            } else {
                if(key.length === 1) {
                    this.dirty = true;
                    this.name += key;
                }
            }
        };

    }
}