"use strict";

let rooms = [];
let playerNonce = 0;
let projectileNonce = 0;
let wallNonce = 0;

class Room extends Entity {

    constructor(nonce) {
        super(0, 0, 0, 0, 0, 0);
        this.phase = 'LOBBY';
        this.round = null;
        this.requiredPlayers = 2;
        this.nonce = nonce;
        this.environment = new Environment(this);
    }

    emit(key, value) {
        io.in('room_' + this.nonce).emit(key, value);
    }

    join(player) {
        this.environment.addPlayer(player);
        if (this.environment.actors.size >= 2) this.countdown = 30 * tick_rate;
    }

    leave(playerNonce) {
        this.emit('destroy', 'enemy-' + playerNonce);
        this.environment.actors.delete(playerNonce);
        if (this.environment.actors.size < this.requiredPlayers) delete this.countdown;
    }

    startGame() {
        this.phase = 'GAME';
        this.emit('game-start');
    }

    emitFireProjectile(projectile) {
        this.environment.addProjectile(projectile);
        this.emit('projectile-fire', projectile);
    }

    _roomTick() {

        switch (this.phase) {
            case 'LOBBY':
                if(this.environment.actors.size >= 2) this.countdown--;
                if(this.countdown === 0) this.startGame();
                break;
            case 'GAME':
                this.environment.environmentTick();
                break;
        }

    }

    asDTO() {
        return {
            nonce: this.nonce,
            serverTime: serverTime,
            countdown: this.countdown,
            actors: [...this.environment.actors.values()],
            playerSize: this.environment.actors.length,
            roomName: this.roomName
        };
    }
}

function serverTick() {
    serverTime = Date.now();
    rooms.forEach(function (room) {
        room._roomTick();
        room.emit('update-chosen-room', room.asDTO(true));
        room.environment.eventQueue.forEach((value, key) => {
            room.emit(key, value);
            room.environment.eventQueue.delete(key);
        });
    })
}

function getBestRoom() {

    let best = rooms
        .filter(room => room.phase === 'LOBBY' && room.environment.actors.size < 4)
        .reduce((col, room) => {
            if (!col) return room;
            return (room.players > col.players) ? room : col;
        }, undefined);

    return (best) ? best : rooms[rooms.push(new Room(playerNonce++)) - 1];

}

function init() {
    setInterval(function () {
        serverTick()
    }, tick_rate);
}

init();

module.exports = {

    io: (socket) => {

        playerNonce++;
        const currentPlayerNonce = playerNonce;
        let selectedRoom;

        socket.on("join", function () {
            selectedRoom = getBestRoom();
            var actor = new Actor(0, 0, 'red');
            actor.nonce = currentPlayerNonce;
            selectedRoom.join(actor);
            socket.join('room_' + selectedRoom.nonce);
            socket.emit('joined-room', actor);
            console.log([...selectedRoom.environment.walls.values()])
            socket.emit('environment-walls', [...selectedRoom.environment.walls.values()])
        });

        socket.on('update-player', function (client_player) {
                let thePlayer = selectedRoom.environment.actors.get(currentPlayerNonce);
                thePlayer.x = client_player.x;
                thePlayer.y = client_player.y;
                thePlayer.rotationDegrees = client_player.rotationDegrees;
        });

        socket.on('fire-projectile', function (projectile) {
                let thePlayer = selectedRoom.environment.actors.get(currentPlayerNonce);
                projectileNonce++;
                projectile.nonce = projectileNonce;
                selectedRoom.emitFireProjectile(new Projectile(projectile.nonce
                    , thePlayer.x, thePlayer.y
                    , thePlayer.rotationDegrees
                    , Date.now()
                    , thePlayer.nonce));
        });

        socket.on("disconnect", () => {
            if (selectedRoom) selectedRoom.leave(currentPlayerNonce)
        });

    },
};