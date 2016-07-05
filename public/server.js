"use strict";

const users = [];

function findOpponent(user) {
	for (let i = 0; i < users.length; i++) {
		if (
			user !== users[i] && 
			users[i].opponent === null
		) {
			new Game(user, users[i]).start();
		}
	}
	return null;
}

function removeUser(user) {
	users.splice(users.indexOf(user), 1);
}

class Game {

	constructor(user1, user2) {
		this.user1 = user1;
		this.user2 = user2;
	}

	start() {
		this.user1.start(this, this.user2);
		this.user2.start(this, this.user1);
	}

	ended() {
		return this.user1.guess !== GUESS_NO && this.user2.guess !== GUESS_NO;
	}

	score() {
		if (
			this.user1.guess === GUESS_ROCK && this.user2.guess === GUESS_SCISSORS ||
			this.user1.guess === GUESS_PAPER && this.user2.guess === GUESS_ROCK ||
			this.user1.guess === GUESS_SCISSORS && this.user2.guess === GUESS_PAPER
		) {
			this.user1.win();
			this.user2.loose();
		} else if (
			this.user2.guess === GUESS_ROCK && this.user1.guess === GUESS_SCISSORS ||
			this.user2.guess === GUESS_PAPER && this.user1.guess === GUESS_ROCK ||
			this.user2.guess === GUESS_SCISSORS && this.user1.guess === GUESS_PAPER
		) {
			this.user2.win();
			this.user1.loose();
		} else {
			this.user1.tie();
			this.user2.tie();
		}
	}

}

class User {

	constructor(socket) {
		this.socket = socket;
		this.game = null;
		this.opponent = null;
		this.guess = GUESS_NO;
	}

	setGuess(guess) {
		if (
			!this.opponent ||
			guess <= GUESS_NO ||
			guess > GUESS_SCISSORS
		) {
			return false;
		}
		this.guess = guess;
		return true;
	}

	start(game, opponent) {
		this.game = game;
		this.opponent = opponent;
		this.guess = GUESS_NO;
		this.socket.emit("start");		
	}

	end() {
		this.game = null;
		this.opponent = null;
		this.guess = GUESS_NO;
		this.socket.emit("end");
	}

	win() {
		this.socket.emit("win", this.opponent.guess);
	}

	loose() {
		this.socket.emit("loose", this.opponent.guess);
	}

	tie() {
		this.socket.emit("tie", this.opponent.guess);
	}
}

module.exports = function (socket) {
	const user = new User(socket);
	users.push(user);
	findOpponent(user);
	
	socket.on("disconnect", () => {
		console.log("Disconnected: " + socket.id);
		removeUser(user);
		if (user.opponent) {
			user.opponent.end();
			findOpponent(user.opponent);
		}
	});

	socket.on("guess", (guess) => {
		console.log("Guess: " + socket.id);
		if (user.setGuess(guess) && user.game.ended()) {
			user.game.score();
			user.game.start();
		}
	});

	console.log("Connected: " + socket.id);
};