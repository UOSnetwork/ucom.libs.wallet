"use strict";
const SocialTransactionsCommonFactory = require("./social-transactions-common-factory");
class SocialTransactionsUserToUserFactory {
    static async getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission) {
        const targetBlockchainIdKey = 'account_to';
        return this.getUserToTargetBlockchainIdSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, targetBlockchainIdKey, permission);
    }
    static async getUserToOrganizationSignedTransaction(accountNameFrom, privateKey, organizationId, interactionName, permission) {
        const targetBlockchainIdKey = 'organization_id_to';
        return this.getUserToTargetBlockchainIdSignedTransaction(accountNameFrom, privateKey, organizationId, interactionName, targetBlockchainIdKey, permission);
    }
    static async getUserToTargetBlockchainIdSignedTransaction(accountNameFrom, privateKey, targetBlockchainId, interactionName, targetBlockchainIdKey, permission) {
        const actionJsonData = {
            account_from: accountNameFrom,
            [targetBlockchainIdKey]: targetBlockchainId,
        };
        const content = '';
        return SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, actionJsonData, content, permission);
    }
}
module.exports = SocialTransactionsUserToUserFactory;
