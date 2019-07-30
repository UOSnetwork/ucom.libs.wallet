"use strict";
const SocialTransactionsCommonFactory = require("./social-transactions-common-factory");
class SocialTransactionsUserToContentFactory {
    static async getUserToContentSignedTransaction(accountNameFrom, privateKey, contentBlockchainId, interactionName, permission) {
        const actionJsonData = {
            account_from: accountNameFrom,
            content_id: contentBlockchainId,
        };
        const content = '';
        return SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, actionJsonData, content, permission);
    }
}
module.exports = SocialTransactionsUserToContentFactory;
