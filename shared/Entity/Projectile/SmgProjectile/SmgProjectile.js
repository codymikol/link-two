import Projectile from '../Projectile'

export default class SmgProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 1, 8, 11, 3, 1000, 1);
    }
}