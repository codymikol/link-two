import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class PlayerListGUI extends FullSize {
    constructor(_screen, messageOverride, hidePlayer) {
        super(_screen);
        this.hidePlayer = hidePlayer;
        let vm = this;
        this.render = function () {

            //TODO: This is a big ole mess

            let countdown = (joinedRoom) ? joinedRoom.countdown : ' :( ';

            let dots = '   ';
            if (this.timer >= 15) dots = '.  ';
            if (this.timer >= 30) dots = '.. ';
            if (this.timer >= 45) dots = '...';

            //TODO: Handle this somehow :(

            // let message = (joinedRoom && joinedRoom.countdown)
            //     ? 'Competitors found, starting game in ' + Math.floor(joinedRoom.countdown / tick_rate)
            //     : 'Connection is scarce, you must compete for this privilege, awaiting competition' + dots;
            //
            // if (messageOverride) message = messageOverride;

            if(!this.hidePlayer) {

                //TODO: Gotta fix this guy

                player.render.call({
                    x: vm.width / 2 - 395,
                    y: 455,
                    isDead: false,
                    color: 'green',
                    rotationDegrees: 0,
                    width: 20,
                    height: 20
                });
            }

            //TODO And this guy here......

            Object.keys(entities).filter(function (entityKey) {
                return entityKey.includes('enemy-');
            }).forEach(function (enemyKey, index) {
                let enemy = entities[enemyKey];
                enemy.render.call({
                    x: vm.width / 2 - 395,
                    y: 455 + 110 * (index + 1),
                    isDead: false,
                    color: 'red',
                    rotationDegrees: 0,
                    width: 20,
                    height: 20
                });
            });
        }
    }
}