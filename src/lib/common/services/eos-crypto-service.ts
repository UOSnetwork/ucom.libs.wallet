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

  public static signValue(value: string, privateKey: string): string {
    // noinspection TypeScriptValidateJSTypes
    return ecc.sign(value, privateKey);
  }
}

export = EosCryptoService;
