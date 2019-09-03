import EosClient = require('../../common/client/eos-client');
import EosCryptoService = require('../../common/services/eos-crypto-service');
import BlockchainRegistry = require('../../blockchain-registry');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import SocialKeyService = require('../services/social-key-service');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');


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

  public static async pushSocialPermissionForProducersVoting(accountFrom: string, activePrivateKey: string) {
    await this.socialKeyExistOrError(accountFrom);

    const smartContract = SmartContractsDictionary.eosIo();
    const actionName    = SmartContractsActionsDictionary.voteProducer();

    const action =  SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);

    return EosClient.sendSingleActionTransaction(activePrivateKey, action);
  }

  public static async pushSocialPermissionForProfileUpdating(accountFrom: string, activePrivateKey: string) {
    await this.socialKeyExistOrError(accountFrom);

    const smartContract = SmartContractsDictionary.uosAccountInfo();
    const actionName    = SmartContractsActionsDictionary.setProfile();

    const action =  SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);

    return EosClient.sendSingleActionTransaction(activePrivateKey, action);
  }

  public static async pushSocialPermissionForEmissionClaim(accountFrom: string, activePrivateKey: string) {
    await this.socialKeyExistOrError(accountFrom);

    const smartContract = SmartContractsDictionary.uosCalcs();
    const actionName    = SmartContractsActionsDictionary.withdrawal();

    const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);

    return EosClient.sendSingleActionTransaction(activePrivateKey, action);
  }

  public static async pushSocialPermissionForCalculatorsVoting(accountFrom: string, activePrivateKey: string) {
    await this.socialKeyExistOrError(accountFrom);

    const smartContract = SmartContractsDictionary.eosIo();
    const actionName    = SmartContractsActionsDictionary.voteForCalculators();

    const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);

    return EosClient.sendSingleActionTransaction(activePrivateKey, action);
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
