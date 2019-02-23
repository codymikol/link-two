import IOManager from "../IO/IOManager";
import {EVENTS} from "../../shared/Enums/Events";
import _ from "lodash"

const uuidv4 = require('uuid/v4');

export default class Queue {

    constructor() {
        this.maxUsers = 4;
        this.uuid = uuidv4();
        this.ioManager = new IOManager();
        this.users = [];
    }

    addUser(user) {
        this.users.push(user);
        user.socket.join(this.uuid);
        this.ioManager.io.to(this.uuid).emit(EVENTS.UPDATED_QUEUE, _.map(this.users, (u) => u.asDTO()));
    }

    removeUser(user) {
        _.remove(this.users, (x) => user === x);
        this.ioManager.io.to(this.uuid).emit(EVENTS.UPDATED_QUEUE, _.map(this.users, (u) => u.asDTO()));
        user.socket.leave(this.uuid);
    }

    startGame() {
        //TODO: Spin up a game  with users in queue.
    }

}