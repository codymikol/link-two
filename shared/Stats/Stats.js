export default class Stats {

    constructor(player) {
        this.playerNonce = player.nonce;
        this.roundHits = 0;
        this.roundMisses = 0;
        this.roundKills = 0;
        this.roundWon = null;
        this.totalWins = 0;
        this.totalHits = 0;
        this.totalMisses = 0;
        this.totalKills = 0;
        this.totalDeaths = 0;
    }

    awardHit() {
        this.roundHits++;
        this.totalHits++;
    }

    awardMiss() {
        this.roundMisses++;
        this.totalMisses++;
    }

    awardRoundWin() {
        this.roundWon = true;
        this.totalWins++;
    }

    awardKill() {
        this.roundKills++;
        this.totalKills++;
    }

    awardDeath() {
        this.roundWon = false;
        this.totalDeaths++;
    }

    resetRoundStats() {
        this.roundHits = 0;
        this.roundMisses = 0;
        this.roundKills = 0;
        this.roundWon = null;
    }

    getRoundStats() {
        return {
            nonce: this.playerNonce,
            roundHits: this.roundHits,
            roundMisses: this.roundMisses,
            roundKills: this.roundKills,
            roundWon: this.roundWon,
            totalWins: this.totalWins,
            totalHits: this.totalHits,
            totalMisses: this.totalMisses,
            totalKills: this.totalKills,
            totalDeaths: this.totalDeaths
        }
    }

    getGameStats() {
        return {
            nonce: this.playerNonce,
            totalWins: this.totalWins,
            totalHits: this.totalHits,
            totalMisses: this.totalMisses,
            totalKills: this.totalKills,
            totalDeaths: this.totalDeaths
        }
    }

}