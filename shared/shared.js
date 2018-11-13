"use strict";

//TODO: Clean up this random shit...

function forObj(obj, fn) {
    Object.keys(obj).forEach(function (key) {
        fn(obj[key], key);
    })
}

function copyProps(src, dest) {
    Object.keys(src).forEach((key) => dest[key] = src[key]);
}

let abs = Math.abs;
let wallNonce = 0;
const map_count = 8;
const tick_rate = 25;
const max_health = 50;
let serverTime = 0;

const environmentMap = [];

function asCentered(e) {
    return {x: e.width / 2 + e.x, y: e.height / 2 + e.y, height: e.height, width: e.width}
}

function entitiesCollide(a, b) {
    return (abs(a.x - b.x) * 2 < (a.width + b.width)) && (abs(a.y - b.y) * 2 < (a.height + b.height));
}

function randomIntFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}

function newGunWithNonce(nonce, type, args) {
    let theGun = newGun(type, args);
    theGun.nonce = nonce;
    return theGun;
}

function newGun(type, args) {
    switch (type) {
        case 'GroundPistol' :
            return new GroundPistol(...args);
        case 'GroundShotgun':
            return new GroundShotgun(...args);
        case 'GroundMachineGun':
            return new GroundMachineGun(...args);
        case 'GroundSmg':
            return new GroundSmg(...args);
    }
}


