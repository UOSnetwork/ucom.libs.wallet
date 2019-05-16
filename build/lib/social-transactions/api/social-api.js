"use strict";
const EosClient = require("../../common/client/eos-client");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialTransactionsUserToUserFactory = require("../services/social-transactions-user-to-user-factory");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const PERMISSION_ACTIVE = PermissionsDictionary.active();
class SocialApi {
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} privateKey
     * @param {string} accountNameTo
     * @param {string} permission
     * @returns {Promise<Object>}
     */
    static async getTrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission = PERMISSION_ACTIVE) {
        const interactionName = InteractionsDictionary.trust();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission);
    }
    static async getUntrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, permission = PERMISSION_ACTIVE) {
        const interactionName = InteractionsDictionary.untrust();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameFrom, privateKey, accountNameTo, interactionName, permission);
    }
    static async getReferralFromUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, permission = PERMISSION_ACTIVE) {
        const interactionName = InteractionsDictionary.referral();
        return SocialTransactionsUserToUserFactory.getUserToUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, interactionName, permission);
    }
    static async getReferralFromUserSignedTransactionAsJson(accountNameReferrer, privateKey, accountNameSource, permission = PERMISSION_ACTIVE) {
        const signed = SocialApi.getReferralFromUserSignedTransaction(accountNameReferrer, privateKey, accountNameSource, permission);
        return SocialApi.signedTransactionToString(signed);
    }
    /**
     *
     * @param {string} accountNameFrom
     * @param {string} privateKey
     * @param {string} accountNameTo
     * @returns {Promise<string>}
     */
    static async getTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo) {
        const signed = await SocialApi.getTrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo);
        return SocialApi.signedTransactionToString(signed);
    }
    static async getUnTrustUserSignedTransactionsAsJson(accountNameFrom, privateKey, accountNameTo) {
        const signed = await SocialApi.getUntrustUserSignedTransaction(accountNameFrom, privateKey, accountNameTo);
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
