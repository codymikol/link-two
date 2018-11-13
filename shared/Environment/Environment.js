export default class Environment {
    constructor(room) {
        this.room = room;
        this.nonce = room.nonce;
        this.projectiles = new Map();
        this.eventQueue = new Map();
        // randomly select a map from the map list. 0 - 7 are valid, change to be hardcoded
        // if there is a specific map you would like to play on.
        let mapIndex = Math.floor(randomIntFromInterval(0,environmentMap.length-1));
        this.walls = this.buildWalls(mapIndex);
        this.assignStartingPositions(mapIndex);
        this.groundWeapons = this.buildGroundWeapons(mapIndex);
    }

    //TODO: This should be nonspecific to entities
    buildWalls(mapIndex) {
        return environmentMap[mapIndex]
            .filter((currentWall) => {
                return currentWall.type === 'Wall';
            }).reduce((col, currentWall) => {
                wallNonce++;
                let newNonce = wallNonce;
                col.set(newNonce, new Wall(newNonce, ...currentWall.args));
                return col;
            }, new Map());
    }
    // build the weapons for a given environment.
    buildGroundWeapons(mapIndex) {
        return environmentMap[mapIndex]
            .filter((currentObj) => {
                return currentObj.type === 'GroundPistol'
                    || currentObj.type === 'GroundShotgun'
                    || currentObj.type === 'GroundMachineGun'
                    || currentObj.type === 'GroundSmg';
            }).reduce((col, currentObj) => {
                wallNonce++;
                let weaponNonce = wallNonce;
                let gun = newGunWithNonce(weaponNonce, currentObj.type, currentObj.args);
                col.set(weaponNonce, gun);
                return col;
            }, new Map());
    }

    // assign starting positions to all actors.
    assignStartingPositions(mapIndex) {
        let startingPosition = environmentMap[mapIndex].filter(function (currentObj) {
            return currentObj.type === 'Starting';
        })[0];

        var positionIndex = 0;
        this.room.actors.forEach(function (actor, index) {
            actor.x = startingPosition.args[positionIndex];
            actor.y = startingPosition.args[positionIndex + 1];
            positionIndex += 2;
        });
    }

    addEventQueue(eventName, val) {
        if (!this.eventQueue.has(eventName)) {
            this.eventQueue.set(eventName, []);
        }
        this.eventQueue.get(eventName).push(val);
    }

    environmentTick() {
        this.projectiles.forEach((projectile, key) => {

            let projectileOwner = this.room.actors.get(projectile.playerNonce);

            projectile.onTick();

            let hitPlayers = this.getPlayerColliding(projectile);
            //TODO: Assume the client knows that wall colisions result in projectile destruction so we can remove this
            // from network calls...
            let wallColliding = this.getWallColliding(projectile);

            let destroyProjectile = hitPlayers.length > 0
                || wallColliding.length > 0
                || Date.now() >= (projectile.fireTime + projectile.halfLife);
            if (hitPlayers.length > 0) projectileOwner.stats.awardHit();
            if (wallColliding.length > 0) projectileOwner.stats.awardMiss();

            if (destroyProjectile) {
                this.addEventQueue("projectile-collision", {nonce: projectile.nonce});
                this.projectiles.delete(key);
            }

            hitPlayers.forEach((player) => {
                player.takeDamage(projectile.damage);
                if (player.isDead) projectileOwner.stats.awardKill();
            })

        });
    }

    addProjectile(projectile) {
        if (projectile && projectile.nonce) {
            this.projectiles.set(projectile.nonce, projectile);
        }
    }

    addWall(wall) {
        if (wall && wall.nonce) {
            this.walls.set(wall.nonce, wall);
        }
    }

    getPlayerColliding(projectile) {
        return Array.from(this.room.actors.values())
            .filter((actor) => !actor.isDead && (actor.nonce !== projectile.playerNonce) && entitiesCollide(actor, projectile));
    }

    getWallColliding(projectile) {
        return Array.from(this.walls.values()).filter((wall) => entitiesCollide(wall, projectile));
    }
}