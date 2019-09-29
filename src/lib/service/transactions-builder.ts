import { IStringToAny } from '../common/interfaces/common-interfaces';

import PermissionsDictionary = require('../dictionary/permissions-dictionary');
import SmartContractsDictionary = require('../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../dictionary/smart-contracts-actions-dictionary');
import { Authorization } from 'eosjs/dist/eosjs-serialize';

class TransactionsBuilder {
  public static getSingleSocialUserAction(
    actorAccountName: string,
    data: IStringToAny,
    permission: string,
  ) {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    return this.getSingleUserAction(
      actorAccountName,
      smartContract,
      actionName,
      data,
      permission,
    );
  }

  public static getSingleUserAction(
    actorAccountName: string,
    smartContractName: string,
    actionName: string,
    data: IStringToAny,
    permission = PermissionsDictionary.active(),
  ) {
    const authorization = this.getSingleUserAuthorization(actorAccountName, permission);

    return {
      account: smartContractName,
      name: actionName,
      authorization,
      data,
    };
  }

  public static getSingleUserAuthorization(
    actorAccountName: string, permission: string,
  ): Authorization[] {
    return [{ permission, actor: actorAccountName }];
  }
}

export = TransactionsBuilder;
