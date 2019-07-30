"use strict";
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const SocialTransactionsUserToContentFactory = require("../services/social-transactions-user-to-content-factory");
const PERMISSION_ACTIVE = PermissionsDictionary.active();
class ContentInteractionsApi {
    static async getUpvoteContentSignedTransaction(accountNameFrom, privateKey, contentBlockchainId, permission = PERMISSION_ACTIVE) {
        const interactionName = InteractionsDictionary.upvote();
        return SocialTransactionsUserToContentFactory.getUserToContentSignedTransaction(accountNameFrom, privateKey, contentBlockchainId, interactionName, permission);
    }
    static async getDownvoteContentSignedTransaction(accountNameFrom, privateKey, contentBlockchainId, permission = PERMISSION_ACTIVE) {
        const interactionName = InteractionsDictionary.downvote();
        return SocialTransactionsUserToContentFactory.getUserToContentSignedTransaction(accountNameFrom, privateKey, contentBlockchainId, interactionName, permission);
    }
}
module.exports = ContentInteractionsApi;
