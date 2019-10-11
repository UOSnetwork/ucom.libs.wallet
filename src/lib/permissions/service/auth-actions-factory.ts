import { Action } from 'eosjs/dist/eosjs-serialize';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import ConverterHelper = require('../../helpers/converter-helper');

interface IAuthPermissions {
  permission: {
      actor:      string,
      permission: string
    },
  weight: number
}

class AuthActionsFactory {
  public static addUserAccountsByUpdateAuthAction(
    actor: string,
    givenAccounts: string[],
    assignPermission: string,
    actorPermission: string | null = null,
  ): Action {
    const parentPermission = PermissionsDictionary.getParent(assignPermission);
    const weight = 1;
    const threshold = 1;

    const accounts = ConverterHelper.getUniqueAccountNamesSortedByUInt64(givenAccounts);

    const accountsWithPermissions: IAuthPermissions[] = [];
    for (const account of accounts) {
      accountsWithPermissions.push(this.getOneAccountPermission(account, assignPermission, weight));
    }

    const smartContract = SmartContractsDictionary.eosIo();
    const action = SmartContractsActionsDictionary.updateAuth();

    const data = {
      account: actor,
      permission: assignPermission,
      parent: parentPermission,
      auth: {
        threshold,
        accounts: accountsWithPermissions,
        keys: [],
        waits: [],
      },
    };

    return TransactionsBuilder.getSingleUserAction(actor, smartContract, action, data, actorPermission || parentPermission);
  }

  private static getOneAccountPermission(
    actor: string, permission: string, weight: number,
  ): IAuthPermissions {
    return {
      permission: {
        actor,
        permission,
      },
      weight,
    };
  }
}

export = AuthActionsFactory;
