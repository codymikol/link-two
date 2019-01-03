
export default class Room {

    constructor(nonce) {
        this.actors = new Map();
        this.phase = 'LOBBY';
        this.round = 0;
        this.roundStartCountdown = 0;
        this.requiredPlayers = 2;
        this.nonce = nonce;
        //this.environment = new Environment(this);
    }

    emit(key, value) {
        io.in('room_' + this.nonce).emit(key, value);
    }

    join(player) {
        player.stats = new Stats(player);
        this.actors.set(player.nonce, player);
        if (this.actors.size >= 2) this.countdown = 15 * tick_rate;
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

    fireProjectile(player) {

        if(player.weaponCooldown === 0) {

            projectileNonce++;

            let args = [projectileNonce, player.x, player.y, player.rotationDegrees, Date.now(), player.nonce];

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

// //TODO: This is all room specific, move it over there!
// module.exports = {
//
//     io: (socket) => {
//
//         playerNonce++;
//         const currentPlayerNonce = playerNonce;
//         let displayName = "Player-" + currentPlayerNonce;
//         let selectedRoom;
//
//         socket.on('update-name', function (name) {
//             displayName = name;
//         });
//
//         socket.on('update-player', function (client_player) {
//             let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
//             if (thePlayer && client_player.x && client_player.y) {
//                 thePlayer.x = client_player.x;
//                 thePlayer.y = client_player.y;
//                 thePlayer.rotationDegrees = client_player.rotationDegrees;
//             }
//         });
//
//         socket.on('fire-projectile', function () {
//             let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
//             if (thePlayer) {
//                 selectedRoom.fireProjectile(thePlayer);
//             }
//         });
//
//         socket.on('weapon-pickup', function (weaponNonce) {
//             let thePlayer = getPlayerFromRoom(currentPlayerNonce, selectedRoom);
//             let theWeapon = getWeaponFromRoom(weaponNonce, selectedRoom);
//             if (thePlayer && theWeapon && !thePlayer.isDead && entitiesCollide(thePlayer, asCentered(theWeapon))) {
//                 wallNonce++;
//                 let droppedWeaponNonce = wallNonce;
//                 let droppedWeapon = newGunWithNonce(droppedWeaponNonce, thePlayer.activeWeapon, [thePlayer.x - 10, thePlayer.y - 10]);
//                 selectedRoom.environment.groundWeapons.set(droppedWeaponNonce, droppedWeapon);
//                 thePlayer.activeWeapon = theWeapon.weaponTag;
//                 selectedRoom.emit('weapon-pickup'
//                     , {nonce: weaponNonce, playerNonce : currentPlayerNonce, droppedWeapon : droppedWeapon});
//                 selectedRoom.environment.groundWeapons.delete(weaponNonce);
//             };
//         });
//
//         socket.on("disconnect", () => {
//             if (getPlayerFromRoom(currentPlayerNonce, selectedRoom)) selectedRoom.leave(currentPlayerNonce)
//         });
//
//     },
// };
//
// //We should use nodeJS to spawn a child process for each room.
// // This should make everything muuuuuuch faster ;)
//
// function serverTick() {
//     serverTime = Date.now();
//     rooms.forEach(function (room) {
//         room._roomTick();
//         room.emit('update-chosen-room', room.asDTO(true));
//         room.environment.eventQueue.forEach((value, key) => {
//             room.emit(key, value);
//             room.environment.eventQueue.delete(key);
//         });
//     })
// }