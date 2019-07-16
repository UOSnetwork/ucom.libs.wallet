"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const lodash_1 = __importDefault(require("lodash"));
const uniqid_1 = __importDefault(require("uniqid"));
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
class ContentPublicationsApi {
    static async signSendPublicationToBlockchainFromUser(accountNameFrom, privateKey, content, permission = PermissionsDictionary.active()) {
        if (lodash_1.default.isEmpty(content)) {
            throw new TypeError('Content is empty');
        }
        const uniqIdPrefix = 'pstms'; // TODO - move to the dictionary
        const metaData = {
            account_from: accountNameFrom,
            content_id: uniqid_1.default(`${uniqIdPrefix}-`),
        };
        // TODO - to the dictionary
        const interactionName = 'create_media_post_from_account';
        const signed = await SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, metaData, content, permission);
        return {
            signed,
            contentId: metaData.content_id,
        };
    }
    // TODO - refactoring. Almost the same as publication from User
    static async signSendPublicationToBlockchainFromOrganization(accountNameFrom, privateKey, orgBlockchainId, content, permission = PermissionsDictionary.active()) {
        if (lodash_1.default.isEmpty(content)) {
            throw new TypeError('Content is empty');
        }
        const uniqIdPrefix = 'pstms'; // TODO - move to the dictionary
        const metaData = {
            account_from: accountNameFrom,
            content_id: uniqid_1.default(`${uniqIdPrefix}-`),
            organization_id_from: orgBlockchainId,
        };
        // TODO - to the dictionary
        const interactionName = 'create_media_post_from_organization';
        const signed = await SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, metaData, content, permission);
        return {
            signed,
            contentId: metaData.content_id,
        };
    }
}
module.exports = ContentPublicationsApi;
