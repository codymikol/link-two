"use strict";

let rooms = [];
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
        return this.environment.players[nonce];
    }

    leave(player) {
        this.environment.players = this.environment.players.filter(function (mPlayer) {
            return player !== mPlayer;
        });
    }

    asDTO(isFullDTO) {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            players: isFullDTO ? this.getPlayerDTO() : null,
            playerSize: this.environment.players.length,
            roomName: this.roomName
        };
    }

    getPlayerDTO() {
        let self = this;
        let playerDTOs = [];
        Object.keys(this.environment.players).forEach(function (key) {
            let dtoPLayer = self.environment.players[key].asDTO();
            playerDTOs.push(dtoPLayer);
        });
        return playerDTOs;
    }

}

class Player {

    constructor(socket) {
        this.nonce = playerNonce;
        this.x = 0;
        this.y = 0;
        this.rotationDegrees = 0;
        this.health = 10;
        this.height = 20;
        this.width = 20;
        this.socket = socket;
        this.name = 'cody mikol';
    }

    asDTO() {
        return {
            name: this.name,
            health: this.health,
            x: this.x,
            y: this.y,
            nonce: this.nonce,
            rotationDegrees: this.rotationDegrees
        }
    }

}

function serverTick() {
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

function isPlayerRoomValid(player, room) {
    return player && room && room.isPlayerInRoom(player.nonce);
}

init();

module.exports = {

    io: (socket) => {

        playerNonce++;
        const player = new Player(socket);
        let updater;
        let selectedRoom;

        socket.emit("rooms-available", rooms.reduce(function (col, room) {
            col[room.nonce] = room.asDTO();
            return col;
        }, {}));

        socket.on("join", function () {
            selectedRoom = rooms[0];
            selectedRoom.joinPlayer(player);
            socket.join('room_' + selectedRoom.nonce);
            socket.emit('joined-room', player.asDTO());
        });

        socket.on('update-player', function (client_player) {
            if (isPlayerRoomValid(player, selectedRoom)) {
                player.x = client_player.x;
                player.y = client_player.y;
                player.rotationDegrees = client_player.rotationDegrees;
            }
        });

        socket.on('fire-projectile', function (projectile) {
            if (isPlayerRoomValid(player, selectedRoom)) {
                projectileNonce++;
                projectile.nonce = projectileNonce;
                selectedRoom.emitFireProjectile(new Projectile(projectile.nonce
                    , player.x, player.y
                    , player.rotationDegrees
                    , Date.now()
                    , player.nonce));
            }
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(player);
            if (updater) clearInterval(updater);
        });

    },
};