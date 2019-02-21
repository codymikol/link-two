import * as io from "socket.io";
const uuidv4 = require('uuid/v4');

export default class Queue {

    constructor() {
        this.maxUsers = 4;
        this.uuid = uuidv4();
        this.group = io.of(`/queue/${this.uuid}`);
        this.users = [];
    }

    addUser(user) {
        this.users.push(user);
        console.log('We just added ', user.name, ' to our queue');
        console.log('The other users are, ', this.users.reduce((col, u) => col + u.name + ' '), '')
    }

    removeUser() {

    }

    startGame() {
        //TODO: Spin up a game  with users in queue.
    }

}