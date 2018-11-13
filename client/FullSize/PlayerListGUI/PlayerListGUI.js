import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";

export default class PlayerListGUI extends FullSize {
    constructor(_screen, messageOverride, hidePlayer) {
        super(_screen);
        this.hidePlayer = hidePlayer;
        let vm = this;
        this.render = function () {

            let countdown = (joinedRoom) ? joinedRoom.countdown : ' :( ';

            let dots = '   ';
            if (this.timer >= 15) dots = '.  ';
            if (this.timer >= 30) dots = '.. ';
            if (this.timer >= 45) dots = '...';

            let message = (joinedRoom && joinedRoom.countdown)
                ? 'Competitors found, starting game in ' + Math.floor(joinedRoom.countdown / tick_rate)
                : 'Connection is scarce, you must compete for this privilege, awaiting competition' + dots;

            if (messageOverride) message = messageOverride;

            Draw.text(message, vm.width / 2, 369, '#208C30', 16, 1, 'center');

            for (let i = 0; i < 36; i++) {
                [410, 520, 630, 740, 850].forEach(function (y) {
                    Draw.text('=', (i * 25) + (vm.width / 2) - 455, y);
                });
            }
            for (let i = 0; i < 76; i++) {
                [430, -460].forEach(function (x) {
                    Draw.text('+', x + (vm.width / 2), (i * 7) + 320, undefined, 24);
                })
            }

            [410, 520, 630, 740].forEach(function (y) {
                Draw.square(vm.width / 2 - 435, y + 3, 80, 80, 'white', 0.2)
            });

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