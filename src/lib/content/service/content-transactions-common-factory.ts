import { Action } from 'eosjs/dist/eosjs-serialize';
import { IStringToAny } from '../../common/interfaces/common-interfaces';

import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import EosClient = require('../../common/client/eos-client');

class ContentTransactionsCommonFactory {
  public static async getSendProfileTransaction(
    accountName: string,
    privateKey: string,
    profileJsonObject: any,
    permission: string,
  ) {
    const action = this.getSetProfileAction(accountName, profileJsonObject, permission);

    return EosClient.getSignedTransaction(privateKey, [action]);
  }

  public static getSetProfileAction(accountName: string, profile: IStringToAny, permission: string): Action {
    const actionName    = SmartContractsActionsDictionary.setProfile();
    const smartContract = SmartContractsDictionary.uosAccountInfo();

    const data = {
      acc:          accountName,
      profile_json: JSON.stringify(profile),
    };

    return TransactionsBuilder.getSingleUserAction(
      accountName,
      smartContract,
      actionName,
      data,
      permission,
    );
  }
}

export = ContentTransactionsCommonFactory;
