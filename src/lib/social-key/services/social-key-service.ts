import { IBlockchainAction } from '../../common/interfaces/common-interfaces';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

class SocialKeyService {
  public static getSocialPermissionForSocialActions(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): IBlockchainAction {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
  }

  public static getSocialPermissionForProfileUpdating(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): IBlockchainAction {
    const smartContract = SmartContractsDictionary.uosAccountInfo();
    const actionName    = SmartContractsActionsDictionary.setProfile();

    return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
  }

  public static getSocialPermissionForEmissionClaim(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): IBlockchainAction {
    const smartContract = SmartContractsDictionary.uosCalcs();
    const actionName    = SmartContractsActionsDictionary.withdrawal();

    return SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
  }

  public static getBindSocialKeyAction(accountName: string, publicSocialKey: string): IBlockchainAction {
    return {
      account: SmartContractsDictionary.eosIo(),
      name: SmartContractsActionsDictionary.updateAuth(),
      authorization: TransactionsBuilder.getSingleUserAuthorization(accountName, PermissionsDictionary.active()),
      data: {
        account: accountName,
        permission: PermissionsDictionary.social(),
        parent: PermissionsDictionary.active(),
        auth: {
          threshold : 1,
          keys : [
            {
              key : publicSocialKey,
              weight : 1,
            },
          ],
          accounts: [],
          waits: [],
        },
      },
    };
  }

  private static getSocialPermissionsForAction(
    accountFrom: string,
    smartContract: string,
    actionName: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): IBlockchainAction {
    const targetPermission    = PermissionsDictionary.social();
    const authorization       = TransactionsBuilder.getSingleUserAuthorization(accountFrom, actorPermission);

    return {
      account:  SmartContractsDictionary.eosIo(),
      name:     SmartContractsActionsDictionary.linkAuth(),
      authorization,
      data: {
        account:      accountFrom,
        code:         smartContract,
        type:         actionName,
        requirement:  targetPermission,
      },
    };
  }
}

export = SocialKeyService;
