"use strict";
const SocialTransactionsCommonFactory = require("./social-transactions-common-factory");
class SocialTransactionsUserToUserFactory {
    static async getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission) {
        const actionJsonData = {
            account_from: accountNameFrom,
            account_to: accountNameTo,
        };
        const content = '';
        return SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, actionJsonData, content, permission);
    }
}
module.exports = SocialTransactionsUserToUserFactory;
