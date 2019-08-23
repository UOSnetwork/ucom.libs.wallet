"use strict";
const ecc = require('eosjs-ecc');
class EosCryptoService {
    static getKeyPartsFromParentPrivateKey(parentPrivateKey) {
        const privateKey = ecc.seedPrivate(parentPrivateKey);
        const publicKey = ecc.privateToPublic(privateKey);
        return {
            privateKey,
            publicKey,
        };
    }
}
module.exports = EosCryptoService;
