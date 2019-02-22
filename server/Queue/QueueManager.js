import Queue from "./Queue";

let instance = null;

export default class QueueManager {

    //TODO: The QueueManager should know about sessions that loose players for rejoining etc...

    /*

    For now this will handle players joining a match that has yet to start.

    In the future I would like the queue list to have games in progress added as well so players can join
    between rounds. For the sake of actually merging this colossal request this is how it will work.

    trigger findSession

    if no queues: Make a new one, add the user to it, push it to the queueList
    if queue: add user to that queue

     */

    constructor() {
        if (instance) return instance;
        instance = this;
        this.queueList = [];
    }

    findSession(user) {

        console.log('The user ', user.name, ' is searching for a game!')

        if (this.queueList.length === 0) {
            console.log('Adding a new q')
            let queue = new Queue();
            queue.addUser(user);
            this.queueList.push(queue);
        } else {
            console.log('Adding user to q')
            this.queueList[0].addUser(user);
        }

    }

}