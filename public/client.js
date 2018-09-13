let socket,
    maxFPS = 60,
    lastFrameTimeMs = 0,
    screen = 3,
    entityNonce = 0,
    mouseDown,
    mousePos = {},
    player,
    keyDown = {},
    entities = {},
    roundStats = [],
    gameStats = [],
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
    constructor(x, y, text, onClick, _screen) {
        super(x, y, 30, 400, _screen);
        this.text = text;
        this.onClick = onClick;
    }
}

class TitleButton extends Button {
    constructor(x, y, txt, sideText, onClick, _screen) {
        super(a.width / 2 - 200, y, txt, onClick, _screen);
        this.sideText = sideText;
        this.render = function () {
            let vm = this;
            square(vm.x, vm.y, vm.width, vm.height, this.hovered ? '#208C80' : '#208C30', 0.6);
            text(vm.text, vm.x + 20, vm.y + 20, 'black', 20, 0.6);
            if (this.hovered) text('> ' + vm.sideText, vm.x - 10, vm.y + (this.height / 2) + 7, '#208C80', 20, 1, 'right');
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
        this.cX = this.width / 2;
        this.cY = this.height / 2;
        this.onResize = function () {
            this.height = window.innerHeight;
            this.width = window.innerWidth;
            this.cX = this.width / 2;
            this.cY = this.height / 2;
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
            square(0, 0, vm.width, vm.height, 'black');
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

class CreditsTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            [
                'Cody Mikol|https://github.com/codymikol|grey',
                'John Flynn|https://github.com/Neuman968|purple',
                'Morgan Coleman|https://github.com/KingCole22|blue',
            ].forEach((line, index) => {
                let parts = line.split('|');
                text(parts[0], this.cX, 440 + 110 * index, undefined, 30, 1, 'center');
                text(parts[1], this.cX, 480 + 110 * index, undefined, 25, 1, 'center');
                player.render.call({
                    x: this.cX - 395,
                    y: 455 + ((index) * 110),
                    isDead: false,
                    color: parts[2],
                    rotationDegrees: 0,
                    width: 20,
                    height: 20
                });
            });
        }
    }
}

class InstructionsTextOverlay extends FullSize {
    constructor(_screen) {
        super(_screen);
        this.render = function () {
            text('MOUSE', this.cX - 396, 450, 'black', 15, 1, 'center');
            text('DOWN', this.cX - 396, 470, 'black', 15, 1, 'center');
            text('Fire your held Killing Device', this.cX - 330, 470, undefined, 20, 1, 'start');
            text('W A', this.cX - 396, 560, 'black', 25, 1, 'center');
            text('S D', this.cX - 396, 590, 'black', 25, 1, 'center');
            text('Navigate the Pre-Network Dungeon', this.cX - 330, 570, undefined, 20, 1, 'start');
            text('E', this.cX - 396, 680, 'black', 25, 1, 'center');
            text('Pick up Killing Devices scattered about the Pre Network', this.cX - 330, 680, undefined, 20, 1, 'start');
        }
    }
}

let dY = 440;
let dX = 340;

function getStatusVals(winStatus) {
    switch (winStatus) {
        case 'TIE':
            return {color: 'blue', text: 'LINK TIE'};
        case 'WINNER':
            return {color: 'gold', text: 'VICTORY'};
        default:
            return {color: 'red', text: 'TERMINATED'};
    }
}

class NameCollector extends FullSize {
    constructor(_screen){
        super(_screen);
        this.name ='';
        this.dirty = false;
        this.render = function () {
            let vm = this;
            square(vm.cX - 200, vm.cY - 235, 400, 40, '#208C30', 1);
            square(vm.cX - 195, vm.cY - 230, 390, 30, 'black', 1);
            if(vm.timer < 30)text('>',vm.cX - 190, vm.cY - 205, '#208C30', 24);
            if(!this.dirty)text('Enter Name',vm.cX - 170, vm.cY - 207, '#208C30', 24);
            if(this.dirty)text(this.name,vm.cX - 170, vm.cY - 207, '#208C30', 24);
        };
        this.onAnyKeyDown = function (key) {

            if(this.name.length > 10 && key !== 'Backspace') return;

            if (key === 'Backspace' && this.name !== '') {
                this.name = this.name.substring(0, this.name.length - 1);
            } else {
                if(key.length === 1) {
                    this.dirty = true;
                    this.name += key;
                }
            }

            socket.emit('update-name', this.name)

        };
    }
}

class EndGameTextOverlay extends FullSize {
    constructor(_screen){
        super(_screen);
        this.render = function () {
            let vm = this;

            //TODO: Yeah I copy and pasted baby, gottem!!!

            let playerStats = gameStats.filter(stat => stat.nonce === player.nonce)[0].gameStats;

            let statVals = getStatusVals(playerStats.winStatus);

            text(`${player.name} - ${playerStats.totalWins} Points`, vm.width / 2 - 170, 425, undefined, 16);

            text(`STATUS: ${statVals.text}`, vm.width / 2 - 300, 467, statVals.color, 30);

            text(`Total Kills: ${playerStats.totalKills}`, vm.width / 2 + 100, 440, undefined, 14);
            text(`Total Accuracy: ${Math.floor(playerStats.totalHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.totalHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 + 100, 460, undefined, 14);
            text(`Total Deaths: ${playerStats.totalDeaths}`, vm.width / 2 + 100, 480, undefined, 14);

            getEnemies().forEach((enemy, index) => {

                let enemyStats = gameStats.filter(stat => stat.nonce === enemy.nonce)[0].gameStats;

                let eStatVals = getStatusVals(enemyStats.winStatus);

                let yOffset = 110;

                text(`${enemy.name} - ${enemyStats.totalWins} Points`, vm.width / 2 - 170, 425 + yOffset * (index + 1), undefined, 16);

                text(`STATUS: ${eStatVals.text}`, vm.width / 2 - 300, 467 + yOffset * (index + 1), eStatVals.color, 30);

                text(`Total Kills: ${enemyStats.totalKills}`, vm.width / 2 + 100, 440 + yOffset * (index + 1), undefined, 14);
                text(`Total Accuracy: ${Math.floor(enemyStats.totalHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.totalHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 + 100, 460 + yOffset * (index + 1), undefined, 14);
                text(`Total Deaths: ${enemyStats.roundKills}`, vm.width / 2 + 100, 480 + yOffset * (index + 1), undefined, 14);

            })
        };
    }
}

class PlayerListGUI extends FullSize {
    constructor(_screen, messageOverride, hidePlayer) {
        super(_screen);
        this.hidePlayer = hidePlayer;
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

            if (messageOverride) message = messageOverride;

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

            if(!this.hidePlayer) {
                player.render.call({
                    x: vm.width / 2 - 395,
                    y: 455,
                    isDead: false,
                    color: 'green',
                    rotationDegrees: 0,
                    width: 20,
                    height: 20
                });
            }

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
            text(`Competitor: ${player.name}`, vm.width / 2 - 325, 465, undefined, 30);
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

            text(`${player.name} - ${playerStats.totalWins} Points`, vm.width / 2 - 170, 425, undefined, 16);

            text(`Disposition: ${(playerStats.roundWon) ? 'ALIVE' : 'DEAD'}`, vm.width / 2 - 340, 440, undefined, 14);
            text(`Shot Accuracy: ${Math.floor(playerStats.roundHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.roundHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 - 340, 460, undefined, 14);
            text(`Kills: ${playerStats.roundKills}`, vm.width / 2 - 340, 480, undefined, 14);

            text(`Total Kills: ${playerStats.totalKills}`, vm.width / 2 + 100, 440, undefined, 14);
            text(`Total Accuracy: ${Math.floor(playerStats.totalHits / (playerStats.totalHits + playerStats.totalMisses) * 100) || 0}% ${playerStats.totalHits}/${playerStats.totalHits + playerStats.totalMisses}`, vm.width / 2 + 100, 460, undefined, 14);
            text(`Total Deaths: ${playerStats.roundKills}`, vm.width / 2 + 100, 480, undefined, 14);

            getEnemies().forEach((enemy, index) => {

                let enemyStats = roundStats.filter(stat => stat.nonce === enemy.nonce)[0];

                let yOffset = 110;

                text(`${enemy.name} - ${enemyStats.totalWins} Points`, vm.width / 2 - 170, 425 + yOffset * (index + 1), undefined, 16);

                text(`Disposition: ${(enemyStats.roundWon) ? 'ALIVE' : 'DEAD'}`, vm.width / 2 - 340, 440 + yOffset * (index + 1), undefined, 14);
                text(`Shot Accuracy: ${Math.floor(enemyStats.roundHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.roundHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 - 340, 460 + yOffset * (index + 1), undefined, 14);
                text(`Kills: ${enemyStats.roundKills}`, vm.width / 2 - 340, 480 + yOffset * (index + 1), undefined, 14);

                text(`Total Kills: ${enemyStats.totalKills}`, vm.width / 2 + 100, 440 + yOffset * (index + 1), undefined, 14);
                text(`Total Accuracy: ${Math.floor(enemyStats.totalHits / (enemyStats.totalHits + enemyStats.totalMisses) * 100) || 0}% ${enemyStats.totalHits}/${(enemyStats.totalHits + enemyStats.totalMisses)}`, vm.width / 2 + 100, 460 + yOffset * (index + 1), undefined, 14);
                text(`Total Deaths: ${enemyStats.roundKills}`, vm.width / 2 + 100, 480 + yOffset * (index + 1), undefined, 14);

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

        };
        this.onTick = function (delta) {

            let vm = this;

            let originalX = this.x;
            let originalY = this.y;

            if (keyDown.w) this.y -= this.velocity * delta;
            if (keyDown.a) this.x -= this.velocity * delta;
            if (keyDown.s) this.y += this.velocity * delta;
            if (keyDown.d) this.x += this.velocity * delta;

            if (mouseDown && !this.isDead && this.weaponCooldown === 0) {
                socket.emit('fire-projectile', {x: this.x, y: this.y, rotationDegrees: this.rotationDegrees});
            };

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

// TODO!! We can delete this later but it is very useful ;)
class DebugSquare extends Entity {
    constructor(_screen, texty) {
        super(100, 100, 500, 500, _screen,);

        this.text = texty;
        this.size = 24;
        this.alpha = 1;
        this.velocity = .01;

        let vm = this;

        this.render = function () {
            square(vm.x, vm.y, vm.width, vm.height, 'purple')
        };

        this.getRealX = function () {
            return this.x + this.width / 2;
        };

        this.getRealY = function () {
            return this.y + this.height / 2;
        };

        this.onTick = function (delta) {
            if (keyDown.w) this.y -= this.velocity * delta * 10;
            if (keyDown.a) this.x -= this.velocity * delta * 10;
            if (keyDown.s) this.y += this.velocity * delta * 10;
            if (keyDown.d) this.x += this.velocity * delta * 10;

            if (keyDown.W) this.y -= this.velocity * delta;
            if (keyDown.A) this.x -= this.velocity * delta;
            if (keyDown.S) this.y += this.velocity * delta;
            if (keyDown.D) this.x += this.velocity * delta;


            if (keyDown.p) this.height -= this.velocity * delta;
            if (keyDown.o) this.height += this.velocity * delta;
            if (keyDown.i) this.height = 20;

            if (keyDown.l) this.width -= this.velocity * delta;
            if (keyDown.k) this.width += this.velocity * delta;
            if (keyDown.j) this.width = 20;
            if (keyDown.m) console.log(`[${this.getRealX()},${this.getRealY()},${this.height},${this.width}]`)
            // console.log(`text(${vm.text},${vm.x},${vm.y},\'red\',${vm.size},1`)
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

window.oncontextmenu = function () {
    return false;
};

window.addEventListener("load", function () {

    socket = io({upgrade: true, transports: ["websocket"]});

    player = new Player();

    //load order for screen 1 - Game Screen
    addEntity(new Background(1));
    addEntity(new Floor(550, 420, 790, 1040));

    addEntity(player);

    //load order for screen 2 - Matchmaking Lobby
    addEntity(new Background(2));
    addEntity(new TitleCard(2));
    addEntity(new PlayerListGUI(2));
    addEntity(new LobbyTextOverlay(2));

    //load order for screen 3 - Title screen
    addEntity(new Background(3));
    addEntity(new TitleCard(3));
    addEntity(new NameCollector(3));
    addEntity(new TitleButton(a.width / 2 - 200, 400, 'Connect', 'ssh', () => socket.emit('join'), 3));
    addEntity(new TitleButton((a.width / 2) - 200, 440, 'Our Creators', 'blame', () => screen = 5, 3));
    addEntity(new TitleButton(a.width / 2 - 200, 480, 'Internal Documentation', 'man', () => screen = 6, 3));

    //load order for screen 4 - Post Round Stats
    addEntity(new Background(4));
    addEntity(new TitleCard(4));
    addEntity(new PlayerListGUI(4, 'Post round stats, the next round will begin shortly'));
    addEntity(new StatsTextOverlay(4));

    //load order for screen 5 - Authors
    addEntity(new Background(5));
    addEntity(new TitleCard(5));
    addEntity(new PlayerListGUI(5, 'This hot mess was brought to you by...'));
    addEntity(new CreditsTextOverlay(5));
    addEntity(new TitleButton(a.width / 2 - 200, 770, 'Return', 'CTRL C', () => screen = 3, 5));

    //load order for screen 6 - Instructions
    addEntity(new Background(6));
    addEntity(new TitleCard(6));
    addEntity(new PlayerListGUI(6, 'This terminal has many useful commands for accessing "The Network"', true));
    addEntity(new InstructionsTextOverlay(6));
    addEntity(new TitleButton(a.width / 2 - 200, 770, 'Return', 'exit()', () => screen = 3, 6));

    //load order for screen 7 - End Game Results
    addEntity(new Background(7));
    addEntity(new TitleCard(7));
    addEntity(new PlayerListGUI(7, 'Candidate Evaluation Complete... failures will be DISCONNECTED'));
    addEntity(new EndGameTextOverlay(7));

    forObj({
        'joined-room': function (server_player) {
            player.nonce = server_player.nonce;
            player.name = server_player.name;
            screen = 2;
        },
        'round-start': (environmentEntities) => {
            environmentKeys.forEach((key) => delete entities[key]);
            environmentKeys = [];
            environmentEntities.walls.forEach((entity) => {
                environmentKeys.push(addEntity(new Wall(entity.nonce, entity.x, entity.y, entity.height, entity.width, 1)).nonce);
            });
            environmentEntities.actors
                .forEach(function (actor) {
                    if (actor.nonce === player.nonce) {
                        player.x = actor.x;
                        player.y = actor.y;
                    } else {
                        let cached_player = entities['enemy-' + actor.nonce];
                        cached_player.x = actor.x;
                        cached_player.y = actor.y;
                    }
                    ;
                });
            environmentEntities.groundWeapons.forEach(function (weapon) {
                let funGun = newGunWithNonce(weapon.nonce, weapon.weaponTag, [weapon.x, weapon.y]);
                entities['groundweapon-' + weapon.nonce] = funGun;
            });
            screen = 1
        },
        'round-end': (postRoundStats) => {
            Object.keys(entities).filter(key => key.includes('groundweapon-')).forEach(key => delete entities[key]);
            roundStats = postRoundStats;
            screen = 4
        },
        'game-end': (endStats) => {
            gameStats = endStats;
            screen = 7;
        },
        'destroy': (entityKeyOrList) => {
            if (Array.isArray(entityKeyOrList)) entityKeyOrList.forEach((entityKey) => delete entities[entityKey]);
            else delete entities[entityKeyOrList];
        },
        'projectile-collision': function (_collision) {
            _collision.forEach(function (proj) {
                delete entities['projectile-' + proj.nonce];
            })
        },
        'projectile-fire': function (_projectileList) {
            _projectileList.forEach(function (_projectile) {
                let cached_projectile = entities['projectile-' + _projectile.nonce];
                if (cached_projectile) {
                    copyProps(_projectile, cached_projectile);
                } else {
                    let newProjectile = new ShotgunProjectile(_projectile.nonce, _projectile.x, _projectile.y, _projectile.rotationDegrees, _projectile.fireTime, _projectile.playerNonce);
                    copyProps(_projectile, newProjectile);
                    addEntity(newProjectile, 'projectile-' + _projectile.nonce)
                }
            });
        },
        'weapon-pickup': function (_weapon_pickup) {
            let weapon = entities['groundweapon-' + _weapon_pickup.nonce];
            let actor = _weapon_pickup.playerNonce === player.nonce
                ? player : entities['enemy-' + _weapon_pickup.playerNonce];
            if (weapon && actor) {
                actor.activeWeapon = weapon.weaponTag;
            }
            delete entities['groundweapon-' + _weapon_pickup.nonce];
            entities['groundweapon-' + _weapon_pickup.droppedWeapon.nonce]
                = newGunWithNonce(_weapon_pickup.droppedWeapon.nonce, _weapon_pickup.droppedWeapon.weaponTag, [_weapon_pickup.droppedWeapon.x, _weapon_pickup.droppedWeapon.y]);
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
                    player.activeWeapon = server_player.activeWeapon;
                    player.weaponCooldown = server_player.weaponCooldown;
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

    onkeydown = (e) => {
        bindKey(e);
        entitiesCall('_keydown', e.key);
        entitiesCall('_anykeydown', e.key);
    };
    onkeyup = bindKey;

    onmousedown = () => { mouseDown = true };
    onmouseup = () => { mouseDown = false };

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