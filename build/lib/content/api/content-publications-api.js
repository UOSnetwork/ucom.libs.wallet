"use strict";
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
        const content = Object.assign({}, givenContent, this.getDateTimeFields(true, true));
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, accountNameFrom);
    }
    static async signCreateDirectPostForAccount(accountNameFrom, privateKey, accountNameTo, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createDirectPostForAccount();
        const entityNameFor = EntityNames.USERS;
        const extraMetadata = {
            account_to: accountNameTo,
        };
        const content = Object.assign({}, givenContent, this.getDateTimeFields(true, true));
        return this.signSendDirectPostToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, accountNameTo, extraMetadata);
    }
    static async signCreateDirectPostForOrganization(accountNameFrom, organizationBlockchainIdTo, privateKey, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createDirectPostForOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetadata = {
            organization_id_to: organizationBlockchainIdTo,
        };
        const content = Object.assign({}, givenContent, this.getDateTimeFields(true, true));
        return this.signSendDirectPostToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, organizationBlockchainIdTo, extraMetadata);
    }
    static async signUpdatePublicationFromUser(accountNameFrom, privateKey, givenContent, blockchainId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateMediaPostFromAccount();
        const entityNameFor = EntityNames.USERS;
        const content = Object.assign({}, givenContent, { updated_at: moment().utc().format() });
        const { signed_transaction } = await this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, accountNameFrom, {}, blockchainId);
        return signed_transaction;
    }
    static async signUpdateDirectPostForAccount(accountNameFrom, privateKey, accountNameTo, givenContent, blockchainId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateDirectPostForAccount();
        const entityNameFor = EntityNames.USERS;
        const content = Object.assign({}, givenContent, { updated_at: moment().utc().format() });
        const extraMetadata = {
            account_to: accountNameTo,
        };
        const { signed_transaction } = await this.signSendDirectPostToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, accountNameTo, extraMetadata, blockchainId);
        return signed_transaction;
    }
    static async signUpdateDirectPostForOrganization(accountNameFrom, privateKey, organizationBlockchainIdTo, givenContent, blockchainId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateDirectPostForOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const content = Object.assign({}, givenContent, { updated_at: moment().utc().format() });
        const extraMetadata = {
            organization_id_to: organizationBlockchainIdTo,
        };
        const { signed_transaction } = await this.signSendDirectPostToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, organizationBlockchainIdTo, extraMetadata, blockchainId);
        return signed_transaction;
    }
    static async signCreatePublicationFromOrganization(accountNameFrom, privateKey, orgBlockchainId, givenContent, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetaData = {
            organization_id_from: orgBlockchainId,
        };
        const content = Object.assign({}, givenContent, this.getDateTimeFields(true, true), { organization_blockchain_id: orgBlockchainId });
        return this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, orgBlockchainId, extraMetaData);
    }
    static async signUpdatePublicationFromOrganization(accountNameFrom, privateKey, orgBlockchainId, givenContent, blockchainId, permission = PermissionsDictionary.active()) {
        const interactionName = InteractionsDictionary.updateMediaPostFromOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetaData = {
            organization_id_from: orgBlockchainId,
        };
        const content = Object.assign({}, givenContent, { organization_blockchain_id: orgBlockchainId, updated_at: moment().utc().format() });
        const { signed_transaction } = await this.signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, content, interactionName, entityNameFor, orgBlockchainId, extraMetaData, blockchainId);
        return signed_transaction;
    }
    static async signResendPublicationFromUser(authorAccountName, historicalSenderPrivateKey, givenContent, blockchainId) {
        const interactionName = InteractionsDictionary.createMediaPostFromAccount();
        const entityNameFor = EntityNames.USERS;
        return this.signResendPublicationToBlockchain(authorAccountName, historicalSenderPrivateKey, givenContent, interactionName, entityNameFor, authorAccountName, {}, blockchainId);
    }
    static async signResendDirectPostsToAccount(authorAccountName, historicalSenderPrivateKey, accountNameTo, givenContent, blockchainId) {
        const interactionName = InteractionsDictionary.createDirectPostForAccount();
        const entityNameFor = EntityNames.USERS;
        const extraMetadata = {
            account_to: accountNameTo,
        };
        return this.signResendPublicationToBlockchain(authorAccountName, historicalSenderPrivateKey, givenContent, interactionName, entityNameFor, accountNameTo, extraMetadata, blockchainId);
    }
    static async signResendDirectPostsToOrganization(authorAccountName, historicalSenderPrivateKey, organizationBlockchainId, givenContent, blockchainId) {
        const interactionName = InteractionsDictionary.createDirectPostForOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetadata = {
            organization_id_to: organizationBlockchainId,
        };
        return this.signResendPublicationToBlockchain(authorAccountName, historicalSenderPrivateKey, givenContent, interactionName, entityNameFor, organizationBlockchainId, extraMetadata, blockchainId);
    }
    static async signResendPublicationFromOrganization(authorAccountName, historicalSenderPrivateKey, orgBlockchainId, givenContent, blockchainId) {
        const interactionName = InteractionsDictionary.createMediaPostFromOrganization();
        const entityNameFor = EntityNames.ORGANIZATIONS;
        const extraMetaData = {
            organization_id_from: orgBlockchainId,
        };
        const content = Object.assign({}, givenContent, { organization_blockchain_id: orgBlockchainId });
        return this.signResendPublicationToBlockchain(authorAccountName, historicalSenderPrivateKey, content, interactionName, entityNameFor, orgBlockchainId, extraMetaData, blockchainId);
    }
    static async signSendPublicationToBlockchain(accountNameFrom, privateKey, permission, givenContent, interactionName, entityNameFor, entityBlockchainIdFor, extraMetaData = {}, givenContentId = null) {
        const contentId = givenContentId || ContentIdGenerator.getForMediaPost();
        const content = this.getContentWithExtraFields(givenContent, contentId, entityNameFor, entityBlockchainIdFor, accountNameFrom);
        const { error } = PostFieldsValidator.validatePublicationFromEntity(content, entityNameFor);
        if (error !== null) {
            throw new TypeError(JSON.stringify(error));
        }
        const metaData = this.getMetadata(accountNameFrom, contentId, extraMetaData);
        const signed_transaction = await SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, metaData, content, permission);
        return {
            signed_transaction,
            blockchain_id: metaData.content_id,
        };
    }
    static async signSendDirectPostToBlockchain(accountNameFrom, privateKey, permission, givenContent, interactionName, entityNameFor, entityBlockchainIdFor, extraMetaData = {}, givenContentId = null) {
        const contentId = givenContentId || ContentIdGenerator.getForDirectPost();
        const content = this.getContentWithExtraFields(givenContent, contentId, entityNameFor, entityBlockchainIdFor, accountNameFrom);
        // #task - add validator like for publication (media post)
        const metaData = this.getMetadata(accountNameFrom, contentId, extraMetaData);
        const signed_transaction = await SocialTransactionsCommonFactory.getSignedTransaction(accountNameFrom, privateKey, interactionName, metaData, content, permission);
        return {
            signed_transaction,
            blockchain_id: metaData.content_id,
        };
    }
    static async signResendPublicationToBlockchain(contentAuthorAccountName, privateKey, givenContent, interactionName, entityNameFor, entityBlockchainIdFor, extraMetaData = {}, contentId) {
        const content = this.getContentWithExtraFields(givenContent, contentId, entityNameFor, entityBlockchainIdFor, contentAuthorAccountName);
        if (!content.created_at) {
            throw new TypeError('created_at must exist inside a content');
        }
        if (!content.created_at.includes('Z')) {
            throw new TypeError('created_at be an UTC string');
        }
        const momentDate = moment(content.created_at);
        if (!momentDate.isValid()) {
            throw new TypeError(`Provided created_at value is not a valid datetime string: ${content.created_at}`);
        }
        const metaData = this.getMetadata(contentAuthorAccountName, contentId, extraMetaData);
        return SocialTransactionsCommonFactory.getSignedResendTransaction(privateKey, interactionName, metaData, content, content.created_at);
    }
    static getContentWithExtraFields(givenContent, contentId, entityNameFor, entityBlockchainIdFor, authorAccountName) {
        const data = {
            blockchain_id: contentId,
            entity_name_for: entityNameFor,
            entity_blockchain_id_for: entityBlockchainIdFor,
            author_account_name: authorAccountName,
        };
        return Object.assign({}, givenContent, data);
    }
    static getDateTimeFields(createdAt, updatedAt) {
        const data = {};
        if (createdAt) {
            data.created_at = moment().utc().format();
        }
        if (updatedAt) {
            data.updated_at = moment().utc().format();
        }
        return data;
    }
    static getMetadata(accountNameFrom, contentId, extraMetaData) {
        return Object.assign({ account_from: accountNameFrom, content_id: contentId }, extraMetaData);
    }
}
module.exports = ContentPublicationsApi;
