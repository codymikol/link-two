let socket,
    maxFPS = 60,
    lastFrameTimeMs = 0,
    screen = 3,
    entityNonce = 0,
    mousePos = {},
    player,
    keyDown = {},
    entities = {},
    roundStats = [],
    environmentKeys = [],
    map = {},
    joinedRoom,
    a = document.getElementById('a'),
    ctx = a.getContext('2d');

a.width = window.innerWidth;
a.height = window.innerHeight;

function resetCTX() {
    ctx.globalAlpha = 1;
    ctx.font = '30px Arial Black';
    ctx.textAlign = 'start';
    ctx.fillStyle = 'black';
}

function text(text, x, y, color = '#208C30', fontSize = 30, alpha = 1, align = 'start') {
    ctx.globalAlpha = 0.6;
    ctx.font = fontSize + 'px Arial Black';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    resetCTX();
}

function square(x, y, width, height, color = 'red', alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    resetCTX();
}

function mouseInBounds(x, y, height, width) {
    return mousePos.x > x && mousePos.x < x + width && mousePos.y > y && mousePos.y < y + height;
}

function entitiesCall(method, arg) {
    forObj(entities, (entity) => entity[method](arg))
}

function getEnemies() {
    return Object.keys(entities).filter(key => key.includes('enemy-')).map(key => entities[key])
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
    constructor(x, y, txt, sideText, onClick) {
        super(a.width / 2 - 200, y, txt, onClick);
        this.sideText = sideText;
        this.render = function () {
            let vm = this;
            square(vm.x, vm.y, vm.width, vm.height, this.hovered ? '#208C80' : '#208C30', 0.6);
            text(vm.text, vm.x+20,vm.y+20,'black',20,0.6);
            if (this.hovered) text('> ' + vm.sideText, vm.x-10,vm.y + (this.height/2) + 7,'#208C80',20,1,'right');
        };
        this.onResize = function () {
            this.x = (a.width / 2) - 200;
        }
    }
}

class FullSize extends Entity {
    constructor(_screen) {
        super(0, 0, window.innerHeight, window.innerWidth, _screen);
        this.timer = 0;
        this.onResize = function () {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
        };
        this.onTick = function () {
            this.timer += 1;
            if (this.timer === 60) this.timer = 0;
        };
    }
}

class Background extends FullSize {
    constructor(screen) {
        super(screen);
        let vm = this;
        vm.render = function () {
            square(0,0,vm.width,vm.height,'black');
            ctx.fillStyle = '#208C30';
            ctx.globalAlpha = 0.05;
            for (let i = 0; i < 1000; i++) {
                [5, 10, 15, 120].forEach((height) => ctx.fillRect(0, 15 * i + vm.timer - 200, vm.width, height))
            }
        };
    }
}

class TitleCard extends FullSize {
    constructor(_screen) {
        super(_screen);
        let vm = this;
        this.render = function () {

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

var debugTool = 455;

class PlayerListGUI extends FullSize {
    constructor(_screen, messageOverride) {
        super(_screen);
        let vm = this;
        this.render = function () {

            let countdown = (joinedRoom) ? joinedRoom.countdown : ' :( ';

            let dots = '   ';
            if (this.timer >= 15) dots = '.  ';
            if (this.timer >= 30) dots = '.. ';
            if (this.timer >= 45) dots = '...';

            let message = (joinedRoom && joinedRoom.countdown)
                ? 'Competitors found, starting game in ' + Math.floor(joinedRoom.countdown / tick_rate)
                : 'Connection is scarce, you must compete for this privilege, awaiting competition' + dots;

            if(messageOverride) message = messageOverride;

            text(message, vm.width / 2, 369, '#208C30', 16, 1, 'center');

            for (let i = 0; i < 36; i++) {
                [410, 520, 630, 740, 850].forEach(function (y) {
                    text('=', (i * 25) + (vm.width / 2) - 455, y);
                });
            }
            for (let i = 0; i < 76; i++) {
                [430, -460].forEach(function (x) {
                    text('+', x + (vm.width / 2), (i * 7) + 320, undefined, 24);
                })
            }

            [410, 520, 630, 740].forEach(function (y) {
                square(vm.width / 2 - 435, y + 3, 80, 80, 'white', 0.2)
            });

            player.render.call({
                x: vm.width / 2 - 395,
                y: 455,
                isDead: false,
                color: 'green',
                rotationDegrees: 0,
                width: 20,
                height: 20
            });

            Object.keys(entities).filter(function (entityKey) {
                return entityKey.includes('enemy-');
            }).forEach(function (enemyKey, index) {
                let enemy = entities[enemyKey];
                enemy.render.call({
                    x: vm.width / 2 - 395,
                    y: 455 + 110 * (index + 1),
                    isDead: false,
                    color: 'red',
                    rotationDegrees: 0,
                    width: 20,
                    height: 20
                });
            });
        }
    }
}

class LobbyTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            let vm = this;
            text(`Competitor: ${player.name}`, vm.width / 2 - 325,  465, undefined, 30);
            getEnemies().forEach((enemy, index) => text(`Competitor: ${enemy.name}`, vm.width / 2 - 325, 465 + 110 * (index + 1), undefined, 30))
        };
    }
}

class StatsTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            let vm = this;

            //TODO: Yeah this could be cleaned up, but I'm so so so so tired......

            let playerStats = roundStats.filter(stat => stat.nonce === player.nonce)[0];

            text(`${player.name} - ${playerStats.totalWins} Points`, vm.width / 2 - 170,  425, undefined, 16);

            text(`Disposition: ${(playerStats.roundWon) ? 'ALIVE' : 'DEAD'}` , vm.width / 2 - 340,  440, undefined, 14);
            text(`Shot Accuracy: ${Math.floor(playerStats.roundHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.roundHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 - 340, 460, undefined, 14);
            text(`Kills: ${playerStats.roundKills}`, vm.width / 2 - 340,  480, undefined, 14);

            text(`Total Kills: ${playerStats.totalKills}` , vm.width / 2 + 100,  440, undefined, 14);
            text(`Total Accuracy: ${Math.floor(playerStats.totalHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.totalHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 + 100, 460, undefined, 14);
            text(`Total Deaths: ${playerStats.roundKills}`, vm.width / 2 + 100,  480, undefined, 14);

            getEnemies().forEach((enemy, index) => {

                let enemyStats = roundStats.filter(stat => stat.nonce === enemy.nonce)[0];

                let yOffset = 110;

                text(`${enemy.name} - ${enemyStats.totalWins} Points`, vm.width / 2 - 170,  425 + yOffset * (index + 1), undefined, 16);

                text(`Disposition: ${(enemyStats.roundWon) ? 'ALIVE' : 'DEAD'}` , vm.width / 2 - 340,  440 + yOffset * (index + 1), undefined, 14);
                text(`Shot Accuracy: ${Math.floor(enemyStats.roundHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.roundHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 - 340, 460 + yOffset * (index + 1), undefined, 14);
                text(`Kills: ${enemyStats.roundKills}`, vm.width / 2 - 340,  480 + yOffset * (index + 1), undefined, 14);

                text(`Total Kills: ${enemyStats.totalKills}` , vm.width / 2 + 100,  440 + yOffset * (index + 1), undefined, 14);
                text(`Total Accuracy: ${Math.floor(enemyStats.totalHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.totalHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 + 100, 460 + yOffset * (index + 1), undefined, 14);
                text(`Total Deaths: ${enemyStats.roundKills}`, vm.width / 2 + 100,  480 + yOffset * (index + 1), undefined, 14);

            })
        };
    }
}

class Player extends Actor {
    constructor(x, y, rotationDegrees, health, height, width) {
        super(x, y, 'green', rotationDegrees, health, height, width);
        this.onMouseMove = function () {
            this.rotationDegrees = Math.atan2(mousePos.y - this.y, mousePos.x - this.x) * 180 / Math.PI;
        };
        this.onAnyClick = function () {
            if (!this.isDead) {
                for (var i = 0; i < 10; i++) {
                    socket.emit('fire-projectile', {x: this.x, y: this.y, rotationDegrees: this.rotationDegrees});
                }
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
                if (!entities[entityKey].blocking) return false;
                return entitiesCollide(entities[entityKey], vm);
            })) {
                this.x = originalX;
                this.y = originalY;
            }
        };
    }
}

