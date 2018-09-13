"use strict";

let rooms = new Map();
let playerNonce = 0;
let projectileNonce = 0;
//
// const map_1 = "[{\"type\":\"Starting\",\"args\":[50,40,50,800,1050,800,1050,40]},{\"type\":\"Floor\",\"args\":[550,420,790,1040]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[150,400,20,250]},{\"type\":\"Wall\",\"args\":[945,400,20,240]},{\"type\":\"Wall\",\"args\":[540,680,260,20]},{\"type\":\"Wall\",\"args\":[540,150,260,20]},{\"type\":\"Wall\",\"args\":[120,165,130,20]},{\"type\":\"Wall\",\"args\":[975,165,130,20]},{\"type\":\"Wall\",\"args\":[920,100,20,130]},{\"type\":\"Wall\",\"args\":[175,100,20,130]},{\"type\":\"Wall\",\"args\":[120,680,130,20]},{\"type\":\"Wall\",\"args\":[975,680,130,20]},{\"type\":\"Wall\",\"args\":[180,735,20,140]},{\"type\":\"Wall\",\"args\":[915,735,20,140]},{\"type\":\"GroundShotgun\",\"args\":[150,136]},{\"type\":\"GroundShotgun\",\"args\":[900,130]},{\"type\":\"GroundShotgun\",\"args\":[900,670]},{\"type\":\"GroundShotgun\",\"args\":[150,670]},{\"type\":\"GroundMachineGun\",\"args\":[536,400]}]";
// const map_2 = "[{\"type\":\"Starting\",\"args\":[50,40,50,800,1050,800,1050,40]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[410,250,280,20]},{\"type\":\"Wall\",\"args\":[670,250,280,20]},{\"type\":\"Wall\",\"args\":[540,555,20,575]},{\"type\":\"Wall\",\"args\":[265,477,137,20]},{\"type\":\"Wall\",\"args\":[815,477,137,20]},{\"type\":\"GroundSmg\",\"args\":[480,420]},{\"type\":\"GroundSmg\",\"args\":[570,420]},{\"type\":\"GroundShotgun\",\"args\":[290,500]},{\"type\":\"GroundShotgun\",\"args\":[750,500]}]";
// const map_3 = "[{\"type\":\"Starting\",\"args\":[550,240,400,380,700,380,550,530]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[550,385,260,280]},{\"type\":\"GroundShotgun\",\"args\":[55,35]},{\"type\":\"GroundShotgun\",\"args\":[55,750]},{\"type\":\"GroundShotgun\",\"args\":[1000,750]},{\"type\":\"GroundShotgun\",\"args\":[1000,35]}]";
// const map_4 = "[{\"type\":\"Starting\",\"args\":[110,50,260,50,850,50,980,50]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[200,372,700,20]},{\"type\":\"Wall\",\"args\":[565,460,705,20]},{\"type\":\"Wall\",\"args\":[905,372,700,20]},{\"type\":\"GroundMachineGun\",\"args\":[885,745]},{\"type\":\"GroundMachineGun\",\"args\":[180,745]},{\"type\":\"GroundSmg\",\"args\":[540,70]}]";
// const map_5 = "[{\"type\":\"Starting\",\"args\":[145,370,415,370,712,370,960,370]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[270,372,700,20]},{\"type\":\"Wall\",\"args\":[565,460,705,20]},{\"type\":\"Wall\",\"args\":[840,372,700,20]},{\"type\":\"GroundMachineGun\",\"args\":[820,745]},{\"type\":\"GroundMachineGun\",\"args\":[245,745]},{\"type\":\"GroundMachineGun\",\"args\":[550,40]}]";
// const map_6 = "[{\"type\":\"Starting\",\"args\":[520,365,580,365,520,450,580,450]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[555,200,20,480]},{\"type\":\"Wall\",\"args\":[305,396,412,20]},{\"type\":\"Wall\",\"args\":[805,396,412,20]},{\"type\":\"Wall\",\"args\":[555,612,20,520]},{\"type\":\"GroundShotgun\",\"args\":[340,200]},{\"type\":\"GroundShotgun\",\"args\":[720,200]},{\"type\":\"GroundShotgun\",\"args\":[340,550]},{\"type\":\"GroundShotgun\",\"args\":[720,550]}]";
// const map_7 = "[{\"type\":\"Starting\",\"args\":[280,180,800,280,280,740,850,740]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[535,393,500,20]},{\"type\":\"Wall\",\"args\":[540,370,20,780]},{\"type\":\"GroundSmg\",\"args\":[150,136]},{\"type\":\"GroundShotgun\",\"args\":[900,130]},{\"type\":\"GroundSmg\",\"args\":[900,670]},{\"type\":\"GroundShotgun\",\"args\":[150,670]},{\"type\":\"GroundMachineGun\",\"args\":[560,400]}]";
// const map_8 = "[{\"type\":\"Starting\",\"args\":[50,40,50,800,1050,800,1050,40]},{\"type\":\"Floor\",\"args\":[550,420,790,1040]},{\"type\":\"Wall\",\"args\":[30,420,820,20]},{\"type\":\"Wall\",\"args\":[550,820,20,1035]},{\"type\":\"Wall\",\"args\":[1075,420,820,20]},{\"type\":\"Wall\",\"args\":[552,15,20,1065]},{\"type\":\"Wall\",\"args\":[150,400,20,250]},{\"type\":\"Wall\",\"args\":[945,400,20,240]},{\"type\":\"Wall\",\"args\":[540,680,260,20]},{\"type\":\"Wall\",\"args\":[540,150,260,20]},{\"type\":\"Wall\",\"args\":[120,165,130,20]},{\"type\":\"Wall\",\"args\":[975,165,130,20]},{\"type\":\"Wall\",\"args\":[920,100,20,130]},{\"type\":\"Wall\",\"args\":[175,100,20,130]},{\"type\":\"Wall\",\"args\":[120,680,130,20]},{\"type\":\"Wall\",\"args\":[975,680,130,20]},{\"type\":\"Wall\",\"args\":[180,735,20,140]},{\"type\":\"Wall\",\"args\":[915,735,20,140]},{\"type\":\"GroundSmg\",\"args\":[150,136]},{\"type\":\"GroundSmg\",\"args\":[900,130]},{\"type\":\"GroundSmg\",\"args\":[900,670]},{\"type\":\"GroundSmg\",\"args\":[150,670]},{\"type\":\"GroundMachineGun\",\"args\":[536,400]}]";

