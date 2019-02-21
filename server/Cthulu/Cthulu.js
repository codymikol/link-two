/*
 ===========================================================================================================

 Yes this is not how you spell Cthulhu, I'm standing by this typo. Long live Cthulu!

 ^(;,;)^

 Thanks /u/Liz_Me for this really detailed artwork that I've stolen!
 I think this really helps to visualize Cthulu.

 https://www.reddit.com/r/Cthulhu/comments/6429gn/looking_for_ascii_art_of_the_great_old_ones/dfz680w

 ============================================================================================================

 This class is intended to act as the main thread, It's responsibilities are gobbling up sockets as they come into
 existence. It should send the socket off to the socket manager.

*/

import SocketManager from "../Socket/SocketManager/SocketManager";

const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server, {wsEngine: 'ws'});
const path = require('path');


export default class Cthulu {

    constructor() {

        console.log(__dirname + '/public');

        app.set('port', (process.env.PORT || 3000))
            .use(express.static(path.join(__dirname + '/public')))
            .use(session({secret: process.env.SECRET || 'codyisthebest', saveUninitialized: false, resave: false}))
            .use(parser.urlencoded({extended: true}))
            .use(parser.json());

        this.socketManager = new SocketManager();

    }

    awaken() {
        server.listen(app.get('port'), () => console.log('Server started at port: ' + app.get('port')));
        io.on('connection', (socket) => {
            this.socketManager.add(socket);
            socket.on('disconnect', () => this.socketManager.remove(socket));
        })
    }

    sleep() {
        io.close();
    }

}




