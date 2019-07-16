"use strict";
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const EosClient = require("../../common/client/eos-client");
class SocialTransactionsCommonFactory {
    static async getSignedTransaction(accountName, privateKey, interactionName, metaData, content, permission) {
        const actionName = SmartContractsActionsDictionary.socialAction();
        const smartContract = SmartContractsDictionary.uosActivity();
        const data = {
            acc: accountName,
            action_json: JSON.stringify({
                interaction: interactionName,
                data: metaData,
            }),
            action_data: content === '' ? '' : JSON.stringify(content),
        };
        const actions = TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data, permission);
        return EosClient.getSignedTransaction(privateKey, [actions]);
    }
}
module.exports = SocialTransactionsCommonFactory;