class Room extends Entity {

    constructor(nonce) {
        super(0, 0, 0, 0, 0);
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

        let actorList = Array.from(this.actors.values());

        let highestScore = actorList.reduce((col, actor) => {
            let score = actor.stats.getGameStats().totalWins;
            return score > col ? score : col;
        }, 0);

        actorList.forEach((actor) => {
           if(actor.stats.getGameStats().totalWins === highestScore) actor.isWinner = true;
        });

        let isTie = actorList.filter((actor) => {
            return actor.isWinner;
        }).length > 1;

        this.emit('game-end', Array.from(this.actors.values()).map((actor) => {
            actor.gameStats = actor.stats.getGameStats();
            if(actor.isWinner) actor.gameStats.winStatus = (isTie) ? 'TIE' : 'WINNER';
            actor.roundStats = actor.stats.getRoundStats();

            return actor;
        }));
        rooms.delete(this.nonce);
    }

    startRound() {
        this.actors.forEach((actor) => actor.stats.resetRoundStats());
        this.round++;
        this.environment = new Environment(this);
        this.emit('round-start', {
            actors: Array.from(this.actors.values()),
            walls: Array.from(this.environment.walls.values()),
            groundWeapons : Array.from(this.environment.groundWeapons.values())
        });
        this.phase = 'GAME';
        //TODO: Tell the client what the entities for this round are
    }

    endRound() {
        // todo uncomment and change for debugging purposes.
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

    fireProjectile(player) {

        if(player.weaponCooldown === 0) {
            let args = [projectileNonce++, player.x, player.y, player.rotationDegrees, Date.now(), player.nonce];

            let serverProjectileList = [];

            switch (player.activeWeapon) {
                case 'GroundPistol':
                    serverProjectileList = [new PistolProjectile(...args)];
                    break;
                case 'GroundShotgun':
                    for (var i = 0; i < 50; i++) {
                        args[0] = projectileNonce++;
                        serverProjectileList.push(new ShotgunProjectile(...args))
                    }
                    break;
                case 'GroundMachineGun':
                    for (var i = 0; i < 2; i++) {
                        args[0] = projectileNonce++;
                        serverProjectileList.push(new MachineGunProjectile(...args));
                    }
                    break;
                case 'GroundSmg':
                    serverProjectileList = [new SmgProjectile(...args)];
                    break;
            }

            player.weaponCooldown = serverProjectileList[0].weaponCooldown;

            serverProjectileList.forEach((serverProjectile) => {
                this.environment.addProjectile(serverProjectile);
            });
            this.emit('projectile-fire', serverProjectileList);
        }

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
                this.actors.forEach(actor => actor.tickCooldown());
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
    mapLoader();
    for (let i = 0; i < map_count; i++) {
        storage.get('map_' + (i + 1)).then(result => {
            wallTestList[i] = result;
        });
    }


}

// TODO!! remove me !!
function mapLoader() {
    storage.set("map_1", map_1, false);
}

function init() {
    loadMaps();
    setInterval(function () {
        serverTick()
    }, tick_rate);
}

function getPlayerFromRoom(playerNonce, room) {
    return room && room.actors ? room.actors.get(playerNonce) : null;
}
function getWeaponFromRoom(weaponNonce, room){
    return room && room.environment && room.environment.groundWeapons
        ? room.environment.groundWeapons.get(weaponNonce) : null;
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
            let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
            if (thePlayer && client_player.x && client_player.y) {
                thePlayer.x = client_player.x;
                thePlayer.y = client_player.y;
                thePlayer.rotationDegrees = client_player.rotationDegrees;
            }
        });

        socket.on('fire-projectile', function () {
            let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
            if (thePlayer) {
                selectedRoom.fireProjectile(thePlayer);
            }
        });

        socket.on('weapon-pickup', function (weaponNonce) {
            let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
            let theWeapon = getWeaponFromRoom(weaponNonce, selectedRoom);
            if (thePlayer && theWeapon && !thePlayer.isDead && entitiesCollide(thePlayer, asCentered(theWeapon))) {
                wallNonce++;
                let droppedWeaponNonce = wallNonce;
                let droppedWeapon = newGunWithNonce(droppedWeaponNonce, thePlayer.activeWeapon, [thePlayer.x - 10, thePlayer.y - 10]);
                selectedRoom.environment.groundWeapons.set(droppedWeaponNonce, droppedWeapon);
                thePlayer.activeWeapon = theWeapon.weaponTag;
                selectedRoom.emit('weapon-pickup'
                    , {nonce: weaponNonce, playerNonce : currentPlayerNonce, droppedWeapon : droppedWeapon});
                selectedRoom.environment.groundWeapons.delete(weaponNonce);
            };
        });

        socket.on("disconnect", () => {
            if (getPlayerFromRoom(currentPlayerNonce, selectedRoom)) selectedRoom.leave(currentPlayerNonce)
        });

    },
};