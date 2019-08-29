import EosClient = require('../../common/client/eos-client');
import EosCryptoService = require('../../common/services/eos-crypto-service');
import BlockchainRegistry = require('../../blockchain-registry');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialKeyService = require('../services/social-key-service');


class SocialKeyApi {
  public static generateSocialKeyFromActivePrivateKey(
    activePrivateKey: string,
  ): { privateKey: string, publicKey: string } {
    return EosCryptoService.getKeyPartsFromParentPrivateKey(activePrivateKey);
  }

  public static async getAccountCurrentSocialKey(accountName: string): Promise<string | null> {
    const state = await BlockchainRegistry.getRawAccountData(accountName);

    for (const permission of state.permissions) {
      if (!permission.perm_name) {
        throw new TypeError(`Malformed permission: ${permission}`);
      }

      if (permission.perm_name !== PermissionsDictionary.social()) {
        continue;
      }

      if (!permission.required_auth
          || !permission.required_auth.keys
          || permission.required_auth.keys.length !== 1
          || !permission.required_auth.keys[0]
          || !permission.required_auth.keys[0].key
      ) {
        throw new TypeError(`Malformed permission: ${permission}`);
      }

      return permission.required_auth.keys[0].key;
    }

    return null;
  }

  public static async bindSocialKeyWithSocialPermissions(
    accountName:      string,
    activePrivateKey: string,
    socialPublicKey:  string,
  ) {
    // #task - simplified check - check only first action of transaction - social key binding
    await this.socialKeyNotExistOrError(accountName);

    const actions = [
      SocialKeyService.bindSocialKeyAction(accountName, socialPublicKey),
      SocialKeyService.addSocialKeyPermissionAction(accountName),
    ];

    return EosClient.sendTransaction(activePrivateKey, actions);
  }

  public static async socialKeyNotExistOrError(accountName: string): Promise<void> {
    const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);

    if (currentSocialKey) {
      throw new TypeError(`A social key already exist: ${currentSocialKey}`);
    }
  }
}

export = SocialKeyApi;
