"use strict";
const ContentHelper = require("./content-helper");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
class CommonContentService {
    static getSingleSocialContentActionFromOrganization(accountName, organizationBlockchainId, givenContent, contentBlockchainId, isNew, entityNameFor, interactionName, entityBlockchainIdFor, givenExtraMetaData = {}) {
        const extraMetaData = Object.assign({ organization_id_from: organizationBlockchainId }, givenExtraMetaData);
        const processedContent = Object.assign(Object.assign(Object.assign({}, givenContent), ContentHelper.getDateTimeFields(isNew, true)), { organization_blockchain_id: organizationBlockchainId });
        const content = ContentHelper.getContentWithExtraFields(processedContent, contentBlockchainId, entityNameFor, entityBlockchainIdFor, accountName);
        const metaData = ContentHelper.getMetadata(accountName, contentBlockchainId, extraMetaData);
        const actionData = SocialTransactionsCommonFactory.getActionData(accountName, interactionName, metaData, content);
        return TransactionsBuilder.getSingleSocialUserAction(accountName, actionData);
    }
}
module.exports = CommonContentService;
