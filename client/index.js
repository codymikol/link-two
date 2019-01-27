import GameLoopManager from "./GameLoopManager/GameLoopManager";

window.addEventListener("load", function () {

    let gameLoopManager = new GameLoopManager();
    gameLoopManager.init();

    // forObj({
    //     'joined-room': function (server_player) {
    //         player.nonce = server_player.nonce;
    //         player.name = server_player.name;
    //         screen = 2;
    //     },
    //     'round-start': (environmentEntities) => {
    //         environmentKeys.forEach((key) => delete entities[key]);
    //         environmentKeys = [];
    //         environmentEntities.walls.forEach((entity) => {
    //             environmentKeys.push(addEntity(new Wall(entity.nonce, entity.x, entity.y, entity.height, entity.width, 1)).nonce);
    //         });
    //         environmentEntities.actors
    //             .forEach(function (actor) {
    //                 if (actor.nonce === player.nonce) {
    //                     player.x = actor.x;
    //                     player.y = actor.y;
    //                 } else {
    //                     let cached_player = entities['enemy-' + actor.nonce];
    //                     cached_player.x = actor.x;
    //                     cached_player.y = actor.y;
    //                 }
    //                 ;
    //             });
    //         environmentEntities.groundWeapons.forEach(function (weapon) {
    //             let funGun = newGunWithNonce(weapon.nonce, weapon.weaponTag, [weapon.x, weapon.y]);
    //             entities['groundweapon-' + weapon.nonce] = funGun;
    //         });
    //         screen = 1
    //     },
    //     'round-end': (postRoundStats) => {
    //         Object.keys(entities).filter(key => key.includes('groundweapon-')).forEach(key => delete entities[key]);
    //         roundStats = postRoundStats;
    //         screen = 4
    //     },
    //     'game-end': (endStats) => {
    //         gameStats = endStats;
    //         screen = 7;
    //     },
    //     'destroy': (entityKeyOrList) => {
    //         if (Array.isArray(entityKeyOrList)) entityKeyOrList.forEach((entityKey) => delete entities[entityKey]);
    //         else delete entities[entityKeyOrList];
    //     },
    //     'projectile-collision': function (_collision) {
    //         _collision.forEach(function (proj) {
    //             delete entities['projectile-' + proj.nonce];
    //         })
    //     },
    //     'projectile-fire': function (_projectileList) {
    //         _projectileList.forEach(function (_projectile) {
    //             let cached_projectile = entities['projectile-' + _projectile.nonce];
    //             if (cached_projectile) {
    //                 copyProps(_projectile, cached_projectile);
    //             } else {
    //                 let newProjectile = new ShotgunProjectile(_projectile.nonce, _projectile.x, _projectile.y, _projectile.rotationDegrees, _projectile.fireTime, _projectile.playerNonce);
    //                 copyProps(_projectile, newProjectile);
    //                 addEntity(newProjectile, 'projectile-' + _projectile.nonce)
    //             }
    //         });
    //     },
    //     'weapon-pickup': function (_weapon_pickup) {
    //         let weapon = entities['groundweapon-' + _weapon_pickup.nonce];
    //         let actor = _weapon_pickup.playerNonce === player.nonce
    //             ? player : entities['enemy-' + _weapon_pickup.playerNonce];
    //         if (weapon && actor) {
    //             actor.activeWeapon = weapon.weaponTag;
    //         }
    //         delete entities['groundweapon-' + _weapon_pickup.nonce];
    //         entities['groundweapon-' + _weapon_pickup.droppedWeapon.nonce]
    //             = newGunWithNonce(_weapon_pickup.droppedWeapon.nonce, _weapon_pickup.droppedWeapon.weaponTag, [_weapon_pickup.droppedWeapon.x, _weapon_pickup.droppedWeapon.y]);
    //     },
    //     'update-chosen-room': function (room) {
    //         joinedRoom = room;
    //         serverTime = room.serverTime;
    //         room.actors.forEach(function (server_player) {
    //             if (server_player.nonce !== player.nonce) {
    //                 let cached_player = entities['enemy-' + server_player.nonce];
    //                 if (cached_player) {
    //                     copyProps(server_player, cached_player);
    //                 } else {
    //                     addEntity(new Enemy(server_player.x, server_player.y), 'enemy-' + server_player.nonce);
    //                 }
    //             } else {
    //                 player.isDead = server_player.isDead;
    //                 player.health = server_player.health;
    //                 player.activeWeapon = server_player.activeWeapon;
    //                 player.weaponCooldown = server_player.weaponCooldown;
    //             }
    //         });
    //         socket.emit('update-player', player);
    //     }
    // }, function (fn, key) {
    //     socket.on(key, fn)
    // });
    //
    // onclick = function (e) {
    //     entitiesCall('_click');
    //     entitiesCall('_anyclick');
    // };
    //
    // function bindKey(e) {
    //     keyDown[e.key.toLowerCase()] = e.type[3] === 'd';
    // }
    //
    // onkeydown = (e) => {
    //     bindKey(e);
    //     entitiesCall('_keydown', e.key);
    //     entitiesCall('_anykeydown', e.key);
    // };
    // onkeyup = bindKey;
    //
    // onmousedown = () => { mouseDown = true };
    // onmouseup = () => { mouseDown = false };

}, false);
