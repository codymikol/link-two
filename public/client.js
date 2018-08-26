let socket,
    rooms,
    screen = 0,
    entityNonce = 0,
    mousePos = {},
    keyDown = {},
    entities = {},
    a = document.getElementById('a'),
    ctx= a.getContext('2d'),
    player = new Player(10,10);

function mouseInBounds(x,y,height,width) {return mousePos.x > x && mousePos.x < x + width && mousePos.y > y && mousePos.y < y + height;}
function forObj(obj, fn) {Object.keys(obj).forEach(function (key) {fn(obj[key], key);})}
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
    this._click = function () {if (this.hovered) this.onClick();};
    this._render = function () {if(this.isOnScreen()) this.render();};
}



function Button(x,y,room) {
    this.room = room;
    this.text = this.room.roomName + ' -- Players: ' + this.room.players.length + '/10';
    Entity.call(this, x,y,30,400,0);
}

Button.prototype = Object.create(new Entity());

Button.prototype.render = function () {
    ctx.beginPath();
    ctx.fillStyle = this.hovered ? "pink" : "#E9967A";
    ctx.fillRect(this.x,this.y, this.width, this.height);
    ctx.stroke();
    ctx.font="20px Georgia";
    ctx.fillStyle="black";
    ctx.fillText(this.text, this.x + 20, this.y + 20);
};

Button.prototype.onClick = function () {socket.emit('join', this.room);};

function Player(x,y) {
    this.playerName = 'Cody Mikol';
    Entity.call(this,x,y,20,20,1);
}

Player.prototype = Object.create(new Entity());

Player.prototype.render = function () {
    ctx.beginPath();
    ctx.ffillStyle = "blue";
    ctx.fillRect(this.x,this.y, 50, 50);
    ctx.stroke();
};

window.addEventListener("load", function () {

    socket = io({upgrade: false, transports: ["websocket"]});

    addEntity(player);

    forObj({
        'rooms-available': function (response) {response.forEach(function (room) {addEntity(new Button(270, 90 + (40 * entityNonce),room))})},
        'joined-room': function () {screen = 1;},
        'update-rooms': function (_rooms) {rooms = _rooms;}
    }, function (fn, key) {socket.on(key, fn)});

    setInterval(function () {
        ctx.clearRect(0, 0, a.width, a.height);
        forObj(entities, function (entity) {entity._render()})
    }, 33);

    setInterval(function () {
        switch (screen) {
            case 1:
                socket.emit('player-move', player);
        }
    }, 10);

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

}, false);