import Queue from "./Queue";

let instance = null;

export default class QueueManager {

    //TODO: The QueueManager should know about sessions that loose players for rejoining etc...

    constructor() {
        if (instance) return instance;
        instance = this;
        this.queueList = [];
    }

    findSession(user) {
        if (this.queueList.length === 0) {
            let queue = new Queue();
            queue.addUser(user);
            this.queueList.push(queue);
        } else {
            this.queueList[0].addUser(user);
        }
    }

}