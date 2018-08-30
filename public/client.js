let socket,
    rooms,
    maxFPS = 60,
    lastFrameTimeMs = 0,
    screen = 3,
    entityNonce = 0,
    mousePos = {},
    player,
    background,
    roomsAvailable,
    button,
keyDown = {},
    entities = {},
    a = document.getElementById('a'),
    ctx = a.getContext('2d');

function mouseInBounds(x, y, height, width) {
    return mousePos.x > x && mousePos.x < x + width && mousePos.y > y && mousePos.y < y + height;
}

function entitiesCall(method, arg) {
    forObj(entities, function (entity) {
        entity[method](arg);
    })
}

function addEntity(entity, namespace) {
    entity.nonce = entityNonce;
    entity.namespace = namespace;
    entities[namespace || entityNonce] = entity;
    entityNonce++;
    return entity;
}

class Button extends Entity {
    constructor(x, y, text, onClick) {
        super(x, y, 30, 400, 3);
        this.text = text;
        this.render = function () {
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.fillStyle = this.hovered ? "#083F10" : "#208C30";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.font = "20px Arial Black";
            ctx.fillStyle = "black";
            ctx.fillText(this.text, this.x + 20, this.y + 20);
            ctx.globalAlpha = 1;
        };
        this.onClick = onClick;
    }
}

class Background extends Entity {
    constructor() {
        super(0,0,a.height,a.width, 3);
        this.timer = 0;
        this.render = function () {

            //Background
            ctx.fillStyle='black';
            ctx.fillRect(0,0,this.width,this.height);

            //Text LINK
            ctx.globalAlpha = 0.6;
            ctx.font="240px Arial Black";
            ctx.fillStyle='#083F10';
            if(this.timer <= 30) ctx.fillText(">",this.x + 5 + 80,this.y + 5 + 275);
            ctx.fillText("LINK",this.x + 5 + 240,this.y + 5 + 275);
            ctx.fillStyle='#208C30';
            if(this.timer >= 30) ctx.globalAlpha = 0.2;
            ctx.fillText(">",this.x + 80,this.y + 275);
            if(this.timer >= 30) ctx.globalAlpha = 0.6;
            ctx.fillText("LINK",this.x + 240,this.y + 275);

            ctx.font="24px Arial Black";
            for(let i = 0; i < 36; i++) {
                [80,335].forEach(function (y) {ctx.fillText('= ', (i * 25) + 54, y);});
                [44,935].forEach(function (x) {ctx.fillText('+', x, (i * 7) + 88)})
            }

            ctx.filter = 'blur(5px)';
            for(let i = 0; i < 60; i++) {
                ctx.fillRect(this.x,this.y + (15 * i) + this.timer - 200,this.width,5);
            }
            ctx.filter = 'none';

            ctx.globalAlpha = 1;

        };
        this.onTick = function () {
            this.timer += 2;
            if(this.timer === 60) this.timer = 0;
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
            ctx.fillRect(this.width / this.x - 10, this.height / this.y - 10, this.width, this.height);
            ctx.fillStyle = 'salmon';
            ctx.beginPath();
            ctx.moveTo(-(this.width / 2), this.height / 2);
            ctx.lineTo(-(this.width / 2), -(this.height / 2));
            ctx.lineTo(this.width / 2, 0);
            ctx.fill();
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
            for (var i =0; i < 10; i++) {
                socket.emit('fire-projectile', { x : this.x, y: this.y, rotationDegrees : this.rotationDegrees});
            }
        };
        this.onTick = function (delta) {
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



window.addEventListener("load", function () {

    socket = io({upgrade: false, transports: ["websocket"]});

    player = new Player(10, 10);
    background = new Background();

    addEntity(player);
    addEntity(background);

    addEntity(new Button(300,400, 'Connect', function () {
        screen = 1;
    }));

    addEntity(new Button(300,440, 'Our Creators'));
    addEntity(new Button(300,480, 'Internal Documentation'));

    forObj({
        'rooms-available': function (response) {
            roomsAvailable = response;
        },
        'joined-room': function (server_player) {
            player.nonce = server_player.nonce;
            screen = 1;
        },
        'enemy-joined': function (enemy) {
            addEntity(new Enemy(enemy.x, enemy.y, enemy.nonce))
        },
        'enemy-left': function (enemy) {
        },
        'update-rooms': function (_rooms) {
            rooms = _rooms;
        },
        'update-chosen-room': function (room) {
            room.players.forEach(function (server_player) {

                if (server_player.nonce !== player.nonce) {
                    var cached_player = entities['enemy-' + server_player.nonce];

                    if (cached_player) {
                        cached_player.x = server_player.x;
                        cached_player.y = server_player.y;
                        cached_player.rotationDegrees = server_player.rotationDegrees;
                    } else {
                        addEntity(new Enemy(server_player.x, server_player.y), 'enemy-' + server_player.nonce);
                    }
                }

                socket.emit('update-player', player);

            });
            room.projectiles.forEach(function (server_projectile) {

                var cached_projectile = entities['projectile-' + server_projectile.nonce];
                if (cached_projectile) {
                    cached_projectile.x = server_projectile.x;
                    cached_projectile.y = server_projectile.y;
                    cached_projectile.rotationDegrees = server_projectile.rotationDegrees;
                    cached_projectile.wobble = server_projectile.wobble;
                    cached_projectile.color = server_projectile.color;
                    cached_projectile.wobbleRotation = server_projectile.wobbleRotation;
                } else {
                    addEntity(new Projectile(server_projectile.nonce, server_projectile.x, server_projectile.y), 'projectile-' + server_projectile.nonce)
                }
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
        ctx.font = "30px Arial";
        ctx.fillText("Entities on screen: " + Object.keys(entities).length, 10, 50);
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