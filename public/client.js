let socket,
    rooms,
    maxFPS = 60,
    lastFrameTimeMs = 0,
    screen = 0,
    entityNonce = 0,
    mousePos = {},
    player;
    keyDown = {},
    entities = {},
    a = document.getElementById('a'),
    ctx = a.getContext('2d');

function mouseInBounds(x, y, height, width) {
    return mousePos.x > x && mousePos.x < x + width && mousePos.y > y && mousePos.y < y + height;
}

function entitiesCall(method) {
    forObj(entities, function (entity) {
        entity[method]()
    })
}

function addEntity(entity, namespace) {
    entity.nonce = entityNonce;
    entities[namespace || entityNonce] = entity;
    entityNonce++;
}

class Entity {
    constructor(x, y, height, width, _screen) {
        this.nonce = null;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.hovered = false;
        this.isOnScreen = function () {
            return this._screen === screen
        };
        this._screen = _screen;
        this._sethover = function () {
            this.hovered = this.isOnScreen() && mouseInBounds(this.x, this.y, this.height, this.width)
        };
        this._anyclick = function () {
            if (this.isOnScreen() && this.onAnyClick) this.onAnyClick();
        };
        this._click = function () {
            if (this.hovered && this.onClick) this.onClick();
        };
        this._render = function () {
            if (this.isOnScreen()) this.render();
        };
        this._mousemove = function () {
            if (this.isOnScreen() && this.onMouseMove) this.onMouseMove();
        };
        this._tick = function (delta) {
            if (this.isOnScreen() && this.onTick) this.onTick(delta);
        };
    }
}

class Button extends Entity {
    constructor(x, y, room) {
        super(x, y, 30, 400, 0);
        this.room = room;
        this.render = function () {
            ctx.beginPath();
            ctx.fillStyle = this.hovered ? "pink" : "#E9967A";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.font = "20px Georgia";
            ctx.fillStyle = "black";
            this.text = this.room.roomName + ' -- Players: ' + this.room.playerSize + '/10';
            ctx.fillText(this.text, this.x + 20, this.y + 20);
        };
        this.onClick = function () {
            socket.emit('join', this.room);
        };
    }
}

class Actor extends Entity {
    constructor(x, y, color) {
        super(x, y, 20, 20, 1);
        this.health = 100;
        this.rotationDegrees = 0;
        this.color = color;
        this.velocity = .1;
        this.render = function () {
            ctx.fillStyle = this.color;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotationDegrees * Math.PI / 180);
            ctx.fillRect(this.width / this.x - 10
                , this.height / this.y - 10
                , this.width, this.height);
            ctx.restore();
        };
    }
}

class Player extends Actor {
    constructor(x, y) {
        super(x, y, 'green');
        this.onMouseMove = function () {
            this.rotationDegrees = Math.atan2(mousePos.y - this.y, mousePos.x - this.x) * 180 / Math.PI;
        };
        this.onAnyClick = function () {
            addEntity(new Projectile(this.x, this.y, this.rotationDegrees));
        };
        this.onTick = function (delta) {
            ctx.fillRect(this.x * this.rotationDegrees, this.y * this.rotationDegrees, 10, 10);

            if (keyDown.w) this.y -= this.velocity * delta;
            if (keyDown.a) this.x -= this.velocity * delta;
            if (keyDown.s) this.y += this.velocity * delta;
            if (keyDown.d) this.x += this.velocity * delta;
        };
    }
}

class Enemy extends Actor {
    constructor(x, y) {
        super(x, y, 'red');
    }
}

class Projectile extends Entity {
    constructor(x, y, rotation, color) {
        super(x, y, 5, 5, 1);
        this.rotation = rotation;
        this.speed = 10;
        this.dx = this.rotation * x;
        this.dy = this.rotation * y;
        this.color = color;
        this.render = function () {
            ctx.beginPath();
            ctx.fillStyle = this.color || 'purple';
            ctx.font = "12px Arial";
            ctx.fillRect(this.x, this.y, this.height, this.width);
            ctx.stroke();
        };
        this.onTick = function () {
            this.x += this.speed * Math.cos(this.rotation * Math.PI / 180);
            this.y += this.speed * Math.sin(this.rotation * Math.PI / 180);
        };
    }
}

window.addEventListener("load", function () {

    socket = io({upgrade: false, transports: ["websocket"]});

    player = new Player(10, 10);

    addEntity(player);

    forObj({
        'rooms-available': function (response) {
            forObj(response, function (room) {
                addEntity(new Button(270, 90 + (40 * entityNonce), room))
            })
        },
        'joined-room': function (server_player) {
            player.id = server_player.id;
            screen = 1;
        },
        'enemy-joined': function (enemy) {
            addEntity(new Enemy(enemy.x, enemy.y, enemy.id))
        },
        'enemy-left': function (enemy) {
        },
        'update-rooms': function (_rooms) {
            rooms = _rooms;
        },
        'update-chosen-room': function (room) {
            room.players.forEach(function (server_player) {

                if (server_player.id !== player.id) {
                    var cached_player = entities['enemy-' + server_player.id];

                    if (cached_player) {
                        cached_player.x = server_player.x;
                        cached_player.y = server_player.y;
                        cached_player.rotationDegrees = server_player.rotationDegrees;
                    } else {
                        addEntity(new Enemy(server_player.x, server_player.y), 'enemy-' + server_player.id);
                    }
                }

                socket.emit('update-player', player);

            });
        }
    }, function (fn, key) {
        socket.on(key, fn)
    });


    function update(delta) {
        entitiesCall('_tick', delta);
    }

    function draw() {
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

    onclick = function (e) {
        entitiesCall('_click');
        entitiesCall('_anyclick');
    };

    function bindKey(e) {
        keyDown[e.key] = e.type[3] === 'd';
    }

    onkeydown = bindKey;
    onkeyup = bindKey;

    onmousemove = function (e) {
        let rect = a.getBoundingClientRect();
        mousePos.x = e.clientX - rect.left;
        mousePos.y = e.clientY - rect.top;
        entitiesCall('_sethover');
        entitiesCall('_mousemove');
    };

    requestAnimationFrame(mainLoop);

}, false);