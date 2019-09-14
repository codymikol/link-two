import Projectile from '../Projectile'

export default class PistolProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 1, 8, 9, 10,  4 * 1000, 5);
    }
}
