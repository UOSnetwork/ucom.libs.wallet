"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const lodash_1 = __importDefault(require("lodash"));
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialTransactionsCommonFactory = require("../../social-transactions/services/social-transactions-common-factory");
const moment = require("moment");
const ContentIdGenerator = require("../service/content-id-generator");
const InteractionsDictionary = require("../../dictionary/interactions-dictionary");
const { PostFieldsValidator } = require('ucom.libs.common').Posts.Validator;
const { EntityNames } = require('ucom.libs.common').Common.Dictionary;
class ContentPublicationsApi {
    static async signCreatePublicationFromUser(accountNameFrom, privateKey, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createMediaPostFromAccount();
        const entityNameFor = EntityNames.USERS;
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, givenContent, interactionName, entityNameFor, accountNameFrom);
    }
    static async signUpdatePublicationFromUser(accountNameFrom, privateKey, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateMediaPostFromAccount();
        const entityNameFor = EntityNames.USERS;
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, givenContent, interactionName, entityNameFor, accountNameFrom);
    }
    static async signCreatePublicationFromOrganization(accountNameFrom, privateKey, orgBlockchainId, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetaData = {
            organization_id_from: orgBlockchainId,
        };
        const content = Object.assign({}, givenContent, { organization_blockchain_id: orgBlockchainId });
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, orgBlockchainId, extraMetaData);
    }
    static async signUpdatePublicationFromOrganization(accountNameFrom, privateKey, orgBlockchainId, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetaData = {
            organization_id_from: orgBlockchainId,
        };
        const content = Object.assign({}, givenContent, { organization_blockchain_id: orgBlockchainId });
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, orgBlockchainId, extraMetaData);
    }
    static async signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, givenContent, interactionName, entityNameFor, entityBlockchainIdFor, extraMetaData = {}) {
        if (lodash_1.default.isEmpty(givenContent)) {
            throw new TypeError('Content is empty');
        }
        const contentId = ContentIdGenerator.getForMediaPost();
        const content = Object.assign({}, givenContent, this.getExtraFields(contentId, entityNameFor, entityBlockchainIdFor, accountNameFrom));
        const { error } = PostFieldsValidator.validatePublicationFromEntity(content, entityNameFor);
        if (error !== null) {
            throw new TypeError(JSON.stringify(error));
        }
        const metaData = Object.assign({ account_from: accountNameFrom, content_id: contentId }, extraMetaData);
        const signed = await SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, metaData, content, permission);
        return {
            signed,
            contentId: metaData.content_id,
        };
    }
    static getExtraFields(contentId, entityNameFor, entityBlockchainIdFor, authorAccountName) {
        const dateTime = moment().utc().format();
        return {
            blockchain_id: contentId,
            entity_name_for: entityNameFor,
            entity_blockchain_id_for: entityBlockchainIdFor,
            author_account_name: authorAccountName,
            created_at: dateTime,
            updated_at: dateTime,
        };
    }
}
module.exports = ContentPublicationsApi;