class Enemy extends Actor {
    constructor(x, y, rotationDegrees, health, height, width) {
        super(x, y, 'red', rotationDegrees, health, height, width);
    }
}

class Contrail extends Entity {
    constructor(x, y, height, width) {
        super(x, y, height, width, 1);
        this.halflife = 1;
        this.render = function () {
            ctx.globalAlpha = 1 / this.halflife;
            ctx.fillStyle = 'yellow';
            ctx.strokeStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.height * this.halflife / 2, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.globalAlpha = 1;
        };
        this.onTick = function () {
            this.halflife++;
            if (this.halflife === 10) this.destroy();
        }
    }
}

window.addEventListener("load", function () {

    socket = io({upgrade: true, transports: ["websocket"]});

    player = new Player(250, 250);

    //load order for screen 1 - Game Screen
    addEntity(new Background(1));
    addEntity(new Floor(0, 0, 850, 1900));

    addEntity(player);

    //load order for screen 2 - Matchmaking Lobby
    addEntity(new Background(2));
    addEntity(new TitleCard(2));
    addEntity(new PlayerListGUI(2));
    addEntity(new LobbyTextOverlay(2));

    //load order for screen 3 - Title screen
    addEntity(new Background(3));
    addEntity(new TitleCard(3));
    addEntity(new TitleButton(a.width / 2 - 200, 400, 'Connect', 'ssh', () => socket.emit('join')));
    addEntity(new TitleButton((a.width / 2) - 200, 440, 'Our Creators', 'blame'));
    addEntity(new TitleButton(a.width / 2 - 200, 480, 'Internal Documentation', 'man'));

    //load order for screen 4 - Post Round Stats
    addEntity(new Background(4));
    addEntity(new TitleCard(4));
    addEntity(new PlayerListGUI(4, 'Post round stats, the next round will begin shortly'));
    addEntity(new StatsTextOverlay(4));

    forObj({
        'joined-room': function (server_player) {
            player.nonce = server_player.nonce;
            player.name = server_player.name;
            screen = 2;
        },
        'round-start': (environmentEntities) => {
            environmentKeys.forEach((key) => delete entities[key]);
            environmentKeys = [];
            environmentEntities.forEach((entity) =>{
                environmentKeys.push(addEntity(new Wall(entity.nonce, entity.x, entity.y, entity.height, entity.width, 1)).nonce);
            });
            screen = 1
        },
        'round-end': (postRoundStats) => {
            roundStats = postRoundStats;
            screen = 4
        },
        'game-end': () => screen = 5,
        'destroy': (entityKeyOrList) => {
            if (Array.isArray(entityKeyOrList)) entityKeyOrList.forEach((entityKey) => delete entities[entityKey]);
            else delete entities[entityKeyOrList];
        },
       'projectile-collision': function (_collision) {
            _collision.forEach(function (proj) {
                delete entities['projectile-' + proj.nonce];
            })
        },
        'projectile-fire': function (_projectile) {
            let cached_projectile = entities['projectile-' + _projectile.nonce];
            if (cached_projectile) {
                copyProps(_projectile, cached_projectile);
            } else {
                let newProjectile = new ShotgunProjectile(_projectile.nonce, _projectile.x, _projectile.y, _projectile.rotationDegrees, _projectile.fireTime, _projectile.playerNonce);
                copyProps(_projectile, newProjectile);
                addEntity(newProjectile, 'projectile-' + _projectile.nonce)
            }
        },
        'update-chosen-room': function (room) {
            joinedRoom = room;
            serverTime = room.serverTime;
            room.actors.forEach(function (server_player) {
                if (server_player.nonce !== player.nonce) {
                    let cached_player = entities['enemy-' + server_player.nonce];
                    if (cached_player) {
                        copyProps(server_player, cached_player);
                    } else {
                        addEntity(new Enemy(server_player.x, server_player.y), 'enemy-' + server_player.nonce);
                    }
                } else {
                    player.isDead = server_player.isDead;
                    player.health = server_player.health;
                }
            });
            socket.emit('update-player', player);
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