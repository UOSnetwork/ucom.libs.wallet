"use strict";
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const EosClient = require("../../common/client/eos-client");
class ContentTransactionsCommonFactory {
    static async getSendProfileTransaction(accountName, privateKey, profileJsonObject, permission) {
        const actionName = SmartContractsActionsDictionary.setProfile();
        const smartContract = SmartContractsDictionary.uosAccountInfo();
        const data = {
            acc: accountName,
            profile_json: JSON.stringify(profileJsonObject),
        };
        const actions = TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data, permission);
        return EosClient.getSignedTransaction(privateKey, [actions]);
    }
}
module.exports = ContentTransactionsCommonFactory;
