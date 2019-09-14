import Projectile from '../Projectile'

export default class MachineGunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 8, 7, 10, 1, 1000, 1);
    }
}