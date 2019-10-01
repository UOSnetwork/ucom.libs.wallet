import { Action } from 'eosjs/dist/eosjs-serialize';

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
      SocialKeyService.getBindSocialKeyAction(accountName, socialPublicKey),

      ...this.getAssignSocialPermissionsActions(accountName),
    ];

    return EosClient.sendTransaction(activePrivateKey, actions);
  }

  public static getAssignSocialPermissionsActions(
    accountName: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): Action[] {
    return [
      SocialKeyService.getSocialPermissionForSocialActions(accountName, actorPermission),
      SocialKeyService.getSocialPermissionForProfileUpdating(accountName, actorPermission),
      SocialKeyService.getSocialPermissionForEmissionClaim(accountName, actorPermission),
    ];
  }

  public static getAssignSocialPermissionForProposeAndApprove(accountFrom: string, privateKey: string, actorPermission: string) {
    const actions: Action[] = [];

    actions.push(
      SocialKeyService.getSocialPermissionsForAction(accountFrom, SmartContractsDictionary.eosIoMultiSignature(), SmartContractsActionsDictionary.proposeMultiSignature(), actorPermission),
    );

    actions.push(
      SocialKeyService.getSocialPermissionsForAction(accountFrom, SmartContractsDictionary.eosIoMultiSignature(), SmartContractsActionsDictionary.approveMultiSignature(), actorPermission),
    );

    return EosClient.sendTransaction(privateKey, actions);
  }

  public static assignSocialPermissionForExecute(accountFrom: string, privateKey: string, actorPermission: string) {
    const action =
      SocialKeyService.getSocialPermissionsForAction(accountFrom, SmartContractsDictionary.eosIoMultiSignature(), SmartContractsActionsDictionary.executeMultiSignature(), actorPermission);

    return EosClient.sendTransaction(privateKey, [action]);
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
