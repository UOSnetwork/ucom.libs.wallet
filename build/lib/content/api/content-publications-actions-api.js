"use strict";
const ucom_libs_common_1 = require("ucom.libs.common");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const ContentIdGenerator = require("../service/content-id-generator");
const CommonContentService = require("../service/common-content-service");
const entityNameFor = ucom_libs_common_1.EntityNames.ORGANIZATIONS;
class ContentPublicationsActionsApi {
    static getCreatePublicationFromOrganizationAction(accountName, organizationBlockchainId, givenContent) {
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        const publicationBlockchainId = ContentIdGenerator.getForMediaPost();
        const isNew = true;
        const action = CommonContentService.getSingleSocialContentActionFromOrganization(accountName, organizationBlockchainId, givenContent, publicationBlockchainId, isNew, entityNameFor, interactionName, organizationBlockchainId);
        return {
            action,
            blockchain_id: publicationBlockchainId,
        };
    }
    static getUpdatePublicationFromOrganizationAction(accountName, organizationBlockchainId, givenContent, publicationBlockchainId) {
        const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
        const isNew = false;
        return CommonContentService.getSingleSocialContentActionFromOrganization(accountName, organizationBlockchainId, givenContent, publicationBlockchainId, isNew, entityNameFor, interactionName, organizationBlockchainId);
    }
}
module.exports = ContentPublicationsActionsApi;
