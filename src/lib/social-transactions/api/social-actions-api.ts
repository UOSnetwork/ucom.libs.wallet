import { Action } from 'eosjs/dist/eosjs-serialize';

import InteractionsDictionary = require('../../dictionary/interactions-dictionary');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import SocialTransactionsCommonFactory = require('../services/social-transactions-common-factory');
import TransactionsBuilder = require('../../service/transactions-builder');

export class SocialActionsApi {
  public static getFollowAccountAction(accountFrom: string, accountTo: string, permission: string): Action {
    const interactionName = InteractionsDictionary.followToAccount();
    const targetBlockchainIdKey = 'account_to';
    const content = '';
    const metaData = {
      account_from: accountFrom,
      [targetBlockchainIdKey]: accountTo,
    };
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    const actionData = SocialTransactionsCommonFactory.getActionData(accountFrom, interactionName, metaData, content);

    return TransactionsBuilder.getSingleUserAction(
      accountFrom,
      smartContract,
      actionName,
      actionData,
      permission,
    );
  }
}
