import { Action } from 'eosjs/dist/eosjs-serialize';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');

class ActionsFactory {
  public static addOneUserAccountByUpdateAuthAction(
    actor: string,
    permissionToAct: string,
    assignToAccount: string,
    permissionToAssign: string,
    parentPermission: string,
    threshold: number = 1,
    weight: number = 1,
  ): Action {
    const authorization = TransactionsBuilder.getSingleUserAuthorization(actor, permissionToAct);
    const accounts = [this.getOneAccountPermission(actor, assignToAccount, weight)];

    return {
      account: SmartContractsDictionary.eosIo(),
      name: SmartContractsActionsDictionary.updateAuth(),
      authorization,
      data: {
        account: actor,
        permission: permissionToAssign,
        parent: parentPermission,
        auth: {
          threshold,
          keys: [],
          accounts,
          waits: [],
        },
      },
    };
  }

  private static getOneAccountPermission(
    actor: string, permission: string, weight: number,
  ): { permission: { actor: string, permission: string}, weight: number } {
    return {
      permission: {
        actor,
        permission,
      },
      weight,
    };
  }
}

export = ActionsFactory;
