import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import EosClient = require('../../common/client/eos-client');

class SocialTransactionsCommonFactory {
  public static async getSignedTransaction(
    accountName: string,
    privateKey: string,
    interactionName: string,
    metaData: any,
    content: any,
    permission: string,
  ) {
    const actionName    = SmartContractsActionsDictionary.socialAction();
    const smartContract = SmartContractsDictionary.uosActivity();

    const data = {
      acc: accountName,
      action_json: JSON.stringify({
        interaction:  interactionName,
        data:         metaData,
      }),
      action_data: content === '' ? '' : JSON.stringify(content),
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

export = SocialTransactionsCommonFactory;
