"use strict";

let rooms = [];
let playerSockets = new Map();
let playerNonce = 0;
let projectileNonce = 0;
let wallNonce = 0;

function getWallNonce() {
    wallNonce++;
    return wallNonce;
}

// todo read in from sqllite database.
const environmentMaps = new Map()
    .set(0, new Environment().walls
        .set(0, new Wall(getWallNonce(), 100, 0, 20, 1425))
        .set(1, new Wall(getWallNonce(), 100, 850, 20, 1425))
        .set(2, new Wall(getWallNonce(), 0, 350, 1000, 20))
        .set(3, new Wall(getWallNonce(), 800, 350, 1000, 20))
        .set(4, new Wall(getWallNonce(), 350, 350, 250, 20))
    );

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
        if (this.environment.actors.length === required_players) {
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
        return this.environment.actors.has(nonce);
    }

    leave(playerNonce) {
        this.environment.actors.delete(playerNonce);
    }

    asDTO(isFullDTO) {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            actors: isFullDTO ? [...this.environment.actors.values()] : null,
            playerSize: this.environment.actors.length,
            roomName: this.roomName
        };
    }
}

function serverTick() {
    serverTime = Date.now();
    rooms.forEach(function (room) {
        room._roomTick();
        io.in('room_' + room.nonce).volatile.emit('update-chosen-room', room.asDTO(true));
        room.environment.eventQueue.forEach((value, key) => {
            io.in('room_' + room.nonce).emit(key, value);
            room.environment.eventQueue.delete(key);
        });
    })
}

function daemon() {
    setInterval(function () {
        serverTick()
    }, tick_rate);
}

function init() {
    for (let i = 0; i < 1; i++) {
        var room = new Room(i);
        room.environment.walls = environmentMaps.get(0);
        console.log(room);
        rooms.push(room);
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
            socket.emit('environment-walls', [...selectedRoom.environment.walls.values()])
        });

        socket.on('update-player', function (client_player) {
            if (isPlayerRoomValid(currentPlayerNonce, selectedRoom)) {
                let thePlayer = selectedRoom.environment.actors.get(currentPlayerNonce);
                thePlayer.x = client_player.x;
                thePlayer.y = client_player.y;
                thePlayer.rotationDegrees = client_player.rotationDegrees;
            }
        });

        socket.on('fire-projectile', function (projectile) {
            if (isPlayerRoomValid(currentPlayerNonce, selectedRoom)) {
                let thePlayer = selectedRoom.environment.actors.get(currentPlayerNonce);
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