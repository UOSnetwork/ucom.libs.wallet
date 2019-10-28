"use strict";
const ContentHelper = require("../service/content-helper");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const ContentIdGenerator = require("../service/content-id-generator");
const CommonContentService = require("../service/common-content-service");
class ContentCommentsActionsApi {
    static getCreateCommentFromOrganizationAction(accountName, organizationBlockchainId, parentBlockchainId, givenContent, isReply) {
        const interactionName = InteractionsDictionary.createCommentFromOrganization();
        const commentBlockchainId = ContentIdGenerator.getForComment();
        const isNew = true;
        const { entityNameFor, metaData } = this.getEntityNameForAndMetaData(parentBlockchainId, isReply);
        const action = CommonContentService.getSingleSocialContentActionFromOrganization(accountName, organizationBlockchainId, givenContent, commentBlockchainId, isNew, entityNameFor, interactionName, parentBlockchainId, metaData);
        return {
            action,
            blockchain_id: commentBlockchainId,
        };
    }
    static getUpdateCommentFromOrganizationAction(accountName, organizationBlockchainId, parentBlockchainId, givenContent, isReply, commentBlockchainId) {
        const interactionName = InteractionsDictionary.updateCommentFromOrganization();
        const isNew = false;
        const { entityNameFor, metaData } = this.getEntityNameForAndMetaData(parentBlockchainId, isReply);
        return CommonContentService.getSingleSocialContentActionFromOrganization(accountName, organizationBlockchainId, givenContent, commentBlockchainId, isNew, entityNameFor, interactionName, parentBlockchainId, metaData);
    }
    static getEntityNameForAndMetaData(parentBlockchainId, isReply) {
        return {
            entityNameFor: ContentHelper.getCommentParentEntityName(isReply),
            metaData: {
                parent_content_id: parentBlockchainId,
            },
        };
    }
}
module.exports = ContentCommentsActionsApi;
