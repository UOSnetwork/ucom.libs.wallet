const ecc = require('eosjs-ecc');

class EosCryptoService {
  public static getKeyPartsFromParentPrivateKey(
    parentPrivateKey: string,
  ): { privateKey: string, publicKey: string } {
    const privateKey = ecc.seedPrivate(parentPrivateKey);
    const publicKey = ecc.privateToPublic(privateKey);

    return {
      privateKey,
      publicKey,
    };
  }
}

export = EosCryptoService;
