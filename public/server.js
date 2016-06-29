//Server code

const users = [];
const GUESS_NO = 0;
const GUESS_ROCK = 1;
const GUESS_PAPER = 2;
const GUESS_SCISSORS = 3;

function findOpponent() {
	for (let i = 0; i < users.length; i++) {
		if (users[i].opponent === null) {
			return users[i];
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
		user1.game = this;
		user2.game = this;
		user1.guess = GUESS_NO;
		user2.guess = GUESS_NO;
		user1.send("start");
		user2.send("start");
	}

	ended() {
		return this.user1.guess !== GUESS_NO && this.user2.guess !== GUESS_NO;
	}

	winner() {
		if (
			this.user1.guess === GUESS_ROCK && this.user2.guess === GUESS_SCISSORS ||
			this.user1.guess === GUESS_PAPER && this.user2.guess === GUESS_ROCK ||
			this.user1.guess === GUESS_SCISSORS && this.user2.guess === GUESS_PAPER
		) {
			this.user1.won++;
			this.user2.lost++;
			return this.user1;
		}
		if (
			this.user2.guess === GUESS_ROCK && this.user1.guess === GUESS_SCISSORS ||
			this.user2.guess === GUESS_PAPER && this.user1.guess === GUESS_ROCK ||
			this.user2.guess === GUESS_SCISSORS && this.user1.guess === GUESS_PAPER
		) {
			this.user2.won++;
			this.user1.lost++;
			return this.user2;
		}
		return null;
	}

}

class User {

	constructor(socket) {
		this.socket = socket;
		this.opponent = null;
		this.game = null;
		this.won = 0;
		this.lost = 0;
		this.guess = GUESS_NO;
	}

	setOpponent(opponent) {
		this.opponent = opponent;
		if (opponent === null) {
			this.endGame();
		}
	}

	setGuess(guess) {
		const game = this.game;
		if (
			!game ||
			game.ended() ||
			guess <= GUESS_NO ||
			guess > GUESS_SCISSORS
		) {
			return false;
		}
		this.guess = guess;
		return true;
	}

	endGame() {
		this.game = null;
	}

	leave() {
		if (this.opponent) {
			this.opponent.setOpponent(null);
			this.opponent.send("leave");
		}
	}

	send(message) {
		console.log(message);
		this.socket.emit(message, {
			won: this.won,
			lost: this.lost,
			game: this.game !== null
		});
	}
}

module.exports = function (socket) {

	const user = new User(socket);
	const opponent = findOpponent();
	users.push(user);

	if (opponent) {
		opponent.setOpponent(user);
		user.setOpponent(opponent);
		const game = new Game(user, opponent);
	}
	
	socket.on("disconnect", () => {
		user.leave();
		removeUser(user);
		console.log("Disconnected: " + socket.id);
	});

	console.log("Connected: " + socket.id);
};