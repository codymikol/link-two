import Projectile from '/shared/Entity/Projectile/Projectile'

export default class ShotgunProjectile extends Projectile {
    constructor(nonce, x, y, rotationDegrees, fireTime, playerNonce) {
        super(nonce, x, y, rotationDegrees, fireTime, playerNonce, 9, 5, 8, 50, 900, 1);
    }
}