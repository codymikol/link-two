"use strict";

let rooms = [];

// todo read in from sqllite database.
const environmentMaps = new Map()
    .set(0, new Environment().walls
        .set(0, new Wall(nonce++, 100, 0, 20, 1425))
        .set(1, new Wall(nonce++, 100, 850, 20, 1425))
        .set(2, new Wall(nonce++, 0, 350, 1000, 20))
        .set(3, new Wall(nonce++, 800, 350, 1000, 20))
        .set(4, new Wall(nonce++, 350, 350, 250, 20))
    );

class Room {

    constructor(roomNonce) {
        this.nonce = roomNonce;
        this.maxPlayers = 4;
        this.environment = new Environment(roomNonce);
    }

    emit(key, value) {io.in('room_' + this.nonce).emit(key, value)}

    joinPlayer(player) {
        this.environment.addPlayer(player);
        if (this.environment.actors.length === required_players) {
            this.startGame()
        }
    }

    emitFireProjectile(projectile) {
        this.environment.addProjectile(projectile);
        this.emit('projectile-fire', projectile);
    }

    startGame() {
        //todo
    }

    _roomTick() {
        this.environment.environmentTick();
    }

    isPlayerInRoom(playerNonce) {
        return this.environment.actors.has(playerNonce);
    }

    leave(playerNonce) {
        this.environment.actors.delete(playerNonce);
    }

    asDTO() {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            actors: [...this.environment.actors.values()],
        };
    }
}

function serverTick() {
    serverTime = Date.now();
    rooms.forEach((room) => {
        room._roomTick();
        room.emit('update-chosen-room', room.asDTO());
        room.environment.eventQueue.forEach((value, key) => {
            room.emit(key, value);
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
    for (let i = 0; i < 10; i++) {
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


function getBestRoom() {
    let openRooms = rooms.filter(room => (room.environment.actors.size < room.maxPlayers));
    let bestRoom = openRooms[0];
    for (let i = 0; i < openRooms.length; i++) {
        if (openRooms[i].environment.actors.size > bestRoom.environment.actors.size) {
            bestRoom = openRooms[i];
        }
    }
    return bestRoom;
}

init();

module.exports = {

    io: (socket) => {

        const currentPlayerNonce = nonce++;
        let selectedRoom;

        socket.on("join", function () {
            selectedRoom = getBestRoom();
            var actor = new Actor(0, 0, 'red');
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
                projectile.nonce = nonce++;
                selectedRoom.emitFireProjectile(new Projectile(projectile.nonce
                    , thePlayer.x, thePlayer.y
                    , thePlayer.rotationDegrees
                    , Date.now()
                    , thePlayer.nonce));
            }
        });

        socket.on("disconnect", () => {if (selectedRoom) selectedRoom.leave(currentPlayerNonce)});

    },
};