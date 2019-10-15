"use strict";
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const TransactionsBuilder = require("../../service/transactions-builder");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const EosClient = require("../../common/client/eos-client");
class ContentTransactionsCommonFactory {
    static async getSendProfileTransaction(accountName, privateKey, profileJsonObject, permission) {
        const action = this.getSetProfileAction(accountName, profileJsonObject, permission);
        return EosClient.getSignedTransaction(privateKey, [action]);
    }
    static getSetProfileAction(accountName, profile, permission) {
        const actionName = SmartContractsActionsDictionary.setProfile();
        const smartContract = SmartContractsDictionary.uosAccountInfo();
        const data = {
            acc: accountName,
            profile_json: JSON.stringify(profile),
        };
        return TransactionsBuilder.getSingleUserAction(accountName, smartContract, actionName, data, permission);
    }
}
module.exports = ContentTransactionsCommonFactory;
