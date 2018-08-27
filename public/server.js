"use strict";

const required_players = 2;
let rooms;

class RoomList {

    constructor() {

        this.rooms = [];

        this.add = function (room) {
            this.rooms.push(room)
        };
        this.byId = function (id) {
            return this.rooms.filter(function (room) {
                return room.id === id;
            })[0]
        };
        this.asDTO = function () {
            return this.rooms.reduce(function (col, room) {
                col[room.id] = room.asDTO();
                return col;
            }, {})
        }
    }
}

class Room {

    constructor(index) {
        this.id = index;
        this.roomName = 'Room #' + (index + 1);
        this.players = [];
    }

    join(player) {
        console.log(player)
        this.players.push(player);
        console.log('User: ' + player.name + ' has joined: ' + this.roomName);
        if (player.length === required_players) {
            setInterval(this.startGame, 3)
        }
    }

    startGame() {
        this.players.forEach(this.broadcastPlayer)
    }

    broadcastPlayer(player, index) {
        player.socket.emit("player-info", players.map(function (player) {
            return {name: player.name, health: player.health, x: player.x, y: player.y}
        }))
    }

    leave(player) {
        this.players = this.players.filter(function (mPlayer) {
            return player !== mPlayer;
        });
    }

    asDTO(isFullDTO) {
        return {
            id: this.id,
            players: isFullDTO ? this.players.map(function (player) {
                return player.asDTO();
            }) : null,
            playerSize : this.players.length,
            roomName: this.roomName
        };
    }

}

class Player {

    constructor(socket) {
        this.x = 0;
        this.y = 0;

        this.health = 100;
        this.socket = socket;
        this.name = 'cody mikol';
    }

    asDTO() {
        return {name: this.name, health: this.health, x: this.x, y: this.y}
    }

}

function init() {
    rooms = new RoomList();
    for (let i = 0; i < 10; i++) {
        rooms.add(new Room(i));
    }
}

init();

module.exports = {

    io: (socket) => {

        const player = new Player(socket);
        var theRoom;

        socket.emit("rooms-available", rooms.asDTO());

        socket.on("join", function (room) {
            theRoom = rooms.byId(room.id);
            theRoom.join(player);
            socket.emit('joined-room');
            socket.broadcast.emit('update-rooms', rooms.asDTO());
            console.log("Connected: " + socket.id);
        });

        socket.on("player-move", function (dtoPlayer) {
            player.x = dtoPlayer.x;
            player.y = dtoPlayer.y;
            if (theRoom) {
                theRoom.players.forEach(function (player) {
                    player.socket.emit('update-room', theRoom.asDTO())
                });
            }
        });

        socket.on("disconnect", () => {
            if (theRoom) theRoom.leave(player);
            socket.broadcast.emit('update-rooms', rooms.asDTO());
        });

    },
};