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
    surfaces = [];
    keyDown = {},
    entities = {},
    a = document.getElementById('a'),
    ctx = a.getContext('2d');

a.width = window.innerWidth;
a.height = window.innerHeight;

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
        this.onClick = onClick;
    }
}

class TitleButton extends Button {
    constructor(x, y, text, sideText, onClick) {
        super(x, y, text, onClick);
        this.sideText = sideText;
        this.render = function () {
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.fillStyle = this.hovered ? "#208C80" : "#208C30";
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.stroke();
            ctx.font = "20px Arial Black";
            ctx.fillStyle = "black";
            ctx.fillText(this.text, this.x + 20, this.y + 20);
            ctx.globalAlpha = 1;
            if(this.hovered) {
                ctx.fillStyle = "#208C80";
                ctx.textAlign = 'right';
                ctx.fillText('> ' + this.sideText, this.x - 20, this.y + (this.height / 2) + 7);
                ctx.textAlign = 'start'
            }
        };
        this.onResize = function () {
            this.x = (a.width/2) - 200;
        }
    }
}

class FullSize extends Entity {
    constructor(_screen) {
        super(0,0,window.innerHeight,window.innerWidth, _screen);
        this.onResize = function () {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
        };
        this.onTick = function () {
            this.timer += 1;
            if (this.timer === 60) this.timer = 0;
        };}
}

class Background extends FullSize {
    constructor(screen) {
        super(screen);
        this.timer = 0;
        this.render = function () {

            //Background
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#208C30';
            for (let i = 0; i < 1000; i++) {
                ctx.globalAlpha = 0.05;
                ctx.fillRect(this.x, this.y + (15 * i) + this.timer - 200, this.width, 5);
                ctx.fillRect(this.x, this.y + (15 * i) + this.timer - 200, this.width, 10);
                ctx.fillRect(this.x, this.y + (15 * i) + this.timer - 200, this.width, 15);
                ctx.fillRect(this.x, this.y + (15 * i) + this.timer - 200, this.width, 120);
            }
            ctx.globalAlpha = 1;
        };
    }
}

class TitleCard extends FullSize {
    constructor(_screen){
        super(_screen);
        this.render = function () {

            let vm = this;

            let linkOffset = 280;
            let carrotOffset = 440;

            //Text LINK
            ctx.globalAlpha = 0.6;
            ctx.font = "240px Arial Black";
            ctx.fillStyle = '#083F10';
            if (this.timer <= 30) ctx.fillText(">", (this.width / 2) + 5 - carrotOffset, this.y + 5 + 275);
            ctx.fillText("LINK", (this.width / 2) - 5 - linkOffset, this.y + 5 + 275);
            ctx.fillStyle = '#208C30';
            if (this.timer >= 30) ctx.globalAlpha = 0.2;
            ctx.fillText(">", (this.width / 2) - carrotOffset, this.y + 275);
            if (this.timer >= 30) ctx.globalAlpha = 0.6;
            ctx.fillText("LINK", (this.width / 2) - linkOffset, this.y + 275);

            ctx.font = "24px Arial Black";
            for (let i = 0; i < 36; i++) {
                [80, 335].forEach(function (y) {
                    ctx.fillText('= ', (i * 25) + (vm.width / 2) - 455, y);
                });
                [430, -460].forEach(function (x) {
                    ctx.fillText('+', x + (vm.width / 2), (i * 7) + 88)
                })
            }
            ctx.globalAlpha = 1;
        }
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
            for (var i = 0; i < 10; i++) {
                socket.emit('fire-projectile', {x: this.x, y: this.y, rotationDegrees: this.rotationDegrees});
            }
        };
        this.onTick = function (delta) {

            let vm = this;

            let originalX = this.x;
            let originalY = this.y;

            if (keyDown.w) this.y -= this.velocity * delta;
            if (keyDown.a) this.x -= this.velocity * delta;
            if (keyDown.s) this.y += this.velocity * delta;
            if (keyDown.d) this.x += this.velocity * delta;

            if (Object.keys(entities).some(function (entityKey) {
                if(!entities[entityKey].blocking) return false;
                return entitiesCollideTwo(entities[entityKey], vm);
            })) {
                this.x = originalX;
                this.y = originalY;
            }
        };
    }
}

class Enemy extends Actor {
    constructor(x, y) {
        super(x, y, 'red');
    }
}

class Surface extends Entity {
    constructor(x,y,height,width) {
        super(x,y,height,width,1);
    }
}

class Floor extends Surface {
    constructor(x,y,height,width) {
        super(x,y,height,width);
        this.render = function () {
            ctx.globalAlpha = .5;
            ctx.fillStyle = '#bcb9ad';
            ctx.fillRect(this.x,this.y,this.width,this.height);
            ctx.globalAlpha = 1;
        }
    }
}

class Wall extends Surface {
    constructor(x,y,height,width) {
        super(x,y,height,width);
        this.blocking = true;
        this.render = function () {
            ctx.fillStyle = 'black';
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
}


window.addEventListener("load", function () {

    socket = io({upgrade: false, transports: ["websocket"]});

    player = new Player(250, 250);

    //load order for screen 1
    addEntity(new Background(1));
    addEntity(new Floor(100,100,500,500));
    addEntity(new Wall(100,80,20,500));
    addEntity(new Wall(100,600,20,500));
    addEntity(new Wall(100,100,500,20));
    addEntity(new Wall(580,100,500,20));
    addEntity(player);

    //load order for screen 3
    addEntity(new Background(3));
    addEntity(new TitleCard(3));
    addEntity(new TitleButton(a.width/2 - 200, 400, 'Connect', 'ssh', function () {socket.emit('join', roomsAvailable[0]);}));
    addEntity(new TitleButton((a.width/2) - 200, 440, 'Our Creators', 'blame'));
    addEntity(new TitleButton(a.width/2 - 200, 480, 'Internal Documentation', 'man'));

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

                let cached_projectile = entities['projectile-' + server_projectile.nonce];
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
        entitiesCall('_render');
        ctx.font = "30px Arial";
        ctx.fillStyle = 'black';
        ctx.fillText("Entities on screen: " + Object.keys(entities).length, 10, 50);
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

    onresize = function () {
        a.height = window.innerHeight;
        a.width = window.innerWidth;
        entitiesCall('_resize');
    };

    requestAnimationFrame(mainLoop);

}, false);