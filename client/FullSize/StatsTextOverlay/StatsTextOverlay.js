import FullSize from "../FullSize";

export default class StatsTextOverlay extends FullSize {

    constructor(_screen) {
        super(_screen);
        this.render = function () {
            let vm = this;

            let playerStats = roundStats.filter(stat => stat.nonce === player.nonce)[0];

            text(`${player.name} - ${playerStats.totalWins} Points`, vm.width / 2 - 170, 425, undefined, 16);

            text(`Disposition: ${(playerStats.roundWon) ? 'ALIVE' : 'DEAD'}`, vm.width / 2 - 340, 440, undefined, 14);
            text(`Shot Accuracy: ${Math.floor(playerStats.roundHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.roundHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 - 340, 460, undefined, 14);
            text(`Kills: ${playerStats.roundKills}`, vm.width / 2 - 340, 480, undefined, 14);

            text(`Total Kills: ${playerStats.totalKills}`, vm.width / 2 + 100, 440, undefined, 14);
            text(`Total Accuracy: ${Math.floor(playerStats.totalHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.totalHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 + 100, 460, undefined, 14);
            text(`Total Deaths: ${playerStats.totalDeaths}`, vm.width / 2 + 100, 480, undefined, 14);

            getEnemies().forEach((enemy, index) => {

                let enemyStats = roundStats.filter(stat => stat.nonce === enemy.nonce)[0];

                let yOffset = 110;

                text(`${enemy.name} - ${enemyStats.totalWins} Points`, vm.width / 2 - 170, 425 + yOffset * (index + 1), undefined, 16);

                text(`Disposition: ${(enemyStats.roundWon) ? 'ALIVE' : 'DEAD'}`, vm.width / 2 - 340, 440 + yOffset * (index + 1), undefined, 14);
                text(`Shot Accuracy: ${Math.floor(enemyStats.roundHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.roundHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 - 340, 460 + yOffset * (index + 1), undefined, 14);
                text(`Kills: ${enemyStats.roundKills}`, vm.width / 2 - 340, 480 + yOffset * (index + 1), undefined, 14);

                text(`Total Kills: ${enemyStats.totalKills}`, vm.width / 2 + 100, 440 + yOffset * (index + 1), undefined, 14);
                text(`Total Accuracy: ${Math.floor(enemyStats.totalHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.totalHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 + 100, 460 + yOffset * (index + 1), undefined, 14);
                text(`Total Deaths: ${enemyStats.totalDeaths}`, vm.width / 2 + 100, 480 + yOffset * (index + 1), undefined, 14);

            })
        };
    }
}