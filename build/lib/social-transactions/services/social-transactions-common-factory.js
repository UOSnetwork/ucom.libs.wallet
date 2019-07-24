"use strict";
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const EosClient = require("../../common/client/eos-client");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
class SocialTransactionsCommonFactory {
    static async getSignedTransaction(accountName, privateKey, interactionName, metaData, content, permission) {
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.socialAction();
        const data = this.getData(accountName, interactionName, metaData, content);
        return this.getSignedTransactionWithOneAction(accountName, privateKey, permission, smartContract, actionName, data);
    }
    static async getSignedResendTransaction(historicalSenderPrivateKey, interactionName, metaData, content, timestamp) {
        const historicalSender = SmartContractsDictionary.historicalSenderAccountName();
        const data = this.getData(historicalSender, interactionName, metaData, content, timestamp);
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.historicalSocialAction();
        return this.getSignedTransactionWithOneAction(historicalSender, historicalSenderPrivateKey, PermissionsDictionary.active(), smartContract, actionName, data);
    }
    static getData(accountName, interactionName, metaData, content, timestamp = null) {
        const data = {
            acc: accountName,
            action_json: JSON.stringify({
                interaction: interactionName,
                data: metaData,
            }),
            action_data: content === '' ? '' : JSON.stringify(content),
        };
        if (timestamp) {
            data.timestamp = timestamp;
        }
        return data;
    }
    static getSignedTransactionWithOneAction(accountName, privateKey, permission, smartContract, actionName, data) {
        const actions = TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data, permission);
        return EosClient.getSignedTransaction(privateKey, [actions]);
    }
}
module.exports = SocialTransactionsCommonFactory;
