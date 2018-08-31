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

        this.serverTick = function () {
            this.rooms.forEach(function (room) {
                if (room.isActive) {
                    room._roomTick();
                }
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
        this.isActive = false;
    }

    join(player) {
        this.players.push(player);
        if (this.players.length === required_players) {
            this.startGame()
        }
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    startGame() {
        this.isActive = true;
        //TODO: Start the game
    }

    _roomTick() {
        let self = this;
        this.projectiles.forEach(function (projectile, index, projectiles) {
            projectile._serverTick();
            let hitPlayers = self.getPlayerColliding(projectile);
            if (projectile.isOutOfBounds() || hitPlayers.length > 0) {
                projectiles.splice(index, 1);
            }
            hitPlayers.forEach(function (player, index) {
                self.hurtPlayer(player, index)
            })
        });
        var self = this;
        this.players.forEach(function(player) {
            player.socket.emit('update-chosen-room', self.asDTO(true))
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

    projectileFire(projectile) {
        var projectileObj = new Projectile(projectile.nonce
            , player.x, player.y
            , player.rotationDegrees
            , Date.now()
            , player.nonce
            , randomIntFromInterval(2, 5));
        this.addProjectile(projectileObj);
        this.players.forEach(function(player) {
            player.socket.emit('projectile-fire', projectileObj)
        });
    }

    asDTO(isFullDTO) {
        return {
            nonce: this.nonce,
            roomTime: Date.now(),
            players: isFullDTO ? this.players.map(function (player) {
                return player.asDTO();
            }) : null,
            // projectiles: isFullDTO ? this.projectiles : null,
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
        this.health = 1000;
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
    }, 30);
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

        socket.on("join", function (room) {
            selectedRoom = rooms.bynonce(room.nonce);
            selectedRoom.join(player);
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
                selectedRoom.projectileFire(projectile)
            }
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(player);
            if (updater) clearInterval(updater);
        });

    },
};