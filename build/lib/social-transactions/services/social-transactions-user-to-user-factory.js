"use strict";
const SocialTransactionsCommonFactory = require("./social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
const AutoUpdatePostService = require("../../content/service/auto-update-post-service");
const EosClient = require("../../common/client/eos-client");
class SocialTransactionsUserToUserFactory {
    static async getTrustUntrustUserWithAutoUpdateSignedTransaction(accountFrom, privateKey, accountTo, interaction, permission) {
        const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(accountFrom, accountTo, interaction, permission);
        const autoUpdateProps = AutoUpdatePostService.getAutoUpdateAction(accountFrom, permission);
        const signedTransaction = await EosClient.getSignedTransaction(privateKey, [trustAction, autoUpdateProps.action]);
        return {
            blockchain_id: autoUpdateProps.blockchain_id,
            signed_transaction: signedTransaction,
        };
    }
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
    static getSingleSocialAction(accountFrom, accountTo, interactionName, permission) {
        const actionData = this.getActionDataWithMetaData(accountFrom, accountTo, interactionName);
        return TransactionsBuilder.getSingleSocialUserAction(accountFrom, actionData, permission);
    }
    static getActionDataWithMetaData(accountFrom, accountTo, interactionName) {
        const targetBlockchainIdKey = 'account_to';
        const content = '';
        const actionMetaData = SocialTransactionsCommonFactory.getActionMetaData(accountFrom, targetBlockchainIdKey, accountTo);
        return SocialTransactionsCommonFactory.getActionData(accountFrom, interactionName, actionMetaData, content);
    }
}
module.exports = SocialTransactionsUserToUserFactory;
