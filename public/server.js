"use strict";

let rooms;
var playerNonce = 0;
var projectileNonce = 0;

class RoomList {

    constructor() {

        this.rooms = [];

        this.add = function (room) {
            this.rooms.push(room)
        };
        this.bynonce = function (nonce) {
            return this.rooms.filter(function (room) {
                return room.nonce === nonce;
            })[0]
        };
        this.asDTO = function () {
            return this.rooms.reduce(function (col, room) {
                col[room.nonce] = room.asDTO();
                return col;
            }, {})
        };

        this.serverTick = function () {
            this.rooms.forEach(function (room) {
                room._roomTick();
            });
        };

    }
}

class Room {

    constructor(index) {
        this.nonce = index;
        this.roomName = 'Room #' + (index + 1);
        this.players = [];
        this.projectiles = [];
    }

    join(player) {
        console.log(player)
        this.players.push(player);
        console.log('User: ' + player.name + ' has joined: ' + this.roomName);
        if (this.players.length === required_players) {
            this.startGame()
        }
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    startGame() {
        //TODO: Start the game
    }

    _roomTick() {
        this.projectiles.forEach(function (projectile, index, projectiles) {
            projectile._serverTick();
            if (projectile.isOutOfBounds()) {
                projectiles.splice(index, 1);
            }
        });
    }

    leave(player) {
        this.players = this.players.filter(function (mPlayer) {
            return player !== mPlayer;
        });
    }

    asDTO(isFullDTO) {
        return {
            nonce: this.nonce,
            players: isFullDTO ? this.players.map(function (player) {
                return player.asDTO();
            }) : null,
            projectiles: isFullDTO ? this.projectiles : null,
            playerSize: this.players.length,
            roomName: this.roomName
        };
    }

}

class Player {

    constructor(socket) {
        this.nonce = playerNonce;
        this.x = 0;
        this.y = 0;
        this.rotationDegrees = 0;
        this.health = 100;
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

function daemon() {
    setInterval(function(){rooms.serverTick()}, 15);
}

function init() {
    rooms = new RoomList();
    for (let i = 0; i < 10; i++) {
        rooms.add(new Room(i));
    }
    daemon();
}

init();

module.exports = {

    io: (socket) => {

        playerNonce++;
        const player = new Player(socket);
        var updater;
        var selectedRoom;

        socket.emit("rooms-available", rooms.asDTO());

        socket.on("join", function (room) {
            selectedRoom = rooms.bynonce(room.nonce);
            selectedRoom.join(player);
            socket.emit('joined-room', player.asDTO());

            updater = setInterval(function () {
                socket.emit('update-chosen-room', selectedRoom.asDTO(true));
            }, 15);

        });

        socket.on('update-player', function (client_player) {
            player.x = client_player.x;
            player.y = client_player.y;
            player.rotationDegrees = client_player.rotationDegrees;
        });

        socket.on('fire-projectile', function (projectile) {
            if (selectedRoom && player) {
                projectileNonce++;
                projectile.nonce = projectileNonce;
                selectedRoom.addProjectile(new Projectile(projectile.nonce
                    , player.x, player.y
                    , player.rotationDegrees
                    , projectile.color))
            }
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(player);
            if (updater) clearInterval(updater);
        });

    },
};