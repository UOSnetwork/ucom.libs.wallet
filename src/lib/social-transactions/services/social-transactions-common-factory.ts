import { Action } from 'eosjs/dist/eosjs-serialize';

import SmartContractsActionsDictionary = require('../../dictionary/smart-contracts-actions-dictionary');
import TransactionsBuilder = require('../../service/transactions-builder');
import SmartContractsDictionary = require('../../dictionary/smart-contracts-dictionary');
import EosClient = require('../../common/client/eos-client');
import PermissionsDictionary = require('../../dictionary/permissions-dictionary');
import moment = require('moment');

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

    const actionData = this.getActionData(accountName, interactionName, metaData, content);
    return this.getSignedTransactionWithOneAction(accountName, privateKey, permission, smartContract, actionName, actionData);
  }

  public static getNonceAction(accountName: string, permission: string): Action {
    const smartContract = SmartContractsDictionary.uosActivity();
    const actionName    = SmartContractsActionsDictionary.socialAction();

    const nonceData = this.getActionData(accountName, 'nonce', {
      data: moment().utc().format(),
    }, '');

    return TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, nonceData, permission);
  }

  public static async getSignedResendTransaction(
    historicalSenderPrivateKey: string,
    interactionName: string,
    metaData: any,
    content: any,
    timestamp: string,
  ) {
    const historicalSender  = SmartContractsDictionary.historicalSenderAccountName();
    const data = this.getActionData(historicalSender, interactionName, metaData, content, timestamp);

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

  public static getActionMetaData(
    accountFrom: string,
    targetBlockchainIdKey: string,
    targetBlockchainId: string,
  ) {
    return {
      account_from: accountFrom,
      [targetBlockchainIdKey]: targetBlockchainId,
    };
  }

  public static getActionData(
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
    actionData,
  ) {
    const action = TransactionsBuilder.getSingleUserAction(
      accountName,
      smartContract,
      actionName,
      actionData,
      permission,
    );

    return EosClient.getSignedTransaction(privateKey, [action]);
  }
}

export = SocialTransactionsCommonFactory;
