"use strict";

const rooms = [];

class Room {

	constructor(index, socket) {
		this.id = index;
		this.roomName = 'Room #' + (index+1);
		this.players = [];
	}

	join(player) {
		this.players.push(player);
		console.log('User: ' + player.name + ' has joined: ' + this.roomName);
	}


	leave(player){
		this.players = this.players.filter(function (mPlayer) {
			return player !== mPlayer;
        });
	}

}

class Player {
	constructor() {
      this.name = 'cody mikol';
	}
}

function init() {
    for(let i = 0; i < 10; i++) {rooms.push(new Room(i));}
}

init();

module.exports = {

	io: (socket) => {

		const player = new Player(socket);
		let chosenRoom = null;

		socket.emit("rooms-available", rooms);

		socket.on("join", function (room) {
			var theRoom = rooms.filter(function (mRoom) {
				return room.roomName === mRoom.roomName;
            })[0];

			chosenRoom = theRoom;

			chosenRoom.join(player);

			socket.emit('joined-room');
            socket.broadcast.emit('update-rooms', rooms);
            console.log("Connected: " + socket.id);
        });

        socket.on("disconnect", () => {
        	if(chosenRoom) chosenRoom.leave(player);
            socket.broadcast.emit('update-rooms', rooms);
        });


    },

	stat: (req, res) => {
		// storage.get('games', 0).then(games => {
		// 	res.send(`<h1>Games played: ${games}</h1>`);
		// });
	}

};