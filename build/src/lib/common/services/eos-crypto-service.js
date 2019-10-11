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
    static signValue(value, privateKey) {
        // noinspection TypeScriptValidateJSTypes
        return ecc.sign(value, privateKey);
    }
}
module.exports = EosCryptoService;
