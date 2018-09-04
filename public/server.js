"use strict";

let rooms = [];
let playerSockets = new Map();
let playerNonce = 0;
let projectileNonce = 0;

class Room {

    constructor(nonce) {
        this.nonce = nonce;
        this.roomName = 'Room #' + (nonce + 1);
        this.maxPlayers = 10;
        this.isActive = false;
        this.environment = new Environment(nonce);
    }

    joinPlayer(player) {
        this.environment.addPlayer(player);
        if (this.environment.players.length === required_players) {
            this.startGame()
        }
    }

    emitFireProjectile(projectile) {
        this.environment.addProjectile(projectile);
        io.in('room_' + this.nonce).volatile.emit('projectile-fire', projectile);
    }

    startGame() {
        this.isActive = true;
    }

    _roomTick() {
        this.environment.environmentTick();
    }

    isPlayerInRoom(nonce) {
        return this.environment.players.has(nonce);
    }

    leave(playerNonce) {
        this.environment.players.delete(playerNonce);
    }

    asDTO(isFullDTO) {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            players : isFullDTO ? [...this.environment.players.values()] : null,
            playerSize: this.environment.players.length,
            roomName: this.roomName
        };
    }
}

// class Player {
//
//     constructor(socket) {
//         this.nonce = playerNonce;
//         this.x = 0;
//         this.y = 0;
//         this.rotationDegrees = 0;
//         this.health = 10;
//         this.height = 20;
//         this.width = 20;
//         this.socket = socket;
//         this.name = 'cody mikol';
//
//     }
//
//     asActor() {
//         var actor = new Actor(this.x, this.y, null);
//         actor.nonce = this.nonce;
//         actor.health = this.health;
//         return actor;
//     }
//
// }

function serverTick() {
    serverTime = Date.now();
    rooms.forEach(function (room) {
        room._roomTick();
        io.in('room_' + room.nonce).volatile.emit('update-chosen-room', room.asDTO(true))
    })
}

function daemon() {
    setInterval(function () {
        serverTick()
    }, tick_rate);
}

function init() {
    for (let i = 0; i < 1; i++) {
        rooms.push(new Room(i));
    }
    daemon();
}


function isPlayerRoomValid(playerNonce, room) {
    return playerNonce && room && room.isPlayerInRoom(playerNonce);
}


init();

module.exports = {

    io: (socket) => {

        playerNonce++;
        const currentPlayerNonce = playerNonce;
        playerSockets.set(currentPlayerNonce, socket);
        let updater;
        let selectedRoom;

        socket.emit("rooms-available", rooms.reduce(function (col, room) {
            col[room.nonce] = room.asDTO();
            return col;
        }, {}));

        socket.on("join", function () {
            selectedRoom = rooms[0];
            var actor = new Actor(0, 0, null);
            actor.nonce = currentPlayerNonce;
            selectedRoom.joinPlayer(actor);
            socket.join('room_' + selectedRoom.nonce);
            socket.emit('joined-room', actor);
        });

        socket.on('update-player', function (client_player) {
            if (isPlayerRoomValid(currentPlayerNonce, selectedRoom)) {
                let thePlayer = selectedRoom.environment.players.get(currentPlayerNonce);
                thePlayer.x = client_player.x;
                thePlayer.y = client_player.y;
                thePlayer.rotationDegrees = client_player.rotationDegrees;
            }
        });

        socket.on('fire-projectile', function (projectile) {
            if (isPlayerRoomValid(currentPlayerNonce, selectedRoom)) {
                let thePlayer = selectedRoom.environment.players.get(currentPlayerNonce);
                projectileNonce++;
                projectile.nonce = projectileNonce;
                selectedRoom.emitFireProjectile(new Projectile(projectile.nonce
                    , thePlayer.x, thePlayer.y
                    , thePlayer.rotationDegrees
                    , Date.now()
                    , thePlayer.nonce));
            }
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(currentPlayerNonce);
            if (updater) clearInterval(updater);
        });

    },
};