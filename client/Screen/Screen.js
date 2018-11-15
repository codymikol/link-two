import _ from '../../node_modules/underscore/underscore'

export default class Screen {

    constructor() {
        this.nonce = 0;
        this.entities = {};
    }

    getEntities() {
        return _.values(this.entities)
    }

    forEntities(fn) {
        this.getEntities().forEach(entity => fn(entity))
    }

    add(entity) {
        this.entities[this.nonce] = entity;
        this.nonce ++;
    }

    delete(key) {
        delete this.entities[key];
    }

}