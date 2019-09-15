"use strict";
const EosClient = require("../../common/client/eos-client");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialTransactionsUserToUserFactory = require("../services/social-transactions-user-to-user-factory");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
class SocialApi {
    static async getUpvoteContentSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.upvote();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission);
    }
    static async getTrustUserSignedTransaction(accountFrom, privateKey, accountTo, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.trust();
        const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(accountFrom, accountTo, interactionName, permission);
        return EosClient.getSignedTransaction(privateKey, [trustAction]);
    }
    static async getTrustUserWithAutoUpdateSignedTransaction(accountFrom, privateKey, accountTo, permission) {
        const interaction = InteractionsDictionary.trust();
        return SocialTransactionsUserToUserFactory.getTrustUntrustUserWithAutoUpdateSignedTransaction(accountFrom, privateKey, accountTo, interaction, permission);
    }
    static async getUntrustUserWithAutoUpdateSignedTransaction(accountFrom, privateKey, accountTo, permission) {
        const interaction = InteractionsDictionary.untrust();
        return SocialTransactionsUserToUserFactory.getTrustUntrustUserWithAutoUpdateSignedTransaction(accountFrom, privateKey, accountTo, interaction, permission);
    }
    static async getUntrustUserSignedTransaction(accountFrom, privateKey, accountTo, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.untrust();
        const trustAction = SocialTransactionsUserToUserFactory.getSingleSocialAction(accountFrom, accountTo, interactionName, permission);
        return EosClient.getSignedTransaction(privateKey, [trustAction]);
    }
    static async getFollowAccountSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.followToAccount();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission);
    }
    static async getUnfollowAccountSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.unfollowToAccount();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission);
    }
    static async getFollowOrganizationSignedTransaction(accountNameFrom, privateKey, organizationId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.followToOrganization();
        return SocialTransactionsUserToUserFactory.getUserToOrganizationSignedTransaction(accountNameFrom, privateKey, organizationId, interactionName, permission);
    }
    static async getUnfollowOrganizationSignedTransaction(accountNameFrom, privateKey, organizationId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.unfollowToOrganization();
        return SocialTransactionsUserToUserFactory.getUserToOrganizationSignedTransaction(accountNameFrom, privateKey, organizationId, interactionName, permission);
    }
    static async getReferralFromUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.referral();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, interactionName, permission);
    }
    static async getReferralFromUserSignedTransactionAsJson(accountNameReferrer, privateKey, accountNameSource, permission = PermissionsDictionary.active()) {
        const signed = await SocialApi.getReferralFromUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, permission);
        return SocialApi.signedTransactionToString(signed);
    }
    static async getTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo, permission = PermissionsDictionary.active()) {
        const signed = await SocialApi.getTrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission);
        return SocialApi.signedTransactionToString(signed);
    }
    static async getUnTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo, permission = PermissionsDictionary.active()) {
        const signed = await SocialApi.getUntrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission);
        return SocialApi.signedTransactionToString(signed);
    }
    static signedTransactionToString(signed) {
        return JSON.stringify(signed);
    }
    static async pushSignedTransactionJson(signedTransactionJson) {
        const signedParsed = SocialApi.parseSignedTransactionJson(signedTransactionJson);
        return EosClient.pushTransaction(signedParsed);
    }
    /**
     *
     * @param {string} signedTransactionJson
     * @returns {any}
     */
    static parseSignedTransactionJson(signedTransactionJson) {
        const signedParsed = JSON.parse(signedTransactionJson);
        signedParsed.serializedTransaction = Uint8Array.from(Object.values(signedParsed.serializedTransaction));
        return signedParsed;
    }
}
module.exports = SocialApi;
