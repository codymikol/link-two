"use strict";

let rooms = [];
let playerNonce = 0;
let projectileNonce = 0;
let wallNonce = 0;
let maxRooms = 10;

const environmentMaps = new Map()
    .set(0, new Environment().walls
        .set(0, new Wall(wallNonce++, 100, 0, 20, 3600))
        .set(1, new Wall(wallNonce++, 100, 850, 20, 3600))
        .set(2, new Wall(wallNonce++, 0, 350, 1000, 20))
        .set(3, new Wall(wallNonce++, 1895, 350, 1000, 20))
        .set(4, new Wall(wallNonce++, 520, 350, 350, 20))
        .set(5, new Wall(wallNonce++, 850, 650, 20, 550))
        .set(6, new Wall(wallNonce++, 1180, 350, 350, 20))
    )
    .set(1, new Environment().walls
            .set(0, new Wall(wallNonce++, 100, 0, 20, 3600))
            .set(1, new Wall(wallNonce++, 100, 850, 20, 3600))
            .set(2, new Wall(wallNonce++, 0, 350, 1000, 20))
            .set(3, new Wall(wallNonce++, 1895, 350, 1000, 20))
            .set(4, new Wall(wallNonce++, 700, 300, 580, 20))
            .set(5, new Wall(wallNonce++, 1200, 550, 580, 20))
    )
    .set(2, new Environment().walls
        .set(0, new Wall(wallNonce++, 100, 0, 20, 3600))
        .set(1, new Wall(wallNonce++, 100, 850, 20, 3600))
        .set(2, new Wall(wallNonce++, 0, 350, 1000, 20))
        .set(3, new Wall(wallNonce++, 1895, 350, 1000, 20))
    );

class Room extends Entity {

    constructor(nonce) {
        super(0, 0, 0, 0, 0, 0);
        this.phase = 'LOBBY';
        this.round = null;
        this.requiredPlayers = 2;
        this.nonce = nonce;
        this.environment = new Environment(nonce);
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

    //TODO Move this walls shiet outta here!

    let bestRoom = (best) ? best : rooms[rooms.push(new Room(playerNonce++)) - 1];

    bestRoom.environment.walls = environmentMaps.get(Math.floor(randomIntFromInterval(1, 3) - 1));

    return bestRoom;

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