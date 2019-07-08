"use strict";
const ContentTransactionsCommonFactory = require("./content-transactions-common-factory");
class ContentTransactionsProfileFactory {
    static async getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission) {
        const actionJsonData = {
            account_from: accountNameFrom,
            account_to: accountNameTo,
        };
        return ContentTransactionsCommonFactory.getSendProfileTransaction(accountNameFrom, privateKey, actionJsonData, permission);
    }
}
module.exports = ContentTransactionsProfileFactory;
