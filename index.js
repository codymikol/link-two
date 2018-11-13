"use strict";

const fs = require('fs');
const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
// const code = fs.readFileSync('./server/server.js', 'utf8');
// const shared = fs.readFileSync('./public/shared.js', 'utf8');
const vm = require('vm');

function createSandbox() {
    const sandbox = {
        console,
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        io: io
    };

    Object.defineProperty(sandbox, 'module', {
        enumerable: true,
        configurable: false,
        writable: false,
        value: Object.create(null)
    });
    sandbox.module.exports = Object.create(null);
    sandbox.exports = sandbox.module.exports;
    return sandbox;
};

const sandbox = createSandbox();

app.set('port', (process.env.PORT || 3000))
    .use(express.static('public'))
    .use(session({secret: process.env.SECRET || 'codyisthebest', saveUninitialized: false, resave: false}))
    .use(parser.urlencoded({extended: true}))
    .use(parser.json());

// vm.runInNewContext(shared + '\n' + code, sandbox);

// io.on('connection', sandbox.module.exports.io);
//
server.listen(app.get('port'), () => {
    console.log('Server started at port: ' + app.get('port'));
});

