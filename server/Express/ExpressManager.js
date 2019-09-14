const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const path = require('path');

let instance = null;

export default class ExpressManager {

    constructor() {
        if (instance) return instance;
        instance = this;
        this.app = app;
        this.server = server;
    }

    init() {
        this.app.set('port', (process.env.PORT || 3000))
            .use(express.static(path.join(__dirname + '/public')))
            .use(session({secret: process.env.SECRET || 'codyisthebest', saveUninitialized: false, resave: false}))
            .use(parser.urlencoded({extended: true}))
            .use(parser.json());
    }

    listen() {
        this.server.listen(app.get('port'), () => console.log('Server started at port: ' + app.get('port')));
    }

}