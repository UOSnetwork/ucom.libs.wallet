"use strict";
const ucom_libs_common_1 = require("ucom.libs.common");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
const ContentHelper = require("../service/content-helper");
const ContentIdGenerator = require("../service/content-id-generator");
class ContentPublicationsActionsApi {
    static getProcessedContentForOrganization(accountName, givenContent, organizationBlockchainId, givenContentId = null) {
        const dateTime = givenContentId ? ContentHelper.getDateTimeFields(false, true)
            : ContentHelper.getDateTimeFields(true, true);
        const processedContent = Object.assign(Object.assign(Object.assign({}, givenContent), dateTime), { organization_blockchain_id: organizationBlockchainId });
        const contentId = givenContentId || ContentIdGenerator.getForMediaPost();
        const content = ContentHelper.getContentWithExtraFields(processedContent, contentId, ucom_libs_common_1.EntityNames.ORGANIZATIONS, organizationBlockchainId, accountName);
        const extraMetaData = { organization_id_from: organizationBlockchainId };
        const metaData = ContentHelper.getMetadata(accountName, contentId, extraMetaData);
        return {
            content,
            metaData,
        };
    }
    static getCreatePublicationFromOrganizationAction(accountName, orgBlockchainId, givenContent) {
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        return this.getSingleSocialUserActionFromOrganization(accountName, orgBlockchainId, givenContent, interactionName);
    }
    static getUpdatePublicationFromOrganizationAction(accountName, organizationsBlockchainId, givenContent, publicationBlockchainId) {
        const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
        return this.getSingleSocialUserActionFromOrganization(accountName, organizationsBlockchainId, givenContent, interactionName, publicationBlockchainId);
    }
    static getSingleSocialUserActionFromOrganization(accountName, organizationBlockchainId, givenContent, interactionName, givenContentId = null) {
        const { content, metaData } = this.getProcessedContentForOrganization(accountName, givenContent, organizationBlockchainId, givenContentId);
        const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);
        return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
    }
}
module.exports = ContentPublicationsActionsApi;
