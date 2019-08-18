"use strict";
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const ContentHelper = require("../service/content-helper");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const ContentIdGenerator = require("../service/content-id-generator");
class ContentOrganizationsApi {
    static async signCreateOrganization(accountNameFrom, privateKey, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createOrganization();
        const content = Object.assign({}, givenContent, ContentHelper.getDateTimeFields(true, true));
        return this.signSendOrganizationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName);
    }
    static async signUpdateOrganization(accountNameFrom, privateKey, givenContent, organizationBlockchainId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateOrganization();
        const content = Object.assign({}, givenContent, ContentHelper.getUpdatedAtInsideObject());
        const { signed_transaction } = await this.signSendOrganizationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, organizationBlockchainId);
        return signed_transaction;
    }
    static async signResendOrganizations(authorAccountName, historicalSenderPrivateKey, givenContent, organizationBlockchainId) {
        const interactionName = InteractionsDictionary.createOrganization();
        const content = this.getContentWithExtraFields(givenContent, organizationBlockchainId, authorAccountName);
        ContentHelper.checkCreatedAt(content);
        return SocialTransactionsCommonFactory.getSignedResendTransaction(historicalSenderPrivateKey, interactionName, this.getMetadata(authorAccountName, organizationBlockchainId), content, content.created_at);
    }
    static async signSendOrganizationToBlockchain(authorAccountName, privateKey, permission, givenContent, interactionName, givenOrganizationBlockchainId = null) {
        const organizationBlockchainId = givenOrganizationBlockchainId || ContentIdGenerator.getForOrganization();
        const content = this.getContentWithExtraFields(givenContent, organizationBlockchainId, authorAccountName);
        const signed_transaction = await SocialTransactionsCommonFactory.getSignedTransaction(authorAccountName, privateKey, interactionName, this.getMetadata(authorAccountName, organizationBlockchainId), content, permission);
        return {
            signed_transaction,
            blockchain_id: organizationBlockchainId,
        };
    }
    static getContentWithExtraFields(givenContent, contentId, authorAccountName) {
        const data = {
            blockchain_id: contentId,
            author_account_name: authorAccountName,
        };
        return Object.assign({}, givenContent, data);
    }
    static getMetadata(authorAccountName, organizationBlockchainId) {
        return {
            account_from: authorAccountName,
            organization_id: organizationBlockchainId,
        };
    }
}
module.exports = ContentOrganizationsApi;
