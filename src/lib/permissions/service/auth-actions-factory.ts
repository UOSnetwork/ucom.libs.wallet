import { Action } from 'eosjs/dist/eosjs-serialize';
import { IAuthAccountPermissions } from '../../account/interfaces/account-data-interfaces';

import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import ConverterHelper = require('../../helpers/converter-helper');

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

    const accountsWithPermissions: IAuthAccountPermissions[] = [];
    for (const account of accounts) {
      // In order not to use a member-owner key for the owner permission active permission is set
      const accountPermission = assignPermission === PermissionsDictionary.owner() ? PermissionsDictionary.active()
        : assignPermission;

      accountsWithPermissions.push(this.getOneAccountPermission(account, accountPermission, weight));
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
  ): IAuthAccountPermissions {
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
