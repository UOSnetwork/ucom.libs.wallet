"use strict";
const EosClient = require("../../common/client/eos-client");
const EosCryptoService = require("../../common/services/eos-crypto-service");
const BlockchainRegistry = require("../../blockchain-registry");
const PermissionsDictionary = require("../../dictionary/permissions-dictionary");
const SocialKeyService = require("../services/social-key-service");
const SmartContractsDictionary = require("../../dictionary/smart-contracts-dictionary");
const SmartContractsActionsDictionary = require("../../dictionary/smart-contracts-actions-dictionary");
class SocialKeyApi {
    static generateSocialKeyFromActivePrivateKey(activePrivateKey) {
        return EosCryptoService.getKeyPartsFromParentPrivateKey(activePrivateKey);
    }
    static async getAccountCurrentSocialKey(accountName) {
        const state = await BlockchainRegistry.getRawAccountData(accountName);
        for (const permission of state.permissions) {
            if (!permission.perm_name) {
                throw new TypeError(`Malformed permission: ${permission}`);
            }
            if (permission.perm_name !== PermissionsDictionary.social()) {
                continue;
            }
            if (!permission.required_auth
                || !permission.required_auth.keys
                || permission.required_auth.keys.length !== 1
                || !permission.required_auth.keys[0]
                || !permission.required_auth.keys[0].key) {
                throw new TypeError(`Malformed permission: ${permission}`);
            }
            return permission.required_auth.keys[0].key;
        }
        return null;
    }
    static async bindSocialKeyWithSocialPermissions(accountName, activePrivateKey, socialPublicKey) {
        // #task - simplified check - check only first action of transaction - social key binding
        await this.socialKeyNotExistOrError(accountName);
        const actions = [
            SocialKeyService.bindSocialKeyAction(accountName, socialPublicKey),
            SocialKeyService.addSocialKeyPermissionAction(accountName),
        ];
        return EosClient.sendTransaction(activePrivateKey, actions);
    }
    static async pushSocialPermissionForProducersVoting(accountFrom, activePrivateKey) {
        await this.socialKeyExistOrError(accountFrom);
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.voteProducer();
        const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
        return EosClient.sendSingleActionTransaction(activePrivateKey, action);
    }
    static async pushSocialPermissionForProfileUpdating(accountFrom, activePrivateKey) {
        await this.socialKeyExistOrError(accountFrom);
        const smartContract = SmartContractsDictionary.uosAccountInfo();
        const actionName = SmartContractsActionsDictionary.setProfile();
        const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
        return EosClient.sendSingleActionTransaction(activePrivateKey, action);
    }
    static async pushSocialPermissionForEmissionClaim(accountFrom, activePrivateKey) {
        await this.socialKeyExistOrError(accountFrom);
        const smartContract = SmartContractsDictionary.uosCalcs();
        const actionName = SmartContractsActionsDictionary.withdrawal();
        const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
        return EosClient.sendSingleActionTransaction(activePrivateKey, action);
    }
    static async pushSocialPermissionForCalculatorsVoting(accountFrom, activePrivateKey) {
        await this.socialKeyExistOrError(accountFrom);
        const smartContract = SmartContractsDictionary.eosIo();
        const actionName = SmartContractsActionsDictionary.voteForCalculators();
        const action = SocialKeyService.getSocialPermissionsForAction(accountFrom, smartContract, actionName);
        return EosClient.sendSingleActionTransaction(activePrivateKey, action);
    }
    static async socialKeyNotExistOrError(accountName) {
        const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);
        if (currentSocialKey) {
            throw new TypeError(`A social key already exist: ${currentSocialKey}`);
        }
    }
    static async socialKeyExistOrError(accountName) {
        const currentSocialKey = await this.getAccountCurrentSocialKey(accountName);
        if (!currentSocialKey) {
            throw new TypeError('A social key must exist before social permission binding');
        }
    }
}
module.exports = SocialKeyApi;