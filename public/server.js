"use strict";

const rooms = [];

const required_players = 2;

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

    asDTO() {
        return {
            players: this.players.map(function (player) {
                return player.asDTO()
            }),
            roomName: this.roomName
        }
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
    for (let i = 0; i < 10; i++) {
        rooms.push(new Room(i));
    }
}

init();

module.exports = {

    io: (socket) => {

        const player = new Player(socket);
        var theRoom = null;


        socket.emit("rooms-available", rooms.map(function (room) {
            return room.asDTO();
        }));

        socket.on("join", function (room) {
            theRoom = rooms.filter(function (mRoom) {
                return room.roomName === mRoom.roomName;
            })[0];

            theRoom.join(player);

            socket.emit('joined-room');

            console.log("Connected: " + socket.id);

        });

        socket.on("player-move", function (dtoPlayer) {
            player.x = dtoPlayer.x;
            player.y = dtoPlayer.y;
            theRoom.players.forEach(function (player) {
                player.socket.emit('update-room', theRoom.asDTO())
            });
        });

        socket.on("disconnect", () => {

            if(theRoom) {
                theRoom.leave(player);
            }

            socket.broadcast.emit('update-rooms', rooms.map(function (room) {
                return room.asDTO();
            }));
        });

    },
};