import { Action } from 'eosjs/dist/eosjs-serialize';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

class SocialKeyService {
  public static getSocialPermissionForSocialActions(account: string, permission: string): Action {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    return this.getSocialPermissionsForAction(account, smartContract, actionName, permission);
  }

  public static getSocialPermissionForProfileUpdating(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): Action {
    const smartContract = SmartContractsDictionary.uosAccountInfo();
    const actionName    = SmartContractsActionsDictionary.setProfile();

    return this.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
  }

  public static getSocialPermissionForEmissionClaim(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): Action {
    const smartContract = SmartContractsDictionary.uosCalcs();
    const actionName    = SmartContractsActionsDictionary.withdrawal();

    return SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName, actorPermission);
  }

  public static getSocialPermissionForProposeApproveAndExecute(
    accountFrom: string,
    actorPermission: string = PermissionsDictionary.active(),
  ): Action[] {
    const set = [
      SmartContractsActionsDictionary.proposeMultiSignature(),
      SmartContractsActionsDictionary.approveMultiSignature(),
      SmartContractsActionsDictionary.executeMultiSignature(),
    ];

    return set.map((action: string) => SocialKeyService.getSocialPermissionsForAction(
      accountFrom, SmartContractsDictionary.eosIoMultiSignature(), action, actorPermission,
    ));
  }

  public static getBindSocialKeyAction(accountName: string, publicSocialKey: string): Action {
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

  public static getSocialPermissionsForAction(
    account: string,
    smartContract: string,
    actionName: string,
    permission: string,
  ): Action {
    const authorization = TransactionsBuilder.getSingleUserAuthorization(account, permission);

    return {
      account:  SmartContractsDictionary.eosIo(),
      name:     SmartContractsActionsDictionary.linkAuth(),
      authorization,
      data: {
        account,
        code:         smartContract,
        type:         actionName,
        requirement:  PermissionsDictionary.social(),
      },
    };
  }
}

export = SocialKeyService;
