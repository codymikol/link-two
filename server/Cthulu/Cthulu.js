/*
 ===========================================================================================================

 Yes this is not how you spell Cthulhu, I'm standing by this typo. Long live Cthulu!

 ^(;,;)^

 Thanks /u/Liz_Me for this really detailed artwork that I've stolen!
 I think this really helps to visualize Cthulu.

 https://www.reddit.com/r/Cthulhu/comments/6429gn/looking_for_ascii_art_of_the_great_old_ones/dfz680w

 ============================================================================================================

 This class is intended to act as the main thread, It's responsibilities are starting up the socket / express servers
 and filling the open matchmaking rooms. Then the Rooms spin up their own game thread and are put into a set of active
 rooms. Other things that need to be accounted for are disconnected players and private lobbies.

*/

import Room from '../Room/Room'

const fs = require('fs');
const express = require('express');
const session = require('express-session');
const parser = require('body-parser');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');


export default class Cthulu {

    constructor() {

        console.log(__dirname + '/public');

        fs.readdir('public', (err, files) => {
            files.forEach(file => {
                console.log(file);
            });
        });

        app.set('port', (process.env.PORT || 3000))
            .use(express.static(path.join(__dirname + '/public')))
            .use(session({secret: process.env.SECRET || 'codyisthebest', saveUninitialized: false, resave: false}))
            .use(parser.urlencoded({extended: true}))
            .use(parser.json());

        //TODO: Ponder a bit on this...
        this.searchingRoom = new Room();
        this.activeRoomList = new Map();

    }

    awaken() {
        server.listen(app.get('port'), () => console.log('Server started at port: ' + app.get('port')));
        io.on('connection', (socket) => {
            socket.on("join", function () {
                var actor = new Actor(0, 0, 'red', displayName);
                actor.nonce = currentPlayerNonce;
                selectedRoom.join(actor);
                socket.join('room_' + selectedRoom.nonce);
                socket.emit('joined-room', actor);
                socket.emit('environment-walls', [...selectedRoom.environment.walls.values()])
            });
        })
    }

    sleep() {
        io.close();
    }

}




