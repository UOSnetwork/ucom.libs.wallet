"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
const SocialTransactionsCommonFactory = require("../services/social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
class SocialActionsApi {
    static getFollowAccountAction(accountFrom, accountTo, permission) {
        const interactionName = InteractionsDictionary.followToAccount();
        const targetBlockchainIdKey = 'account_to';
        const content = '';
        const metaData = {
            account_from: accountFrom,
            [targetBlockchainIdKey]: accountTo,
        };
        const smartContract = SmartContractsDictionary.uosActivity();
        const actionName = SmartContractsActionsDictionary.socialAction();
        const actionData = SocialTransactionsCommonFactory.getActionData(accountFrom, interactionName, metaData, content);
        return TransactionsBuilder.getSingleUserAction(accountFrom, smartContract, actionName, actionData, permission);
    }
}
exports.SocialActionsApi = SocialActionsApi;
