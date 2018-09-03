"use strict";

let rooms;
let playerNonce = 0;
let projectileNonce = 0;
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

        this.bestRoom = function () {
            let openRooms = this.rooms.filter(room => (room.players.length < room.maxPlayers));
            let bestRoom = openRooms[0];
            for (let i = 0; i < openRooms.length; i++) {
                if (openRooms[i].playerSize > bestRoom.playerSize) {
                    bestRoom = openRooms[i];
                }
            }
            return bestRoom;
        };

        this.updateRoom = function (room) {
            if (room.players.length > 0) {
                room._roomTick();
                io.in('room_' + room.nonce).volatile.emit('update-chosen-room', room.asDTO(true))
            }
        };

        this.serverTick = function () {
            serverTime = Date.now();
            this.rooms.forEach(this.updateRoom);
        };

    }
}

class Room {

    constructor(index) {
        this.nonce = index;
        this.roomName = 'Room #' + (index + 1);
        this.players = [];
        this.projectiles = [];
        this.maxPlayers = 10;
        this.isActive = false;
    }

    join(player) {
        this.players.push(player);
        if (this.players.length === required_players) {
            this.startGame()
        }
    }

    emitFireProjectile(projectile) {
        this.addProjectile(projectile);
        io.in('room_' + this.nonce).volatile.emit('projectile-fire', projectile);
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    startGame() {
        this.isActive = true;
    }

    _roomTick() {
        let self = this;
        this.projectiles.forEach(function (projectile, index, projectiles) {
            projectile.onTick();
            let hitPlayers = self.getPlayerColliding(projectile);
            if (projectile.isOutOfBounds() || hitPlayers.length > 0) {
                projectiles.splice(index, 1);
            }
            hitPlayers.forEach(function (player, index) {
                self.hurtPlayer(player, index)
            })
        });

    }

    isPlayerInRoom(nonce) {
        return this.players.some(function (player) {
            return player.nonce === nonce
        })
    }

    hurtPlayer(player, index) {
        player.health--;
        if (player.health <= 0) {
            this.players.splice(index, 1);
        }
    }

    getPlayerColliding(projectile) {
        return this.players.filter(function (player) {
            return (projectile.playerNonce !== player.nonce && entitiesCollide(projectile, player));
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
            serverTime: serverTime,
            players: isFullDTO ? this.players.map(function (player) {
                return player.asDTO();
            }) : null,
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

function daemon() {
    setInterval(function () {
        rooms.serverTick()
    }, tick_rate);
}

function init() {
    rooms = new RoomList();
    for (let i = 0; i < 10; i++) {
        rooms.add(new Room(i));
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

        socket.emit("rooms-available", rooms.asDTO());

        socket.on("join", function () {
            selectedRoom = rooms.bestRoom();
            selectedRoom.join(player);
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
                    , player.nonce))
            }
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(player);
            if (updater) clearInterval(updater);
        });

    },
};