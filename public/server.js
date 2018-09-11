"use strict";

let rooms = new Map();
let playerNonce = 0;
let projectileNonce = 0;

class Room extends Entity {

    constructor(nonce) {
        super(0, 0, 0, 0, 0, 0);
        this.actors = new Map();
        this.phase = 'LOBBY';
        this.round = 0;
        this.roundStartCountdown = 0;
        this.requiredPlayers = 2;
        this.nonce = nonce;
        this.environment = new Environment(this);
    }

    emit(key, value) {
        io.in('room_' + this.nonce).emit(key, value);
    }

    join(player) {
        player.stats = new Stats(player);
        this.actors.set(player.nonce, player);
        if (this.actors.size >= 2) this.countdown = 5 * tick_rate;
    }

    leave(playerNonce) {
        this.emit('destroy', 'enemy-' + playerNonce);
        this.actors.delete(playerNonce);
        if (this.actors.size < this.requiredPlayers) delete this.countdown;
    }

    startGame() {
        this.phase = 'GAME';
        this.startRound();
    }

    endGame() {
        this.emit('game-end', Array.from(this.actors.values()).map((actor) => actor.stats.getGameStats()));
        rooms.delete(this.nonce);
    }

    startRound() {
        this.actors.forEach((actor) => actor.stats.resetRoundStats());
        this.round++;
        this.environment = new Environment(this);
        this.emit('round-start', Array.from(this.environment.walls.values()));
        this.phase = 'GAME';
        //TODO: Tell the client what the entities for this round are
    }

    endRound() {
        this.roundStartCountdown = 200;
        this.phase = 'ROUND_STATS';
        this.actors.forEach((actor) => actor.reset());
        this.emit('round-end', Array.from(this.actors.values()).map((actor) => actor.stats.getRoundStats()));
    }

    checkRoundComplete() {
        let remainingPlayers = Array.from(this.actors.values()).filter((actor) => !actor.isDead);

        if (remainingPlayers.length === 1) {
            remainingPlayers[0].stats.awardRoundWin();
            this.endRound();
        }

    }

    emitFireProjectile(projectile) {
        this.environment.addProjectile(projectile);
        this.emit('projectile-fire', projectile);
    }

    _roomTick() {
        switch (this.phase) {
            case 'LOBBY':
                if (this.actors.size >= 2) this.countdown--;
                if (this.countdown === 0) this.startGame();
                break;
            case 'ROUND_STATS':
                this.roundStartCountdown--;
                if (this.round === 5) {
                    this.endGame();
                    return;
                }
                if (this.roundStartCountdown === 0) this.startRound();
                break;
            case 'GAME':
                this.environment.environmentTick();
                this.checkRoundComplete();
                break;
        }

    }

    asDTO() {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            countdown: this.countdown,
            actors: [...this.actors.values()],
            playerSize: this.actors.length,
            roomName: this.roomName
        };
    }
}

class Stats {
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

function serverTick() {
    serverTime = Date.now();
    rooms.forEach(function (room) {
        room._roomTick();
        room.emit('update-chosen-room', room.asDTO(true));
        room.environment.eventQueue.forEach((value, key) => {
            room.emit(key, value);
            room.environment.eventQueue.delete(key);
        });
    })
}

function getBestRoom() {

    let best = Array.from(rooms.values())
        .filter(room => room.phase === 'LOBBY' && room.actors.size < 4)
        .reduce((col, room) => {
            if (!col) return rooms.get(room.nonce);
            return (room.players > col.players) ? rooms.get(room) : col;
        }, undefined);

    if (best) {
        return best;
    } else {
        playerNonce++;
        rooms.set(playerNonce, new Room(playerNonce));
        return rooms.get(playerNonce);
    }

}

function loadMaps() {
    for (let i = 0; i < map_count; i++) {
        storage.get('map_' + (i + 1)).then(result => {
            wallTestList[i] = result;
        });
    }
}

function init() {
    loadMaps();
    setInterval(function () {
        serverTick()
    }, tick_rate);
}

init();

module.exports = {

    io: (socket) => {

        playerNonce++;
        const currentPlayerNonce = playerNonce;
        let displayName = "Player-" + currentPlayerNonce;
        let selectedRoom;

        socket.on("join", function () {
            selectedRoom = getBestRoom();
            console.log(displayName);
            var actor = new Actor(0, 0, 'red', displayName);
            actor.nonce = currentPlayerNonce;
            selectedRoom.join(actor);
            socket.join('room_' + selectedRoom.nonce);
            socket.emit('joined-room', actor);
            socket.emit('environment-walls', [...selectedRoom.environment.walls.values()])
        });

        socket.on('update-name', function (name) {
            displayName = name;
        });

        socket.on('update-player', function (client_player) {
            let thePlayer = selectedRoom.actors.get(currentPlayerNonce);
            thePlayer.x = client_player.x;
            thePlayer.y = client_player.y;
            thePlayer.rotationDegrees = client_player.rotationDegrees;
        });

        socket.on('fire-projectile', function (projectile) {
            let thePlayer = selectedRoom.actors.get(currentPlayerNonce);
            projectileNonce++;
            projectile.nonce = projectileNonce;
            selectedRoom.emitFireProjectile(new ShotgunProjectile(projectile.nonce
                , thePlayer.x, thePlayer.y
                , thePlayer.rotationDegrees
                , Date.now()
                , thePlayer.nonce));
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(currentPlayerNonce)
        });

    },
};