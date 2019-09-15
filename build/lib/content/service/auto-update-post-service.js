"use strict";
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const ContentIdGenerator = require("./content-id-generator");
const ContentHelper = require("./content-helper");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const TransactionsBuilder = require("../../service/transactions-builder");
class AutoUpdatePostService {
    static getAutoUpdateAction(accountFrom, permission) {
        const interactionName = InteractionsDictionary.createAutoUpdatePostFromAccount();
        const contentId = ContentIdGenerator.getForAutoUpdatePost();
        const content = '';
        const metaData = ContentHelper.getMetadata(accountFrom, contentId);
        const actionData = SocialTransactionsCommonFactory.getActionData(accountFrom, interactionName, metaData, content);
        const action = TransactionsBuilder.getSingleSocialUserAction(accountFrom, actionData, permission);
        return {
            action,
            blockchain_id: contentId,
        };
    }
}
module.exports = AutoUpdatePostService;
