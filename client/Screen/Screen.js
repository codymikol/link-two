import _ from '../../node_modules/underscore/underscore'

export default class Screen {

    constructor() {
        this.nonce = 0;
        this.entities = {};
    }

    add(entity) {
        this.entities[this.nonce] = entity;
        this.nonce ++;
    }

    delete(key) {
        delete this.entities[key];
    }

    render(){
        _.values(this.entities).forEach(entity => entity._render())
    }

    tick() {
        _.values(this.entities).forEach(entity => entity._tick())
    }

    resize() {
        _.values(this.entities).forEach(entity => entity._resize())
    }

}