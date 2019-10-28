import { Action } from 'eosjs/dist/eosjs-serialize';

import AuthActionsFactory = require('../../permissions/service/auth-actions-factory');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

export class MultiSignatureActions {
  public static getAuthorPermissionActions(multiSigAccountName: string, authorAccountName: string): Action[] {
    const ownerPermissionAction = AuthActionsFactory.addUserAccountsByUpdateAuthAction(
      multiSigAccountName,
      [authorAccountName],
      PermissionsDictionary.owner(),
      PermissionsDictionary.owner(),
    );

    const activePermissionAction = AuthActionsFactory.addUserAccountsByUpdateAuthAction(
      multiSigAccountName,
      [authorAccountName],
      PermissionsDictionary.active(),
      PermissionsDictionary.owner(),
    );

    return [
      ownerPermissionAction,
      activePermissionAction,
    ];
  }

  public static getSocialPermissionAction(
    actorAccountName: string, accounts: string[], actorPermission: string | null = null,
  ): Action {
    return AuthActionsFactory.addUserAccountsByUpdateAuthAction(
      actorAccountName,
      accounts,
      PermissionsDictionary.social(),
      actorPermission,
    );
  }
}
