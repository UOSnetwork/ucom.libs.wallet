"use strict";
const SocialTransactionsCommonFactory = require("./social-transactions-common-factory");
class SocialTransactionsUserToUserFactory {
    static async getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission) {
        const actionJsonData = {
            account_from: accountNameFrom,
            account_to: accountNameTo,
        };
        return SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, actionJsonData, permission);
    }
}
module.exports = SocialTransactionsUserToUserFactory;
