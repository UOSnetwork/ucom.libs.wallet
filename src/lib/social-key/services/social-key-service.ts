import { IStringToAny } from '../../common/interfaces/common-interfaces';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

class SocialKeyService {
  public static getSocialPermissionForSocialActions(accountFrom: string): IStringToAny {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
  }

  public static getSocialPermissionForProfileUpdating(accountFrom: string): IStringToAny {
    const smartContract = SmartContractsDictionary.uosAccountInfo();
    const actionName    = SmartContractsActionsDictionary.setProfile();

    return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
  }

  public static getSocialPermissionForEmissionClaim(accountFrom: string): IStringToAny {
    const smartContract = SmartContractsDictionary.uosCalcs();
    const actionName    = SmartContractsActionsDictionary.withdrawal();

    return SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
  }

  public static getBindSocialKeyAction(accountName: string, publicSocialKey: string): IStringToAny {
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
  ): IStringToAny {
    const parentPermission    = PermissionsDictionary.active();
    const targetPermission    = PermissionsDictionary.social();
    const authorization       = TransactionsBuilder.getSingleUserAuthorization(accountFrom, parentPermission);

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
