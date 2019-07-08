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
    const actionName    = SmartContractsActionsDictionary.setProfile();
    const smartContract = SmartContractsDictionary.uosAccountInfo();

    const data = {
      acc:          accountName,
      profile_json: JSON.stringify(profileJsonObject),
    };

    const actions = TransactionsBuilder.getSingleUserAction(
      accountName,
      smartContract,
      actionName,
      data,
      permission,
    );

    return EosClient.getSignedTransaction(privateKey, [actions]);
  }
}

export = ContentTransactionsCommonFactory;
