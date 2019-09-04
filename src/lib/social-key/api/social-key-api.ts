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
      SocialKeyService.getBindSocialKeyAction(accountName, socialPublicKey),
      SocialKeyService.getSocialPermissionForSocialActions(accountName),
      SocialKeyService.getSocialPermissionForProfileUpdating(accountName),
      SocialKeyService.getSocialPermissionForEmissionClaim(accountName),
    ];

    return EosClient.sendTransaction(activePrivateKey, actions);
  }

  /**
   * @deprecated
   * @see bindSocialKeyWithSocialPermissions
   */
  public static async bindSocialKeyWithoutEmissionAndProfile(
    accountName:      string,
    activePrivateKey: string,
    socialPublicKey:  string,
  ) {
    // #task - simplified check - check only first action of transaction - social key binding
    await this.socialKeyNotExistOrError(accountName);

    const actions = [
      SocialKeyService.getBindSocialKeyAction(accountName, socialPublicKey),
      SocialKeyService.getSocialPermissionForSocialActions(accountName),
    ];

    return EosClient.sendTransaction(activePrivateKey, actions);
  }

  public static async addSocialPermissionsToEmissionAndProfile(
    accountName:      string,
    activePrivateKey: string,
  ) {
    // #task - simplified check - check only first action of transaction - social key binding
    await this.socialKeyExistOrError(accountName);

    const actions = [
      SocialKeyService.getSocialPermissionForProfileUpdating(accountName),
      SocialKeyService.getSocialPermissionForEmissionClaim(accountName),
    ];

    let result;
    try {
      result = await EosClient.sendTransaction(activePrivateKey, actions);
    } catch (error) {
      if (error.json && error.json.error && error.json.error.name === 'action_validate_exception') {
        // suppress this type of error = permissions already exist

        return null;
      }

      throw error;
    }

    return result;
  }

  public static async socialKeyNotExistOrError(accountName: string): Promise<void> {
    const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);

    if (currentSocialKey) {
      throw new TypeError(`A social key already exist: ${currentSocialKey}`);
    }
  }

  public static async socialKeyExistOrError(accountName: string): Promise<void> {
    const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);

    if (!currentSocialKey) {
      throw new TypeError('A social key must exist before social permission binding');
    }
  }
}

export = SocialKeyApi;
