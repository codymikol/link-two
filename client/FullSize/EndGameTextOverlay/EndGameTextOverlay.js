import FullSize from "../FullSize";
import Draw from "../../Draw/Draw";
import MiscUtil from "../../../shared/MiscUtil/MiscUtil";

export default class EndGameTextOverlay extends FullSize {
    constructor(_screen){
        super(_screen);
        this.render = function () {
            let vm = this;

            //TODO Gotta handle stats :/
            if(gameStats.length > 0) {

                let playerStats = gameStats.filter(stat => stat.nonce === player.nonce)[0].gameStats;

                let statVals = MiscUtil.getStatusVals(playerStats.winStatus);

                Draw.text(`${player.name} - ${playerStats.totalWins} Points`, vm.width / 2 - 170, 425, undefined, 16);

                Draw.text(`STATUS: ${statVals.text}`, vm.width / 2 - 300, 467, statVals.color, 30);

                Draw.text(`Total Kills: ${playerStats.totalKills}`, vm.width / 2 + 100, 440, undefined, 14);
                Draw.text(`Total Accuracy: ${Math.floor(playerStats.totalHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.totalHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 + 100, 460, undefined, 14);
                Draw.text(`Total Deaths: ${playerStats.totalDeaths}`, vm.width / 2 + 100, 480, undefined, 14);

                //TODO: This should be handled by something :/
                getEnemies().forEach((enemy, index) => {

                    let enemyStats = gameStats.filter(stat => stat.nonce === enemy.nonce)[0].gameStats;

                    let eStatVals = MiscUtil.getStatusVals(enemyStats.winStatus);

                    let yOffset = 110;

                    Draw.text(`${enemy.name} - ${enemyStats.totalWins} Points`, vm.width / 2 - 170, 425 + yOffset * (index + 1), undefined, 16);

                    Draw.text(`STATUS: ${eStatVals.text}`, vm.width / 2 - 300, 467 + yOffset * (index + 1), eStatVals.color, 30);

                    Draw.text(`Total Kills: ${enemyStats.totalKills}`, vm.width / 2 + 100, 440 + yOffset * (index + 1), undefined, 14);
                    Draw.text(`Total Accuracy: ${Math.floor(enemyStats.totalHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.totalHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 + 100, 460 + yOffset * (index + 1), undefined, 14);
                    Draw.text(`Total Deaths: ${enemyStats.totalDeaths}`, vm.width / 2 + 100, 480 + yOffset * (index + 1), undefined, 14);

                })
            }
        };
    }
}