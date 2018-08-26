let socket,
    rooms,
    maxFPS = 60,
    lastFrameTimeMs = 0,
    screen = 0,
    entityNonce = 0,
    mousePos = {},
    keyDown = {},
    entities = {},
    a = document.getElementById('a'),
    ctx= a.getContext('2d');

function mouseInBounds(x,y,height,width) {return mousePos.x > x && mousePos.x < x + width && mousePos.y > y && mousePos.y < y + height;}
function entitiesCall(method){ forObj(entities, function (entity) { entity[method]() }) }
function addEntity(entity){ entity.nonce = entityNonce; entities[entityNonce] = entity; entityNonce++;}

function Entity(x, y, height, width, _screen) {
    this.nonce = null;
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;
    this.hovered = false;
    this.isOnScreen = function(){return this._screen === screen};
    this._screen = _screen;
    this._sethover = function () {this.hovered = this.isOnScreen() && mouseInBounds(this.x,this.y,this.height,this.width)};
    this._click = function () {if (this.hovered && this.onClick) this.onClick();};
    this._render = function () {if(this.isOnScreen()) this.render();};
}


let Button = function(x,y,room) {
    this.room = room;
    this.text = this.room.roomName + ' -- Players: ' + this.room.players.length + '/10';
    Entity.call(this, x,y,30,400,0);
};

Button.prototype = {
    render: function () {
        ctx.beginPath();
        ctx.fillStyle = this.hovered ? "pink" : "#E9967A";
        ctx.fillRect(this.x,this.y, this.width, this.height);
        ctx.stroke();
        ctx.font="20px Georgia";
        ctx.fillStyle="black";
        ctx.fillText(this.text, this.x + 20, this.y + 20);
    },
    onClick: function () {
        socket.emit('join', this.room);
    }
};

let Player = function (x,y) {
    this.health = 100;
    this.velocity = .1;
    this.name = 'Morty Jr';
    Entity.call(this,x,y,20,20,1);
};

Player.prototype = {
    render: function () {
        ctx.beginPath();
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x,this.y, 25, 25);
        ctx.stroke();
    }
};

window.addEventListener("load", function () {

    socket = io({upgrade: false, transports: ["websocket"]});
    let player = new Player(10,10);

    addEntity(player);

    forObj({
        'rooms-available': function (response) {forObj(response, function (room) {addEntity(new Button(270, 90 + (40 * entityNonce),room))})},
        'joined-room': function () {screen = 1;},
        'update-rooms': function (_rooms) {rooms = _rooms;}
    }, function (fn, key) {socket.on(key, fn)});


    function update(delta) {
        if(keyDown.w) { player.y -= player.velocity * delta }
        if(keyDown.a) { player.x -= player.velocity * delta }
        if(keyDown.s) { player.y += player.velocity * delta }
        if(keyDown.d) { player.x += player.velocity * delta }
    }

    function draw(){
        ctx.clearRect(0, 0, a.width, a.height);
        entitiesCall('_render')
    }

    function mainLoop(timestamp) {
        if (timestamp < lastFrameTimeMs + (1000 / maxFPS)) {
            requestAnimationFrame(mainLoop);
            return;
        }
        let delta = timestamp - lastFrameTimeMs;
        lastFrameTimeMs = timestamp;

        update(delta);
        draw();
        requestAnimationFrame(mainLoop);
    }

    onclick = function (e) { entitiesCall('_click') };

    function bindKey(e) {keyDown[e.key] = e.type[3] === 'd';}
    onkeydown = bindKey;
    onkeyup = bindKey;

    onmousemove = function (e) {
        let rect = a.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        entitiesCall('_sethover');
    };

    requestAnimationFrame(mainLoop)

}, false);