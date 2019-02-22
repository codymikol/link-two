import IOManager from "../IO/IOManager";

const uuidv4 = require('uuid/v4');

export default class Queue {

    constructor() {
        this.maxUsers = 4;
        this.uuid = uuidv4();
        this.ioManager = new IOManager();
        this.group = this.ioManager.io.of(`/queue/${this.uuid}`);
        this.users = [];
    }

    addUser(user) {

        let usernames = this.users.reduce(function (col, u) {
            return col + u.name + ', ';
        }, '');

        this.users.push(user);
        console.log('We just added ', user.name, ' to our queue');

        console.log('The other users are, ', usernames)
    }

    removeUser() {

    }

    startGame() {
        //TODO: Spin up a game  with users in queue.
    }

}