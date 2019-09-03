"use strict";
const SmartContractsDictionary = require("../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../dictionary/smart-contracts-actions-dictionary");
const TransactionBuilder = require("./transactions-builder");
class ActionsService {
    static getVoteForCalculators(accountNameFrom, nodeTitles, proxy = '', permission) {
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.voteForCalculators();
        const data = {
            proxy,
            voter: accountNameFrom,
            calculators: nodeTitles,
        };
        return TransactionBuilder.getSingleUserAction(accountNameFrom, smartContract, actionName, data, permission);
    }
}
module.exports = ActionsService;
