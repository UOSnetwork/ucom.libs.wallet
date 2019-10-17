"use strict";
const ContentHelper = require("../service/content-helper");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const ContentIdGenerator = require("../service/content-id-generator");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
class ContentCommentsActionsApi {
    static getCreateCommentFromOrganizationAction(accountName, organizationBlockchainId, parentBlockchainId, givenContent, isReply) {
        const parentEntityName = ContentHelper.getCommentParentEntityName(isReply);
        const interactionName = InteractionsDictionary.createCommentFromOrganization();
        const processedContent = Object.assign(Object.assign({}, givenContent), ContentHelper.getDateTimeFields(true, true));
        const contentId = ContentIdGenerator.getForComment();
        const content = ContentHelper.getContentWithExtraFields(processedContent, contentId, parentEntityName, parentBlockchainId, accountName);
        const extraMetaData = {
            organization_id_from: organizationBlockchainId,
            parent_content_id: parentBlockchainId,
        };
        const metaData = ContentHelper.getMetadata(accountName, contentId, extraMetaData);
        const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);
        return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
    }
}
module.exports = ContentCommentsActionsApi;
