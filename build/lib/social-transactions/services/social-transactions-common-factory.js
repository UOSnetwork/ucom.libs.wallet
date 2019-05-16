"use strict";
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const EosClient = require("../../common/client/eos-client");
class SocialTransactionsCommonFactory {
    static async getSignedTransaction(accountName, privateKey, interactionName, actionJsonData, permission) {
        const actionName = SmartContractsActionsDictionary.socialAction();
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionJson = {
            interaction: interactionName,
            data: actionJsonData,
        };
        const data = {
            acc: accountName,
            action_json: JSON.stringify(actionJson),
        };
        const actions = TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data, permission);
        return EosClient.getSignedTransaction(privateKey, [actions]);
    }
}
module.exports = SocialTransactionsCommonFactory;
