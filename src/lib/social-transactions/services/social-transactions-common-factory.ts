import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import EosClient = require('../../common/client/eos-client');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');

class SocialTransactionsCommonFactory {
  public static async getSignedTransaction(
    accountName: string,
    privateKey: string,
    interactionName: string,
    metaData: any,
    content: any,
    permission: string,
  ) {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    const data = this.getData(accountName, interactionName, metaData, content);
    return this.getSignedTransactionWithOneAction(accountName, privateKey, permission, smartContract, actionName, data);
  }

  public static async getSignedResendTransaction(
    historicalSenderPrivateKey: string,
    interactionName: string,
    metaData: any,
    content: any,
    timestamp: string,
  ) {
    const historicalSender  = SmartContractsDictionary.historicalSenderAccountName();
    const data = this.getData(historicalSender, interactionName, metaData, content, timestamp);

    const smartContract     = SmartContractsDictionary.uosActivity();
    const actionName        = SmartContractsActionsDictionary.historicalSocialAction();

    return this.getSignedTransactionWithOneAction(
      historicalSender,
      historicalSenderPrivateKey,
      PermissionsDictionary.active(),
      smartContract,
      actionName,
      data,
    );
  }

  private static getData(
    accountName: string,
    interactionName: string,
    metaData: any,
    content: any,
    timestamp: string | null = null,
  ) {
    const data: any = {
      acc: accountName,
      action_json: JSON.stringify({
        interaction:  interactionName,
        data:         metaData,
      }),
      action_data: content === '' ? '' : JSON.stringify(content),
    };

    if (timestamp) {
      data.timestamp = timestamp;
    }

    return data;
  }

  private static getSignedTransactionWithOneAction(
    accountName,
    privateKey,
    permission,
    smartContract,
    actionName,
    data,
  ) {
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
