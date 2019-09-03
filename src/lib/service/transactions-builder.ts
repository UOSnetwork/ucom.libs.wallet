import { IStringToAny } from '../common/interfaces/common-interfaces';

import PermissionsDictionary = require('../dictionary/permissions-dictionary');

class TransactionsBuilder {
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

  public static getSingleUserAuthorization(actorAccountName: string, permission: string) {
    return [{
      permission,
      actor: actorAccountName,
    }];
  }
}

export = TransactionsBuilder;
