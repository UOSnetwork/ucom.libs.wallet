import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

class SocialKeyService {
  public static addSocialKeyPermissionAction(accountFrom: string) {
    return {
      account:  SmartContractsDictionary.eosIo(),
      name:     SmartContractsActionsDictionary.linkAuth(),
      authorization: TransactionsBuilder.getSingleUserAuthorization(accountFrom, PermissionsDictionary.active()),
      data: {
        account: accountFrom,
        code: SmartContractsDictionary.uosActivity(),
        type: SmartContractsActionsDictionary.socialAction(),
        requirement: PermissionsDictionary.social(),
      },
    };
  }

  public static bindSocialKeyAction(accountName: string, publicSocialKey: string) {
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
    accountFrom: string,
    smartContract: string,
    actionName: string,
  ) {
    const parentPermission    = PermissionsDictionary.active();
    const targetPermission    = PermissionsDictionary.social();
    const authorization = TransactionsBuilder.getSingleUserAuthorization(accountFrom, parentPermission);

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
